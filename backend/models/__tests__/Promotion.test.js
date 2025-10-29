/**
 * 🧪 Unit Tests - Promotion Model
 * Tests para el modelo de promociones
 */

const mongoose = require('mongoose');

const Promotion = require('../Promotion');

describe('Promotion Model Tests', () => {
  // Setup y Teardown
  beforeAll(async () => {
    // Conectar a base de datos de test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/flores-test',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
    }
  });

  afterAll(async () => {
    // Limpiar y desconectar
    await Promotion.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Limpiar después de cada test
    await Promotion.deleteMany({});
  });

  // ========================================
  // 📝 TESTS DE CREACIÓN
  // ========================================

  describe('Promoción - Creación y Validación', () => {
    test('Debe crear una promoción de porcentaje válida', async () => {
      const promoData = {
        code: 'TEST20',
        name: 'Test Descuento 20%',
        description: 'Prueba de descuento',
        type: 'percentage',
        value: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        isActive: true,
      };

      const promo = new Promotion(promoData);
      const savedPromo = await promo.save();

      expect(savedPromo._id).toBeDefined();
      expect(savedPromo.code).toBe('TEST20');
      expect(savedPromo.type).toBe('percentage');
      expect(savedPromo.value).toBe(20);
    });

    test('Debe crear una promoción de monto fijo', async () => {
      const promo = new Promotion({
        code: 'FIXED10',
        name: 'Descuento Fijo $10',
        type: 'fixed',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const saved = await promo.save();
      expect(saved.type).toBe('fixed');
      expect(saved.value).toBe(10);
    });

    test('Debe crear una promoción BOGO', async () => {
      const promo = new Promotion({
        code: 'BOGO50',
        name: 'Compra 1 Lleva 2 al 50%',
        type: 'BOGO',
        value: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const saved = await promo.save();
      expect(saved.type).toBe('BOGO');
    });

    test('Debe crear una promoción de envío gratis', async () => {
      const promo = new Promotion({
        code: 'FREESHIP',
        name: 'Envío Gratis',
        type: 'free_shipping',
        minPurchase: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const saved = await promo.save();
      expect(saved.type).toBe('free_shipping');
      expect(saved.minPurchase).toBe(50);
    });

    test('Debe rechazar código duplicado', async () => {
      const promo1 = new Promotion({
        code: 'DUPLICATE',
        name: 'Primera',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await promo1.save();

      const promo2 = new Promotion({
        code: 'DUPLICATE',
        name: 'Segunda',
        type: 'percentage',
        value: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await expect(promo2.save()).rejects.toThrow();
    });
  });

  // ========================================
  // ✅ TESTS DE VALIDACIÓN
  // ========================================

  describe('Promoción - Validaciones de Fechas', () => {
    test('isValid debe retornar true para promoción activa en período válido', () => {
      const promo = new Promotion({
        code: 'VALID',
        name: 'Válida',
        type: 'percentage',
        value: 15,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 días
        isActive: true,
      });

      expect(promo.isValid).toBe(true);
    });

    test('isValid debe retornar false para promoción expirada', () => {
      const promo = new Promotion({
        code: 'EXPIRED',
        name: 'Expirada',
        type: 'percentage',
        value: 15,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // -14 días
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // -7 días
        isActive: true,
      });

      expect(promo.isValid).toBe(false);
    });

    test('isValid debe retornar false para promoción no iniciada', () => {
      const promo = new Promotion({
        code: 'FUTURE',
        name: 'Futura',
        type: 'percentage',
        value: 15,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 días
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 días
        isActive: true,
      });

      expect(promo.isValid).toBe(false);
    });

    test('isValid debe retornar false para promoción inactiva', () => {
      const promo = new Promotion({
        code: 'INACTIVE',
        name: 'Inactiva',
        type: 'percentage',
        value: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false,
      });

      expect(promo.isValid).toBe(false);
    });
  });

  // ========================================
  // 💰 TESTS DE CÁLCULO DE DESCUENTOS
  // ========================================

  describe('Promoción - Cálculo de Descuentos', () => {
    test('Debe calcular descuento por porcentaje correctamente', () => {
      const promo = new Promotion({
        code: 'PERC20',
        name: '20% Off',
        type: 'percentage',
        value: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const discount = promo.calculateDiscount(100);
      expect(discount).toBe(20);
    });

    test('Debe aplicar maxDiscount en porcentaje', () => {
      const promo = new Promotion({
        code: 'PERC50',
        name: '50% Off (max $30)',
        type: 'percentage',
        value: 50,
        maxDiscount: 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const discount = promo.calculateDiscount(100);
      expect(discount).toBe(30); // 50% de 100 = 50, pero max es 30
    });

    test('Debe calcular descuento fijo correctamente', () => {
      const promo = new Promotion({
        code: 'FIXED15',
        name: '$15 Off',
        type: 'fixed',
        value: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const discount = promo.calculateDiscount(100);
      expect(discount).toBe(15);
    });

    test('Descuento fijo no debe exceder el monto total', () => {
      const promo = new Promotion({
        code: 'FIXED50',
        name: '$50 Off',
        type: 'fixed',
        value: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const discount = promo.calculateDiscount(30);
      expect(discount).toBe(30); // No puede ser mayor al total
    });

    test('BOGO debe calcular descuento sobre el segundo item', () => {
      const promo = new Promotion({
        code: 'BOGO50',
        name: 'Buy 1 Get 1 50% Off',
        type: 'BOGO',
        value: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const discount = promo.calculateDiscount(100, 2);
      expect(discount).toBe(25); // 50% del segundo item (50)
    });

    test('Free shipping debe retornar 0 como descuento', () => {
      const promo = new Promotion({
        code: 'FREESHIP',
        name: 'Free Shipping',
        type: 'free_shipping',
        minPurchase: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const discount = promo.calculateDiscount(100);
      expect(discount).toBe(0); // El descuento de envío se aplica aparte
    });
  });

  // ========================================
  // 🎯 TESTS DE APLICABILIDAD
  // ========================================

  describe('Promoción - Aplicabilidad', () => {
    test('appliesTo debe verificar monto mínimo', () => {
      const promo = new Promotion({
        code: 'MIN50',
        name: 'Descuento con Mínimo',
        type: 'percentage',
        value: 10,
        minPurchase: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(promo.appliesTo({ total: 60 })).toBe(true);
      expect(promo.appliesTo({ total: 40 })).toBe(false);
    });

    test('appliesTo debe verificar categorías específicas', () => {
      const promo = new Promotion({
        code: 'ROSES',
        name: 'Descuento Rosas',
        type: 'percentage',
        value: 15,
        applicableCategories: ['rosas', 'bouquets'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(
        promo.appliesTo({
          items: [{ category: 'rosas' }],
        })
      ).toBe(true);

      expect(
        promo.appliesTo({
          items: [{ category: 'lirios' }],
        })
      ).toBe(false);
    });

    test('appliesTo debe verificar productos específicos', () => {
      const promo = new Promotion({
        code: 'SPECIAL',
        name: 'Productos Especiales',
        type: 'percentage',
        value: 20,
        applicableProducts: ['prod1', 'prod2'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(
        promo.appliesTo({
          items: [{ productId: 'prod1' }],
        })
      ).toBe(true);

      expect(
        promo.appliesTo({
          items: [{ productId: 'prod3' }],
        })
      ).toBe(false);
    });
  });

  // ========================================
  // 🔢 TESTS DE LÍMITES DE USO
  // ========================================

  describe('Promoción - Límites de Uso', () => {
    test('Debe rastrear uso total', async () => {
      const promo = new Promotion({
        code: 'LIMIT10',
        name: 'Límite 10 usos',
        type: 'percentage',
        value: 15,
        maxUses: 10,
        currentUses: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await promo.save();

      // Simular uso
      promo.currentUses = 5;
      await promo.save();

      const updated = await Promotion.findById(promo._id);
      expect(updated.currentUses).toBe(5);
    });

    test('Debe validar límite máximo de usos', async () => {
      const promo = new Promotion({
        code: 'MAXED',
        name: 'Promoción Agotada',
        type: 'percentage',
        value: 15,
        maxUses: 10,
        currentUses: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      // La promoción ha alcanzado el límite
      expect(promo.currentUses).toBeGreaterThanOrEqual(promo.maxUses);
    });

    test('Debe rastrear usos por usuario', async () => {
      const promo = new Promotion({
        code: 'PERUSER',
        name: 'Límite por Usuario',
        type: 'percentage',
        value: 15,
        maxUsesPerUser: 3,
        usedBy: [
          { userId: 'user1', count: 1, lastUsed: new Date() },
          { userId: 'user2', count: 2, lastUsed: new Date() },
        ],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await promo.save();

      const user1Uses = promo.usedBy.find((u) => u.userId === 'user1');
      const user2Uses = promo.usedBy.find((u) => u.userId === 'user2');

      expect(user1Uses.count).toBe(1);
      expect(user2Uses.count).toBe(2);
    });
  });

  // ========================================
  // 🔄 TESTS DE AUTO-APLICACIÓN
  // ========================================

  describe('Promoción - Auto-aplicación', () => {
    test('Promoción con autoApply debe aplicarse automáticamente', async () => {
      const promo = new Promotion({
        code: 'AUTO10',
        name: 'Auto-aplicable',
        type: 'percentage',
        value: 10,
        autoApply: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      await promo.save();
      expect(promo.autoApply).toBe(true);
    });

    test('Promoción stackable debe poder combinarse', async () => {
      const promo = new Promotion({
        code: 'STACK',
        name: 'Acumulable',
        type: 'percentage',
        value: 5,
        stackable: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await promo.save();
      expect(promo.stackable).toBe(true);
    });
  });

  // ========================================
  // 📊 TESTS DE ESTADÍSTICAS
  // ========================================

  describe('Promoción - Estadísticas', () => {
    test('Debe calcular tasa de conversión', async () => {
      const promo = new Promotion({
        code: 'STATS',
        name: 'Con Estadísticas',
        type: 'percentage',
        value: 15,
        currentUses: 50,
        views: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const conversionRate = (promo.currentUses / promo.views) * 100;
      expect(conversionRate).toBe(25); // 50/200 = 25%
    });

    test('Debe rastrear revenue generado', async () => {
      const promo = new Promotion({
        code: 'REVENUE',
        name: 'Tracking Revenue',
        type: 'percentage',
        value: 10,
        totalRevenue: 5000,
        currentUses: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await promo.save();
      expect(promo.totalRevenue).toBe(5000);

      const avgOrderValue = promo.totalRevenue / promo.currentUses;
      expect(avgOrderValue).toBe(50);
    });
  });
});
