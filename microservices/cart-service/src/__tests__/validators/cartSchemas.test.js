/**
 * Tests para Cart Service Validators
 * Coverage: 100% de cartSchemas.js
 */

const {
  cartItemSchema,
  addItemSchema,
  updateQuantitySchema,
  applyCouponSchema,
} = require('../../validators/cartSchemas');

describe('Cart Validators - cartItemSchema', () => {
  const validItem = {
    productId: 'prod-123',
    name: 'Beautiful Rose Bouquet',
    price: 2999, // Price in cents
    quantity: 2,
  };

  test('should accept valid cart item', () => {
    const { error } = cartItemSchema.validate(validItem);
    expect(error).toBeUndefined();
  });

  test('should accept item with optional image', () => {
    const { error } = cartItemSchema.validate({
      ...validItem,
      image: 'https://example.com/rose.jpg',
    });
    expect(error).toBeUndefined();
  });

  test('should accept item with optional maxQuantity', () => {
    const { error } = cartItemSchema.validate({
      ...validItem,
      maxQuantity: 10,
    });
    expect(error).toBeUndefined();
  });

  test('should accept item with extras array', () => {
    const { error } = cartItemSchema.validate({
      ...validItem,
      extras: ['gift-wrap', 'greeting-card'],
    });
    expect(error).toBeUndefined();
  });

  test('should reject missing productId', () => {
    const { error } = cartItemSchema.validate({ ...validItem, productId: undefined });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain('productId');
  });

  test('should reject missing name', () => {
    const { error } = cartItemSchema.validate({ ...validItem, name: undefined });
    expect(error).toBeDefined();
  });

  test('should reject short name (< 3 chars)', () => {
    const { error } = cartItemSchema.validate({ ...validItem, name: 'AB' });
    expect(error).toBeDefined();
  });

  test('should reject long name (> 200 chars)', () => {
    const { error } = cartItemSchema.validate({ ...validItem, name: 'A'.repeat(201) });
    expect(error).toBeDefined();
  });

  test('should reject missing price', () => {
    const { error } = cartItemSchema.validate({ ...validItem, price: undefined });
    expect(error).toBeDefined();
  });

  test('should reject negative price', () => {
    const { error } = cartItemSchema.validate({ ...validItem, price: -10 });
    expect(error).toBeDefined();
  });

  test('should reject missing quantity', () => {
    const { error } = cartItemSchema.validate({ ...validItem, quantity: undefined });
    expect(error).toBeDefined();
  });

  test('should reject zero quantity', () => {
    const { error } = cartItemSchema.validate({ ...validItem, quantity: 0 });
    expect(error).toBeDefined();
  });

  test('should reject negative maxQuantity', () => {
    const { error } = cartItemSchema.validate({ ...validItem, maxQuantity: 0 });
    expect(error).toBeDefined();
  });
});

describe('Cart Validators - addItemSchema', () => {
  const validData = {
    productId: 'prod-456',
    name: 'Sunflower Arrangement',
    price: 3999, // Price in cents
  };

  test('should accept valid add item data', () => {
    const { error } = addItemSchema.validate(validData);
    expect(error).toBeUndefined();
  });

  test('should default quantity to 1', () => {
    const { value } = addItemSchema.validate(validData);
    expect(value.quantity).toBe(1);
  });

  test('should accept custom quantity', () => {
    const { error, value } = addItemSchema.validate({ ...validData, quantity: 5 });
    expect(error).toBeUndefined();
    expect(value.quantity).toBe(5);
  });

  test('should accept quantity = 1', () => {
    const { error } = addItemSchema.validate({ ...validData, quantity: 1 });
    expect(error).toBeUndefined();
  });

  test('should accept quantity = 99 (max)', () => {
    const { error } = addItemSchema.validate({ ...validData, quantity: 99 });
    expect(error).toBeUndefined();
  });

  test('should reject quantity = 0', () => {
    const { error } = addItemSchema.validate({ ...validData, quantity: 0 });
    expect(error).toBeDefined();
  });

  test('should reject quantity > 99', () => {
    const { error } = addItemSchema.validate({ ...validData, quantity: 100 });
    expect(error).toBeDefined();
  });

  test('should accept optional image URL', () => {
    const { error } = addItemSchema.validate({
      ...validData,
      image: 'https://cdn.example.com/sunflower.png',
    });
    expect(error).toBeUndefined();
  });

  test('should accept extras array', () => {
    const { error } = addItemSchema.validate({
      ...validData,
      extras: ['vase', 'ribbon', 'card'],
    });
    expect(error).toBeUndefined();
  });

  test('should accept up to 10 extras', () => {
    const { error } = addItemSchema.validate({
      ...validData,
      extras: Array(10).fill('extra'),
    });
    expect(error).toBeUndefined();
  });

  test('should reject more than 10 extras', () => {
    const { error } = addItemSchema.validate({
      ...validData,
      extras: Array(11).fill('extra'),
    });
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

  test('should trim whitespace from strings', () => {
    const { value } = addItemSchema.validate({
      productId: '  prod-123  ',
      name: '  Test Product  ',
      price: 10,
    });
    expect(value.productId).toBe('prod-123');
    expect(value.name).toBe('Test Product');
  });
});

describe('Cart Validators - updateQuantitySchema', () => {
  test('should accept valid quantity update', () => {
    const { error } = updateQuantitySchema.validate({ quantity: 5 });
    expect(error).toBeUndefined();
  });

  test('should accept quantity = 0 (for removal)', () => {
    const { error } = updateQuantitySchema.validate({ quantity: 0 });
    expect(error).toBeUndefined();
  });

  test('should accept quantity = 99 (max)', () => {
    const { error } = updateQuantitySchema.validate({ quantity: 99 });
    expect(error).toBeUndefined();
  });

  test('should reject quantity > 99', () => {
    const { error } = updateQuantitySchema.validate({ quantity: 100 });
    expect(error).toBeDefined();
  });

  test('should reject negative quantity', () => {
    const { error } = updateQuantitySchema.validate({ quantity: -1 });
    expect(error).toBeDefined();
  });

  test('should reject missing quantity', () => {
    const { error } = updateQuantitySchema.validate({});
    expect(error).toBeDefined();
  });

  test('should reject non-integer quantity', () => {
    const { error } = updateQuantitySchema.validate({ quantity: 5.5 });
    expect(error).toBeDefined();
  });

  test('should accept string numbers (Joi auto-converts)', () => {
    const { error, value } = updateQuantitySchema.validate({ quantity: '5' });
    expect(error).toBeUndefined();
    expect(value.quantity).toBe(5);
  });
});

describe('Cart Validators - applyCouponSchema', () => {
  test('should accept valid coupon code', () => {
    const { error } = applyCouponSchema.validate({ couponCode: 'SAVE10' });
    expect(error).toBeUndefined();
  });

  test('should convert coupon to uppercase', () => {
    const { value } = applyCouponSchema.validate({ couponCode: 'save10' });
    expect(value.couponCode).toBe('SAVE10');
  });

  test('should accept minimum length (3 chars)', () => {
    const { error } = applyCouponSchema.validate({ couponCode: 'ABC' });
    expect(error).toBeUndefined();
  });

  test('should accept maximum length (50 chars)', () => {
    const { error } = applyCouponSchema.validate({ couponCode: 'A'.repeat(50) });
    expect(error).toBeUndefined();
  });

  test('should reject short coupon (< 3 chars)', () => {
    const { error } = applyCouponSchema.validate({ couponCode: 'AB' });
    expect(error).toBeDefined();
  });

  test('should reject long coupon (> 50 chars)', () => {
    const { error } = applyCouponSchema.validate({ couponCode: 'A'.repeat(51) });
    expect(error).toBeDefined();
  });

  test('should reject missing coupon code', () => {
    const { error } = applyCouponSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should reject empty coupon code', () => {
    const { error } = applyCouponSchema.validate({ couponCode: '   ' });
    expect(error).toBeDefined();
  });

  test('should trim and uppercase', () => {
    const { value } = applyCouponSchema.validate({ couponCode: '  save20  ' });
    expect(value.couponCode).toBe('SAVE20');
  });
});
