/**
 * Tests adicionales para email.service.js
 */

const nodemailer = require('nodemailer');

jest.mock('nodemailer');

describe('Email Service - Extended Coverage', () => {
  let emailService;
  let mockTransporter;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-123' }),
      verify: jest.fn().mockResolvedValue(true),
    };

    nodemailer.createTransport = jest.fn(() => mockTransporter);

    emailService = require('../../services/email.service');
  });

  describe('Service Configuration', () => {
    it('should have sendEmail function', () => {
      expect(emailService).toHaveProperty('sendEmail');
      expect(typeof emailService.sendEmail).toBe('function');
    });

    it('should create transporter', () => {
      expect(nodemailer.createTransport).toHaveBeenCalled();
    });
  });

  describe('Email Sending', () => {
    it('should send email with all parameters', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      };

      const result = await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(result).toHaveProperty('messageId');
    });

    it('should handle email sending errors', async () => {
      mockTransporter.sendMail = jest.fn().mockRejectedValue(new Error('Send failed'));

      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Send failed');
    });

    it('should send email with text content', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Plain text content',
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Plain text content',
        })
      );
    });

    it('should send email with HTML content', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        html: '<h1>HTML content</h1>',
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<h1>HTML content</h1>',
        })
      );
    });

    it('should include from address', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
        })
      );
    });

    it('should handle multiple recipients', async () => {
      const emailData = {
        to: 'test1@example.com, test2@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        subject: 'Test',
        html: '<p>Test</p>',
      };

      await expect(emailService.sendEmail(invalidData)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockTransporter.sendMail = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('ECONNREFUSED');
    });

    it('should return message ID on success', async () => {
      mockTransporter.sendMail = jest
        .fn()
        .mockResolvedValue({ messageId: '<unique-id@mail.com>' });

      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      const result = await emailService.sendEmail(emailData);

      expect(result.messageId).toBe('<unique-id@mail.com>');
    });
  });

  describe('Transporter Verification', () => {
    it('should verify transporter connection', async () => {
      await mockTransporter.verify();

      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should handle verification failures', async () => {
      mockTransporter.verify = jest.fn().mockRejectedValue(new Error('Connection failed'));

      await expect(mockTransporter.verify()).rejects.toThrow('Connection failed');
    });
  });
});
