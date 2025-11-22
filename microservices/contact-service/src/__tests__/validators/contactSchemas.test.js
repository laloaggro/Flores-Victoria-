/**
 * Tests para Contact Service Validators
 * Coverage: 100% de contactSchemas.js
 */

const {
  createContactSchema,
  updateContactSchema,
  contactFiltersSchema,
} = require('../../validators/contactSchemas');

describe('Contact Validators - createContactSchema', () => {
  const validContact = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question about delivery',
    message: 'I would like to know more about delivery times and costs.',
    consent: true,
  };

  test('should accept valid contact form', () => {
    const { error } = createContactSchema.validate(validContact);
    expect(error).toBeUndefined();
  });

  test('should default category to general', () => {
    const { value } = createContactSchema.validate(validContact);
    expect(value.category).toBe('general');
  });

  test('should default urgency to medium', () => {
    const { value } = createContactSchema.validate(validContact);
    expect(value.urgency).toBe('medium');
  });

  test('should default preferredContactMethod to email', () => {
    const { value } = createContactSchema.validate(validContact);
    expect(value.preferredContactMethod).toBe('email');
  });

  test('should accept all valid categories', () => {
    const categories = ['general', 'orders', 'products', 'complaints', 'suggestions', 'other'];
    categories.forEach((category) => {
      const { error } = createContactSchema.validate({ ...validContact, category });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid category', () => {
    const { error } = createContactSchema.validate({ ...validContact, category: 'invalid' });
    expect(error).toBeDefined();
  });

  test('should accept all valid urgency levels', () => {
    const urgencies = ['low', 'medium', 'high'];
    urgencies.forEach((urgency) => {
      const { error } = createContactSchema.validate({ ...validContact, urgency });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid urgency', () => {
    const { error } = createContactSchema.validate({ ...validContact, urgency: 'critical' });
    expect(error).toBeDefined();
  });

  test('should accept all preferred contact methods', () => {
    const methods = ['email', 'phone', 'any'];
    methods.forEach((method) => {
      const { error } = createContactSchema.validate({
        ...validContact,
        preferredContactMethod: method,
      });
      expect(error).toBeUndefined();
    });
  });

  test('should accept optional phone', () => {
    const { error } = createContactSchema.validate({
      ...validContact,
      phone: '+56987654321',
    });
    expect(error).toBeUndefined();
  });

  test('should reject short name (< 2 chars)', () => {
    const { error } = createContactSchema.validate({ ...validContact, name: 'A' });
    expect(error).toBeDefined();
  });

  test('should reject long name (> 100 chars)', () => {
    const { error } = createContactSchema.validate({ ...validContact, name: 'A'.repeat(101) });
    expect(error).toBeDefined();
  });

  test('should reject invalid email', () => {
    const { error } = createContactSchema.validate({ ...validContact, email: 'invalid-email' });
    expect(error).toBeDefined();
  });

  test('should reject short subject (< 5 chars)', () => {
    const { error } = createContactSchema.validate({ ...validContact, subject: 'Help' });
    expect(error).toBeDefined();
  });

  test('should reject long subject (> 200 chars)', () => {
    const { error } = createContactSchema.validate({ ...validContact, subject: 'A'.repeat(201) });
    expect(error).toBeDefined();
  });

  test('should reject short message (< 10 chars)', () => {
    const { error } = createContactSchema.validate({ ...validContact, message: 'Help me' });
    expect(error).toBeDefined();
  });

  test('should reject long message (> 2000 chars)', () => {
    const { error } = createContactSchema.validate({ ...validContact, message: 'A'.repeat(2001) });
    expect(error).toBeDefined();
  });

  test('should reject when consent is false', () => {
    const { error } = createContactSchema.validate({ ...validContact, consent: false });
    expect(error).toBeDefined();
    expect(error.message).toContain('consent');
  });

  test('should reject missing consent', () => {
    const data = { ...validContact };
    delete data.consent;
    const { error } = createContactSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('should reject missing required fields', () => {
    const { error: error1 } = createContactSchema.validate({ ...validContact, name: undefined });
    const { error: error2 } = createContactSchema.validate({ ...validContact, email: undefined });
    const { error: error3 } = createContactSchema.validate({ ...validContact, subject: undefined });
    const { error: error4 } = createContactSchema.validate({ ...validContact, message: undefined });

    expect(error1).toBeDefined();
    expect(error2).toBeDefined();
    expect(error3).toBeDefined();
    expect(error4).toBeDefined();
  });

  test('should trim whitespace', () => {
    const { value } = createContactSchema.validate({
      ...validContact,
      name: '  John Doe  ',
      subject: '  Question  ',
      message: '  Message text  ',
    });
    expect(value.name).toBe('John Doe');
    expect(value.subject).toBe('Question');
    expect(value.message).toBe('Message text');
  });
});

describe('Contact Validators - updateContactSchema', () => {
  test('should accept status update', () => {
    const { error } = updateContactSchema.validate({ status: 'in-progress' });
    expect(error).toBeUndefined();
  });

  test('should accept all valid statuses', () => {
    const statuses = ['pending', 'in-progress', 'resolved', 'closed'];
    statuses.forEach((status) => {
      const { error } = updateContactSchema.validate({ status });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid status', () => {
    const { error } = updateContactSchema.validate({ status: 'unknown' });
    expect(error).toBeDefined();
  });

  test('should accept response update', () => {
    const { error } = updateContactSchema.validate({
      response: 'Thank you for contacting us. We will get back to you soon.',
    });
    expect(error).toBeUndefined();
  });

  test('should reject short response (< 10 chars)', () => {
    const { error } = updateContactSchema.validate({ response: 'Thanks' });
    expect(error).toBeDefined();
  });

  test('should reject long response (> 2000 chars)', () => {
    const { error } = updateContactSchema.validate({ response: 'A'.repeat(2001) });
    expect(error).toBeDefined();
  });

  test('should accept assignedTo update', () => {
    const { error } = updateContactSchema.validate({ assignedTo: 'agent-123' });
    expect(error).toBeUndefined();
  });

  test('should accept all valid priorities', () => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    priorities.forEach((priority) => {
      const { error } = updateContactSchema.validate({ priority });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid priority', () => {
    const { error } = updateContactSchema.validate({ priority: 'critical' });
    expect(error).toBeDefined();
  });

  test('should accept notes update', () => {
    const { error } = updateContactSchema.validate({ notes: 'Internal notes here' });
    expect(error).toBeUndefined();
  });

  test('should reject long notes (> 1000 chars)', () => {
    const { error } = updateContactSchema.validate({ notes: 'A'.repeat(1001) });
    expect(error).toBeDefined();
  });

  test('should reject empty update', () => {
    const { error } = updateContactSchema.validate({});
    expect(error).toBeDefined();
  });

  test('should accept multiple fields update', () => {
    const { error } = updateContactSchema.validate({
      status: 'resolved',
      response: 'Issue has been resolved successfully',
      priority: 'low',
    });
    expect(error).toBeUndefined();
  });
});

describe('Contact Validators - contactFiltersSchema', () => {
  test('should accept empty filters with defaults', () => {
    const { error, value } = contactFiltersSchema.validate({});
    expect(error).toBeUndefined();
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
    expect(value.sort).toBe('createdAt');
    expect(value.order).toBe('desc');
  });

  test('should accept status filter', () => {
    const { error } = contactFiltersSchema.validate({ status: 'pending' });
    expect(error).toBeUndefined();
  });

  test('should accept all valid statuses in filter', () => {
    const statuses = ['pending', 'in-progress', 'resolved', 'closed'];
    statuses.forEach((status) => {
      const { error } = contactFiltersSchema.validate({ status });
      expect(error).toBeUndefined();
    });
  });

  test('should accept category filter', () => {
    const { error } = contactFiltersSchema.validate({ category: 'orders' });
    expect(error).toBeUndefined();
  });

  test('should accept all valid categories in filter', () => {
    const categories = ['general', 'orders', 'products', 'complaints', 'suggestions', 'other'];
    categories.forEach((category) => {
      const { error } = contactFiltersSchema.validate({ category });
      expect(error).toBeUndefined();
    });
  });

  test('should accept urgency filter', () => {
    const { error } = contactFiltersSchema.validate({ urgency: 'high' });
    expect(error).toBeUndefined();
  });

  test('should accept all valid urgencies in filter', () => {
    const urgencies = ['low', 'medium', 'high'];
    urgencies.forEach((urgency) => {
      const { error } = contactFiltersSchema.validate({ urgency });
      expect(error).toBeUndefined();
    });
  });

  test('should accept date range', () => {
    const dateFrom = new Date('2024-01-01').toISOString();
    const dateTo = new Date('2024-12-31').toISOString();
    const { error } = contactFiltersSchema.validate({ dateFrom, dateTo });
    expect(error).toBeUndefined();
  });

  test('should reject dateTo before dateFrom', () => {
    const dateFrom = new Date('2024-12-31').toISOString();
    const dateTo = new Date('2024-01-01').toISOString();
    const { error } = contactFiltersSchema.validate({ dateFrom, dateTo });
    expect(error).toBeDefined();
  });

  test('should accept search filter', () => {
    const { error } = contactFiltersSchema.validate({ search: 'delivery' });
    expect(error).toBeUndefined();
  });

  test('should reject short search (< 2 chars)', () => {
    const { error } = contactFiltersSchema.validate({ search: 'a' });
    expect(error).toBeDefined();
  });

  test('should accept pagination params', () => {
    const { error } = contactFiltersSchema.validate({ page: 2, limit: 50 });
    expect(error).toBeUndefined();
  });

  test('should reject page < 1', () => {
    const { error } = contactFiltersSchema.validate({ page: 0 });
    expect(error).toBeDefined();
  });

  test('should reject limit > 100', () => {
    const { error } = contactFiltersSchema.validate({ limit: 101 });
    expect(error).toBeDefined();
  });

  test('should accept valid sort fields', () => {
    const sorts = ['createdAt', 'urgency', 'status'];
    sorts.forEach((sort) => {
      const { error } = contactFiltersSchema.validate({ sort });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid sort field', () => {
    const { error } = contactFiltersSchema.validate({ sort: 'invalid' });
    expect(error).toBeDefined();
  });

  test('should accept order directions', () => {
    const orders = ['asc', 'desc'];
    orders.forEach((order) => {
      const { error } = contactFiltersSchema.validate({ order });
      expect(error).toBeUndefined();
    });
  });

  test('should reject invalid order direction', () => {
    const { error } = contactFiltersSchema.validate({ order: 'invalid' });
    expect(error).toBeDefined();
  });
});
