const sequelize = require('../db');
const Usuario = require('./users');
const Project = require('./projects');
const UsuariosGrupos = require('./UsuariosGrupos');
const Notification = require('./notifications');
const TipoNotificacion = require('./tipo_notificacion');
const Ticket = require('./tickets');

const Debt = require('./debt');  // Importa el modelo de deudas
const Payment = require('./payment'); // Importa el modelo de pagos

// Configurar asociaciones
const setupAssociations = () => {
  // Asociación Usuario - UsuariosGrupos
  Usuario.hasMany(UsuariosGrupos, {
    foreignKey: 'id_usuario',
    onDelete: 'CASCADE',
    as: 'GroupMemberships',
  });

  UsuariosGrupos.belongsTo(Usuario, {
    foreignKey: 'id_usuario',
    targetKey: 'id_usuario',
    as: 'User',
  });

  Project.belongsTo(Usuario, { as: 'creator', foreignKey: 'id_creador', onDelete: 'CASCADE' });

  // Asociación UsuariosGrupos - Project
  UsuariosGrupos.belongsTo(Project, {
    foreignKey: 'id_grupo',
    targetKey: 'id_proyecto',
    as: 'AssociatedProject',
  });

  // Asociación Notification - TipoNotificacion
  Notification.belongsTo(TipoNotificacion, { foreignKey: 'id_tipo' });
  TipoNotificacion.hasMany(Notification, { foreignKey: 'id_tipo' });

  Usuario.hasMany(Project, { foreignKey: 'id_creador', onDelete: 'CASCADE', as: 'projects' });

  // Asociación Ticket - TicketMember

  // Asociación Usuario - Ticket
  Usuario.hasMany(Ticket, { foreignKey: 'id_usuario', as: 'tickets' });
  Ticket.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

  // Asociación Project - Ticket
  Project.hasMany(Ticket, { foreignKey: 'id_proyecto', as: 'tickets' });
  Ticket.belongsTo(Project, { foreignKey: 'id_proyecto', as: 'project' });

  // Asociación Usuario - Deuda (deudor y acreedor)
  // Asociación para deudor
  Usuario.hasMany(Debt, { as: 'deudasDeudor', foreignKey: 'deudor' });

  // Asociación para acreedor
  Usuario.hasMany(Debt, { as: 'deudasAcreedor', foreignKey: 'acreedor' });

  // En el modelo Debt
  // Relación de deuda con el deudor
  Debt.belongsTo(Usuario, { as: 'usuarioDeudor', foreignKey: 'deudor' });

  // Relación de deuda con el acreedor
  Debt.belongsTo(Usuario, { as: 'usuarioAcreedor', foreignKey: 'acreedor' });

  // Asociación Deuda - Pago
  Debt.hasMany(Payment, { foreignKey: 'id_deuda', as: 'pagos' });
  Payment.belongsTo(Debt, { foreignKey: 'id_deuda', as: 'deuda' });
};

// Llamar a las configuraciones de asociaciones
setupAssociations();

// Exportar modelos y la instancia de sequelize
module.exports = {
  sequelize,
  Usuario,
  Project,
  UsuariosGrupos,
  Notification,
  TipoNotificacion,
  Ticket,

  Debt,  // Exporta el modelo de deudas
  Payment,  // Exporta el modelo de pagos
};
