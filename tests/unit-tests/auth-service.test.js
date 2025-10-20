// Mock de las dependencias ANTES de importar el módulo
jest.mock('bcrypt');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword, generateToken, verifyToken } = require('../../microservices/auth-service/src/utils/authUtils');

describe('Auth Service - Unit Tests', () => {
  describe('validateEmail', () => {
    test('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    test('should return false for invalid emails', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should return true for valid passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('StrongPass#2025')).toBe(true);
    });

    test('should return false for invalid passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('nouppercase123!')).toBe(false);
      expect(validatePassword('NOLOWERCASE123!')).toBe(false);
      expect(validatePassword('NoSpecialChar123')).toBe(false);
      expect(validatePassword('NoNumbers!')).toBe(false);
    });
  });

  describe('generateToken', () => {
    beforeEach(() => {
      jwt.sign.mockReset();
    });

    test('should generate a token', () => {
      jwt.sign.mockReturnValue('mocked-token');
      
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBe('mocked-token');
      expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
    });
  });

  describe('verifyToken', () => {
    beforeEach(() => {
      jwt.verify.mockReset();
    });

    test('should verify a valid token', () => {
      const mockDecoded = { id: 1, email: 'test@example.com' };
      jwt.verify.mockReturnValue(mockDecoded);
      
      const result = verifyToken('valid-token');
      
      expect(result).toEqual(mockDecoded);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET || 'fallback_secret');
    });

    test('should handle invalid tokens', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      expect(() => verifyToken('invalid-token')).toThrow('Invalid token');
    });
  });
});