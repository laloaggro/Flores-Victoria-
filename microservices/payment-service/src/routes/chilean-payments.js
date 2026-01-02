/**
 * Rutas de Pagos Chilenos - Flores Victoria
 * Endpoints para Flow, Khipu y métodos de pago locales
 */

const express = require('express');
const router = express.Router();
const { ChileanPaymentService, PAYMENT_STATUS } = require('../services/chilean-payments.service');

const paymentService = new ChileanPaymentService();

// ============================================================================
// MÉTODOS DE PAGO DISPONIBLES
// ============================================================================

/**
 * GET /api/payments/chile/methods
 * Obtener métodos de pago disponibles
 */
router.get('/methods', (req, res) => {
    try {
        const methods = paymentService.getAvailablePaymentMethods();
        res.json({
            success: true,
            data: methods,
            currency: 'CLP',
            country: 'Chile'
        });
    } catch (error) {
        console.error('Error obteniendo métodos de pago:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métodos de pago'
        });
    }
});

/**
 * POST /api/payments/chile/calculate-fees
 * Calcular comisiones por método de pago
 */
router.post('/calculate-fees', (req, res) => {
    try {
        const { method, amount } = req.body;

        if (!method || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere method y amount'
            });
        }

        const fees = paymentService.calculateFees(method, amount);
        res.json({
            success: true,
            data: fees
        });
    } catch (error) {
        console.error('Error calculando comisiones:', error);
        res.status(500).json({
            success: false,
            error: 'Error calculando comisiones'
        });
    }
});

// ============================================================================
// CREAR PAGOS
// ============================================================================

/**
 * POST /api/payments/chile/create
 * Crear un nuevo pago
 */
router.post('/create', async (req, res) => {
    try {
        const {
            method,
            orderId,
            amount,
            email,
            subject,
            customerName,
            metadata = {}
        } = req.body;

        // Validaciones
        if (!method) {
            return res.status(400).json({
                success: false,
                error: 'Método de pago requerido',
                availableMethods: paymentService.getAvailablePaymentMethods().map(m => m.id)
            });
        }

        if (!orderId || !amount || !email) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos: orderId, amount y email son requeridos'
            });
        }

        if (amount < 350) {
            return res.status(400).json({
                success: false,
                error: 'El monto mínimo es $350 CLP'
            });
        }

        // Crear pago
        const result = await paymentService.createPayment(method, {
            orderId,
            amount,
            email,
            subject: subject || `Flores Victoria - Pedido #${orderId}`,
            payerName: customerName,
            metadata
        });

        if (result.success) {
            res.json({
                success: true,
                data: {
                    paymentId: result.paymentId,
                    redirectUrl: result.redirectUrl,
                    provider: result.provider,
                    status: result.status,
                    amount: result.amount,
                    currency: result.currency
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                code: result.code
            });
        }
    } catch (error) {
        console.error('Error creando pago:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno al procesar el pago'
        });
    }
});

/**
 * POST /api/payments/chile/flow/create
 * Crear pago específico con Flow
 */
router.post('/flow/create', async (req, res) => {
    try {
        const { orderId, amount, email, subject, paymentMethod } = req.body;

        const methodMap = {
            'card': 'flow_card',
            'servipag': 'flow_servipag',
            'all': 'flow'
        };

        const result = await paymentService.createPayment(
            methodMap[paymentMethod] || 'flow',
            { orderId, amount, email, subject }
        );

        res.json(result);
    } catch (error) {
        console.error('Error en pago Flow:', error);
        res.status(500).json({
            success: false,
            error: 'Error procesando pago con Flow'
        });
    }
});

/**
 * POST /api/payments/chile/khipu/create
 * Crear pago específico con Khipu
 */
router.post('/khipu/create', async (req, res) => {
    try {
        const { orderId, amount, email, subject, payerName, body } = req.body;

        const result = await paymentService.createPayment('khipu', {
            orderId,
            amount,
            email,
            subject,
            payerName,
            body
        });

        res.json(result);
    } catch (error) {
        console.error('Error en pago Khipu:', error);
        res.status(500).json({
            success: false,
            error: 'Error procesando pago con Khipu'
        });
    }
});

// ============================================================================
// CONSULTAR ESTADO
// ============================================================================

/**
 * GET /api/payments/chile/status/:provider/:paymentId
 * Obtener estado de un pago
 */
router.get('/status/:provider/:paymentId', async (req, res) => {
    try {
        const { provider, paymentId } = req.params;

        const result = await paymentService.getPaymentStatus(provider, paymentId);
        res.json(result);
    } catch (error) {
        console.error('Error obteniendo estado:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo estado del pago'
        });
    }
});

/**
 * POST /api/payments/chile/verify
 * Verificar pago por orderId (busca en todos los proveedores)
 */
router.post('/verify', async (req, res) => {
    try {
        const { orderId, provider, paymentId, token } = req.body;

        let result;

        if (provider && paymentId) {
            result = await paymentService.getPaymentStatus(provider, paymentId);
        } else if (provider && token) {
            // Para Flow que usa token
            result = await paymentService.getPaymentStatus(provider, token);
        } else {
            return res.status(400).json({
                success: false,
                error: 'Se requiere provider y paymentId/token'
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Error verificando pago:', error);
        res.status(500).json({
            success: false,
            error: 'Error verificando pago'
        });
    }
});

// ============================================================================
// REEMBOLSOS
// ============================================================================

/**
 * POST /api/payments/chile/refund
 * Procesar reembolso
 */
router.post('/refund', async (req, res) => {
    try {
        const { provider, paymentId, flowOrder, amount, receiverEmail, reason } = req.body;

        if (!provider) {
            return res.status(400).json({
                success: false,
                error: 'Proveedor requerido'
            });
        }

        let refundData;
        if (provider === 'flow') {
            refundData = { flowOrder, amount, receiverEmail };
        } else if (provider === 'khipu') {
            refundData = { paymentId };
        }

        const result = await paymentService.refundPayment(provider, refundData);

        if (result.success) {
            // Log del reembolso
            console.log(`Reembolso procesado: ${provider} - ${result.refundId}`, { reason });
        }

        res.json(result);
    } catch (error) {
        console.error('Error en reembolso:', error);
        res.status(500).json({
            success: false,
            error: 'Error procesando reembolso'
        });
    }
});

// ============================================================================
// WEBHOOKS
// ============================================================================

/**
 * POST /api/payments/chile/webhook/flow
 * Webhook para notificaciones de Flow
 */
router.post('/webhook/flow', async (req, res) => {
    try {
        console.log('[Flow Webhook] Datos recibidos:', req.body);

        const { token } = req.body;

        if (!token) {
            return res.status(400).send('Token requerido');
        }

        const result = await paymentService.processWebhook('flow', { token });

        if (result.success && result.action === 'ORDER_PAID') {
            // TODO: Actualizar orden en base de datos
            // TODO: Enviar confirmación por email/WhatsApp
            // TODO: Generar puntos de fidelidad
            console.log('[Flow] Pago completado:', result.payment);
        }

        // Flow espera respuesta vacía con 200
        res.status(200).send('OK');
    } catch (error) {
        console.error('[Flow Webhook] Error:', error);
        res.status(500).send('Error');
    }
});

/**
 * POST /api/payments/chile/webhook/khipu
 * Webhook para notificaciones de Khipu
 */
router.post('/webhook/khipu', async (req, res) => {
    try {
        console.log('[Khipu Webhook] Datos recibidos:', req.body);

        const { notification_token, api_version } = req.body;

        if (!notification_token) {
            return res.status(400).json({ error: 'notification_token requerido' });
        }

        const result = await paymentService.processWebhook('khipu', { notification_token });

        if (result.success && result.action === 'ORDER_PAID') {
            // TODO: Actualizar orden en base de datos
            // TODO: Enviar confirmación por email/WhatsApp
            // TODO: Generar puntos de fidelidad
            console.log('[Khipu] Pago completado:', result.payment);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[Khipu Webhook] Error:', error);
        res.status(500).json({ error: 'Error procesando webhook' });
    }
});

// ============================================================================
// BANCOS (KHIPU)
// ============================================================================

/**
 * GET /api/payments/chile/banks
 * Obtener lista de bancos disponibles para Khipu
 */
router.get('/banks', async (req, res) => {
    try {
        const result = await paymentService.khipu.getBanks();
        res.json(result);
    } catch (error) {
        console.error('Error obteniendo bancos:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo lista de bancos'
        });
    }
});

// ============================================================================
// PÁGINA DE RETORNO
// ============================================================================

/**
 * GET /api/payments/chile/return
 * Página de retorno después del pago
 */
router.get('/return', async (req, res) => {
    try {
        const { token, payment_id, commerceOrder } = req.query;

        let provider, paymentId;

        if (token) {
            // Flow
            provider = 'flow';
            paymentId = token;
        } else if (payment_id) {
            // Khipu
            provider = 'khipu';
            paymentId = payment_id;
        }

        if (!provider || !paymentId) {
            return res.redirect('/checkout/error?reason=invalid_return');
        }

        const status = await paymentService.getPaymentStatus(provider, paymentId);

        if (status.success) {
            const redirectUrl = status.status === PAYMENT_STATUS.COMPLETED
                ? `/checkout/success?orderId=${status.commerceOrder || status.transactionId}`
                : `/checkout/pending?orderId=${status.commerceOrder || status.transactionId}`;
            
            return res.redirect(redirectUrl);
        }

        res.redirect('/checkout/error?reason=status_check_failed');
    } catch (error) {
        console.error('Error en página de retorno:', error);
        res.redirect('/checkout/error?reason=server_error');
    }
});

module.exports = router;
