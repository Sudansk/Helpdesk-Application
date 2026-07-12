const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/superadminController');
const { authenticate, authorize } = require('../middleware/auth');

// All superadmin routes require authentication and superadmin role
router.use(authenticate);
router.use(authorize('superadmin'));

// USER MANAGEMENT
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// SLA MANAGEMENT
router.get('/slas', getAllSLAs);
router.post('/slas', createSLA);
router.put('/slas/:id', updateSLA);
router.delete('/slas/:id', deleteSLA);

// SYSTEM ANALYTICS
router.get('/stats', getSystemStats);
router.get('/health', getSystemHealth);

module.exports = router;
