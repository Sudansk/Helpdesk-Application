# Helpdesk Ticket Management System

A production-ready full-stack helpdesk ticket management system with role-based access control, SLA management, and email notifications.

## Features

- **User Authentication**: JWT-based authentication with three roles (Admin, Agent, User,superadmin,manager)
- **Ticket Management**: Create, assign, and track tickets with status updates
- **SLA Escalation**: Automatic escalation based on SLA rules
- ** Notifications**: Automated inapp notifications for ticket updates
- **File Upload**: Support for file attachments on tickets
- **Admin Dashboard**: Comprehensive metrics and analytics
- **Role-Based Access**: Different UI and permissions based on user role

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Email**: Nodemailer
- **File Upload**: Multer

## Setup Instructions

### Prerequisites

- Node.js 
- MySQL
- npm 

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and email settings.

4. Create MySQL database:
   ```sql
   CREATE DATABASE helpdesk_db;
   ```

5. Start the application:
   ```bash
   npm run dev
   ```

   Or start separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Users

The system will create default users on first run:
- **Admin**: admin@helpdesk.com / admin123
- **Agent**: agent@helpdesk.com / agent123
- **User**: user@helpdesk.com / user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - Get all tickets (filtered by role)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/assign` - Assign ticket to agent
- `POST /api/tickets/:id/status` - Update ticket status

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user

## Project Structure

```
helpdesk-application/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
└── package.json
```

