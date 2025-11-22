/**
 * Tests de Integración para Auth Routes
 */

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');

// Mock de dependencias
jest.mock('../config/database', () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock('bcrypt');

const authRouter = require('../routes/auth');
const { db } = require('../config/database');

describe('Auth Routes - Integration Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    // Mock req.log para evitar errores
    app.use((req, res, next) => {
      req.log = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      };
      next();
    });
    
    app.use('/auth', authRouter);
  });

  describe('POST /auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock: usuario no existe
      db.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock: hash password
      bcrypt.hash.mockResolvedValue('hashed_password');
      
      // Mock: insertar usuario
      db.query.mockResolvedValueOnce({ rows: [{ id: '123' }] });

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('registrado exitosamente');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should reject registration with missing name', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with missing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with missing password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short name', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'T',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      // Mock: usuario ya existe
      db.query.mockResolvedValueOnce({
        rows: [{ id: '456', email: 'existing@example.com' }],
      });

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('ya existe');
    });

    it('should hash password before storing', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'plaintext',
      };

      db.query.mockResolvedValueOnce({ rows: [] });
      bcrypt.hash.mockResolvedValue('hashed_plaintext');
      db.query.mockResolvedValueOnce({ rows: [{ id: '789' }] });

      await request(app)
        .post('/auth/register')
        .send(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '123',
        username: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'user',
      };

      // Mock: encontrar usuario
      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      
      // Mock: verificar password
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('exitoso');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Mock: usuario no encontrado
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Credenciales inválidas');
    });

    it('should return 401 for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Credenciales inválidas');
    });

    it('should require email field', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should require password field', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return user data with token', async () => {
      const mockUser = {
        id: '456',
        username: 'John Doe',
        email: 'john@example.com',
        password: 'hashed',
        role: 'admin',
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password',
        });

      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('name');
      expect(response.body.data.user).toHaveProperty('email');
      expect(response.body.data.user).toHaveProperty('role');
      expect(response.body.data.user.role).toBe('admin');
    });

    it('should not return password in response', async () => {
      const mockUser = {
        id: '789',
        username: 'Jane',
        email: 'jane@example.com',
        password: 'hashed_password',
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password',
        });

      expect(response.body.data.user).not.toHaveProperty('password');
    });
  });

  describe('POST /auth/google', () => {
    it('should authenticate with Google successfully', async () => {
      const googleData = {
        googleId: '108241652687135695123',
        email: 'google@example.com',
        name: 'Google User',
      };

      // Mock: usuario no existe
      db.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock: crear usuario
      db.query.mockResolvedValueOnce({ rows: [{ id: '999' }] });

      const response = await request(app)
        .post('/auth/google')
        .send(googleData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should require googleId field', async () => {
      const response = await request(app)
        .post('/auth/google')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should require email field', async () => {
      const response = await request(app)
        .post('/auth/google')
        .send({
          googleId: '123456',
        });

      expect(response.status).toBe(400);
    });

    it('should accept optional name field', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({ rows: [{ id: '111' }] });

      const response = await request(app)
        .post('/auth/google')
        .send({
          googleId: '123456',
          email: 'test@google.com',
          name: 'Optional Name',
        });

      expect(response.status).toBe(200);
    });

    it('should accept optional picture field', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({ rows: [{ id: '222' }] });

      const response = await request(app)
        .post('/auth/google')
        .send({
          googleId: '123456',
          email: 'test@google.com',
          picture: 'https://example.com/photo.jpg',
        });

      expect(response.status).toBe(200);
    });

    it('should reject invalid picture URL format', async () => {
      const response = await request(app)
        .post('/auth/google')
        .send({
          googleId: '123456',
          email: 'test@google.com',
          picture: 'not-a-url',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBeGreaterThanOrEqual(500);
    });

    it('should handle bcrypt errors', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      bcrypt.hash.mockRejectedValue(new Error('Hash failed'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBeGreaterThanOrEqual(500);
    });
  });
});
