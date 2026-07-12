const { Ticket, SLA, User } = require('../models');
const { sendEmail } = require('./email');
const { Op } = require('sequelize');

const checkSLAViolations = async () => {
  try {
    const openTickets = await Ticket.findAll({
      where: {
        status: {
          [Op.in]: ['open', 'in_progress']
        }
      },
      include: [
        { model: SLA, as: 'sla' },
        { model: User, as: 'creator' }
      ]
    });

    const now = new Date();
    const violations = [];

    for (const ticket of openTickets) {
      if (!ticket.sla) continue;

      const createdAt = new Date(ticket.createdAt);
      const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

      // Check response time violation
      if (ticket.status === 'open' && hoursSinceCreation > ticket.sla.responseTimeHours) {
        violations.push({
          ticket,
          type: 'response_time',
          hoursOverdue: hoursSinceCreation - ticket.sla.responseTimeHours
        });
      }

      // Check resolution time violation
      if (hoursSinceCreation > ticket.sla.resolutionTimeHours) {
        violations.push({
          ticket,
          type: 'resolution_time',
          hoursOverdue: hoursSinceCreation - ticket.sla.resolutionTimeHours
        });
      }
    }

    return violations;
  } catch (error) {
    console.error('Error checking SLA violations:', error);
    return [];
  }
};

const escalateTicket = async (ticket, violationType) => {
  try {
    // Increase priority
    const priorityOrder = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorityOrder.indexOf(ticket.priority);
    if (currentIndex < priorityOrder.length - 1) {
      ticket.priority = priorityOrder[currentIndex + 1];
      await ticket.save();
    }

    // Notify admin
    const admins = await User.findAll({ where: { role: 'admin' } });
    
    for (const admin of admins) {
      const subject = `SLA Violation: Ticket #${ticket.id}`;
      const html = `
        <h2>SLA Violation Alert</h2>
        <p>Ticket #${ticket.id} has violated its SLA.</p>
        <p><strong>Violation Type:</strong> ${violationType}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p>Please take immediate action.</p>
      `;
      await sendEmail(admin.email, subject, html);
    }

    return true;
  } catch (error) {
    console.error('Error escalating ticket:', error);
    return false;
  }
};

// Run SLA check periodically (can be called from a cron job)
const runSLACheck = async () => {
  const violations = await checkSLAViolations();
  for (const violation of violations) {
    await escalateTicket(violation.ticket, violation.type);
  }
};

module.exports = {
  checkSLAViolations,
  escalateTicket,
  runSLACheck
};

