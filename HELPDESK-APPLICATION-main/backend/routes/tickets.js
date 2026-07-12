const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  updateTicketStatus,
  addComment
} = require('../controllers/ticketController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Attachment, Ticket, User } = require('../models');
const path = require('path');

// All routes require authentication
router.use(authenticate);

router.get('/', getAllTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.post('/:id/assign', assignTicket);
router.post('/:id/status', updateTicketStatus);
router.post('/:id/comments', addComment);

// File upload route
router.post('/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attachment = await Attachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      ticketId: ticket.id,
      uploadedById: req.user.id
    });

    const attachmentWithUser = await Attachment.findByPk(attachment.id, {
      include: [{ model: User, as: 'uploadedBy', attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment: attachmentWithUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

