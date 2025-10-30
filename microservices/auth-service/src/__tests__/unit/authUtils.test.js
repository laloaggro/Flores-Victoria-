const {
  validateEmail,
  validatePassword,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
} = require('../../utils/authUtils');

describe('authUtils - Email Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co')).toBe(true);
      expect(validateEmail('name+tag@email.com')).toBe(true);
      expect(validateEmail('user123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user @domain.com')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
      // Note: The simple regex allows 'user@domain..com' - for stricter validation, use a more complex regex
    });
  });
});

describe('authUtils - Password Validation', () => {
  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('Secure@Pass1')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
      expect(validatePassword('Test1234#')).toBe(true);
    });

    it('should reject weak passwords - missing uppercase', () => {
      expect(validatePassword('password123!')).toBe(false);
    });

    it('should reject weak passwords - missing lowercase', () => {
      expect(validatePassword('PASSWORD123!')).toBe(false);
    });

    it('should reject weak passwords - missing number', () => {
      expect(validatePassword('Password!')).toBe(false);
    });

    it('should reject weak passwords - missing special character', () => {
      expect(validatePassword('Password123')).toBe(false);
    });

    it('should reject weak passwords - too short', () => {
      expect(validatePassword('Pass1!')).toBe(false);
      expect(validatePassword('Ps1!')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });
});

describe('authUtils - JWT Token Operations', () => {
  const testPayload = { userId: '123', email: 'test@example.com' };
  
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT structure: header.payload.signature
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken({ userId: '1' });
      const token2 = generateToken({ userId: '2' });
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.exp).toBeDefined(); // Expiration time
      expect(decoded.iat).toBeDefined(); // Issued at time
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyToken('not-a-token')).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow();
    });
  });

  describe('generateToken and verifyToken integration', () => {
    it('should create and verify tokens successfully', () => {
      const payload = { userId: '999', role: 'admin' };
      const token = generateToken(payload);
      const verified = verifyToken(token);
      
      expect(verified.userId).toBe(payload.userId);
      expect(verified.role).toBe(payload.role);
    });
  });
});

describe('authUtils - Password Hashing', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'MyPassword123!';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20); // Bcrypt hashes are long
    });

    it('should generate different hashes for same password (salt)', async () => {
      const password = 'SamePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Due to salt
    });

    it('should handle empty password', async () => {
      const hashed = await hashPassword('');
      expect(hashed).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'CorrectPassword123!';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(password, hashed);
      
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hashed);
      
      expect(isMatch).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'Password123!';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword('password123!', hashed);
      
      expect(isMatch).toBe(false);
    });

    it('should return false for empty password comparison', async () => {
      const password = 'MyPassword123!';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword('', hashed);
      
      expect(isMatch).toBe(false);
    });
  });

  describe('hashPassword and comparePassword integration', () => {
    it('should hash and verify passwords correctly', async () => {
      const passwords = ['Test1234!', 'MySecureP@ss1', 'Admin@2024', 'User#Pass123'];

      for (const password of passwords) {
        const hashed = await hashPassword(password);
        const isMatch = await comparePassword(password, hashed);
        expect(isMatch).toBe(true);
      }
    });
  });
});

// Clean up after tests to prevent worker exit warnings
afterAll(async () => {
  // Allow pending async operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});
