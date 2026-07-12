# 🔧 Database Setup & Login Fix

## Problem
SuperAdmin and Manager logins are not working because the database has old data from before these roles were added.

## Solution

### Option 1: Quick Reset (Recommended)

#### Step 1: Stop the backend server
Press `CTRL + C` in the backend terminal

#### Step 2: Reset the database
```bash
cd backend
node resetDatabase.js
```

**Output should show:**
```
🔄 Starting database reset...
📦 Dropping existing tables...
✅ Tables dropped
📝 Creating tables...
✅ Tables created
👥 Creating default users...
  ✅ Created: superadmin@helpdesk.com (superadmin)
  ✅ Created: admin@helpdesk.com (admin)
  ✅ Created: manager@helpdesk.com (manager)
  ✅ Created: agent1@helpdesk.com (agent)
  ✅ Created: agent2@helpdesk.com (agent)
  ✅ Created: user@helpdesk.com (user)
⏱️  Creating default SLAs...
  ✅ Created SLA: Low Priority SLA
  ✅ Created SLA: Medium Priority SLA
  ✅ Created SLA: High Priority SLA
  ✅ Created SLA: Urgent Priority SLA

✨ Database reset completed successfully!

📋 Default login credentials:

SuperAdmin:  superadmin@helpdesk.com / superadmin123
Admin:       admin@helpdesk.com / admin123
Manager:     manager@helpdesk.com / manager123
Agent 1:     agent1@helpdesk.com / agent123
Agent 2:     agent2@helpdesk.com / agent123
User:        user@helpdesk.com / user123
```

#### Step 3: Start the backend server again
```bash
npm start
```

#### Step 4: Start the frontend
```bash
cd frontend
npm start
```

#### Step 5: Test logins
Use any of these credentials:
- **SuperAdmin:** `superadmin@helpdesk.com` / `superadmin123`
- **Manager:** `manager@helpdesk.com` / `manager123`
- **Admin:** `admin@helpdesk.com` / `admin123`

---

### Option 2: Manual Database Reset (If using MySQL)

#### Step 1: Drop the old database
```bash
# On Windows with MySQL installed
# Open MySQL Command Line or MySQL Workbench and run:
DROP DATABASE helpdesk_db;
```

#### Step 2: Delete database file (if using SQLite)
```bash
# Delete helpdesk.db or similar file if it exists
# Windows file explorer: Find and delete the database file
```

#### Step 3: Restart the backend
```bash
cd backend
npm start
```

This will:
- Create a fresh database
- Create all tables
- Automatically seed default users
- Automatically seed default SLAs

---

### Option 3: If database.js has a different configuration

Check your environment setup:

#### Create `.env` file in backend directory
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=helpdesk_db
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

#### Check database configuration
Edit `backend/config/database.js` and verify:
- Host: `localhost`
- Port: `3306` (MySQL)
- User: `root`
- Password: matches your MySQL setup

---

## Troubleshooting

### Error: "Access denied for user 'root'"
**Solution:** Update MySQL credentials in `backend/config/database.js`

### Error: "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"
**Solution:** 
1. Make sure MySQL service is running
2. Check if database exists
3. Run `node resetDatabase.js`

### Error: "Table doesn't exist"
**Solution:** Delete `helpdesk.db` file and restart

### Logins still not working
1. Clear browser cache (CTRL + SHIFT + DELETE)
2. Open browser DevTools (F12)
3. Go to Application → Cookies
4. Delete all cookies
5. Try login again

---

## After Reset - Verify Everything Works

### 1. SuperAdmin Login
```
Email: superadmin@helpdesk.com
Password: superadmin123
```
- Should see "SuperAdmin Control" in navbar
- Should access /superadmin dashboard

### 2. Manager Login
```
Email: manager@helpdesk.com
Password: manager123
```
- Should see "Manager Dashboard" in navbar
- Should access /manager dashboard

### 3. Admin Login
```
Email: admin@helpdesk.com
Password: admin123
```
- Should see "Admin Dashboard" in navbar
- Should access /admin dashboard

### 4. Agent Login
```
Email: agent1@helpdesk.com
Password: agent123
```
- Should see "Tickets" in navbar
- Should access /tickets page

### 5. User Login
```
Email: user@helpdesk.com
Password: user123
```
- Should see "Tickets" and "New Ticket" in navbar
- Should access /dashboard and create tickets

---

## Quick Command Summary

```bash
# Stop everything
CTRL + C

# Reset database
cd backend
node resetDatabase.js

# Start backend
npm start

# In new terminal - Start frontend
cd frontend
npm start
```

---

## Default Credentials (After Reset)

| Role | Email | Password |
|------|-------|----------|
| SuperAdmin | superadmin@helpdesk.com | superadmin123 |
| Admin | admin@helpdesk.com | admin123 |
| Manager | manager@helpdesk.com | manager123 |
| Agent 1 | agent1@helpdesk.com | agent123 |
| Agent 2 | agent2@helpdesk.com | agent123 |
| User | user@helpdesk.com | user123 |

---

## Still Having Issues?

If logins still don't work:

1. **Check browser console (F12)** for error messages
2. **Check backend logs** for database errors
3. **Verify database is running** (MySQL service)
4. **Check .env file** for correct database credentials
5. **Try clearing all browser data** and re-login

Need help? Check:
- `ROLES_AND_PERMISSIONS.md` - Full role documentation
- `QUICK_START.md` - Getting started guide
- Backend logs - Server console output
