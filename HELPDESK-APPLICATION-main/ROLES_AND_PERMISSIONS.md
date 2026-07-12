# Role-Based Access Control (RBAC) Documentation

## Overview
This helpdesk application implements a **complete role separation** system with 5 distinct user roles. Each role has its own dashboard and interfaces with **NO inheritance** - roles are completely separate from each other.

## 🔐 Strict Role Separation Model

Unlike hierarchical systems, this application uses **strict separation**:
- **SuperAdmin** has its own control panel (cannot access Admin features)
- **Admin** has its own dashboard (cannot access Manager or SuperAdmin features)
- **Manager** has its own dashboard (cannot access Admin or SuperAdmin features)
- **Agent** and **User** roles work within ticket system

**No role inherits features from another role.**

---

## Role Descriptions & Permissions

### 1. **SuperAdmin (Superadministrator)**
**Purpose:** Full system control, configuration, and master data management

**Permissions:**
- ✅ Full system access
- ✅ User Management (Create, Update, Delete all user types)
- ✅ SLA Management (Create, Update, Delete SLAs)
- ✅ System Configuration (manage all settings)
- ✅ System Analytics & Health Monitoring
- ✅ All Admin and Manager capabilities
- ✅ View System Statistics
- ✅ Monitor System Health

**Access URLs:**
- `/superadmin` - SuperAdmin Control Panel
- `/admin` - Admin Dashboard
- `/manager` - Manager Dashboard
- `/tickets` - Ticket Management

**Default Account:**
```
Email: superadmin@helpdesk.com
Password: superadmin123
```

**API Endpoints:**
```
GET    /api/superadmin/users              - Get all users
POST   /api/superadmin/users              - Create new user
PUT    /api/superadmin/users/:id          - Update user
DELETE /api/superadmin/users/:id          - Deactivate user

GET    /api/superadmin/slas               - Get all SLAs
POST   /api/superadmin/slas               - Create SLA
PUT    /api/superadmin/slas/:id           - Update SLA
DELETE /api/superadmin/slas/:id           - Delete SLA

GET    /api/superadmin/stats              - System statistics
GET    /api/superadmin/health             - System health check
```

---

### 2. **Admin (Administrator)**
**Purpose:** System administration and operational management

**Permissions:**
- ✅ Manage tickets (assign, update status)
- ✅ View system statistics and reports
- ✅ Cannot create other Admin users
- ✅ Cannot manage SuperAdmin or Manager users
- ✅ Cannot modify SLAs (SuperAdmin only)
- ✅ Cannot access Manager or SuperAdmin dashboards
- ✅ Cannot access Manager team performance features

**Access URLs:**
- `/admin` - Admin Dashboard
- `/tickets` - Ticket Management

**Default Account:**
```
Email: admin@helpdesk.com
Password: admin123
```

**API Endpoints:** `/api/admin` endpoints only (Admin Dashboard)

---

### 3. **Manager (Team Manager)**
**Purpose:** Monitor team performance and generate reports - COMPLETELY SEPARATE from Admin

**Permissions:**
- ✅ View team members and their performance
- ✅ Monitor ticket distribution across agents
- ✅ Generate performance reports
- ✅ Analyze team productivity metrics
- ✅ Track average resolution times
- ✅ Monitor workload distribution
- ✅ View priority and status breakdowns
- ❌ Cannot modify user roles or create users
- ❌ Cannot delete tickets
- ❌ Cannot access Admin dashboard
- ❌ Cannot access SuperAdmin dashboard
- ❌ Cannot manage system configuration

**Access URLs:**
- `/manager` - Manager Dashboard (ONLY for managers)
- `/tickets` - Ticket Management

**Default Account:**
```
Email: manager@helpdesk.com
Password: manager123
```

**API Endpoints:**
```
GET /api/manager/team-members        - Get all team members (strictly manager role only)
GET /api/manager/performance         - Team performance metrics
GET /api/manager/report/priority     - Tickets by priority
GET /api/manager/report/status       - Tickets by status
GET /api/manager/workload            - Agent workload distribution
GET /api/manager/summary             - Team summary statistics
```

---

### 4. **Agent (Support Agent)**
**Purpose:** Handle customer support tickets

**Permissions:**
- ✅ View assigned tickets
- ✅ Update ticket status
- ✅ Add comments to tickets
- ✅ View ticket details
- ✅ Cannot create/delete users
- ✅ Cannot access admin features
- ✅ Cannot modify system configuration

**Access URLs:**
- `/dashboard` - Personal Dashboard
- `/tickets` - View assigned tickets

**API Endpoints:**
```
GET    /api/tickets              - Get assigned tickets
GET    /api/tickets/:id          - Get ticket details
PUT    /api/tickets/:id          - Update ticket
POST   /api/tickets/:id/status   - Update ticket status
POST   /api/tickets/:id/comments - Add comment to ticket
```

---

### 5. **User (Regular User/Customer)**
**Purpose:** Submit and track support tickets

**Permissions:**
- ✅ Create new tickets
- ✅ View own tickets
- ✅ Add comments to own tickets
- ✅ View ticket status
- ✅ Cannot view other users' tickets
- ✅ Cannot modify other tickets
- ✅ Cannot access admin features

**Access URLs:**
- `/dashboard` - Personal Dashboard
- `/tickets` - View own tickets
- `/tickets/new` - Create new ticket

**API Endpoints:**
```
GET  /api/tickets              - Get own tickets
POST /api/tickets              - Create new ticket
GET  /api/tickets/:id          - Get own ticket details
POST /api/tickets/:id/comments - Add comment to own ticket
```

---

## Manager Dashboard Features

The Manager Dashboard provides comprehensive team monitoring:

### Tabs Available:

1. **Team Summary**
   - Total team members
   - Total tickets assigned to team
   - Resolved vs Open tickets
   - In-Progress tickets
   - Urgent tickets count
   - Overall resolution rate

2. **Performance**
   - Individual agent performance metrics
   - Assigned tickets per agent
   - Resolved tickets per agent
   - Active tickets per agent
   - Resolution rate per agent
   - Average resolution time per agent

3. **Workload**
   - Visual workload distribution
   - Open tickets per agent
   - Workload balance indicators
   - Identifies overloaded agents

4. **Reports**
   - Tickets grouped by priority
   - Tickets grouped by status
   - Team-wide statistics

---

## SuperAdmin Dashboard Features

The SuperAdmin Control Panel provides complete system management:

### Tabs Available:

1. **System Overview**
   - Total users and active users count
   - Total tickets in system
   - Users by role breakdown
   - System health status
   - Alerts for critical metrics
   - Unassigned tickets count
   - Overdue tickets count
   - Urgent tickets count

2. **User Management**
   - Create new users with any role
   - View all users in system
   - Manage user status (activate/deactivate)
   - Change user roles
   - Monitor user distribution by role

3. **SLA Management**
   - Create new Service Level Agreements
   - Define response time requirements
   - Define resolution time requirements
   - Set priority levels
   - Update existing SLAs
   - Delete SLAs

---

## Default Test Accounts

| Role | Email | Password |
|------|-------|----------|
| SuperAdmin | superadmin@helpdesk.com | superadmin123 |
| Admin | admin@helpdesk.com | admin123 |
| Manager | manager@helpdesk.com | manager123 |
| Agent 1 | agent1@helpdesk.com | agent123 |
| Agent 2 | agent2@helpdesk.com | agent123 |
| User | user@helpdesk.com | user123 |

---

## Authorization Implementation

### Backend Middleware (auth.js)

**Role Hierarchy Check:**
```javascript
const ROLE_HIERARCHY = {
  superadmin: 5,
  admin: 4,
  manager: 3,
  agent: 2,
  user: 1
};
```

**Available Functions:**
- `authenticate()` - Verify JWT token and user status
- `authorize(...roles)` - Check if user has required roles
- `hasMinimumRole(role)` - Check role hierarchy level

### Frontend Protection (PrivateRoute.js)

- Routes require authentication
- Role-based route protection
- Automatic redirect to login for unauthorized access

---

## Creating Users by Role

### SuperAdmin (via API)
```bash
POST /api/superadmin/users
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securepassword",
  "role": "agent|manager|admin|superadmin"
}
```

### Admin (via API)
- Can create: agent, manager, user
- Cannot create: superadmin

### Other Roles
- No user creation capability

---

## Security Notes

1. **Password Security:** All passwords are hashed with bcrypt
2. **Token-Based Auth:** JWT tokens used for API authentication
3. **Role Hierarchy:** Enforced at both backend and frontend
4. **Database:** User roles stored in Sequelize User model
5. **Inactive Users:** Cannot login; SuperAdmin can deactivate users

---

## Database Schema

### User Model
```javascript
{
  id: INTEGER (primary key),
  name: STRING,
  email: STRING (unique),
  password: STRING (hashed),
  role: ENUM(['superadmin', 'admin', 'manager', 'agent', 'user']),
  isActive: BOOLEAN (default: true),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

---

## Role Permissions Matrix (Strict Separation - NO Inheritance)

| Feature | SuperAdmin | Admin | Manager | Agent | User |
|---------|-----------|-------|---------|-------|------|
| View Own Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Dashboard Only | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Ticket | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Tickets | ✅ | ✅ | ❌ | ❌ | Own |
| Assign Ticket | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Ticket Status | ✅ | ✅ | ❌ | ✅ | Own |
| Create User | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create SLA | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Admin Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Manager Dashboard | ✅ | ❌ | ✅ | ❌ | ❌ |
| View SuperAdmin Control | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Team Performance | ❌ | ❌ | ✅ | ❌ | ❌ |
| System Health Monitoring | ✅ | ❌ | ❌ | ❌ | ❌ |

**Key:** ✅ Can access | ❌ Cannot access | Own = Only own tickets

---

## Best Practices

1. **Minimize SuperAdmin Usage:** Use SuperAdmin account sparingly for critical operations
2. **Regular Audits:** Monitor user activities and role assignments
3. **Password Management:** Change default test passwords in production
4. **Role Assignment:** Assign appropriate roles based on responsibilities
5. **SLA Configuration:** Maintain clear SLAs for different priority levels
6. **Team Monitoring:** Managers should regularly review team performance

---

## Troubleshooting

### User Can't Access Expected Features
- Check user role in SuperAdmin dashboard
- Verify role permissions in this documentation
- Clear browser cache and re-login

### API Returns 403 Forbidden
- User role lacks required permissions
- Check authorization middleware configuration
- Verify JWT token validity

### Dashboard Not Loading
- Ensure user has required role for page
- Check API endpoint permissions
- Verify database has necessary data

---

## Future Enhancements
- Role-based SLA assignment
- Custom role creation
- Permission granularity
- Audit logging for all actions
- API key management for roles
