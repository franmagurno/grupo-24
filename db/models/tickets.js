const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Conexión a la base de datos

const Ticket = sequelize.define(
  'Ticket',
  {
    id_ticket: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_compra: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imagen: {
      type: DataTypes.STRING, // Almacena la ruta o URL
      allowNull: true,
    },
    fecha_subida: {
      type: DataTypes.STRING, // Cambiado a STRING para usarlo como VARCHAR en SQL
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.STRING, // Cambiado a STRING para usarlo como VARCHAR en SQL
      allowNull: true,
    },
    division_type: {
      type: DataTypes.ENUM('equitativo', 'porcentajes'),
      allowNull: false,
      defaultValue: 'equitativo', // Por defecto será equitativo
    },
    porcentajes: {
      type: DataTypes.JSON, // Almacena el porcentaje de los miembros
      allowNull: true, // Solo se utiliza si division_type = 'porcentajes'
    },
  },
  {
    tableName: 'tickets', // Nombre explícito de la tabla
    timestamps: false, // Desactiva createdAt y updatedAt
  }
);

module.exports = Ticket;
