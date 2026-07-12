const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create database if it doesn't exist
async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'helpdesk_db'}\``);
    console.log('Database ensured to exist.');
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await connection.end();
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'helpdesk_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize, initializeDatabase };

