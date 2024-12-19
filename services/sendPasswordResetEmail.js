const SibApiV3Sdk = require('@sendinblue/client');

// Crea una instancia de la API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Configura tu API Key aquí (lo ideal es usar process.env.BREVO_API_KEY)
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

async function sendResetPasswordEmail({ to, name, resetLink }) {
  const sendSmtpEmail = {
    to: [{ email: to, name: name }],
    templateId: 1, // Asegúrate de que este sea el correcto
    params: {
      NAME: name,
      LINK: resetLink,
    },
  };

  console.log('Datos enviados a Brevo:', sendSmtpEmail);

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Respuesta de Brevo:', JSON.stringify(data));
  } catch (error) {
    console.error('Error al enviar email:', error.response?.body || error.message);
    throw error;
  }
}
module.exports = { sendResetPasswordEmail };
