/**
 * Tests para Rate Limiter Middleware
 * Enfocados en exports y configuración
 */

jest.mock('ioredis');
jest.mock('rate-limit-redis');

const rateLimiter = require('../../middleware/rate-limiter');

describe('Rate Limiter Middleware', () => {
  describe('Exports', () => {
    it('should export publicLimiter', () => {
      expect(rateLimiter.publicLimiter).toBeDefined();
      expect(typeof rateLimiter.publicLimiter).toBe('function');
    });

    it('should export authenticatedLimiter', () => {
      expect(rateLimiter.authenticatedLimiter).toBeDefined();
      expect(typeof rateLimiter.authenticatedLimiter).toBe('function');
    });

    it('should export adminLimiter', () => {
      expect(rateLimiter.adminLimiter).toBeDefined();
      expect(typeof rateLimiter.adminLimiter).toBe('function');
    });

    it('should export criticalLimiter', () => {
      expect(rateLimiter.criticalLimiter).toBeDefined();
      expect(typeof rateLimiter.criticalLimiter).toBe('function');
    });

    it('should export searchLimiter', () => {
      expect(rateLimiter.searchLimiter).toBeDefined();
      expect(typeof rateLimiter.searchLimiter).toBe('function');
    });

    it('should export uploadLimiter', () => {
      expect(rateLimiter.uploadLimiter).toBeDefined();
      expect(typeof rateLimiter.uploadLimiter).toBe('function');
    });

    it('should export createRateLimiter', () => {
      expect(rateLimiter.createRateLimiter).toBeDefined();
      expect(typeof rateLimiter.createRateLimiter).toBe('function');
    });

    it('should export isWhitelisted', () => {
      expect(rateLimiter.isWhitelisted).toBeDefined();
      expect(typeof rateLimiter.isWhitelisted).toBe('function');
    });

    it('should export RATE_LIMIT_TIERS', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS).toBeDefined();
      expect(typeof rateLimiter.RATE_LIMIT_TIERS).toBe('object');
    });
  });

  describe('Rate Limit Tiers', () => {
    it('should have public tier configuration', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.public).toBeDefined();
      expect(rateLimiter.RATE_LIMIT_TIERS.public.windowMs).toBeDefined();
      expect(rateLimiter.RATE_LIMIT_TIERS.public.max).toBeDefined();
    });

    it('should have authenticated tier configuration', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.authenticated).toBeDefined();
      expect(rateLimiter.RATE_LIMIT_TIERS.authenticated.max).toBeGreaterThan(
        rateLimiter.RATE_LIMIT_TIERS.public.max
      );
    });

    it('should have admin tier configuration', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.admin).toBeDefined();
      expect(rateLimiter.RATE_LIMIT_TIERS.admin.max).toBeGreaterThan(
        rateLimiter.RATE_LIMIT_TIERS.authenticated.max
      );
    });

    it('should have critical tier configuration', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.critical).toBeDefined();
      expect(rateLimiter.RATE_LIMIT_TIERS.critical.max).toBeLessThan(
        rateLimiter.RATE_LIMIT_TIERS.public.max
      );
    });

    it('should have search tier configuration', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.search).toBeDefined();
      expect(rateLimiter.RATE_LIMIT_TIERS.search.windowMs).toBeLessThan(
        rateLimiter.RATE_LIMIT_TIERS.public.windowMs
      );
    });

    it('should have upload tier configuration', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.upload).toBeDefined();
      expect(rateLimiter.RATE_LIMIT_TIERS.upload.windowMs).toBeGreaterThan(
        rateLimiter.RATE_LIMIT_TIERS.public.windowMs
      );
    });
  });

  describe('IP Whitelist', () => {
    it('should whitelist localhost IPv4', () => {
      expect(rateLimiter.isWhitelisted('127.0.0.1')).toBe(true);
    });

    it('should whitelist localhost IPv6', () => {
      expect(rateLimiter.isWhitelisted('::1')).toBe(true);
    });

    it('should whitelist localhost string', () => {
      expect(rateLimiter.isWhitelisted('localhost')).toBe(true);
    });

    it('should not whitelist regular IPs', () => {
      expect(rateLimiter.isWhitelisted('192.168.1.1')).toBe(false);
      expect(rateLimiter.isWhitelisted('10.0.0.1')).toBe(false);
      expect(rateLimiter.isWhitelisted('172.16.0.1')).toBe(false);
    });

    it('should handle undefined gracefully', () => {
      expect(rateLimiter.isWhitelisted(undefined)).toBe(false);
    });

    it('should handle null gracefully', () => {
      expect(rateLimiter.isWhitelisted(null)).toBe(false);
    });

    it('should handle empty string', () => {
      expect(rateLimiter.isWhitelisted('')).toBe(false);
    });
  });

  describe('Create Rate Limiter', () => {
    it('should create custom limiter', () => {
      const custom = rateLimiter.createRateLimiter({
        max: 100,
        windowMs: 60000,
      });
      expect(custom).toBeDefined();
      expect(typeof custom).toBe('function');
    });

    it('should accept custom options', () => {
      const custom = rateLimiter.createRateLimiter({
        max: 50,
        message: 'Custom limit message',
      });
      expect(custom).toBeDefined();
    });

    it('should work with minimal options', () => {
      const custom = rateLimiter.createRateLimiter({});
      expect(custom).toBeDefined();
    });
  });

  describe('Middleware Functions', () => {
    it('publicLimiter should be callable', () => {
      expect(typeof rateLimiter.publicLimiter).toBe('function');
    });

    it('authenticatedLimiter should be callable', () => {
      expect(typeof rateLimiter.authenticatedLimiter).toBe('function');
    });

    it('adminLimiter should be callable', () => {
      expect(typeof rateLimiter.adminLimiter).toBe('function');
    });

    it('criticalLimiter should be callable', () => {
      expect(typeof rateLimiter.criticalLimiter).toBe('function');
    });

    it('searchLimiter should be callable', () => {
      expect(typeof rateLimiter.searchLimiter).toBe('function');
    });

    it('uploadLimiter should be callable', () => {
      expect(typeof rateLimiter.uploadLimiter).toBe('function');
    });
  });

  describe('Configuration', () => {
    it('should have Spanish messages for user-facing limiters', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.public.message).toContain('Por favor');
    });

    it('should configure skipSuccessfulRequests for critical', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.critical.skipSuccessfulRequests).toBe(true);
    });

    it('should not skip successful requests for public', () => {
      expect(rateLimiter.RATE_LIMIT_TIERS.public.skipSuccessfulRequests).toBe(false);
    });
  });
});
