/**
 * @fileoverview Configuración de Zonas de Envío - Santiago Norte, Chile
 * Define comunas, tarifas, tiempos de entrega y restricciones
 * 
 * Flores Victoria - Sector Norte de Santiago
 */

// ═══════════════════════════════════════════════════════════════
// ZONAS DE COBERTURA
// ═══════════════════════════════════════════════════════════════

/**
 * Zonas de envío agrupadas por cercanía y tiempo de entrega
 */
const DELIVERY_ZONES = {
  // Zona 1: Centro de operaciones (más cercano)
  ZONE_1: {
    id: 'zone_1',
    name: 'Zona Centro Norte',
    description: 'Comunas cercanas al centro de operaciones',
    deliveryTime: {
      min: 30,
      max: 60,
      unit: 'minutos',
    },
    baseFee: 2990,
    freeDeliveryThreshold: 35000, // Envío gratis sobre este monto
    communes: ['Recoleta', 'Independencia', 'Conchalí'],
  },

  // Zona 2: Área intermedia
  ZONE_2: {
    id: 'zone_2',
    name: 'Zona Norte Intermedia',
    description: 'Comunas del sector norte intermedio',
    deliveryTime: {
      min: 45,
      max: 90,
      unit: 'minutos',
    },
    baseFee: 3990,
    freeDeliveryThreshold: 45000,
    communes: ['Huechuraba', 'Quilicura', 'Renca'],
  },

  // Zona 3: Área extendida norte
  ZONE_3: {
    id: 'zone_3',
    name: 'Zona Norte Extendida',
    description: 'Comunas más alejadas del sector norte',
    deliveryTime: {
      min: 60,
      max: 120,
      unit: 'minutos',
    },
    baseFee: 4990,
    freeDeliveryThreshold: 55000,
    communes: ['Cerro Navia', 'Lo Prado', 'Quinta Normal'],
  },

  // Zona 4: Sector oriente norte (opcional/premium)
  ZONE_4: {
    id: 'zone_4',
    name: 'Zona Oriente Norte',
    description: 'Comunas del sector oriente norte',
    deliveryTime: {
      min: 45,
      max: 90,
      unit: 'minutos',
    },
    baseFee: 4990,
    freeDeliveryThreshold: 50000,
    communes: ['Vitacura', 'Lo Barnechea', 'Las Condes'],
    isPremium: true,
  },

  // Zona 5: Centro de Santiago
  ZONE_5: {
    id: 'zone_5',
    name: 'Santiago Centro',
    description: 'Centro de Santiago',
    deliveryTime: {
      min: 45,
      max: 90,
      unit: 'minutos',
    },
    baseFee: 3490,
    freeDeliveryThreshold: 40000,
    communes: ['Santiago', 'Providencia', 'Ñuñoa'],
  },
};

// ═══════════════════════════════════════════════════════════════
// CATÁLOGO COMPLETO DE COMUNAS
// Las coordenadas geográficas usan precisión decimal estándar.
// Los valores como -33.35 o -70.7 son coordenadas reales de Chile.
// ═══════════════════════════════════════════════════════════════

/**
 * Todas las comunas con su zona asignada y metadata
 */
const COMMUNES = {
  // Zona 1
  'Recoleta': {
    zoneId: 'zone_1',
    postalCode: '8420000',
    coordinates: { lat: -33.4036, lng: -70.6333 },
    active: true,
  },
  'Independencia': {
    zoneId: 'zone_1',
    postalCode: '8380000',
    coordinates: { lat: -33.4167, lng: -70.6667 },
    active: true,
  },
  'Conchalí': {
    zoneId: 'zone_1',
    postalCode: '8540000',
    coordinates: { lat: -33.3833, lng: -70.6667 },
    active: true,
  },

  // Zona 2
  'Huechuraba': {
    zoneId: 'zone_2',
    postalCode: '8580000',
    coordinates: { lat: -33.3667, lng: -70.6333 },
    active: true,
  },
  'Quilicura': {
    zoneId: 'zone_2',
    postalCode: '8700000',
    coordinates: { lat: -33.3500, lng: -70.7333 },
    active: true,
  },
  'Renca': {
    zoneId: 'zone_2',
    postalCode: '8640000',
    coordinates: { lat: -33.4000, lng: -70.7167 },
    active: true,
  },

  // Zona 3
  'Cerro Navia': {
    zoneId: 'zone_3',
    postalCode: '9020000',
    coordinates: { lat: -33.425, lng: -70.74167 },
    active: true,
  },
  'Lo Prado': {
    zoneId: 'zone_3',
    postalCode: '9060000',
    coordinates: { lat: -33.4417, lng: -70.7250 },
    active: true,
  },
  'Quinta Normal': {
    zoneId: 'zone_3',
    postalCode: '8500000',
    coordinates: { lat: -33.4333, lng: -70.7000 },
    active: true,
  },

  // Zona 4 (Premium)
  'Vitacura': {
    zoneId: 'zone_4',
    postalCode: '7630000',
    coordinates: { lat: -33.3833, lng: -70.5667 },
    active: true,
  },
  'Lo Barnechea': {
    zoneId: 'zone_4',
    postalCode: '7690000',
    coordinates: { lat: -33.3500, lng: -70.5167 },
    active: true,
  },
  'Las Condes': {
    zoneId: 'zone_4',
    postalCode: '7550000',
    coordinates: { lat: -33.4167, lng: -70.5667 },
    active: true,
  },

  // Zona 5 (Centro)
  'Santiago': {
    zoneId: 'zone_5',
    postalCode: '8320000',
    coordinates: { lat: -33.4500, lng: -70.6667 },
    active: true,
  },
  'Providencia': {
    zoneId: 'zone_5',
    postalCode: '7500000',
    coordinates: { lat: -33.4333, lng: -70.6167 },
    active: true,
  },
  'Ñuñoa': {
    zoneId: 'zone_5',
    postalCode: '7750000',
    coordinates: { lat: -33.4583, lng: -70.5917 },
    active: true,
  },
};

// ═══════════════════════════════════════════════════════════════
// HORARIOS DE ENTREGA
// ═══════════════════════════════════════════════════════════════

const DELIVERY_SCHEDULES = {
  // Horarios disponibles
  SLOTS: [
    { id: 'morning', name: 'Mañana', start: '09:00', end: '12:00', available: true },
    { id: 'midday', name: 'Mediodía', start: '12:00', end: '15:00', available: true },
    { id: 'afternoon', name: 'Tarde', start: '15:00', end: '18:00', available: true },
    { id: 'evening', name: 'Noche', start: '18:00', end: '21:00', available: true },
  ],

  // Días de operación (0 = Domingo, 6 = Sábado)
  OPERATING_DAYS: {
    0: { open: false, name: 'Domingo' }, // Cerrado
    1: { open: true, name: 'Lunes', slots: ['morning', 'midday', 'afternoon', 'evening'] },
    2: { open: true, name: 'Martes', slots: ['morning', 'midday', 'afternoon', 'evening'] },
    3: { open: true, name: 'Miércoles', slots: ['morning', 'midday', 'afternoon', 'evening'] },
    4: { open: true, name: 'Jueves', slots: ['morning', 'midday', 'afternoon', 'evening'] },
    5: { open: true, name: 'Viernes', slots: ['morning', 'midday', 'afternoon', 'evening'] },
    6: { open: true, name: 'Sábado', slots: ['morning', 'midday', 'afternoon'] }, // Horario reducido
  },

  // Tiempo mínimo de anticipación para programar entrega (en horas)
  MIN_ADVANCE_HOURS: 3,

  // Fechas especiales con demanda alta
  SPECIAL_DATES: {
    // Formato: 'MM-DD'
    '02-14': { name: 'San Valentín', surcharge: 5000, extendedHours: true },
    '05-10': { name: 'Día de la Madre', surcharge: 3000, extendedHours: true },
    '10-31': { name: 'Halloween', surcharge: 0, extendedHours: false },
    '12-24': { name: 'Nochebuena', surcharge: 3000, extendedHours: false },
    '12-25': { name: 'Navidad', surcharge: 5000, extendedHours: false },
    '12-31': { name: 'Año Nuevo', surcharge: 5000, extendedHours: false },
  },
};

// ═══════════════════════════════════════════════════════════════
// TIPOS DE ENVÍO
// ═══════════════════════════════════════════════════════════════

const DELIVERY_TYPES = {
  STANDARD: {
    id: 'standard',
    name: 'Envío Estándar',
    description: 'Entrega en el horario seleccionado',
    multiplier: 1,
  },
  EXPRESS: {
    id: 'express',
    name: 'Envío Express',
    description: 'Entrega en menos de 2 horas',
    multiplier: 1.5,
    minOrderValue: 25000,
  },
  SAME_DAY: {
    id: 'same_day',
    name: 'Mismo Día',
    description: 'Entrega garantizada hoy',
    multiplier: 1.3,
    cutoffTime: '14:00', // Pedidos antes de las 14:00
  },
  SCHEDULED: {
    id: 'scheduled',
    name: 'Programado',
    description: 'Elige fecha y hora específica',
    multiplier: 1,
    advanceDiscount: 0.1, // 10% descuento si programa con 24h+ anticipación
  },
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE UTILIDAD
// ═══════════════════════════════════════════════════════════════

/**
 * Obtiene la zona de una comuna
 * @param {string} communeName - Nombre de la comuna
 * @returns {Object|null} Información de la zona
 */
function getZoneByCommune(communeName) {
  const commune = COMMUNES[communeName];
  // Verificación explícita para mayor claridad
  if (!commune || !commune.active) return null;
  return DELIVERY_ZONES[commune.zoneId.toUpperCase()] || null;
}

/**
 * Calcula el costo de envío
 * @param {string} communeName - Nombre de la comuna
 * @param {number} orderTotal - Total del pedido en CLP
 * @param {string} deliveryType - Tipo de envío
 * @param {Date} deliveryDate - Fecha de entrega
 * @returns {Object} Detalles del costo de envío
 */
function calculateDeliveryFee(communeName, orderTotal, deliveryType = 'standard', deliveryDate = new Date()) {
  const commune = COMMUNES[communeName];
  // Verificación explícita para mayor claridad
  if (!commune || !commune.active) {
    return {
      success: false,
      error: 'Comuna no disponible para envío',
      commune: communeName,
    };
  }

  const zone = DELIVERY_ZONES[commune.zoneId.toUpperCase()];
  if (!zone) {
    return {
      success: false,
      error: 'Zona de envío no configurada',
    };
  }

  const type = DELIVERY_TYPES[deliveryType.toUpperCase()] || DELIVERY_TYPES.STANDARD;
  
  // Calcular tarifa base
  let fee = zone.baseFee * type.multiplier;
  let isFreeDelivery = false;
  let surcharge = 0;

  // Verificar envío gratis
  if (orderTotal >= zone.freeDeliveryThreshold) {
    isFreeDelivery = true;
    fee = 0;
  }

  // Verificar fecha especial
  const dateKey = `${String(deliveryDate.getMonth() + 1).padStart(2, '0')}-${String(deliveryDate.getDate()).padStart(2, '0')}`;
  const specialDate = DELIVERY_SCHEDULES.SPECIAL_DATES[dateKey];
  if (specialDate) {
    surcharge = specialDate.surcharge;
    fee += surcharge;
  }

  // Descuento por programación anticipada
  let discount = 0;
  if (type.id === 'scheduled' && type.advanceDiscount) {
    const hoursInAdvance = (deliveryDate - Date.now()) / (1000 * 60 * 60);
    if (hoursInAdvance >= 24) {
      discount = fee * type.advanceDiscount;
      fee -= discount;
    }
  }

  return {
    success: true,
    commune: communeName,
    zone: {
      id: zone.id,
      name: zone.name,
    },
    deliveryType: type.id,
    deliveryTime: zone.deliveryTime,
    baseFee: zone.baseFee,
    fee: Math.round(fee),
    isFreeDelivery,
    freeDeliveryThreshold: zone.freeDeliveryThreshold,
    amountForFreeDelivery: isFreeDelivery ? 0 : zone.freeDeliveryThreshold - orderTotal,
    surcharge,
    discount: Math.round(discount),
    specialDate: specialDate?.name || null,
  };
}

/**
 * Obtiene horarios disponibles para una fecha
 * @param {Date} date - Fecha a consultar
 * @returns {Object} Horarios disponibles
 */
function getAvailableSlots(date) {
  const dayOfWeek = date.getDay();
  const dayConfig = DELIVERY_SCHEDULES.OPERATING_DAYS[dayOfWeek];

  if (!dayConfig.open) {
    return {
      available: false,
      reason: `No hay entregas los ${dayConfig.name}`,
      slots: [],
    };
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const minAdvanceTime = new Date(now.getTime() + DELIVERY_SCHEDULES.MIN_ADVANCE_HOURS * 60 * 60 * 1000);

  const availableSlots = DELIVERY_SCHEDULES.SLOTS
    .filter(slot => dayConfig.slots.includes(slot.id))
    .map(slot => {
      const slotStart = new Date(date);
      const [hours, minutes] = slot.start.split(':');
      slotStart.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0);

      const isAvailable = !isToday || slotStart > minAdvanceTime;

      // Construir razón de no disponibilidad de forma explícita
      const unavailableReason = isAvailable ? null : 'Horario no disponible (tiempo mínimo de anticipación)';

      return {
        ...slot,
        isAvailable,
        reason: unavailableReason,
      };
    });

  // Verificar fecha especial
  const dateKey = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const specialDate = DELIVERY_SCHEDULES.SPECIAL_DATES[dateKey];

  return {
    available: availableSlots.some(s => s.isAvailable),
    dayName: dayConfig.name,
    slots: availableSlots,
    specialDate: specialDate || null,
  };
}

/**
 * Verifica si una comuna está disponible para envío
 * @param {string} communeName - Nombre de la comuna
 * @returns {boolean}
 */
function isCommuneAvailable(communeName) {
  const commune = COMMUNES[communeName];
  return commune?.active === true;
}

/**
 * Lista todas las comunas disponibles
 * @returns {Array} Lista de comunas con su información
 */
function listAvailableCommunes() {
  return Object.entries(COMMUNES)
    .filter(([, data]) => data.active)
    .map(([name, data]) => {
      const zone = DELIVERY_ZONES[data.zoneId.toUpperCase()];
      return {
        name,
        zone: zone?.name || 'Sin zona',
        zoneId: data.zoneId,
        deliveryTime: zone?.deliveryTime || null,
        baseFee: zone?.baseFee || 0,
        freeDeliveryThreshold: zone?.freeDeliveryThreshold || 0,
      };
    })
    .sort((a, b) => a.zone.localeCompare(b.zone));
}

/**
 * Obtiene resumen de todas las zonas
 * @returns {Array} Resumen de zonas
 */
function getZonesSummary() {
  return Object.values(DELIVERY_ZONES).map(zone => ({
    id: zone.id,
    name: zone.name,
    description: zone.description,
    communes: zone.communes,
    communeCount: zone.communes.length,
    deliveryTime: zone.deliveryTime,
    baseFee: zone.baseFee,
    freeDeliveryThreshold: zone.freeDeliveryThreshold,
    isPremium: zone.isPremium || false,
  }));
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Configuración
  DELIVERY_ZONES,
  COMMUNES,
  DELIVERY_SCHEDULES,
  DELIVERY_TYPES,
  
  // Funciones
  getZoneByCommune,
  calculateDeliveryFee,
  getAvailableSlots,
  isCommuneAvailable,
  listAvailableCommunes,
  getZonesSummary,
};
