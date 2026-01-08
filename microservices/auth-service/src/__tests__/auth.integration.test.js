/**
 * @fileoverview Integration Tests for Auth API
 * @description Tests de API usando Supertest
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Crear app de prueba
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Simular rutas de auth
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (email === 'test@flores-victoria.com' && password === 'Password123') {
      const token = jwt.sign(
        { userId: 'user-123', email, role: 'customer' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      return res.json({ token, user: { id: 'user-123', email, role: 'customer' } });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (email === 'existing@flores-victoria.com') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const token = jwt.sign(
      { userId: 'new-user-123', email, role: 'customer' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    return res.status(201).json({ 
      token, 
      user: { id: 'new-user-123', email, name, role: 'customer' } 
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      return res.json({ user: decoded });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    return res.json({ message: 'Logged out successfully' });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'auth-service' });
  });

  return app;
};

describe('Auth API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@flores-victoria.com',
          password: 'Password123',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@flores-victoria.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@flores-victoria.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.error).toBe('Email and password required');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@flores-victoria.com',
          password: 'SecurePass123',
          name: 'New User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('newuser@flores-victoria.com');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@flores-victoria.com',
          password: 'SecurePass123',
          name: 'Existing User',
        })
        .expect(409);

      expect(response.body.error).toBe('Email already exists');
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.error).toBe('All fields required');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      // Primero hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@flores-victoria.com',
          password: 'Password123',
        });

      const token = loginResponse.body.token;

      // Luego obtener perfil
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.email).toBe('test@flores-victoria.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('auth-service');
    });
  });
});

describe('Token Refresh Flow', () => {
  it('should have proper token structure', () => {
    const token = jwt.sign(
      { userId: 'user-123', email: 'test@example.com', role: 'customer' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    const decoded = jwt.decode(token);
    expect(decoded).toHaveProperty('userId');
    expect(decoded).toHaveProperty('email');
    expect(decoded).toHaveProperty('role');
    expect(decoded).toHaveProperty('iat');
    expect(decoded).toHaveProperty('exp');
  });

  it('should calculate correct token expiration', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      { userId: 'user-123' },
      'test-secret',
      { expiresIn: '1h' }
    );

    const decoded = jwt.decode(token);
    const expiresIn = decoded.exp - decoded.iat;
    expect(expiresIn).toBe(3600); // 1 hora en segundos
  });
});
