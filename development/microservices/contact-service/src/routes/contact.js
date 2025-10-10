/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Gestión de contactos
 */
const express = require('express');
const ContactController = require('../controllers/contactController');

const router = express.Router();
const contactController = new ContactController();

// Rutas para contactos
/**
 * @swagger
 * /api/contact:
 *  post:
 *    summary: Crea un nuevo contacto
 *    tags: [Contact]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Contact'
 *    responses:
 *      200:
 *        description: Contacto creado exitosamente
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Contact'
 */
router.post('/', contactController.createContact);

/**
 * @swagger
 * /api/contact:
 *  get:
 *    summary: Obtiene todos los contactos
 *    tags: [Contact]
 *    responses:
 *      200:
 *        description: Lista de contactos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Contact'
 */
router.get('/', contactController.getAllContacts);

/**
 * @swagger
 * /api/contact/{id}:
 *  get:
 *    summary: Obtiene un contacto por ID
 *    tags: [Contact]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID del contacto
 *    responses:
 *      200:
 *        description: Información del contacto
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Contact'
 *      404:
 *        description: Contacto no encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', contactController.getContactById);

/**
 * @swagger
 * /api/contact/{id}:
 *  put:
 *    summary: Actualiza un contacto
 *    tags: [Contact]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID del contacto
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Contact'
 *    responses:
 *      200:
 *        description: Contacto actualizado exitosamente
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Contact'
 *      404:
 *        description: Contacto no encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', contactController.updateContact);

/**
 * @swagger
 * /api/contact/{id}:
 *  delete:
 *    summary: Elimina un contacto
 *    tags: [Contact]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID del contacto
 *    responses:
 *      200:
 *        description: Contacto eliminado exitosamente
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SuccessResponse'
 *      404:
 *        description: Contacto no encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', contactController.deleteContact);

/**
 * @swagger
 * /api/contact/status:
 *  get:
 *    summary: Obtiene el estado del servicio
 *    tags: [Contact]
 *    responses:
 *      200:
 *        description: Estado del servicio
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                message:
 *                  type: string
 *                version:
 *                  type: string
 *              example:
 *                status: success
 *                message: Servicio de Contacto - Arreglos Victoria
 *                version: 1.0.0
 */
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Contacto - Arreglos Victoria',
    version: '1.0.0'
  });
});

module.exports = router;