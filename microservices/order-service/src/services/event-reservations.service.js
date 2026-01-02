/**
 * Event Reservations Service - Flores Victoria
 * Sistema de reservas para eventos especiales
 * Bodas, funerales, corporativos, graduaciones, etc.
 */

class EventReservationService {
    constructor() {
        // Tipos de eventos soportados
        this.EVENT_TYPES = {
            WEDDING: {
                id: 'wedding',
                name: 'Boda',
                icon: '💒',
                description: 'Decoración floral para bodas',
                minAdvanceDays: 30,
                depositPercentage: 50,
                services: ['bouquet_novia', 'bouquet_damas', 'decoracion_altar', 'centros_mesa', 'ramos_invitados', 'corsages', 'boutonniere']
            },
            FUNERAL: {
                id: 'funeral',
                name: 'Funeral / Condolencias',
                icon: '🕊️',
                description: 'Arreglos florales para servicios fúnebres',
                minAdvanceDays: 1,
                depositPercentage: 30,
                services: ['corona', 'arreglo_ataud', 'arreglos_laterales', 'ramos_condolencias', 'cruces']
            },
            CORPORATE: {
                id: 'corporate',
                name: 'Evento Corporativo',
                icon: '🏢',
                description: 'Decoración para eventos empresariales',
                minAdvanceDays: 7,
                depositPercentage: 40,
                services: ['centros_mesa', 'decoracion_escenario', 'arreglos_recepcion', 'obsequios_florales']
            },
            GRADUATION: {
                id: 'graduation',
                name: 'Graduación',
                icon: '🎓',
                description: 'Ramos y arreglos para graduaciones',
                minAdvanceDays: 3,
                depositPercentage: 30,
                services: ['ramo_graduado', 'corsage', 'arreglos_decorativos']
            },
            BIRTHDAY: {
                id: 'birthday',
                name: 'Cumpleaños',
                icon: '🎂',
                description: 'Decoración floral para celebraciones',
                minAdvanceDays: 3,
                depositPercentage: 30,
                services: ['centros_mesa', 'arreglo_principal', 'decoracion_tematica']
            },
            ANNIVERSARY: {
                id: 'anniversary',
                name: 'Aniversario',
                icon: '💕',
                description: 'Arreglos románticos para aniversarios',
                minAdvanceDays: 2,
                depositPercentage: 30,
                services: ['arreglo_principal', 'centros_mesa', 'decoracion_romantica']
            },
            BABY_SHOWER: {
                id: 'baby_shower',
                name: 'Baby Shower',
                icon: '👶',
                description: 'Decoración floral para baby showers',
                minAdvanceDays: 5,
                depositPercentage: 40,
                services: ['centros_mesa', 'arreglo_principal', 'decoracion_tematica', 'corsages']
            },
            OTHER: {
                id: 'other',
                name: 'Otro Evento',
                icon: '🌸',
                description: 'Eventos personalizados',
                minAdvanceDays: 5,
                depositPercentage: 40,
                services: ['personalizado']
            }
        };

        // Catálogo de servicios
        this.SERVICES_CATALOG = {
            // Bodas
            bouquet_novia: { name: 'Bouquet de Novia', basePrice: 85000, category: 'wedding' },
            bouquet_damas: { name: 'Bouquet Damas de Honor', basePrice: 35000, category: 'wedding' },
            decoracion_altar: { name: 'Decoración de Altar', basePrice: 150000, category: 'wedding' },
            centros_mesa: { name: 'Centros de Mesa (c/u)', basePrice: 25000, category: 'general' },
            ramos_invitados: { name: 'Ramos para Invitados', basePrice: 15000, category: 'wedding' },
            corsages: { name: 'Corsage', basePrice: 12000, category: 'general' },
            boutonniere: { name: 'Boutonniere', basePrice: 8000, category: 'wedding' },
            
            // Funerales
            corona: { name: 'Corona Fúnebre', basePrice: 120000, category: 'funeral' },
            arreglo_ataud: { name: 'Arreglo para Ataúd', basePrice: 180000, category: 'funeral' },
            arreglos_laterales: { name: 'Arreglos Laterales (par)', basePrice: 90000, category: 'funeral' },
            ramos_condolencias: { name: 'Ramo de Condolencias', basePrice: 45000, category: 'funeral' },
            cruces: { name: 'Cruz Floral', basePrice: 95000, category: 'funeral' },
            
            // General
            arreglo_principal: { name: 'Arreglo Principal', basePrice: 75000, category: 'general' },
            decoracion_escenario: { name: 'Decoración de Escenario', basePrice: 250000, category: 'corporate' },
            arreglos_recepcion: { name: 'Arreglos de Recepción', basePrice: 65000, category: 'corporate' },
            obsequios_florales: { name: 'Obsequios Florales (c/u)', basePrice: 20000, category: 'corporate' },
            ramo_graduado: { name: 'Ramo de Graduación', basePrice: 35000, category: 'graduation' },
            decoracion_tematica: { name: 'Decoración Temática', basePrice: 100000, category: 'general' },
            decoracion_romantica: { name: 'Decoración Romántica', basePrice: 85000, category: 'general' },
            personalizado: { name: 'Servicio Personalizado', basePrice: 0, category: 'general' }
        };

        // Estados de reserva
        this.STATUS = {
            DRAFT: 'DRAFT',           // Borrador
            PENDING: 'PENDING',       // Pendiente de confirmación
            CONFIRMED: 'CONFIRMED',   // Confirmada
            DEPOSIT_PAID: 'DEPOSIT_PAID', // Depósito pagado
            FULLY_PAID: 'FULLY_PAID', // Totalmente pagado
            IN_PROGRESS: 'IN_PROGRESS', // En preparación
            DELIVERED: 'DELIVERED',   // Entregado
            COMPLETED: 'COMPLETED',   // Completado
            CANCELLED: 'CANCELLED'    // Cancelada
        };

        // Almacén en memoria (reemplazar con DB)
        this.reservations = new Map();
        this.consultations = new Map();
    }

    // ========================================================================
    // CONSULTAS Y COTIZACIONES
    // ========================================================================

    /**
     * Crear consulta/cotización inicial
     */
    async createConsultation(data) {
        const {
            eventType,
            eventDate,
            eventTime,
            guestCount,
            venue,
            budget,
            services,
            customerName,
            customerEmail,
            customerPhone,
            notes,
            preferredFlowers,
            colorScheme
        } = data;

        // Validar tipo de evento
        const eventTypeConfig = this.EVENT_TYPES[eventType.toUpperCase()];
        if (!eventTypeConfig) {
            throw new Error('Tipo de evento no válido');
        }

        // Validar fecha mínima
        const eventDateObj = new Date(eventDate);
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + eventTypeConfig.minAdvanceDays);

        if (eventDateObj < minDate) {
            throw new Error(`Para ${eventTypeConfig.name} se requiere al menos ${eventTypeConfig.minAdvanceDays} días de anticipación`);
        }

        const consultationId = `CON-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Calcular cotización estimada
        const estimate = this.calculateEstimate(eventType, services, guestCount);

        const consultation = {
            id: consultationId,
            eventType: eventTypeConfig.id,
            eventTypeName: eventTypeConfig.name,
            eventDate,
            eventTime,
            guestCount: parseInt(guestCount) || 0,
            venue: {
                name: venue?.name || '',
                address: venue?.address || '',
                city: venue?.city || 'Santiago'
            },
            budget: parseFloat(budget) || 0,
            requestedServices: services || [],
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            notes: notes || '',
            preferences: {
                flowers: preferredFlowers || [],
                colors: colorScheme || []
            },
            estimate,
            status: 'PENDING_REVIEW',
            assignedConsultant: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            communications: []
        };

        this.consultations.set(consultationId, consultation);

        // Enviar notificación al equipo
        await this.notifyTeam('new_consultation', consultation);

        // Enviar confirmación al cliente
        await this.sendConfirmation(consultation);

        return consultation;
    }

    /**
     * Calcular estimado de cotización
     */
    calculateEstimate(eventType, services, guestCount) {
        let subtotal = 0;
        const breakdown = [];

        services.forEach(service => {
            const serviceInfo = this.SERVICES_CATALOG[service.id];
            if (serviceInfo) {
                const quantity = service.quantity || 1;
                let price = serviceInfo.basePrice;
                
                // Ajustar por cantidad de invitados si aplica
                if (service.id === 'centros_mesa' && guestCount) {
                    const tables = Math.ceil(guestCount / 8);
                    price = serviceInfo.basePrice * tables;
                    breakdown.push({
                        service: serviceInfo.name,
                        quantity: tables,
                        unitPrice: serviceInfo.basePrice,
                        total: price,
                        note: `${tables} mesas estimadas`
                    });
                } else {
                    const total = price * quantity;
                    subtotal += total;
                    breakdown.push({
                        service: serviceInfo.name,
                        quantity,
                        unitPrice: price,
                        total
                    });
                }
                
                subtotal += price;
            }
        });

        // Agregar setup y delivery si corresponde
        const setupFee = subtotal > 300000 ? 0 : 35000;
        const deliveryFee = 25000;

        return {
            subtotal,
            setupFee,
            deliveryFee,
            total: subtotal + setupFee + deliveryFee,
            breakdown,
            currency: 'CLP',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Este es un estimado. El precio final se confirmará después de la consulta.'
        };
    }

    // ========================================================================
    // GESTIÓN DE RESERVAS
    // ========================================================================

    /**
     * Crear reserva desde consulta aprobada
     */
    async createReservation(consultationId, finalQuote, paymentInfo) {
        const consultation = this.consultations.get(consultationId);
        if (!consultation) {
            throw new Error('Consulta no encontrada');
        }

        const eventTypeConfig = this.EVENT_TYPES[consultation.eventType.toUpperCase()];
        const depositAmount = finalQuote.total * (eventTypeConfig.depositPercentage / 100);

        const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const reservation = {
            id: reservationId,
            consultationId,
            customer: consultation.customer,
            event: {
                type: consultation.eventType,
                typeName: consultation.eventTypeName,
                date: consultation.eventDate,
                time: consultation.eventTime,
                venue: consultation.venue,
                guestCount: consultation.guestCount
            },
            services: finalQuote.services,
            quote: {
                subtotal: finalQuote.subtotal,
                setupFee: finalQuote.setupFee,
                deliveryFee: finalQuote.deliveryFee,
                discount: finalQuote.discount || 0,
                total: finalQuote.total,
                breakdown: finalQuote.breakdown
            },
            payment: {
                depositRequired: depositAmount,
                depositPaid: 0,
                totalPaid: 0,
                balance: finalQuote.total,
                transactions: []
            },
            status: this.STATUS.PENDING,
            timeline: {
                created: new Date().toISOString(),
                depositDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                finalPaymentDue: new Date(new Date(consultation.eventDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            assignedTeam: [],
            notes: [],
            attachments: [],
            contract: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.reservations.set(reservationId, reservation);

        // Actualizar consulta
        consultation.status = 'CONVERTED';
        consultation.reservationId = reservationId;
        consultation.updatedAt = new Date().toISOString();

        return reservation;
    }

    /**
     * Registrar pago de depósito
     */
    async recordDeposit(reservationId, paymentData) {
        const reservation = this.reservations.get(reservationId);
        if (!reservation) {
            throw new Error('Reserva no encontrada');
        }

        const { amount, method, transactionId, reference } = paymentData;

        const transaction = {
            id: `TXN-${Date.now()}`,
            type: 'DEPOSIT',
            amount,
            method,
            transactionId,
            reference,
            date: new Date().toISOString(),
            recordedBy: paymentData.recordedBy || 'system'
        };

        reservation.payment.transactions.push(transaction);
        reservation.payment.depositPaid += amount;
        reservation.payment.totalPaid += amount;
        reservation.payment.balance = reservation.quote.total - reservation.payment.totalPaid;

        if (reservation.payment.depositPaid >= reservation.payment.depositRequired) {
            reservation.status = this.STATUS.DEPOSIT_PAID;
        }

        reservation.updatedAt = new Date().toISOString();

        // Enviar confirmación
        await this.sendPaymentConfirmation(reservation, transaction);

        return reservation;
    }

    /**
     * Registrar pago final
     */
    async recordFinalPayment(reservationId, paymentData) {
        const reservation = this.reservations.get(reservationId);
        if (!reservation) {
            throw new Error('Reserva no encontrada');
        }

        const { amount, method, transactionId, reference } = paymentData;

        const transaction = {
            id: `TXN-${Date.now()}`,
            type: 'FINAL_PAYMENT',
            amount,
            method,
            transactionId,
            reference,
            date: new Date().toISOString(),
            recordedBy: paymentData.recordedBy || 'system'
        };

        reservation.payment.transactions.push(transaction);
        reservation.payment.totalPaid += amount;
        reservation.payment.balance = reservation.quote.total - reservation.payment.totalPaid;

        if (reservation.payment.balance <= 0) {
            reservation.status = this.STATUS.FULLY_PAID;
        }

        reservation.updatedAt = new Date().toISOString();

        await this.sendPaymentConfirmation(reservation, transaction);

        return reservation;
    }

    /**
     * Actualizar estado de reserva
     */
    async updateStatus(reservationId, newStatus, notes) {
        const reservation = this.reservations.get(reservationId);
        if (!reservation) {
            throw new Error('Reserva no encontrada');
        }

        const oldStatus = reservation.status;
        reservation.status = newStatus;
        reservation.updatedAt = new Date().toISOString();

        if (notes) {
            reservation.notes.push({
                date: new Date().toISOString(),
                type: 'status_change',
                content: `Estado cambiado de ${oldStatus} a ${newStatus}. ${notes}`
            });
        }

        // Notificar al cliente si es un cambio relevante
        if (['CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(newStatus)) {
            await this.notifyCustomer(reservation, 'status_update', { oldStatus, newStatus });
        }

        return reservation;
    }

    /**
     * Cancelar reserva
     */
    async cancelReservation(reservationId, reason, requestRefund = false) {
        const reservation = this.reservations.get(reservationId);
        if (!reservation) {
            throw new Error('Reserva no encontrada');
        }

        if (reservation.status === this.STATUS.CANCELLED) {
            throw new Error('La reserva ya está cancelada');
        }

        const eventDate = new Date(reservation.event.date);
        const today = new Date();
        const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

        // Calcular reembolso según política
        let refundAmount = 0;
        let refundPercentage = 0;

        if (daysUntilEvent > 30) {
            refundPercentage = 90;
        } else if (daysUntilEvent > 14) {
            refundPercentage = 50;
        } else if (daysUntilEvent > 7) {
            refundPercentage = 25;
        } else {
            refundPercentage = 0;
        }

        refundAmount = (reservation.payment.totalPaid * refundPercentage) / 100;

        reservation.status = this.STATUS.CANCELLED;
        reservation.cancellation = {
            date: new Date().toISOString(),
            reason,
            daysUntilEvent,
            refundEligible: refundAmount > 0,
            refundPercentage,
            refundAmount,
            refundRequested: requestRefund,
            refundProcessed: false
        };
        reservation.updatedAt = new Date().toISOString();

        await this.notifyCustomer(reservation, 'cancellation', reservation.cancellation);

        return reservation;
    }

    // ========================================================================
    // CONSULTAS
    // ========================================================================

    /**
     * Obtener reserva por ID
     */
    async getById(reservationId) {
        return this.reservations.get(reservationId);
    }

    /**
     * Obtener consulta por ID
     */
    async getConsultationById(consultationId) {
        return this.consultations.get(consultationId);
    }

    /**
     * Listar reservas con filtros
     */
    async listReservations(filters = {}) {
        let reservations = Array.from(this.reservations.values());

        if (filters.status) {
            reservations = reservations.filter(r => r.status === filters.status);
        }

        if (filters.eventType) {
            reservations = reservations.filter(r => r.event.type === filters.eventType);
        }

        if (filters.startDate) {
            const start = new Date(filters.startDate);
            reservations = reservations.filter(r => new Date(r.event.date) >= start);
        }

        if (filters.endDate) {
            const end = new Date(filters.endDate);
            reservations = reservations.filter(r => new Date(r.event.date) <= end);
        }

        if (filters.customerEmail) {
            reservations = reservations.filter(r => 
                r.customer.email.toLowerCase().includes(filters.customerEmail.toLowerCase())
            );
        }

        // Ordenar por fecha de evento
        reservations.sort((a, b) => new Date(a.event.date) - new Date(b.event.date));

        // Paginación
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const start = (page - 1) * limit;
        const paginatedReservations = reservations.slice(start, start + limit);

        return {
            reservations: paginatedReservations,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(reservations.length / limit),
                total: reservations.length,
                limit
            }
        };
    }

    /**
     * Listar consultas pendientes
     */
    async listPendingConsultations() {
        return Array.from(this.consultations.values())
            .filter(c => c.status === 'PENDING_REVIEW')
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    /**
     * Obtener calendario de eventos
     */
    async getEventsCalendar(month, year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        const events = Array.from(this.reservations.values())
            .filter(r => {
                const eventDate = new Date(r.event.date);
                return eventDate >= startOfMonth && eventDate <= endOfMonth;
            })
            .map(r => ({
                id: r.id,
                date: r.event.date,
                title: `${r.event.typeName} - ${r.customer.name}`,
                type: r.event.type,
                status: r.status,
                venue: r.event.venue.name
            }));

        return events;
    }

    /**
     * Obtener estadísticas
     */
    async getStats() {
        const reservations = Array.from(this.reservations.values());
        const consultations = Array.from(this.consultations.values());

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const thisMonthReservations = reservations.filter(r => 
            new Date(r.createdAt) >= thisMonth
        );

        const lastMonthReservations = reservations.filter(r => 
            new Date(r.createdAt) >= lastMonth && new Date(r.createdAt) < thisMonth
        );

        const pendingConsultations = consultations.filter(c => c.status === 'PENDING_REVIEW').length;

        const totalRevenue = reservations
            .filter(r => r.status !== this.STATUS.CANCELLED)
            .reduce((sum, r) => sum + r.payment.totalPaid, 0);

        const upcomingEvents = reservations
            .filter(r => new Date(r.event.date) > now && r.status !== this.STATUS.CANCELLED)
            .length;

        // Eventos por tipo
        const byType = {};
        reservations.forEach(r => {
            byType[r.event.type] = (byType[r.event.type] || 0) + 1;
        });

        return {
            totalReservations: reservations.length,
            thisMonthReservations: thisMonthReservations.length,
            lastMonthReservations: lastMonthReservations.length,
            growth: lastMonthReservations.length > 0 
                ? ((thisMonthReservations.length - lastMonthReservations.length) / lastMonthReservations.length * 100).toFixed(1)
                : 0,
            pendingConsultations,
            upcomingEvents,
            totalRevenue,
            averageOrderValue: reservations.length > 0 
                ? Math.round(totalRevenue / reservations.filter(r => r.status !== this.STATUS.CANCELLED).length)
                : 0,
            byType,
            conversionRate: consultations.length > 0
                ? ((consultations.filter(c => c.reservationId).length / consultations.length) * 100).toFixed(1)
                : 0
        };
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    getEventTypes() {
        return Object.values(this.EVENT_TYPES);
    }

    getServicesForEventType(eventType) {
        const config = this.EVENT_TYPES[eventType.toUpperCase()];
        if (!config) return [];

        return config.services.map(serviceId => ({
            id: serviceId,
            ...this.SERVICES_CATALOG[serviceId]
        }));
    }

    getAllServices() {
        return Object.entries(this.SERVICES_CATALOG).map(([id, service]) => ({
            id,
            ...service
        }));
    }

    // ========================================================================
    // NOTIFICACIONES
    // ========================================================================

    async notifyTeam(type, data) {
        console.log(`📧 [Team Notification] ${type}:`, data.id);
        // Integrar con sistema de notificaciones
    }

    async notifyCustomer(reservation, type, data) {
        console.log(`📧 [Customer Notification] ${type} for ${reservation.id}`);
        // Integrar con email/SMS
    }

    async sendConfirmation(consultation) {
        console.log(`📧 Confirmación enviada a ${consultation.customer.email}`);
    }

    async sendPaymentConfirmation(reservation, transaction) {
        console.log(`💳 Confirmación de pago enviada: ${transaction.id}`);
    }
}

// Instancia singleton
const eventReservationService = new EventReservationService();

module.exports = {
    EventReservationService,
    eventReservationService
};
