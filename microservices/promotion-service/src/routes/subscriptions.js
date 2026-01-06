/**
 * Rutas de Suscripciones - Flores Victoria
 * API endpoints para gestión de suscripciones
 */

const express = require('express');
const router = express.Router();
const {
    SubscriptionService,
    FREQUENCIES,
    SUBSCRIPTION_PLANS
} = require('../services/subscriptions.service');

// Instancia del servicio
const subscriptionService = new SubscriptionService();

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Middleware para validar autenticación (placeholder)
 */
const requireAuth = (req, res, next) => {
    // En producción, validar JWT token
    req.userId = req.headers['x-user-id'] || 'user-demo';
    next();
};

/**
 * Middleware para validar rol admin
 */
const requireAdmin = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin' && userRole !== 'superadmin') {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado - Se requiere rol de administrador'
        });
    }
    next();
};

// ============================================================================
// RUTAS PÚBLICAS - PLANES Y PRECIOS
// ============================================================================

/**
 * GET /subscriptions/plans
 * Obtener todos los planes disponibles
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = subscriptionService.getPlans();
        
        res.json({
            success: true,
            plans,
            frequencies: subscriptionService.getFrequencies(),
            currency: 'CLP'
        });
    } catch (error) {
        console.error('Error obteniendo planes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener planes de suscripción'
        });
    }
});

/**
 * GET /subscriptions/frequencies
 * Obtener frecuencias disponibles
 */
router.get('/frequencies', (req, res) => {
    res.json({
        success: true,
        frequencies: Object.values(FREQUENCIES)
    });
});

/**
 * GET /subscriptions/calculate-price
 * Calcular precio para una combinación plan/frecuencia
 */
router.get('/calculate-price', (req, res) => {
    try {
        const { planId, frequency } = req.query;
        
        if (!planId || !frequency) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere planId y frequency'
            });
        }

        const pricing = subscriptionService.calculatePrice(planId, frequency);
        
        if (!pricing) {
            return res.status(400).json({
                success: false,
                error: 'Plan o frecuencia no válidos'
            });
        }

        res.json({
            success: true,
            pricing,
            formatted: {
                basePrice: `$${pricing.basePrice.toLocaleString('es-CL')}`,
                finalPrice: `$${pricing.finalPrice.toLocaleString('es-CL')}`,
                savings: `$${pricing.discountAmount.toLocaleString('es-CL')} por entrega`,
                monthlySavings: `$${pricing.monthlySavings.toLocaleString('es-CL')}/mes`
            }
        });
    } catch (error) {
        console.error('Error calculando precio:', error);
        res.status(500).json({
            success: false,
            error: 'Error al calcular precio'
        });
    }
});

// ============================================================================
// RUTAS DE USUARIO - GESTIÓN DE SUSCRIPCIONES
// ============================================================================

/**
 * POST /subscriptions
 * Crear nueva suscripción
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        const {
            planId,
            frequency,
            deliveryAddress,
            deliveryInstructions,
            preferredDay,
            preferredTimeSlot,
            giftMessage,
            startDate,
            paymentMethodId
        } = req.body;

        // Validaciones básicas
        if (!planId || !frequency || !deliveryAddress) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere planId, frequency y deliveryAddress'
            });
        }

        if (!deliveryAddress.street || !deliveryAddress.comuna || !deliveryAddress.city) {
            return res.status(400).json({
                success: false,
                error: 'La dirección debe incluir calle, comuna y ciudad'
            });
        }

        const result = await subscriptionService.createSubscription({
            userId: req.userId,
            planId,
            frequency,
            deliveryAddress,
            deliveryInstructions,
            preferredDay,
            preferredTimeSlot,
            giftMessage,
            startDate,
            paymentMethodId
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creando suscripción:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al crear suscripción'
        });
    }
});

/**
 * GET /subscriptions/my
 * Obtener mis suscripciones
 */
router.get('/my', requireAuth, async (req, res) => {
    try {
        const subscriptions = await subscriptionService.getUserSubscriptions(req.userId);
        
        res.json({
            success: true,
            count: subscriptions.length,
            subscriptions
        });
    } catch (error) {
        console.error('Error obteniendo suscripciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener suscripciones'
        });
    }
});

/**
 * GET /subscriptions/:id
 * Obtener detalle de suscripción
 */
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const subscription = await subscriptionService.getSubscription(req.params.id);
        
        // Verificar que pertenece al usuario (o es admin)
        const userRole = req.headers['x-user-role'];
        if (subscription.userId !== req.userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta suscripción'
            });
        }

        res.json({
            success: true,
            subscription
        });
    } catch (error) {
        console.error('Error obteniendo suscripción:', error);
        res.status(404).json({
            success: false,
            error: error.message || 'Suscripción no encontrada'
        });
    }
});

/**
 * PATCH /subscriptions/:id
 * Actualizar suscripción
 */
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const subscription = await subscriptionService.getSubscription(req.params.id);
        
        // Verificar propiedad
        if (subscription.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta suscripción'
            });
        }

        const result = await subscriptionService.updateSubscription(req.params.id, req.body);
        
        res.json(result);
    } catch (error) {
        console.error('Error actualizando suscripción:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al actualizar suscripción'
        });
    }
});

/**
 * POST /subscriptions/:id/pause
 * Pausar suscripción
 */
router.post('/:id/pause', requireAuth, async (req, res) => {
    try {
        const subscription = await subscriptionService.getSubscription(req.params.id);
        
        if (subscription.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta suscripción'
            });
        }

        const result = await subscriptionService.pauseSubscription(
            req.params.id,
            req.body.reason
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error pausando suscripción:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al pausar suscripción'
        });
    }
});

/**
 * POST /subscriptions/:id/resume
 * Reanudar suscripción
 */
router.post('/:id/resume', requireAuth, async (req, res) => {
    try {
        const subscription = await subscriptionService.getSubscription(req.params.id);
        
        if (subscription.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta suscripción'
            });
        }

        const result = await subscriptionService.resumeSubscription(req.params.id);
        
        res.json(result);
    } catch (error) {
        console.error('Error reanudando suscripción:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al reanudar suscripción'
        });
    }
});

/**
 * POST /subscriptions/:id/cancel
 * Cancelar suscripción
 */
router.post('/:id/cancel', requireAuth, async (req, res) => {
    try {
        const subscription = await subscriptionService.getSubscription(req.params.id);
        
        if (subscription.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta suscripción'
            });
        }

        const result = await subscriptionService.cancelSubscription(
            req.params.id,
            req.body.reason
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error cancelando suscripción:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al cancelar suscripción'
        });
    }
});

/**
 * POST /subscriptions/:id/change-plan
 * Cambiar plan
 */
router.post('/:id/change-plan', requireAuth, async (req, res) => {
    try {
        const { planId } = req.body;
        
        if (!planId) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere planId'
            });
        }

        const subscription = await subscriptionService.getSubscription(req.params.id);
        
        if (subscription.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta suscripción'
            });
        }

        const result = await subscriptionService.changePlan(req.params.id, planId);
        
        res.json(result);
    } catch (error) {
        console.error('Error cambiando plan:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al cambiar plan'
        });
    }
});

/**
 * POST /subscriptions/:id/change-frequency
 * Cambiar frecuencia
 */
router.post('/:id/change-frequency', requireAuth, async (req, res) => {
    try {
        const { frequency } = req.body;
        
        if (!frequency) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere frequency'
            });
        }

        const subscription = await subscriptionService.getSubscription(req.params.id);
        
        if (subscription.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta suscripción'
            });
        }

        const result = await subscriptionService.changeFrequency(req.params.id, frequency);
        
        res.json(result);
    } catch (error) {
        console.error('Error cambiando frecuencia:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al cambiar frecuencia'
        });
    }
});

// ============================================================================
// RUTAS DE ENTREGAS
// ============================================================================

/**
 * GET /subscriptions/:id/deliveries
 * Obtener entregas de una suscripción
 */
router.get('/:id/deliveries', requireAuth, async (req, res) => {
    try {
        const subscription = await subscriptionService.getSubscription(req.params.id);
        
        if (subscription.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes acceso a esta suscripción'
            });
        }

        res.json({
            success: true,
            deliveries: subscription.deliveries,
            upcoming: subscription.upcomingDeliveries
        });
    } catch (error) {
        console.error('Error obteniendo entregas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener entregas'
        });
    }
});

/**
 * POST /subscriptions/deliveries/:deliveryId/skip
 * Saltar una entrega
 */
router.post('/deliveries/:deliveryId/skip', requireAuth, async (req, res) => {
    try {
        const result = await subscriptionService.skipDelivery(
            req.params.deliveryId,
            req.body.reason
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error saltando entrega:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al saltar entrega'
        });
    }
});

/**
 * POST /subscriptions/deliveries/:deliveryId/reschedule
 * Reprogramar entrega
 */
router.post('/deliveries/:deliveryId/reschedule', requireAuth, async (req, res) => {
    try {
        const { newDate, newTimeSlot } = req.body;
        
        if (!newDate) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere newDate'
            });
        }

        const result = await subscriptionService.rescheduleDelivery(
            req.params.deliveryId,
            newDate,
            newTimeSlot
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error reprogramando entrega:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al reprogramar entrega'
        });
    }
});

// ============================================================================
// RUTAS ADMIN
// ============================================================================

/**
 * GET /subscriptions/admin/all
 * Obtener todas las suscripciones (admin)
 */
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status, plan, frequency, page = 1, limit = 20 } = req.query;
        
        // Obtener todas las suscripciones (en producción, filtrar desde DB)
        let subscriptions = Array.from(subscriptionService.subscriptions.values());
        
        // Filtrar
        if (status) {
            subscriptions = subscriptions.filter(s => s.status === status);
        }
        if (plan) {
            subscriptions = subscriptions.filter(s => s.planId === plan);
        }
        if (frequency) {
            subscriptions = subscriptions.filter(s => s.frequency === frequency);
        }

        // Paginar
        const startIndex = (page - 1) * limit;
        const paginatedSubs = subscriptions.slice(startIndex, startIndex + Number.parseInt(limit, 10));

        res.json({
            success: true,
            total: subscriptions.length,
            page: Number.parseInt(page, 10),
            limit: Number.parseInt(limit, 10),
            totalPages: Math.ceil(subscriptions.length / limit),
            subscriptions: paginatedSubs
        });
    } catch (error) {
        console.error('Error obteniendo suscripciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener suscripciones'
        });
    }
});

/**
 * GET /subscriptions/admin/stats
 * Estadísticas de suscripciones (admin)
 */
router.get('/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        const stats = await subscriptionService.getSubscriptionStats();
        
        res.json({
            success: true,
            stats,
            formatted: {
                monthlyRevenue: `$${Math.round(stats.revenue.monthly).toLocaleString('es-CL')} CLP`,
                projectedAnnual: `$${Math.round(stats.revenue.projected).toLocaleString('es-CL')} CLP`
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
});

/**
 * POST /subscriptions/admin/deliveries/:deliveryId/complete
 * Marcar entrega como completada (admin)
 */
router.post('/admin/deliveries/:deliveryId/complete', requireAuth, requireAdmin, async (req, res) => {
    try {
        const result = await subscriptionService.completeDelivery(
            req.params.deliveryId,
            req.body
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error completando entrega:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al completar entrega'
        });
    }
});

/**
 * GET /subscriptions/admin/pending-deliveries
 * Obtener entregas pendientes para hoy/mañana (admin)
 */
router.get('/admin/pending-deliveries', requireAuth, requireAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const allDeliveries = Array.from(subscriptionService.deliveries.values());
        
        const todayDeliveries = allDeliveries.filter(d => {
            const date = new Date(d.scheduledDate);
            return date >= today && date < tomorrow && d.status === 'scheduled';
        });

        const tomorrowDeliveries = allDeliveries.filter(d => {
            const date = new Date(d.scheduledDate);
            return date >= tomorrow && date < dayAfter && d.status === 'scheduled';
        });

        res.json({
            success: true,
            today: {
                count: todayDeliveries.length,
                deliveries: todayDeliveries
            },
            tomorrow: {
                count: tomorrowDeliveries.length,
                deliveries: tomorrowDeliveries
            }
        });
    } catch (error) {
        console.error('Error obteniendo entregas pendientes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener entregas pendientes'
        });
    }
});

// ============================================================================
// HEALTHCHECK
// ============================================================================

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'subscriptions',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
