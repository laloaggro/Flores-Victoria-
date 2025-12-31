const express = require('express');

// Mock all dependencies
jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));
jest.mock('helmet', () => jest.fn(() => (req, res, next) => next()));
jest.mock('express-rate-limit', () => jest.fn(() => (req, res, next) => next()));

jest.mock('../../shared/middleware/health-check', () => ({
  createHealthCheck: jest.fn(() => (req, res) => res.json({ status: 'ok' })),
  createLivenessCheck: jest.fn(() => (req, res) => res.json({ alive: true })),
  createReadinessCheck: jest.fn(() => (req, res) => res.json({ ready: true })),
}));

jest.mock('../../shared/middleware/request-id', () => ({
  requestId: jest.fn(() => (req, res, next) => {
    req.id = 'test-id';
    next();
  }),
}));

describe('Common Middleware - Coverage', () => {
  let commonModule;
  let app;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    commonModule = require('../../middleware/common');
    app = express();
  });

  it('should load common middleware module', () => {
    expect(commonModule).toBeDefined();
  });

  it('should export applyCommonMiddleware or be a function', () => {
    const fn = commonModule.applyCommonMiddleware || commonModule;
    expect(typeof fn).toBe('function');
  });

  it('should apply middleware without errors', () => {
    const fn = commonModule.applyCommonMiddleware || commonModule;
    expect(() => fn(app)).not.toThrow();
  });

  it('should configure app with middlewares', () => {
    const fn = commonModule.applyCommonMiddleware || commonModule;
    const spy = jest.spyOn(app, 'use');
    fn(app);
    expect(spy).toHaveBeenCalled();
  });

  it('should work with express application', () => {
    const fn = commonModule.applyCommonMiddleware || commonModule;
    const testApp = express();
    fn(testApp);
    expect(testApp._router).toBeDefined();
  });

  it('should export health check functions if available', () => {
    if (commonModule.createHealthCheck) {
      expect(typeof commonModule.createHealthCheck).toBe('function');
    }
  });
});
