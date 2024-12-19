const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Asegúrate de importar tu instancia de Sequelize

const Payment = sequelize.define('Payment', {
  id_pago: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_deuda: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'deudas', // Nombre de la tabla relacionada
      key: 'id_deuda',
    },
    onDelete: 'CASCADE',
  },
  monto_pagado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha_pago: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'pagos',
  timestamps: false, // No usamos createdAt ni updatedAt
});

module.exports = Payment;
