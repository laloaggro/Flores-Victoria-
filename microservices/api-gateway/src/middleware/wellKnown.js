// Middleware para manejar solicitudes a rutas .well-known
const handleWellKnown = (req, res, next) => {
  // Si la solicitud es para una ruta .well-known
  if (req.path.startsWith('/.well-known')) {
    // Enviar respuesta 404 sin encabezados de seguridad
    return res.status(404).send('');
  }
  
  // Si no es una ruta .well-known, continuar con el flujo normal
  next();
};

module.exports = handleWellKnown;