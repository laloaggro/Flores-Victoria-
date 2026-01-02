/**
 * Servicio de Suscripciones - Flores Victoria
 * Sistema de entregas recurrentes de flores
 */

const { v4: uuidv4 } = require('uuid');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const SUBSCRIPTION_CONFIG = {
    currency: 'CLP',
    locale: 'es-CL',
    timezone: 'America/Santiago',
    gracePeriodDays: 3, // Días de gracia para pagos fallidos
    maxRetries: 3, // Intentos de cobro
    reminderDaysBefore: 2 // Días antes de la entrega para recordar
};

// Frecuencias disponibles
const FREQUENCIES = {
    WEEKLY: {
        id: 'weekly',
        name: 'Semanal',
        daysInterval: 7,
        discount: 15, // 15% descuento
        description: 'Recibe flores frescas cada semana'
    },
    BIWEEKLY: {
        id: 'biweekly',
        name: 'Quincenal',
        daysInterval: 14,
        discount: 10, // 10% descuento
        description: 'Flores nuevas cada dos semanas'
    },
    MONTHLY: {
        id: 'monthly',
        name: 'Mensual',
        daysInterval: 30,
        discount: 5, // 5% descuento
        description: 'Entrega mensual de flores'
    }
};

// Estados de suscripción
const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    PENDING_PAYMENT: 'pending_payment',
    PAYMENT_FAILED: 'payment_failed',
    EXPIRED: 'expired'
};

// Estados de entrega
const DELIVERY_STATUS = {
    SCHEDULED: 'scheduled',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    RESCHEDULED: 'rescheduled',
    SKIPPED: 'skipped'
};

// Planes de suscripción predefinidos
const SUBSCRIPTION_PLANS = [
    {
        id: 'plan-basico',
        name: 'Plan Básico',
        description: 'Ramo de flores de temporada',
        basePrice: 25000,
        products: ['flores-temporada'],
        features: ['Ramo mediano', 'Flores frescas', 'Tarjeta personalizada'],
        popular: false
    },
    {
        id: 'plan-premium',
        name: 'Plan Premium',
        description: 'Arreglo floral premium con variedad',
        basePrice: 45000,
        products: ['arreglo-premium'],
        features: ['Arreglo grande', 'Flores premium', 'Florero incluido', 'Tarjeta personalizada'],
        popular: true
    },
    {
        id: 'plan-corporativo',
        name: 'Plan Corporativo',
        description: 'Arreglos para oficinas y empresas',
        basePrice: 65000,
        products: ['arreglo-corporativo'],
        features: ['2 arreglos medianos', 'Rotación de estilos', 'Factura empresa', 'Instalación incluida'],
        popular: false
    },
    {
        id: 'plan-romantico',
        name: 'Plan Romántico',
        description: 'Rosas y flores románticas',
        basePrice: 38000,
        products: ['rosas-mix'],
        features: ['Rosas premium', 'Chocolates opcionales', 'Mensaje personalizado', 'Packaging especial'],
        popular: false
    }
];

// ============================================================================
// SERVICIO DE SUSCRIPCIONES
// ============================================================================

class SubscriptionService {
    constructor() {
        // En producción, estos datos estarían en la base de datos
        this.subscriptions = new Map();
        this.deliveries = new Map();
        this.paymentHistory = new Map();
    }

    // ========================================================================
    // GESTIÓN DE SUSCRIPCIONES
    // ========================================================================

    /**
     * Crear nueva suscripción
     */
    async createSubscription(data) {
        const {
            userId,
            planId,
            frequency,
            deliveryAddress,
            deliveryInstructions,
            preferredDay, // 0-6 (domingo-sábado)
            preferredTimeSlot, // 'morning', 'afternoon', 'evening'
            giftMessage,
            startDate,
            paymentMethodId
        } = data;

        // Validar plan
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) {
            throw new Error('Plan de suscripción no válido');
        }

        // Validar frecuencia
        const freq = FREQUENCIES[frequency.toUpperCase()];
        if (!freq) {
            throw new Error('Frecuencia no válida');
        }

        // Calcular precio con descuento
        const discountAmount = Math.round(plan.basePrice * freq.discount / 100);
        const finalPrice = plan.basePrice - discountAmount;

        // Calcular próxima fecha de entrega
        const nextDeliveryDate = this.calculateNextDeliveryDate(
            startDate ? new Date(startDate) : new Date(),
            preferredDay
        );

        const subscription = {
            id: `sub-${uuidv4()}`,
            userId,
            planId,
            planName: plan.name,
            frequency: freq.id,
            frequencyName: freq.name,
            basePrice: plan.basePrice,
            discount: freq.discount,
            discountAmount,
            finalPrice,
            deliveryAddress,
            deliveryInstructions: deliveryInstructions || '',
            preferredDay: preferredDay ?? 6, // Sábado por defecto
            preferredTimeSlot: preferredTimeSlot || 'morning',
            giftMessage: giftMessage || '',
            paymentMethodId,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            nextDeliveryDate,
            nextBillingDate: new Date(nextDeliveryDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 días antes
            deliveriesCompleted: 0,
            totalSpent: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            pausedAt: null,
            cancelledAt: null,
            cancellationReason: null
        };

        this.subscriptions.set(subscription.id, subscription);

        // Programar primera entrega
        await this.scheduleDelivery(subscription.id);

        return {
            success: true,
            subscription,
            message: `Suscripción ${plan.name} (${freq.name}) creada exitosamente`,
            nextDelivery: nextDeliveryDate,
            savings: {
                perDelivery: discountAmount,
                monthly: this.calculateMonthlySavings(discountAmount, freq.daysInterval)
            }
        };
    }

    /**
     * Obtener suscripción por ID
     */
    async getSubscription(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error('Suscripción no encontrada');
        }

        // Obtener entregas asociadas
        const deliveries = this.getDeliveriesForSubscription(subscriptionId);

        return {
            ...subscription,
            deliveries: deliveries.slice(0, 10), // Últimas 10 entregas
            upcomingDeliveries: this.getUpcomingDeliveries(subscriptionId)
        };
    }

    /**
     * Obtener suscripciones de un usuario
     */
    async getUserSubscriptions(userId) {
        const userSubs = Array.from(this.subscriptions.values())
            .filter(sub => sub.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return userSubs.map(sub => ({
            ...sub,
            nextDeliveryFormatted: this.formatDate(sub.nextDeliveryDate),
            statusLabel: this.getStatusLabel(sub.status)
        }));
    }

    /**
     * Pausar suscripción
     */
    async pauseSubscription(subscriptionId, reason = '') {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error('Suscripción no encontrada');
        }

        if (subscription.status === SUBSCRIPTION_STATUS.CANCELLED) {
            throw new Error('No se puede pausar una suscripción cancelada');
        }

        subscription.status = SUBSCRIPTION_STATUS.PAUSED;
        subscription.pausedAt = new Date();
        subscription.pauseReason = reason;
        subscription.updatedAt = new Date();

        // Cancelar entregas programadas
        await this.cancelScheduledDeliveries(subscriptionId);

        return {
            success: true,
            message: 'Suscripción pausada',
            subscription
        };
    }

    /**
     * Reanudar suscripción
     */
    async resumeSubscription(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error('Suscripción no encontrada');
        }

        if (subscription.status !== SUBSCRIPTION_STATUS.PAUSED) {
            throw new Error('Solo se pueden reanudar suscripciones pausadas');
        }

        // Calcular nueva fecha de entrega
        const freq = Object.values(FREQUENCIES).find(f => f.id === subscription.frequency);
        subscription.nextDeliveryDate = this.calculateNextDeliveryDate(
            new Date(),
            subscription.preferredDay
        );
        subscription.nextBillingDate = new Date(
            subscription.nextDeliveryDate.getTime() - 2 * 24 * 60 * 60 * 1000
        );
        subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
        subscription.pausedAt = null;
        subscription.pauseReason = null;
        subscription.updatedAt = new Date();

        // Programar próxima entrega
        await this.scheduleDelivery(subscriptionId);

        return {
            success: true,
            message: 'Suscripción reanudada',
            subscription,
            nextDelivery: subscription.nextDeliveryDate
        };
    }

    /**
     * Cancelar suscripción
     */
    async cancelSubscription(subscriptionId, reason = '') {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error('Suscripción no encontrada');
        }

        subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
        subscription.cancelledAt = new Date();
        subscription.cancellationReason = reason;
        subscription.updatedAt = new Date();

        // Cancelar entregas programadas
        await this.cancelScheduledDeliveries(subscriptionId);

        return {
            success: true,
            message: 'Suscripción cancelada',
            subscription,
            feedback: {
                question: '¿Por qué decidiste cancelar?',
                options: [
                    'Muy caro',
                    'No me gustó la calidad',
                    'Prefiero comprar ocasionalmente',
                    'Cambié de dirección',
                    'Otro'
                ]
            }
        };
    }

    /**
     * Actualizar suscripción
     */
    async updateSubscription(subscriptionId, updates) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error('Suscripción no encontrada');
        }

        const allowedUpdates = [
            'deliveryAddress',
            'deliveryInstructions',
            'preferredDay',
            'preferredTimeSlot',
            'giftMessage',
            'paymentMethodId'
        ];

        const changes = {};
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                changes[field] = updates[field];
                subscription[field] = updates[field];
            }
        });

        // Si cambió el plan
        if (updates.planId && updates.planId !== subscription.planId) {
            const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === updates.planId);
            if (newPlan) {
                const freq = Object.values(FREQUENCIES).find(f => f.id === subscription.frequency);
                subscription.planId = newPlan.id;
                subscription.planName = newPlan.name;
                subscription.basePrice = newPlan.basePrice;
                subscription.discountAmount = Math.round(newPlan.basePrice * freq.discount / 100);
                subscription.finalPrice = newPlan.basePrice - subscription.discountAmount;
                changes.plan = newPlan.name;
            }
        }

        // Si cambió la frecuencia
        if (updates.frequency && updates.frequency !== subscription.frequency) {
            const newFreq = FREQUENCIES[updates.frequency.toUpperCase()];
            if (newFreq) {
                subscription.frequency = newFreq.id;
                subscription.frequencyName = newFreq.name;
                subscription.discount = newFreq.discount;
                subscription.discountAmount = Math.round(subscription.basePrice * newFreq.discount / 100);
                subscription.finalPrice = subscription.basePrice - subscription.discountAmount;
                changes.frequency = newFreq.name;
            }
        }

        subscription.updatedAt = new Date();

        return {
            success: true,
            message: 'Suscripción actualizada',
            changes,
            subscription
        };
    }

    /**
     * Cambiar plan
     */
    async changePlan(subscriptionId, newPlanId) {
        return this.updateSubscription(subscriptionId, { planId: newPlanId });
    }

    /**
     * Cambiar frecuencia
     */
    async changeFrequency(subscriptionId, newFrequency) {
        return this.updateSubscription(subscriptionId, { frequency: newFrequency });
    }

    // ========================================================================
    // GESTIÓN DE ENTREGAS
    // ========================================================================

    /**
     * Programar entrega
     */
    async scheduleDelivery(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error('Suscripción no encontrada');
        }

        const delivery = {
            id: `del-${uuidv4()}`,
            subscriptionId,
            userId: subscription.userId,
            planId: subscription.planId,
            planName: subscription.planName,
            scheduledDate: subscription.nextDeliveryDate,
            timeSlot: subscription.preferredTimeSlot,
            address: subscription.deliveryAddress,
            instructions: subscription.deliveryInstructions,
            giftMessage: subscription.giftMessage,
            status: DELIVERY_STATUS.SCHEDULED,
            amount: subscription.finalPrice,
            paymentStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.deliveries.set(delivery.id, delivery);

        return delivery;
    }

    /**
     * Saltar una entrega
     */
    async skipDelivery(deliveryId, reason = '') {
        const delivery = this.deliveries.get(deliveryId);
        if (!delivery) {
            throw new Error('Entrega no encontrada');
        }

        if (delivery.status !== DELIVERY_STATUS.SCHEDULED) {
            throw new Error('Solo se pueden saltar entregas programadas');
        }

        delivery.status = DELIVERY_STATUS.SKIPPED;
        delivery.skipReason = reason;
        delivery.updatedAt = new Date();

        // Programar siguiente entrega
        const subscription = this.subscriptions.get(delivery.subscriptionId);
        if (subscription && subscription.status === SUBSCRIPTION_STATUS.ACTIVE) {
            const freq = Object.values(FREQUENCIES).find(f => f.id === subscription.frequency);
            subscription.nextDeliveryDate = new Date(
                delivery.scheduledDate.getTime() + freq.daysInterval * 24 * 60 * 60 * 1000
            );
            await this.scheduleDelivery(subscription.id);
        }

        return {
            success: true,
            message: 'Entrega omitida',
            delivery,
            nextDelivery: subscription?.nextDeliveryDate
        };
    }

    /**
     * Reprogramar entrega
     */
    async rescheduleDelivery(deliveryId, newDate, newTimeSlot = null) {
        const delivery = this.deliveries.get(deliveryId);
        if (!delivery) {
            throw new Error('Entrega no encontrada');
        }

        if (delivery.status !== DELIVERY_STATUS.SCHEDULED) {
            throw new Error('Solo se pueden reprogramar entregas programadas');
        }

        // Validar que la nueva fecha sea futura
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 1);
        
        if (new Date(newDate) < minDate) {
            throw new Error('La fecha debe ser al menos mañana');
        }

        delivery.originalDate = delivery.scheduledDate;
        delivery.scheduledDate = new Date(newDate);
        if (newTimeSlot) {
            delivery.timeSlot = newTimeSlot;
        }
        delivery.status = DELIVERY_STATUS.RESCHEDULED;
        delivery.updatedAt = new Date();

        return {
            success: true,
            message: 'Entrega reprogramada',
            delivery
        };
    }

    /**
     * Marcar entrega como completada
     */
    async completeDelivery(deliveryId, details = {}) {
        const delivery = this.deliveries.get(deliveryId);
        if (!delivery) {
            throw new Error('Entrega no encontrada');
        }

        delivery.status = DELIVERY_STATUS.DELIVERED;
        delivery.deliveredAt = new Date();
        delivery.deliveryDetails = details;
        delivery.updatedAt = new Date();

        // Actualizar estadísticas de suscripción
        const subscription = this.subscriptions.get(delivery.subscriptionId);
        if (subscription) {
            subscription.deliveriesCompleted++;
            subscription.totalSpent += delivery.amount;
            subscription.lastDeliveryDate = new Date();

            // Calcular siguiente entrega
            const freq = Object.values(FREQUENCIES).find(f => f.id === subscription.frequency);
            subscription.nextDeliveryDate = this.calculateNextDeliveryDate(
                new Date(),
                subscription.preferredDay,
                freq.daysInterval
            );
            subscription.nextBillingDate = new Date(
                subscription.nextDeliveryDate.getTime() - 2 * 24 * 60 * 60 * 1000
            );
            subscription.updatedAt = new Date();

            // Programar siguiente entrega
            if (subscription.status === SUBSCRIPTION_STATUS.ACTIVE) {
                await this.scheduleDelivery(subscription.id);
            }
        }

        return {
            success: true,
            message: 'Entrega completada',
            delivery,
            nextDelivery: subscription?.nextDeliveryDate
        };
    }

    /**
     * Obtener entregas para una suscripción
     */
    getDeliveriesForSubscription(subscriptionId) {
        return Array.from(this.deliveries.values())
            .filter(d => d.subscriptionId === subscriptionId)
            .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
    }

    /**
     * Obtener próximas entregas
     */
    getUpcomingDeliveries(subscriptionId) {
        const now = new Date();
        return Array.from(this.deliveries.values())
            .filter(d => 
                d.subscriptionId === subscriptionId && 
                new Date(d.scheduledDate) > now &&
                d.status === DELIVERY_STATUS.SCHEDULED
            )
            .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    }

    /**
     * Cancelar entregas programadas
     */
    async cancelScheduledDeliveries(subscriptionId) {
        const deliveries = this.getUpcomingDeliveries(subscriptionId);
        deliveries.forEach(delivery => {
            delivery.status = DELIVERY_STATUS.SKIPPED;
            delivery.skipReason = 'Suscripción pausada/cancelada';
            delivery.updatedAt = new Date();
        });
        return deliveries.length;
    }

    // ========================================================================
    // PROCESAMIENTO DE PAGOS
    // ========================================================================

    /**
     * Procesar pago de suscripción
     */
    async processSubscriptionPayment(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error('Suscripción no encontrada');
        }

        // Simular proceso de pago
        const payment = {
            id: `pay-${uuidv4()}`,
            subscriptionId,
            userId: subscription.userId,
            amount: subscription.finalPrice,
            currency: SUBSCRIPTION_CONFIG.currency,
            status: 'completed', // En producción, esto vendría del gateway de pago
            paymentMethod: subscription.paymentMethodId,
            processedAt: new Date()
        };

        // Guardar en historial
        if (!this.paymentHistory.has(subscriptionId)) {
            this.paymentHistory.set(subscriptionId, []);
        }
        this.paymentHistory.get(subscriptionId).push(payment);

        return {
            success: true,
            payment,
            subscription
        };
    }

    /**
     * Obtener historial de pagos
     */
    getPaymentHistory(subscriptionId) {
        return this.paymentHistory.get(subscriptionId) || [];
    }

    // ========================================================================
    // PLANES Y FRECUENCIAS
    // ========================================================================

    /**
     * Obtener todos los planes
     */
    getPlans() {
        return SUBSCRIPTION_PLANS.map(plan => ({
            ...plan,
            frequencies: Object.values(FREQUENCIES).map(freq => ({
                ...freq,
                price: plan.basePrice - Math.round(plan.basePrice * freq.discount / 100),
                savings: Math.round(plan.basePrice * freq.discount / 100)
            }))
        }));
    }

    /**
     * Obtener frecuencias disponibles
     */
    getFrequencies() {
        return Object.values(FREQUENCIES);
    }

    /**
     * Calcular precio con descuento
     */
    calculatePrice(planId, frequency) {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        const freq = FREQUENCIES[frequency.toUpperCase()];
        
        if (!plan || !freq) {
            return null;
        }

        const discount = Math.round(plan.basePrice * freq.discount / 100);
        return {
            basePrice: plan.basePrice,
            discount: freq.discount,
            discountAmount: discount,
            finalPrice: plan.basePrice - discount,
            monthlySavings: this.calculateMonthlySavings(discount, freq.daysInterval)
        };
    }

    // ========================================================================
    // ESTADÍSTICAS
    // ========================================================================

    /**
     * Obtener estadísticas de suscripciones
     */
    async getSubscriptionStats() {
        const subs = Array.from(this.subscriptions.values());
        
        const stats = {
            total: subs.length,
            active: subs.filter(s => s.status === SUBSCRIPTION_STATUS.ACTIVE).length,
            paused: subs.filter(s => s.status === SUBSCRIPTION_STATUS.PAUSED).length,
            cancelled: subs.filter(s => s.status === SUBSCRIPTION_STATUS.CANCELLED).length,
            byPlan: {},
            byFrequency: {},
            revenue: {
                monthly: 0,
                projected: 0
            },
            avgDeliveries: 0,
            churnRate: 0
        };

        // Agrupar por plan
        SUBSCRIPTION_PLANS.forEach(plan => {
            stats.byPlan[plan.id] = subs.filter(s => s.planId === plan.id).length;
        });

        // Agrupar por frecuencia
        Object.values(FREQUENCIES).forEach(freq => {
            stats.byFrequency[freq.id] = subs.filter(s => s.frequency === freq.id).length;
        });

        // Calcular ingresos
        const activeSubs = subs.filter(s => s.status === SUBSCRIPTION_STATUS.ACTIVE);
        activeSubs.forEach(sub => {
            const freq = Object.values(FREQUENCIES).find(f => f.id === sub.frequency);
            const monthlyMultiplier = 30 / freq.daysInterval;
            stats.revenue.monthly += sub.finalPrice * monthlyMultiplier;
        });
        stats.revenue.projected = stats.revenue.monthly * 12;

        // Promedio de entregas
        if (subs.length > 0) {
            stats.avgDeliveries = subs.reduce((sum, s) => sum + s.deliveriesCompleted, 0) / subs.length;
        }

        // Tasa de cancelación (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCancellations = subs.filter(
            s => s.cancelledAt && new Date(s.cancelledAt) > thirtyDaysAgo
        ).length;
        stats.churnRate = stats.total > 0 ? (recentCancellations / stats.total * 100).toFixed(1) : 0;

        return stats;
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    calculateNextDeliveryDate(fromDate, preferredDay, daysInterval = 7) {
        const date = new Date(fromDate);
        
        // Encontrar el próximo día preferido
        while (date.getDay() !== preferredDay) {
            date.setDate(date.getDate() + 1);
        }

        // Si la fecha es hoy o pasada, avanzar al siguiente período
        if (date <= new Date()) {
            date.setDate(date.getDate() + daysInterval);
        }

        return date;
    }

    calculateMonthlySavings(savingsPerDelivery, daysInterval) {
        const deliveriesPerMonth = 30 / daysInterval;
        return Math.round(savingsPerDelivery * deliveriesPerMonth);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }

    getStatusLabel(status) {
        const labels = {
            [SUBSCRIPTION_STATUS.ACTIVE]: '✅ Activa',
            [SUBSCRIPTION_STATUS.PAUSED]: '⏸️ Pausada',
            [SUBSCRIPTION_STATUS.CANCELLED]: '❌ Cancelada',
            [SUBSCRIPTION_STATUS.PENDING_PAYMENT]: '⏳ Pago pendiente',
            [SUBSCRIPTION_STATUS.PAYMENT_FAILED]: '⚠️ Pago fallido',
            [SUBSCRIPTION_STATUS.EXPIRED]: '📅 Expirada'
        };
        return labels[status] || status;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    SubscriptionService,
    FREQUENCIES,
    SUBSCRIPTION_STATUS,
    DELIVERY_STATUS,
    SUBSCRIPTION_PLANS,
    SUBSCRIPTION_CONFIG
};
