const express = require('express');
const router = express.Router();

// Ruta de registro
router.post('/register', (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Usuario registrado exitosamente'
  });
});

// Ruta de inicio de sesión
router.post('/login', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Inicio de sesión exitoso',
    token: 'fake-jwt-token'
  });
});

module.exports = router;