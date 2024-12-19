const jwt = require('jsonwebtoken');



const authenticate = async (req, res, next) => {
  try {
    // Obtén el token del encabezado Authorization
    const token = req.headers.authorization?.split(' ')[1]; // 'Bearer <token>'
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usa tu clave secreta

    // Aseguramos que la información del usuario esté en req.user
    req.user = decoded;

    // Continuar con la siguiente función/middleware
    next();
  } catch (error) {
    console.error('Error al autenticar token:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = { authenticate };
