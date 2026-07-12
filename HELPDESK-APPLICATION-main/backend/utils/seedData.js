const { User, SLA } = require('../models');

const initializeDefaultUsers = async () => {
  try {
    console.log('[USERS] Ensuring default users exist/update passwords...');

    // Create default users with new roles
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
      try {
        const existing = await User.findOne({ where: { email: userData.email } });
        if (existing) {
          // Ensure role and password are set to the expected defaults
          existing.role = userData.role;
          existing.password = userData.password; // will be hashed via beforeUpdate hook
          await existing.save();
          console.log(`  [OK] Updated: ${existing.email} (${existing.role})`);
        } else {
          const user = await User.create(userData);
          console.log(`  [OK] Created: ${user.email} (${user.role})`);
        }
      } catch (err) {
        console.error(`  [ERROR] Creating/Updating ${userData.email}: ${err.message}`);
      }
    }

    console.log('[OK] Default users created successfully.');
  } catch (error) {
    console.error('[ERROR] Creating default users:', error.message);
  }
};

const initializeDefaultSLAs = async () => {
  try {
    const slaCount = await SLA.count();
    if (slaCount > 0) {
      console.log('[OK] Default SLAs already exist. Skipping SLA seed.');
      return;
    }

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
      try {
        const sla = await SLA.create(slaData);
        console.log(`  [OK] Created SLA: ${sla.name}`);
      } catch (err) {
        console.error(`  [ERROR] Creating SLA ${slaData.name}: ${err.message}`);
      }
    }

    console.log('[OK] Default SLAs created successfully.');
  } catch (error) {
    console.error('[ERROR] Creating default SLAs:', error.message);
  }
};

module.exports = {
  initializeDefaultUsers,
  initializeDefaultSLAs
};

