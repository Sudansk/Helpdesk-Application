const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production'
    );
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };

