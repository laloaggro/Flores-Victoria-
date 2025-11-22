/**
 * Tests de Integración para User Routes
 */

const request = require('supertest');
const express = require('express');

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

describe('User Routes - Integration Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

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

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(mockUsers);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      mockUserModel.findAll.mockResolvedValue([]);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockUserModel.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/users');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Error obteniendo usuarios');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };

      mockUserModel.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).get('/users/123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app).get('/users/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Usuario no encontrado');
    });

    it('should handle database errors', async () => {
      mockUserModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/users/123');

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
        password: 'pass123',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('requeridos');
    });

    it('should require email field', async () => {
      const response = await request(app).post('/users').send({
        name: 'Test',
        password: 'pass123',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('requeridos');
    });

    it('should require password field', async () => {
      const response = await request(app).post('/users').send({
        name: 'Test',
        email: 'test@test.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('requeridos');
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
        password: 'pass123',
      });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('email ya está registrado');
    });

    it('should create user with default customer role', async () => {
      const userData = {
        name: 'Customer User',
        email: 'customer@test.com',
        password: 'pass123',
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
        password: 'pass123',
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
        password: 'pass123',
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
        id: '123',
        ...updateData,
        role: 'customer',
      };

      mockUserModel.findById = jest.fn().mockResolvedValue({ id: '123' });
      mockUserModel.update = jest.fn().mockResolvedValue(updatedUser);

      const response = await request(app).put('/users/123').send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('actualizado');
      expect(response.body.data).toEqual(updatedUser);
    });

    it('should return 404 when updating non-existent user', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app).put('/users/nonexistent').send({
        name: 'Test',
        email: 'test@test.com',
      });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('no encontrado');
    });

    it('should require name or email for update', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue({ id: '123' });

      const response = await request(app).put('/users/123').send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should handle update errors', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue({ id: '123' });
      mockUserModel.update = jest.fn().mockRejectedValue(new Error('Update failed'));

      const response = await request(app).put('/users/123').send({
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
      mockUserModel.findById = jest.fn().mockResolvedValue({ id: '123' });
      mockUserModel.delete = jest.fn().mockResolvedValue(true);

      const response = await request(app).delete('/users/123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('eliminado');
    });

    it('should return 404 when deleting non-existent user', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app).delete('/users/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('no encontrado');
    });

    it('should handle deletion errors', async () => {
      mockUserModel.findById = jest.fn().mockResolvedValue({ id: '123' });
      mockUserModel.delete = jest.fn().mockRejectedValue(new Error('Deletion failed'));

      const response = await request(app).delete('/users/123');

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

      const response = await request(app).get('/users');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body.status).toBe('error');
    });
  });
});
