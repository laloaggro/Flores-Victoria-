/**
 * Jest setup file for promotion-service
 * Mock external dependencies for testing
 */

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.PORT = '3019';

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
      close: jest.fn().mockResolvedValue(undefined),
    },
    model: jest.fn((modelName, schema) => {
      const MockModel = jest.fn();
      MockModel.modelName = modelName;
      MockModel.schema = schema;
      MockModel.find = jest.fn().mockReturnThis();
      MockModel.findOne = jest.fn().mockReturnThis();
      MockModel.findById = jest.fn().mockReturnThis();
      MockModel.create = jest.fn();
      MockModel.updateOne = jest.fn();
      MockModel.findByIdAndUpdate = jest.fn();
      MockModel.findByIdAndDelete = jest.fn();
      MockModel.deleteOne = jest.fn();
      MockModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
      MockModel.countDocuments = jest.fn().mockResolvedValue(0);
      MockModel.exec = jest.fn();
      MockModel.lean = jest.fn().mockReturnThis();
      MockModel.sort = jest.fn().mockReturnThis();
      MockModel.limit = jest.fn().mockReturnThis();
      MockModel.skip = jest.fn().mockReturnThis();
      return MockModel;
    }),
    Schema: mockSchema,
  };
});
