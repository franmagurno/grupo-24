const crypto = require('crypto');

// Generar un token aleatorio
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex'); // Token único y seguro
};

module.exports = { generateResetToken };
