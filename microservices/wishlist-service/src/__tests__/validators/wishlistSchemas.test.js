/**
 * Tests para Wishlist Service Validators
 * Coverage: 100% de wishlistSchemas.js
 */

const {
  wishlistItemSchema,
  addItemSchema,
  shareWishlistSchema,
} = require('../../validators/wishlistSchemas');

describe('Wishlist Validators - wishlistItemSchema', () => {
  const validItem = {
    productId: 'prod-123',
    name: 'Beautiful Orchid',
    price: 4599, // Price in cents
  };

  test('should accept valid wishlist item', () => {
    const { error } = wishlistItemSchema.validate(validItem);
    expect(error).toBeUndefined();
  });

  test('should default inStock to true', () => {
    const { value } = wishlistItemSchema.validate(validItem);
    expect(value.inStock).toBe(true);
  });

  test('should default addedAt to current date', () => {
    const { value } = wishlistItemSchema.validate(validItem);
    expect(value.addedAt).toBeInstanceOf(Date);
    expect(value.addedAt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  test('should accept optional image', () => {
    const { error } = wishlistItemSchema.validate({
      ...validItem,
      image: 'https://example.com/orchid.jpg',
    });
    expect(error).toBeUndefined();
  });

  test('should accept inStock false', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, inStock: false });
    expect(error).toBeUndefined();
  });

  test('should accept custom addedAt date', () => {
    const customDate = new Date('2024-01-01').toISOString();
    const { error, value } = wishlistItemSchema.validate({
      ...validItem,
      addedAt: customDate,
    });
    expect(error).toBeUndefined();
    expect(new Date(value.addedAt).toISOString()).toBe(customDate);
  });

  test('should reject missing productId', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, productId: undefined });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain('productId');
  });

  test('should reject missing name', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, name: undefined });
    expect(error).toBeDefined();
  });

  test('should reject short name (< 3 chars)', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, name: 'AB' });
    expect(error).toBeDefined();
  });

  test('should reject long name (> 200 chars)', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, name: 'A'.repeat(201) });
    expect(error).toBeDefined();
  });

  test('should reject missing price', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, price: undefined });
    expect(error).toBeDefined();
  });

  test('should reject negative price', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, price: -10 });
    expect(error).toBeDefined();
  });

  test('should reject zero price', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, price: 0 });
    expect(error).toBeDefined();
  });

  test('should accept integer prices (in cents)', () => {
    const { error } = wishlistItemSchema.validate({ ...validItem, price: 2999 });
    expect(error).toBeUndefined();
  });

  test('should trim whitespace from strings', () => {
    const { value } = wishlistItemSchema.validate({
      productId: '  prod-123  ',
      name: '  Test Product  ',
      price: 10,
    });
    expect(value.productId).toBe('prod-123');
    expect(value.name).toBe('Test Product');
  });
});

describe('Wishlist Validators - addItemSchema', () => {
  const validData = {
    productId: 'prod-456',
    name: 'Elegant Lily Arrangement',
    price: 5999, // Price in cents
  };

  test('should accept valid add item data', () => {
    const { error } = addItemSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  test('should accept optional image', () => {
    const { error } = addItemSchema.validate({
      ...validData,
      image: 'https://cdn.example.com/lily.png',
    });
    expect(error).toBeUndefined();
  });

  test('should reject invalid image URL', () => {
    const { error } = addItemSchema.validate({ ...validData, image: 'not-a-url' });
    expect(error).toBeDefined();
  });

  test('should reject missing productId', () => {
    const { error } = addItemSchema.validate({ name: 'Test', price: 10 });
    expect(error).toBeDefined();
  });

  test('should reject missing name', () => {
    const { error } = addItemSchema.validate({ productId: '123', price: 10 });
    expect(error).toBeDefined();
  });

  test('should reject missing price', () => {
    const { error } = addItemSchema.validate({ productId: '123', name: 'Test' });
    expect(error).toBeDefined();
  });

  test('should reject empty productId', () => {
    const { error } = addItemSchema.validate({ ...validData, productId: '   ' });
    expect(error).toBeDefined();
  });

  test('should reject empty name', () => {
    const { error } = addItemSchema.validate({ ...validData, name: '   ' });
    expect(error).toBeDefined();
  });

  test('should accept minimum name length (3 chars)', () => {
    const { error } = addItemSchema.validate({ ...validData, name: 'ABC' });
    expect(error).toBeUndefined();
  });

  test('should accept maximum name length (200 chars)', () => {
    const { error } = addItemSchema.validate({ ...validData, name: 'A'.repeat(200) });
    expect(error).toBeUndefined();
  });

  test('should reject name shorter than 3 chars', () => {
    const { error } = addItemSchema.validate({ ...validData, name: 'AB' });
    expect(error).toBeDefined();
  });

  test('should reject name longer than 200 chars', () => {
    const { error } = addItemSchema.validate({ ...validData, name: 'A'.repeat(201) });
    expect(error).toBeDefined();
  });

  test('should accept positive prices (in cents)', () => {
    const prices = [1, 100, 1050, 10000, 99999]; // Prices in cents
    prices.forEach((price) => {
      const { error } = addItemSchema.validate({ ...validData, price });
      expect(error).toBeUndefined();
    });
  });

  test('should reject negative prices', () => {
    const { error } = addItemSchema.validate({ ...validData, price: -5 });
    expect(error).toBeDefined();
  });

  test('should reject zero price', () => {
    const { error } = addItemSchema.validate({ ...validData, price: 0 });
    expect(error).toBeDefined();
  });

  test('should trim and validate correctly', () => {
    const { value, error } = addItemSchema.validate({
      productId: '  prod-789  ',
      name: '  Rose Bouquet  ',
      price: 35.0,
    });
    expect(error).toBeUndefined();
    expect(value.productId).toBe('prod-789');
    expect(value.name).toBe('Rose Bouquet');
  });
});

describe('Wishlist Validators - shareWishlistSchema', () => {
  test('should accept valid email sharing', () => {
    const { error } = shareWishlistSchema.validate({ email: 'friend@example.com' });
    expect(error).toBeUndefined();
  });

  test('should default shareLink to false', () => {
    const { value } = shareWishlistSchema.validate({});
    expect(value.shareLink).toBe(false);
  });

  test('should default expiresIn to 30 days', () => {
    const { value } = shareWishlistSchema.validate({});
    expect(value.expiresIn).toBe(30);
  });

  test('should accept shareLink true', () => {
    const { error } = shareWishlistSchema.validate({ shareLink: true });
    expect(error).toBeUndefined();
  });

  test('should accept custom expiresIn', () => {
    const { error } = shareWishlistSchema.validate({ expiresIn: 60 });
    expect(error).toBeUndefined();
  });

  test('should accept minimum expiresIn (1 day)', () => {
    const { error } = shareWishlistSchema.validate({ expiresIn: 1 });
    expect(error).toBeUndefined();
  });

  test('should accept maximum expiresIn (365 days)', () => {
    const { error } = shareWishlistSchema.validate({ expiresIn: 365 });
    expect(error).toBeUndefined();
  });

  test('should reject expiresIn < 1', () => {
    const { error } = shareWishlistSchema.validate({ expiresIn: 0 });
    expect(error).toBeDefined();
  });

  test('should reject expiresIn > 365', () => {
    const { error } = shareWishlistSchema.validate({ expiresIn: 366 });
    expect(error).toBeDefined();
  });

  test('should reject invalid email format', () => {
    const { error } = shareWishlistSchema.validate({ email: 'invalid-email' });
    expect(error).toBeDefined();
  });

  test('should accept empty object (all optional with defaults)', () => {
    const { error, value } = shareWishlistSchema.validate({});
    expect(error).toBeUndefined();
    expect(value.shareLink).toBe(false);
    expect(value.expiresIn).toBe(30);
  });

  test('should accept all fields together', () => {
    const { error } = shareWishlistSchema.validate({
      email: 'user@example.com',
      shareLink: true,
      expiresIn: 90,
    });
    expect(error).toBeUndefined();
  });

  test('should accept valid email formats', () => {
    const emails = [
      'user@example.com',
      'test.user@example.co.uk',
      'user+tag@example.com',
      'user_name@example.com',
    ];
    emails.forEach((email) => {
      const { error } = shareWishlistSchema.validate({ email });
      expect(error).toBeUndefined();
    });
  });

  test('should reject non-integer expiresIn', () => {
    const { error } = shareWishlistSchema.validate({ expiresIn: 30.5 });
    expect(error).toBeDefined();
  });

  test('should reject negative expiresIn', () => {
    const { error } = shareWishlistSchema.validate({ expiresIn: -10 });
    expect(error).toBeDefined();
  });
});
