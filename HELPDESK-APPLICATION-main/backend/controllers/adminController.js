const { User, Ticket, Comment, Attachment, SLA } = require('../models');
const { Op } = require('sequelize');

const getStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({ where: { status: 'open' } });
    const inProgressTickets = await Ticket.count({ where: { status: 'in_progress' } });
    const resolvedTickets = await Ticket.count({ where: { status: 'resolved' } });
    const closedTickets = await Ticket.count({ where: { status: 'closed' } });

    const totalUsers = await User.count();
    const totalAgents = await User.count({ where: { role: 'agent' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });

    // Tickets by priority
    const ticketsByPriority = await Ticket.findAll({
      attributes: [
        'priority',
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    // Tickets by status
    const ticketsByStatus = await Ticket.findAll({
      attributes: [
        'status',
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Average resolution time
    const resolvedTicketsWithTime = await Ticket.findAll({
      where: {
        status: 'resolved',
        resolvedAt: { [Op.ne]: null }
      },
      attributes: ['createdAt', 'resolvedAt']
    });

    let avgResolutionHours = 0;
    if (resolvedTicketsWithTime.length > 0) {
      const totalHours = resolvedTicketsWithTime.reduce((sum, ticket) => {
        const hours = (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolutionHours = totalHours / resolvedTicketsWithTime.length;
    }

    // Recent tickets (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTickets = await Ticket.count({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    // Unassigned tickets
    const unassignedTickets = await Ticket.count({
      where: { assignedToId: null, status: { [Op.in]: ['open', 'in_progress'] } }
    });

    res.json({
      tickets: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        recent: recentTickets,
        unassigned: unassignedTickets
      },
      users: {
        total: totalUsers,
        agents: totalAgents,
        admins: totalAdmins
      },
      ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
        acc[item.priority] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      averageResolutionHours: Math.round(avgResolutionHours * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own role or deactivating self
    if (req.user.id === parseInt(req.params.id)) {
      if (role && role !== req.user.role) {
        return res.status(400).json({ message: 'Cannot change your own role' });
      }
      if (isActive === false) {
        return res.status(400).json({ message: 'Cannot deactivate your own account' });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    await user.update(updates);

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: 'agent', isActive: true },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });

    res.json({ agents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUser,
  getAgents
};

