/**
 * Rutas de Inventario - Flores Victoria
 * API para gestión de stock, reservas y alertas
 */

const express = require('express');
const router = express.Router();
const { InventoryService, MOVEMENT_TYPES, ALERT_LEVELS } = require('../services/inventory.service');

const inventoryService = new InventoryService();

// ============================================================================
// CONSULTAS DE STOCK
// ============================================================================

/**
 * GET /api/inventory/:productId
 * Obtener inventario de un producto
 */
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const inventory = inventoryService.getProductInventory(productId);
        
        res.json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.error('Error obteniendo inventario:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo inventario'
        });
    }
});

/**
 * GET /api/inventory/:productId/available
 * Obtener stock disponible (considerando reservas)
 */
router.get('/:productId/available', async (req, res) => {
    try {
        const { productId } = req.params;
        const stock = inventoryService.getAvailableStock(productId);
        
        res.json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error('Error obteniendo disponibilidad:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo disponibilidad'
        });
    }
});

/**
 * POST /api/inventory/check-availability
 * Verificar disponibilidad de múltiples productos
 */
router.post('/check-availability', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere array de items con productId y quantity'
            });
        }

        const availability = inventoryService.checkBulkAvailability(items);
        
        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        res.status(500).json({
            success: false,
            error: 'Error verificando disponibilidad'
        });
    }
});

// ============================================================================
// ACTUALIZACIÓN DE STOCK
// ============================================================================

/**
 * PUT /api/inventory/:productId
 * Actualizar datos de inventario
 */
router.put('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;

        const inventory = inventoryService.updateStock(productId, updateData);
        
        res.json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.error('Error actualizando inventario:', error);
        res.status(500).json({
            success: false,
            error: 'Error actualizando inventario'
        });
    }
});

/**
 * POST /api/inventory/movement
 * Registrar movimiento de inventario
 */
router.post('/movement', async (req, res) => {
    try {
        const {
            productId,
            type,
            quantity,
            reference,
            notes,
            cost
        } = req.body;

        // Validaciones
        if (!productId || !type || !quantity) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere productId, type y quantity'
            });
        }

        if (!Object.values(MOVEMENT_TYPES).includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Tipo de movimiento no válido',
                validTypes: Object.values(MOVEMENT_TYPES)
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad debe ser mayor a 0'
            });
        }

        const userId = req.user?.id || 'admin';
        
        const result = inventoryService.recordMovement({
            productId,
            type,
            quantity,
            reference,
            notes,
            userId,
            cost
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error registrando movimiento:', error);
        res.status(500).json({
            success: false,
            error: 'Error registrando movimiento'
        });
    }
});

/**
 * POST /api/inventory/bulk-update
 * Actualización masiva de stock
 */
router.post('/bulk-update', async (req, res) => {
    try {
        const { items, type = MOVEMENT_TYPES.ADJUSTMENT_POSITIVE, notes } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere array de items'
            });
        }

        const results = items.map(item => {
            try {
                return inventoryService.recordMovement({
                    productId: item.productId,
                    type,
                    quantity: item.quantity,
                    notes: notes || item.notes,
                    userId: req.user?.id || 'admin'
                });
            } catch (error) {
                return {
                    productId: item.productId,
                    error: error.message
                };
            }
        });

        res.json({
            success: true,
            data: {
                processed: results.filter(r => !r.error).length,
                failed: results.filter(r => r.error).length,
                results
            }
        });
    } catch (error) {
        console.error('Error en actualización masiva:', error);
        res.status(500).json({
            success: false,
            error: 'Error en actualización masiva'
        });
    }
});

// ============================================================================
// RESERVAS
// ============================================================================

/**
 * POST /api/inventory/reserve
 * Crear reserva de stock (durante checkout)
 */
router.post('/reserve', async (req, res) => {
    try {
        const { items, orderId, expiresInMinutes } = req.body;
        const userId = req.user?.id || 'guest';

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere array de items a reservar'
            });
        }

        const result = inventoryService.createReservation({
            items,
            userId,
            orderId,
            expiresInMinutes
        });

        if (result.success) {
            res.json({
                success: true,
                data: result
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                unavailableItems: result.unavailableItems
            });
        }
    } catch (error) {
        console.error('Error creando reserva:', error);
        res.status(500).json({
            success: false,
            error: 'Error creando reserva'
        });
    }
});

/**
 * POST /api/inventory/reserve/:reservationId/confirm
 * Confirmar reserva (convertir a venta)
 */
router.post('/reserve/:reservationId/confirm', async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere orderId para confirmar'
            });
        }

        const result = inventoryService.confirmReservation(reservationId, orderId);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.reservation
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error confirmando reserva:', error);
        res.status(500).json({
            success: false,
            error: 'Error confirmando reserva'
        });
    }
});

/**
 * DELETE /api/inventory/reserve/:reservationId
 * Cancelar reserva
 */
router.delete('/reserve/:reservationId', async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { reason } = req.body;

        const result = inventoryService.cancelReservation(reservationId, reason);
        res.json(result);
    } catch (error) {
        console.error('Error cancelando reserva:', error);
        res.status(500).json({
            success: false,
            error: 'Error cancelando reserva'
        });
    }
});

// ============================================================================
// ALERTAS
// ============================================================================

/**
 * GET /api/inventory/alerts
 * Obtener alertas activas
 */
router.get('/alerts', async (req, res) => {
    try {
        const { level, acknowledged, productId } = req.query;

        const alerts = inventoryService.getActiveAlerts({
            level,
            acknowledged: acknowledged === 'true',
            productId
        });

        res.json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    } catch (error) {
        console.error('Error obteniendo alertas:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo alertas'
        });
    }
});

/**
 * GET /api/inventory/alerts/summary
 * Resumen de alertas por nivel
 */
router.get('/alerts/summary', async (req, res) => {
    try {
        const alerts = inventoryService.getActiveAlerts({ acknowledged: false });
        
        const summary = {
            total: alerts.length,
            byLevel: {}
        };

        Object.values(ALERT_LEVELS).forEach(level => {
            summary.byLevel[level] = alerts.filter(a => a.level === level).length;
        });

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error obteniendo resumen de alertas:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo resumen'
        });
    }
});

/**
 * POST /api/inventory/alerts/:alertId/acknowledge
 * Marcar alerta como leída
 */
router.post('/alerts/:alertId/acknowledge', async (req, res) => {
    try {
        const { alertId } = req.params;
        inventoryService.acknowledgeAlert(alertId);
        
        res.json({
            success: true,
            message: 'Alerta marcada como leída'
        });
    } catch (error) {
        console.error('Error reconociendo alerta:', error);
        res.status(500).json({
            success: false,
            error: 'Error reconociendo alerta'
        });
    }
});

// ============================================================================
// HISTORIAL Y REPORTES
// ============================================================================

/**
 * GET /api/inventory/movements
 * Obtener historial de movimientos
 */
router.get('/movements', async (req, res) => {
    try {
        const { productId, type, startDate, endDate, limit } = req.query;

        const movements = inventoryService.getMovementHistory({
            productId,
            type,
            startDate,
            endDate,
            limit: limit ? parseInt(limit) : 100
        });

        res.json({
            success: true,
            data: movements,
            count: movements.length
        });
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo historial'
        });
    }
});

/**
 * GET /api/inventory/report
 * Generar reporte completo de inventario
 */
router.get('/report', async (req, res) => {
    try {
        const report = inventoryService.generateInventoryReport();
        
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).json({
            success: false,
            error: 'Error generando reporte'
        });
    }
});

/**
 * GET /api/inventory/:productId/turnover
 * Análisis de rotación de un producto
 */
router.get('/:productId/turnover', async (req, res) => {
    try {
        const { productId } = req.params;
        const { days } = req.query;

        const turnover = inventoryService.getInventoryTurnover(
            productId,
            days ? parseInt(days) : 30
        );

        res.json({
            success: true,
            data: turnover
        });
    } catch (error) {
        console.error('Error calculando rotación:', error);
        res.status(500).json({
            success: false,
            error: 'Error calculando rotación'
        });
    }
});

/**
 * GET /api/inventory/reorder-list
 * Obtener lista de productos que necesitan reorden
 */
router.get('/reorder-list', async (req, res) => {
    try {
        const reorderList = inventoryService.getReorderList();
        
        res.json({
            success: true,
            data: reorderList,
            count: reorderList.length
        });
    } catch (error) {
        console.error('Error obteniendo lista de reorden:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo lista de reorden'
        });
    }
});

// ============================================================================
// TIPOS DE MOVIMIENTO (REFERENCIA)
// ============================================================================

/**
 * GET /api/inventory/movement-types
 * Obtener tipos de movimiento disponibles
 */
router.get('/movement-types', (req, res) => {
    res.json({
        success: true,
        data: MOVEMENT_TYPES
    });
});

/**
 * GET /api/inventory/alert-levels
 * Obtener niveles de alerta
 */
router.get('/alert-levels', (req, res) => {
    res.json({
        success: true,
        data: ALERT_LEVELS
    });
});

module.exports = router;
