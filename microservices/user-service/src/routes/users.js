const express = require('express');
const router = express.Router();
const { client } = require('../config/database');
const { User } = require('../models/User');

// Crear instancia del modelo de usuario
const userModel = new User(client);

// Ruta raíz
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servicio de usuarios en funcionamiento',
    version: '1.0.0'
  });
});

// Ruta de health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servicio de usuarios funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta para obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo usuarios',
      error: error.message
    });
  }
});

// Ruta para obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo usuario',
      error: error.message
    });
  }
});

// Ruta para crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nombre, email y contraseña son requeridos'
      });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'El email ya está registrado'
      });
    }
    
    // Crear usuario
    const userData = { name, email, password, role };
    const user = await userModel.create(userData);
    
    res.status(201).json({
      status: 'success',
      message: 'Usuario creado exitosamente',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creando usuario',
      error: error.message
    });
  }
});

// Ruta para actualizar un usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Validar campos requeridos
    if (!name || !email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nombre y email son requeridos'
      });
    }
    
    // Verificar si el usuario existe
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si el email ya está en uso por otro usuario
    const userWithEmail = await userModel.findByEmail(email);
    if (userWithEmail && userWithEmail.id != id) {
      return res.status(409).json({
        status: 'fail',
        message: 'El email ya está registrado por otro usuario'
      });
    }
    
    // Actualizar usuario
    const userData = { name, email, role };
    const user = await userModel.update(id, userData);
    
    res.status(200).json({
      status: 'success',
      message: 'Usuario actualizado exitosamente',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error actualizando usuario',
      error: error.message
    });
  }
});

// Ruta para eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado'
      });
    }
    
    // Eliminar usuario
    const user = await userModel.delete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Usuario eliminado exitosamente',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error eliminando usuario',
      error: error.message
    });
  }
});

module.exports = router;