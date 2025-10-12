const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../microservices/user-service/src/models/User');
const { authenticateToken } = require('../../microservices/user-service/src/routes/users');

// Mock de dependencias
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../microservices/user-service/src/config', () => ({
  jwt: {
    secret: 'test-secret'
  }
}));

describe('User Service - Unit Tests', () => {
  describe('User Model', () => {
    let mockDb;
    let user;

    beforeEach(() => {
      mockDb = {
        query: jest.fn()
      };
      user = new User(mockDb);
    });

    describe('create', () => {
      test('should create a new user with hashed password', async () => {
        const name = 'Test User';
        const email = 'test@example.com';
        const password = 'password123';
        const hashedPassword = 'hashedPassword123';
        
        bcrypt.hash.mockResolvedValue(hashedPassword);
        
        const mockResult = {
          rows: [{
            id: 1,
            name,
            email,
            role: 'user',
            created_at: new Date()
          }]
        };
        
        mockDb.query.mockResolvedValue(mockResult);
        
        const result = await user.create(name, email, password);
        
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO users'),
          [name, email, hashedPassword, 'user']
        );
        expect(result).toEqual(mockResult.rows[0]);
      });

      test('should throw error when database query fails', async () => {
        const error = new Error('Database error');
        bcrypt.hash.mockResolvedValue('hashedPassword');
        mockDb.query.mockRejectedValue(error);
        
        await expect(user.create('Test User', 'test@example.com', 'password'))
          .rejects.toThrow('Error al crear usuario');
      });
    });

    describe('findByEmail', () => {
      test('should find user by email', async () => {
        const email = 'test@example.com';
        const mockUser = {
          id: 1,
          name: 'Test User',
          email,
          password: 'hashedPassword'
        };
        
        mockDb.query.mockResolvedValue({
          rows: [mockUser]
        });
        
        const result = await user.findByEmail(email);
        
        expect(mockDb.query).toHaveBeenCalledWith(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );
        expect(result).toEqual(mockUser);
      });
    });

    describe('findById', () => {
      test('should find user by id', async () => {
        const id = 1;
        const mockUser = {
          id,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          created_at: new Date()
        };
        
        mockDb.query.mockResolvedValue({
          rows: [mockUser]
        });
        
        const result = await user.findById(id);
        
        expect(mockDb.query).toHaveBeenCalledWith(
          'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
          [id]
        );
        expect(result).toEqual(mockUser);
      });
    });

    describe('comparePassword', () => {
      test('should compare password with hashed password', async () => {
        const plainPassword = 'password123';
        const hashedPassword = 'hashedPassword123';
        bcrypt.compare.mockResolvedValue(true);
        
        const result = await user.comparePassword(plainPassword, hashedPassword);
        
        expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
        expect(result).toBe(true);
      });
    });
  });

  describe('Authentication Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    describe('authenticateToken', () => {
      test('should return 401 when no token is provided', () => {
        const middleware = authenticateToken;
        middleware(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ 
          error: 'Acceso denegado. No se proporcionó token.' 
        });
        expect(next).not.toHaveBeenCalled();
      });

      test('should return 403 when token is invalid', () => {
        req.headers['authorization'] = 'Bearer invalidToken';
        const error = new Error('Invalid token');
        jwt.verify.mockImplementation((token, secret, callback) => {
          callback(error, null);
        });
        
        const middleware = authenticateToken;
        middleware(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ 
          error: 'Token inválido' 
        });
        expect(next).not.toHaveBeenCalled();
      });

      test('should call next when token is valid', () => {
        req.headers['authorization'] = 'Bearer validToken';
        const decodedUser = { id: 1, email: 'test@example.com' };
        jwt.verify.mockImplementation((token, secret, callback) => {
          callback(null, decodedUser);
        });
        
        const middleware = authenticateToken;
        middleware(req, res, next);
        
        expect(req.user).toEqual(decodedUser);
        expect(next).toHaveBeenCalled();
      });
    });
  });
});