const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authenticate } = require('../middleware/auth');

// Get all notifications for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread notification count
router.get('/count/unread', authenticate, async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await notification.update({ isRead: true });
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.patch('/read/all', authenticate, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
