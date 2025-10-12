const express = require('express');
const ContactController = require('../controllers/contactController');

const router = express.Router();
const contactController = new ContactController();

// Rutas para contactos
router.post('/', (req, res, next) => {
  contactController.createContact(req, res, next);
});
router.get('/', (req, res, next) => {
  contactController.getAllContacts(req, res, next);
});
router.get('/:id', (req, res, next) => {
  contactController.getContactById(req, res, next);
});
router.put('/:id', (req, res, next) => {
  contactController.updateContact(req, res, next);
});
router.delete('/:id', (req, res, next) => {
  contactController.deleteContact(req, res, next);
});

// Ruta raíz
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Contacto - Arreglos Victoria',
    version: '1.0.0'
  });
});

module.exports = router;