const SibApiV3Sdk = require('@sendinblue/client');

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

async function sendResetPasswordEmail({ to, name, resetLink }) {
  const sendSmtpEmail = {
    to: [{ email: to, name: name }],
    templateId: 1,
    params: {
      NAME: name,
      LINK: resetLink,
    },
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Correo enviado exitosamente.');
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
}

module.exports = { sendResetPasswordEmail };
