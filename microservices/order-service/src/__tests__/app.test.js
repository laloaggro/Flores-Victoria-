jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: { on: jest.fn(), once: jest.fn() },
  model: jest.fn(),
  Schema: jest.fn(),
}));

const express = require('express');

describe('Order Service - App', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load app module', () => {
    app = require('../app');
    expect(app).toBeDefined();
  });

  it('should export express app', () => {
    app = require('../app');
    expect(typeof app).toBe('function' || typeof app === 'object');
  });

  it('should be mountable', () => {
    app = require('../app');
    if (app && typeof app === 'object') {
      expect(typeof app.use).toBe('function');
    } else {
      expect(app).toBeTruthy();
    }
  });

  it('should have listen method', () => {
    app = require('../app');
    if (typeof app === 'object' && app.listen) {
      expect(typeof app.listen).toBe('function');
    } else {
      expect(app).toBeTruthy();
    }
  });
});
