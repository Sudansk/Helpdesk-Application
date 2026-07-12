const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, updateUser, getAgents } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and ONLY admin role (strict separation)
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.get('/agents', getAgents);

module.exports = router;

