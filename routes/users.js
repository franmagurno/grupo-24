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
router.put('/password', authenticate, userController.changePassword);

// Ruta para eliminar cuenta (Protegida)ACAA
router.delete('/delete', authenticate, userController.deleteAccount);

// Ruta para obtener usuario por ID sin autenticación
router.get('/usuarios/:id_usuario',authenticate, userController.getUserById); // Sin autenticación
router.get('/password', async (req, res) => {
    const { token } = req.query; // Extrae el token de los parámetros de la consulta

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        // Aquí verifica si el token es válido (por ejemplo, con la base de datos)
        console.log('Token recibido:', token);

        // Simula una respuesta exitosa
        res.status(200).json({ message: 'Token válido, formulario de restablecimiento' });
    } catch (error) {
        console.error('Error al procesar el token:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});
// Ruta para actualizar foto de perfil (Protegida)


module.exports = router;
