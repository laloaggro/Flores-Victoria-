/**
 * Tests para el logger de order-service
 */

const logger = require('../../logger');

describe('Logger - Order Service', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have logging methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
  });

  it('should log messages without errors', () => {
    expect(() => logger.info('Test message')).not.toThrow();
  });
});
