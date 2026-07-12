const { User, Ticket, Comment } = require('../models');
const { Op } = require('sequelize');

// Get all team members for the manager
const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.findAll({
      where: {
        role: { [Op.in]: ['agent', 'user'] },
        isActive: true
      },
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });

    res.json({ teamMembers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team performance metrics
const getTeamPerformance = async (req, res) => {
  try {
    const teamMembers = await User.findAll({
      where: { role: { [Op.in]: ['agent', 'user'] } },
      attributes: ['id', 'name', 'email']
    });

    const performanceData = await Promise.all(
      teamMembers.map(async (member) => {
        const assignedTickets = await Ticket.count({
          where: { assignedToId: member.id }
        });

        const resolvedTickets = await Ticket.count({
          where: {
            assignedToId: member.id,
            status: 'resolved'
          }
        });

        const activeTickets = await Ticket.count({
          where: {
            assignedToId: member.id,
            status: { [Op.in]: ['open', 'in_progress'] }
          }
        });

        // Average resolution time
        const resolvedTicketsWithTime = await Ticket.findAll({
          where: {
            assignedToId: member.id,
            status: 'resolved',
            resolvedAt: { [Op.ne]: null }
          },
          attributes: ['createdAt', 'resolvedAt'],
          limit: 10
        });

        let avgResolutionHours = 0;
        if (resolvedTicketsWithTime.length > 0) {
          const totalHours = resolvedTicketsWithTime.reduce((sum, ticket) => {
            const hours = (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60);
            return sum + hours;
          }, 0);
          avgResolutionHours = (totalHours / resolvedTicketsWithTime.length).toFixed(2);
        }

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          assignedTickets,
          resolvedTickets,
          activeTickets,
          resolutionRate: assignedTickets > 0 ? ((resolvedTickets / assignedTickets) * 100).toFixed(2) : 0,
          avgResolutionHours
        };
      })
    );

    res.json({ performanceData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team report by priority
const getTeamReportByPriority = async (req, res) => {
  try {
    const teamMembers = await User.findAll({
      where: { role: { [Op.in]: ['agent', 'user'] } },
      attributes: ['id']
    });

    const memberIds = teamMembers.map(m => m.id);

    const tickets = await Ticket.findAll({
      where: {
        assignedToId: { [Op.in]: memberIds }
      },
      attributes: [
        'priority',
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.col('id')), 'count'],
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.literal('CASE WHEN status = "resolved" THEN 1 END')), 'resolved']
      ],
      group: ['priority'],
      raw: true
    });

    res.json({ priorityReport: tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team report by status
const getTeamReportByStatus = async (req, res) => {
  try {
    const teamMembers = await User.findAll({
      where: { role: { [Op.in]: ['agent', 'user'] } },
      attributes: ['id']
    });

    const memberIds = teamMembers.map(m => m.id);

    const tickets = await Ticket.findAll({
      where: {
        assignedToId: { [Op.in]: memberIds }
      },
      attributes: [
        'status',
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json({ statusReport: tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get agent workload
const getAgentWorkload = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: 'agent' },
      attributes: ['id', 'name']
    });

    const workload = await Promise.all(
      agents.map(async (agent) => {
        const openTickets = await Ticket.count({
          where: {
            assignedToId: agent.id,
            status: { [Op.in]: ['open', 'in_progress'] }
          }
        });

        return {
          agentId: agent.id,
          agentName: agent.name,
          openTickets
        };
      })
    );

    res.json({ workload: workload.sort((a, b) => b.openTickets - a.openTickets) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team summary
const getTeamSummary = async (req, res) => {
  try {
    const teamMembers = await User.findAll({
      where: { role: { [Op.in]: ['agent', 'user'] } },
      attributes: ['id']
    });

    const memberIds = teamMembers.map(m => m.id);

    const totalTeamTickets = await Ticket.count({
      where: { assignedToId: { [Op.in]: memberIds } }
    });

    const resolvedTickets = await Ticket.count({
      where: {
        assignedToId: { [Op.in]: memberIds },
        status: 'resolved'
      }
    });

    const openTickets = await Ticket.count({
      where: {
        assignedToId: { [Op.in]: memberIds },
        status: 'open'
      }
    });

    const inProgressTickets = await Ticket.count({
      where: {
        assignedToId: { [Op.in]: memberIds },
        status: 'in_progress'
      }
    });

    const urgentTickets = await Ticket.count({
      where: {
        assignedToId: { [Op.in]: memberIds },
        priority: 'urgent',
        status: { [Op.in]: ['open', 'in_progress'] }
      }
    });

    res.json({
      summary: {
        totalMembers: teamMembers.length,
        totalTickets: totalTeamTickets,
        resolved: resolvedTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        urgent: urgentTickets,
        resolutionRate: totalTeamTickets > 0 ? ((resolvedTickets / totalTeamTickets) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeamMembers,
  getTeamPerformance,
  getTeamReportByPriority,
  getTeamReportByStatus,
  getAgentWorkload,
  getTeamSummary
};
