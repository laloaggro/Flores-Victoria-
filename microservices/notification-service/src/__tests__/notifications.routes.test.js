/**
 * Tests completos para Notification Routes
 */

const request = require('supertest');
const express = require('express');

// Mock email service
const mockSendEmail = jest.fn();
const mockSendWelcomeEmail = jest.fn();
const mockSendOrderConfirmation = jest.fn();
const mockSendPasswordReset = jest.fn();
const mockSendShippingUpdate = jest.fn();
const mockSendContactResponse = jest.fn();

jest.mock('../services/email.service', () => ({
  sendEmail: mockSendEmail,
  sendWelcomeEmail: mockSendWelcomeEmail,
  sendOrderConfirmation: mockSendOrderConfirmation,
  sendPasswordReset: mockSendPasswordReset,
  sendShippingUpdate: mockSendShippingUpdate,
  sendContactResponse: mockSendContactResponse,
}));

// Mock logger
jest.mock('../logger.simple', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const notificationsRouter = require('../routes/notifications.routes');

describe('Notification Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/notifications', notificationsRouter);

    // Reset mocks to successful responses
    mockSendEmail.mockResolvedValue({ messageId: 'msg-123' });
    mockSendWelcomeEmail.mockResolvedValue({ messageId: 'msg-123' });
    mockSendOrderConfirmation.mockResolvedValue({ messageId: 'msg-123' });
    mockSendPasswordReset.mockResolvedValue({ messageId: 'msg-123' });
    mockSendShippingUpdate.mockResolvedValue({ messageId: 'msg-123' });
    mockSendContactResponse.mockResolvedValue({ messageId: 'msg-123' });
  });

  // SEND EMAIL
  describe('POST /api/notifications/email', () => {
    it('should send email successfully', async () => {
      const response = await request(app)
        .post('/api/notifications/email')
        .send({
          to: 'test@example.com',
          subject: 'Test Subject',
          text: 'Test body',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.messageId).toBe('msg-123');
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: undefined,
      });
    });

    it('should send email with HTML', async () => {
      await request(app)
        .post('/api/notifications/email')
        .send({
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<p>HTML body</p>',
        })
        .expect(200);

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<p>HTML body</p>',
        })
      );
    });

    it('should return 400 when to is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/email')
        .send({ subject: 'Test', text: 'Body' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 when subject is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/email')
        .send({ to: 'test@test.com', text: 'Body' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 when both text and html are missing', async () => {
      const response = await request(app)
        .post('/api/notifications/email')
        .send({ to: 'test@test.com', subject: 'Test' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_CONTENT');
    });

    it('should handle email send errors', async () => {
      mockSendEmail.mockRejectedValue(new Error('SMTP error'));

      const response = await request(app)
        .post('/api/notifications/email')
        .send({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Body',
        })
        .expect(500);

      expect(response.body.code).toBe('EMAIL_SEND_ERROR');
    });
  });

  // WELCOME EMAIL
  describe('POST /api/notifications/welcome', () => {
    it('should send welcome email successfully', async () => {
      const response = await request(app)
        .post('/api/notifications/welcome')
        .send({
          email: 'user@example.com',
          name: 'John Doe',
          userId: 'user-123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
        email: 'user@example.com',
        name: 'John Doe',
        id: 'user-123',
      });
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/welcome')
        .send({ name: 'John' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/welcome')
        .send({ email: 'test@test.com' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });

    it('should handle errors', async () => {
      mockSendWelcomeEmail.mockRejectedValue(new Error('Email failed'));

      const response = await request(app)
        .post('/api/notifications/welcome')
        .send({ email: 'test@test.com', name: 'Test' })
        .expect(500);

      expect(response.body.code).toBe('WELCOME_EMAIL_ERROR');
    });
  });

  // ORDER CONFIRMATION
  describe('POST /api/notifications/order-confirmation', () => {
    const validOrder = {
      orderId: 'ORDER-123',
      customerEmail: 'customer@test.com',
      customerName: 'Customer Name',
      items: [{ name: 'Roses', quantity: 2, price: 15000 }],
      total: 30000,
      shippingAddress: '123 Flower St',
    };

    it('should send order confirmation successfully', async () => {
      const response = await request(app)
        .post('/api/notifications/order-confirmation')
        .send(validOrder)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSendOrderConfirmation).toHaveBeenCalledWith({
        id: 'ORDER-123',
        customerEmail: 'customer@test.com',
        customerName: 'Customer Name',
        items: validOrder.items,
        total: 30000,
        shippingAddress: '123 Flower St',
      });
    });

    it('should calculate total if not provided', async () => {
      await request(app)
        .post('/api/notifications/order-confirmation')
        .send({
          orderId: 'ORDER-123',
          customerEmail: 'test@test.com',
          items: [
            { name: 'Item1', quantity: 2, price: 100 },
            { name: 'Item2', quantity: 1, price: 50 },
          ],
        })
        .expect(200);

      expect(mockSendOrderConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 250,
        })
      );
    });

    it('should use default customer name if not provided', async () => {
      await request(app)
        .post('/api/notifications/order-confirmation')
        .send({
          orderId: 'ORDER-123',
          customerEmail: 'test@test.com',
          items: [{ name: 'Item', quantity: 1, price: 100 }],
        })
        .expect(200);

      expect(mockSendOrderConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'Cliente',
        })
      );
    });

    it('should return 400 when orderId is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/order-confirmation')
        .send({
          customerEmail: 'test@test.com',
          items: [],
        })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 when items is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/order-confirmation')
        .send({
          orderId: 'ORDER-123',
          customerEmail: 'test@test.com',
        })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });
  });

  // PASSWORD RESET
  describe('POST /api/notifications/password-reset', () => {
    it('should send password reset email', async () => {
      const response = await request(app)
        .post('/api/notifications/password-reset')
        .send({
          email: 'user@test.com',
          name: 'Test User',
          resetToken: 'token-123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSendPasswordReset).toHaveBeenCalledWith(
        { email: 'user@test.com', name: 'Test User' },
        'token-123'
      );
    });

    it('should use default name if not provided', async () => {
      await request(app)
        .post('/api/notifications/password-reset')
        .send({
          email: 'user@test.com',
          resetToken: 'token-123',
        })
        .expect(200);

      expect(mockSendPasswordReset).toHaveBeenCalledWith(
        { email: 'user@test.com', name: 'Usuario' },
        'token-123'
      );
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/password-reset')
        .send({ resetToken: 'token' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 when resetToken is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/password-reset')
        .send({ email: 'test@test.com' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });
  });

  // SHIPPING UPDATE
  describe('POST /api/notifications/shipping-update', () => {
    it('should send shipping update successfully', async () => {
      const response = await request(app)
        .post('/api/notifications/shipping-update')
        .send({
          orderId: 'ORDER-123',
          customerEmail: 'customer@test.com',
          customerName: 'Customer',
          status: 'shipped',
          trackingNumber: 'TRACK-456',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSendShippingUpdate).toHaveBeenCalledWith(
        {
          id: 'ORDER-123',
          customerEmail: 'customer@test.com',
          customerName: 'Customer',
          trackingNumber: 'TRACK-456',
        },
        'shipped'
      );
    });

    it('should accept preparing status', async () => {
      await request(app)
        .post('/api/notifications/shipping-update')
        .send({
          orderId: 'ORDER-123',
          customerEmail: 'test@test.com',
          status: 'preparing',
        })
        .expect(200);
    });

    it('should accept delivered status', async () => {
      await request(app)
        .post('/api/notifications/shipping-update')
        .send({
          orderId: 'ORDER-123',
          customerEmail: 'test@test.com',
          status: 'delivered',
        })
        .expect(200);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/notifications/shipping-update')
        .send({
          orderId: 'ORDER-123',
          customerEmail: 'test@test.com',
          status: 'invalid-status',
        })
        .expect(400);

      expect(response.body.code).toBe('INVALID_STATUS');
    });

    it('should return 400 when orderId is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/shipping-update')
        .send({
          customerEmail: 'test@test.com',
          status: 'shipped',
        })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });
  });

  // CONTACT RESPONSE
  describe('POST /api/notifications/contact-response', () => {
    it('should send contact response successfully', async () => {
      const response = await request(app)
        .post('/api/notifications/contact-response')
        .send({
          email: 'contact@test.com',
          name: 'Contact Person',
          originalMessage: 'My question',
          responseMessage: 'Our answer',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSendContactResponse).toHaveBeenCalledWith(
        {
          email: 'contact@test.com',
          name: 'Contact Person',
          originalMessage: 'My question',
        },
        'Our answer'
      );
    });

    it('should use default name if not provided', async () => {
      await request(app)
        .post('/api/notifications/contact-response')
        .send({
          email: 'contact@test.com',
          responseMessage: 'Response',
        })
        .expect(200);

      expect(mockSendContactResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cliente',
        }),
        'Response'
      );
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/contact-response')
        .send({ responseMessage: 'Response' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 when responseMessage is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/contact-response')
        .send({ email: 'test@test.com' })
        .expect(400);

      expect(response.body.code).toBe('MISSING_FIELDS');
    });
  });

  // NOTIFICATION HISTORY
  describe('GET /api/notifications/history', () => {
    it('should return empty history initially', async () => {
      const response = await request(app).get('/api/notifications/history').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app).get('/api/notifications/history?limit=10').expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/notifications/:id', () => {
    it('should return 404 for non-existent notification', async () => {
      const response = await request(app).get('/api/notifications/non-existent-id').expect(404);

      expect(response.body.code).toBe('NOT_FOUND');
    });
  });
});
