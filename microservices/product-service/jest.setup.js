/**
 * Jest setup file
 * Mock external dependencies for testing
 */

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// Mock Mongoose to avoid MongoDB connection attempts
jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation(function (definition, options) {
    this.obj = definition;
    this.options = options || {};
    this._indexes = [];
    this.index = jest.fn((fields) => {
      this._indexes.push([fields]);
    });
    this.pre = jest.fn();
    this.post = jest.fn();
    this.virtual = jest.fn().mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
    });
    this.plugin = jest.fn();
    this.methods = {};
    this.statics = {};
    this.indexes = jest.fn(function () {
      return this._indexes;
    });
    return this;
  });

  mockSchema.Types = {
    ObjectId: jest.fn(),
  };

  return {
    connect: jest.fn().mockResolvedValue(undefined),
    connection: {
      readyState: 1,
      on: jest.fn(),
    },
    model: jest.fn((modelName, schema) => {
      const createChainableMock = () => {
        const chainable = {
          find: jest.fn().mockReturnThis(),
          findOne: jest.fn().mockReturnThis(),
          findById: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
          countDocuments: jest.fn().mockResolvedValue(0),
        };
        return chainable;
      };

      const MockModel = jest.fn();
      MockModel.modelName = modelName;
      MockModel.schema = schema;

      // Métodos que retornan chainable
      MockModel.find = jest.fn(() => createChainableMock());
      MockModel.findOne = jest.fn(() => createChainableMock());
      MockModel.findById = jest.fn(() => createChainableMock());
      MockModel.where = jest.fn(() => createChainableMock());
      MockModel.countDocuments = jest.fn(() => createChainableMock());

      // Métodos directos
      MockModel.create = jest.fn().mockResolvedValue({});
      MockModel.updateOne = jest.fn().mockResolvedValue({ nModified: 1 });
      MockModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
      MockModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
      MockModel.findByIdAndDelete = jest.fn().mockResolvedValue({});

      return MockModel;
    }),
    Schema: mockSchema,
  };
});

// Cache service will be mocked per-test as needed
// Some tests need the real implementation, others need mocks
