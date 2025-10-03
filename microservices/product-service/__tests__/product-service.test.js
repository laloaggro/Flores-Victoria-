const request = require('supertest');
const express = require('express');
const productRoutes = require('../src/routes/products');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Service', () => {
  describe('GET /api/products/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/products/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('service', 'Product Service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/products/all', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/api/products/all')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});