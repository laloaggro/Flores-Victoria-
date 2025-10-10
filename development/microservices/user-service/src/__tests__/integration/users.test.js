const request = require('supertest');
const express = require('express');
const UserController = require('../../controllers/userController');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Mock del cliente de base de datos para pruebas de integración
let mockDb;

// Inicializar el controlador con una base de datos mock
let userController;

// Middleware para inyectar la base de datos mock
app.use((req, res, next) => {
  req.db = mockDb;
  next();
});

// Inicializar controladores con base de datos mock
app.use((req, res, next) => {
  userController = new UserController(req.db);
  next();
});

// Rutas para pruebas
app.get('/api/users', (req, res) => {
  userController.getAllUsers(req, res);
});

app.get('/api/users/:id', (req, res) => {
  userController.getUserById(req, res);
});

app.put('/api/users/:id', (req, res) => {
  userController.updateUser(req, res);
});

app.delete('/api/users/:id', (req, res) => {
  userController.deleteUser(req, res);
});

describe('User Service Integration Tests', () => {
  beforeEach(() => {
    // Crear una base de datos mock para cada prueba
    mockDb = {
      query: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('debería obtener una lista de usuarios', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' }
      ];
      
      mockDb.query.mockResolvedValueOnce({ rows: mockUsers });

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          users: mockUsers
        }
      });
    });

    it('debería manejar errores al obtener usuarios', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/api/users')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('debería obtener un usuario por ID', async () => {
      const mockUser = { id: 1, username: 'user1', email: 'user1@example.com' };
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          user: mockUser
        }
      });
    });

    it('debería devolver 404 si el usuario no existe', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });
  });

  describe('PUT /api/users/:id', () => {
    it('debería actualizar un usuario existente', async () => {
      const existingUser = { id: 1, username: 'user1', email: 'user1@example.com' };
      const updatedData = { username: 'updatedUser', email: 'updated@example.com' };
      
      // Mock para verificar que el usuario existe
      mockDb.query
        .mockResolvedValueOnce({ rows: [existingUser] }) // Para verificar existencia
        .mockResolvedValueOnce({ rows: [] }) // Para verificar email único
        .mockResolvedValueOnce({ rowCount: 1 }); // Para actualizar

      const response = await request(app)
        .put('/api/users/1')
        .send(updatedData)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: {
          user: {
            id: 1,
            username: 'updatedUser',
            email: 'updated@example.com'
          }
        }
      });
    });

    it('debería devolver 404 al intentar actualizar un usuario que no existe', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/users/999')
        .send({ username: 'updatedUser' })
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('debería eliminar un usuario existente', async () => {
      const existingUser = { id: 1, username: 'user1', email: 'user1@example.com' };
      
      // Mock para verificar que el usuario existe
      mockDb.query
        .mockResolvedValueOnce({ rows: [existingUser] }) // Para verificar existencia
        .mockResolvedValueOnce({ rowCount: 1 }); // Para eliminar

      const response = await request(app)
        .delete('/api/users/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Usuario eliminado correctamente'
      });
    });

    it('debería devolver 404 al intentar eliminar un usuario que no existe', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete('/api/users/999')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });
  });
});