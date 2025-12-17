/**
 * Tests para Promotion Model
 */

const mongoose = require('mongoose');

// Recrear el schema para testing sin MongoDB real
describe('Promotion Model', () => {
  let Promotion;

  beforeAll(() => {
    // Clear require cache
    jest.resetModules();

    // Mock mongoose connect para evitar conexión real
    mongoose.connect = jest.fn().mockResolvedValue({});

    // Re-require después del mock
    Promotion = require('../models/Promotion');
  });

  describe('Schema Validation', () => {
    it('should require name field', () => {
      const promotion = new Promotion({
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.name).toBeDefined();
    });

    it('should require description field', () => {
      const promotion = new Promotion({
        name: 'Test Promo',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.description).toBeDefined();
    });

    it('should require code field', () => {
      const promotion = new Promotion({
        name: 'Test Promo',
        description: 'Test',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.code).toBeDefined();
    });

    it('should require type field', () => {
      const promotion = new Promotion({
        name: 'Test Promo',
        description: 'Test',
        code: 'TEST',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.type).toBeDefined();
    });

    it('should only accept valid type values', () => {
      const validTypes = ['percentage', 'fixed', 'bogo', 'free_shipping'];

      validTypes.forEach((type) => {
        const promotion = new Promotion({
          name: 'Test',
          description: 'Test',
          code: 'TEST',
          type,
          value: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        });

        const errors = promotion.validateSync();
        expect(errors?.errors?.type).toBeUndefined();
      });
    });

    it('should reject invalid type', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'invalid_type',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.type).toBeDefined();
    });

    it('should require value field', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.value).toBeDefined();
    });

    it('should not accept negative value', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: -10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.value).toBeDefined();
    });

    it('should require startDate', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        endDate: new Date(Date.now() + 86400000),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.startDate).toBeDefined();
    });

    it('should require endDate', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
      });

      const errors = promotion.validateSync();
      expect(errors.errors.endDate).toBeDefined();
    });
  });

  describe('Default Values', () => {
    it('should set default minPurchaseAmount to 0', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.minPurchaseAmount).toBe(0);
    });

    it('should set default usageCount to 0', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.usageCount).toBe(0);
    });

    it('should set default perUserLimit to 1', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.perUserLimit).toBe(1);
    });

    it('should set default stackable to false', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.stackable).toBe(false);
    });

    it('should set default autoApply to false', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.autoApply).toBe(false);
    });

    it('should set default active to true', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.active).toBe(true);
    });

    it('should set default priority to 0', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.priority).toBe(0);
    });
  });

  describe('Virtual: isValid', () => {
    it('should return true for valid active promotion', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000), // yesterday
        endDate: new Date(Date.now() + 86400000), // tomorrow
        active: true,
      });

      expect(promotion.isValid).toBe(true);
    });

    it('should return false for inactive promotion', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: false,
      });

      expect(promotion.isValid).toBe(false);
    });

    it('should return false for expired promotion', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 172800000), // 2 days ago
        endDate: new Date(Date.now() - 86400000), // yesterday
        active: true,
      });

      expect(promotion.isValid).toBe(false);
    });

    it('should return false for not yet started promotion', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() + 86400000), // tomorrow
        endDate: new Date(Date.now() + 172800000), // 2 days from now
        active: true,
      });

      expect(promotion.isValid).toBe(false);
    });

    it('should return false when usage limit is reached', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
        usageLimit: 10,
        usageCount: 10,
      });

      expect(promotion.isValid).toBe(false);
    });
  });

  describe('Method: calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
      });

      const discount = promotion.calculateDiscount(1000, []);
      expect(discount).toBe(100); // 10% of 1000
    });

    it('should calculate fixed discount correctly', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'fixed',
        value: 500,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
      });

      const discount = promotion.calculateDiscount(1000, []);
      expect(discount).toBe(500);
    });

    it('should return 0 for free_shipping type', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'free_shipping',
        value: 0,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
      });

      const discount = promotion.calculateDiscount(1000, []);
      expect(discount).toBe(0);
    });

    it('should return 0 when subtotal is below minimum', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
        minPurchaseAmount: 500,
      });

      const discount = promotion.calculateDiscount(100, []);
      expect(discount).toBe(0);
    });

    it('should respect max discount amount', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 50,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
        maxDiscountAmount: 100,
      });

      const discount = promotion.calculateDiscount(1000, []);
      expect(discount).toBe(100); // capped at max
    });

    it('should return 0 for invalid promotion', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: false, // inactive
      });

      const discount = promotion.calculateDiscount(1000, []);
      expect(discount).toBe(0);
    });
  });

  describe('Method: appliesTo', () => {
    it('should return true for product without restrictions', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
      });

      const product = { _id: new mongoose.Types.ObjectId() };
      expect(promotion.appliesTo(product, 'any-category')).toBe(true);
    });

    it('should return false for excluded product', () => {
      const productId = new mongoose.Types.ObjectId();
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
        excludedProducts: [productId],
      });

      const product = { _id: productId };
      expect(promotion.appliesTo(product, 'any-category')).toBe(false);
    });

    it('should return true for included product', () => {
      const productId = new mongoose.Types.ObjectId();
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
        applicableProducts: [productId],
      });

      const product = { _id: productId };
      expect(promotion.appliesTo(product, 'any-category')).toBe(true);
    });

    it('should return false for non-included product when list exists', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
        applicableProducts: [new mongoose.Types.ObjectId()],
      });

      const product = { _id: new mongoose.Types.ObjectId() };
      expect(promotion.appliesTo(product, 'any-category')).toBe(false);
    });

    it('should return true for applicable category', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
        applicableCategories: ['roses', 'tulips'],
      });

      const product = { _id: new mongoose.Types.ObjectId() };
      expect(promotion.appliesTo(product, 'roses')).toBe(true);
    });

    it('should return false for non-applicable category', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'TEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        active: true,
        applicableCategories: ['roses', 'tulips'],
      });

      const product = { _id: new mongoose.Types.ObjectId() };
      expect(promotion.appliesTo(product, 'orchids')).toBe(false);
    });
  });

  describe('Code Transformation', () => {
    it('should uppercase code on creation', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: 'lowercase',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.code).toBe('LOWERCASE');
    });

    it('should trim whitespace from code', () => {
      const promotion = new Promotion({
        name: 'Test',
        description: 'Test',
        code: '  SPACES  ',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(promotion.code).toBe('SPACES');
    });
  });
});
