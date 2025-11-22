/**
 * Tests for JWT utility functions
 */

const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../jwt');

jest.mock('jsonwebtoken');

describe('JWT Utils', () => {
  const mockPayload = { userId: '456', role: 'admin' };
  const mockToken = 'mock.jwt.token';
  const mockSecret = 'default_secret';

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  describe('generateToken', () => {
    it('should generate token with default secret', () => {
      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, mockSecret, {
        expiresIn: '24h',
      });
      expect(result).toBe(mockToken);
    });

    it('should generate token with custom secret from env', () => {
      process.env.JWT_SECRET = 'custom_secret';
      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, 'custom_secret', {
        expiresIn: '24h',
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify token with default secret', () => {
      const mockDecoded = { userId: '456', role: 'admin' };
      jwt.verify.mockReturnValue(mockDecoded);

      const result = verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockSecret);
      expect(result).toEqual(mockDecoded);
    });

    it('should verify token with custom secret from env', () => {
      process.env.JWT_SECRET = 'custom_secret';
      const mockDecoded = { userId: '456', role: 'admin' };
      jwt.verify.mockReturnValue(mockDecoded);

      const result = verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'custom_secret');
      expect(result).toEqual(mockDecoded);
    });

    it('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken('invalid.token')).toThrow('Invalid token');
    });
  });
});
