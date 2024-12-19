const Notification = require('../db/models/notifications');
const TipoNotificacion = require('../db/models/tipo_notificacion');
const { format } = require('date-fns');

// Servicio: Crear una nueva notificación
const createNotification = async ({ id_usuario, mensaje, id_tipo }) => {
  const fecha_envio = format(new Date(), 'yyyy-MM-dd HH:mm:ss'); // Formato compatible con SQL Server
  return await Notification.create({
    id_usuario,
    mensaje,
    id_tipo,
    fecha_envio,
  });
};

// Servicio: Obtener todas las notificaciones (opcionalmente filtradas por usuario)
const getNotifications = async (id_usuario) => {
  const where = id_usuario ? { id_usuario } : {};
  return await Notification.findAll({
    where,
    include: [{ model: TipoNotificacion, attributes: ['nombre'] }],
    order: [['fecha_envio', 'DESC']],
  });
};

// Servicio: Obtener una notificación por ID (ahora usando id_notificacion)
const getNotificationById = async (id_notificacion) => {
  return await Notification.findByPk(id_notificacion, {
    include: [{ model: TipoNotificacion, attributes: ['nombre'] }],
  });
};

// Servicio: Marcar una notificación como leída (ahora usando id_notificacion)
const markAsRead = async (id_notificacion) => {
  const notification = await Notification.findByPk(id_notificacion);
  if (!notification) {
    return null;
  }
  notification.leido = true;
  await notification.save();
  return notification;
};

// Servicio: Eliminar una notificación (ahora usando id_notificacion)
const deleteNotification = async (id_notificacion) => {
  const deleted = await Notification.destroy({ where: { id_notificacion } });
  return deleted > 0; // Devuelve true si se eliminó, false si no
};

// Servicio: Obtener notificaciones no leídas de un usuario
const getUnreadNotifications = async (id_usuario) => {
  return await Notification.findAll({
    where: { id_usuario, leido: false },
    include: [{ model: TipoNotificacion, attributes: ['nombre'] }],
    order: [['fecha_envio', 'DESC']],
  });
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
  getUnreadNotifications,
};
