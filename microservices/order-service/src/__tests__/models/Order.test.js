// Tests for Order model
const mongoose = require('mongoose');

// Mock mongoose
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    Schema: class MockSchema {
      constructor(definition, options) {
        this.definition = definition;
        this.options = options;
        this.methods = {};
        this.statics = {};
        this.virtuals = {};
        this.pre = jest.fn();
        this.post = jest.fn();
      }
      pre(event, fn) {
        this.pre.mock.calls.push([event, fn]);
        return this;
      }
      post(event, fn) {
        this.post.mock.calls.push([event, fn]);
        return this;
      }
      virtual(_name) {
        return {
          get: jest.fn(),
        };
      }
    },
    model: jest.fn((name, schema) => {
      return {
        modelName: name,
        schema,
      };
    }),
  };
});

describe('Order Model', () => {
  let Order;

  beforeEach(() => {
    jest.resetModules();
    Order = require('../../models/Order');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema Definition', () => {
    it('should define Order model', () => {
      expect(Order).toBeDefined();
      expect(mongoose.model).toHaveBeenCalled();
    });

    it('should have correct model name', () => {
      expect(mongoose.model).toHaveBeenCalledWith('Order', expect.anything());
    });
  });

  describe('Order Schema Structure', () => {
    it('should define schema with required fields', () => {
      // Verify mongoose.model was called with a schema
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      expect(modelCall).toBeDefined();
      expect(modelCall[1]).toBeDefined();
    });

    it('should have userId field definition', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      expect(schema.definition).toHaveProperty('userId');
    });

    it('should have items array field', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      expect(schema.definition).toHaveProperty('items');
    });

    it('should have total field', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      expect(schema.definition).toHaveProperty('total');
    });

    it('should have status field', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      expect(schema.definition).toHaveProperty('status');
    });

    it('should have shippingAddress field', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      expect(schema.definition).toHaveProperty('shippingAddress');
    });

    it('should have paymentMethod field', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      expect(schema.definition).toHaveProperty('paymentMethod');
    });
  });

  describe('Schema Middleware', () => {
    it('should have pre-save hook defined', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      expect(schema.pre).toHaveBeenCalled();
    });
  });

  describe('Field Validations', () => {
    it('should define userId as required', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      const userIdField = schema.definition.userId;
      expect(userIdField).toBeDefined();
      expect(userIdField.required).toBe(true);
    });

    it('should define total as required', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      const totalField = schema.definition.total;
      expect(totalField).toBeDefined();
      expect(totalField.required).toBe(true);
    });

    it('should define shippingAddress as required', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      const addressField = schema.definition.shippingAddress;
      expect(addressField).toBeDefined();
      expect(addressField.required).toBe(true);
    });

    it('should define paymentMethod as required', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      const paymentField = schema.definition.paymentMethod;
      expect(paymentField).toBeDefined();
      expect(paymentField.required).toBe(true);
    });
  });

  describe('Default Values', () => {
    it('should have default status', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      const statusField = schema.definition.status;
      expect(statusField).toBeDefined();
      expect(statusField.default).toBeDefined();
    });

    it('should have default currency', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      const currencyField = schema.definition.currency;
      expect(currencyField).toBeDefined();
      expect(currencyField.default).toBe('CLP');
    });
  });

  describe('Enumerations', () => {
    it('should define status enum values', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      const statusField = schema.definition.status;
      expect(statusField).toBeDefined();
      expect(statusField.enum).toBeDefined();
      expect(Array.isArray(statusField.enum)).toBe(true);
    });

    it('should define paymentMethod enum values', () => {
      const modelCall = mongoose.model.mock.calls.find((call) => call[0] === 'Order');
      const schema = modelCall[1];
      const paymentField = schema.definition.paymentMethod;
      expect(paymentField).toBeDefined();
      expect(paymentField.enum).toBeDefined();
      expect(Array.isArray(paymentField.enum)).toBe(true);
    });
  });
});
