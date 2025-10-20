const express = require('express');
const router = express.Router();
// Corrigiendo las rutas de importación de los módulos compartidos
const { initTracer } = require('/shared/tracing/index.js');
const { middleware: traceMiddleware } = require('/shared/tracing/index.js');
const { createLogger } = require('@flores-victoria/logging');

const logger = createLogger('auth-service');

// Simulación de base de datos de usuarios
let users = [
  { id: 1, email: 'admin@arreglosvictoria.com', password: 'admin123', name: 'Administrador' },
  { id: 2, email: 'test@example.com', password: 'test123', name: 'Usuario de Prueba' }
];

// Ruta de registro
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Crear un span hijo para la operación de registro
  const registerSpan = middleware.createChildSpan(req.span, 'register_user');
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
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      registerSpan.setTag('error', true);
      registerSpan.log({ 'event': 'error', 'message': 'User already exists' });
      registerSpan.finish();
      
      return res.status(409).json({
        status: 'fail',
        message: 'El usuario ya existe'
      });
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password // En una implementación real, la contraseña debería estar hasheada
    };
    
    users.push(newUser);
    
    // Log de éxito
    registerSpan.log({ 'event': 'user_registered', 'user.id': newUser.id });
    registerSpan.finish();
    
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
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
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Crear un span hijo para la operación de login
  const loginSpan = middleware.createChildSpan(req.span, 'login_user');
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
    
    // Buscar usuario
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
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
        id: user.id,
        name: user.name,
        email: user.email
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

module.exports = router;