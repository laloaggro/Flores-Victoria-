/**
 * @fileoverview Rutas de Zonas de Envío - Flores Victoria
 * API para consultar comunas, tarifas y horarios de entrega
 * Sector: Santiago Norte, Chile
 */

const express = require('express');
const router = express.Router();

const {
  DELIVERY_ZONES,
  DELIVERY_TYPES,
  DELIVERY_SCHEDULES,
  getZoneByCommune,
  calculateDeliveryFee,
  getAvailableSlots,
  isCommuneAvailable,
  listAvailableCommunes,
  getZonesSummary,
} = require('../../../../shared/config/deliveryZones');

// ═══════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS (sin autenticación)
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /delivery/zones:
 *   get:
 *     summary: Listar todas las zonas de envío
 *     tags: [Delivery]
 *     responses:
 *       200:
 *         description: Lista de zonas de envío
 */
router.get('/zones', (req, res) => {
  const zones = getZonesSummary();
  
  res.json({
    success: true,
    data: {
      zones,
      totalZones: zones.length,
      totalCommunes: zones.reduce((acc, z) => acc + z.communeCount, 0),
    },
  });
});

/**
 * @swagger
 * /delivery/communes:
 *   get:
 *     summary: Listar todas las comunas disponibles
 *     tags: [Delivery]
 *     parameters:
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *         description: Filtrar por ID de zona
 *     responses:
 *       200:
 *         description: Lista de comunas
 */
router.get('/communes', (req, res) => {
  const { zone } = req.query;
  let communes = listAvailableCommunes();
  
  if (zone) {
    communes = communes.filter(c => c.zoneId === zone);
  }
  
  res.json({
    success: true,
    data: {
      communes,
      total: communes.length,
      coverage: 'Santiago Norte, Chile',
    },
  });
});

/**
 * @swagger
 * /delivery/check-coverage:
 *   get:
 *     summary: Verificar si una comuna tiene cobertura
 *     tags: [Delivery]
 *     parameters:
 *       - in: query
 *         name: commune
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la comuna
 *     responses:
 *       200:
 *         description: Estado de cobertura
 */
router.get('/check-coverage', (req, res) => {
  const { commune } = req.query;
  
  if (!commune) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere el parámetro commune',
    });
  }
  
  const isAvailable = isCommuneAvailable(commune);
  const zone = getZoneByCommune(commune);
  
  res.json({
    success: true,
    data: {
      commune,
      hasCoverage: isAvailable,
      zone: zone ? {
        id: zone.id,
        name: zone.name,
        deliveryTime: zone.deliveryTime,
        baseFee: zone.baseFee,
        freeDeliveryThreshold: zone.freeDeliveryThreshold,
      } : null,
      message: isAvailable 
        ? `✅ Entregamos en ${commune}` 
        : `❌ Lo sentimos, aún no llegamos a ${commune}`,
    },
  });
});

/**
 * @swagger
 * /delivery/calculate:
 *   post:
 *     summary: Calcular costo de envío
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commune
 *               - orderTotal
 *             properties:
 *               commune:
 *                 type: string
 *                 example: "Recoleta"
 *               orderTotal:
 *                 type: number
 *                 example: 25000
 *               deliveryType:
 *                 type: string
 *                 enum: [standard, express, same_day, scheduled]
 *                 default: standard
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-03"
 *     responses:
 *       200:
 *         description: Cálculo de envío
 */
router.post('/calculate', (req, res) => {
  const { commune, orderTotal, deliveryType = 'standard', deliveryDate } = req.body;
  
  if (!commune || orderTotal === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere commune y orderTotal',
    });
  }
  
  const date = deliveryDate ? new Date(deliveryDate) : new Date();
  const result = calculateDeliveryFee(commune, orderTotal, deliveryType, date);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  // Agregar información adicional
  result.orderTotal = orderTotal;
  result.finalTotal = orderTotal + result.fee;
  result.formattedFee = result.fee === 0 ? 'GRATIS' : `$${result.fee.toLocaleString('es-CL')}`;
  result.formattedFinalTotal = `$${result.finalTotal.toLocaleString('es-CL')}`;
  
  if (result.amountForFreeDelivery > 0) {
    result.freeDeliveryMessage = `Agrega $${result.amountForFreeDelivery.toLocaleString('es-CL')} más para envío gratis`;
  }
  
  res.json({
    success: true,
    data: result,
  });
});

/**
 * @swagger
 * /delivery/slots:
 *   get:
 *     summary: Obtener horarios disponibles para una fecha
 *     tags: [Delivery]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para consultar (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Horarios disponibles
 */
router.get('/slots', (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere el parámetro date (formato: YYYY-MM-DD)',
    });
  }
  
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Formato de fecha inválido. Use YYYY-MM-DD',
    });
  }
  
  const slots = getAvailableSlots(targetDate);
  
  res.json({
    success: true,
    data: {
      date,
      ...slots,
    },
  });
});

/**
 * @swagger
 * /delivery/types:
 *   get:
 *     summary: Listar tipos de envío disponibles
 *     tags: [Delivery]
 *     responses:
 *       200:
 *         description: Tipos de envío
 */
router.get('/types', (req, res) => {
  const types = Object.values(DELIVERY_TYPES).map(type => ({
    id: type.id,
    name: type.name,
    description: type.description,
    priceMultiplier: type.multiplier,
    requirements: {
      minOrderValue: type.minOrderValue || null,
      cutoffTime: type.cutoffTime || null,
    },
    discount: type.advanceDiscount ? `${type.advanceDiscount * 100}% con 24h+ anticipación` : null,
  }));
  
  res.json({
    success: true,
    data: types,
  });
});

/**
 * @swagger
 * /delivery/special-dates:
 *   get:
 *     summary: Obtener fechas especiales con recargos
 *     tags: [Delivery]
 *     responses:
 *       200:
 *         description: Fechas especiales del año
 */
router.get('/special-dates', (req, res) => {
  const specialDates = Object.entries(DELIVERY_SCHEDULES.SPECIAL_DATES).map(([dateKey, info]) => {
    const [month, day] = dateKey.split('-');
    return {
      date: `${new Date().getFullYear()}-${month}-${day}`,
      month: Number.parseInt(month, 10),
      day: Number.parseInt(day, 10),
      name: info.name,
      surcharge: info.surcharge,
      formattedSurcharge: info.surcharge > 0 ? `+$${info.surcharge.toLocaleString('es-CL')}` : 'Sin recargo',
      extendedHours: info.extendedHours,
    };
  });
  
  res.json({
    success: true,
    data: specialDates,
    message: 'En fechas especiales puede haber alta demanda. Recomendamos pedir con anticipación.',
  });
});

/**
 * @swagger
 * /delivery/schedule:
 *   get:
 *     summary: Obtener horario de operación
 *     tags: [Delivery]
 *     responses:
 *       200:
 *         description: Horario semanal de operación
 */
router.get('/schedule', (req, res) => {
  const schedule = Object.entries(DELIVERY_SCHEDULES.OPERATING_DAYS).map(([day, config]) => ({
    dayNumber: Number.parseInt(day, 10),
    dayName: config.name,
    isOpen: config.open,
    slots: config.open ? config.slots : [],
  }));
  
  const slotDetails = DELIVERY_SCHEDULES.SLOTS;
  
  res.json({
    success: true,
    data: {
      schedule,
      slots: slotDetails,
      minAdvanceHours: DELIVERY_SCHEDULES.MIN_ADVANCE_HOURS,
      timezone: 'America/Santiago',
    },
  });
});

// ═══════════════════════════════════════════════════════════════
// ENDPOINT DE VALIDACIÓN COMPLETA
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /delivery/validate:
 *   post:
 *     summary: Validar pedido completo (cobertura + horario + costo)
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commune
 *               - orderTotal
 *               - deliveryDate
 *               - deliverySlot
 *             properties:
 *               commune:
 *                 type: string
 *               orderTotal:
 *                 type: number
 *               deliveryType:
 *                 type: string
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *               deliverySlot:
 *                 type: string
 *                 enum: [morning, midday, afternoon, evening]
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.post('/validate', (req, res) => {
  const { commune, orderTotal, deliveryType = 'standard', deliveryDate, deliverySlot } = req.body;
  
  const errors = [];
  
  // Validar campos requeridos
  if (!commune) errors.push('Se requiere la comuna');
  if (orderTotal === undefined) errors.push('Se requiere el total del pedido');
  if (!deliveryDate) errors.push('Se requiere la fecha de entrega');
  if (!deliverySlot) errors.push('Se requiere el horario de entrega');
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      valid: false,
      errors,
    });
  }
  
  // Validar cobertura
  if (!isCommuneAvailable(commune)) {
    return res.json({
      success: true,
      valid: false,
      errors: [`No tenemos cobertura en ${commune}`],
    });
  }
  
  // Validar fecha y horario
  const date = new Date(deliveryDate);
  const slots = getAvailableSlots(date);
  
  if (!slots.available) {
    return res.json({
      success: true,
      valid: false,
      errors: [slots.reason],
    });
  }
  
  const selectedSlot = slots.slots.find(s => s.id === deliverySlot);
  if (!selectedSlot) {
    return res.json({
      success: true,
      valid: false,
      errors: ['Horario de entrega no válido'],
    });
  }
  
  if (!selectedSlot.isAvailable) {
    return res.json({
      success: true,
      valid: false,
      errors: [selectedSlot.reason || 'Horario no disponible'],
    });
  }
  
  // Calcular costo
  const deliveryFee = calculateDeliveryFee(commune, orderTotal, deliveryType, date);
  
  res.json({
    success: true,
    valid: true,
    data: {
      commune,
      zone: deliveryFee.zone,
      deliveryDate,
      deliverySlot: {
        id: selectedSlot.id,
        name: selectedSlot.name,
        time: `${selectedSlot.start} - ${selectedSlot.end}`,
      },
      pricing: {
        orderTotal,
        deliveryFee: deliveryFee.fee,
        surcharge: deliveryFee.surcharge,
        discount: deliveryFee.discount,
        finalTotal: orderTotal + deliveryFee.fee,
        isFreeDelivery: deliveryFee.isFreeDelivery,
      },
      specialDate: deliveryFee.specialDate,
      estimatedDeliveryTime: deliveryFee.deliveryTime,
    },
  });
});

module.exports = router;
