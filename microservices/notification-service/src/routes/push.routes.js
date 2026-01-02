/**
 * Rutas de Notificaciones Push - Flores Victoria
 * API REST para gestión de push notifications
 */

const express = require('express');
const router = express.Router();
const { pushService } = require('../services/push-notification.service');

// ============================================================================
// REGISTRO DE DISPOSITIVOS
// ============================================================================

/**
 * POST /api/notifications/push/register
 * Registra un token de dispositivo para notificaciones push
 */
router.post('/register', async (req, res) => {
    try {
        const { userId, token, deviceInfo } = req.body;

        if (!userId || !token) {
            return res.status(400).json({
                error: true,
                message: 'userId y token son requeridos'
            });
        }

        const result = await pushService.registerToken(userId, token, deviceInfo);

        res.json({
            success: true,
            message: 'Dispositivo registrado exitosamente',
            data: result
        });

    } catch (error) {
        console.error('Error registrando dispositivo:', error);
        res.status(500).json({
            error: true,
            message: 'Error al registrar dispositivo'
        });
    }
});

/**
 * DELETE /api/notifications/push/unregister
 * Elimina un token de dispositivo
 */
router.delete('/unregister', async (req, res) => {
    try {
        const { userId, token } = req.body;

        if (!userId || !token) {
            return res.status(400).json({
                error: true,
                message: 'userId y token son requeridos'
            });
        }

        await pushService.unregisterToken(userId, token);

        res.json({
            success: true,
            message: 'Dispositivo eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando dispositivo:', error);
        res.status(500).json({
            error: true,
            message: 'Error al eliminar dispositivo'
        });
    }
});

// ============================================================================
// ENVÍO DE NOTIFICACIONES
// ============================================================================

/**
 * POST /api/notifications/push/send
 * Envía una notificación push a un usuario
 */
router.post('/send', async (req, res) => {
    try {
        const { userId, templateKey, data } = req.body;

        if (!userId || !templateKey) {
            return res.status(400).json({
                error: true,
                message: 'userId y templateKey son requeridos'
            });
        }

        const result = await pushService.sendToUser(userId, templateKey, data);

        res.json({
            success: result.success,
            message: result.success ? 'Notificación enviada' : 'No se pudo enviar',
            data: result
        });

    } catch (error) {
        console.error('Error enviando notificación:', error);
        res.status(500).json({
            error: true,
            message: error.message || 'Error al enviar notificación'
        });
    }
});

/**
 * POST /api/notifications/push/send-batch
 * Envía notificaciones a múltiples usuarios
 */
router.post('/send-batch', async (req, res) => {
    try {
        const { userIds, templateKey, data } = req.body;

        if (!userIds || !Array.isArray(userIds) || !templateKey) {
            return res.status(400).json({
                error: true,
                message: 'userIds (array) y templateKey son requeridos'
            });
        }

        const result = await pushService.sendToUsers(userIds, templateKey, data);

        res.json({
            success: true,
            message: `Notificaciones enviadas a ${result.successUsers}/${result.totalUsers} usuarios`,
            data: result
        });

    } catch (error) {
        console.error('Error enviando batch:', error);
        res.status(500).json({
            error: true,
            message: error.message || 'Error al enviar notificaciones'
        });
    }
});

/**
 * POST /api/notifications/push/broadcast
 * Envía una notificación a todos los usuarios registrados
 */
router.post('/broadcast', async (req, res) => {
    try {
        const { templateKey, data, filters } = req.body;

        if (!templateKey) {
            return res.status(400).json({
                error: true,
                message: 'templateKey es requerido'
            });
        }

        const result = await pushService.broadcast(templateKey, data, filters);

        res.json({
            success: true,
            message: `Broadcast enviado a ${result.successUsers} usuarios`,
            data: result
        });

    } catch (error) {
        console.error('Error en broadcast:', error);
        res.status(500).json({
            error: true,
            message: error.message || 'Error en broadcast'
        });
    }
});

/**
 * POST /api/notifications/push/custom
 * Envía una notificación personalizada
 */
router.post('/custom', async (req, res) => {
    try {
        const { userId, title, body, options } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({
                error: true,
                message: 'userId, title y body son requeridos'
            });
        }

        const notification = pushService.createCustomNotification(title, body, options);
        const tokens = pushService.getTokensForUser(userId);

        if (tokens.length === 0) {
            return res.json({
                success: false,
                message: 'Usuario sin dispositivos registrados'
            });
        }

        const results = await Promise.all(
            tokens.map(token => pushService.sendToDevice(token, notification, options?.data || {}))
        );

        const successCount = results.filter(r => r.success).length;

        res.json({
            success: successCount > 0,
            message: `Notificación enviada a ${successCount}/${tokens.length} dispositivos`,
            data: { sent: successCount, failed: tokens.length - successCount }
        });

    } catch (error) {
        console.error('Error enviando notificación custom:', error);
        res.status(500).json({
            error: true,
            message: error.message || 'Error al enviar notificación'
        });
    }
});

// ============================================================================
// NOTIFICACIONES ESPECÍFICAS
// ============================================================================

/**
 * POST /api/notifications/push/order
 * Notifica sobre estado de pedido
 */
router.post('/order', async (req, res) => {
    try {
        const { userId, orderId, status, details } = req.body;

        if (!userId || !orderId || !status) {
            return res.status(400).json({
                error: true,
                message: 'userId, orderId y status son requeridos'
            });
        }

        const result = await pushService.notifyOrderStatus(userId, orderId, status, details);

        res.json({
            success: result.success,
            message: result.success ? 'Notificación de pedido enviada' : 'No se pudo notificar',
            data: result
        });

    } catch (error) {
        console.error('Error notificando pedido:', error);
        res.status(500).json({
            error: true,
            message: 'Error al notificar pedido'
        });
    }
});

/**
 * POST /api/notifications/push/cart-abandoned
 * Notifica sobre carrito abandonado
 */
router.post('/cart-abandoned', async (req, res) => {
    try {
        const { userId, cartDetails } = req.body;

        if (!userId || !cartDetails) {
            return res.status(400).json({
                error: true,
                message: 'userId y cartDetails son requeridos'
            });
        }

        const result = await pushService.notifyAbandonedCart(userId, cartDetails);

        res.json({
            success: result.success,
            data: result
        });

    } catch (error) {
        console.error('Error notificando carrito:', error);
        res.status(500).json({
            error: true,
            message: 'Error al notificar carrito abandonado'
        });
    }
});

/**
 * POST /api/notifications/push/promotion
 * Notifica sobre promoción
 */
router.post('/promotion', async (req, res) => {
    try {
        const { userIds, promotion } = req.body;

        if (!userIds || !promotion) {
            return res.status(400).json({
                error: true,
                message: 'userIds y promotion son requeridos'
            });
        }

        const result = await pushService.notifyPromotion(userIds, promotion);

        res.json({
            success: true,
            message: `Promoción notificada a ${result.successUsers} usuarios`,
            data: result
        });

    } catch (error) {
        console.error('Error notificando promoción:', error);
        res.status(500).json({
            error: true,
            message: 'Error al notificar promoción'
        });
    }
});

/**
 * POST /api/notifications/push/points
 * Notifica sobre puntos ganados
 */
router.post('/points', async (req, res) => {
    try {
        const { userId, points, totalPoints } = req.body;

        if (!userId || points === undefined) {
            return res.status(400).json({
                error: true,
                message: 'userId y points son requeridos'
            });
        }

        const result = await pushService.notifyPointsEarned(userId, points, totalPoints);

        res.json({
            success: result.success,
            data: result
        });

    } catch (error) {
        console.error('Error notificando puntos:', error);
        res.status(500).json({
            error: true,
            message: 'Error al notificar puntos'
        });
    }
});

/**
 * POST /api/notifications/push/subscription
 * Notifica sobre entrega de suscripción
 */
router.post('/subscription', async (req, res) => {
    try {
        const { userId, subscriptionId, deliveryDate } = req.body;

        if (!userId || !subscriptionId || !deliveryDate) {
            return res.status(400).json({
                error: true,
                message: 'userId, subscriptionId y deliveryDate son requeridos'
            });
        }

        const result = await pushService.notifySubscriptionDelivery(userId, subscriptionId, deliveryDate);

        res.json({
            success: result.success,
            data: result
        });

    } catch (error) {
        console.error('Error notificando suscripción:', error);
        res.status(500).json({
            error: true,
            message: 'Error al notificar suscripción'
        });
    }
});

// ============================================================================
// ESTADÍSTICAS Y TEMPLATES
// ============================================================================

/**
 * GET /api/notifications/push/stats
 * Obtiene estadísticas de push notifications
 */
router.get('/stats', (req, res) => {
    try {
        const stats = pushService.getStats();
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
 * GET /api/notifications/push/templates
 * Lista todas las plantillas disponibles
 */
router.get('/templates', (req, res) => {
    try {
        const templates = Object.entries(pushService.templates).map(([key, template]) => ({
            key,
            title: template.title,
            body: template.body,
            type: template.data?.type
        }));

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo plantillas'
        });
    }
});

/**
 * POST /api/notifications/push/test
 * Envía una notificación de prueba
 */
router.post('/test', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: true,
                message: 'token es requerido'
            });
        }

        const notification = pushService.createCustomNotification(
            '🔔 Notificación de Prueba',
            '¡Las notificaciones push están funcionando correctamente!',
            {
                icon: '/icons/test.png',
                data: { type: 'test', timestamp: new Date().toISOString() }
            }
        );

        const result = await pushService.sendToDevice(token, notification);

        res.json({
            success: result.success,
            message: result.success ? 'Notificación de prueba enviada' : 'Error en la prueba',
            data: result
        });

    } catch (error) {
        console.error('Error en prueba:', error);
        res.status(500).json({
            error: true,
            message: 'Error en prueba de notificación'
        });
    }
});

module.exports = router;
