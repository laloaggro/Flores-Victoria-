const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthController = require('../../controllers/authController');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Mock de la base de datos para pruebas de integración
let mockDb;

// Inicializar el controlador con una base de datos mock
let authController;

// Middleware para inyectar la base de datos mock
app.use((req, res, next) => {
  req.db = mockDb;
  next();
});

// Inicializar controladores con base de datos mock
app.use((req, res, next) => {
  authController = new AuthController(req.db);
  next();
});

// Rutas para pruebas
app.post('/api/auth/register', (req, res) => {
  authController.register(req, res);
});

app.post('/api/auth/login', (req, res) => {
  authController.login(req, res);
});

app.post('/api/auth/logout', (req, res) => {
  authController.logout(req, res);
});

app.get('/api/auth/profile', (req, res) => {
  authController.getProfile(req, res);
});

describe('Auth Service Integration Tests', () => {
  beforeEach(() => {
    // Crear una base de datos mock para cada prueba
    mockDb = {
      get: jest.fn(),
      run: jest.fn()
    };
    
    // Mock de bcrypt y jwt
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(jwt, 'sign').mockReturnValue('fakeToken');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            username: newUser.username,
            email: newUser.email
          }
        }
      });
    });

    it('debería manejar errores al registrar un usuario', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Error de base de datos'));
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería iniciar sesión correctamente', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, user);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Inicio de sesión exitoso',
        data: {
          token: 'fakeToken',
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        }
      });
    });

    it('debería devolver error con credenciales inválidas', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, user);
      });
      
      // Mock de contraseña incorrecta
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debería cerrar sesión correctamente', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Sesión cerrada exitosamente'
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    it('debería obtener el perfil del usuario', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      const response = await request(app)
        .get('/api/auth/profile')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        }
      });
    });
  });
});