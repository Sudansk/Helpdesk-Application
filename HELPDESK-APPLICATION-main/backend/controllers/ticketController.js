const { Ticket, User, Comment, Attachment, SLA, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendTicketCreatedEmail, sendTicketUpdatedEmail, sendTicketAssignedEmail } = require('../utils/email');
const { runSLACheck } = require('../utils/slaEscalation');

const getAllTickets = async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    
    // Role-based filtering
    if (req.user.role === 'user') {
      where.userId = req.user.id;
    } else if (req.user.role === 'agent') {
      where[Op.or] = [
        { assignedToId: req.user.id },
        { assignedToId: null }
      ];
    }
    // Admin can see all tickets

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;

    const tickets = await Ticket.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: SLA, as: 'sla' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      tickets: tickets.rows,
      total: tickets.count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: SLA, as: 'sla' },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
          order: [['createdAt', 'ASC']]
        },
        {
          model: Attachment,
          as: 'attachments',
          include: [{ model: User, as: 'uploadedBy', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;

    // Find appropriate SLA based on priority
    const sla = await SLA.findOne({
      where: { priority: priority || 'medium', isActive: true }
    });

    // Calculate due date based on SLA
    let dueDate = null;
    if (sla) {
      dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + sla.resolutionTimeHours);
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'medium',
      category,
      userId: req.user.id,
      slaId: sla ? sla.id : null,
      dueDate
    });

    const ticketWithRelations = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: SLA, as: 'sla' }
      ]
    });

    // Send email notification
    await sendTicketCreatedEmail(ticketWithRelations, req.user);

    // Create in-app notification for the user who created the ticket
    await Notification.create({
      userId: req.user.id,
      ticketId: ticket.id,
      title: 'Ticket Created Successfully',
      message: `Your ticket "${title}" has been created successfully. Ticket ID: #${ticket.id}`,
      type: 'ticket_created'
    });

    // Create notification for all admins about new ticket
    const admins = await User.findAll({
      where: { role: 'admin' }
    });

    for (const admin of admins) {
      await Notification.create({
        userId: admin.id,
        ticketId: ticket.id,
        title: 'New Ticket Created',
        message: `User ${req.user.name} created a new ticket: "${title}"`,
        type: 'new_ticket'
      });
    }

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: ticketWithRelations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, status, priority, category } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status && ['admin', 'agent'].includes(req.user.role)) updates.status = status;
    if (priority && ['admin', 'agent'].includes(req.user.role)) updates.priority = priority;
    if (category) updates.category = category;

    // Update resolvedAt if status is resolved
    if (status === 'resolved' && ticket.status !== 'resolved') {
      updates.resolvedAt = new Date();
    }

    await ticket.update(updates);

    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    // Send email notification
    const creator = await User.findByPk(ticket.userId);
    await sendTicketUpdatedEmail(updatedTicket, creator, `Status: ${status || ticket.status}`);

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (!['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Verify agent exists and is an agent
    const agent = await User.findOne({
      where: { id: agentId, role: 'agent' }
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await ticket.update({ assignedToId: agentId, status: 'in_progress' });

    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    // Send email notification
    await sendTicketAssignedEmail(updatedTicket, agent);

    // Create in-app notification for the agent
    await Notification.create({
      userId: agentId,
      ticketId: ticket.id,
      title: 'Ticket Assigned to You',
      message: `You have been assigned to ticket #${ticket.id}: "${ticket.title}"`,
      type: 'ticket_assigned'
    });

    res.json({
      message: 'Ticket assigned successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && ticket.userId !== req.user.id && status !== 'closed') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = { status };

    if (status === 'resolved' && ticket.status !== 'resolved') {
      updates.resolvedAt = new Date();
    }

    await ticket.update(updates);

    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    // Send email notification
    const creator = await User.findByPk(ticket.userId);
    await sendTicketUpdatedEmail(updatedTicket, creator, `Status changed to ${status}`);

    // Create in-app notification if ticket is resolved
    if (status === 'resolved' && ticket.status !== 'resolved') {
      await Notification.create({
        userId: ticket.userId,
        ticketId: ticket.id,
        title: 'Ticket Resolved',
        message: `Your ticket #${ticket.id} "${ticket.title}" has been resolved.`,
        type: 'ticket_resolved'
      });
    }

    // Run SLA check
    await runSLACheck();

    res.json({
      message: 'Ticket status updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { content, isInternal } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = await Comment.create({
      content,
      ticketId: ticket.id,
      userId: req.user.id,
      isInternal: isInternal && ['admin', 'agent'].includes(req.user.role)
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: commentWithAuthor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  updateTicketStatus,
  addComment
};

