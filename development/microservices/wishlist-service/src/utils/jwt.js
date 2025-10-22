const jwt = require('jsonwebtoken');

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '24h',
  });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

module.exports = {
  generateToken,
  verifyToken,
};
