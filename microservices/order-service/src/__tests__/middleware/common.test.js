/**
 * Tests para middleware común de order-service
 */

const common = require('../../middleware/common');

describe('Common Middleware - Order Service', () => {
  it('should export middleware module', () => {
    expect(common).toBeDefined();
    expect(typeof common).toBe('object');
  });

  it('should have errorHandler if available', () => {
    if (common.errorHandler) {
      expect(typeof common.errorHandler).toBe('function');
    }
  });
});
