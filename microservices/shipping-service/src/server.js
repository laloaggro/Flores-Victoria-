/* eslint-disable no-console, no-unused-vars */
/**
 * Shipping Service - Flores Victoria
 * Manages deliveries, tracking, and shipping logistics
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

const app = express();
const SERVICE_NAME = 'shipping-service';
const PORT = process.env.PORT || 3013;

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════════════════════════════

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });
  }
  return pool;
};

// ═══════════════════════════════════════════════════════════════
// SHIPPING ZONES & RATES
// ═══════════════════════════════════════════════════════════════

const SHIPPING_ZONES = {
  santiago_centro: {
    name: 'Santiago Centro',
    baseRate: 3990,
    deliveryTime: '2-4 horas',
    communes: ['Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa', 'La Reina'],
  },
  santiago_norte: {
    name: 'Santiago Norte',
    baseRate: 4990,
    deliveryTime: '4-6 horas',
    communes: ['Recoleta', 'Independencia', 'Conchalí', 'Huechuraba', 'Quilicura'],
  },
  santiago_sur: {
    name: 'Santiago Sur',
    baseRate: 4990,
    deliveryTime: '4-6 horas',
    communes: ['San Miguel', 'La Cisterna', 'San Bernardo', 'Puente Alto', 'La Florida'],
  },
  santiago_poniente: {
    name: 'Santiago Poniente',
    baseRate: 4990,
    deliveryTime: '4-6 horas',
    communes: ['Maipú', 'Pudahuel', 'Cerrillos', 'Estación Central', 'Lo Prado'],
  },
  regiones: {
    name: 'Regiones',
    baseRate: 9990,
    deliveryTime: '1-3 días hábiles',
    communes: ['*'],
  },
};

// ═══════════════════════════════════════════════════════════════
// DELIVERY STATUS FLOW
// ═══════════════════════════════════════════════════════════════

const DELIVERY_STATUSES = {
  pending: { label: 'Pendiente', icon: '📋', order: 1 },
  confirmed: { label: 'Confirmado', icon: '✅', order: 2 },
  preparing: { label: 'Preparando', icon: '💐', order: 3 },
  ready_for_pickup: { label: 'Listo para recoger', icon: '📦', order: 4 },
  in_transit: { label: 'En camino', icon: '🚚', order: 5 },
  out_for_delivery: { label: 'En reparto', icon: '🛵', order: 6 },
  delivered: { label: 'Entregado', icon: '🎉', order: 7 },
  failed: { label: 'Entrega fallida', icon: '❌', order: 8 },
  returned: { label: 'Devuelto', icon: '↩️', order: 9 },
};

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Get shipping zones and rates
app.get('/api/shipping/zones', (req, res) => {
  res.json({
    success: true,
    zones: Object.entries(SHIPPING_ZONES).map(([id, zone]) => ({
      id,
      ...zone,
    })),
  });
});

// Calculate shipping cost
app.post('/api/shipping/calculate', (req, res) => {
  const { commune, region, weight = 1, isExpress = false } = req.body;

  if (!commune) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere la comuna de destino',
    });
  }

  // Find zone
  let selectedZone = null;
  let zoneId = null;

  for (const [id, zone] of Object.entries(SHIPPING_ZONES)) {
    if (zone.communes.includes(commune) || zone.communes.includes('*')) {
      selectedZone = zone;
      zoneId = id;
      break;
    }
  }

  if (!selectedZone) {
    selectedZone = SHIPPING_ZONES.regiones;
    zoneId = 'regiones';
  }

  // Calculate price
  let price = selectedZone.baseRate;

  // Weight surcharge (over 5kg)
  if (weight > 5) {
    price += Math.ceil((weight - 5) / 5) * 1000;
  }

  // Express delivery surcharge
  if (isExpress) {
    price *= 1.5;
  }

  res.json({
    success: true,
    shipping: {
      zone: zoneId,
      zoneName: selectedZone.name,
      price: Math.round(price),
      deliveryTime: isExpress ? '1-2 horas' : selectedZone.deliveryTime,
      isExpress,
    },
  });
});

// Create shipment
app.post('/api/shipping/shipments', async (req, res) => {
  try {
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      commune,
      region,
      notes,
      scheduledDate,
      isExpress = false,
    } = req.body;

    // Validate required fields
    if (!orderId || !customerName || !address || !commune) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: orderId, customerName, address, commune',
      });
    }

    // Generate tracking number
    const trackingNumber = generateTrackingNumber();

    // Calculate shipping
    let zone = null;
    for (const [id, z] of Object.entries(SHIPPING_ZONES)) {
      if (z.communes.includes(commune) || z.communes.includes('*')) {
        zone = { id, ...z };
        break;
      }
    }

    if (!zone) {
      zone = { id: 'regiones', ...SHIPPING_ZONES.regiones };
    }

    const shipment = {
      id: `ship_${Date.now()}`,
      trackingNumber,
      orderId,
      status: 'pending',
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      destination: {
        address,
        commune,
        region: region || 'Región Metropolitana',
        notes,
      },
      zone: zone.id,
      isExpress,
      shippingCost: zone.baseRate * (isExpress ? 1.5 : 1),
      estimatedDelivery: calculateEstimatedDelivery(zone.deliveryTime, isExpress),
      scheduledDate,
      history: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          description: 'Envío creado',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // await saveShipment(shipment);

    res.status(201).json({
      success: true,
      shipment,
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get shipment by tracking number
app.get('/api/shipping/track/:trackingNumber', async (req, res) => {
  const { trackingNumber } = req.params;

  // TODO: Fetch from database
  // const shipment = await getShipmentByTracking(trackingNumber);

  // Mock response for demo
  const mockShipment = {
    trackingNumber,
    orderId: 'order_12345',
    status: 'in_transit',
    statusLabel: DELIVERY_STATUSES['in_transit'].label,
    statusIcon: DELIVERY_STATUSES['in_transit'].icon,
    customer: {
      name: 'María González',
    },
    destination: {
      commune: 'Providencia',
      region: 'Región Metropolitana',
    },
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    history: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        description: 'Envío creado',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        description: 'Pago confirmado',
      },
      {
        status: 'preparing',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Preparando arreglo floral',
      },
      {
        status: 'in_transit',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        description: 'En camino a destino',
        location: 'Centro de distribución Santiago',
      },
    ],
  };

  res.json({
    success: true,
    shipment: mockShipment,
    statusOptions: DELIVERY_STATUSES,
  });
});

// Update shipment status
app.patch('/api/shipping/shipments/:shipmentId/status', async (req, res) => {
  const { shipmentId } = req.params;
  const { status, description, location } = req.body;

  if (!status || !DELIVERY_STATUSES[status]) {
    return res.status(400).json({
      success: false,
      error: 'Estado inválido',
      validStatuses: Object.keys(DELIVERY_STATUSES),
    });
  }

  const statusInfo = DELIVERY_STATUSES[status];

  const update = {
    shipmentId,
    status,
    statusLabel: statusInfo.label,
    statusIcon: statusInfo.icon,
    description: description || `Estado actualizado a: ${statusInfo.label}`,
    location,
    timestamp: new Date().toISOString(),
  };

  // TODO: Update in database
  // await updateShipmentStatus(shipmentId, update);

  // TODO: Send notification to customer
  // await notifyCustomer(shipmentId, status);

  res.json({
    success: true,
    update,
    message: `Envío actualizado a: ${statusInfo.label}`,
  });
});

// Get delivery statuses
app.get('/api/shipping/statuses', (req, res) => {
  res.json({
    success: true,
    statuses: DELIVERY_STATUSES,
  });
});

// List shipments (admin)
app.get('/api/shipping/shipments', async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  // TODO: Fetch from database with pagination
  // const shipments = await listShipments({ status, page, limit });

  // Mock response
  res.json({
    success: true,
    shipments: [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      totalPages: 0,
    },
  });
});

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function generateTrackingNumber() {
  const prefix = 'FV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

function calculateEstimatedDelivery(deliveryTime, isExpress) {
  const now = new Date();

  if (isExpress) {
    // Express: 1-2 hours
    return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  }

  // Parse delivery time (e.g., "2-4 horas", "1-3 días hábiles")
  if (deliveryTime.includes('horas')) {
    const hours = parseInt(deliveryTime.split('-')[1]) || 4;
    return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
  }

  if (deliveryTime.includes('días')) {
    const days = parseInt(deliveryTime.split('-')[1]) || 3;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  // Default: 24 hours
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚚 Shipping Service running on ${HOST}:${PORT}`);
  console.log('📍 Endpoints:');
  console.log('   GET  /health');
  console.log('   GET  /api/shipping/zones');
  console.log('   POST /api/shipping/calculate');
  console.log('   POST /api/shipping/shipments');
  console.log('   GET  /api/shipping/track/:trackingNumber');
  console.log('   PATCH /api/shipping/shipments/:id/status');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down shipping service...');
  process.exit(0);
});

module.exports = app;
