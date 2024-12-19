const bcrypt = require('bcrypt');

const contrasenaActual = 'magu312022'; // Contraseña enviada
const hashAlmacenado = '$2b$10$H1HYkz8h/dSoE.9F6S5cEOPcfv2nPgbDR2vYtbzHr2lhDNo7F/oSm'; // Hash almacenado

bcrypt.compare(contrasenaActual, hashAlmacenado)
  .then(result => console.log('¿Coinciden las contraseñas?', result))
  .catch(err => console.error('Error al comparar contraseñas:', err));
