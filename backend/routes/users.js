const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const router = express.Router();

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar si es administrador
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

// Ruta para solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El email es requerido' });
  }

  try {
    // Simular generación de token de recuperación
    const resetToken = jwt.sign(
      { userId: 'simulated_user_id_123' },
      process.env.JWT_SECRET || 'secreto_por_defecto',
      { expiresIn: '1h' }
    );

    // Simular envío de enlace de recuperación
    console.log('Simulando envío de enlace de recuperación:', {
      email,
      resetToken,
    });

    res.json({
      message: 'Se ha enviado un enlace de recuperación a tu email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error.message);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Ruta para restablecer contraseña
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');

    // Verificar que el token no haya expirado y corresponda al usuario
    const user = await usersCollection.findOne({ _id: decoded.userId, resetToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Verificar que el token no haya expirado
    const now = new Date();
    const expires = new Date(user.resetTokenExpires);

    if (now > expires) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    await usersCollection.updateOne(
      { _id: decoded.userId },
      { $set: { password: hashedPassword }, $unset: { resetToken: '', resetTokenExpires: '' } }
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    console.error('Error al restablecer contraseña:', error.message);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Ruta para registrar un nuevo usuario (público)
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validaciones básicas
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  // Validar longitud mínima de contraseña
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Simular registro de usuario
    console.log('Simulando registro de usuario:', {
      name,
      email,
      phone,
    });

    // Devolver respuesta exitosa
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: 'simulated_user_id_123',
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Ruta para crear un nuevo usuario (solo administradores)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, email, phone, password, role = 'user' } = req.body;

  // Validaciones básicas
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  // Validar longitud mínima de contraseña
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Simular creación de usuario
    console.log('Simulando registro de usuario:', {
      name,
      email,
      phone,
      role,
    });

    // Devolver respuesta exitosa
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      userId: 'simulated_user_id_123',
    });
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Intento de inicio de sesión:', { email, password });

  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    // Simular un usuario autenticado (solo para pruebas)
    const user = {
      _id: '123456',
      name: 'Usuario de Prueba',
      email: 'prueba@floresvictoria.com',
      role: 'user',
      password: 'hash_contraseña_simulada', // Contraseña ficticia
    };

    // Simular verificación de credenciales
    if (email !== user.email) {
      console.log('Usuario no encontrado para el email:', email);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Simular verificación de contraseña
    console.log('Verificando contraseña...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Contraseña válida:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const jwtSecret = process.env.JWT_SECRET;
    console.log('JWT_SECRET definida:', !!jwtSecret);
    console.log(
      'Valor de JWT_SECRET (primeros 10 caracteres):',
      jwtSecret ? jwtSecret.substring(0, 10) : 'no definida'
    );

    if (!jwtSecret) {
      console.error('JWT_SECRET no está definida en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Token generado exitosamente');

    // No enviar la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error.message);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Ruta de prueba simple
router.post('/google-login-test-simple', (req, res) => {
  console.log('Endpoint de prueba simple alcanzado');
  res.json({ message: 'OK', received: req.body });
});

// Ruta para iniciar sesión con Google
router.post('/google-login', async (req, res) => {
  try {
    const { googleId, email, name, imageUrl } = req.body;

    // Validaciones básicas
    if (!googleId || !email || !name) {
      return res.status(400).json({
        error: 'Se requieren googleId, email y name para iniciar sesión con Google',
      });
    }

    console.log('Datos recibidos para Google login:', { googleId, email, name, imageUrl });

    // Simular inicio de sesión con Google
    const user = {
      id: '123456',
      name,
      email,
      role: 'user',
      googleId,
      imageUrl,
    };

    // Registrar el inicio de sesión en la tabla de logs (simulado)
    console.log('Simulando registro de inicio de sesión:', {
      user_id: user.id,
      login_method: 'google',
      login_time: new Date().toISOString(),
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    });

    // Generar token JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET no está definida en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    console.log('Generando token JWT...');
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Token generado exitosamente');

    res.json({
      message: 'Inicio de sesión con Google exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        imageUrl,
      },
      token,
    });
  } catch (error) {
    console.error('Error detallado al iniciar sesión con Google:', error);
    res.status(500).json({ error: `Error al iniciar sesión con Google: ${error.message}` });
  }
});

// Ruta de prueba para verificar que el endpoint funciona
router.get('/google-login-test', (req, res) => {
  res.status(200).json({ message: 'Endpoint de Google login accesible' });
});

// Ruta para obtener el perfil del usuario (verificación de token)
router.get('/profile', authenticateToken, (req, res) => {
  const { id, email, name, role } = req.user;

  res.json({
    id,
    email,
    name,
    role,
  });
});

// Ruta para obtener todos los usuarios (solo administradores)
router.get('/', authenticateToken, isAdmin, (req, res) => {
  db.all(`SELECT id, name, email, phone, role, created_at FROM users`, (err, rows) => {
    if (err) {
      console.error('Error al obtener usuarios:', err.message);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    res.json({ users: rows });
  });
});

// Ruta para obtener un usuario específico por ID (solo administradores)
router.get('/:id', authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;

  db.get(`SELECT id, name, email, phone, role FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) {
      console.error('Error al obtener usuario:', err.message);
      return res.status(500).json({ error: 'Error al obtener usuario' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(row);
  });
});

// Ruta para actualizar un usuario (solo administradores)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, password, role } = req.body;

  // Validaciones básicas
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Nombre, email y teléfono son obligatorios' });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  try {
    // Verificar si el usuario existe
    const existingUser = await new Promise((resolve, reject) => {
      db.get(`SELECT id, email FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si se está cambiando el email, verificar que no esté en uso por otro usuario
    if (email !== existingUser.email) {
      const emailInUse = await new Promise((resolve, reject) => {
        db.get(`SELECT id FROM users WHERE email = ? AND id != ?`, [email, userId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      if (emailInUse) {
        return res.status(400).json({ error: 'El email ya está registrado por otro usuario' });
      }
    }

    // Preparar consulta de actualización
    let query = `UPDATE users SET name = ?, email = ?, phone = ?`;
    const params = [name, email, phone];

    // Si se proporciona una nueva contraseña, hashearla y agregarla a la consulta
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      params.push(hashedPassword);
    }

    // Si se proporciona un rol, agregarlo a la consulta
    if (role) {
      query += `, role = ?`;
      params.push(role);
    }

    query += ` WHERE id = ?`;
    params.push(userId);

    // Simular actualización de usuario
    console.log('Simulando actualización de usuario:', {
      userId,
      name,
      email,
      phone,
    });

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Ruta para eliminar un usuario (solo administradores)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;

  // Evitar que un administrador se elimine a sí mismo
  if (userId == req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }

  db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
    if (err) {
      console.error('Error al eliminar usuario:', err.message);
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  });
});

// Endpoint para obtener registros de inicio de sesión (solo para administradores)
router.get('/login-logs', authenticateToken, isAdmin, (req, res) => {
  // Simular obtención de registros de inicio de sesión
  console.log('Simulando obtención de registros de inicio de sesión');

  const mockLogs = [
    {
      id: '1',
      user_id: '123456',
      user_name: 'Usuario de Prueba',
      user_email: 'prueba@floresvictoria.com',
      login_method: 'google',
      login_time: new Date().toISOString(),
      ip_address: '127.0.0.1',
    },
  ];

  const { page = 1, limit = 10 } = req.query;
  const total = mockLogs.length;

  res.json({
    logs: mockLogs,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
});

module.exports = router;
