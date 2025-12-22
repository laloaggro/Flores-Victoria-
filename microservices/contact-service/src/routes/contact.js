const express = require('express');
const ContactController = require('../controllers/contactController');
const { authMiddleware, optionalAuth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const contactController = new ContactController();

// Rutas públicas - crear contacto (formulario de contacto público)
router.post('/', optionalAuth, contactController.createContact);

// Rutas protegidas - solo admin puede ver/gestionar contactos
router.get('/', authMiddleware, adminOnly, contactController.getAllContacts);
router.get('/:id', authMiddleware, adminOnly, contactController.getContactById);
router.put('/:id', authMiddleware, adminOnly, contactController.updateContact);
router.delete('/:id', authMiddleware, adminOnly, contactController.deleteContact);

module.exports = router;
