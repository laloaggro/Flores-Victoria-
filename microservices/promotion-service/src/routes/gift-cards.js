/**
 * Rutas de Tarjetas de Regalo - Flores Victoria
 * API REST para gestión de Gift Cards
 */

const express = require('express');
const router = express.Router();
const { giftCardService } = require('../services/gift-cards.service');

// ============================================================================
// RUTAS PÚBLICAS
// ============================================================================

/**
 * GET /api/gift-cards/designs
 * Obtiene los diseños de tarjetas disponibles
 */
router.get('/designs', (req, res) => {
    try {
        const designs = giftCardService.getDesigns();
        res.json({
            success: true,
            data: designs
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo diseños'
        });
    }
});

/**
 * GET /api/gift-cards/amounts
 * Obtiene los montos predefinidos
 */
router.get('/amounts', (req, res) => {
    try {
        const amounts = giftCardService.getPredefinedAmounts();
        res.json({
            success: true,
            data: amounts
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo montos'
        });
    }
});

/**
 * POST /api/gift-cards/validate
 * Valida una gift card
 */
router.post('/validate', async (req, res) => {
    try {
        const { code, securityPin } = req.body;

        if (!code) {
            return res.status(400).json({
                error: true,
                message: 'Código de gift card requerido'
            });
        }

        const result = await giftCardService.validate(code, securityPin);
        
        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error validando gift card:', error);
        res.status(500).json({
            error: true,
            message: 'Error validando gift card'
        });
    }
});

/**
 * POST /api/gift-cards/check-balance
 * Consulta el balance de una gift card
 */
router.post('/check-balance', async (req, res) => {
    try {
        const { code, securityPin } = req.body;

        if (!code) {
            return res.status(400).json({
                error: true,
                message: 'Código de gift card requerido'
            });
        }

        const result = await giftCardService.checkBalance(code, securityPin);
        
        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error consultando balance'
        });
    }
});

// ============================================================================
// RUTAS DE COMPRA (AUTENTICADAS)
// ============================================================================

/**
 * POST /api/gift-cards
 * Crea una nueva gift card
 */
router.post('/', async (req, res) => {
    try {
        const {
            amount,
            designId,
            recipientName,
            recipientEmail,
            personalMessage,
            deliveryDate,
            deliveryMethod
        } = req.body;

        // Obtener datos del comprador (del token o body)
        const purchaserId = req.user?.id || req.body.purchaserId;
        const purchaserEmail = req.user?.email || req.body.purchaserEmail;
        const purchaserName = req.user?.name || req.body.purchaserName;

        if (!amount) {
            return res.status(400).json({
                error: true,
                message: 'El monto es requerido'
            });
        }

        if (!recipientName || !recipientEmail) {
            return res.status(400).json({
                error: true,
                message: 'Nombre y email del destinatario son requeridos'
            });
        }

        const giftCard = await giftCardService.create({
            amount,
            designId,
            purchaserId,
            purchaserEmail,
            purchaserName,
            recipientName,
            recipientEmail,
            personalMessage,
            deliveryDate,
            deliveryMethod,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(201).json({
            success: true,
            message: 'Gift card creada exitosamente',
            data: giftCard
        });

    } catch (error) {
        console.error('Error creando gift card:', error);
        res.status(400).json({
            error: true,
            message: error.message || 'Error creando gift card'
        });
    }
});

/**
 * POST /api/gift-cards/:id/activate
 * Activa una gift card después del pago
 */
router.post('/:id/activate', async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionId, method } = req.body;

        const giftCard = await giftCardService.activate(id, {
            transactionId,
            method
        });

        res.json({
            success: true,
            message: 'Gift card activada',
            data: {
                id: giftCard.id,
                code: giftCard.code,
                status: giftCard.status
            }
        });

    } catch (error) {
        console.error('Error activando gift card:', error);
        res.status(400).json({
            error: true,
            message: error.message || 'Error activando gift card'
        });
    }
});

/**
 * POST /api/gift-cards/redeem
 * Redime una gift card en una compra
 */
router.post('/redeem', async (req, res) => {
    try {
        const { code, amount, orderId } = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!code || !amount) {
            return res.status(400).json({
                error: true,
                message: 'Código y monto son requeridos'
            });
        }

        const result = await giftCardService.redeem(code, amount, orderId, userId);

        res.json({
            success: true,
            message: `Gift card aplicada: $${result.redeemedAmount.toLocaleString('es-CL')}`,
            data: result
        });

    } catch (error) {
        console.error('Error redimiendo gift card:', error);
        res.status(400).json({
            error: true,
            message: error.message || 'Error aplicando gift card'
        });
    }
});

// ============================================================================
// RUTAS DE USUARIO (MIS GIFT CARDS)
// ============================================================================

/**
 * GET /api/gift-cards/purchased
 * Lista gift cards compradas por el usuario
 */
router.get('/purchased', async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;

        if (!userId) {
            return res.status(401).json({
                error: true,
                message: 'Usuario no autenticado'
            });
        }

        const cards = await giftCardService.getByPurchaser(userId);

        res.json({
            success: true,
            data: cards
        });

    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo gift cards'
        });
    }
});

/**
 * GET /api/gift-cards/received
 * Lista gift cards recibidas por el usuario
 */
router.get('/received', async (req, res) => {
    try {
        const email = req.user?.email || req.query.email;

        if (!email) {
            return res.status(400).json({
                error: true,
                message: 'Email requerido'
            });
        }

        const cards = await giftCardService.getByRecipientEmail(email);

        res.json({
            success: true,
            data: cards
        });

    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo gift cards'
        });
    }
});

/**
 * POST /api/gift-cards/:id/resend
 * Reenvía una gift card
 */
router.post('/:id/resend', async (req, res) => {
    try {
        const { id } = req.params;
        const { newEmail } = req.body;

        await giftCardService.resend(id, newEmail);

        res.json({
            success: true,
            message: 'Gift card reenviada exitosamente'
        });

    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message || 'Error reenviando gift card'
        });
    }
});

// ============================================================================
// RUTAS DE ADMINISTRACIÓN
// ============================================================================

/**
 * GET /api/gift-cards/admin/list
 * Lista todas las gift cards (admin)
 */
router.get('/admin/list', async (req, res) => {
    try {
        const { status, startDate, endDate, page, limit } = req.query;

        const result = await giftCardService.listAll({
            status,
            startDate,
            endDate,
            page: Number.parseInt(page, 10) || 1,
            limit: Number.parseInt(limit, 10) || 20
        });

        res.json({
            success: true,
            data: result.cards,
            pagination: result.pagination
        });

    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error listando gift cards'
        });
    }
});

/**
 * GET /api/gift-cards/admin/stats
 * Obtiene estadísticas de gift cards
 */
router.get('/admin/stats', async (req, res) => {
    try {
        const stats = await giftCardService.getStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo estadísticas'
        });
    }
});

/**
 * GET /api/gift-cards/admin/:id
 * Obtiene detalle de una gift card (admin)
 */
router.get('/admin/:id', async (req, res) => {
    try {
        const giftCard = await giftCardService.getById(req.params.id);

        if (!giftCard) {
            return res.status(404).json({
                error: true,
                message: 'Gift card no encontrada'
            });
        }

        res.json({
            success: true,
            data: giftCard
        });

    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo gift card'
        });
    }
});

/**
 * POST /api/gift-cards/admin/:id/cancel
 * Cancela una gift card
 */
router.post('/admin/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user?.id || 'admin';

        const giftCard = await giftCardService.cancel(id, reason, adminId);

        res.json({
            success: true,
            message: 'Gift card cancelada',
            data: {
                id: giftCard.id,
                code: giftCard.code,
                status: giftCard.status,
                refundable: giftCard.cancellation.refundable
            }
        });

    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message || 'Error cancelando gift card'
        });
    }
});

/**
 * POST /api/gift-cards/admin/:id/adjust
 * Ajusta el balance de una gift card
 */
router.post('/admin/:id/adjust', async (req, res) => {
    try {
        const { id } = req.params;
        const { newBalance, reason } = req.body;
        const adminId = req.user?.id || 'admin';

        if (newBalance === undefined || newBalance < 0) {
            return res.status(400).json({
                error: true,
                message: 'Nuevo balance inválido'
            });
        }

        const giftCard = await giftCardService.adjustBalance(id, newBalance, reason, adminId);

        res.json({
            success: true,
            message: 'Balance ajustado',
            data: {
                id: giftCard.id,
                code: giftCard.code,
                balance: giftCard.balance
            }
        });

    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message || 'Error ajustando balance'
        });
    }
});

module.exports = router;
