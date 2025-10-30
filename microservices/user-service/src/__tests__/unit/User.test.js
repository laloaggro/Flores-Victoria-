/**
 * Unit Tests for User Model
 * Tests for User.js database model
 */

describe('User Model - Unit Tests', () => {
  let userModel;
  let mockClient;

  beforeEach(() => {
    // Mock PostgreSQL client
    mockClient = {
      query: jest.fn(),
    };

    const { User } = require('../../models/User');
    userModel = new User(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // create() Tests
  // ==========================================
  describe('create', () => {
    test('should create user with default customer role', async () => {
      const userData = {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        password: 'hashedPassword123',
      };

      const expectedUser = {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@test.com',
        role: 'customer',
        created_at: new Date(),
      };

      mockClient.query.mockResolvedValue({ rows: [expectedUser] });

      const result = await userModel.create(userData);

      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['Juan Pérez', 'juan@test.com', 'hashedPassword123', 'customer'])
      );
      expect(result).toEqual(expectedUser);
    });

    test('should create user with admin role', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'hashedPassword123',
        role: 'admin',
      };

      const expectedUser = {
        id: 2,
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        created_at: new Date(),
      };

      mockClient.query.mockResolvedValue({ rows: [expectedUser] });

      const result = await userModel.create(userData);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['Admin User', 'admin@test.com', 'hashedPassword123', 'admin'])
      );
      expect(result.role).toBe('admin');
    });

    test('should throw error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@test.com',
        password: 'hashedPassword123',
      };

      mockClient.query.mockRejectedValue(
        new Error('duplicate key value violates unique constraint')
      );

      await expect(userModel.create(userData)).rejects.toThrow();
    });

    test('should not return password in response', async () => {
      const userData = {
        name: 'Secure User',
        email: 'secure@test.com',
        password: 'hashedPassword123',
      };

      const expectedUser = {
        id: 3,
        name: 'Secure User',
        email: 'secure@test.com',
        role: 'customer',
        created_at: new Date(),
        // password should NOT be in RETURNING clause
      };

      mockClient.query.mockResolvedValue({ rows: [expectedUser] });

      const result = await userModel.create(userData);

      expect(result).not.toHaveProperty('password');
    });
  });

  // ==========================================
  // findAll() Tests
  // ==========================================
  describe('findAll', () => {
    test('should retrieve all users ordered by created_at DESC', async () => {
      const mockUsers = [
        {
          id: 3,
          name: 'User 3',
          email: 'user3@test.com',
          role: 'customer',
          created_at: new Date(),
        },
        { id: 2, name: 'User 2', email: 'user2@test.com', role: 'admin', created_at: new Date() },
        {
          id: 1,
          name: 'User 1',
          email: 'user1@test.com',
          role: 'customer',
          created_at: new Date(),
        },
      ];

      mockClient.query.mockResolvedValue({ rows: mockUsers });

      const result = await userModel.findAll();

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC')
      );
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(3);
    });

    test('should return empty array when no users exist', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await userModel.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('should not return passwords', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@test.com',
          role: 'customer',
          created_at: new Date(),
        },
      ];

      mockClient.query.mockResolvedValue({ rows: mockUsers });

      const result = await userModel.findAll();

      result.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  // ==========================================
  // findById() Tests
  // ==========================================
  describe('findById', () => {
    test('should find user by ID', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'customer',
        created_at: new Date(),
      };

      mockClient.query.mockResolvedValue({ rows: [mockUser] });

      const result = await userModel.findById(1);

      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), [1]);
      expect(result).toEqual(mockUser);
    });

    test('should return undefined for non-existent ID', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await userModel.findById(9999);

      expect(result).toBeUndefined();
    });

    test('should not return password', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'customer',
        created_at: new Date(),
      };

      mockClient.query.mockResolvedValue({ rows: [mockUser] });

      const result = await userModel.findById(1);

      expect(result).not.toHaveProperty('password');
    });
  });

  // ==========================================
  // findByEmail() Tests
  // ==========================================
  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword123',
        role: 'customer',
        created_at: new Date(),
      };

      mockClient.query.mockResolvedValue({ rows: [mockUser] });

      const result = await userModel.findByEmail('test@test.com');

      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('WHERE email = $1'), [
        'test@test.com',
      ]);
      expect(result).toEqual(mockUser);
    });

    test('should return password for authentication', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword123',
        role: 'customer',
        created_at: new Date(),
      };

      mockClient.query.mockResolvedValue({ rows: [mockUser] });

      const result = await userModel.findByEmail('test@test.com');

      expect(result).toHaveProperty('password');
      expect(result.password).toBe('hashedPassword123');
    });

    test('should return undefined for non-existent email', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await userModel.findByEmail('nonexistent@test.com');

      expect(result).toBeUndefined();
    });

    test('should handle case-sensitive email search', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      await userModel.findByEmail('Test@TEST.COM');

      expect(mockClient.query).toHaveBeenCalledWith(expect.any(String), ['Test@TEST.COM']);
    });
  });

  // ==========================================
  // update() Tests
  // ==========================================
  describe('update', () => {
    test('should update user successfully', async () => {
      const updatedData = {
        name: 'Updated Name',
        email: 'updated@test.com',
        role: 'admin',
      };

      const expectedUser = {
        id: 1,
        name: 'Updated Name',
        email: 'updated@test.com',
        role: 'admin',
        updated_at: new Date(),
      };

      mockClient.query.mockResolvedValue({ rows: [expectedUser] });

      const result = await userModel.update(1, updatedData);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining(['Updated Name', 'updated@test.com', 'admin', 1])
      );
      expect(result).toEqual(expectedUser);
    });

    test('should update timestamp on update', async () => {
      const updatedData = {
        name: 'Name',
        email: 'email@test.com',
        role: 'customer',
      };

      mockClient.query.mockResolvedValue({
        rows: [{ ...updatedData, id: 1, updated_at: new Date() }],
      });

      const result = await userModel.update(1, updatedData);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('updated_at = CURRENT_TIMESTAMP'),
        expect.any(Array)
      );
      expect(result).toHaveProperty('updated_at');
    });

    test('should return undefined for non-existent user', async () => {
      const updatedData = {
        name: 'Name',
        email: 'email@test.com',
        role: 'customer',
      };

      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await userModel.update(9999, updatedData);

      expect(result).toBeUndefined();
    });
  });

  // ==========================================
  // delete() Tests (if exists)
  // ==========================================
  describe('delete', () => {
    test('should delete user successfully', async () => {
      const deletedUser = {
        id: 1,
        name: 'Deleted User',
        email: 'deleted@test.com',
      };

      mockClient.query.mockResolvedValue({ rows: [deletedUser], rowCount: 1 });

      const result = await userModel.delete(1);

      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM users'), [
        1,
      ]);
      expect(result).toEqual(deletedUser);
    });

    test('should return undefined for non-existent user', async () => {
      mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await userModel.delete(9999);

      expect(result).toBeUndefined();
    });
  });

  // ==========================================
  // createTable() Tests
  // ==========================================
  describe('createTable', () => {
    test('should create users table if not exists', async () => {
      mockClient.query.mockResolvedValue({});

      await userModel.createTable();

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS users')
      );
    });

    test('should handle creation errors', async () => {
      mockClient.query.mockRejectedValue(new Error('Table creation failed'));

      await expect(userModel.createTable()).rejects.toThrow('Table creation failed');
    });
  });

  // ==========================================
  // Error Handling Tests
  // ==========================================
  describe('Error Handling', () => {
    test('should throw error on database connection failure', async () => {
      mockClient.query.mockRejectedValue(new Error('Connection refused'));

      await expect(userModel.findAll()).rejects.toThrow('Connection refused');
    });

    test('should handle SQL injection attempts safely', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const maliciousEmail = "'; DROP TABLE users; --";
      await userModel.findByEmail(maliciousEmail);

      // Verify parameterized query used (SQL injection safe)
      expect(mockClient.query).toHaveBeenCalledWith(expect.any(String), [maliciousEmail]);
    });
  });
});
