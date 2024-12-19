const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const UsuariosGrupos = sequelize.define('UsuariosGrupos', {
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  id_grupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  rol: {
    type: DataTypes.ENUM('Creador', 'Miembro'),
    allowNull: false,
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'Usuarios_Grupos',
  timestamps: false, // No hay campos `createdAt` ni `updatedAt`
});



module.exports = UsuariosGrupos;
