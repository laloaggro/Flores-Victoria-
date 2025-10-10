const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Gestión de la lista de deseos
 */

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Obtiene la lista de deseos del usuario
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de deseos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     wishlist:
 *                       $ref: '#/components/schemas/Wishlist'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateToken, wishlistController.getWishlist);

/**
 * @swagger
 * /api/wishlist/items:
 *   post:
 *     summary: Agrega un item a la lista de deseos
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistItem'
 *     responses:
 *       200:
 *         description: Item agregado a la lista de deseos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Producto agregado a la lista de deseos
 *                 data:
 *                   type: object
 *                   properties:
 *                     wishlist:
 *                       $ref: '#/components/schemas/Wishlist'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/items', authenticateToken, wishlistController.addItem);

/**
 * @swagger
 * /api/wishlist/items/{productId}:
 *   delete:
 *     summary: Elimina un item de la lista de deseos
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado de la lista de deseos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Producto eliminado de la lista de deseos
 *                 data:
 *                   type: object
 *                   properties:
 *                     wishlist:
 *                       $ref: '#/components/schemas/Wishlist'
 *       404:
 *         description: Producto no encontrado en la lista de deseos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/items/:productId', authenticateToken, wishlistController.removeItem);

/**
 * @swagger
 * /api/wishlist:
 *   delete:
 *     summary: Vacía la lista de deseos
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de deseos vaciada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Lista de deseos vaciada
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/', authenticateToken, wishlistController.clearWishlist);

module.exports = router;