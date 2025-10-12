// Rutas para el Notification Service
const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Ruta para enviar notificaciones por email
router.post('/email', (req, res) => {
  notificationController.sendEmailNotification(req, res);
});

// Ruta para verificar el estado del servicio
router.get('/health', (req, res) => {
  notificationController.healthCheck(req, res);
});

module.exports = router;