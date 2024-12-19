const  Usuario  = require('../db/models/users'); // Ajusta según tu configuración
const  sendResetPasswordEmail  = require('../services/sendPasswordResetEmail');
const crypto = require('crypto');

exports.resetPasswordRequest = async (req, res) => {
    const { correo } = req.body;
  
    console.log('Correo recibido para restablecimiento:', correo); // Log para verificar el correo
  
    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido.' });
    }
  
    try {
      // Buscar usuario
      const user = await Usuario.findOne({ where: { correo: correo } });
      console.log('Usuario encontrado:', user); // Log para verificar el usuario
  
      if (!user) {
        return res.status(404).json({ message: 'No se encontró un usuario con ese correo electrónico.' });
      }
  
      // Generar un token
      const token = crypto.randomBytes(20).toString('hex');
      const resetLink = `https://tuaplicacion.com/reset-password?token=${token}`;
  
      // Enviar correo
      await sendResetPasswordEmail({
        to: correo,
        name: user.nombre,
        resetLink: resetLink,
      });
  
      res.status(200).json({ message: 'Correo de restablecimiento enviado.' });
    } catch (error) {
      console.error('Error al procesar la solicitud de restablecimiento:', error);
      res.status(500).json({ message: 'Error al procesar la solicitud de restablecimiento.' });
    }
  };