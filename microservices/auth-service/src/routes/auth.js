const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validar datos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nombre, email y contraseña son requeridos'
      });
    }
    
    // Verificar si el usuario ya existe
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Error interno del servidor'
        });
      }
      
      if (row) {
        return res.status(400).json({
          status: 'fail',
          message: 'El email ya está registrado'
        });
      }
      
      // Hashear contraseña
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
          });
        }
        
        // Crear usuario
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
          [name, email, hashedPassword], 
          function(err) {
            if (err) {
              return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
              });
            }
            
            // Generar token
            const token = jwt.sign(
              { id: this.lastID, email, name },
              process.env.JWT_SECRET || 'my_secret_key',
              { expiresIn: '24h' }
            );
            
            res.status(201).json({
              status: 'success',
              token,
              data: {
                user: {
                  id: this.lastID,
                  name,
                  email
                }
              }
            });
          }
        );
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email y contraseña son requeridos'
      });
    }
    
    // Buscar usuario
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Error interno del servidor'
        });
      }
      
      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Credenciales inválidas'
        });
      }
      
      // Comparar contraseñas
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
          });
        }
        
        if (!isMatch) {
          return res.status(401).json({
            status: 'fail',
            message: 'Credenciales inválidas'
          });
        }
        
        // Generar token
        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          process.env.JWT_SECRET || 'my_secret_key',
          { expiresIn: '24h' }
        );
        
        res.status(200).json({
          status: 'success',
          token,
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;