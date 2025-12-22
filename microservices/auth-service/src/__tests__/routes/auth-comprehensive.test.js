/**
 * @fileoverview Tests de integración completos para auth-service
 * @description Tests que cubren todos los endpoints y flujos de autenticación
 * 
 * Tests incluidos:
 * - Register (éxito y errores)
 * - Login (éxito, credenciales inválidas)
 * - Logout (con revocación de tokens)
 * - Google auth
 * - Profile
 * - Token refresh
 * - Admin endpoints
 */

const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');

// Mock del módulo de token revocation
jest.mock('@flores-victoria/shared/middleware/token-revocation', () => ({
  revokeToken: jest.fn(async () => true),
  initRedisClient: jest.fn(),
  isTokenRevokedMiddleware: jest.fn(() => (req, res, next) => next()),
}));

// Mock de la base de datos
const mockDb = {
  query: jest.fn(),
};

jest.mock('../../config/database', () => ({
  db: mockDb,
  connectToDatabase: jest.fn(async () => true),
  dbGet: jest.fn(),
}));

const authRoutes = require('../../routes/auth');
const config = require('../../config');

// Config de test
const testConfig = {
  jwt: {
    secret: 'test-secret-key-for-auth-testing',
    expiresIn: '1h',
    refreshSecret: 'test-refresh-secret',
    refreshExpiresIn: '7d',
  },
};

describe('Auth Service - Integration Tests', () => {
  let app;
  const testUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'user',
  };

  beforeAll(async () => {
    // Crear app de prueba
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
      req.log = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      };
      next();
    });
    app.use('/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════
  // REGISTER TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'new-user-123' }],
      });

      // Mock dbGet para verificar que el usuario no existe
      const dbGet = require('../../config/database').dbGet || jest.fn();
      dbGet.mockResolvedValueOnce(null); // No existe

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe('juan@example.com');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Juan Pérez',
          email: 'invalid-email',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'short',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Juan Pérez',
          // email missing
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // LOGIN TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('POST /auth/login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Mock password hash comparison
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      mockDb.query.mockResolvedValueOnce({
        rows: [testUser],
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });

    it('should reject login with invalid password', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      mockDb.query.mockResolvedValueOnce({
        rows: [testUser],
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // LOGOUT TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const testToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        testConfig.jwt.secret,
        { expiresIn: '1h' }
      );

      const { revokeToken } = require('@flores-victoria/shared/middleware/token-revocation');

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Logout exitoso');
      expect(revokeToken).toHaveBeenCalledWith(testToken);
    });

    it('should logout with token in body', async () => {
      const testToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        testConfig.jwt.secret,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/auth/logout')
        .send({ token: testToken });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should reject logout without token', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PROFILE TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('GET /auth/profile', () => {
    it('should retrieve user profile with valid token', async () => {
      const testToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        testConfig.jwt.secret
      );

      mockDb.query.mockResolvedValueOnce({
        rows: [testUser],
      });

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GOOGLE AUTH TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('POST /auth/google', () => {
    it('should login with Google OAuth for new user', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'google-user-123',
            username: 'Juan Pérez',
            email: 'juan@gmail.com',
            role: 'user',
            picture: 'https://example.com/photo.jpg',
          },
        ],
      });

      const response = await request(app)
        .post('/auth/google')
        .send({
          googleId: '108241652687135695123',
          email: 'juan@gmail.com',
          name: 'Juan Pérez',
          picture: 'https://example.com/photo.jpg',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('juan@gmail.com');
    });

    it('should login with Google OAuth for existing user', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [testUser],
      });

      const response = await request(app)
        .post('/auth/google')
        .send({
          googleId: '108241652687135695123',
          email: testUser.email,
          name: testUser.username,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should require googleId', async () => {
      const response = await request(app)
        .post('/auth/google')
        .send({
          // googleId missing
          email: 'test@gmail.com',
        });

      expect(response.status).toBe(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SEED ADMIN TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('POST /auth/seed-admin', () => {
    it('should create admin with valid seed key', async () => {
      process.env.SEED_KEY = 'test-seed-key-123';

      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'admin-123' }],
      });

      const response = await request(app)
        .post('/auth/seed-admin')
        .send({
          email: 'admin@example.com',
          password: 'AdminPass123!',
          name: 'Administrator',
          seedKey: 'test-seed-key-123',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe('admin');
    });

    it('should reject invalid seed key', async () => {
      const response = await request(app)
        .post('/auth/seed-admin')
        .send({
          email: 'admin@example.com',
          password: 'AdminPass123!',
          seedKey: 'wrong-key',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should require minimum password length', async () => {
      const response = await request(app)
        .post('/auth/seed-admin')
        .send({
          email: 'admin@example.com',
          password: 'short',
          seedKey: process.env.SEED_KEY,
        });

      expect(response.status).toBe(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // LIST USERS TESTS (ADMIN)
  // ═══════════════════════════════════════════════════════════════

  describe('GET /auth/users', () => {
    it('should return list of users for admin', async () => {
      const adminToken = jwt.sign(
        { userId: 'admin-id', role: 'admin' },
        testConfig.jwt.secret
      );

      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            { id: '1', username: 'user1', email: 'user1@example.com', role: 'user' },
            { id: '2', username: 'user2', email: 'user2@example.com', role: 'user' },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ total: '2' }],
        });

      const response = await request(app)
        .get('/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should reject non-admin access', async () => {
      const userToken = jwt.sign(
        { userId: 'user-id', role: 'user' },
        testConfig.jwt.secret
      );

      const response = await request(app)
        .get('/auth/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ERROR HANDLING TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should not expose sensitive database information in errors', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('SELECT * FROM users failed'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123!',
        });

      expect(response.body.message).not.toMatch(/SELECT/i);
      expect(response.body.message).not.toMatch(/FROM/i);
    });
  });
});
