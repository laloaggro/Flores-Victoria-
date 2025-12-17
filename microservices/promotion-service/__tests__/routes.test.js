/**
 * Tests completos para Promotion Routes
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock model methods
let mockFind = jest.fn();
let mockFindOne = jest.fn();
let mockFindById = jest.fn();
let mockFindByIdAndUpdate = jest.fn();
let mockFindByIdAndDelete = jest.fn();
let mockCountDocuments = jest.fn();
let mockSave = jest.fn();

// Mock mongoose model
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue({}),
    model: jest.fn(),
  };
});

// Mock Promotion model
jest.mock('../models/Promotion', () => {
  const mockModel = function (data) {
    return {
      ...data,
      save: mockSave,
    };
  };
  mockModel.find = mockFind;
  mockModel.findOne = mockFindOne;
  mockModel.findById = mockFindById;
  mockModel.findByIdAndUpdate = mockFindByIdAndUpdate;
  mockModel.findByIdAndDelete = mockFindByIdAndDelete;
  mockModel.countDocuments = mockCountDocuments;
  return mockModel;
});

const promotionRoutes = require('../routes');

describe('Promotion Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/promotions', promotionRoutes);

    // Default mock implementations
    mockFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
        limit: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
    mockCountDocuments.mockResolvedValue(0);
    mockSave.mockResolvedValue({});
  });

  // ═══════════════════════════════════════════════════════════════
  // GET /api/promotions - List promotions
  // ═══════════════════════════════════════════════════════════════

  describe('GET /api/promotions', () => {
    it('should return empty list when no promotions', async () => {
      const response = await request(app)
        .get('/api/promotions')
        .expect(200);

      expect(response.body.promotions).toEqual([]);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return promotions with pagination', async () => {
      const mockPromotions = [
        { code: 'PROMO1', name: 'Test Promo 1' },
        { code: 'PROMO2', name: 'Test Promo 2' },
      ];

      mockFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockPromotions),
          }),
        }),
      });
      mockCountDocuments.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/promotions')
        .expect(200);

      expect(response.body.promotions).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter by active status', async () => {
      await request(app)
        .get('/api/promotions?active=true')
        .expect(200);

      expect(mockFind).toHaveBeenCalledWith({ active: true });
    });

    it('should filter by autoApply', async () => {
      await request(app)
        .get('/api/promotions?autoApply=true')
        .expect(200);

      expect(mockFind).toHaveBeenCalledWith({ autoApply: true });
    });

    it('should handle pagination parameters', async () => {
      await request(app)
        .get('/api/promotions?page=2&limit=10')
        .expect(200);

      const sortMock = mockFind.mock.results[0].value.sort;
      expect(sortMock).toHaveBeenCalled();
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app)
        .get('/api/promotions?page=0')
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/api/promotions?limit=101')
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GET /api/promotions/active - Active promotions
  // ═══════════════════════════════════════════════════════════════

  describe('GET /api/promotions/active', () => {
    it('should return active promotions', async () => {
      mockFind.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { code: 'ACTIVE1', active: true },
        ]),
      });

      const response = await request(app)
        .get('/api/promotions/active')
        .expect(200);

      expect(response.body.promotions).toBeDefined();
    });

    it('should handle database errors', async () => {
      mockFind.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const response = await request(app)
        .get('/api/promotions/active')
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GET /api/promotions/:code - Get by code
  // ═══════════════════════════════════════════════════════════════

  describe('GET /api/promotions/:code', () => {
    it('should return promotion by code', async () => {
      const mockPromo = { code: 'TESTCODE', name: 'Test Promotion' };
      mockFindOne.mockResolvedValue(mockPromo);

      const response = await request(app)
        .get('/api/promotions/testcode')
        .expect(200);

      expect(response.body.promotion.code).toBe('TESTCODE');
      expect(mockFindOne).toHaveBeenCalledWith({ code: 'TESTCODE' });
    });

    it('should return 404 when promotion not found', async () => {
      mockFindOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/promotions/INVALID')
        .expect(404);

      expect(response.body.error).toBe('Promoción no encontrada');
    });

    it('should uppercase the code before search', async () => {
      mockFindOne.mockResolvedValue({ code: 'LOWERCASE' });

      await request(app)
        .get('/api/promotions/lowercase')
        .expect(200);

      expect(mockFindOne).toHaveBeenCalledWith({ code: 'LOWERCASE' });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // POST /api/promotions/validate - Validate code
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/promotions/validate', () => {
    const futureDate = new Date(Date.now() + 86400000);
    const pastDate = new Date(Date.now() - 86400000);
    const now = new Date();

    const validPromotion = {
      code: 'VALID10',
      name: 'Valid Promo',
      active: true,
      startDate: pastDate,
      endDate: futureDate,
      type: 'percentage',
      value: 10,
      minPurchaseAmount: 100,
      usageLimit: null,
      usageCount: 0,
      calculateDiscount: jest.fn().mockReturnValue(100),
    };

    it('should validate promotion code successfully', async () => {
      mockFindOne.mockResolvedValue(validPromotion);

      const response = await request(app)
        .post('/api/promotions/validate')
        .send({
          code: 'VALID10',
          subtotal: 1000,
        })
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.promotion.code).toBe('VALID10');
    });

    it('should return 404 for invalid code', async () => {
      mockFindOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/promotions/validate')
        .send({
          code: 'INVALID',
          subtotal: 1000,
        })
        .expect(404);

      expect(response.body.valid).toBe(false);
    });

    it('should return 400 for inactive promotion', async () => {
      mockFindOne.mockResolvedValue({ ...validPromotion, active: false });

      const response = await request(app)
        .post('/api/promotions/validate')
        .send({
          code: 'INACTIVE',
          subtotal: 1000,
        })
        .expect(400);

      expect(response.body.valid).toBe(false);
    });

    it('should return 400 for expired promotion', async () => {
      mockFindOne.mockResolvedValue({
        ...validPromotion,
        endDate: pastDate,
      });

      const response = await request(app)
        .post('/api/promotions/validate')
        .send({
          code: 'EXPIRED',
          subtotal: 1000,
        })
        .expect(400);

      expect(response.body.error).toContain('expirado');
    });

    it('should return 400 for promotion not yet started', async () => {
      mockFindOne.mockResolvedValue({
        ...validPromotion,
        startDate: futureDate,
      });

      const response = await request(app)
        .post('/api/promotions/validate')
        .send({
          code: 'NOTSTARTED',
          subtotal: 1000,
        })
        .expect(400);

      expect(response.body.error).toContain('comenzado');
    });

    it('should return 400 for exceeded usage limit', async () => {
      mockFindOne.mockResolvedValue({
        ...validPromotion,
        usageLimit: 10,
        usageCount: 10,
      });

      const response = await request(app)
        .post('/api/promotions/validate')
        .send({
          code: 'MAXUSED',
          subtotal: 1000,
        })
        .expect(400);

      expect(response.body.error).toContain('límite');
    });

    it('should return 400 for minimum purchase not met', async () => {
      mockFindOne.mockResolvedValue({
        ...validPromotion,
        minPurchaseAmount: 500,
      });

      const response = await request(app)
        .post('/api/promotions/validate')
        .send({
          code: 'MINPURCHASE',
          subtotal: 100,
        })
        .expect(400);

      expect(response.body.error).toContain('mínima');
    });

    it('should return 400 when code is missing', async () => {
      const response = await request(app)
        .post('/api/promotions/validate')
        .send({ subtotal: 1000 })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 when subtotal is missing', async () => {
      const response = await request(app)
        .post('/api/promotions/validate')
        .send({ code: 'TEST' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 when subtotal is negative', async () => {
      const response = await request(app)
        .post('/api/promotions/validate')
        .send({ code: 'TEST', subtotal: -100 })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // POST /api/promotions - Create promotion
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/promotions', () => {
    const validPromotionData = {
      name: 'New Promotion',
      description: 'Description here',
      code: 'NEWPROMO',
      type: 'percentage',
      value: 15,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
    };

    it('should create promotion successfully', async () => {
      mockSave.mockResolvedValue(validPromotionData);

      const response = await request(app)
        .post('/api/promotions')
        .send(validPromotionData)
        .expect(201);

      expect(response.body.message).toContain('creada');
    });

    it('should uppercase the code', async () => {
      mockSave.mockResolvedValue({ ...validPromotionData, code: 'LOWERCASE' });

      await request(app)
        .post('/api/promotions')
        .send({ ...validPromotionData, code: 'lowercase' })
        .expect(201);
    });

    it('should return 400 for duplicate code', async () => {
      const duplicateError = new Error('Duplicate');
      duplicateError.code = 11000;
      mockSave.mockRejectedValue(duplicateError);

      const response = await request(app)
        .post('/api/promotions')
        .send(validPromotionData)
        .expect(400);

      expect(response.body.error).toContain('existe');
    });

    it('should return 400 when name is missing', async () => {
      const { name, ...dataWithoutName } = validPromotionData;

      const response = await request(app)
        .post('/api/promotions')
        .send(dataWithoutName)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/promotions')
        .send({ ...validPromotionData, type: 'invalid' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should accept all valid types', async () => {
      const types = ['percentage', 'fixed', 'bogo', 'free_shipping'];

      for (const type of types) {
        mockSave.mockResolvedValue({ ...validPromotionData, type });

        const response = await request(app)
          .post('/api/promotions')
          .send({ ...validPromotionData, type })
          .expect(201);

        expect(response.body.promotion).toBeDefined();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PUT /api/promotions/:id - Update promotion
  // ═══════════════════════════════════════════════════════════════

  describe('PUT /api/promotions/:id', () => {
    it('should update promotion successfully', async () => {
      const updatedPromo = { code: 'TEST', name: 'Updated Name' };
      mockFindByIdAndUpdate.mockResolvedValue(updatedPromo);

      const response = await request(app)
        .put('/api/promotions/507f1f77bcf86cd799439011')
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.message).toContain('actualizada');
    });

    it('should return 404 when promotion not found', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/promotions/507f1f77bcf86cd799439011')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.error).toBe('Promoción no encontrada');
    });

    it('should update active status', async () => {
      mockFindByIdAndUpdate.mockResolvedValue({ active: false });

      await request(app)
        .put('/api/promotions/507f1f77bcf86cd799439011')
        .send({ active: false })
        .expect(200);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $set: { active: false } },
        { new: true, runValidators: true }
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // DELETE /api/promotions/:id - Delete promotion
  // ═══════════════════════════════════════════════════════════════

  describe('DELETE /api/promotions/:id', () => {
    it('should delete promotion successfully', async () => {
      mockFindByIdAndDelete.mockResolvedValue({ code: 'DELETED' });

      const response = await request(app)
        .delete('/api/promotions/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body.message).toContain('eliminada');
    });

    it('should return 404 when promotion not found', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/promotions/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.error).toBe('Promoción no encontrada');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // POST /api/promotions/:id/apply - Apply promotion
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/promotions/:id/apply', () => {
    it('should increment usage count', async () => {
      mockFindByIdAndUpdate.mockResolvedValue({
        code: 'APPLIED',
        usageCount: 1,
      });

      const response = await request(app)
        .post('/api/promotions/507f1f77bcf86cd799439011/apply')
        .expect(200);

      expect(response.body.message).toContain('aplicada');
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $inc: { usageCount: 1 } },
        { new: true }
      );
    });

    it('should return 404 when promotion not found', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/promotions/507f1f77bcf86cd799439011/apply')
        .expect(404);

      expect(response.body.error).toBe('Promoción no encontrada');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GET /api/promotions/stats/overview - Statistics
  // ═══════════════════════════════════════════════════════════════

  describe('GET /api/promotions/stats/overview', () => {
    it('should return promotion statistics', async () => {
      mockCountDocuments
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20)  // active
        .mockResolvedValueOnce(50)  // expired
        .mockResolvedValueOnce(30); // upcoming

      mockFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([
              { code: 'TOP1', usageCount: 100 },
            ]),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/promotions/stats/overview')
        .expect(200);

      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBe(100);
      expect(response.body.stats.active).toBe(20);
      expect(response.body.topPromotions).toBeDefined();
    });

    it('should handle database errors', async () => {
      mockCountDocuments.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/promotions/stats/overview')
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });
});
