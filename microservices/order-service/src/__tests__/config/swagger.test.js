// Tests for swagger config
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

jest.mock('swagger-jsdoc');
jest.mock('swagger-ui-express');

describe('Swagger Configuration', () => {
  let swaggerConfig;

  beforeEach(() => {
    jest.resetModules();
    swaggerJsdoc.mockReturnValue({ info: { title: 'Order Service API' } });
    swaggerUi.serve = jest.fn();
    swaggerUi.setup = jest.fn();
    
    swaggerConfig = require('../../config/swagger');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Exports', () => {
    it('should export swaggerServe function', () => {
      expect(swaggerConfig.swaggerServe).toBeDefined();
      expect(typeof swaggerConfig.swaggerServe).toBe('function');
    });

    it('should export swaggerSetup function', () => {
      expect(swaggerConfig.swaggerSetup).toBeDefined();
      expect(typeof swaggerConfig.swaggerSetup).toBe('function');
    });

    it('should export swaggerSpecs object', () => {
      expect(swaggerConfig.swaggerSpecs).toBeDefined();
    });
  });

  describe('Swagger Specs', () => {
    it('should have OpenAPI definition', () => {
      expect(swaggerConfig.swaggerSpecs).toHaveProperty('info');
    });

    it('should call swaggerJsdoc with configuration', () => {
      expect(swaggerJsdoc).toHaveBeenCalled();
    });
  });

  describe('Swagger Setup', () => {
    it('should use swagger-ui-express serve', () => {
      const serve = swaggerConfig.swaggerServe;
      expect(serve).toBeDefined();
    });

    it('should use swagger-ui-express setup', () => {
      const setup = swaggerConfig.swaggerSetup;
      expect(setup).toBeDefined();
    });
  });
});
