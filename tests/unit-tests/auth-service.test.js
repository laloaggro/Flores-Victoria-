const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');

// Mocks
const mockDb = {
  get: jest.fn(),
  run: jest.fn()
};

jest.mock('../../microservices/auth-service/src/config/database', () => ({
  db: mockDb
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service - Unit Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reiniciar el módulo de la aplicación
    jest.resetModules();
    app = require('../../microservices/auth-service/src/app');
  });

  describe('Health Check Endpoint', () => {
    test('should return 200 and service information', async () => {
      await request(app)
        .get('/')
        .expect(200)
        .expect({
          status: 'success',
          message: 'Servicio de Autenticación - Arreglos Victoria',
          version: '1.0.0'
        });
    });
  });

  describe('Register Endpoint', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock para verificar que el usuario no existe
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // No user found
      });

      // Mock para hashear la contraseña
      bcrypt.hash.mockImplementation((password, salt, callback) => {
        callback(null, 'hashedPassword123');
      });

      // Mock para crear el usuario
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
        // Simular el contexto de la función run con lastID
        const context = { lastID: 1 };
        callback.call(context, null);
      });

      // Mock para generar el token
      jwt.sign.mockReturnValue('testToken123');

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)
        .expect(res => {
          expect(res.body.status).toBe('success');
          expect(res.body.token).toBe('testToken123');
          expect(res.body.data.user.name).toBe(userData.name);
          expect(res.body.data.user.email).toBe(userData.email);
        });
    });

    test('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        name: 'Test User'
        // Missing email and password
      };

      await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400)
        .expect({
          status: 'fail',
          message: 'Nombre, email y contraseña son requeridos'
        });
    });

    test('should return 400 when email is already registered', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock para verificar que el usuario ya existe
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, name: 'Test User', email: 'test@example.com' }); // User found
      });

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)
        .expect({
          status: 'fail',
          message: 'El email ya está registrado'
        });
    });

    test('should return 500 when database error occurs during user check', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock para simular error en la base de datos
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500)
        .expect({
          status: 'error',
          message: 'Error interno del servidor'
        });
    });

    test('should return 500 when password hashing fails', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock para verificar que el usuario no existe
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // No user found
      });

      // Mock para simular error al hashear la contraseña
      bcrypt.hash.mockImplementation((password, salt, callback) => {
        callback(new Error('Hashing error'), null);
      });

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500)
        .expect({
          status: 'error',
          message: 'Error interno del servidor'
        });
    });

    test('should return 500 when database error occurs during user creation', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock para verificar que el usuario no existe
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // No user found
      });

      // Mock para hashear la contraseña
      bcrypt.hash.mockImplementation((password, salt, callback) => {
        callback(null, 'hashedPassword123');
      });

      // Mock para simular error al crear el usuario
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500)
        .expect({
          status: 'error',
          message: 'Error interno del servidor'
        });
    });
  });

  describe('Login Endpoint', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      // Mock para buscar el usuario
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockUser);
      });

      // Mock para comparar contraseñas
      bcrypt.compare.mockImplementation((password, hash, callback) => {
        callback(null, true); // Passwords match
      });

      // Mock para generar el token
      jwt.sign.mockReturnValue('testToken123');

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)
        .expect(res => {
          expect(res.body.status).toBe('success');
          expect(res.body.token).toBe('testToken123');
          expect(res.body.data.user.name).toBe(mockUser.name);
          expect(res.body.data.user.email).toBe(mockUser.email);
        });
    });

    test('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing password
      };

      await request(app)
        .post('/api/auth/login')
        .send(incompleteData)
        .expect(400)
        .expect({
          status: 'fail',
          message: 'Email y contraseña son requeridos'
        });
    });

    test('should return 401 when user is not found', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock para simular que el usuario no existe
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // No user found
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)
        .expect({
          status: 'fail',
          message: 'Credenciales inválidas'
        });
    });

    test('should return 401 when password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      // Mock para buscar el usuario
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockUser);
      });

      // Mock para simular que las contraseñas no coinciden
      bcrypt.compare.mockImplementation((password, hash, callback) => {
        callback(null, false); // Passwords don't match
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)
        .expect({
          status: 'fail',
          message: 'Credenciales inválidas'
        });
    });

    test('should return 500 when database error occurs during user search', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock para simular error en la base de datos
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(500)
        .expect({
          status: 'error',
          message: 'Error interno del servidor'
        });
    });

    test('should return 500 when password comparison fails', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      // Mock para buscar el usuario
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockUser);
      });

      // Mock para simular error al comparar contraseñas
      bcrypt.compare.mockImplementation((password, hash, callback) => {
        callback(new Error('Comparison error'), null);
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(500)
        .expect({
          status: 'error',
          message: 'Error interno del servidor'
        });
    });
  });
});