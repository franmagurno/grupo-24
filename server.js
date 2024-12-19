const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./db/models');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const ticketRoutes = require('./routes/tickets');
const notificationsRoutes = require('./routes/notification');
const emailRoutes = require('./routes/email');

const debt = require('./routes/debt');
const multer = require('multer');

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// Middleware global
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001', // Configura el cliente permitido
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true, // Permitir el envío de cookies o encabezados de autorización
  })
);
app.use(morgan('dev'));

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Sirviendo la carpeta 'uploads' como archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/deudas', debt);

// Prueba de salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mostrar todas las rutas registradas
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`Método: ${Object.keys(middleware.route.methods).join(', ').toUpperCase()}, Ruta: ${middleware.route.path}`);
  }
});

// Verificar conexión a la base de datos
sequelize
  .authenticate()
  .then(() => console.log('Conexión a la base de datos establecida exitosamente'))
  .catch((error) => console.error('Error al conectar a la base de datos:', error));

// Sincronizar modelos
sequelize
  .sync({ alter: isDev })
  .then(() => console.log('Modelos sincronizados con la base de datos'))
  .catch((error) => console.error('Error al sincronizar modelos:', error));

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error('Error interno:', err);

  // Manejo de errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map((e) => e.message) });
  }

  // Manejo de errores de autenticación
  if (err.name === 'UnauthorizedError' || err.message.includes('jwt')) {
    return res.status(401).json({ error: 'No autorizado o token inválido.' });
  }

  // Error genérico
  res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

// Ruta de fallback para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
