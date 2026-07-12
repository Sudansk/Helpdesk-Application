const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html, text = '') => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured. Would send email to:', to);
      console.log('Subject:', subject);
      return { success: false, message: 'Email not configured' };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

const sendTicketCreatedEmail = async (ticket, user) => {
  const subject = `Ticket Created: ${ticket.title}`;
  const html = `
    <h2>Your ticket has been created</h2>
    <p>Hello ${user.name},</p>
    <p>Your ticket <strong>#${ticket.id}</strong> has been created successfully.</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <p><strong>Status:</strong> ${ticket.status}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>
    <p>We will review your ticket and get back to you soon.</p>
  `;
  return await sendEmail(user.email, subject, html);
};

const sendTicketUpdatedEmail = async (ticket, user, updates) => {
  const subject = `Ticket Updated: ${ticket.title}`;
  const html = `
    <h2>Your ticket has been updated</h2>
    <p>Hello ${user.name},</p>
    <p>Your ticket <strong>#${ticket.id}</strong> has been updated.</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <p><strong>Status:</strong> ${ticket.status}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>
    ${updates ? `<p><strong>Updates:</strong> ${updates}</p>` : ''}
  `;
  return await sendEmail(user.email, subject, html);
};

const sendTicketAssignedEmail = async (ticket, agent) => {
  const subject = `New Ticket Assigned: ${ticket.title}`;
  const html = `
    <h2>New ticket assigned to you</h2>
    <p>Hello ${agent.name},</p>
    <p>You have been assigned to ticket <strong>#${ticket.id}</strong>.</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>
    <p>Please review and respond as soon as possible.</p>
  `;
  return await sendEmail(agent.email, subject, html);
};

module.exports = {
  sendEmail,
  sendTicketCreatedEmail,
  sendTicketUpdatedEmail,
  sendTicketAssignedEmail
};

