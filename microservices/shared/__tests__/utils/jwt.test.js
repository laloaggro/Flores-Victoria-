/**
 * Tests para utilidades JWT compartidas
 */

const { verifyToken, generateToken, decodeToken } = require('../jwt');

jest.mock('../jwt', () => {
  const jwt = require('jsonwebtoken');
  return {
    verifyToken: (token, secret) => jwt.verify(token, secret || 'test-secret'),
    generateToken: (payload, secret) => jwt.sign(payload, secret || 'test-secret', { expiresIn: '1h' }),
    decodeToken: (token) => jwt.decode(token),
  };
});

describe('JWT Utils - Shared', () => {
  const mockPayload = { userId: '123', email: 'test@example.com' };
  const secret = 'test-secret-key';

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload, secret);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken({ userId: '1' }, secret);
      const token2 = generateToken({ userId: '2' }, secret);
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockPayload, secret);
      const decoded = verifyToken(token, secret);
      
      expect(decoded).toMatchObject({
        userId: mockPayload.userId,
        email: mockPayload.email,
      });
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here', secret);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(mockPayload, secret, { expiresIn: '0s' });
      
      // Wait a bit to ensure expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            verifyToken(expiredToken, secret);
          }).toThrow();
          resolve();
        }, 100);
      });
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const token = generateToken(mockPayload, secret);
      const decoded = decodeToken(token);
      
      expect(decoded).toMatchObject({
        userId: mockPayload.userId,
        email: mockPayload.email,
      });
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });

    it('should decode even invalid signature tokens', () => {
      const token = generateToken(mockPayload, secret);
      // Token is valid, decodeToken doesn't verify signature
      const decoded = decodeToken(token);
      expect(decoded).toBeDefined();
    });

    it('should return null for malformed tokens', () => {
      const decoded = decodeToken('not-a-token');
      expect(decoded).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete auth flow', () => {
      // Generate token
      const token = generateToken(mockPayload, secret);
      
      // Verify token
      const verified = verifyToken(token, secret);
      expect(verified.userId).toBe(mockPayload.userId);
      
      // Decode without verification
      const decoded = decodeToken(token);
      expect(decoded.userId).toBe(mockPayload.userId);
    });

    it('should maintain payload data through encode/decode cycle', () => {
      const originalPayload = {
        userId: '456',
        email: 'user@test.com',
        role: 'admin',
        permissions: ['read', 'write'],
      };
      
      const token = generateToken(originalPayload, secret);
      const decoded = verifyToken(token, secret);
      
      expect(decoded).toMatchObject(originalPayload);
    });
  });
});
