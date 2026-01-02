/**
 * Tests para logger de review-service
 */

const logger = require('../../logger.simple');

describe('Logger - Review Service', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have logging methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should execute info without errors', () => {
    expect(() => logger.info('Test info message')).not.toThrow();
  });

  it('should execute error without errors', () => {
    expect(() => logger.error('Test error message')).not.toThrow();
  });

  it('should execute warn without errors', () => {
    expect(() => logger.warn('Test warn message')).not.toThrow();
  });

  it('should log with metadata', () => {
    expect(() => logger.info('Message with metadata', { key: 'value' })).not.toThrow();
  });

  it('should log errors with error object', () => {
    const error = new Error('Test error');
    expect(() => logger.error('Error occurred', { error })).not.toThrow();
  });

  it('should log with err property', () => {
    expect(() => logger.error('Error with err', { err: { message: 'Error details' } })).not.toThrow();
  });

  it('should handle object as message', () => {
    expect(() => logger.info({ message: 'Object message', data: 'test' })).not.toThrow();
  });

  it('should have correct log level', () => {
    expect(logger.level).toBeDefined();
  });
});
