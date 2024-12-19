const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Asegúrate de importar tu instancia de Sequelize

const Debt = sequelize.define('Debt', {
  id_deuda: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_ticket: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tickets', // Nombre de la tabla relacionada
      key: 'id_ticket',
    },
    onDelete: 'CASCADE',
  },
  deudor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario',
    },
    onDelete: 'CASCADE',
  },
  acreedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id_usuario',
    },
    onDelete: 'CASCADE',
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'saldada'),
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'deudas',
  timestamps: false, // Ya tenemos fecha_creacion
  hooks: {
    async beforeUpdate(deuda, options) {
      // Verifica si el campo 'estado' ha cambiado y si el nuevo valor es 'saldada'
      if (deuda.changed('estado') && deuda.estado === 'saldada') {
        // Si el estado cambió a 'saldada', elimina el registro
        await deuda.destroy({ transaction: options.transaction });
      }
    }
  }
});

module.exports = Debt;
