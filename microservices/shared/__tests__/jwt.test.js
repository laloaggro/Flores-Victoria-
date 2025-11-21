const jwt = require('jsonwebtoken');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('JWT Utilities', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const mockToken = 'mock.jwt.token';

      jwt.sign = jest.fn().mockReturnValue(mockToken);

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      expect(jwt.sign).toHaveBeenCalledWith(payload, JWT_SECRET, {
        expiresIn: '24h',
      });
      expect(token).toBe(mockToken);
    });

    it('should include expiration time', () => {
      const payload = { userId: '123' };
      jwt.sign = jest.fn();

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        JWT_SECRET,
        expect.objectContaining({ expiresIn: '1h' })
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = 'valid.jwt.token';
      const decodedPayload = { userId: '123', email: 'test@example.com' };

      jwt.verify = jest.fn().mockReturnValue(decodedPayload);

      const result = jwt.verify(token, JWT_SECRET);

      expect(jwt.verify).toHaveBeenCalledWith(token, JWT_SECRET);
      expect(result).toEqual(decodedPayload);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token';

      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => jwt.verify(invalidToken, JWT_SECRET)).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const expiredToken = 'expired.jwt.token';

      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Token expired');
      });

      expect(() => jwt.verify(expiredToken, JWT_SECRET)).toThrow('Token expired');
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = 'some.jwt.token';
      const decodedPayload = { userId: '123', exp: 1234567890 };

      jwt.decode = jest.fn().mockReturnValue(decodedPayload);

      const result = jwt.decode(token);

      expect(jwt.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual(decodedPayload);
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not.a.valid.jwt';

      jwt.decode = jest.fn().mockReturnValue(null);

      const result = jwt.decode(malformedToken);

      expect(result).toBeNull();
    });
  });

  describe('token payload structure', () => {
    it('should include user identification', () => {
      const payload = {
        userId: '123',
        email: 'user@example.com',
        role: 'customer',
      };

      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
    });

    it('should handle additional claims', () => {
      const payload = {
        userId: '123',
        permissions: ['read', 'write'],
        metadata: { source: 'web' },
      };

      expect(payload.permissions).toBeInstanceOf(Array);
      expect(payload.metadata).toBeInstanceOf(Object);
    });
  });
});
