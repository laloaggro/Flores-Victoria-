/**
 * Tests para middleware común de contact-service
 */

const common = require('../../middleware/common');

describe('Common Middleware - Contact Service', () => {
  it('should export middleware', () => {
    expect(common).toBeDefined();
  });

  it('should have errorHandler if available', () => {
    if (common.errorHandler) {
      expect(typeof common.errorHandler).toBe('function');
    }
  });
});
