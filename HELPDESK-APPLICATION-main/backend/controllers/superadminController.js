const { User, Ticket, SLA } = require('../models');
const { Op } = require('sequelize');

// SYSTEM CONFIGURATION ENDPOINTS

// Get all users (with role filtering)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = role ? { role } : {};

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user (SuperAdmin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (change role, activate/deactivate)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (soft delete by deactivation)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MASTER DATA MANAGEMENT

// Get all SLAs
const getAllSLAs = async (req, res) => {
  try {
    const slas = await SLA.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ slas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create SLA
const createSLA = async (req, res) => {
  try {
    const { name, responseTimeHours, resolutionTimeHours, priority } = req.body;

    if (!name || !responseTimeHours || !resolutionTimeHours) {
      return res.status(400).json({ message: 'Name, responseTimeHours, and resolutionTimeHours are required' });
    }

    const sla = await SLA.create({
      name,
      responseTimeHours,
      resolutionTimeHours,
      priority: priority || 'medium'
    });

    res.status(201).json({
      message: 'SLA created successfully',
      sla
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update SLA
const updateSLA = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, responseTimeHours, resolutionTimeHours, priority } = req.body;

    const sla = await SLA.findByPk(id);
    if (!sla) {
      return res.status(404).json({ message: 'SLA not found' });
    }

    if (name) sla.name = name;
    if (responseTimeHours) sla.responseTimeHours = responseTimeHours;
    if (resolutionTimeHours) sla.resolutionTimeHours = resolutionTimeHours;
    if (priority) sla.priority = priority;

    await sla.save();

    res.json({
      message: 'SLA updated successfully',
      sla
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete SLA
const deleteSLA = async (req, res) => {
  try {
    const { id } = req.params;

    const sla = await SLA.findByPk(id);
    if (!sla) {
      return res.status(404).json({ message: 'SLA not found' });
    }

    await sla.destroy();

    res.json({ message: 'SLA deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SYSTEM ANALYTICS & AUDITING

// Get overall system statistics
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });

    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    const totalTickets = await Ticket.count();
    const ticketsByStatus = await Ticket.findAll({
      attributes: [
        'status',
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: usersByRole
      },
      tickets: {
        total: totalTickets,
        byStatus: ticketsByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get system health check
const getSystemHealth = async (req, res) => {
  try {
    const unassignedTickets = await Ticket.count({
      where: { assignedToId: null, status: { [Op.in]: ['open', 'in_progress'] } }
    });

    const overdueTickets = await Ticket.count({
      where: {
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.in]: ['open', 'in_progress'] }
      }
    });

    const urgentTickets = await Ticket.count({
      where: {
        priority: 'urgent',
        status: { [Op.in]: ['open', 'in_progress'] }
      }
    });

    const inactiveAgents = await User.count({
      where: {
        role: 'agent',
        isActive: false
      }
    });

    res.json({
      health: {
        unassignedTickets,
        overdueTickets,
        urgentTickets,
        inactiveAgents,
        status: unassignedTickets > 10 || overdueTickets > 5 ? 'warning' : 'healthy'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllSLAs,
  createSLA,
  updateSLA,
  deleteSLA,
  getSystemStats,
  getSystemHealth
};
