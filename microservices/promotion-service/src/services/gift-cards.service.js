/**
 * Servicio de Tarjetas de Regalo - Flores Victoria
 * Gift Cards digitales con códigos únicos y seguimiento
 */

const crypto = require('crypto');

class GiftCardService {
    constructor() {
        // Almacén en memoria (en producción usar Redis/PostgreSQL)
        this.giftCards = new Map();
        this.transactions = new Map();
        
        // Configuración de montos predefinidos (CLP)
        this.predefinedAmounts = [
            { value: 15000, label: '$15.000', popular: false },
            { value: 25000, label: '$25.000', popular: true },
            { value: 50000, label: '$50.000', popular: true },
            { value: 75000, label: '$75.000', popular: false },
            { value: 100000, label: '$100.000', popular: true },
            { value: 150000, label: '$150.000', popular: false }
        ];

        // Diseños de tarjetas disponibles
        this.designs = [
            {
                id: 'romantic',
                name: 'Romántico',
                description: 'Rosas rojas y corazones',
                image: '/img/giftcards/romantic.jpg',
                colors: ['#d63384', '#ff6b9d'],
                occasions: ['aniversario', 'san-valentin', 'amor']
            },
            {
                id: 'birthday',
                name: 'Cumpleaños',
                description: 'Flores coloridas con globos',
                image: '/img/giftcards/birthday.jpg',
                colors: ['#ffc107', '#ff6b35'],
                occasions: ['cumpleaños']
            },
            {
                id: 'thanks',
                name: 'Agradecimiento',
                description: 'Girasoles brillantes',
                image: '/img/giftcards/thanks.jpg',
                colors: ['#ffc107', '#28a745'],
                occasions: ['agradecimiento', 'dia-madre', 'dia-padre']
            },
            {
                id: 'sympathy',
                name: 'Condolencias',
                description: 'Lirios blancos elegantes',
                image: '/img/giftcards/sympathy.jpg',
                colors: ['#6c757d', '#ffffff'],
                occasions: ['condolencias', 'funeral']
            },
            {
                id: 'celebration',
                name: 'Celebración',
                description: 'Bouquet festivo multicolor',
                image: '/img/giftcards/celebration.jpg',
                colors: ['#6f42c1', '#e83e8c'],
                occasions: ['graduacion', 'promocion', 'logro']
            },
            {
                id: 'classic',
                name: 'Clásico',
                description: 'Diseño elegante atemporal',
                image: '/img/giftcards/classic.jpg',
                colors: ['#343a40', '#d63384'],
                occasions: ['general', 'corporativo']
            }
        ];

        // Estados de tarjeta
        this.STATUS = {
            ACTIVE: 'active',
            USED: 'used',
            EXPIRED: 'expired',
            CANCELLED: 'cancelled',
            PENDING: 'pending' // Pendiente de pago
        };

        console.log('🎁 Gift Card Service inicializado');
    }

    // ========================================================================
    // CREACIÓN DE GIFT CARDS
    // ========================================================================

    /**
     * Crea una nueva tarjeta de regalo
     */
    async create(data) {
        const {
            amount,
            designId = 'classic',
            purchaserId,
            purchaserEmail,
            purchaserName,
            recipientName,
            recipientEmail,
            personalMessage,
            deliveryDate,
            deliveryMethod = 'email', // email, sms, print
            expirationMonths = 12
        } = data;

        // Validaciones
        if (!amount || amount < 5000) {
            throw new Error('El monto mínimo es $5.000 CLP');
        }

        if (amount > 500000) {
            throw new Error('El monto máximo es $500.000 CLP');
        }

        if (!recipientEmail && deliveryMethod === 'email') {
            throw new Error('Email del destinatario es requerido');
        }

        // Generar código único
        const code = this.generateCode();
        const securityPin = this.generatePin();

        // Calcular fecha de expiración
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + expirationMonths);

        const giftCard = {
            id: `gc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            code,
            securityPin,
            amount,
            balance: amount,
            originalAmount: amount,
            currency: 'CLP',
            designId,
            design: this.designs.find(d => d.id === designId),
            
            // Comprador
            purchaser: {
                id: purchaserId,
                name: purchaserName,
                email: purchaserEmail
            },
            
            // Destinatario
            recipient: {
                name: recipientName,
                email: recipientEmail,
                message: personalMessage
            },
            
            // Entrega
            delivery: {
                method: deliveryMethod,
                scheduledDate: deliveryDate ? new Date(deliveryDate) : null,
                sentAt: null,
                status: deliveryDate ? 'scheduled' : 'pending'
            },
            
            // Estado y fechas
            status: this.STATUS.PENDING,
            createdAt: new Date().toISOString(),
            activatedAt: null,
            expirationDate: expirationDate.toISOString(),
            lastUsedAt: null,
            
            // Historial de uso
            usageHistory: [],
            
            // Metadata
            metadata: {
                source: 'web',
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }
        };

        this.giftCards.set(giftCard.id, giftCard);

        console.log(`🎁 Gift Card creada: ${code} por $${amount.toLocaleString('es-CL')}`);

        return {
            id: giftCard.id,
            code: giftCard.code,
            amount: giftCard.amount,
            designId: giftCard.designId,
            recipientName: giftCard.recipient.name,
            expirationDate: giftCard.expirationDate,
            status: giftCard.status
        };
    }

    /**
     * Activa una gift card después del pago
     */
    async activate(giftCardId, paymentInfo) {
        const giftCard = this.giftCards.get(giftCardId);
        
        if (!giftCard) {
            throw new Error('Gift card no encontrada');
        }

        if (giftCard.status !== this.STATUS.PENDING) {
            throw new Error('La gift card ya fue activada o cancelada');
        }

        giftCard.status = this.STATUS.ACTIVE;
        giftCard.activatedAt = new Date().toISOString();
        giftCard.payment = {
            transactionId: paymentInfo.transactionId,
            method: paymentInfo.method,
            paidAt: new Date().toISOString()
        };

        // Programar envío si no tiene fecha específica
        if (!giftCard.delivery.scheduledDate) {
            await this.sendGiftCard(giftCardId);
        }

        console.log(`✅ Gift Card activada: ${giftCard.code}`);

        return giftCard;
    }

    // ========================================================================
    // USO Y REDENCIÓN
    // ========================================================================

    /**
     * Valida una gift card por código
     */
    async validate(code, securityPin = null) {
        const giftCard = this.findByCode(code);
        
        if (!giftCard) {
            return {
                valid: false,
                error: 'Código de gift card inválido'
            };
        }

        // Verificar PIN si se proporciona
        if (securityPin && giftCard.securityPin !== securityPin) {
            return {
                valid: false,
                error: 'PIN de seguridad incorrecto'
            };
        }

        // Verificar estado
        if (giftCard.status === this.STATUS.CANCELLED) {
            return {
                valid: false,
                error: 'Esta gift card ha sido cancelada'
            };
        }

        if (giftCard.status === this.STATUS.PENDING) {
            return {
                valid: false,
                error: 'Esta gift card aún no ha sido activada'
            };
        }

        // Verificar expiración
        if (new Date(giftCard.expirationDate) < new Date()) {
            giftCard.status = this.STATUS.EXPIRED;
            return {
                valid: false,
                error: 'Esta gift card ha expirado'
            };
        }

        // Verificar balance
        if (giftCard.balance <= 0) {
            return {
                valid: false,
                error: 'Esta gift card no tiene saldo disponible'
            };
        }

        return {
            valid: true,
            balance: giftCard.balance,
            expirationDate: giftCard.expirationDate,
            design: giftCard.design
        };
    }

    /**
     * Aplica una gift card a una compra
     */
    async redeem(code, amount, orderId, userId) {
        const validation = await this.validate(code);
        
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const giftCard = this.findByCode(code);
        
        // Calcular monto a descontar
        const redeemAmount = Math.min(amount, giftCard.balance);
        const previousBalance = giftCard.balance;
        
        // Actualizar balance
        giftCard.balance -= redeemAmount;
        giftCard.lastUsedAt = new Date().toISOString();

        // Si se agotó el saldo, marcar como usada
        if (giftCard.balance <= 0) {
            giftCard.status = this.STATUS.USED;
        }

        // Registrar transacción
        const transaction = {
            id: `tx-${Date.now()}`,
            type: 'redemption',
            giftCardId: giftCard.id,
            giftCardCode: code,
            amount: redeemAmount,
            previousBalance,
            newBalance: giftCard.balance,
            orderId,
            userId,
            timestamp: new Date().toISOString()
        };

        giftCard.usageHistory.push(transaction);
        this.transactions.set(transaction.id, transaction);

        console.log(`💳 Gift Card redimida: ${code} - $${redeemAmount.toLocaleString('es-CL')} (Saldo: $${giftCard.balance.toLocaleString('es-CL')})`);

        return {
            success: true,
            redeemedAmount: redeemAmount,
            remainingBalance: giftCard.balance,
            transactionId: transaction.id
        };
    }

    /**
     * Consulta el balance de una gift card
     */
    async checkBalance(code, securityPin = null) {
        return this.validate(code, securityPin);
    }

    // ========================================================================
    // ENVÍO Y NOTIFICACIONES
    // ========================================================================

    /**
     * Envía la gift card al destinatario
     */
    async sendGiftCard(giftCardId) {
        const giftCard = this.giftCards.get(giftCardId);
        
        if (!giftCard) {
            throw new Error('Gift card no encontrada');
        }

        const { delivery, recipient, purchaser, code, amount, design } = giftCard;

        if (delivery.method === 'email') {
            // En producción, enviar email con plantilla HTML
            console.log(`📧 Enviando gift card a: ${recipient.email}`);
            
            // Simular envío de email
            const emailContent = {
                to: recipient.email,
                subject: `🎁 ¡${purchaser.name} te ha enviado una Tarjeta de Regalo de Flores Victoria!`,
                template: 'gift-card',
                data: {
                    recipientName: recipient.name,
                    purchaserName: purchaser.name,
                    amount: amount.toLocaleString('es-CL'),
                    code,
                    message: recipient.message,
                    design,
                    redeemUrl: `https://floresvictoria.cl/gift-card/redeem?code=${code}`
                }
            };

            // await emailService.send(emailContent);
        }

        giftCard.delivery.sentAt = new Date().toISOString();
        giftCard.delivery.status = 'sent';

        return { success: true };
    }

    /**
     * Reenvía una gift card
     */
    async resend(giftCardId, newEmail = null) {
        const giftCard = this.giftCards.get(giftCardId);
        
        if (!giftCard) {
            throw new Error('Gift card no encontrada');
        }

        if (newEmail) {
            giftCard.recipient.email = newEmail;
        }

        return this.sendGiftCard(giftCardId);
    }

    // ========================================================================
    // CONSULTAS Y BÚSQUEDAS
    // ========================================================================

    /**
     * Busca gift card por código
     */
    findByCode(code) {
        for (const [, giftCard] of this.giftCards) {
            if (giftCard.code === code.toUpperCase()) {
                return giftCard;
            }
        }
        return null;
    }

    /**
     * Obtiene gift card por ID
     */
    async getById(id) {
        return this.giftCards.get(id);
    }

    /**
     * Lista gift cards compradas por un usuario
     */
    async getByPurchaser(purchaserId) {
        const cards = [];
        for (const [, giftCard] of this.giftCards) {
            if (giftCard.purchaser.id === purchaserId) {
                cards.push(this.formatGiftCardResponse(giftCard));
            }
        }
        return cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Lista gift cards recibidas por email
     */
    async getByRecipientEmail(email) {
        const cards = [];
        for (const [, giftCard] of this.giftCards) {
            if (giftCard.recipient.email === email) {
                cards.push(this.formatGiftCardResponse(giftCard, true));
            }
        }
        return cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Formatea respuesta de gift card (oculta datos sensibles)
     */
    formatGiftCardResponse(giftCard, isRecipient = false) {
        const response = {
            id: giftCard.id,
            code: isRecipient ? giftCard.code : this.maskCode(giftCard.code),
            amount: giftCard.originalAmount,
            balance: giftCard.balance,
            design: giftCard.design,
            status: giftCard.status,
            createdAt: giftCard.createdAt,
            expirationDate: giftCard.expirationDate,
            recipientName: giftCard.recipient.name
        };

        if (!isRecipient) {
            response.deliveryStatus = giftCard.delivery.status;
        } else {
            response.purchaserName = giftCard.purchaser.name;
            response.message = giftCard.recipient.message;
        }

        return response;
    }

    /**
     * Enmascara código de gift card
     */
    maskCode(code) {
        return code.substring(0, 4) + '-****-****-' + code.substring(14);
    }

    // ========================================================================
    // ADMINISTRACIÓN
    // ========================================================================

    /**
     * Lista todas las gift cards (admin)
     */
    async listAll(filters = {}) {
        let cards = Array.from(this.giftCards.values());

        // Filtrar por estado
        if (filters.status) {
            cards = cards.filter(c => c.status === filters.status);
        }

        // Filtrar por rango de fechas
        if (filters.startDate) {
            cards = cards.filter(c => new Date(c.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            cards = cards.filter(c => new Date(c.createdAt) <= new Date(filters.endDate));
        }

        // Ordenar
        cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Paginación
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const start = (page - 1) * limit;
        const paginatedCards = cards.slice(start, start + limit);

        return {
            cards: paginatedCards,
            pagination: {
                total: cards.length,
                page,
                limit,
                pages: Math.ceil(cards.length / limit)
            }
        };
    }

    /**
     * Cancela una gift card
     */
    async cancel(giftCardId, reason, adminId) {
        const giftCard = this.giftCards.get(giftCardId);
        
        if (!giftCard) {
            throw new Error('Gift card no encontrada');
        }

        if (giftCard.status === this.STATUS.USED) {
            throw new Error('No se puede cancelar una gift card ya utilizada');
        }

        const previousStatus = giftCard.status;
        giftCard.status = this.STATUS.CANCELLED;
        giftCard.cancellation = {
            reason,
            cancelledBy: adminId,
            cancelledAt: new Date().toISOString(),
            previousStatus,
            refundable: giftCard.balance
        };

        console.log(`❌ Gift Card cancelada: ${giftCard.code}`);

        return giftCard;
    }

    /**
     * Ajusta el balance de una gift card (admin)
     */
    async adjustBalance(giftCardId, newBalance, reason, adminId) {
        const giftCard = this.giftCards.get(giftCardId);
        
        if (!giftCard) {
            throw new Error('Gift card no encontrada');
        }

        const previousBalance = giftCard.balance;
        giftCard.balance = newBalance;

        const adjustment = {
            id: `adj-${Date.now()}`,
            type: 'adjustment',
            previousBalance,
            newBalance,
            reason,
            adjustedBy: adminId,
            timestamp: new Date().toISOString()
        };

        giftCard.usageHistory.push(adjustment);

        // Actualizar estado si es necesario
        if (newBalance <= 0) {
            giftCard.status = this.STATUS.USED;
        } else if (giftCard.status === this.STATUS.USED) {
            giftCard.status = this.STATUS.ACTIVE;
        }

        return giftCard;
    }

    /**
     * Obtiene estadísticas de gift cards
     */
    async getStats() {
        const cards = Array.from(this.giftCards.values());
        
        const stats = {
            total: cards.length,
            byStatus: {},
            totalValue: 0,
            totalRedeemed: 0,
            totalBalance: 0,
            averageAmount: 0,
            recentActivity: []
        };

        // Contar por estado
        Object.values(this.STATUS).forEach(status => {
            stats.byStatus[status] = cards.filter(c => c.status === status).length;
        });

        // Calcular valores
        cards.forEach(card => {
            stats.totalValue += card.originalAmount;
            stats.totalRedeemed += (card.originalAmount - card.balance);
            stats.totalBalance += card.balance;
        });

        stats.averageAmount = cards.length > 0 ? Math.round(stats.totalValue / cards.length) : 0;

        // Actividad reciente
        stats.recentActivity = cards
            .filter(c => c.usageHistory.length > 0)
            .flatMap(c => c.usageHistory)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        return stats;
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    /**
     * Genera código único de gift card
     * Formato: XXXX-XXXX-XXXX-XXXX
     */
    generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusión
        let code = '';
        
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Verificar que no exista
        if (this.findByCode(code)) {
            return this.generateCode();
        }
        
        return code;
    }

    /**
     * Genera PIN de seguridad de 4 dígitos
     */
    generatePin() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /**
     * Obtiene diseños disponibles
     */
    getDesigns() {
        return this.designs;
    }

    /**
     * Obtiene montos predefinidos
     */
    getPredefinedAmounts() {
        return this.predefinedAmounts;
    }

    /**
     * Verifica y actualiza gift cards expiradas
     */
    async checkExpiredCards() {
        const now = new Date();
        let expiredCount = 0;

        for (const [, giftCard] of this.giftCards) {
            if (giftCard.status === this.STATUS.ACTIVE && 
                new Date(giftCard.expirationDate) < now) {
                giftCard.status = this.STATUS.EXPIRED;
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            console.log(`⏰ ${expiredCount} gift cards marcadas como expiradas`);
        }

        return expiredCount;
    }
}

// Singleton
const giftCardService = new GiftCardService();

module.exports = {
    GiftCardService,
    giftCardService
};
