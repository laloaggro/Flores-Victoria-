const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
// Corrigiendo las rutas de importación de los módulos compartidos
const { initTracer, createChildSpan } = require('/shared/tracing/index.js');
const { createLogger } = require('@flores-victoria/logging');
const { db } = require('../config/database');

const logger = createLogger('auth-service');

// Helper function to query database with promises
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Ruta de registro
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  // Crear un span hijo para la operación de registro
  const registerSpan = createChildSpan(req.span, 'register_user');
  registerSpan.setTag('user.email', email);
  
  try {
    // Validar que los campos no estén vacíos
    if (!name || !email || !password) {
      registerSpan.setTag('error', true);
      registerSpan.log({ 'event': 'error', 'message': 'Missing fields' });
      registerSpan.finish();
      
      return res.status(400).json({
        status: 'fail',
        message: 'Todos los campos son requeridos'
      });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      registerSpan.setTag('error', true);
      registerSpan.log({ 'event': 'error', 'message': 'User already exists' });
      registerSpan.finish();
      
      return res.status(409).json({
        status: 'fail',
        message: 'El usuario ya existe'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear nuevo usuario
    const result = await dbRun(
      'INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [name, email, hashedPassword, 'user']
    );
    
    // Log de éxito
    registerSpan.log({ 'event': 'user_registered', 'user.id': result.lastID });
    registerSpan.finish();
    
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: {
        id: result.lastID,
        name: name,
        email: email
      }
    });
  } catch (error) {
    registerSpan.setTag('error', true);
    registerSpan.log({ 'event': 'error', 'message': error.message });
    registerSpan.finish();
    
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Crear un span hijo para la operación de login
  const loginSpan = createChildSpan(req.span, 'login_user');
  loginSpan.setTag('user.email', email);
  
  try {
    // Validar que los campos no estén vacíos
    if (!email || !password) {
      loginSpan.setTag('error', true);
      loginSpan.log({ 'event': 'error', 'message': 'Missing fields' });
      loginSpan.finish();
      
      return res.status(400).json({
        status: 'fail',
        message: 'Email y contraseña son requeridos'
      });
    }
    
    // Buscar usuario en la base de datos
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      loginSpan.setTag('error', true);
      loginSpan.log({ 'event': 'error', 'message': 'Invalid credentials' });
      loginSpan.finish();
      
      return res.status(401).json({
        status: 'fail',
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      loginSpan.setTag('error', true);
      loginSpan.log({ 'event': 'error', 'message': 'Invalid credentials' });
      loginSpan.finish();
      
      return res.status(401).json({
        status: 'fail',
        message: 'Credenciales inválidas'
      });
    }
    
    // Log de éxito
    loginSpan.log({ 'event': 'user_logged_in', 'user.id': user.id });
    loginSpan.finish();
    
    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: {
        token: `simple_token_${user.id}_${Date.now()}`, // Token simple para desarrollo
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role || 'user'
        }
      }
    });
  } catch (error) {
    loginSpan.setTag('error', true);
    loginSpan.log({ 'event': 'error', 'message': error.message });
    loginSpan.finish();
    
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint de perfil (DEV): extrae el id del token simple y devuelve el usuario
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Falta token' });
    }
    // Formato esperado: simple_token_<id>_<timestamp>
    const match = token.match(/^simple_token_(\d+)_/);
    if (!match) {
      return res.status(401).json({ status: 'fail', message: 'Token inválido' });
    }
    const userId = parseInt(match[1], 10);
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
    }
    return res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role || 'user'
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Error interno' });
  }
});

module.exports = router;