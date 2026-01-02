/**
 * Pasarelas de Pago Chilenas - Flores Victoria
 * Integración completa con Flow, Khipu y Webpay Plus
 * 
 * Métodos de pago soportados:
 * - Flow: Tarjetas, transferencias, Servipag, Multicaja
 * - Khipu: Transferencias bancarias simplificadas
 * - Webpay Plus: Tarjetas de crédito/débito Transbank
 */

const crypto = require('crypto');
const axios = require('axios');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const PAYMENT_CONFIG = {
    // Flow - https://www.flow.cl
    flow: {
        apiKey: process.env.FLOW_API_KEY,
        secretKey: process.env.FLOW_SECRET_KEY,
        baseUrl: process.env.NODE_ENV === 'production' 
            ? 'https://www.flow.cl/api' 
            : 'https://sandbox.flow.cl/api',
        currency: 'CLP',
        // Métodos de pago Flow
        paymentMethods: {
            WEBPAY: 1,      // Tarjetas crédito/débito
            SERVIPAG: 2,    // Servipag
            MULTICAJA: 3,   // Multicaja
            ALL: 9          // Todos disponibles
        }
    },
    // Khipu - https://khipu.com
    khipu: {
        receiverId: process.env.KHIPU_RECEIVER_ID,
        secretKey: process.env.KHIPU_SECRET_KEY,
        baseUrl: 'https://khipu.com/api/2.0',
        currency: 'CLP'
    },
    // Configuración general
    returnUrl: process.env.PAYMENT_RETURN_URL || 'http://localhost:5173/checkout/result',
    cancelUrl: process.env.PAYMENT_CANCEL_URL || 'http://localhost:5173/checkout/cancel',
    notifyUrl: process.env.PAYMENT_NOTIFY_URL || 'http://localhost:3000/api/payments/webhook'
};

// Estados de pago
const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    PARTIAL_REFUND: 'partial_refund'
};

// ============================================================================
// FLOW PAYMENT SERVICE
// ============================================================================

class FlowPaymentService {
    constructor() {
        this.apiKey = PAYMENT_CONFIG.flow.apiKey;
        this.secretKey = PAYMENT_CONFIG.flow.secretKey;
        this.baseUrl = PAYMENT_CONFIG.flow.baseUrl;
    }

    /**
     * Generar firma para peticiones Flow
     */
    generateSignature(params) {
        // Ordenar parámetros alfabéticamente
        const sortedKeys = Object.keys(params).sort();
        const signString = sortedKeys.map(key => `${key}${params[key]}`).join('');
        
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(signString)
            .digest('hex');
    }

    /**
     * Crear orden de pago en Flow
     */
    async createPayment(paymentData) {
        try {
            const {
                orderId,
                amount,
                email,
                subject,
                paymentMethod = PAYMENT_CONFIG.flow.paymentMethods.ALL,
                optional = {}
            } = paymentData;

            const params = {
                apiKey: this.apiKey,
                commerceOrder: orderId,
                subject: subject || `Flores Victoria - Pedido #${orderId}`,
                currency: PAYMENT_CONFIG.flow.currency,
                amount: Math.round(amount),
                email: email,
                paymentMethod: paymentMethod,
                urlConfirmation: PAYMENT_CONFIG.notifyUrl + '/flow',
                urlReturn: PAYMENT_CONFIG.returnUrl,
                optional: JSON.stringify({
                    ...optional,
                    store: 'Flores Victoria',
                    createdAt: new Date().toISOString()
                })
            };

            params.s = this.generateSignature(params);

            const response = await axios.post(
                `${this.baseUrl}/payment/create`,
                new URLSearchParams(params),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (response.data.url && response.data.token) {
                return {
                    success: true,
                    provider: 'flow',
                    paymentId: response.data.flowOrder.toString(),
                    token: response.data.token,
                    redirectUrl: `${response.data.url}?token=${response.data.token}`,
                    status: PAYMENT_STATUS.PENDING,
                    amount: amount,
                    currency: 'CLP'
                };
            } else {
                throw new Error('Respuesta inválida de Flow');
            }
        } catch (error) {
            console.error('Error creando pago Flow:', error.response?.data || error.message);
            return {
                success: false,
                provider: 'flow',
                error: error.response?.data?.message || error.message,
                code: error.response?.data?.code || 'FLOW_ERROR'
            };
        }
    }

    /**
     * Obtener estado de pago Flow
     */
    async getPaymentStatus(token) {
        try {
            const params = {
                apiKey: this.apiKey,
                token: token
            };
            params.s = this.generateSignature(params);

            const response = await axios.get(`${this.baseUrl}/payment/getStatus`, {
                params
            });

            const data = response.data;
            const statusMap = {
                1: PAYMENT_STATUS.PENDING,
                2: PAYMENT_STATUS.COMPLETED,
                3: PAYMENT_STATUS.FAILED,
                4: PAYMENT_STATUS.CANCELLED
            };

            return {
                success: true,
                provider: 'flow',
                paymentId: data.flowOrder?.toString(),
                commerceOrder: data.commerceOrder,
                status: statusMap[data.status] || PAYMENT_STATUS.PENDING,
                amount: data.amount,
                email: data.payer,
                paymentData: data.paymentData || {},
                rawStatus: data.status
            };
        } catch (error) {
            console.error('Error obteniendo estado Flow:', error.response?.data || error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Procesar reembolso Flow
     */
    async refundPayment(refundData) {
        try {
            const { flowOrder, amount, receiverEmail } = refundData;

            const params = {
                apiKey: this.apiKey,
                refundCommerceOrder: `REF-${flowOrder}-${Date.now()}`,
                receiverEmail: receiverEmail,
                amount: Math.round(amount),
                urlCallBack: PAYMENT_CONFIG.notifyUrl + '/flow/refund'
            };
            params.s = this.generateSignature(params);

            const response = await axios.post(
                `${this.baseUrl}/refund/create`,
                new URLSearchParams(params),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return {
                success: true,
                provider: 'flow',
                refundId: response.data.token,
                status: PAYMENT_STATUS.REFUNDED,
                amount: amount
            };
        } catch (error) {
            console.error('Error en reembolso Flow:', error.response?.data || error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ============================================================================
// KHIPU PAYMENT SERVICE
// ============================================================================

class KhipuPaymentService {
    constructor() {
        this.receiverId = PAYMENT_CONFIG.khipu.receiverId;
        this.secretKey = PAYMENT_CONFIG.khipu.secretKey;
        this.baseUrl = PAYMENT_CONFIG.khipu.baseUrl;
    }

    /**
     * Generar headers de autenticación Khipu
     */
    getAuthHeaders(method, endpoint, body = '') {
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = crypto.randomBytes(16).toString('hex');
        
        const toSign = `${method}&${encodeURIComponent(endpoint)}&${timestamp}&${nonce}`;
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(toSign)
            .digest('hex');

        return {
            'Authorization': `${this.receiverId}:${timestamp}:${nonce}:${signature}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    /**
     * Crear cobro en Khipu
     */
    async createPayment(paymentData) {
        try {
            const {
                orderId,
                amount,
                email,
                subject,
                body = '',
                expirationDate = null,
                notifyUrl = PAYMENT_CONFIG.notifyUrl + '/khipu',
                returnUrl = PAYMENT_CONFIG.returnUrl,
                cancelUrl = PAYMENT_CONFIG.cancelUrl,
                payerName = ''
            } = paymentData;

            const endpoint = `${this.baseUrl}/payments`;
            
            const params = new URLSearchParams({
                subject: subject || `Flores Victoria - Pedido #${orderId}`,
                currency: PAYMENT_CONFIG.khipu.currency,
                amount: Math.round(amount),
                transaction_id: orderId,
                payer_email: email,
                payer_name: payerName,
                body: body,
                notify_url: notifyUrl,
                return_url: returnUrl,
                cancel_url: cancelUrl,
                notify_api_version: '1.3'
            });

            if (expirationDate) {
                params.append('expires_date', expirationDate);
            }

            const response = await axios.post(endpoint, params.toString(), {
                headers: this.getAuthHeaders('POST', endpoint, params.toString())
            });

            const data = response.data;

            return {
                success: true,
                provider: 'khipu',
                paymentId: data.payment_id,
                redirectUrl: data.payment_url,
                simplifiedUrl: data.simplified_transfer_url,
                appUrl: data.app_url,
                status: PAYMENT_STATUS.PENDING,
                amount: amount,
                currency: 'CLP',
                readyForTransfer: data.ready_for_transfer
            };
        } catch (error) {
            console.error('Error creando pago Khipu:', error.response?.data || error.message);
            return {
                success: false,
                provider: 'khipu',
                error: error.response?.data?.message || error.message,
                code: 'KHIPU_ERROR'
            };
        }
    }

    /**
     * Obtener estado de pago Khipu
     */
    async getPaymentStatus(paymentId) {
        try {
            const endpoint = `${this.baseUrl}/payments/${paymentId}`;
            
            const response = await axios.get(endpoint, {
                headers: this.getAuthHeaders('GET', endpoint)
            });

            const data = response.data;
            const statusMap = {
                'pending': PAYMENT_STATUS.PENDING,
                'verifying': PAYMENT_STATUS.PROCESSING,
                'done': PAYMENT_STATUS.COMPLETED
            };

            return {
                success: true,
                provider: 'khipu',
                paymentId: data.payment_id,
                transactionId: data.transaction_id,
                status: statusMap[data.status] || PAYMENT_STATUS.PENDING,
                amount: data.amount,
                currency: data.currency,
                payerEmail: data.payer_email,
                payerName: data.payer_name,
                bank: data.bank,
                bankId: data.bank_id,
                paymentUrl: data.payment_url,
                receiptUrl: data.receipt_url
            };
        } catch (error) {
            console.error('Error obteniendo estado Khipu:', error.response?.data || error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtener lista de bancos disponibles
     */
    async getBanks() {
        try {
            const endpoint = `${this.baseUrl}/banks`;
            
            const response = await axios.get(endpoint, {
                headers: this.getAuthHeaders('GET', endpoint)
            });

            return {
                success: true,
                banks: response.data.banks.map(bank => ({
                    id: bank.bank_id,
                    name: bank.name,
                    message: bank.message,
                    minAmount: bank.min_amount,
                    type: bank.type,
                    parent: bank.parent
                }))
            };
        } catch (error) {
            console.error('Error obteniendo bancos:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Procesar reembolso Khipu
     */
    async refundPayment(paymentId) {
        try {
            const endpoint = `${this.baseUrl}/payments/${paymentId}/refunds`;
            
            const response = await axios.post(endpoint, '', {
                headers: this.getAuthHeaders('POST', endpoint)
            });

            return {
                success: true,
                provider: 'khipu',
                refundId: response.data.refund_id,
                status: PAYMENT_STATUS.REFUNDED
            };
        } catch (error) {
            console.error('Error en reembolso Khipu:', error.response?.data || error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ============================================================================
// UNIFIED PAYMENT SERVICE
// ============================================================================

class ChileanPaymentService {
    constructor() {
        this.flow = new FlowPaymentService();
        this.khipu = new KhipuPaymentService();
        
        // Almacenamiento temporal de pagos (en producción usar DB)
        this.payments = new Map();
    }

    /**
     * Crear pago según el método seleccionado
     */
    async createPayment(provider, paymentData) {
        let result;

        switch (provider.toLowerCase()) {
            case 'flow':
            case 'flow_card':
            case 'flow_servipag':
                result = await this.flow.createPayment({
                    ...paymentData,
                    paymentMethod: provider === 'flow_card' 
                        ? PAYMENT_CONFIG.flow.paymentMethods.WEBPAY
                        : provider === 'flow_servipag'
                            ? PAYMENT_CONFIG.flow.paymentMethods.SERVIPAG
                            : PAYMENT_CONFIG.flow.paymentMethods.ALL
                });
                break;

            case 'khipu':
            case 'transfer':
            case 'bank_transfer':
                result = await this.khipu.createPayment(paymentData);
                break;

            default:
                return {
                    success: false,
                    error: `Proveedor de pago no soportado: ${provider}`,
                    supportedProviders: ['flow', 'flow_card', 'flow_servipag', 'khipu', 'transfer']
                };
        }

        // Guardar referencia del pago
        if (result.success) {
            this.payments.set(result.paymentId, {
                ...result,
                orderId: paymentData.orderId,
                createdAt: new Date()
            });
        }

        return result;
    }

    /**
     * Obtener estado de pago
     */
    async getPaymentStatus(provider, paymentId) {
        switch (provider.toLowerCase()) {
            case 'flow':
                return await this.flow.getPaymentStatus(paymentId);
            case 'khipu':
                return await this.khipu.getPaymentStatus(paymentId);
            default:
                return {
                    success: false,
                    error: 'Proveedor no soportado'
                };
        }
    }

    /**
     * Procesar reembolso
     */
    async refundPayment(provider, refundData) {
        switch (provider.toLowerCase()) {
            case 'flow':
                return await this.flow.refundPayment(refundData);
            case 'khipu':
                return await this.khipu.refundPayment(refundData.paymentId);
            default:
                return {
                    success: false,
                    error: 'Proveedor no soportado para reembolsos'
                };
        }
    }

    /**
     * Procesar webhook de pago
     */
    async processWebhook(provider, webhookData) {
        console.log(`[Webhook ${provider}]`, webhookData);

        let paymentStatus;
        
        switch (provider.toLowerCase()) {
            case 'flow':
                paymentStatus = await this.flow.getPaymentStatus(webhookData.token);
                break;
            case 'khipu':
                paymentStatus = await this.khipu.getPaymentStatus(webhookData.notification_token);
                break;
            default:
                return { success: false, error: 'Proveedor no soportado' };
        }

        if (paymentStatus.success) {
            // Aquí deberías actualizar el estado del pedido en la base de datos
            console.log(`Pago ${paymentStatus.status}:`, paymentStatus);

            // Emitir evento para actualizar el pedido
            return {
                success: true,
                payment: paymentStatus,
                action: paymentStatus.status === PAYMENT_STATUS.COMPLETED 
                    ? 'ORDER_PAID' 
                    : 'PAYMENT_UPDATED'
            };
        }

        return paymentStatus;
    }

    /**
     * Obtener métodos de pago disponibles
     */
    getAvailablePaymentMethods() {
        return [
            {
                id: 'flow_card',
                name: 'Tarjeta de Crédito/Débito',
                description: 'Paga con tu tarjeta bancaria',
                icon: 'credit-card',
                provider: 'flow',
                fees: 'Sin comisión adicional',
                processingTime: 'Inmediato'
            },
            {
                id: 'khipu',
                name: 'Transferencia Bancaria',
                description: 'Paga directo desde tu banco',
                icon: 'bank',
                provider: 'khipu',
                fees: 'Sin comisión',
                processingTime: 'Inmediato',
                popular: true
            },
            {
                id: 'flow_servipag',
                name: 'Servipag',
                description: 'Paga en puntos Servipag',
                icon: 'store',
                provider: 'flow',
                fees: 'Sin comisión',
                processingTime: '1-2 días hábiles'
            },
            {
                id: 'flow',
                name: 'Otros métodos',
                description: 'Multicaja, MACH, y más',
                icon: 'wallet',
                provider: 'flow',
                fees: 'Varía según método',
                processingTime: 'Varía'
            }
        ];
    }

    /**
     * Calcular comisiones por método de pago
     */
    calculateFees(method, amount) {
        // Comisiones aproximadas (varían según contrato)
        const feeStructure = {
            flow_card: { percentage: 2.95, fixed: 0 },      // ~2.95%
            khipu: { percentage: 1.2, fixed: 0 },           // ~1.2%
            flow_servipag: { percentage: 2.0, fixed: 200 }, // ~2% + $200
            flow: { percentage: 2.5, fixed: 0 }             // promedio
        };

        const fees = feeStructure[method] || feeStructure.flow;
        const feeAmount = Math.round((amount * fees.percentage / 100) + fees.fixed);

        return {
            grossAmount: amount,
            feePercentage: fees.percentage,
            feeFixed: fees.fixed,
            feeTotal: feeAmount,
            netAmount: amount - feeAmount
        };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    ChileanPaymentService,
    FlowPaymentService,
    KhipuPaymentService,
    PAYMENT_STATUS,
    PAYMENT_CONFIG
};
