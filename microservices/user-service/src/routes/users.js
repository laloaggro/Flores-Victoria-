const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

// Middleware para inyectar base de datos
let userController;
const setDatabase = (db) => {
  userController = new UserController(db);
};

// Rutas protegidas (requieren autenticación)
router.get('/profile', (req, res) => {
  userController.getProfile(req, res);
});

router.put('/profile', (req, res) => {
  userController.updateProfile(req, res);
});

module.exports = {
  router,
  setDatabase
};