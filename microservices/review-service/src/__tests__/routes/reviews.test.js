const express = require('express');

describe('Reviews Routes', () => {
  it('should export router', () => {
    const router = require('../../routes/reviews');
    expect(router).toBeDefined();
  });

  it('should be an object with routing functionality', () => {
    const router = require('../../routes/reviews');
    expect(typeof router).toBe('object');
  });
});
