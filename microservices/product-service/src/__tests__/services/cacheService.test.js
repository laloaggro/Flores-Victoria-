/**
 * Comprehensive tests for Cache Service
 * Target: 14.16% → 70% coverage
 */

const redis = require('redis');
const { CacheMetrics } = require('../../shared/cache/config');

// Mock redis client
jest.mock('redis');

// Mock logger
jest.mock('../../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock the CacheService module to access the class
jest.mock('../../../../shared/cache/config', () => ({
  CACHE_TTL: {
    PRODUCT_LIST: 300,
    PRODUCT_DETAIL: 600,
  },
  CacheMetrics: jest.fn().mockImplementation(() => ({
    recordHit: jest.fn(),
    recordMiss: jest.fn(),
    recordError: jest.fn(),
    getStats: jest.fn().mockReturnValue({
      hits: 0,
      misses: 0,
      errors: 0,
      hitRate: 0,
    }),
    reset: jest.fn(),
  })),
}));

const { cacheService } = require('../../services/cacheService');

describe('CacheService', () => {
  let mockRedisClient;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock Redis client
    mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
      flushAll: jest.fn(),
      on: jest.fn(),
    };

    // Mock redis.createClient to return our mock
    redis.createClient = jest.fn().mockReturnValue(mockRedisClient);

    // Set up cache service with mock client
    cacheService.client = mockRedisClient;
    cacheService.isConnected = false;

    // Reset metrics mock
    if (cacheService.metrics) {
      cacheService.metrics.getStats = jest.fn().mockReturnValue({
        hits: 0,
        misses: 0,
        errors: 0,
        hitRate: 0,
      });
      cacheService.metrics.recordHit = jest.fn();
      cacheService.metrics.recordMiss = jest.fn();
      cacheService.metrics.recordError = jest.fn();
    }
  });

  afterEach(async () => {
    cacheService.isConnected = false;
  });

  describe('Service instance', () => {
    it('should have cache service instance', () => {
      expect(cacheService).toBeDefined();
      expect(cacheService.client).toBeDefined();
      expect(cacheService.metrics).toBeDefined();
    });

    it('should have isConnected property', () => {
      expect(cacheService).toHaveProperty('isConnected');
    });
  });

  describe('get', () => {
    beforeEach(() => {
      cacheService.isConnected = true;
    });

    it('should return parsed value on cache hit', async () => {
      const testData = { id: '123', name: 'Test Product' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test-key');

      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
      expect(cacheService.metrics.recordHit).toHaveBeenCalled();
    });

    it('should return null on cache miss', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheService.get('missing-key');

      expect(result).toBeNull();
      expect(cacheService.metrics.recordMiss).toHaveBeenCalled();
    });

    it('should return null when not connected', async () => {
      cacheService.isConnected = false;

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('should handle errors and record metrics', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.get('error-key');

      expect(result).toBeNull();
      expect(cacheService.metrics.recordError).toHaveBeenCalled();
    });

    it('should handle malformed JSON', async () => {
      mockRedisClient.get.mockResolvedValue('invalid-json{');

      const result = await cacheService.get('bad-json-key');

      expect(result).toBeNull();
      expect(cacheService.metrics.recordError).toHaveBeenCalled();
    });
  });

  describe('set', () => {
    beforeEach(() => {
      cacheService.isConnected = true;
    });

    it('should store value with default TTL', async () => {
      const testData = { id: '123', name: 'Test Product' };
      mockRedisClient.setEx.mockResolvedValue('OK');

      const result = await cacheService.set('test-key', testData);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        expect.any(Number),
        JSON.stringify(testData)
      );
      expect(result).toBe(true);
    });

    it('should store value with custom TTL', async () => {
      const testData = { price: 100 };
      const customTTL = 600;
      mockRedisClient.setEx.mockResolvedValue('OK');

      const result = await cacheService.set('price-key', testData, customTTL);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'price-key',
        customTTL,
        JSON.stringify(testData)
      );
      expect(result).toBe(true);
    });

    it('should return false when not connected', async () => {
      cacheService.isConnected = false;

      const result = await cacheService.set('test-key', { data: 'test' });

      expect(result).toBe(false);
      expect(mockRedisClient.setEx).not.toHaveBeenCalled();
    });

    it('should handle errors and record metrics', async () => {
      mockRedisClient.setEx.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.set('error-key', { data: 'test' });

      expect(result).toBe(false);
      expect(cacheService.metrics.recordError).toHaveBeenCalled();
    });
  });

  describe('del', () => {
    beforeEach(() => {
      cacheService.isConnected = true;
    });

    it('should delete key successfully', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await cacheService.del('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when not connected', async () => {
      cacheService.isConnected = false;

      const result = await cacheService.del('test-key');

      expect(result).toBe(false);
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      mockRedisClient.del.mockRejectedValue(new Error('Delete failed'));

      const result = await cacheService.del('error-key');

      expect(result).toBe(false);
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      cacheService.isConnected = true;
    });

    it('should flush all cache successfully', async () => {
      mockRedisClient.flushAll.mockResolvedValue('OK');

      const result = await cacheService.flush();

      expect(mockRedisClient.flushAll).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when not connected', async () => {
      cacheService.isConnected = false;

      const result = await cacheService.flush();

      expect(result).toBe(false);
      expect(mockRedisClient.flushAll).not.toHaveBeenCalled();
    });

    it('should handle flush errors', async () => {
      mockRedisClient.flushAll.mockRejectedValue(new Error('Flush failed'));

      const result = await cacheService.flush();

      expect(result).toBe(false);
    });
  });

  describe('generateProductKey', () => {
    it('should generate key with no filters', () => {
      const key = cacheService.generateProductKey();

      expect(key).toBe('products');
    });

    it('should generate key with category filter', () => {
      const key = cacheService.generateProductKey({ category: 'Rosas' });

      expect(key).toBe('products_cat:Rosas');
    });

    it('should generate key with multiple filters', () => {
      const filters = {
        category: 'Rosas',
        occasion: 'cumpleaños',
        minPrice: 1000,
        maxPrice: 5000,
        page: 2,
        limit: 20,
      };

      const key = cacheService.generateProductKey(filters);

      expect(key).toContain('cat:Rosas');
      expect(key).toContain('occ:cumpleaños');
      expect(key).toContain('min:1000');
      expect(key).toContain('max:5000');
      expect(key).toContain('p:2');
      expect(key).toContain('lim:20');
    });

    it('should generate key with search query', () => {
      const key = cacheService.generateProductKey({ search: 'rosa roja' });

      expect(key).toBe('products_q:rosa roja');
    });

    it('should generate key with featured flag', () => {
      const key = cacheService.generateProductKey({ featured: true });

      expect(key).toBe('products_feat:true');
    });
  });

  describe('metrics', () => {
    beforeEach(() => {
      cacheService.isConnected = true;
    });

    it('should record hits correctly', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify({ data: 'test' }));

      await cacheService.get('key1');
      await cacheService.get('key2');

      expect(cacheService.metrics.recordHit).toHaveBeenCalledTimes(2);
    });

    it('should record misses correctly', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      await cacheService.get('key1');
      await cacheService.get('key2');
      await cacheService.get('key3');

      expect(cacheService.metrics.recordMiss).toHaveBeenCalledTimes(3);
    });

    it('should record errors correctly', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Error'));

      await cacheService.get('key1');
      await cacheService.get('key2');

      expect(cacheService.metrics.recordError).toHaveBeenCalledTimes(2);
    });

    it('should get metrics stats', () => {
      const mockStats = {
        hits: 10,
        misses: 5,
        errors: 1,
        hitRate: 0.67,
      };
      cacheService.metrics.getStats = jest.fn().mockReturnValue(mockStats);

      const stats = cacheService.getMetrics();

      expect(stats).toEqual(mockStats);
      expect(cacheService.metrics.getStats).toHaveBeenCalled();
    });

    it('should reset metrics', () => {
      cacheService.metrics.reset = jest.fn();

      cacheService.resetMetrics();

      expect(cacheService.metrics.reset).toHaveBeenCalled();
    });
  });
});
