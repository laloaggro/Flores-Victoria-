/**
 * Event Reservations Routes - Flores Victoria
 * API REST para reservas de eventos
 */

const express = require('express');
const router = express.Router();
const { eventReservationService } = require('../services/event-reservations.service');

// ============================================================================
// RUTAS PÚBLICAS - INFORMACIÓN
// ============================================================================

/**
 * GET /api/events/types
 * Obtiene los tipos de eventos disponibles
 */
router.get('/types', (req, res) => {
    try {
        const types = eventReservationService.getEventTypes();
        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo tipos de eventos'
        });
    }
});

/**
 * GET /api/events/types/:type/services
 * Obtiene los servicios disponibles para un tipo de evento
 */
router.get('/types/:type/services', (req, res) => {
    try {
        const services = eventReservationService.getServicesForEventType(req.params.type);
        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo servicios'
        });
    }
});

/**
 * GET /api/events/services
 * Obtiene todos los servicios disponibles
 */
router.get('/services', (req, res) => {
    try {
        const services = eventReservationService.getAllServices();
        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo servicios'
        });
    }
});

// ============================================================================
// RUTAS DE CONSULTAS/COTIZACIONES
// ============================================================================

/**
 * POST /api/events/consultations
 * Crear nueva consulta/cotización
 */
router.post('/consultations', async (req, res) => {
    try {
        const consultation = await eventReservationService.createConsultation(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Consulta recibida. Te contactaremos pronto.',
            data: {
                id: consultation.id,
                eventType: consultation.eventTypeName,
                eventDate: consultation.eventDate,
                estimate: consultation.estimate,
                followUpDate: consultation.followUpDate
            }
        });
    } catch (error) {
        console.error('Error creando consulta:', error);
        res.status(400).json({
            error: true,
            message: error.message || 'Error al enviar consulta'
        });
    }
});

/**
 * GET /api/events/consultations/:id
 * Obtiene detalle de una consulta
 */
router.get('/consultations/:id', async (req, res) => {
    try {
        const consultation = await eventReservationService.getConsultationById(req.params.id);
        
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
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo consulta'
        });
    }
});

/**
 * POST /api/events/consultations/:id/quote
 * Calcular cotización para una consulta
 */
router.post('/consultations/:id/quote', async (req, res) => {
    try {
        const consultation = await eventReservationService.getConsultationById(req.params.id);
        
        if (!consultation) {
            return res.status(404).json({
                error: true,
                message: 'Consulta no encontrada'
            });
        }

        const estimate = eventReservationService.calculateEstimate(
            consultation.eventType,
            req.body.services || consultation.requestedServices,
            req.body.guestCount || consultation.guestCount
        );

        res.json({
            success: true,
            data: estimate
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error calculando cotización'
        });
    }
});

// ============================================================================
// RUTAS DE RESERVAS
// ============================================================================

/**
 * POST /api/events/reservations
 * Crear reserva desde consulta aprobada
 */
router.post('/reservations', async (req, res) => {
    try {
        const { consultationId, finalQuote, paymentInfo } = req.body;

        if (!consultationId) {
            return res.status(400).json({
                error: true,
                message: 'ID de consulta requerido'
            });
        }

        const reservation = await eventReservationService.createReservation(
            consultationId,
            finalQuote,
            paymentInfo
        );

        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            data: reservation
        });
    } catch (error) {
        console.error('Error creando reserva:', error);
        res.status(400).json({
            error: true,
            message: error.message || 'Error al crear reserva'
        });
    }
});

/**
 * GET /api/events/reservations/:id
 * Obtiene detalle de una reserva
 */
router.get('/reservations/:id', async (req, res) => {
    try {
        const reservation = await eventReservationService.getById(req.params.id);
        
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
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo reserva'
        });
    }
});

/**
 * POST /api/events/reservations/:id/deposit
 * Registrar pago de depósito
 */
router.post('/reservations/:id/deposit', async (req, res) => {
    try {
        const reservation = await eventReservationService.recordDeposit(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: 'Depósito registrado',
            data: {
                id: reservation.id,
                status: reservation.status,
                depositPaid: reservation.payment.depositPaid,
                balance: reservation.payment.balance
            }
        });
    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message || 'Error registrando depósito'
        });
    }
});

/**
 * POST /api/events/reservations/:id/payment
 * Registrar pago (parcial o final)
 */
router.post('/reservations/:id/payment', async (req, res) => {
    try {
        const reservation = await eventReservationService.recordFinalPayment(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: 'Pago registrado',
            data: {
                id: reservation.id,
                status: reservation.status,
                totalPaid: reservation.payment.totalPaid,
                balance: reservation.payment.balance
            }
        });
    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message || 'Error registrando pago'
        });
    }
});

/**
 * PATCH /api/events/reservations/:id/status
 * Actualizar estado de reserva
 */
router.patch('/reservations/:id/status', async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!status) {
            return res.status(400).json({
                error: true,
                message: 'Estado requerido'
            });
        }

        const reservation = await eventReservationService.updateStatus(
            req.params.id,
            status,
            notes
        );

        res.json({
            success: true,
            message: 'Estado actualizado',
            data: {
                id: reservation.id,
                status: reservation.status
            }
        });
    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message || 'Error actualizando estado'
        });
    }
});

/**
 * POST /api/events/reservations/:id/cancel
 * Cancelar reserva
 */
router.post('/reservations/:id/cancel', async (req, res) => {
    try {
        const { reason, requestRefund } = req.body;

        if (!reason) {
            return res.status(400).json({
                error: true,
                message: 'Motivo de cancelación requerido'
            });
        }

        const reservation = await eventReservationService.cancelReservation(
            req.params.id,
            reason,
            requestRefund
        );

        res.json({
            success: true,
            message: 'Reserva cancelada',
            data: {
                id: reservation.id,
                status: reservation.status,
                cancellation: reservation.cancellation
            }
        });
    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message || 'Error cancelando reserva'
        });
    }
});

// ============================================================================
// RUTAS DE ADMINISTRACIÓN
// ============================================================================

/**
 * GET /api/events/admin/reservations
 * Lista reservas con filtros (admin)
 */
router.get('/admin/reservations', async (req, res) => {
    try {
        const result = await eventReservationService.listReservations({
            status: req.query.status,
            eventType: req.query.eventType,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            customerEmail: req.query.customerEmail,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20
        });

        res.json({
            success: true,
            data: result.reservations,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error listando reservas'
        });
    }
});

/**
 * GET /api/events/admin/consultations/pending
 * Lista consultas pendientes de revisión
 */
router.get('/admin/consultations/pending', async (req, res) => {
    try {
        const consultations = await eventReservationService.listPendingConsultations();
        res.json({
            success: true,
            data: consultations
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error listando consultas'
        });
    }
});

/**
 * GET /api/events/admin/calendar
 * Obtiene calendario de eventos
 */
router.get('/admin/calendar', async (req, res) => {
    try {
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const events = await eventReservationService.getEventsCalendar(month, year);

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo calendario'
        });
    }
});

/**
 * GET /api/events/admin/stats
 * Obtiene estadísticas de eventos
 */
router.get('/admin/stats', async (req, res) => {
    try {
        const stats = await eventReservationService.getStats();
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

module.exports = router;
