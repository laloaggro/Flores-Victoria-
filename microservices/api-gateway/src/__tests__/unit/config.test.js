const config = require('../../config');

describe('API Gateway Config', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('default values', () => {
    it('should have default port', () => {
      expect(config.port).toBeDefined();
      expect(typeof config.port).toBe('number');
    });

    it('should have JWT secret', () => {
      expect(config.jwtSecret).toBeDefined();
      expect(typeof config.jwtSecret).toBe('string');
    });

    it('should have all service URLs defined', () => {
      expect(config.services).toBeDefined();
      expect(config.services.authService).toBeDefined();
      expect(config.services.productService).toBeDefined();
      expect(config.services.userService).toBeDefined();
      expect(config.services.orderService).toBeDefined();
      expect(config.services.cartService).toBeDefined();
      expect(config.services.wishlistService).toBeDefined();
      expect(config.services.reviewService).toBeDefined();
      expect(config.services.contactService).toBeDefined();
    });

    it('should have rate limit configuration', () => {
      expect(config.rateLimit).toBeDefined();
      expect(config.rateLimit.windowMs).toBeDefined();
      expect(config.rateLimit.max).toBeDefined();
      expect(typeof config.rateLimit.windowMs).toBe('number');
      expect(typeof config.rateLimit.max).toBe('number');
    });
  });

  describe('service URLs', () => {
    it('should have properly formatted URLs', () => {
      Object.values(config.services).forEach((url) => {
        expect(url).toMatch(/^https?:\/\//);
      });
    });

    it('should point to correct service names', () => {
      expect(config.services.authService).toContain('auth');
      expect(config.services.productService).toContain('product');
      expect(config.services.userService).toContain('user');
    });
  });

  describe('rate limiting', () => {
    it('should have reasonable rate limit values', () => {
      expect(config.rateLimit.windowMs).toBeGreaterThan(0);
      expect(config.rateLimit.max).toBeGreaterThan(0);
    });

    it('should have default window of 15 minutes', () => {
      const fifteenMinutes = 15 * 60 * 1000;
      expect(config.rateLimit.windowMs).toBe(fifteenMinutes);
    });
  });
});
