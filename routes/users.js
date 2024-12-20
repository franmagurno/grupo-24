const express = require('express');
const router = express.Router();
const userController = require('../controllers/users'); // Importa el controlador
const { authenticate } = require('../middlewares/authenticate'); // Importa el middleware de autenticación
const upload = require('../middlewares/upload'); // Configuración de multer

console.log(userController); // Verifica que las funciones estén correctamente importadas

// Ruta para registrar un usuario con subida de archivo
router.post('/register', upload.single('foto_perfil'), userController.registerUser);

// Ruta para iniciar sesión
router.post('/login', userController.loginUser);

// Ruta para obtener usuario por email (Protegida)
router.get('/email', authenticate, userController.getUserByEmail);

// Ruta para actualizar perfil (Protegida)
router.put('/profile/:id_usuario', userController.updateProfileById);

// Ruta para cambiar contraseña (Protegida)
router.get('/', userController.getUsers);

// Ruta para eliminar cuenta (Protegida)ACAA
router.delete('/delete', authenticate, userController.deleteAccount);

// Ruta para obtener usuario por ID sin autenticación
router.get('/usuarios/:id_usuario',authenticate, userController.getUserById); // Sin autenticación
// Ruta para actualizar foto de perfil (Protegida)
router.put('/profile-picture/:id_usuario', authenticate, upload.single('foto_perfil'), userController.updateProfilePicture);

module.exports = router;
