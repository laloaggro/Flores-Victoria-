/**
 * Tests para Order Service Validators
 * Coverage: 100% de orderSchemas.js
 */

const {
  createOrderSchema,
  updateOrderSchema,
  orderFiltersSchema,
  rateOrderSchema,
} = require('../../validators/orderSchemas');

describe('Order Validators - createOrderSchema', () => {
  const validOrder = {
    userId: 'user-123',
    items: [
      {
        productId: 'prod-1',
        name: 'Red Roses',
        price: 2999, // Price in cents
        quantity: 2,
      },
    ],
    shippingAddress: {
      street: 'Av. Principal 123',
      city: 'Santiago',
      state: 'RM',
      zipCode: '8320000',
      country: 'CL',
    },
    paymentMethod: 'card',
    deliveryDate: new Date(Date.now() + 86400000).toISOString(),
    deliveryTime: '14:30',
  };

  test('should accept valid order', () => {
    const { error } = createOrderSchema.validate(validOrder);
    expect(error).toBeUndefined();
  });

  test('should accept all valid payment methods', () => {
    const methods = ['card', 'cash', 'transfer', 'paypal'];
    methods.forEach((method) => {
      const { error } = createOrderSchema.validate({
        ...validOrder,
        paymentMethod: method,
      });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid payment method', () => {
    const { error } = createOrderSchema.validate({
      ...validOrder,
      paymentMethod: 'bitcoin',
    });
    expect(error).toBeDefined();
  });

  test('should accept optional billing address', () => {
    const { error } = createOrderSchema.validate({
      ...validOrder,
      billingAddress: {
        street: 'Calle 456',
        city: 'Valparaíso',
        state: 'VA', // Minimum 2 chars
        zipCode: '2340000',
        country: 'CL',
      },
    });
    expect(error).toBeUndefined();
  });

  test('should accept optional fields', () => {
    const { error } = createOrderSchema.validate({
      ...validOrder,
      notes: 'Please ring doorbell',
      couponCode: 'SAVE10',
      giftMessage: 'Happy Birthday!',
      recipientName: 'Jane Doe',
      recipientPhone: '+56987654321',
    });
    expect(error).toBeUndefined();
  });

  test('should reject empty items array', () => {
    const { error } = createOrderSchema.validate({ ...validOrder, items: [] });
    expect(error).toBeDefined();
  });

  test('should reject invalid deliveryTime format', () => {
    const { error } = createOrderSchema.validate({ ...validOrder, deliveryTime: '25:99' });
    expect(error).toBeDefined();
  });

  test('should accept valid HH:MM formats', () => {
    const times = ['00:00', '09:30', '12:00', '15:45', '23:59'];
    times.forEach((time) => {
      const { error } = createOrderSchema.validate({ ...validOrder, deliveryTime: time });
      expect(error).toBeUndefined();
    });
  });

  test('should reject past delivery date', () => {
    const { error } = createOrderSchema.validate({
      ...validOrder,
      deliveryDate: new Date(Date.now() - 86400000).toISOString(),
    });
    expect(error).toBeDefined();
  });

  test('should reject notes longer than 500 chars', () => {
    const { error } = createOrderSchema.validate({
      ...validOrder,
      notes: 'A'.repeat(501),
    });
    expect(error).toBeDefined();
  });

  test('should reject giftMessage longer than 300 chars', () => {
    const { error } = createOrderSchema.validate({
      ...validOrder,
      giftMessage: 'B'.repeat(301),
    });
    expect(error).toBeDefined();
  });

  test('should reject missing userId', () => {
    const data = { ...validOrder };
    delete data.userId;
    const { error } = createOrderSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('should reject missing shippingAddress', () => {
    const data = { ...validOrder };
    delete data.shippingAddress;
    const { error } = createOrderSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('should accept multiple items', () => {
    const { error } = createOrderSchema.validate({
      ...validOrder,
      items: [
        { productId: '1', name: 'Item 1', price: 10, quantity: 1 },
        { productId: '2', name: 'Item 2', price: 20, quantity: 2 },
      ],
    });
    expect(error).toBeUndefined();
  });
});

describe('Order Validators - updateOrderSchema', () => {
  test('should accept status update', () => {
    const { error } = updateOrderSchema.validate({ status: 'confirmed' });
    expect(error).toBeUndefined();
  });

  test('should accept all valid statuses (except cancelled)', () => {
    const statuses = ['pending', 'processing', 'confirmed', 'shipped', 'delivered'];
    statuses.forEach((status) => {
      const { error } = updateOrderSchema.validate({ status });
      expect(error).toBeUndefined();
    });
  });

  test('should accept cancelled status with cancelReason', () => {
    const { error } = updateOrderSchema.validate({
      status: 'cancelled',
      cancelReason: 'Customer requested cancellation',
    });
    expect(error).toBeUndefined();
  });

  test('should reject invalid status', () => {
    const { error } = updateOrderSchema.validate({ status: 'unknown' });
    expect(error).toBeDefined();
  });

  test('should accept tracking number', () => {
    const { error } = updateOrderSchema.validate({ trackingNumber: 'TRACK123456' });
    expect(error).toBeUndefined();
  });

  test('should accept deliveryDate update', () => {
    const { error } = updateOrderSchema.validate({
      deliveryDate: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(error).toBeUndefined();
  });

  test('should accept deliveryTime update', () => {
    const { error } = updateOrderSchema.validate({ deliveryTime: '16:00' });
    expect(error).toBeUndefined();
  });

  test('should accept notes update', () => {
    const { error } = updateOrderSchema.validate({ notes: 'Updated notes' });
    expect(error).toBeUndefined();
  });

  test('should require cancelReason when status is cancelled', () => {
    const { error } = updateOrderSchema.validate({ status: 'cancelled' });
    expect(error).toBeDefined();
    expect(error.message).toContain('cancelReason');
  });

  test('should accept cancelReason with cancelled status', () => {
    const { error } = updateOrderSchema.validate({
      status: 'cancelled',
      cancelReason: 'Customer request',
    });
    expect(error).toBeUndefined();
  });

  test('should reject empty update (no fields)', () => {
    const { error } = updateOrderSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should accept multiple fields update', () => {
    const { error } = updateOrderSchema.validate({
      status: 'shipped',
      trackingNumber: 'ABC123',
      notes: 'In transit',
    });
    expect(error).toBeUndefined();
  });
});

describe('Order Validators - orderFiltersSchema', () => {
  test('should accept empty filters (defaults applied)', () => {
    const { error, value } = orderFiltersSchema.validate({});
    expect(error).toBeUndefined();
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
    expect(value.sort).toBe('createdAt');
    expect(value.order).toBe('desc');
  });

  test('should accept userId filter', () => {
    const { error } = orderFiltersSchema.validate({ userId: 'user-123' });
    expect(error).toBeUndefined();
  });

  test('should accept status filter', () => {
    const { error } = orderFiltersSchema.validate({ status: 'delivered' });
    expect(error).toBeUndefined();
  });

  test('should accept paymentMethod filter', () => {
    const { error } = orderFiltersSchema.validate({ paymentMethod: 'card' });
    expect(error).toBeUndefined();
  });

  test('should accept date range', () => {
    const dateFrom = new Date('2024-01-01').toISOString();
    const dateTo = new Date('2024-12-31').toISOString();
    const { error } = orderFiltersSchema.validate({ dateFrom, dateTo });
    expect(error).toBeUndefined();
  });

  test('should reject dateTo before dateFrom', () => {
    const dateFrom = new Date('2024-12-31').toISOString();
    const dateTo = new Date('2024-01-01').toISOString();
    const { error } = orderFiltersSchema.validate({ dateFrom, dateTo });
    expect(error).toBeDefined();
  });

  test('should accept price range', () => {
    const { error } = orderFiltersSchema.validate({ minTotal: 10, maxTotal: 100 });
    expect(error).toBeUndefined();
  });

  test('should reject maxTotal less than minTotal', () => {
    const { error } = orderFiltersSchema.validate({ minTotal: 100, maxTotal: 10 });
    expect(error).toBeDefined();
  });

  test('should accept pagination params', () => {
    const { error } = orderFiltersSchema.validate({ page: 2, limit: 50 });
    expect(error).toBeUndefined();
  });

  test('should reject page < 1', () => {
    const { error } = orderFiltersSchema.validate({ page: 0 });
    expect(error).toBeDefined();
  });

  test('should reject limit > 100', () => {
    const { error } = orderFiltersSchema.validate({ limit: 101 });
    expect(error).toBeDefined();
  });

  test('should accept valid sort fields', () => {
    const sorts = ['createdAt', 'total', 'deliveryDate'];
    sorts.forEach((sort) => {
      const { error } = orderFiltersSchema.validate({ sort });
      expect(error).toBeUndefined();
    });
  });

  test('should accept valid order directions', () => {
    const orders = ['asc', 'desc'];
    orders.forEach((order) => {
      const { error } = orderFiltersSchema.validate({ order });
      expect(error).toBeUndefined();
    });
  });
});

describe('Order Validators - rateOrderSchema', () => {
  test('should accept valid rating', () => {
    const { error } = rateOrderSchema.validate({ rating: 5 });
    expect(error).toBeUndefined();
  });

  test('should accept rating with review', () => {
    const { error } = rateOrderSchema.validate({
      rating: 4,
      review: 'Excellent service, flowers were beautiful!',
    });
    expect(error).toBeUndefined();
  });

  test('should accept ratings 1-5', () => {
    [1, 2, 3, 4, 5].forEach((rating) => {
      const { error } = rateOrderSchema.validate({ rating });
      expect(error).toBeUndefined();
    });
  });

  test('should reject rating < 1', () => {
    const { error } = rateOrderSchema.validate({ rating: 0 });
    expect(error).toBeDefined();
  });

  test('should reject rating > 5', () => {
    const { error } = rateOrderSchema.validate({ rating: 6 });
    expect(error).toBeDefined();
  });

  test('should reject missing rating', () => {
    const { error } = rateOrderSchema.validate({ review: 'Great!' });
    expect(error).toBeDefined();
  });

  test('should reject short review (< 10 chars)', () => {
    const { error } = rateOrderSchema.validate({ rating: 5, review: 'Good' });
    expect(error).toBeDefined();
  });

  test('should reject long review (> 1000 chars)', () => {
    const { error } = rateOrderSchema.validate({ rating: 5, review: 'A'.repeat(1001) });
    expect(error).toBeDefined();
  });

  test('should accept review at minimum length (10 chars)', () => {
    const { error } = rateOrderSchema.validate({ rating: 5, review: '1234567890' });
    expect(error).toBeUndefined();
  });

  test('should accept review at maximum length (1000 chars)', () => {
    const { error } = rateOrderSchema.validate({ rating: 5, review: 'A'.repeat(1000) });
    expect(error).toBeUndefined();
  });
});
