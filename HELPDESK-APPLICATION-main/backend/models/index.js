const User = require('./User');
const Ticket = require('./Ticket');
const Comment = require('./Comment');
const Attachment = require('./Attachment');
const SLA = require('./SLA');
const Notification = require('./Notification');

// Define relationships
User.hasMany(Ticket, { foreignKey: 'userId', as: 'createdTickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

User.hasMany(Ticket, { foreignKey: 'assignedToId', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

Ticket.hasMany(Comment, { foreignKey: 'ticketId', as: 'comments' });
Comment.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Ticket.hasMany(Attachment, { foreignKey: 'ticketId', as: 'attachments' });
Attachment.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

User.hasMany(Attachment, { foreignKey: 'uploadedById', as: 'uploadedAttachments' });
Attachment.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });

SLA.hasMany(Ticket, { foreignKey: 'slaId', as: 'tickets' });
Ticket.belongsTo(SLA, { foreignKey: 'slaId', as: 'sla' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Ticket.hasMany(Notification, { foreignKey: 'ticketId', as: 'notifications' });
Notification.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

module.exports = {
  User,
  Ticket,
  Comment,
  Attachment,
  SLA,
  Notification
};

