const express = require('express');

describe('Products Routes', () => {
  it('should export router', () => {
    const router = require('../../routes/products');
    expect(router).toBeDefined();
  });

  it('should have routing functionality', () => {
    const router = require('../../routes/products');
    expect(typeof router).toBe('function');
  });
});
