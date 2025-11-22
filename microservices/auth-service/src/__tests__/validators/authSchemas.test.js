/**
 * Tests para Auth Service Validators
 * Coverage: 100% de authSchemas.js
 */

const {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  refreshTokenSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updateProfileSchema,
} = require('../../validators/authSchemas');

describe('Auth Validators - registerSchema', () => {
  const validData = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'John Doe',
    acceptTerms: true,
  };

  test('should accept valid registration data', () => {
    const { error } = registerSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  test('should accept valid registration with optional phone', () => {
    const { error } = registerSchema.validate({
      ...validData,
      phone: '+56912345678',
    });
    expect(error).toBeUndefined();
  });

  test('should reject missing email', () => {
    const { error } = registerSchema.validate({ ...validData, email: undefined });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain('email');
  });

  test('should reject invalid email format', () => {
    const { error } = registerSchema.validate({ ...validData, email: 'invalid-email' });
    expect(error).toBeDefined();
  });

  test('should reject weak password', () => {
    const { error } = registerSchema.validate({ ...validData, password: '123' });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain('password');
  });

  test('should reject short name (< 2 chars)', () => {
    const { error } = registerSchema.validate({ ...validData, name: 'A' });
    expect(error).toBeDefined();
  });

  test('should reject long name (> 100 chars)', () => {
    const { error } = registerSchema.validate({ ...validData, name: 'A'.repeat(101) });
    expect(error).toBeDefined();
  });

  test('should reject when acceptTerms is false', () => {
    const { error } = registerSchema.validate({ ...validData, acceptTerms: false });
    expect(error).toBeDefined();
    expect(error.message).toContain('accept the terms');
  });

  test('should reject missing acceptTerms', () => {
    const { error } = registerSchema.validate({ ...validData, acceptTerms: undefined });
    expect(error).toBeDefined();
  });

  test('should trim whitespace from name', () => {
    const { value } = registerSchema.validate({ ...validData, name: '  John Doe  ' });
    expect(value.name).toBe('John Doe');
  });
});

describe('Auth Validators - loginSchema', () => {
  const validData = {
    email: 'test@example.com',
    password: 'anypassword',
  };

  test('should accept valid login data', () => {
    const { error } = loginSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  test('should accept login with rememberMe', () => {
    const { error } = loginSchema.validate({ ...validData, rememberMe: true });
    expect(error).toBeUndefined();
  });

  test('should reject missing email', () => {
    const { error } = loginSchema.validate({ password: 'test' });
    expect(error).toBeDefined();
  });

  test('should reject missing password', () => {
    const { error } = loginSchema.validate({ email: 'test@example.com' });
    expect(error).toBeDefined();
  });

  test('should accept any password in login (no pattern validation)', () => {
    const { error } = loginSchema.validate({ ...validData, password: '123' });
    expect(error).toBeUndefined();
  });
});

describe('Auth Validators - googleAuthSchema', () => {
  test('should accept valid Google auth token', () => {
    const { error } = googleAuthSchema.validate({ token: 'valid-google-token-123' });
    expect(error).toBeUndefined();
  });

  test('should accept token with optional clientId', () => {
    const { error } = googleAuthSchema.validate({
      token: 'token',
      clientId: 'client-id-123',
    });
    expect(error).toBeUndefined();
  });

  test('should reject missing token', () => {
    const { error } = googleAuthSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should reject empty token', () => {
    const { error } = googleAuthSchema.validate({ token: '' });
    expect(error).toBeDefined();
  });
});

describe('Auth Validators - refreshTokenSchema', () => {
  test('should accept valid refresh token', () => {
    const { error } = refreshTokenSchema.validate({ refreshToken: 'valid-refresh-token' });
    expect(error).toBeUndefined();
  });

  test('should reject missing refreshToken', () => {
    const { error } = refreshTokenSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should reject empty refreshToken', () => {
    const { error } = refreshTokenSchema.validate({ refreshToken: '   ' });
    expect(error).toBeDefined();
  });
});

describe('Auth Validators - changePasswordSchema', () => {
  const validData = {
    currentPassword: 'OldPass123!',
    newPassword: 'NewSecurePass456!',
    confirmPassword: 'NewSecurePass456!',
  };

  test('should accept valid password change', () => {
    const { error } = changePasswordSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  test('should reject when passwords do not match', () => {
    const { error } = changePasswordSchema.validate({
      ...validData,
      confirmPassword: 'DifferentPass!',
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('do not match');
  });

  test('should reject missing currentPassword', () => {
    const { error } = changePasswordSchema.validate({
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    });
    expect(error).toBeDefined();
  });

  test('should reject weak new password', () => {
    const { error } = changePasswordSchema.validate({
      ...validData,
      newPassword: '123',
      confirmPassword: '123',
    });
    expect(error).toBeDefined();
  });
});

describe('Auth Validators - requestPasswordResetSchema', () => {
  test('should accept valid email for password reset', () => {
    const { error } = requestPasswordResetSchema.validate({ email: 'user@example.com' });
    expect(error).toBeUndefined();
  });

  test('should reject invalid email', () => {
    const { error } = requestPasswordResetSchema.validate({ email: 'invalid' });
    expect(error).toBeDefined();
  });

  test('should reject missing email', () => {
    const { error } = requestPasswordResetSchema.validate({});
    expect(error).toBeDefined();
  });
});

describe('Auth Validators - resetPasswordSchema', () => {
  const validData = {
    token: 'reset-token-123',
    newPassword: 'NewSecure123!',
    confirmPassword: 'NewSecure123!',
  };

  test('should accept valid password reset', () => {
    const { error } = resetPasswordSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  test('should reject when passwords do not match', () => {
    const { error } = resetPasswordSchema.validate({
      ...validData,
      confirmPassword: 'Different!',
    });
    expect(error).toBeDefined();
    expect(error.message).toContain('do not match');
  });

  test('should reject missing token', () => {
    const { error } = resetPasswordSchema.validate({
      newPassword: 'Pass123!',
      confirmPassword: 'Pass123!',
    });
    expect(error).toBeDefined();
  });

  test('should reject weak password', () => {
    const { error } = resetPasswordSchema.validate({
      ...validData,
      newPassword: 'weak',
      confirmPassword: 'weak',
    });
    expect(error).toBeDefined();
  });
});

describe('Auth Validators - verifyEmailSchema', () => {
  test('should accept valid verification token', () => {
    const { error } = verifyEmailSchema.validate({ token: 'verification-token-123' });
    expect(error).toBeUndefined();
  });

  test('should reject missing token', () => {
    const { error } = verifyEmailSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should reject empty token', () => {
    const { error } = verifyEmailSchema.validate({ token: '  ' });
    expect(error).toBeDefined();
  });
});

describe('Auth Validators - updateProfileSchema', () => {
  test('should accept valid profile updates', () => {
    const { error } = updateProfileSchema.validate({
      name: 'Updated Name',
      phone: '+56987654321',
    });
    expect(error).toBeUndefined();
  });

  test('should accept avatar URL update', () => {
    const { error } = updateProfileSchema.validate({
      avatar: 'https://example.com/avatar.jpg',
    });
    expect(error).toBeUndefined();
  });

  test('should accept preferences update', () => {
    const { error } = updateProfileSchema.validate({
      preferences: {
        newsletter: true,
        notifications: false,
        language: 'es',
      },
    });
    expect(error).toBeUndefined();
  });

  test('should accept partial preferences', () => {
    const { error } = updateProfileSchema.validate({
      preferences: { newsletter: true },
    });
    expect(error).toBeUndefined();
  });

  test('should reject invalid language', () => {
    const { error } = updateProfileSchema.validate({
      preferences: { language: 'fr' },
    });
    expect(error).toBeDefined();
  });

  test('should accept valid languages (es, en)', () => {
    const { error: errorEs } = updateProfileSchema.validate({
      preferences: { language: 'es' },
    });
    const { error: errorEn } = updateProfileSchema.validate({
      preferences: { language: 'en' },
    });
    expect(errorEs).toBeUndefined();
    expect(errorEn).toBeUndefined();
  });

  test('should reject short name', () => {
    const { error } = updateProfileSchema.validate({ name: 'A' });
    expect(error).toBeDefined();
  });

  test('should reject long name', () => {
    const { error } = updateProfileSchema.validate({ name: 'A'.repeat(101) });
    expect(error).toBeDefined();
  });

  test('should accept empty object (all optional)', () => {
    const { error } = updateProfileSchema.validate({});
    expect(error).toBeUndefined();
  });
});
