/**
 * Tests para config/redis.js del wishlist-service
 */

jest.mock('redis', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(true),
    quit: jest.fn().mockResolvedValue(true),
    on: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  return {
    createClient: jest.fn(() => mockClient),
  };
});

describe('Redis Client - Wishlist Service', () => {
  let redisClient;
  let redis;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Require después de resetear modules
    redis = require('redis');
    redisClient = require('../../config/redis');
  });

  describe('Client Creation', () => {
    it('should create a Redis client', () => {
      expect(redis.createClient).toHaveBeenCalled();
    });

    it('should export a client object', () => {
      expect(redisClient).toBeDefined();
      expect(typeof redisClient).toBe('object');
    });
  });

  describe('Client Methods', () => {
    it('should have connect method', () => {
      expect(redisClient).toHaveProperty('connect');
      expect(typeof redisClient.connect).toBe('function');
    });

    it('should have quit method', () => {
      expect(redisClient).toHaveProperty('quit');
      expect(typeof redisClient.quit).toBe('function');
    });

    it('should have on method for event handling', () => {
      expect(redisClient).toHaveProperty('on');
      expect(typeof redisClient.on).toBe('function');
    });

    it('should have basic Redis operations', () => {
      expect(redisClient).toHaveProperty('get');
      expect(redisClient).toHaveProperty('set');
      expect(redisClient).toHaveProperty('del');
    });
  });

  describe('Connection Handling', () => {
    it('should be able to connect', async () => {
      const result = await redisClient.connect();
      expect(result).toBe(true);
    });

    it('should be able to disconnect', async () => {
      const result = await redisClient.quit();
      expect(result).toBe(true);
    });

    it('should be able to ping', async () => {
      const result = await redisClient.ping();
      expect(result).toBe('PONG');
    });
  });
});
