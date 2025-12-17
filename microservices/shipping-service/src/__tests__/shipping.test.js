/**
 * Tests for Shipping Service
 */

const request = require('supertest');
const express = require('express');

// Create a test app with the same routes as server.js
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Shipping zones from server.js
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

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'shipping-service',
      timestamp: new Date().toISOString(),
    });
  });

  // Get shipping zones
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
    const { commune, weight = 1, isExpress = false } = req.body;

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
  app.post('/api/shipping/shipments', (req, res) => {
    const {
      orderId,
      customerName,
      address,
      commune,
      region,
      isExpress = false,
    } = req.body;

    if (!orderId || !customerName || !address || !commune) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: orderId, customerName, address, commune',
      });
    }

    // Find zone
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
      trackingNumber: `FV${Date.now().toString().slice(-10)}`,
      orderId,
      status: 'pending',
      zone: zone.id,
      isExpress,
      shippingCost: zone.baseRate * (isExpress ? 1.5 : 1),
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      shipment,
    });
  });

  return app;
};

describe('Shipping Service', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('shipping-service');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/shipping/zones', () => {
    it('should return all shipping zones', async () => {
      const response = await request(app).get('/api/shipping/zones');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.zones).toBeInstanceOf(Array);
      expect(response.body.zones.length).toBe(5);
    });

    it('should include santiago_centro zone', async () => {
      const response = await request(app).get('/api/shipping/zones');

      const santiagoCentro = response.body.zones.find((z) => z.id === 'santiago_centro');
      expect(santiagoCentro).toBeDefined();
      expect(santiagoCentro.baseRate).toBe(3990);
      expect(santiagoCentro.communes).toContain('Providencia');
    });
  });

  describe('POST /api/shipping/calculate', () => {
    it('should calculate shipping for Santiago Centro commune', async () => {
      const response = await request(app)
        .post('/api/shipping/calculate')
        .send({ commune: 'Providencia' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.shipping.zone).toBe('santiago_centro');
      expect(response.body.shipping.price).toBe(3990);
    });

    it('should calculate shipping for Santiago Sur commune', async () => {
      const response = await request(app)
        .post('/api/shipping/calculate')
        .send({ commune: 'Puente Alto' });

      expect(response.status).toBe(200);
      expect(response.body.shipping.zone).toBe('santiago_sur');
      expect(response.body.shipping.price).toBe(4990);
    });

    it('should return regiones rate for unknown commune', async () => {
      const response = await request(app)
        .post('/api/shipping/calculate')
        .send({ commune: 'Valparaíso' });

      expect(response.status).toBe(200);
      expect(response.body.shipping.zone).toBe('regiones');
      expect(response.body.shipping.price).toBe(9990);
    });

    it('should apply express surcharge', async () => {
      const response = await request(app)
        .post('/api/shipping/calculate')
        .send({ commune: 'Providencia', isExpress: true });

      expect(response.status).toBe(200);
      expect(response.body.shipping.isExpress).toBe(true);
      expect(response.body.shipping.price).toBe(5985); // 3990 * 1.5
      expect(response.body.shipping.deliveryTime).toBe('1-2 horas');
    });

    it('should apply weight surcharge', async () => {
      const response = await request(app)
        .post('/api/shipping/calculate')
        .send({ commune: 'Providencia', weight: 10 });

      expect(response.status).toBe(200);
      // Base: 3990 + weight surcharge: 1000 (for 5kg over)
      expect(response.body.shipping.price).toBe(4990);
    });

    it('should return 400 when commune is missing', async () => {
      const response = await request(app)
        .post('/api/shipping/calculate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Se requiere la comuna de destino');
    });
  });

  describe('POST /api/shipping/shipments', () => {
    it('should create a new shipment', async () => {
      const response = await request(app)
        .post('/api/shipping/shipments')
        .send({
          orderId: 'order_123',
          customerName: 'María González',
          address: 'Av. Providencia 1234',
          commune: 'Providencia',
          region: 'Región Metropolitana',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.shipment.orderId).toBe('order_123');
      expect(response.body.shipment.status).toBe('pending');
      expect(response.body.shipment.trackingNumber).toBeDefined();
      expect(response.body.shipment.zone).toBe('santiago_centro');
    });

    it('should create express shipment with surcharge', async () => {
      const response = await request(app)
        .post('/api/shipping/shipments')
        .send({
          orderId: 'order_124',
          customerName: 'Juan Pérez',
          address: 'Calle Los Leones 567',
          commune: 'Las Condes',
          isExpress: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.shipment.isExpress).toBe(true);
      expect(response.body.shipment.shippingCost).toBe(5985); // 3990 * 1.5
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/shipping/shipments')
        .send({
          orderId: 'order_123',
          // missing customerName, address, commune
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('campos requeridos');
    });

    it('should assign regiones zone for unknown commune', async () => {
      const response = await request(app)
        .post('/api/shipping/shipments')
        .send({
          orderId: 'order_125',
          customerName: 'Ana Silva',
          address: 'Calle Principal 100',
          commune: 'Concepción',
          region: 'Biobío',
        });

      expect(response.status).toBe(201);
      expect(response.body.shipment.zone).toBe('regiones');
      expect(response.body.shipment.shippingCost).toBe(9990);
    });
  });
});
