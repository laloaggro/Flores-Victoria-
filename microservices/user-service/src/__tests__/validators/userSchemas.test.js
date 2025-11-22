/**
 * Tests para User Service Validators
 * Coverage: 100% de userSchemas.js
 */

const {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  addAddressSchema,
} = require('../../validators/userSchemas');

describe('User Validators - createUserSchema', () => {
  const validUser = {
    email: 'user@example.com',
    password: 'SecurePass123!',
    name: 'John Doe',
  };

  test('should accept valid user creation', () => {
    const { error } = createUserSchema.validate(validUser);
    expect(error).toBeUndefined();
  });

  test('should default role to customer', () => {
    const { value } = createUserSchema.validate(validUser);
    expect(value.role).toBe('customer');
  });

  test('should default isActive to true', () => {
    const { value } = createUserSchema.validate(validUser);
    expect(value.isActive).toBe(true);
  });

  test('should default emailVerified to false', () => {
    const { value } = createUserSchema.validate(validUser);
    expect(value.emailVerified).toBe(false);
  });

  test('should accept all valid roles', () => {
    const roles = ['customer', 'admin', 'moderator'];
    roles.forEach((role) => {
      const { error } = createUserSchema.validate({ ...validUser, role });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid role', () => {
    const { error } = createUserSchema.validate({ ...validUser, role: 'superuser' });
    expect(error).toBeDefined();
  });

  test('should accept optional phone', () => {
    const { error } = createUserSchema.validate({ ...validUser, phone: '+56912345678' });
    expect(error).toBeUndefined();
  });

  test('should accept optional avatar', () => {
    const { error } = createUserSchema.validate({
      ...validUser,
      avatar: 'https://example.com/avatar.jpg',
    });
    expect(error).toBeUndefined();
  });

  test('should accept isActive override', () => {
    const { error } = createUserSchema.validate({ ...validUser, isActive: false });
    expect(error).toBeUndefined();
  });

  test('should accept emailVerified override', () => {
    const { error } = createUserSchema.validate({ ...validUser, emailVerified: true });
    expect(error).toBeUndefined();
  });

  test('should reject invalid email', () => {
    const { error } = createUserSchema.validate({ ...validUser, email: 'invalid' });
    expect(error).toBeDefined();
  });

  test('should reject weak password', () => {
    const { error } = createUserSchema.validate({ ...validUser, password: '123' });
    expect(error).toBeDefined();
  });

  test('should reject short name (< 2 chars)', () => {
    const { error } = createUserSchema.validate({ ...validUser, name: 'A' });
    expect(error).toBeDefined();
  });

  test('should reject long name (> 100 chars)', () => {
    const { error } = createUserSchema.validate({ ...validUser, name: 'A'.repeat(101) });
    expect(error).toBeDefined();
  });

  test('should reject missing required fields', () => {
    const { error: error1 } = createUserSchema.validate({ ...validUser, email: undefined });
    const { error: error2 } = createUserSchema.validate({ ...validUser, password: undefined });
    const { error: error3 } = createUserSchema.validate({ ...validUser, name: undefined });

    expect(error1).toBeDefined();
    expect(error2).toBeDefined();
    expect(error3).toBeDefined();
  });
});

describe('User Validators - updateUserSchema', () => {
  test('should accept partial update', () => {
    const { error } = updateUserSchema.validate({ name: 'Updated Name' });
    expect(error).toBeUndefined();
  });

  test('should accept phone update', () => {
    const { error } = updateUserSchema.validate({ phone: '+56987654321' });
    expect(error).toBeUndefined();
  });

  test('should accept avatar update', () => {
    const { error } = updateUserSchema.validate({
      avatar: 'https://example.com/new-avatar.jpg',
    });
    expect(error).toBeUndefined();
  });

  test('should accept role update', () => {
    const { error } = updateUserSchema.validate({ role: 'admin' });
    expect(error).toBeUndefined();
  });

  test('should accept all valid roles in update', () => {
    const roles = ['customer', 'admin', 'moderator'];
    roles.forEach((role) => {
      const { error } = updateUserSchema.validate({ role });
      expect(error).toBeUndefined();
    });
  });

  test('should accept isActive update', () => {
    const { error } = updateUserSchema.validate({ isActive: false });
    expect(error).toBeUndefined();
  });

  test('should accept emailVerified update', () => {
    const { error } = updateUserSchema.validate({ emailVerified: true });
    expect(error).toBeUndefined();
  });

  test('should accept preferences update', () => {
    const { error } = updateUserSchema.validate({
      preferences: {
        newsletter: true,
        notifications: false,
        language: 'es',
        theme: 'dark',
      },
    });
    expect(error).toBeUndefined();
  });

  test('should accept partial preferences', () => {
    const { error } = updateUserSchema.validate({
      preferences: { newsletter: true },
    });
    expect(error).toBeUndefined();
  });

  test('should accept valid languages', () => {
    const languages = ['es', 'en'];
    languages.forEach((language) => {
      const { error } = updateUserSchema.validate({ preferences: { language } });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid language', () => {
    const { error } = updateUserSchema.validate({ preferences: { language: 'fr' } });
    expect(error).toBeDefined();
  });

  test('should accept valid themes', () => {
    const themes = ['light', 'dark', 'auto'];
    themes.forEach((theme) => {
      const { error } = updateUserSchema.validate({ preferences: { theme } });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid theme', () => {
    const { error } = updateUserSchema.validate({ preferences: { theme: 'blue' } });
    expect(error).toBeDefined();
  });

  test('should accept addresses array', () => {
    const { error } = updateUserSchema.validate({
      addresses: [
        {
          street: 'Calle 123',
          city: 'Santiago',
          state: 'RM',
          zipCode: '8320000',
          country: 'CL',
        },
      ],
    });
    expect(error).toBeUndefined();
  });

  test('should accept up to 5 addresses', () => {
    const addresses = Array(5).fill({
      street: 'Street',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'CL',
    });
    const { error } = updateUserSchema.validate({ addresses });
    expect(error).toBeUndefined();
  });

  test('should reject more than 5 addresses', () => {
    const addresses = Array(6).fill({
      street: 'Street',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'CL',
    });
    const { error } = updateUserSchema.validate({ addresses });
    expect(error).toBeDefined();
  });

  test('should reject empty update', () => {
    const { error } = updateUserSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should accept multiple fields update', () => {
    const { error } = updateUserSchema.validate({
      name: 'New Name',
      phone: '+56987654321',
      preferences: { newsletter: true },
    });
    expect(error).toBeUndefined();
  });
});

describe('User Validators - userFiltersSchema', () => {
  test('should accept empty filters with defaults', () => {
    const { error, value } = userFiltersSchema.validate({});
    expect(error).toBeUndefined();
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
    expect(value.sort).toBe('createdAt');
    expect(value.order).toBe('desc');
  });

  test('should accept role filter', () => {
    const { error } = userFiltersSchema.validate({ role: 'admin' });
    expect(error).toBeUndefined();
  });

  test('should accept all valid roles in filter', () => {
    const roles = ['customer', 'admin', 'moderator'];
    roles.forEach((role) => {
      const { error } = userFiltersSchema.validate({ role });
      expect(error).toBeUndefined();
    });
  });

  test('should accept isActive filter', () => {
    const { error } = userFiltersSchema.validate({ isActive: true });
    expect(error).toBeUndefined();
  });

  test('should accept emailVerified filter', () => {
    const { error } = userFiltersSchema.validate({ emailVerified: false });
    expect(error).toBeUndefined();
  });

  test('should accept search filter', () => {
    const { error } = userFiltersSchema.validate({ search: 'john' });
    expect(error).toBeUndefined();
  });

  test('should reject short search (< 2 chars)', () => {
    const { error } = userFiltersSchema.validate({ search: 'a' });
    expect(error).toBeDefined();
  });

  test('should accept date range', () => {
    const dateFrom = new Date('2024-01-01').toISOString();
    const dateTo = new Date('2024-12-31').toISOString();
    const { error } = userFiltersSchema.validate({ dateFrom, dateTo });
    expect(error).toBeUndefined();
  });

  test('should reject dateTo before dateFrom', () => {
    const dateFrom = new Date('2024-12-31').toISOString();
    const dateTo = new Date('2024-01-01').toISOString();
    const { error } = userFiltersSchema.validate({ dateFrom, dateTo });
    expect(error).toBeDefined();
  });

  test('should accept pagination', () => {
    const { error } = userFiltersSchema.validate({ page: 3, limit: 50 });
    expect(error).toBeUndefined();
  });

  test('should reject page < 1', () => {
    const { error } = userFiltersSchema.validate({ page: 0 });
    expect(error).toBeDefined();
  });

  test('should reject limit > 100', () => {
    const { error } = userFiltersSchema.validate({ limit: 101 });
    expect(error).toBeDefined();
  });

  test('should accept valid sort fields', () => {
    const sorts = ['createdAt', 'name', 'email'];
    sorts.forEach((sort) => {
      const { error } = userFiltersSchema.validate({ sort });
      expect(error).toBeUndefined();
    });
  });

  test('should accept order directions', () => {
    const orders = ['asc', 'desc'];
    orders.forEach((order) => {
      const { error } = userFiltersSchema.validate({ order });
      expect(error).toBeUndefined();
    });
  });
});

describe('User Validators - addAddressSchema', () => {
  const validAddress = {
    street: 'Av. Libertador 1234',
    city: 'Santiago',
    state: 'RM',
    zipCode: '8320000',
    country: 'CL', // ISO 3166-1 alpha-2 (2 chars uppercase)
  };

  test('should accept valid address', () => {
    const { error } = addAddressSchema.validate(validAddress);
    expect(error).toBeUndefined();
  });

  test('should default isDefault to false', () => {
    const { value } = addAddressSchema.validate(validAddress);
    expect(value.isDefault).toBe(false);
  });

  test('should default label to home', () => {
    const { value } = addAddressSchema.validate(validAddress);
    expect(value.label).toBe('home');
  });

  test('should accept isDefault true', () => {
    const { error } = addAddressSchema.validate({ ...validAddress, isDefault: true });
    expect(error).toBeUndefined();
  });

  test('should accept all valid labels', () => {
    const labels = ['home', 'work', 'other'];
    labels.forEach((label) => {
      const { error } = addAddressSchema.validate({ ...validAddress, label });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid label', () => {
    const { error } = addAddressSchema.validate({ ...validAddress, label: 'office' });
    expect(error).toBeDefined();
  });

  test('should reject missing required address fields', () => {
    const { error: error1 } = addAddressSchema.validate({ ...validAddress, street: undefined });
    const { error: error2 } = addAddressSchema.validate({ ...validAddress, city: undefined });
    const { error: error3 } = addAddressSchema.validate({ ...validAddress, country: undefined });

    expect(error1).toBeDefined();
    expect(error2).toBeDefined();
    expect(error3).toBeDefined();
  });

  test('should reject invalid country code', () => {
    const { error } = addAddressSchema.validate({ ...validAddress, country: 'Chile' }); // Must be 2 chars
    expect(error).toBeDefined();
  });

  test('should accept valid country codes', () => {
    const countries = ['CL', 'US', 'AR', 'BR', 'MX'];
    countries.forEach((country) => {
      const { error } = addAddressSchema.validate({ ...validAddress, country });
      expect(error).toBeUndefined();
    });
  });
});
