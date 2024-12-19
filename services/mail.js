const sgMail = require('@sendgrid/mail');

// Configura tu API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendPasswordResetEmail({ to, token }) {
  const resetLink = `https://tuaplicacion.com/reset-password?token=${token}`;
  const subject = 'Restablece tu contraseña';
  const textContent = `Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para restablecerla: ${resetLink}`;
  const htmlContent = `
    <p>Has solicitado restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace para continuar con el proceso:</p>
    <a href="${resetLink}">Restablecer contraseña</a>
    <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
  `;

  const msg = {
    to: to,
    from: 'soporte@tudominio.com', // Debes usar un remitente verificado en SendGrid
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log('Correo de restablecimiento de contraseña enviado a:', to);
  } catch (error) {
    console.error('Error al enviar el correo de restablecimiento:', error);
    throw new Error('No se pudo enviar el correo de restablecimiento de contraseña');
  }
}

module.exports = { sendPasswordResetEmail };
