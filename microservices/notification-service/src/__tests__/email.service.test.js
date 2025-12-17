/**
 * Tests simplificados para Email Service
 * Estos tests verifican la lógica del servicio usando mocks manuales
 */

describe('EmailService', () => {
  let emailService;
  let mockTransporter;

  beforeEach(() => {
    jest.resetModules();

    // Mock nodemailer before requiring email service
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-123' }),
      verify: jest.fn().mockResolvedValue(true),
    };

    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn().mockReturnValue(mockTransporter),
    }));

    jest.doMock('../config', () => ({
      email: {
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        user: 'test@test.com',
        password: 'testpass',
        from: 'noreply@floresvictoria.com',
      },
      frontendUrl: 'https://floresvictoria.com',
    }));

    jest.doMock('../logger.simple', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));

    emailService = require('../services/email.service');
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('constructor', () => {
    it('should create service with null transporter initially', () => {
      expect(emailService.transporter).toBeNull();
      expect(emailService.initialized).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize with correct transporter config', async () => {
      const result = await emailService.initialize();

      const nodemailer = require('nodemailer');
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.test.com',
          port: 587,
          auth: expect.objectContaining({
            user: 'test@test.com',
          }),
        })
      );
      expect(result).toBe(true);
    });

    it('should return true if already initialized', async () => {
      emailService.initialized = true;
      const result = await emailService.initialize();
      expect(result).toBe(true);
    });

    it('should return false on verification failure', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));
      const result = await emailService.initialize();
      expect(result).toBe(false);
    });
  });

  describe('sendEmail', () => {
    beforeEach(async () => {
      await emailService.initialize();
    });

    it('should send email with correct parameters', async () => {
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<p>Test</p>',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test Subject',
        })
      );
      expect(result.messageId).toBe('test-123');
    });
  });

  describe('sendWelcomeEmail', () => {
    beforeEach(async () => {
      await emailService.initialize();
    });

    it('should send welcome email', async () => {
      await emailService.sendWelcomeEmail({
        email: 'user@test.com',
        name: 'Test User',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Bienvenido'),
        })
      );
    });
  });

  describe('sendOrderConfirmation', () => {
    beforeEach(async () => {
      await emailService.initialize();
    });

    it('should send order confirmation', async () => {
      await emailService.sendOrderConfirmation({
        orderNumber: 'ORD-123',
        customerEmail: 'customer@test.com',
        customerName: 'Customer',
        items: [{ name: 'Roses', quantity: 1, price: 50 }],
        total: 50,
        shippingAddress: '123 St',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@test.com',
        })
      );
    });
  });

  describe('sendPasswordReset', () => {
    beforeEach(async () => {
      await emailService.initialize();
    });

    it('should send password reset email', async () => {
      await emailService.sendPasswordReset({ email: 'user@test.com', name: 'User' }, 'token-123');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Restablecer'),
        })
      );
    });
  });

  describe('sendShippingUpdate', () => {
    beforeEach(async () => {
      await emailService.initialize();
    });

    it('should send shipping update', async () => {
      await emailService.sendShippingUpdate({
        email: 'customer@test.com',
        name: 'Customer',
        orderNumber: 'ORD-123',
        status: 'shipped',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });
  });

  describe('sendContactResponse', () => {
    beforeEach(async () => {
      await emailService.initialize();
    });

    it('should send contact response', async () => {
      await emailService.sendContactResponse(
        { email: 'contact@test.com', name: 'Contact' },
        'Thank you for your message'
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'contact@test.com',
        })
      );
    });
  });
});
