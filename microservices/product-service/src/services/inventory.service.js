/**
 * Servicio de Inventario Avanzado - Flores Victoria
 * Control de stock, alertas, reservas y movimientos
 */

const { v4: uuidv4 } = require('uuid');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const INVENTORY_CONFIG = {
    // Alertas de stock
    LOW_STOCK_THRESHOLD: 10,          // Alerta cuando stock < 10
    CRITICAL_STOCK_THRESHOLD: 3,      // Crítico cuando stock < 3
    OVERSTOCK_THRESHOLD: 100,         // Sobrestock cuando > 100
    
    // Reservas
    RESERVATION_TIMEOUT_MINUTES: 30,  // Reservas expiran en 30 min
    MAX_RESERVATION_QUANTITY: 10,     // Máximo por reserva
    
    // Historial
    MOVEMENT_HISTORY_DAYS: 90,        // Mantener historial 90 días
    
    // Productos perecederos (flores)
    PERISHABLE_ALERT_DAYS: 3,         // Alertar 3 días antes de caducidad
    DEFAULT_SHELF_LIFE_DAYS: 7        // Vida útil por defecto
};

// Tipos de movimiento de inventario
const MOVEMENT_TYPES = {
    PURCHASE: 'purchase',           // Compra a proveedor
    SALE: 'sale',                   // Venta
    RETURN: 'return',               // Devolución de cliente
    RETURN_TO_SUPPLIER: 'return_to_supplier',
    ADJUSTMENT_POSITIVE: 'adjustment_positive',
    ADJUSTMENT_NEGATIVE: 'adjustment_negative',
    DAMAGE: 'damage',               // Producto dañado
    EXPIRED: 'expired',             // Producto caducado
    TRANSFER: 'transfer',           // Transferencia entre ubicaciones
    RESERVATION: 'reservation',     // Reserva temporal
    RESERVATION_RELEASE: 'reservation_release'
};

// Estados de alerta
const ALERT_LEVELS = {
    NORMAL: 'normal',
    LOW: 'low',
    CRITICAL: 'critical',
    OUT_OF_STOCK: 'out_of_stock',
    OVERSTOCK: 'overstock',
    EXPIRING_SOON: 'expiring_soon'
};

// ============================================================================
// SERVICIO DE INVENTARIO
// ============================================================================

class InventoryService {
    constructor() {
        // Almacenamiento en memoria (en producción usar DB)
        this.inventory = new Map();       // productId -> inventory data
        this.movements = [];              // Historial de movimientos
        this.reservations = new Map();    // reservationId -> reservation data
        this.alerts = new Map();          // productId -> alerts
        this.suppliers = new Map();       // supplierId -> supplier data
        
        // Iniciar limpieza periódica de reservas expiradas
        this.startReservationCleanup();
    }

    // ========================================================================
    // GESTIÓN DE STOCK
    // ========================================================================

    /**
     * Obtener inventario de un producto
     */
    getProductInventory(productId) {
        return this.inventory.get(productId) || this.createDefaultInventory(productId);
    }

    /**
     * Crear inventario por defecto
     */
    createDefaultInventory(productId) {
        const inventory = {
            productId,
            sku: null,
            quantity: 0,
            reservedQuantity: 0,
            availableQuantity: 0,
            reorderPoint: INVENTORY_CONFIG.LOW_STOCK_THRESHOLD,
            reorderQuantity: 50,
            location: 'default',
            lastUpdated: new Date(),
            expirationDate: null,
            batchNumber: null,
            costPrice: 0,
            alertLevel: ALERT_LEVELS.OUT_OF_STOCK
        };
        
        this.inventory.set(productId, inventory);
        return inventory;
    }

    /**
     * Actualizar stock de producto
     */
    updateStock(productId, data) {
        const inventory = this.getProductInventory(productId);
        
        Object.assign(inventory, {
            ...data,
            availableQuantity: (data.quantity || inventory.quantity) - inventory.reservedQuantity,
            lastUpdated: new Date()
        });

        inventory.alertLevel = this.calculateAlertLevel(inventory);
        this.inventory.set(productId, inventory);
        
        // Verificar alertas
        this.checkAndCreateAlerts(productId, inventory);
        
        return inventory;
    }

    /**
     * Registrar movimiento de inventario
     */
    recordMovement(movementData) {
        const {
            productId,
            type,
            quantity,
            reference = null,
            notes = '',
            userId = 'system',
            cost = 0
        } = movementData;

        const inventory = this.getProductInventory(productId);
        const previousQuantity = inventory.quantity;
        let newQuantity = previousQuantity;

        // Calcular nueva cantidad según tipo de movimiento
        switch (type) {
            case MOVEMENT_TYPES.PURCHASE:
            case MOVEMENT_TYPES.RETURN:
            case MOVEMENT_TYPES.ADJUSTMENT_POSITIVE:
                newQuantity = previousQuantity + quantity;
                break;
            case MOVEMENT_TYPES.SALE:
            case MOVEMENT_TYPES.RETURN_TO_SUPPLIER:
            case MOVEMENT_TYPES.ADJUSTMENT_NEGATIVE:
            case MOVEMENT_TYPES.DAMAGE:
            case MOVEMENT_TYPES.EXPIRED:
                newQuantity = Math.max(0, previousQuantity - quantity);
                break;
            case MOVEMENT_TYPES.RESERVATION:
                // Solo aumenta reservedQuantity, no cambia quantity
                inventory.reservedQuantity += quantity;
                break;
            case MOVEMENT_TYPES.RESERVATION_RELEASE:
                inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);
                break;
        }

        // Crear registro de movimiento
        const movement = {
            id: uuidv4(),
            productId,
            type,
            quantity,
            previousQuantity,
            newQuantity,
            reference,
            notes,
            userId,
            cost,
            createdAt: new Date()
        };

        this.movements.push(movement);

        // Actualizar inventario
        if (type !== MOVEMENT_TYPES.RESERVATION && type !== MOVEMENT_TYPES.RESERVATION_RELEASE) {
            this.updateStock(productId, { quantity: newQuantity });
        } else {
            inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;
            inventory.lastUpdated = new Date();
            this.inventory.set(productId, inventory);
        }

        return {
            movement,
            inventory: this.getProductInventory(productId)
        };
    }

    /**
     * Obtener stock disponible (considerando reservas)
     */
    getAvailableStock(productId) {
        const inventory = this.getProductInventory(productId);
        return {
            productId,
            totalQuantity: inventory.quantity,
            reservedQuantity: inventory.reservedQuantity,
            availableQuantity: inventory.availableQuantity,
            alertLevel: inventory.alertLevel,
            canFulfill: (requestedQty) => inventory.availableQuantity >= requestedQty
        };
    }

    /**
     * Verificar disponibilidad para múltiples productos
     */
    checkBulkAvailability(items) {
        const results = items.map(item => {
            const stock = this.getAvailableStock(item.productId);
            return {
                productId: item.productId,
                requestedQuantity: item.quantity,
                availableQuantity: stock.availableQuantity,
                canFulfill: stock.availableQuantity >= item.quantity,
                shortage: Math.max(0, item.quantity - stock.availableQuantity)
            };
        });

        return {
            canFulfillAll: results.every(r => r.canFulfill),
            items: results,
            unavailableItems: results.filter(r => !r.canFulfill)
        };
    }

    // ========================================================================
    // SISTEMA DE RESERVAS
    // ========================================================================

    /**
     * Crear reserva de stock (durante checkout)
     */
    createReservation(reservationData) {
        const {
            items,
            userId,
            orderId = null,
            expiresInMinutes = INVENTORY_CONFIG.RESERVATION_TIMEOUT_MINUTES
        } = reservationData;

        // Verificar disponibilidad
        const availability = this.checkBulkAvailability(items);
        if (!availability.canFulfillAll) {
            return {
                success: false,
                error: 'Stock insuficiente para algunos productos',
                unavailableItems: availability.unavailableItems
            };
        }

        const reservationId = uuidv4();
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        // Reservar cada producto
        const reservedItems = items.map(item => {
            this.recordMovement({
                productId: item.productId,
                type: MOVEMENT_TYPES.RESERVATION,
                quantity: item.quantity,
                reference: reservationId,
                notes: `Reserva para orden ${orderId || 'pendiente'}`,
                userId
            });

            return {
                productId: item.productId,
                quantity: item.quantity,
                reserved: true
            };
        });

        const reservation = {
            id: reservationId,
            items: reservedItems,
            userId,
            orderId,
            status: 'active',
            createdAt: new Date(),
            expiresAt
        };

        this.reservations.set(reservationId, reservation);

        return {
            success: true,
            reservationId,
            expiresAt,
            items: reservedItems
        };
    }

    /**
     * Confirmar reserva (convertir a venta)
     */
    confirmReservation(reservationId, orderId) {
        const reservation = this.reservations.get(reservationId);
        
        if (!reservation) {
            return {
                success: false,
                error: 'Reserva no encontrada'
            };
        }

        if (reservation.status !== 'active') {
            return {
                success: false,
                error: `Reserva ya está ${reservation.status}`
            };
        }

        // Convertir reserva en venta
        reservation.items.forEach(item => {
            // Liberar reserva
            this.recordMovement({
                productId: item.productId,
                type: MOVEMENT_TYPES.RESERVATION_RELEASE,
                quantity: item.quantity,
                reference: reservationId
            });

            // Registrar venta
            this.recordMovement({
                productId: item.productId,
                type: MOVEMENT_TYPES.SALE,
                quantity: item.quantity,
                reference: orderId,
                notes: `Venta confirmada de reserva ${reservationId}`
            });
        });

        reservation.status = 'confirmed';
        reservation.confirmedAt = new Date();
        reservation.orderId = orderId;

        return {
            success: true,
            reservation
        };
    }

    /**
     * Cancelar/liberar reserva
     */
    cancelReservation(reservationId, reason = 'Cancelada') {
        const reservation = this.reservations.get(reservationId);
        
        if (!reservation || reservation.status !== 'active') {
            return { success: false, error: 'Reserva no válida' };
        }

        // Liberar stock reservado
        reservation.items.forEach(item => {
            this.recordMovement({
                productId: item.productId,
                type: MOVEMENT_TYPES.RESERVATION_RELEASE,
                quantity: item.quantity,
                reference: reservationId,
                notes: `Reserva cancelada: ${reason}`
            });
        });

        reservation.status = 'cancelled';
        reservation.cancelledAt = new Date();
        reservation.cancelReason = reason;

        return {
            success: true,
            reservation
        };
    }

    /**
     * Limpiar reservas expiradas
     */
    cleanupExpiredReservations() {
        const now = new Date();
        let cleaned = 0;

        this.reservations.forEach((reservation, id) => {
            if (reservation.status === 'active' && reservation.expiresAt < now) {
                this.cancelReservation(id, 'Expirada automáticamente');
                cleaned++;
            }
        });

        if (cleaned > 0) {
            console.log(`[Inventario] Limpiadas ${cleaned} reservas expiradas`);
        }

        return cleaned;
    }

    /**
     * Iniciar limpieza periódica de reservas
     */
    startReservationCleanup() {
        // Cada 5 minutos
        setInterval(() => {
            this.cleanupExpiredReservations();
        }, 5 * 60 * 1000);
    }

    // ========================================================================
    // ALERTAS
    // ========================================================================

    /**
     * Calcular nivel de alerta
     */
    calculateAlertLevel(inventory) {
        const { quantity, availableQuantity, expirationDate } = inventory;

        // Verificar caducidad
        if (expirationDate) {
            const daysUntilExpiry = Math.ceil((new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= INVENTORY_CONFIG.PERISHABLE_ALERT_DAYS) {
                return ALERT_LEVELS.EXPIRING_SOON;
            }
        }

        if (availableQuantity <= 0) {
            return ALERT_LEVELS.OUT_OF_STOCK;
        }

        if (availableQuantity <= INVENTORY_CONFIG.CRITICAL_STOCK_THRESHOLD) {
            return ALERT_LEVELS.CRITICAL;
        }

        if (availableQuantity <= INVENTORY_CONFIG.LOW_STOCK_THRESHOLD) {
            return ALERT_LEVELS.LOW;
        }

        if (quantity > INVENTORY_CONFIG.OVERSTOCK_THRESHOLD) {
            return ALERT_LEVELS.OVERSTOCK;
        }

        return ALERT_LEVELS.NORMAL;
    }

    /**
     * Verificar y crear alertas
     */
    checkAndCreateAlerts(productId, inventory) {
        const alertLevel = inventory.alertLevel;
        
        if (alertLevel !== ALERT_LEVELS.NORMAL) {
            const alert = {
                id: uuidv4(),
                productId,
                level: alertLevel,
                message: this.getAlertMessage(alertLevel, inventory),
                quantity: inventory.availableQuantity,
                createdAt: new Date(),
                acknowledged: false
            };

            if (!this.alerts.has(productId)) {
                this.alerts.set(productId, []);
            }
            this.alerts.get(productId).push(alert);

            // TODO: Enviar notificación al admin
            console.log(`[Alerta Inventario] ${alert.level}: ${alert.message}`);

            return alert;
        }

        return null;
    }

    /**
     * Generar mensaje de alerta
     */
    getAlertMessage(level, inventory) {
        const messages = {
            [ALERT_LEVELS.OUT_OF_STOCK]: `Producto agotado: ${inventory.productId}`,
            [ALERT_LEVELS.CRITICAL]: `Stock crítico (${inventory.availableQuantity} unidades): ${inventory.productId}`,
            [ALERT_LEVELS.LOW]: `Stock bajo (${inventory.availableQuantity} unidades): ${inventory.productId}`,
            [ALERT_LEVELS.OVERSTOCK]: `Sobrestock (${inventory.quantity} unidades): ${inventory.productId}`,
            [ALERT_LEVELS.EXPIRING_SOON]: `Producto próximo a caducar: ${inventory.productId}`
        };
        return messages[level] || 'Alerta de inventario';
    }

    /**
     * Obtener alertas activas
     */
    getActiveAlerts(filters = {}) {
        const { level, acknowledged = false, productId } = filters;
        let alerts = [];

        this.alerts.forEach((productAlerts, pId) => {
            if (productId && pId !== productId) return;
            
            productAlerts.forEach(alert => {
                if (alert.acknowledged !== acknowledged) return;
                if (level && alert.level !== level) return;
                alerts.push(alert);
            });
        });

        return alerts.sort((a, b) => {
            // Ordenar por severidad y fecha
            const severityOrder = {
                [ALERT_LEVELS.OUT_OF_STOCK]: 0,
                [ALERT_LEVELS.CRITICAL]: 1,
                [ALERT_LEVELS.EXPIRING_SOON]: 2,
                [ALERT_LEVELS.LOW]: 3,
                [ALERT_LEVELS.OVERSTOCK]: 4
            };
            const severityDiff = severityOrder[a.level] - severityOrder[b.level];
            return severityDiff !== 0 ? severityDiff : new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    /**
     * Marcar alerta como leída
     */
    acknowledgeAlert(alertId) {
        this.alerts.forEach(productAlerts => {
            const alert = productAlerts.find(a => a.id === alertId);
            if (alert) {
                alert.acknowledged = true;
                alert.acknowledgedAt = new Date();
            }
        });
    }

    // ========================================================================
    // HISTORIAL Y REPORTES
    // ========================================================================

    /**
     * Obtener historial de movimientos
     */
    getMovementHistory(filters = {}) {
        const { productId, type, startDate, endDate, limit = 100 } = filters;

        let filtered = [...this.movements];

        if (productId) {
            filtered = filtered.filter(m => m.productId === productId);
        }

        if (type) {
            filtered = filtered.filter(m => m.type === type);
        }

        if (startDate) {
            filtered = filtered.filter(m => new Date(m.createdAt) >= new Date(startDate));
        }

        if (endDate) {
            filtered = filtered.filter(m => new Date(m.createdAt) <= new Date(endDate));
        }

        return filtered
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    /**
     * Generar reporte de inventario
     */
    generateInventoryReport() {
        const report = {
            generatedAt: new Date(),
            summary: {
                totalProducts: this.inventory.size,
                totalValue: 0,
                outOfStock: 0,
                lowStock: 0,
                criticalStock: 0,
                overstock: 0,
                expiringSoon: 0
            },
            products: [],
            alerts: this.getActiveAlerts()
        };

        this.inventory.forEach((inv, productId) => {
            report.summary.totalValue += inv.quantity * inv.costPrice;
            
            if (inv.alertLevel === ALERT_LEVELS.OUT_OF_STOCK) report.summary.outOfStock++;
            if (inv.alertLevel === ALERT_LEVELS.LOW) report.summary.lowStock++;
            if (inv.alertLevel === ALERT_LEVELS.CRITICAL) report.summary.criticalStock++;
            if (inv.alertLevel === ALERT_LEVELS.OVERSTOCK) report.summary.overstock++;
            if (inv.alertLevel === ALERT_LEVELS.EXPIRING_SOON) report.summary.expiringSoon++;

            report.products.push({
                productId,
                ...inv,
                value: inv.quantity * inv.costPrice
            });
        });

        // Ordenar por nivel de alerta
        report.products.sort((a, b) => {
            const order = {
                [ALERT_LEVELS.OUT_OF_STOCK]: 0,
                [ALERT_LEVELS.CRITICAL]: 1,
                [ALERT_LEVELS.EXPIRING_SOON]: 2,
                [ALERT_LEVELS.LOW]: 3,
                [ALERT_LEVELS.OVERSTOCK]: 4,
                [ALERT_LEVELS.NORMAL]: 5
            };
            return order[a.alertLevel] - order[b.alertLevel];
        });

        return report;
    }

    /**
     * Análisis de rotación de inventario
     */
    getInventoryTurnover(productId, days = 30) {
        const movements = this.getMovementHistory({
            productId,
            type: MOVEMENT_TYPES.SALE,
            startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        });

        const totalSold = movements.reduce((sum, m) => sum + m.quantity, 0);
        const inventory = this.getProductInventory(productId);
        const avgInventory = inventory.quantity; // Simplificado

        return {
            productId,
            period: `${days} días`,
            totalSold,
            averageInventory: avgInventory,
            turnoverRate: avgInventory > 0 ? (totalSold / avgInventory).toFixed(2) : 0,
            daysOfInventory: totalSold > 0 ? Math.round((avgInventory / totalSold) * days) : 'N/A',
            salesPerDay: (totalSold / days).toFixed(2)
        };
    }

    /**
     * Productos que necesitan reorden
     */
    getReorderList() {
        const reorderNeeded = [];

        this.inventory.forEach((inv, productId) => {
            if (inv.availableQuantity <= inv.reorderPoint) {
                reorderNeeded.push({
                    productId,
                    currentStock: inv.availableQuantity,
                    reorderPoint: inv.reorderPoint,
                    suggestedQuantity: inv.reorderQuantity,
                    alertLevel: inv.alertLevel,
                    priority: inv.alertLevel === ALERT_LEVELS.OUT_OF_STOCK ? 'urgente' :
                              inv.alertLevel === ALERT_LEVELS.CRITICAL ? 'alta' : 'normal'
                });
            }
        });

        return reorderNeeded.sort((a, b) => {
            const priorityOrder = { urgente: 0, alta: 1, normal: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    InventoryService,
    INVENTORY_CONFIG,
    MOVEMENT_TYPES,
    ALERT_LEVELS
};
