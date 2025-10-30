/**
 * Validator Middleware Tests
 * 
 * Tests para validar el comportamiento del middleware de validación Joi
 */

const Joi = require('joi');
const { validate, validateBody, validateQuery, validateParams, commonSchemas } = require('../validator');
const { ValidationError } = require('../../errors/AppError');

describe('Validator Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('validate', () => {
    const testSchema = Joi.object({
      email: Joi.string().email().required(),
      age: Joi.number().min(18).required(),
    });

    test('should pass validation with valid data', () => {
      const data = { email: 'test@example.com', age: 25 };
      const middleware = validate(testSchema, 'body');

      req.body = data;
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    test('should call next with ValidationError on invalid data', () => {
      const data = { email: 'invalid-email', age: 15 };
      const middleware = validate(testSchema, 'body');

      req.body = data;
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'age' }),
        ])
      );
    });

    test('should strip unknown fields by default', () => {
      const data = { email: 'test@example.com', age: 25, unknownField: 'value' };
      const middleware = validate(testSchema, 'body');

      req.body = data;
      middleware(req, res, next);

      expect(req.body).not.toHaveProperty('unknownField');
      expect(req.body).toEqual({ email: 'test@example.com', age: 25 });
    });
  });

  describe('validateBody', () => {
    test('should validate request body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      req.body = { name: 'John' };
      validateBody(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should fail with invalid body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      req.body = {};
      validateBody(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('validateQuery', () => {
    test('should validate query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
      });

      req.query = { page: '1', limit: '10' };
      validateQuery(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.query.page).toBe(1); // Should convert string to number
      expect(req.query.limit).toBe(10);
    });
  });

  describe('validateParams', () => {
    test('should validate route parameters', () => {
      const schema = Joi.object({
        id: Joi.string().uuid().required(),
      });

      req.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      validateParams(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should fail with invalid UUID', () => {
      const schema = Joi.object({
        id: Joi.string().uuid().required(),
      });

      req.params = { id: 'not-a-uuid' };
      validateParams(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('commonSchemas', () => {
    test('email schema should validate email format', () => {
      const { error: validError } = commonSchemas.email().validate('test@example.com');
      expect(validError).toBeUndefined();

      const { error: invalidError } = commonSchemas.email().validate('invalid-email');
      expect(invalidError).toBeDefined();
    });

    test('password schema should enforce minimum length', () => {
      const { error: validError } = commonSchemas.password().validate('password123');
      expect(validError).toBeUndefined();

      const { error: shortError } = commonSchemas.password().validate('123');
      expect(shortError).toBeDefined();
    });

    test('pagination should validate correctly', () => {
      const { value } = commonSchemas.pagination().validate({});
      expect(value.page).toBe(1);
      expect(value.limit).toBe(20); // Default changed to 20
    });

    test('mongoId schema should validate MongoDB ObjectId', () => {
      const { error: validError } = commonSchemas.mongoId().validate('507f1f77bcf86cd799439011');
      expect(validError).toBeUndefined();

      const { error: invalidError } = commonSchemas.mongoId().validate('invalid-id');
      expect(invalidError).toBeDefined();
    });
  });

  describe('Error message formatting', () => {
    test('should format multiple validation errors correctly', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        age: Joi.number().min(18).required(),
      });

      req.body = {
        email: 'invalid',
        password: '123',
        age: 15,
      };

      validateBody(schema)(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.errors).toHaveLength(3);
      expect(error.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'password' }),
          expect.objectContaining({ field: 'age' }),
        ])
      );
    });
  });
});
