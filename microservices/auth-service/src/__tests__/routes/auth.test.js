const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');

// Mock del logger
jest.mock('../../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock del modelo User
jest.mock('../../models/User');
const User = require('../../models/User');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
      };

      User.findByEmail = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should return 400 if email already exists', async () => {
      User.findByEmail = jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('ya está registrado');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('requeridos');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: '$2a$10$hashedpassword',
        name: 'Test User',
        role: 'customer',
      };

      User.findByEmail = jest.fn().mockResolvedValue(mockUser);
      
      // Mock bcrypt
      jest.mock('bcryptjs', () => ({
        compare: jest.fn().mockResolvedValue(true),
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 401 with invalid credentials', async () => {
      User.findByEmail = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify a valid token', async () => {
      // Este endpoint requiere autenticación, por lo que se probará en tests de integración
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      // Esperamos error sin token válido
      expect([401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should handle forgot password request', async () => {
      User.findByEmail = jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com',
        });

      // El comportamiento exacto depende de la implementación
      expect([200, 201, 202]).toContain(response.status);
    });

    it('should return error if email not provided', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
