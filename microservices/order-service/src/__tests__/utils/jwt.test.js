/**
 * Tests para utilidades JWT de order-service
 */

const { verifyToken } = require('../../utils/jwt');

// Mock de jsonwebtoken
jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

describe('JWT Utils - Order Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockDecoded = { userId: '123', email: 'test@example.com' };
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);

      const result = verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET || 'default-secret');
      expect(result).toEqual(mockDecoded);
    });

    it('should handle invalid token', () => {
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken('invalid-token')).toThrow('Invalid token');
    });

    it('should handle expired token', () => {
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      expect(() => verifyToken('expired-token')).toThrow('jwt expired');
    });

    it('should use JWT_SECRET from environment', () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'test-secret-123';
      
      jwt.verify = jest.fn();
      verifyToken('token');

      expect(jwt.verify).toHaveBeenCalledWith('token', 'test-secret-123');
      
      process.env.JWT_SECRET = originalSecret;
    });
  });
});
