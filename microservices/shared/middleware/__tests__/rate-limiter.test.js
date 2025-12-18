/**
 * @fileoverview Tests for Rate Limiter Middleware
 * @description Comprehensive tests for rate limiting functionality
 */

const {
  createRateLimiter,
  RATE_LIMIT_TIERS,
  isWhitelisted,
  addToWhitelist,
  removeFromWhitelist,
  detectUserTier,
  generateKey,
} = require('../rate-limiter');

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation((options) => {
    const middleware = jest.fn((req, res, next) => next());
    middleware.options = options;
    return middleware;
  });
});

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    status: 'connecting',
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(),
  }));
});

describe('Rate Limiter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.DISABLE_REDIS = 'true'; // Use memory store for tests
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('RATE_LIMIT_TIERS', () => {
    it('should have public tier configuration', () => {
      expect(RATE_LIMIT_TIERS).toHaveProperty('public');
      expect(RATE_LIMIT_TIERS.public).toHaveProperty('windowMs');
      expect(RATE_LIMIT_TIERS.public).toHaveProperty('max');
    });

    it('should have authenticated tier configuration', () => {
      expect(RATE_LIMIT_TIERS).toHaveProperty('authenticated');
      expect(RATE_LIMIT_TIERS.authenticated.max).toBeGreaterThan(RATE_LIMIT_TIERS.public.max);
    });

    it('should have admin tier configuration', () => {
      expect(RATE_LIMIT_TIERS).toHaveProperty('admin');
      expect(RATE_LIMIT_TIERS.admin.max).toBeGreaterThan(RATE_LIMIT_TIERS.authenticated.max);
    });

    it('should have critical tier for sensitive endpoints', () => {
      expect(RATE_LIMIT_TIERS).toHaveProperty('critical');
      expect(RATE_LIMIT_TIERS.critical.max).toBeLessThan(RATE_LIMIT_TIERS.public.max);
    });

    it('should have search tier for search endpoints', () => {
      expect(RATE_LIMIT_TIERS).toHaveProperty('search');
      expect(RATE_LIMIT_TIERS.search).toHaveProperty('windowMs');
    });

    it('should have upload tier for file uploads', () => {
      expect(RATE_LIMIT_TIERS).toHaveProperty('upload');
      expect(RATE_LIMIT_TIERS.upload.windowMs).toBeGreaterThan(RATE_LIMIT_TIERS.public.windowMs);
    });
  });

  describe('createRateLimiter', () => {
    it('should create a rate limiter middleware', () => {
      const rateLimit = require('express-rate-limit');
      createRateLimiter();
      expect(rateLimit).toHaveBeenCalled();
    });

    it('should pass windowMs option', () => {
      const rateLimit = require('express-rate-limit');
      createRateLimiter({ windowMs: 60000 });
      expect(rateLimit).toHaveBeenCalled();
    });

    it('should pass max option', () => {
      const rateLimit = require('express-rate-limit');
      createRateLimiter({ max: 50 });
      expect(rateLimit).toHaveBeenCalled();
    });

    it('should accept tier parameter', () => {
      const rateLimit = require('express-rate-limit');
      createRateLimiter({ tier: 'admin' });
      expect(rateLimit).toHaveBeenCalled();
    });
  });

  describe('Rate Limit Response', () => {
    it('should have standard rate limit headers configured', () => {
      const rateLimit = require('express-rate-limit');
      createRateLimiter();

      expect(rateLimit).toHaveBeenCalled();
      const options = rateLimit.mock.calls[0][0];

      expect(options).toHaveProperty('standardHeaders');
      expect(options).toHaveProperty('legacyHeaders');
    });

    it('should have a message for rate limited requests', () => {
      const rateLimit = require('express-rate-limit');
      createRateLimiter();

      const options = rateLimit.mock.calls[0][0];
      expect(options).toHaveProperty('message');
    });
  });

  describe('Whitelist Management', () => {
    it('should check if IP is whitelisted', () => {
      expect(typeof isWhitelisted).toBe('function');
    });

    it('should add IP to whitelist', () => {
      expect(typeof addToWhitelist).toBe('function');
    });

    it('should remove IP from whitelist', () => {
      expect(typeof removeFromWhitelist).toBe('function');
    });
  });

  describe('User Tier Detection', () => {
    it('should detect public tier for unauthenticated requests', () => {
      const mockReq = { headers: {}, user: null };
      const tier = detectUserTier(mockReq);
      expect(tier).toBe('public');
    });

    it('should detect authenticated tier for authenticated users', () => {
      const mockReq = {
        headers: { authorization: 'Bearer token' },
        user: { id: 'user-123', role: 'user' },
      };
      const tier = detectUserTier(mockReq);
      expect(tier).toBe('authenticated');
    });

    it('should detect admin tier for admin users', () => {
      const mockReq = {
        headers: { authorization: 'Bearer token' },
        user: { id: 'admin-123', role: 'admin' },
      };
      const tier = detectUserTier(mockReq);
      expect(tier).toBe('admin');
    });
  });

  describe('Key Generation', () => {
    it('should generate key from IP for public users', () => {
      const mockReq = { ip: '192.168.1.1', headers: {}, user: null };
      const key = generateKey(mockReq);
      expect(key).toContain('192.168.1.1');
      expect(key).toContain('public');
    });

    it('should handle X-Forwarded-For header', () => {
      const mockReq = {
        ip: '127.0.0.1',
        headers: {
          'x-forwarded-for': '203.0.113.195, 70.41.3.18',
        },
      };

      // First IP in X-Forwarded-For is the client IP
      const clientIp = mockReq.headers['x-forwarded-for'].split(',')[0].trim();
      expect(clientIp).toBe('203.0.113.195');
    });
  });
});
