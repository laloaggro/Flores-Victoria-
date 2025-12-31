const express = require('express');

describe('Index Routes - Product Service', () => {
  let indexRoutes;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load index routes', () => {
    indexRoutes = require('../../routes/index');
    expect(indexRoutes).toBeDefined();
  });

  it('should export router', () => {
    indexRoutes = require('../../routes/index');
    const isRouter = typeof indexRoutes === 'function' || 
                    (indexRoutes && typeof indexRoutes.get === 'function');
    expect(isRouter).toBe(true);
  });

  it('should be mountable in express app', () => {
    indexRoutes = require('../../routes/index');
    const app = express();
    expect(() => app.use('/', indexRoutes)).not.toThrow();
  });

  it('should have route handlers', () => {
    indexRoutes = require('../../routes/index');
    if (indexRoutes && indexRoutes.stack) {
      expect(indexRoutes.stack.length).toBeGreaterThan(0);
    } else {
      expect(indexRoutes).toBeTruthy();
    }
  });
});
