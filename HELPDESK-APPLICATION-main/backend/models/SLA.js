const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SLA = sequelize.define('SLA', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false
  },
  responseTimeHours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Response time in hours'
  },
  resolutionTimeHours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Resolution time in hours'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'slas',
  timestamps: true
});

module.exports = SLA;

