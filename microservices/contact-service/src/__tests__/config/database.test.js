/**
 * Tests para database.js del contact-service
 */

// Mock de Sequelize
jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    define: jest.fn(),
    models: {},
  };

  return {
    Sequelize: jest.fn(() => mockSequelize),
    DataTypes: {
      STRING: 'STRING',
      INTEGER: 'INTEGER',
      TEXT: 'TEXT',
      UUID: 'UUID',
      ENUM: jest.fn(),
    },
  };
});

describe('Database - Contact Service', () => {
  let sequelize;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    sequelize = require('../../config/database');
  });

  describe('Sequelize Instance', () => {
    it('should export sequelize instance', () => {
      expect(sequelize).toBeDefined();
      expect(typeof sequelize).toBe('object');
    });

    it('should have authenticate method', () => {
      expect(sequelize).toHaveProperty('authenticate');
      expect(typeof sequelize.authenticate).toBe('function');
    });

    it('should have sync method', () => {
      expect(sequelize).toHaveProperty('sync');
      expect(typeof sequelize.sync).toBe('function');
    });

    it('should have close method', () => {
      expect(sequelize).toHaveProperty('close');
      expect(typeof sequelize.close).toBe('function');
    });
  });

  describe('Database Operations', () => {
    it('should be able to authenticate', async () => {
      const result = await sequelize.authenticate();
      expect(result).toBe(true);
    });

    it('should be able to sync', async () => {
      const result = await sequelize.sync();
      expect(result).toBe(true);
    });

    it('should be able to close connection', async () => {
      const result = await sequelize.close();
      expect(result).toBe(true);
    });
  });

  describe('Models', () => {
    it('should have models object', () => {
      expect(sequelize).toHaveProperty('models');
      expect(typeof sequelize.models).toBe('object');
    });

    it('should support model definition', () => {
      expect(sequelize).toHaveProperty('define');
      expect(typeof sequelize.define).toBe('function');
    });
  });
});
