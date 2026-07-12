/**
 * Database Reset Script - Clear all data and reinitialize
 * Run this once to reset the database and create default users
 * 
 * Usage: node resetDatabase.js
 */

const { sequelize, initializeDatabase } = require('./config/database');
const { User, Ticket, Comment, Attachment, SLA, Notification } = require('./models');

async function resetDatabase() {
  try {
    console.log('[RESET] Starting database reset...');

    // Ensure database exists and connection is healthy
    await initializeDatabase();
    console.log('[DB] Ensured database exists');
    await sequelize.authenticate();
    console.log('[OK] Database connection authenticated');

    // Drop all tables in reverse order of dependencies
    console.log('[DB] Dropping existing tables...');
    // Disable foreign key checks to allow truncating/dropping in any order
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    try {
      await sequelize.truncate({ cascade: true });
      await sequelize.drop({ cascade: true });
      console.log('[OK] Tables dropped');
    } finally {
      // Re-enable foreign key checks
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    // Recreate all tables
    console.log('[DB] Creating tables...');
    await sequelize.sync({ force: true });
    console.log('[OK] Tables created');

    // Create default users
    console.log('[USERS] Creating default users...');
    const defaultUsers = [
      {
        name: 'SuperAdmin User',
        email: 'superadmin@helpdesk.com',
        password: 'superadmin123',
        role: 'superadmin'
      },
      {
        name: 'Admin User',
        email: 'admin@helpdesk.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Manager User',
        email: 'manager@helpdesk.com',
        password: 'manager123',
        role: 'manager'
      },
      {
        name: 'Agent User 1',
        email: 'agent1@helpdesk.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        name: 'Agent User 2',
        email: 'agent2@helpdesk.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        name: 'Test User',
        email: 'user@helpdesk.com',
        password: 'user123',
        role: 'user'
      }
    ];

    for (const userData of defaultUsers) {
      const user = await User.create(userData);
      console.log(`  [OK] Created: ${user.email} (${user.role})`);
    }

    // Create default SLAs
    console.log('[SLA] Creating default SLAs...');
    const defaultSLAs = [
      {
        name: 'Low Priority SLA',
        priority: 'low',
        responseTimeHours: 24,
        resolutionTimeHours: 72
      },
      {
        name: 'Medium Priority SLA',
        priority: 'medium',
        responseTimeHours: 8,
        resolutionTimeHours: 24
      },
      {
        name: 'High Priority SLA',
        priority: 'high',
        responseTimeHours: 2,
        resolutionTimeHours: 8
      },
      {
        name: 'Urgent Priority SLA',
        priority: 'urgent',
        responseTimeHours: 1,
        resolutionTimeHours: 4
      }
    ];

    for (const slaData of defaultSLAs) {
      const sla = await SLA.create(slaData);
      console.log(`  [OK] Created SLA: ${sla.name}`);
    }

    console.log('');
    console.log('[SUCCESS] Database reset completed successfully!');
    console.log('');
    console.log('[CREDENTIALS] Default login credentials:');
    console.log('');
    console.log('SuperAdmin:  superadmin@helpdesk.com / superadmin123');
    console.log('Admin:       admin@helpdesk.com / admin123');
    console.log('Manager:     manager@helpdesk.com / manager123');
    console.log('Agent 1:     agent1@helpdesk.com / agent123');
    console.log('Agent 2:     agent2@helpdesk.com / agent123');
    console.log('User:        user@helpdesk.com / user123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error resetting database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
