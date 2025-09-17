const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const router = express.Router();

// Conectar a la base de datos
const dbPath = path.join(__dirname, '..', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos de usuarios:', err.message);
  } else {
    console.log('Conectado a la base de datos de usuarios');
  }
});

// Crear la tabla de usuarios si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reset_token TEXT,
    reset_token_expires DATETIME
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla de usuarios:', err.message);
    } else {
      console.log('Tabla de usuarios verificada o creada');
    }
  });
  
  // Crear un usuario administrador por defecto si no existe ninguno
  db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
    if (!err && row.count === 0) {
      const defaultAdminPassword = 'admin123';
      bcrypt.hash(defaultAdminPassword, 10, (err, hashedPassword) => {
        if (!err) {
          db.run(`INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
            ['Administrador', 'admin@arreglosvictoria.com', '+56963603177', hashedPassword, 'admin'],
            (err) => {
              if (err) {
                console.error('Error al crear usuario administrador:', err.message);
              } else {
                console.log('Usuario administrador creado por defecto');
              }
            }
          );
        }
      });
    }
  });
});

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
    // Verificar si el usuario existe
    const user = await new Promise((resolve, reject) => {
      db.get(`SELECT id, name, email FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({ message: 'Si el email existe, se ha enviado un enlace de recuperación' });
    }
    
    // Generar token de recuperación
    const resetToken = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'secreto_por_defecto', 
      { expiresIn: '1h' }
    );
    
    // Guardar token en la base de datos
    const expires = new Date(Date.now() + 3600000); // 1 hora
    
    await new Promise((resolve, reject) => {
      db.run(`UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?`,
        [resetToken, expires.toISOString(), user.id],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
    
    // Enviar email con enlace de recuperación
    // En un entorno real, aquí se enviaría un email con el enlace
    // Por ahora, solo devolvemos el token para pruebas
    
    res.json({
      message: 'Se ha enviado un enlace de recuperación a tu email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
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
    const user = await new Promise((resolve, reject) => {
      db.get(`SELECT id, reset_token_expires FROM users WHERE id = ? AND reset_token = ?`, 
        [decoded.userId, token], 
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    
    // Verificar que el token no haya expirado
    const now = new Date();
    const expires = new Date(user.reset_token_expires);
    
    if (now > expires) {
      return res.status(400).json({ error: 'Token expirado' });
    }
    
    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña y limpiar token
    await new Promise((resolve, reject) => {
      db.run(`UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?`,
        [hashedPassword, decoded.userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
    
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
    // Verificar si el email ya está registrado
    const existingUser = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insertar nuevo usuario
    const result = await new Promise((resolve, reject) => {
      const stmt = db.prepare(`INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`);
      stmt.run(name, email, phone, hashedPassword, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
      stmt.finalize();
    });
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: result.lastID
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
    // Verificar si el email ya está registrado
    const existingUser = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insertar nuevo usuario
    const result = await new Promise((resolve, reject) => {
      const stmt = db.prepare(`INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`);
      stmt.run(name, email, phone, hashedPassword, role, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
      stmt.finalize();
    });
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      userId: result.lastID
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
    // Buscar usuario por email
    const user = await new Promise((resolve, reject) => {
      db.get(`SELECT id, name, email, phone, password, role FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
          console.error('Error al buscar usuario:', err.message);
          reject(err);
        } else {
          console.log('Usuario encontrado:', row);
          resolve(row);
        }
      });
    });
    
    if (!user) {
      console.log('Usuario no encontrado para el email:', email);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    console.log('Verificando contraseña...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Contraseña válida:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const jwtSecret = process.env.JWT_SECRET;
    console.log('JWT_SECRET definida:', !!jwtSecret);
    console.log('Valor de JWT_SECRET (primeros 10 caracteres):', jwtSecret ? jwtSecret.substring(0, 10) : 'no definida');
    
    if (!jwtSecret) {
      console.error('JWT_SECRET no está definida en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role
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
      token: token
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
        error: 'Se requieren googleId, email y name para iniciar sesión con Google' 
      });
    }
    
    console.log('Datos recibidos para Google login:', { googleId, email, name, imageUrl });
    
    // Buscar usuario por email o googleId
    let user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id, name, email, phone, role FROM users WHERE email = ? OR google_id = ?`, 
        [email, googleId], 
        (err, row) => {
          if (err) {
            console.error('Error al buscar usuario:', err.message);
            reject(err);
          } else {
            console.log('Usuario encontrado:', row);
            resolve(row);
          }
        }
      );
    });
    
    // Si no existe el usuario, crear uno nuevo
    if (!user) {
      console.log('Creando nuevo usuario...');
      const newUser = await new Promise((resolve, reject) => {
        const stmt = db.prepare(
          `INSERT INTO users (name, email, google_id, role, image_url) VALUES (?, ?, ?, ?, ?)`
        );
        
        stmt.run([name, email, googleId, 'user', imageUrl || null], function(err) {
          if (err) {
            console.error('Error al crear usuario:', err.message);
            reject(err);
          } else {
            console.log('Usuario creado con ID:', this.lastID);
            resolve({
              id: this.lastID,
              name,
              email,
              role: 'user'
            });
          }
        });
        
        stmt.finalize();
      });
      
      user = newUser;
    } else if (!user.google_id) {
      // Si el usuario existe pero no tiene google_id, actualizarlo
      console.log('Actualizando usuario existente sin google_id...');
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET google_id = ?, image_url = ? WHERE id = ?`,
          [googleId, imageUrl || null, user.id],
          (err) => {
            if (err) {
              console.error('Error al actualizar google_id:', err.message);
              reject(err);
            } else {
              console.log('google_id actualizado correctamente');
              resolve();
            }
          }
        );
      });
    } else {
      // Si el usuario ya existe y tiene google_id, actualizar su información
      console.log('Actualizando información del usuario existente...');
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET name = ?, email = ?, image_url = ? WHERE id = ?`,
          [name, email, imageUrl || null, user.id],
          (err) => {
            if (err) {
              console.error('Error al actualizar información del usuario:', err.message);
              reject(err);
            } else {
              console.log('Información del usuario actualizada correctamente');
              resolve();
            }
          }
        );
      });
    }
    
    // Registrar el inicio de sesión en la tabla de logs
    await new Promise((resolve, reject) => {
      const stmt = db.prepare(
        `INSERT INTO login_logs (user_id, login_method, login_time, ip_address) VALUES (?, ?, ?, ?)`
      );
      
      // Obtener la IP del cliente
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      stmt.run([user.id || newUser.id, 'google', new Date().toISOString(), ipAddress], function(err) {
        if (err) {
          console.error('Error al registrar login:', err.message);
          reject(err);
        } else {
          console.log('Login registrado con ID:', this.lastID);
          resolve();
        }
      });
      
      stmt.finalize();
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
        role: user.role
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
        imageUrl: imageUrl
      },
      token
    });
  } catch (error) {
    console.error('Error detallado al iniciar sesión con Google:', error);
    res.status(500).json({ error: 'Error al iniciar sesión con Google: ' + error.message });
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
    role
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
    
    // Actualizar usuario
    await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
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
  
  db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
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
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  db.all(`
    SELECT 
      ll.id,
      ll.user_id,
      u.name as user_name,
      u.email as user_email,
      ll.login_method,
      ll.login_time,
      ll.ip_address
    FROM login_logs ll
    JOIN users u ON ll.user_id = u.id
    ORDER BY ll.login_time DESC
    LIMIT ? OFFSET ?
  `, [parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      console.error('Error al obtener registros de login:', err.message);
      return res.status(500).json({ error: 'Error al obtener registros de inicio de sesión' });
    }
    
    // Obtener el total de registros
    db.get('SELECT COUNT(*) as total FROM login_logs', (err, countResult) => {
      if (err) {
        console.error('Error al obtener conteo de registros:', err.message);
        return res.status(500).json({ error: 'Error al obtener conteo de registros' });
      }
      
      res.json({
        logs: rows,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / parseInt(limit))
      });
    });
  });
});

module.exports = router;