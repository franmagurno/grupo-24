const notificationService = require('../services/notifications');


exports.createNuevoTicketNotification = async (req, res) => {
  try {
    const { id_usuario, mensaje } = req.body;
    const notification = await notificationService.createNotification({
      id_usuario,
      mensaje,
      id_tipo: 1,
      
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear la notificación (Nuevo Ticket):', error);
    res.status(500).json({ error: 'Error al crear la notificación' });
  }
};


exports.createAsignacionMontosNotification = async (req, res) => {
  try {
    const { id_usuario, mensaje } = req.body;
    const notification = await notificationService.createNotification({
      id_usuario,
      mensaje,
      id_tipo: 2,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear la notificación (Asignación de Montos):', error);
    res.status(500).json({ error: 'Error al crear la notificación' });
  }
};


exports.createRecordatorioPagoNotification = async (req, res) => {
  try {
    const { id_usuario, mensaje } = req.body;
    const notification = await notificationService.createNotification({
      id_usuario,
      mensaje,
      id_tipo: 3,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear la notificación (Recordatorio de Pago):', error);
    res.status(500).json({ error: 'Error al crear la notificación' });
  }
};


exports.createDeudaSaldadaNotification = async (req, res) => {
  try {
    const { id_usuario, mensaje } = req.body;
    const notification = await notificationService.createNotification({
      id_usuario,
      mensaje,
      id_tipo: 4,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear la notificación (Deuda Saldada):', error);
    res.status(500).json({ error: 'Error al crear la notificación' });
  }
};


exports.createNuevosMiembrosNotification = async (req, res) => {
  try {
    const { id_usuario, mensaje } = req.body;
    const notification = await notificationService.createNotification({
      id_usuario,
      mensaje,
      id_tipo: 5,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error al crear la notificación (Nuevos Miembros/Grupo):', error);
    res.status(500).json({ error: 'Error al crear la notificación' });
  }
};


exports.getNotifications = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    const notifications = await notificationService.getNotifications(id_usuario);
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};


exports.getNotificationById = async (req, res) => {
  try {
    const { id_notificacion } = req.params;
    const notification = await notificationService.getNotificationById(id_notificacion);
    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    res.status(500).json({ error: 'Error al obtener notificación' });
  }
};

// Marcar una notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const { id_notificacion } = req.params;
    const notification = await notificationService.markAsRead(id_notificacion); 
    // Este servicio internamente deberá cambiar `leido` a true
    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json({ message: 'Notificación marcada como leída', notification });
  } catch (error) {
    console.error('Error al actualizar notificación:', error);
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
};

// Eliminar una notificación
exports.deleteNotification = async (req, res) => {
  try {
    const { id_notificacion } = req.params;
    const deleted = await notificationService.deleteNotification(id_notificacion);
    if (!deleted) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};

// Obtener notificaciones no leídas de un usuario
exports.getUnreadNotifications = async (req, res) => {
  try {
    const { id_usuario } = req.query;

    if (!id_usuario) {
      return res.status(400).json({ error: 'Se requiere id_usuario' });
    }

    const notifications = await notificationService.getUnreadNotifications(id_usuario);
    // El servicio filtra por `leido = false`
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
  }
};
