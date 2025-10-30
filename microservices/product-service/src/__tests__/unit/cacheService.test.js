/**
 * Unit Tests for Cache Service
 * Tests for cacheService.js Redis caching functionality
 */

const CacheService = require('../../services/cacheService');

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(true),
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    flushAll: jest.fn(),
    on: jest.fn(),
  })),
}));

describe('CacheService - Unit Tests', () => {
  let cacheService;
  let mockRedisClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const redis = require('redis');
    mockRedisClient = redis.createClient();
    cacheService = new CacheService();
    cacheService.client = mockRedisClient;
    cacheService.isConnected = true;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================
  // get() Tests
  // ==========================================
  describe('get', () => {
    test('should retrieve and parse cached value', async () => {
      const testData = { id: 1, name: 'Test Product' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test-key');

      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    test('should return null for non-existent key', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheService.get('non-existent');

      expect(result).toBeNull();
    });

    test('should return null if not connected', async () => {
      cacheService.isConnected = false;

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    test('should return null if client is null', async () => {
      cacheService.client = null;

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });

    test('should handle JSON parse errors gracefully', async () => {
      mockRedisClient.get.mockResolvedValue('invalid-json{');

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });

    test('should handle Redis errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis connection lost'));

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });

    test('should parse complex nested objects', async () => {
      const complexData = {
        products: [
          { id: 1, price: 10.99 },
          { id: 2, price: 20.5 },
        ],
        meta: { total: 2 },
      };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(complexData));

      const result = await cacheService.get('products-list');

      expect(result).toEqual(complexData);
    });
  });

  // ==========================================
  // set() Tests
  // ==========================================
  describe('set', () => {
    test('should cache value with default TTL', async () => {
      const testData = { id: 1, name: 'Test' };

      const result = await cacheService.set('test-key', testData);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        300, // default TTL
        JSON.stringify(testData)
      );
      expect(result).toBe(true);
    });

    test('should cache value with custom TTL', async () => {
      const testData = { id: 2, name: 'Custom TTL' };

      const result = await cacheService.set('custom-key', testData, 600);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'custom-key',
        600,
        JSON.stringify(testData)
      );
      expect(result).toBe(true);
    });

    test('should return false if not connected', async () => {
      cacheService.isConnected = false;

      const result = await cacheService.set('test-key', { data: 'test' });

      expect(result).toBe(false);
      expect(mockRedisClient.setEx).not.toHaveBeenCalled();
    });

    test('should return false if client is null', async () => {
      cacheService.client = null;

      const result = await cacheService.set('test-key', { data: 'test' });

      expect(result).toBe(false);
    });

    test('should handle Redis errors gracefully', async () => {
      mockRedisClient.setEx.mockRejectedValue(new Error('Write error'));

      const result = await cacheService.set('test-key', { data: 'test' });

      expect(result).toBe(false);
    });

    test('should stringify complex objects', async () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          obj: { key: 'value' },
        },
      };

      await cacheService.set('complex-key', complexData);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'complex-key',
        300,
        JSON.stringify(complexData)
      );
    });

    test('should handle arrays', async () => {
      const arrayData = [1, 2, 3, 4, 5];

      await cacheService.set('array-key', arrayData);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'array-key',
        300,
        JSON.stringify(arrayData)
      );
    });

    test('should handle primitive values', async () => {
      await cacheService.set('string-key', 'simple string');

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'string-key',
        300,
        JSON.stringify('simple string')
      );
    });
  });

  // ==========================================
  // del() Tests
  // ==========================================
  describe('del', () => {
    test('should delete cached key successfully', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await cacheService.del('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    test('should return false if not connected', async () => {
      cacheService.isConnected = false;

      const result = await cacheService.del('test-key');

      expect(result).toBe(false);
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    test('should return false if client is null', async () => {
      cacheService.client = null;

      const result = await cacheService.del('test-key');

      expect(result).toBe(false);
    });

    test('should handle Redis errors gracefully', async () => {
      mockRedisClient.del.mockRejectedValue(new Error('Delete error'));

      const result = await cacheService.del('test-key');

      expect(result).toBe(false);
    });

    test('should handle deletion of non-existent keys', async () => {
      mockRedisClient.del.mockResolvedValue(0);

      const result = await cacheService.del('non-existent');

      expect(result).toBe(true); // Still returns true even if key didn't exist
    });
  });

  // ==========================================
  // flush() Tests
  // ==========================================
  describe('flush', () => {
    test('should flush all cache successfully', async () => {
      mockRedisClient.flushAll.mockResolvedValue('OK');

      const result = await cacheService.flush();

      expect(mockRedisClient.flushAll).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('should return false if not connected', async () => {
      cacheService.isConnected = false;

      const result = await cacheService.flush();

      expect(result).toBe(false);
      expect(mockRedisClient.flushAll).not.toHaveBeenCalled();
    });

    test('should return false if client is null', async () => {
      cacheService.client = null;

      const result = await cacheService.flush();

      expect(result).toBe(false);
    });

    test('should handle Redis errors gracefully', async () => {
      mockRedisClient.flushAll.mockRejectedValue(new Error('Flush error'));

      const result = await cacheService.flush();

      expect(result).toBe(false);
    });
  });

  // ==========================================
  // Integration Scenarios
  // ==========================================
  describe('Integration scenarios', () => {
    test('should set, get, and delete a value successfully', async () => {
      const testData = { id: 123, name: 'Integration Test' };

      // Set
      mockRedisClient.setEx.mockResolvedValue('OK');
      const setResult = await cacheService.set('int-key', testData);
      expect(setResult).toBe(true);

      // Get
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));
      const getResult = await cacheService.get('int-key');
      expect(getResult).toEqual(testData);

      // Delete
      mockRedisClient.del.mockResolvedValue(1);
      const delResult = await cacheService.del('int-key');
      expect(delResult).toBe(true);
    });

    test('should handle cache miss scenario', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheService.get('cache-miss');

      expect(result).toBeNull();
    });

    test('should survive connection loss gracefully', async () => {
      cacheService.isConnected = false;

      const getResult = await cacheService.get('test');
      const setResult = await cacheService.set('test', { data: 'test' });
      const delResult = await cacheService.del('test');
      const flushResult = await cacheService.flush();

      expect(getResult).toBeNull();
      expect(setResult).toBe(false);
      expect(delResult).toBe(false);
      expect(flushResult).toBe(false);
    });
  });
});
