const jwt = require('jsonwebtoken'); // Importar JSON Web Token 
const userService = require('../services/users'); // Importa los servicios
const User = require('../db/models/users'); // Asegúrate de que la ruta sea correcta
const upload = require('../middlewares/upload');
const bcrypt = require('bcrypt');
const uploadSingle = upload.single('foto_perfil'); // Cambia 'profilePhoto' por 'foto_perfil'
const { sendPasswordChangedEmail } = require('../services/sendPasswordResetEmail');
const { generateToken } = require('../generarToken');
exports.registerUser = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const user = await User.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      foto_perfil: fotoPerfil,
    });

    // Generar el token usando la función centralizada
    const token = generateToken({ id_usuario: user.id_usuario, nombre: user.nombre, correo: user.correo });

    res.status(201).json({
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        foto_perfil: user.foto_perfil,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};




// Controlador: Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
};

// Controlador: Obtener usuario por email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'El email es obligatorio.' });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};



exports.loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const usuario = await User.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const token = generateToken({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
    });

    res.status(200).json({ token, usuario });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
// Controlador: Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const { nombre, correo } = req.body;

    if (!nombre && !correo) {
      return res.status(400).json({ error: 'Debe proporcionar un nombre o correo para actualizar.' });
    }

    const updatedUser = await userService.updateUser(id_usuario, { nombre, correo });
    res.status(200).json({ message: 'Perfil actualizado exitosamente.', updatedUser });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


exports.deleteAccount = async (req, res) => {
  try {
    const { id_usuario } = req.params; // Obtén el id_usuario desde los parámetros de la URL

    // Verifica si el ID fue enviado
    if (!id_usuario) {
      return res.status(400).json({ error: 'El ID del usuario es obligatorio.' });
    }

    // Busca el usuario por su ID
    const user = await User.findByPk(id_usuario); // Reemplaza "User" con el modelo correcto
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Elimina el usuario
    await user.destroy(); // Método directo en la instancia del modelo para eliminarlo

    res.status(200).json({ message: 'Cuenta eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const { id_usuario } = req.params; 
    const user = await User.findByPk(id_usuario); 

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador: Actualizar perfil por ID
exports.updateProfileById = async (req, res) => {
  try {
    const { id_usuario } = req.params; 
    const { nombre, correo } = req.body; 

    if (!id_usuario) {
      return res.status(400).json({ error: 'El ID del usuario es obligatorio.' });
    }

    if (!nombre && !correo) {
      return res.status(400).json({ error: 'Debe proporcionar un nombre o correo para actualizar.' });
    }

    console.log('ID Usuario:', id_usuario);
    console.log('Datos para actualizar:', { nombre, correo });

    
    const user = await User.findByPk(id_usuario);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    
    const updatedUser = await user.update({ nombre, correo });
    console.log('Usuario actualizado:', updatedUser);

    res.status(200).json({
      message: 'Perfil actualizado exitosamente.',
      usuario: {
        id_usuario: updatedUser.id_usuario,
        nombre: updatedUser.nombre,
        correo: updatedUser.correo,
      },
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error.message || error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para actualizar la foto de perfil
exports.updateProfilePicture = async (req, res) => {
  try {
    
    const { id_usuario } = req.user; 

    if (!id_usuario) {
      return res.status(400).json({ error: 'Usuario no autenticado.' });
    }

    // Verificamos si un archivo fue enviado en la solicitud
    const fotoPerfil = req.file ? `/uploads/${req.file.filename}` : null;

    if (!fotoPerfil) {
      return res.status(400).json({ error: 'No se proporcionó una foto de perfil.' });
    }

    
    const updatedUser = await userService.updateUser(id_usuario, { foto_perfil: fotoPerfil });

   
    res.status(200).json({
      message: 'Foto de perfil actualizada correctamente.',
      usuario: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
    res.status(500).json({ error: 'Error al actualizar la foto de perfil.' });
  }
};