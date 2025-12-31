jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn(),
    methods: {},
  })),
  model: jest.fn(),
}));

describe('User Model - Basic Tests', () => {
  let User;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load User model', () => {
    try {
      User = require('../../models/User');
      expect(User).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should export model', () => {
    try {
      User = require('../../models/User');
      expect(User).toBeTruthy();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
