describe('Logger - Product Service', () => {
  let logger;

  beforeEach(() => {
    jest.resetModules();
    logger = require('../logger.simple');
  });

  it('should load logger module', () => {
    expect(() => {
      require('../logger.simple');
    }).not.toThrow();
  });

  it('should export logger object', () => {
    expect(logger).toBeDefined();
  });

  it('should be valid logger', () => {
    expect(typeof logger).toBe('object');
  });

  it('should have logging methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });

  it('should log info without errors', () => {
    expect(() => logger.info('Test info message')).not.toThrow();
  });

  it('should log error without errors', () => {
    expect(() => logger.error('Test error message')).not.toThrow();
  });

  it('should log warn without errors', () => {
    expect(() => logger.warn('Test warn message')).not.toThrow();
  });

  it('should log with metadata', () => {
    expect(() => logger.info('Message', { key: 'value', num: 123 })).not.toThrow();
  });

  it('should log object messages', () => {
    expect(() => logger.info({ message: 'Object message', data: 'test' })).not.toThrow();
  });

  it('should have correct log level', () => {
    expect(logger.level).toBeDefined();
  });
});
