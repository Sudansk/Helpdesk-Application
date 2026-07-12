# Helpdesk Application - Startup Guide

## Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MySQL** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/)
3. **npm** or **yarn** package manager

## Installation Steps

### 1. Install Dependencies

From the project root directory, run:

```bash
npm run install-all
```

This will install dependencies for both backend and frontend.

### 2. Database Setup

1. Start your MySQL server
2. Create a new database:

```sql
CREATE DATABASE helpdesk_db;
```

3. Note your MySQL credentials (username, password, host, port)

### 3. Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=helpdesk_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Optional - for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@helpdesk.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

**Note:** Email configuration is optional. If not configured, the system will log email actions to console instead of sending actual emails.

### 4. Start the Application

#### Option A: Run Both Backend and Frontend Together

```bash
npm run dev
```

#### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## Default Login Credentials

The system automatically creates default users on first run:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@helpdesk.com | admin123 |
| Agent | agent@helpdesk.com | agent123 |
| User | user@helpdesk.com | user123 |

## Features Overview

### User Roles

1. **Admin**
   - Full system access
   - User management
   - Admin dashboard with metrics
   - Ticket assignment
   - All ticket operations

2. **Agent**
   - View assigned tickets
   - View unassigned tickets
   - Update ticket status
   - Add comments
   - Upload attachments

3. **User**
   - Create tickets
   - View own tickets
   - Add comments to own tickets
   - Upload attachments to own tickets
   - Close own tickets

### Key Features

- ✅ JWT Authentication
- ✅ Ticket Management (CRUD)
- ✅ Ticket Assignment
- ✅ Status Tracking
- ✅ SLA Escalation Management
- ✅ Email Notifications
- ✅ File Upload Support
- ✅ Admin Dashboard with Metrics
- ✅ Role-Based Access Control
- ✅ Comments System
- ✅ Priority Management

## Troubleshooting

### Database Connection Error

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `helpdesk_db` exists
- Check MySQL user has proper permissions

### Port Already in Use

- Change `PORT` in `.env` for backend
- Change port in `frontend/package.json` scripts for frontend

### Email Not Sending

- Email is optional - system works without it
- If configured, verify email credentials
- For Gmail, use App Password instead of regular password
- Check firewall/network settings

### File Upload Issues

- Ensure `uploads/` directory exists (created automatically)
- Check file size limits in `.env`
- Verify file permissions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/assign` - Assign ticket
- `POST /api/tickets/:id/status` - Update status
- `POST /api/tickets/:id/comments` - Add comment
- `POST /api/tickets/:id/attachments` - Upload file

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/agents` - Get all agents

## Project Structure

```
helpdesk-application/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, upload middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (email, SLA, etc.)
│   └── server.js        # Main server file
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── pages/        # Page components
│       ├── services/    # API service
│       ├── context/     # React context
│       └── utils/       # Helper functions
├── uploads/             # File uploads directory
└── package.json         # Root package.json
```

## Development Notes

- Database models are automatically synchronized on server start
- Default users and SLAs are created on first run
- SLA escalation runs automatically when ticket status is updated
- File uploads are stored in `uploads/` directory
- JWT tokens expire after 7 days (configurable)

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper email service
4. Set up proper database backups
5. Configure reverse proxy (nginx)
6. Use HTTPS
7. Set up proper file storage (S3, etc.)
8. Configure CORS properly
9. Set up monitoring and logging

