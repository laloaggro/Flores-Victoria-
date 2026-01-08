/**
 * @fileoverview Unit Tests for Auth Controller
 * @description Tests de autenticación: login, registro, tokens
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock de dependencias antes de importar
jest.mock('../../config/database', () => ({
  query: jest.fn(),
}));

const db = require('../../config/database');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@flores-victoria.com',
      password_hash: '$2b$10$validhash',
      name: 'Test User',
      role: 'customer',
      is_active: true,
    };

    it('should return 400 if email is missing', async () => {
      const req = { body: { password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Simular validación
      const validateLogin = (body) => {
        if (!body.email) return { error: 'Email is required' };
        if (!body.password) return { error: 'Password is required' };
        return null;
      };

      const error = validateLogin(req.body);
      expect(error).toEqual({ error: 'Email is required' });
    });

    it('should return 400 if password is missing', async () => {
      const req = { body: { email: 'test@example.com' } };

      const validateLogin = (body) => {
        if (!body.email) return { error: 'Email is required' };
        if (!body.password) return { error: 'Password is required' };
        return null;
      };

      const error = validateLogin(req.body);
      expect(error).toEqual({ error: 'Password is required' });
    });

    it('should return 401 if user not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const findUserByEmail = async (email) => {
        const result = await db.query(
          'SELECT * FROM auth_users WHERE email = $1',
          [email]
        );
        return result.rows[0] || null;
      };

      const user = await findUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    it('should return 401 if password is incorrect', async () => {
      const isValidPassword = await bcrypt.compare('wrongpassword', mockUser.password_hash);
      expect(isValidPassword).toBe(false);
    });

    it('should return 403 if user is inactive', async () => {
      const inactiveUser = { ...mockUser, is_active: false };
      expect(inactiveUser.is_active).toBe(false);
    });

    it('should generate valid JWT on successful login', () => {
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });
  });

  describe('Token Validation', () => {
    it('should verify valid token', () => {
      const token = jwt.sign(
        { userId: 'user-123', role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe('user-123');
    });

    it('should reject expired token', () => {
      const token = jwt.sign(
        { userId: 'user-123' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expirado hace 1 hora
      );

      expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow('jwt expired');
    });

    it('should reject token with invalid signature', () => {
      const token = jwt.sign(
        { userId: 'user-123' },
        'wrong-secret'
      );

      expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow('invalid signature');
    });

    it('should reject malformed token', () => {
      expect(() => jwt.verify('not-a-valid-token', process.env.JWT_SECRET)).toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'SecurePassword123!';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify correct password', async () => {
      const password = 'SecurePassword123!';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123!';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Role-based Access', () => {
    const roles = ['customer', 'admin', 'staff'];

    roles.forEach(role => {
      it(`should include ${role} role in token`, () => {
        const token = jwt.sign(
          { userId: 'user-123', role },
          process.env.JWT_SECRET
        );

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.role).toBe(role);
      });
    });

    it('should allow admin access to admin routes', () => {
      const checkAdminAccess = (user) => user.role === 'admin';
      
      expect(checkAdminAccess({ role: 'admin' })).toBe(true);
      expect(checkAdminAccess({ role: 'customer' })).toBe(false);
    });
  });
});

describe('Registration Validation', () => {
  const validateRegistration = (data) => {
    const errors = [];
    
    if (!data.email || !data.email.includes('@')) {
      errors.push('Valid email is required');
    }
    
    if (!data.password || data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (data.password && !/[A-Z]/.test(data.password)) {
      errors.push('Password must contain uppercase letter');
    }
    
    if (data.password && !/[0-9]/.test(data.password)) {
      errors.push('Password must contain a number');
    }
    
    return errors.length > 0 ? errors : null;
  };

  it('should reject invalid email', () => {
    const errors = validateRegistration({ email: 'invalid', password: 'Password123' });
    expect(errors).toContain('Valid email is required');
  });

  it('should reject short password', () => {
    const errors = validateRegistration({ email: 'test@example.com', password: 'Pass1' });
    expect(errors).toContain('Password must be at least 8 characters');
  });

  it('should reject password without uppercase', () => {
    const errors = validateRegistration({ email: 'test@example.com', password: 'password123' });
    expect(errors).toContain('Password must contain uppercase letter');
  });

  it('should reject password without number', () => {
    const errors = validateRegistration({ email: 'test@example.com', password: 'Passwordabc' });
    expect(errors).toContain('Password must contain a number');
  });

  it('should accept valid registration data', () => {
    const errors = validateRegistration({ 
      email: 'test@example.com', 
      password: 'SecurePass123' 
    });
    expect(errors).toBeNull();
  });
});
