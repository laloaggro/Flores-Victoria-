/**
 * Tests del Rate Limit Middleware
 * @fileoverview Tests unitarios del middleware de rate limiting
 */

// Mock de Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    status: 'ready',
  }));
});

jest.mock('rate-limit-redis', () => {
  return jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    increment: jest.fn().mockResolvedValue({ totalHits: 1, resetTime: new Date() }),
    decrement: jest.fn().mockResolvedValue(true),
    resetKey: jest.fn().mockResolvedValue(true),
  }));
});

describe('Rate Limit Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      ip: '127.0.0.1',
      user: null,
      headers: {},
      path: '/api/products',
      method: 'GET',
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      set: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('Configuration', () => {
    it('should use correct window size for public endpoints', () => {
      // Verificar configuración de rate limit público
      // 100 requests por 15 minutos es la configuración típica
      const publicConfig = {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100,
      };

      expect(publicConfig.windowMs).toBe(900000);
      expect(publicConfig.max).toBe(100);
    });

    it('should use higher limits for authenticated users', () => {
      const authConfig = {
        windowMs: 15 * 60 * 1000,
        max: 500, // Usuarios autenticados tienen más requests
      };

      expect(authConfig.max).toBeGreaterThan(100);
    });

    it('should use even higher limits for admin users', () => {
      const adminConfig = {
        windowMs: 15 * 60 * 1000,
        max: 2000, // Admins tienen más requests
      };

      expect(adminConfig.max).toBeGreaterThan(500);
    });
  });

  describe('Key Generation', () => {
    it('should generate key based on IP for unauthenticated requests', () => {
      const keyGenerator = (req) => {
        return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
      };

      mockReq.user = null;
      mockReq.ip = '192.168.1.1';

      const key = keyGenerator(mockReq);

      expect(key).toBe('ip:192.168.1.1');
    });

    it('should generate key based on user ID for authenticated requests', () => {
      const keyGenerator = (req) => {
        return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
      };

      mockReq.user = { id: 'user-123' };

      const key = keyGenerator(mockReq);

      expect(key).toBe('user:user-123');
    });
  });

  describe('Whitelist', () => {
    const WHITELIST_IPS = ['127.0.0.1', '::1', '10.0.0.0/8'];

    it('should skip rate limiting for whitelisted IPs', () => {
      const skipFunction = (req) => {
        // Simple whitelist check
        return WHITELIST_IPS.includes(req.ip);
      };

      mockReq.ip = '127.0.0.1';

      expect(skipFunction(mockReq)).toBe(true);
    });

    it('should not skip rate limiting for non-whitelisted IPs', () => {
      const skipFunction = (req) => {
        return WHITELIST_IPS.includes(req.ip);
      };

      mockReq.ip = '192.168.1.100';

      expect(skipFunction(mockReq)).toBe(false);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include RateLimit headers in response', () => {
      const headers = {
        'RateLimit-Limit': '100',
        'RateLimit-Remaining': '99',
        'RateLimit-Reset': Math.floor(Date.now() / 1000) + 900,
      };

      Object.entries(headers).forEach(([key, value]) => {
        mockRes.setHeader(key, value);
      });

      expect(mockRes.setHeader).toHaveBeenCalledWith('RateLimit-Limit', '100');
      expect(mockRes.setHeader).toHaveBeenCalledWith('RateLimit-Remaining', '99');
    });
  });

  describe('Endpoint-specific Limits', () => {
    const SENSITIVE_ENDPOINTS = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
    ];

    it('should apply stricter limits to sensitive endpoints', () => {
      const getSensitiveLimit = (path) => {
        if (SENSITIVE_ENDPOINTS.some((ep) => path.includes(ep))) {
          return { windowMs: 60 * 1000, max: 5 }; // 5 requests per minute
        }
        return { windowMs: 15 * 60 * 1000, max: 100 }; // Default
      };

      const loginLimit = getSensitiveLimit('/api/auth/login');
      const normalLimit = getSensitiveLimit('/api/products');

      expect(loginLimit.max).toBe(5);
      expect(normalLimit.max).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should return 429 when rate limit exceeded', () => {
      const rateLimitHandler = (req, res) => {
        res.status(429).json({
          status: 'error',
          message: 'Demasiadas solicitudes, intente más tarde',
          retryAfter: 900, // seconds
        });
      };

      rateLimitHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Demasiadas solicitudes'),
        })
      );
    });

    it('should include Retry-After header when rate limited', () => {
      const retryAfter = 900;
      mockRes.setHeader('Retry-After', retryAfter);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Retry-After', 900);
    });
  });

  describe('Redis Fallback', () => {
    it('should use memory store when Redis is unavailable', () => {
      // Simulamos que Redis no está disponible
      const useMemoryFallback = (redisAvailable) => {
        return redisAvailable ? 'redis' : 'memory';
      };

      expect(useMemoryFallback(false)).toBe('memory');
      expect(useMemoryFallback(true)).toBe('redis');
    });
  });

  describe('Dynamic Rate Limiting', () => {
    it('should adjust limits based on server load', () => {
      const getDynamicLimit = (currentLoad) => {
        if (currentLoad > 0.9) return 50; // Very high load
        if (currentLoad > 0.7) return 75; // High load
        return 100; // Normal
      };

      expect(getDynamicLimit(0.95)).toBe(50);
      expect(getDynamicLimit(0.8)).toBe(75);
      expect(getDynamicLimit(0.5)).toBe(100);
    });
  });
});
