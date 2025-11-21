/**
 * Tests para middleware común de cart-service
 */

const common = require('../../middleware/common');

describe('Common Middleware - Cart Service', () => {
  it('should export middleware functions', () => {
    expect(common).toBeDefined();
    expect(typeof common).toBe('object');
  });

  it('should have errorHandler if available', () => {
    if (common.errorHandler) {
      expect(typeof common.errorHandler).toBe('function');
    }
  });
});
