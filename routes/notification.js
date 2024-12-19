const express = require('express');
const {
  createNuevoTicketNotification,
  createAsignacionMontosNotification,
  createRecordatorioPagoNotification,
  createDeudaSaldadaNotification,
  createNuevosMiembrosNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
  getUnreadNotifications,
} = require('../controllers/notification');
const { authenticate } = require('../middlewares/authenticate'); // Middleware de autenticación
const router = express.Router();

// Rutas protegidas con authenticate
router.post('/nuevo-ticket', authenticate, createNuevoTicketNotification); // Crear notificación tipo 1
router.post('/asignacion-montos', authenticate, createAsignacionMontosNotification); // Crear notificación tipo 2
router.post('/recordatorio-pago', authenticate, createRecordatorioPagoNotification); // Crear notificación tipo 3
router.post('/deuda-saldada', authenticate, createDeudaSaldadaNotification); // Crear notificación tipo 4
router.post('/nuevos-miembros', authenticate, createNuevosMiembrosNotification); // Crear notificación tipo 5

router.get('/', authenticate, getNotifications); // Obtener todas las notificaciones
router.get('/unread', authenticate, getUnreadNotifications); // Obtener notificaciones no leídas
router.get('/:id_notificacion', authenticate, getNotificationById); // Obtener una notificación por id_notificacion
router.patch('/:id_notificacion/read', authenticate, markAsRead); // Marcar como leída una notificación
router.delete('/:id_notificacion', authenticate, deleteNotification); // Eliminar una notificación

module.exports = router;
