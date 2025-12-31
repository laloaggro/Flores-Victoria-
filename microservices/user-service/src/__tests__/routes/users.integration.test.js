/**
 * Tests de Integración para User Routes
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flores-victoria-secret-key';
const API_KEY = process.env.INTERNAL_SERVICE_SECRET || JWT_SECRET;

// UUIDs para testing
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const ADMIN_ID = '650e8400-e29b-41d4-a716-446655440001';
const NONEXISTENT_ID = '750e8400-e29b-41d4-a716-446655440099';

// Mock del modelo User - debe definirse ANTES del mock
const mockUserModel = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../models/User', () => ({
  User: jest.fn(() => mockUserModel),
}));

jest.mock('../../config/database', () => ({
  client: {
    query: jest.fn(),
  },
}));

const { User } = require('../../models/User');
const userRouter = require('../../routes/users');

// Helper para generar tokens
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

describe('User Routes - Integration Tests', () => {
  let app;
  let adminToken;
  let userToken;

  beforeEach(() => {
    jest.clearAllMocks();

    // Generar tokens para tests
    adminToken = generateToken({ 
      id: ADMIN_ID, 
      email: 'admin@test.com', 
      role: 'admin' 
    });

    userToken = generateToken({ 
      id: USER_ID, 
      email: 'user@test.com', 
      role: 'customer' 
    });

    app = express();
    app.use(express.json());
    app.use('/users', userRouter);
  });

  describe('GET /users', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@test.com', role: 'customer' },
        { id: '2', name: 'User 2', email: 'user2@test.com', role: 'admin' },
      ];

      mockUserModel.findAll.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/users')
        .set('x-api-key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(mockUsers);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      mockUserModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/users')
        .set('x-api-key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockUserModel.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/users')
        .set('x-api-key', API_KEY);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Error obteniendo usuarios');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: USER_ID,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };

      mockUserModel.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/users/${USER_ID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get(`/users/${NONEXISTENT_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Usuario no encontrado');
    });

    it('should handle database errors', async () => {
      mockUserModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/users/${USER_ID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Error obteniendo usuario');
    });
  });

  describe('POST /users', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'customer',
      };

      const createdUser = {
        id: '456',
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      mockUserModel.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserModel.create = jest.fn().mockResolvedValue(createdUser);

      const response = await request(app).post('/users').send(userData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Usuario creado exitosamente');
      expect(response.body.data).toEqual(createdUser);
    });

    it('should require name field', async () => {
      const response = await request(app).post('/users').send({
        email: 'test@test.com',
        password: 'pass123456',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Validation');
    });

    it('should require email field', async () => {
      const response = await request(app).post('/users').send({
        name: 'Test',
        password: 'pass123456',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Validation');
    });

    it('should require password field', async () => {
      const response = await request(app).post('/users').send({
        name: 'Test',
        email: 'test@test.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Validation');
    });

    it('should return 409 if email already exists', async () => {
      const existingUser = {
        id: '789',
        name: 'Existing User',
        email: 'existing@test.com',
      };

      mockUserModel.findByEmail = jest.fn().mockResolvedValue(existingUser);

      const response = await request(app).post('/users').send({
        name: 'New User',
        email: 'existing@test.com',
        password: 'password123456',
      });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('email');
    });

    it('should create user with default customer role', async () => {
      const userData = {
        name: 'Customer User',
        email: 'customer@test.com',
        password: 'password123456',
      };

      mockUserModel.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserModel.create = jest.fn().mockResolvedValue({
        id: '999',
        ...userData,
        role: 'customer',
      });

      const response = await request(app).post('/users').send(userData);

      expect(response.status).toBe(201);
      expect(mockUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: userData.name, email: userData.email })
      );
    });

    it('should accept admin role', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123456',
        role: 'admin',
      };

      mockUserModel.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserModel.create = jest.fn().mockResolvedValue({
        id: '111',
        ...userData,
      });

      const response = await request(app).post('/users').send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe('admin');
    });

    it('should handle creation errors', async () => {
      mockUserModel.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserModel.create = jest.fn().mockRejectedValue(new Error('Creation failed'));

      const response = await request(app).post('/users').send({
        name: 'Test',
        email: 'test@test.com',
        password: 'password123456',
      });

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Error creando usuario');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com',
      };

      const updatedUser = {
        id: USER_ID,
        ...updateData,
        role: 'customer',
      };

      mockUserModel.findById = jest.fn().mockResolvedValue({ id: USER_ID });
      mockUserModel.update = jest.fn().mockResolvedValue(updatedUser);

      const response = await request(app)
        .put(`/users/${USER_ID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('actualizado');
      expect(response.body.data).toEqual(updatedUser);
    });

    it('should return 404 when updating non-existent user', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put(`/users/${NONEXISTENT_ID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test',
          email: 'test@test.com',
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('no encontrado');
    });

    it('should require name or email for update', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue({ id: USER_ID });

      const response = await request(app)
        .put(`/users/${USER_ID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should handle update errors', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue({ id: USER_ID });
      mockUserModel.update = jest.fn().mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .put(`/users/${USER_ID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test',
          email: 'test@test.com',
        });

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Error actualizando usuario');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue({ id: USER_ID });
      mockUserModel.delete = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .delete(`/users/${USER_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('eliminado');
    });

    it('should return 404 when deleting non-existent user', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .delete(`/users/${NONEXISTENT_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('no encontrado');
    });

    it('should handle deletion errors', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue({ id: USER_ID });
      mockUserModel.delete = jest.fn().mockRejectedValue(new Error('Deletion failed'));

      const response = await request(app)
        .delete(`/users/${USER_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Error eliminando usuario');
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should return proper error structure', async () => {
      mockUserModel.findAll = jest.fn().mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .get('/users')
        .set('x-api-key', API_KEY);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body.status).toBe('error');
    });
  });
});
