const express = require('express');
const ContactController = require('../controllers/contactController');

const router = express.Router();
const contactController = new ContactController();

// Rutas para contactos
router.post('/', contactController.createContact);
router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContactById);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

// Ruta raíz
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Contacto - Arreglos Victoria',
    version: '1.0.0',
  });
});

module.exports = router;
