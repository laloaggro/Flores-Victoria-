const AuthController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock de las dependencias
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock de la base de datos
const mockDb = {
  get: jest.fn(),
  run: jest.fn()
};

// Mock de la solicitud y respuesta Express
const mockRequest = (body = {}, headers = {}) => ({
  body,
  headers
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  let authController;
  let userModel;

  beforeEach(() => {
    userModel = new User(mockDb);
    authController = new AuthController(mockDb);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      // Mock de las funciones de bcrypt
      bcrypt.hash.mockResolvedValue('hashedPassword');
      mockDb.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const req = mockRequest(newUser);
      const res = mockResponse();

      await authController.register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
      expect(mockDb.run).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
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

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteUser = {
        email: 'test@example.com'
      };

      const req = mockRequest(incompleteUser);
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Nombre de usuario, email y contraseña son requeridos'
      });
    });

    it('debería devolver error 500 si hay un error en la base de datos', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');
      mockDb.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Error de base de datos'));
      });

      const req = mockRequest(newUser);
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('login', () => {
    it('debería iniciar sesión correctamente con credenciales válidas', async () => {
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

      // Mock de las funciones
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, user);
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fakeToken');

      const req = mockRequest(credentials);
      const res = mockResponse();

      await authController.login(req, res);

      expect(mockDb.get).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, user.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
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

    it('debería devolver error 401 con credenciales inválidas', async () => {
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
      bcrypt.compare.mockResolvedValue(false);

      const req = mockRequest(credentials);
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    });

    it('debería devolver error 400 si faltan credenciales', async () => {
      const incompleteCredentials = {
        email: 'test@example.com'
      };

      const req = mockRequest(incompleteCredentials);
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email y contraseña son requeridos'
      });
    });
  });

  describe('logout', () => {
    it('debería cerrar sesión correctamente', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authController.logout(req, res);

      expect(res.cookie).toHaveBeenCalledWith('token', '', { maxAge: 0 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Sesión cerrada exitosamente'
      });
    });
  });

  describe('getProfile', () => {
    it('debería obtener el perfil del usuario correctamente', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      const req = { user };
      const res = mockResponse();

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
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