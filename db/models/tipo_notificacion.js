const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Importa la conexión a la base de datos

const TipoNotificacion = sequelize.define(
    'TipoNotificacion',
    {
      id_tipo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'tipo_notificacion', // Nombre exacto de la tabla en la base de datos
      timestamps: false, // Si no estás usando timestamps
    }
  );
  
  module.exports = TipoNotificacion;
  