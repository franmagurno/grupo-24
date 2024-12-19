require('dotenv').config();
const jwt = require('jsonwebtoken');

// Función para generar un token
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('La variable JWT_SECRET no está definida en el entorno.');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken };