const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Importa la conexión a la base de datos


const User = sequelize.define('User', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false,
  },
ultimo_acceso: {
  type: DataTypes.DATE, // Cambia de STRING a DATE
  allowNull: true,
},
foto_perfil: {
  type: DataTypes.STRING, // Ruta de la foto (ejemplo: URL o path local)
  allowNull: true,
},
}, {
  tableName: 'Usuarios', // Nombre explícito de la tabla
  timestamps: false, // Desactiva createdAt y updatedAt
});


module.exports = User;
