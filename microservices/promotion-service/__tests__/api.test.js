/**
 * 🧪 Integration Tests - Promotion Service API
 * Tests de integración para los endpoints de promociones
 */

const mongoose = require('mongoose');
const request = require('supertest');
const Promotion = require('../models/Promotion');
const app = require('../server');

describe('Promotion Service API Integration Tests', () => {
  let server;
  let testPromo;

  beforeAll(async () => {
    // Conectar a base de datos de test
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/flores-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Iniciar servidor
    server = app.listen(3019);
  });

  afterAll(async () => {
    await Promotion.deleteMany({});
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    await Promotion.deleteMany({});

    // Crear promoción de prueba
    testPromo = await Promotion.create({
      code: 'TEST20',
      name: 'Test Discount',
      description: 'Test promotion',
      type: 'percentage',
      value: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
  });

  // ========================================
  // GET /api/promotions - Listar todas
  // ========================================

  describe('GET /api/promotions', () => {
    test('Debe retornar todas las promociones', async () => {
      const response = await request(app).get('/api/promotions').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.promotions).toHaveLength(1);
      expect(response.body.promotions[0].code).toBe('TEST20');
    });

    test('Debe soportar paginación', async () => {
      // Crear más promociones
      for (let i = 1; i <= 5; i++) {
        await Promotion.create({
          code: `PROMO${i}`,
          name: `Promo ${i}`,
          type: 'percentage',
          value: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }

      const response = await request(app).get('/api/promotions?page=1&limit=3').expect(200);

      expect(response.body.promotions).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(6);
    });

    test('Debe filtrar por estado activo', async () => {
      await Promotion.create({
        code: 'INACTIVE',
        name: 'Inactive Promo',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false,
      });

      const response = await request(app).get('/api/promotions?active=true').expect(200);

      expect(response.body.promotions.every((p) => p.isActive)).toBe(true);
    });
  });

  // ========================================
  // POST /api/promotions - Crear nueva
  // ========================================

  describe('POST /api/promotions', () => {
    test('Debe crear una nueva promoción válida', async () => {
      const newPromo = {
        code: 'NEWPROMO',
        name: 'Nueva Promoción',
        description: 'Descripción de prueba',
        type: 'percentage',
        value: 15,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app).post('/api/promotions').send(newPromo).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.promotion.code).toBe('NEWPROMO');
      expect(response.body.promotion.value).toBe(15);
    });

    test('Debe rechazar código duplicado', async () => {
      const duplicatePromo = {
        code: 'TEST20', // Ya existe
        name: 'Duplicada',
        type: 'percentage',
        value: 10,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await request(app).post('/api/promotions').send(duplicatePromo).expect(400);
    });

    test('Debe validar campos requeridos', async () => {
      const invalidPromo = {
        name: 'Sin código',
        type: 'percentage',
        value: 10,
      };

      const response = await request(app).post('/api/promotions').send(invalidPromo).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ========================================
  // GET /api/promotions/:id - Obtener por ID
  // ========================================

  describe('GET /api/promotions/:id', () => {
    test('Debe retornar una promoción por ID', async () => {
      const response = await request(app).get(`/api/promotions/${testPromo._id}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.promotion.code).toBe('TEST20');
    });

    test('Debe retornar 404 si no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app).get(`/api/promotions/${fakeId}`).expect(404);
    });
  });

  // ========================================
  // PUT /api/promotions/:id - Actualizar
  // ========================================

  describe('PUT /api/promotions/:id', () => {
    test('Debe actualizar una promoción existente', async () => {
      const updates = {
        name: 'Nombre Actualizado',
        value: 25,
      };

      const response = await request(app)
        .put(`/api/promotions/${testPromo._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.promotion.name).toBe('Nombre Actualizado');
      expect(response.body.promotion.value).toBe(25);
    });

    test('Debe retornar 404 si no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app).put(`/api/promotions/${fakeId}`).send({ name: 'Test' }).expect(404);
    });
  });

  // ========================================
  // DELETE /api/promotions/:id - Eliminar
  // ========================================

  describe('DELETE /api/promotions/:id', () => {
    test('Debe eliminar una promoción', async () => {
      await request(app).delete(`/api/promotions/${testPromo._id}`).expect(200);

      const deleted = await Promotion.findById(testPromo._id);
      expect(deleted).toBeNull();
    });

    test('Debe retornar 404 si no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app).delete(`/api/promotions/${fakeId}`).expect(404);
    });
  });

  // ========================================
  // POST /api/promotions/validate - Validar código
  // ========================================

  describe('POST /api/promotions/validate', () => {
    test('Debe validar un código válido', async () => {
      const response = await request(app)
        .post('/api/promotions/validate')
        .send({ code: 'TEST20' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);
      expect(response.body.promotion.code).toBe('TEST20');
    });

    test('Debe rechazar código inválido', async () => {
      const response = await request(app)
        .post('/api/promotions/validate')
        .send({ code: 'NOEXISTE' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.valid).toBe(false);
    });

    test('Debe validar monto mínimo', async () => {
      const promoWithMin = await Promotion.create({
        code: 'MIN50',
        name: 'Mínimo $50',
        type: 'percentage',
        value: 10,
        minPurchase: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      const response = await request(app)
        .post('/api/promotions/validate')
        .send({
          code: 'MIN50',
          cartTotal: 30,
        })
        .expect(200);

      expect(response.body.valid).toBe(false);
      expect(response.body.message).toContain('mínimo');
    });
  });

  // ========================================
  // GET /api/promotions/active - Listar activas
  // ========================================

  describe('GET /api/promotions/active', () => {
    test('Debe retornar solo promociones activas y válidas', async () => {
      // Crear promociones de prueba
      await Promotion.create([
        {
          code: 'ACTIVE1',
          name: 'Activa 1',
          type: 'percentage',
          value: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        {
          code: 'INACTIVE1',
          name: 'Inactiva',
          type: 'percentage',
          value: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: false,
        },
        {
          code: 'EXPIRED1',
          name: 'Expirada',
          type: 'percentage',
          value: 10,
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      ]);

      const response = await request(app).get('/api/promotions/active').expect(200);

      expect(response.body.success).toBe(true);
      // Solo TEST20 y ACTIVE1 deben retornarse
      expect(response.body.promotions.length).toBeGreaterThanOrEqual(2);
      expect(response.body.promotions.every((p) => p.isActive)).toBe(true);
    });
  });

  // ========================================
  // POST /api/promotions/:id/use - Registrar uso
  // ========================================

  describe('POST /api/promotions/:id/use', () => {
    test('Debe incrementar el contador de usos', async () => {
      const initialUses = testPromo.currentUses || 0;

      const response = await request(app)
        .post(`/api/promotions/${testPromo._id}/use`)
        .send({ userId: 'user123' })
        .expect(200);

      expect(response.body.success).toBe(true);

      const updated = await Promotion.findById(testPromo._id);
      expect(updated.currentUses).toBe(initialUses + 1);
    });

    test('Debe rastrear uso por usuario', async () => {
      await request(app)
        .post(`/api/promotions/${testPromo._id}/use`)
        .send({ userId: 'user123' })
        .expect(200);

      const updated = await Promotion.findById(testPromo._id);
      const userUsage = updated.usedBy.find((u) => u.userId === 'user123');

      expect(userUsage).toBeDefined();
      expect(userUsage.count).toBe(1);
    });

    test('Debe rechazar si se alcanzó el límite máximo', async () => {
      // Actualizar promoción con límite
      testPromo.maxUses = 5;
      testPromo.currentUses = 5;
      await testPromo.save();

      const response = await request(app)
        .post(`/api/promotions/${testPromo._id}/use`)
        .send({ userId: 'user123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('límite');
    });
  });

  // ========================================
  // GET /api/promotions/:id/stats - Estadísticas
  // ========================================

  describe('GET /api/promotions/:id/stats', () => {
    test('Debe retornar estadísticas de una promoción', async () => {
      // Actualizar con datos de estadísticas
      testPromo.currentUses = 50;
      testPromo.views = 200;
      testPromo.totalRevenue = 5000;
      await testPromo.save();

      const response = await request(app).get(`/api/promotions/${testPromo._id}/stats`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.totalUses).toBe(50);
      expect(response.body.stats.views).toBe(200);
      expect(response.body.stats.conversionRate).toBe(25);
    });
  });

  // ========================================
  // GET /api/promotions/analytics - Analytics generales
  // ========================================

  describe('GET /api/promotions/analytics', () => {
    test('Debe retornar analytics del sistema', async () => {
      // Crear varias promociones con datos
      await Promotion.create([
        {
          code: 'ANAL1',
          name: 'Analytics 1',
          type: 'percentage',
          value: 10,
          currentUses: 30,
          totalRevenue: 3000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        {
          code: 'ANAL2',
          name: 'Analytics 2',
          type: 'fixed',
          value: 15,
          currentUses: 20,
          totalRevenue: 2000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      ]);

      const response = await request(app).get('/api/promotions/analytics').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.analytics).toBeDefined();
      expect(response.body.analytics.totalPromotions).toBeGreaterThanOrEqual(3);
    });
  });
});
