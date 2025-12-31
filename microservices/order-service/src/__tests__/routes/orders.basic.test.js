/**
 * Tests para routes
 */

describe('Order Routes - Basic', () => {
  let routes;

  beforeEach(() => {
    jest.resetModules();
  });

  describe('Module exports', () => {
    it('should export routes without throwing', () => {
      expect(() => {
        routes = require('../../routes/orders');
      }).not.toThrow();
    });

    it('should export router or function', () => {
      routes = require('../../routes/orders');
      expect(routes).toBeDefined();
    });
  });
});
