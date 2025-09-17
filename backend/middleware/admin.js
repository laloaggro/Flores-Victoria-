const jwt = require('jsonwebtoken');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos de usuarios
const dbPath = path.join(__dirname, '..', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos de usuarios en middleware:', err.message);
  } else {
    console.log('Conectado a la base de datos de usuarios en middleware');
  }
});

// Middleware para verificar si el usuario es administrador
const isAdmin = async (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    // Verificar que el token tenga el formato correcto
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Formato de token inválido.' });
    }

    const token = tokenParts[1];

    // Verificar el token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET no está definida en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    
    // Buscar al usuario en la base de datos
    db.get(`SELECT id, name, email, role FROM users WHERE id = ?`, [decoded.userId], (err, user) => {
      if (err) {
        console.error('Error al buscar usuario:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado.' });
      }
      
      // Verificar si el usuario es administrador
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
      }
      
      // Adjuntar la información del usuario al request
      req.user = user;
      next();
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }
    console.error('Error en middleware isAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = isAdmin;