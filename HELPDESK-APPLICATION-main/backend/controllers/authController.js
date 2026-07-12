const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Only allow superadmin to create superadmin, admin to create admin/agent, manager/agent to register as user
    if (role && role !== 'user') {
      if (!req.user) {
        return res.status(403).json({ message: 'Authentication required to create privileged users' });
      }
      // Only superadmin can create superadmin
      if (role === 'superadmin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only superadmins can create superadmin users' });
      }
      // Only superadmin and admin can create other roles
      if (['admin', 'manager', 'agent'].includes(role)) {
        if (req.user.role === 'superadmin') {
          // SuperAdmin can create any role
          // allowed
        } else if (req.user.role === 'admin' && ['manager', 'agent'].includes(role)) {
          // Admin can only create agent and manager, not admin
          // allowed
        } else {
          return res.status(403).json({ message: 'Insufficient permissions to create this user role' });
        }
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };

