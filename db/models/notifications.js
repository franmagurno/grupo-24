const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Notification = sequelize.define(
  'Notification',
  {
    id_notificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    id_tipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipo_notificacion', // Nombre de la tabla relacionada
        key: 'id', // Clave primaria de la tabla relacionada
      },
    },
    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_envio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'Notificaciones', // Nombre de la tabla en la base de datos
    timestamps: false, // Si no estás usando timestamps (createdAt, updatedAt)
  }
);

module.exports = Notification;
