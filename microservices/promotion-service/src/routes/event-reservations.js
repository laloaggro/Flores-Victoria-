/**
 * Event Reservations Routes - Flores Victoria
 * Implementación simplificada para demonstración
 */

const express = require('express');
const router = express.Router();

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const eventTypes = [
    {
        id: 'wedding',
        name: 'Matrimonio',
        description: 'Decoración floral completa para tu día especial',
        basePrice: 850000,
        minGuests: 30,
        maxGuests: 500,
        services: ['bouquet', 'centerpieces', 'ceremony-arch', 'church-decoration']
    },
    {
        id: 'corporate',
        name: 'Evento Corporativo',
        description: 'Arreglos florales para eventos empresariales',
        basePrice: 350000,
        minGuests: 20,
        maxGuests: 300,
        services: ['centerpieces', 'stage-decoration', 'welcome-arrangement']
    },
    {
        id: 'birthday',
        name: 'Cumpleaños',
        description: 'Decoración floral para celebraciones de cumpleaños',
        basePrice: 150000,
        minGuests: 10,
        maxGuests: 100,
        services: ['centerpieces', 'main-arrangement', 'balloon-flowers']
    },
    {
        id: 'baby-shower',
        name: 'Baby Shower',
        description: 'Arreglos delicados para dar la bienvenida al bebé',
        basePrice: 120000,
        minGuests: 10,
        maxGuests: 50,
        services: ['centerpieces', 'gift-arrangement', 'decoration-corner']
    },
    {
        id: 'anniversary',
        name: 'Aniversario',
        description: 'Flores románticas para celebrar años de amor',
        basePrice: 200000,
        minGuests: 2,
        maxGuests: 100,
        services: ['main-arrangement', 'centerpieces', 'romantic-setup']
    },
    {
        id: 'funeral',
        name: 'Servicio Fúnebre',
        description: 'Arreglos florales para honrar la memoria',
        basePrice: 180000,
        minGuests: null,
        maxGuests: null,
        services: ['standing-arrangement', 'casket-spray', 'condolence-arrangement']
    }
];

const services = {
    'bouquet': { id: 'bouquet', name: 'Ramo de Novia', price: 85000 },
    'centerpieces': { id: 'centerpieces', name: 'Centros de Mesa (c/u)', price: 25000 },
    'ceremony-arch': { id: 'ceremony-arch', name: 'Arco de Ceremonia', price: 250000 },
    'church-decoration': { id: 'church-decoration', name: 'Decoración Iglesia', price: 350000 },
    'stage-decoration': { id: 'stage-decoration', name: 'Decoración Escenario', price: 180000 },
    'welcome-arrangement': { id: 'welcome-arrangement', name: 'Arreglo de Bienvenida', price: 75000 },
    'main-arrangement': { id: 'main-arrangement', name: 'Arreglo Principal', price: 120000 },
    'balloon-flowers': { id: 'balloon-flowers', name: 'Globos con Flores', price: 45000 },
    'gift-arrangement': { id: 'gift-arrangement', name: 'Arreglo de Regalo', price: 55000 },
    'decoration-corner': { id: 'decoration-corner', name: 'Rincón Decorativo', price: 95000 },
    'romantic-setup': { id: 'romantic-setup', name: 'Setup Romántico', price: 150000 },
    'standing-arrangement': { id: 'standing-arrangement', name: 'Arreglo de Pie', price: 120000 },
    'casket-spray': { id: 'casket-spray', name: 'Manto para Ataúd', price: 250000 },
    'condolence-arrangement': { id: 'condolence-arrangement', name: 'Arreglo de Condolencias', price: 85000 }
};

// Almacenamiento en memoria para demo
const consultations = new Map();
const reservations = new Map();

// ============================================================================
// RUTAS PÚBLICAS - INFORMACIÓN
// ============================================================================

/**
 * GET /api/event-reservations/event-types
 * Lista todos los tipos de eventos disponibles
 */
router.get('/event-types', (req, res) => {
    res.json({
        success: true,
        data: eventTypes.map(type => ({
            id: type.id,
            name: type.name,
            description: type.description,
            basePrice: type.basePrice,
            formattedPrice: `$${type.basePrice.toLocaleString('es-CL')} CLP`,
            guestRange: type.minGuests && type.maxGuests 
                ? `${type.minGuests} - ${type.maxGuests} personas`
                : 'Variable'
        }))
    });
});

/**
 * GET /api/event-reservations/event-types/:typeId
 * Obtiene detalles de un tipo de evento específico
 */
router.get('/event-types/:typeId', (req, res) => {
    const eventType = eventTypes.find(t => t.id === req.params.typeId);
    
    if (!eventType) {
        return res.status(404).json({
            error: true,
            message: 'Tipo de evento no encontrado'
        });
    }

    const availableServices = eventType.services.map(sid => services[sid]);
    
    res.json({
        success: true,
        data: {
            ...eventType,
            formattedPrice: `$${eventType.basePrice.toLocaleString('es-CL')} CLP`,
            availableServices
        }
    });
});

/**
 * GET /api/event-reservations/services
 * Lista todos los servicios disponibles
 */
router.get('/services', (req, res) => {
    res.json({
        success: true,
        data: Object.values(services).map(s => ({
            ...s,
            formattedPrice: `$${s.price.toLocaleString('es-CL')} CLP`
        }))
    });
});

// ============================================================================
// COTIZACIONES
// ============================================================================

/**
 * POST /api/event-reservations/quote
 * Calcula cotización para un evento
 */
router.post('/quote', (req, res) => {
    try {
        const { eventType, serviceIds, guestCount, eventDate } = req.body;
        
        const type = eventTypes.find(t => t.id === eventType);
        if (!type) {
            return res.status(400).json({
                error: true,
                message: 'Tipo de evento inválido'
            });
        }

        let subtotal = type.basePrice;
        const selectedServices = [];

        if (serviceIds && Array.isArray(serviceIds)) {
            for (const sid of serviceIds) {
                if (services[sid]) {
                    selectedServices.push(services[sid]);
                    // Para centerpieces, multiplicar por número de mesas estimado
                    if (sid === 'centerpieces' && guestCount) {
                        const tableCount = Math.ceil(guestCount / 8);
                        subtotal += services[sid].price * tableCount;
                    } else {
                        subtotal += services[sid].price;
                    }
                }
            }
        }

        // Descuentos por volumen
        let discount = 0;
        if (guestCount > 200) discount = 0.10;
        else if (guestCount > 100) discount = 0.05;

        const discountAmount = subtotal * discount;
        const total = subtotal - discountAmount;

        res.json({
            success: true,
            data: {
                eventType: type.name,
                eventDate,
                guestCount,
                basePrice: type.basePrice,
                selectedServices,
                subtotal,
                discount: discount * 100 + '%',
                discountAmount,
                total,
                formattedTotal: `$${total.toLocaleString('es-CL')} CLP`,
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                note: 'Cotización válida por 7 días. Requiere 50% de anticipo para reservar.'
            }
        });
    } catch (error) {
        console.error('Error calculando cotización:', error);
        res.status(500).json({
            error: true,
            message: 'Error al calcular cotización'
        });
    }
});

// ============================================================================
// CONSULTAS
// ============================================================================

/**
 * POST /api/event-reservations/consultations
 * Crear nueva consulta/solicitud de cotización
 */
router.post('/consultations', async (req, res) => {
    try {
        const { 
            eventType, 
            eventDate, 
            guestCount, 
            serviceIds,
            customerName,
            customerEmail,
            customerPhone,
            notes 
        } = req.body;

        // Validaciones básicas
        if (!eventType || !customerName || !customerEmail) {
            return res.status(400).json({
                error: true,
                message: 'Faltan campos requeridos: eventType, customerName, customerEmail'
            });
        }

        const type = eventTypes.find(t => t.id === eventType);
        if (!type) {
            return res.status(400).json({
                error: true,
                message: 'Tipo de evento no válido'
            });
        }

        const consultationId = `CONS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const consultation = {
            id: consultationId,
            eventType,
            eventTypeName: type.name,
            eventDate,
            guestCount,
            requestedServices: serviceIds || [],
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            notes,
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedResponse: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        consultations.set(consultationId, consultation);

        res.status(201).json({
            success: true,
            message: 'Consulta recibida. Te contactaremos dentro de 24 horas.',
            data: {
                consultationId,
                eventType: type.name,
                eventDate,
                estimatedResponse: consultation.estimatedResponse
            }
        });
    } catch (error) {
        console.error('Error creando consulta:', error);
        res.status(500).json({
            error: true,
            message: 'Error al procesar consulta'
        });
    }
});

/**
 * GET /api/event-reservations/consultations/:id
 * Obtener estado de una consulta
 */
router.get('/consultations/:id', (req, res) => {
    const consultation = consultations.get(req.params.id);
    
    if (!consultation) {
        return res.status(404).json({
            error: true,
            message: 'Consulta no encontrada'
        });
    }

    res.json({
        success: true,
        data: consultation
    });
});

// ============================================================================
// RESERVAS
// ============================================================================

/**
 * POST /api/event-reservations/reservations
 * Crear reserva desde consulta aprobada
 */
router.post('/reservations', async (req, res) => {
    try {
        const { consultationId, depositPaid } = req.body;

        if (!consultationId) {
            return res.status(400).json({
                error: true,
                message: 'ID de consulta requerido'
            });
        }

        const consultation = consultations.get(consultationId);
        if (!consultation) {
            return res.status(404).json({
                error: true,
                message: 'Consulta no encontrada'
            });
        }

        const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const reservation = {
            id: reservationId,
            consultationId,
            eventType: consultation.eventTypeName,
            eventDate: consultation.eventDate,
            customer: consultation.customer,
            status: depositPaid ? 'confirmed' : 'pending-payment',
            depositPaid: depositPaid || false,
            createdAt: new Date().toISOString()
        };

        reservations.set(reservationId, reservation);
        consultation.status = 'converted';
        consultation.reservationId = reservationId;

        res.status(201).json({
            success: true,
            message: depositPaid 
                ? 'Reserva confirmada exitosamente' 
                : 'Reserva creada. Pendiente de depósito para confirmar.',
            data: reservation
        });
    } catch (error) {
        console.error('Error creando reserva:', error);
        res.status(500).json({
            error: true,
            message: 'Error al crear reserva'
        });
    }
});

/**
 * GET /api/event-reservations/reservations/:id
 * Obtener detalles de una reserva
 */
router.get('/reservations/:id', (req, res) => {
    const reservation = reservations.get(req.params.id);
    
    if (!reservation) {
        return res.status(404).json({
            error: true,
            message: 'Reserva no encontrada'
        });
    }

    res.json({
        success: true,
        data: reservation
    });
});

// ============================================================================
// DISPONIBILIDAD
// ============================================================================

/**
 * GET /api/event-reservations/availability
 * Verificar disponibilidad para una fecha
 */
router.get('/availability', (req, res) => {
    const { date, eventType } = req.query;

    if (!date) {
        return res.status(400).json({
            error: true,
            message: 'Parámetro date es requerido'
        });
    }

    const requestedDate = new Date(date);
    
    // Simular verificación de disponibilidad
    const dayOfWeek = requestedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Contar reservas existentes para esa fecha
    const existingReservations = Array.from(reservations.values())
        .filter(r => r.eventDate === date);

    const maxPerDay = isWeekend ? 3 : 5;
    const available = existingReservations.length < maxPerDay;

    res.json({
        success: true,
        data: {
            date,
            available,
            slotsRemaining: Math.max(0, maxPerDay - existingReservations.length),
            isWeekend,
            note: isWeekend 
                ? 'Los fines de semana tienen alta demanda. Reserva con anticipación.'
                : 'Día disponible con buena disponibilidad.'
        }
    });
});

module.exports = router;
