const { sendResetPasswordEmail } = require('../services/sendPasswordResetEmail');
const { generateResetToken } = require('../utils/resetToken'); // Usa tu archivo utils/resetToken.js
const User = require('../db/models/users');

exports.requestPasswordReset = async (req, res) => {
  try {
    const { correo } = req.body;

    // Verifica si existe el usuario
    const user = await User.findOne({ where: { correo } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Genera el token de reseteo
    const token = generateResetToken();

    // Define el tiempo de expiración del token (por ejemplo, 1 hora desde ahora)
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000);

    // Guarda el token y su tiempo de expiración en la base de datos
    user.reset_token = token;
    user.reset_token_expiration = expirationTime;
    await user.save();

    // Envía el correo
    await sendResetPasswordEmail({
      to: correo,
      name: user.nombre || 'Usuario',
      resetLink: `http://localhost:3000/api/reset-password?token=${token}`,
    });

    res.json({ message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico.' });
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error.response?.body || error.message);
    res.status(500).json({ error: 'No se pudo enviar el correo de restablecimiento.' });
  }
};
