const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../db/models/users');
const { sendResetPasswordEmail } = require('../services/sendPasswordResetEmail');

// Solicitar restablecimiento de contraseña
exports.requestPasswordReset = async (req, res) => {
  try {
    const { correo } = req.body;

    const user = await User.findOne({ where: { correo } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const token = jwt.sign({ id: user.id_usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await sendResetPasswordEmail({
      to: correo,
      name: user.nombre || 'Usuario',
      resetLink: `http://localhost:3001/reset-password/${token}`,
    });

    res.status(200).json({ message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico.' });
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo de restablecimiento.' });
  }
};

// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;

    // Validar que los datos requeridos están presentes
    if (!token || !newPassword || !currentPassword) {
      return res.status(400).json({ error: 'Token, contraseña actual y nueva contraseña son requeridos.' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded;

    // Buscar al usuario en la base de datos
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Verificar si la contraseña actual coincide
    const isMatch = await bcrypt.compare(currentPassword, user.contrasena);
    if (!isMatch) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
    }

    // Hashear la nueva contraseña y actualizarla
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.contrasena = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};