const { Sequelize } = require('sequelize');
require('dotenv').config(); // Para cargar las variables de entorno desde .env

const sequelize = new Sequelize(
  process.env.DB_NAME,           // Nombre de la base de datos
  process.env.DB_USER,           // Usuario de MySQL
  process.env.DB_PASSWORD,       // Contraseña del usuario
  {
    host: process.env.DB_HOST,   // Host (e.g., localhost o IP remota)
    port: process.env.DB_PORT || 3306, // Puerto (por defecto 3306 para MySQL)
    dialect: 'mysql',            // Dialecto para MySQL
    logging: false,              // Cambiar a true para depuración
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos MySQL.');
  } catch (error) {
    console.error('Error al conectar a la base de datos MySQL:', error);
  }
})();

module.exports = sequelize;
