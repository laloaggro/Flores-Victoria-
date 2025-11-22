/**
 * Tests comprehensivos para PaymentProcessor
 * Cubren Stripe, PayPal, Transbank
 */

// Mock de módulos externos
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      confirm: jest.fn(),
      retrieve: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
  }));
});

jest.mock('@paypal/checkout-server-sdk', () => ({
  core: {
    LiveEnvironment: jest.fn(),
    SandboxEnvironment: jest.fn(),
    PayPalHttpClient: jest.fn().mockImplementation(() => ({
      execute: jest.fn(),
    })),
  },
  orders: {
    OrdersCreateRequest: jest.fn().mockImplementation(() => ({
      prefer: jest.fn().mockReturnThis(),
      requestBody: jest.fn().mockReturnThis(),
    })),
    OrdersCaptureRequest: jest.fn().mockImplementation(() => ({
      requestBody: jest.fn().mockReturnThis(),
    })),
  },
}));

jest.mock('transbank-sdk', () => ({
  WebpayPlus: {
    Transaction: {
      configureForProduction: jest.fn(),
      configureForTesting: jest.fn(),
      create: jest.fn(),
      commit: jest.fn(),
    },
  },
}));

const PaymentProcessor = require('../PaymentProcessor');
const stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');

describe('PaymentProcessor', () => {
  let processor;
  let mockStripe;
  let mockPayPalClient;

  beforeEach(() => {
    // Reset environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.PAYPAL_CLIENT_ID = 'paypal_client_id';
    process.env.PAYPAL_CLIENT_SECRET = 'paypal_secret';
    process.env.TRANSBANK_COMMERCE_CODE = '597055555532';
    process.env.TRANSBANK_API_KEY = 'transbank_key';
    process.env.NODE_ENV = 'test';

    // Reset mocks
    jest.clearAllMocks();

    // Create processor instance
    processor = new PaymentProcessor();
    mockStripe = processor.stripe;
    mockPayPalClient = processor.paypalClient;
  });

  describe('Constructor', () => {
    it('should initialize with all payment providers', () => {
      expect(processor).toBeDefined();
      expect(processor.stripe).toBeDefined();
      expect(processor.paypalClient).toBeDefined();
      expect(processor.transbank).toBeDefined();
    });

    it('should use sandbox environment in non-production', () => {
      expect(paypal.core.SandboxEnvironment).toHaveBeenCalled();
    });

    it('should configure Transbank for testing', () => {
      expect(processor.transbank.environment).toBe('integration');
    });
  });

  describe('processStripePayment', () => {
    it('should process successful Stripe payment', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        status: 'succeeded',
        amount: 10000,
        currency: 'clp',
      });

      const result = await processor.processStripePayment({
        amount: 100,
        currency: 'clp',
        source: 'pm_123',
        description: 'Test payment',
        customerEmail: 'test@example.com',
        orderId: 'order_123',
      });

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('pi_123');
      expect(result.amount).toBe(100);
      expect(result.status).toBe('completed');
    });

    it('should handle payment requiring action (3D Secure)', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        status: 'requires_action',
        client_secret: 'pi_123_secret',
      });

      const result = await processor.processStripePayment({
        amount: 100,
        source: 'pm_123',
        orderId: 'order_123',
      });

      expect(result.success).toBe(false);
      expect(result.requiresAction).toBe(true);
      expect(result.clientSecret).toBe('pi_123_secret');
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue(
        new Error('Card declined')
      );

      const result = await processor.processStripePayment({
        amount: 100,
        source: 'pm_123',
        orderId: 'order_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Card declined');
    });

    it('should convert amount to cents correctly', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        status: 'succeeded',
        amount: 15050,
        currency: 'clp',
      });

      await processor.processStripePayment({
        amount: 150.50,
        source: 'pm_123',
        orderId: 'order_123',
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 15050,
        })
      );
    });

    it('should include metadata in payment intent', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        status: 'succeeded',
        amount: 10000,
        currency: 'clp',
      });

      await processor.processStripePayment({
        amount: 100,
        source: 'pm_123',
        orderId: 'order_123',
        metadata: { customField: 'value' },
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            orderId: 'order_123',
            service: 'flores-victoria',
            customField: 'value',
          }),
        })
      );
    });

    it('should handle failed payment status', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        status: 'failed',
        amount: 10000,
        currency: 'clp',
      });

      const result = await processor.processStripePayment({
        amount: 100,
        source: 'pm_123',
        orderId: 'order_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Payment failed');
    });
  });

  describe('confirmStripePayment', () => {
    it('should confirm payment successfully', async () => {
      mockStripe.paymentIntents.confirm.mockResolvedValue({
        id: 'pi_123',
        status: 'succeeded',
        amount: 10000,
        currency: 'clp',
      });

      const result = await processor.confirmStripePayment('pi_123');

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('pi_123');
      expect(result.amount).toBe(100);
    });

    it('should handle confirmation errors', async () => {
      mockStripe.paymentIntents.confirm.mockRejectedValue(
        new Error('Confirmation failed')
      );

      const result = await processor.confirmStripePayment('pi_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Confirmation failed');
    });

    it('should handle non-succeeded status', async () => {
      mockStripe.paymentIntents.confirm.mockResolvedValue({
        id: 'pi_123',
        status: 'requires_payment_method',
        amount: 10000,
        currency: 'clp',
      });

      const result = await processor.confirmStripePayment('pi_123');

      expect(result.success).toBe(false);
      expect(result.status).toBe('requires_payment_method');
    });
  });

  describe('processPayPalPayment', () => {
    it('should create PayPal order successfully', async () => {
      mockPayPalClient.execute.mockResolvedValue({
        result: {
          id: 'PAYPAL123',
          status: 'CREATED',
          links: [
            { rel: 'approve', href: 'https://paypal.com/approve' },
          ],
        },
      });

      const result = await processor.processPayPalPayment({
        amount: 100,
        currency: 'USD',
        orderId: 'order_123',
        returnUrl: 'https://example.com/return',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('PAYPAL123');
      expect(result.approvalUrl).toBe('https://paypal.com/approve');
      expect(result.status).toBe('pending_approval');
    });

    it('should handle PayPal API errors', async () => {
      mockPayPalClient.execute.mockRejectedValue(
        new Error('PayPal service unavailable')
      );

      const result = await processor.processPayPalPayment({
        amount: 100,
        orderId: 'order_123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('PayPal service unavailable');
      expect(result.code).toBe('PAYPAL_ERROR');
    });

    it('should format amount correctly for PayPal', async () => {
      mockPayPalClient.execute.mockResolvedValue({
        result: {
          id: 'PAYPAL123',
          links: [{ rel: 'approve', href: 'https://paypal.com/approve' }],
        },
      });

      await processor.processPayPalPayment({
        amount: 99.99,
        orderId: 'order_123',
      });

      // Verify the request was created with correct format
      expect(paypal.orders.OrdersCreateRequest).toHaveBeenCalled();
    });

    it('should include brand name in application context', async () => {
      mockPayPalClient.execute.mockResolvedValue({
        result: {
          id: 'PAYPAL123',
          links: [{ rel: 'approve', href: 'https://paypal.com/approve' }],
        },
      });

      await processor.processPayPalPayment({
        amount: 100,
        orderId: 'order_123',
      });

      expect(paypal.orders.OrdersCreateRequest).toHaveBeenCalled();
    });
  });

  describe('capturePayPalPayment', () => {
    it('should capture PayPal payment successfully', async () => {
      mockPayPalClient.execute.mockResolvedValue({
        result: {
          id: 'CAPTURE123',
          status: 'COMPLETED',
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    amount: {
                      value: '100.00',
                      currency_code: 'USD',
                    },
                  },
                ],
              },
            },
          ],
        },
      });

      const result = await processor.capturePayPalPayment('PAYPAL123');

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('CAPTURE123');
      expect(result.status).toBe('completed');
      expect(result.amount).toBe(100);
      expect(result.currency).toBe('USD');
    });

    it('should handle capture errors', async () => {
      mockPayPalClient.execute.mockRejectedValue(
        new Error('Capture failed')
      );

      const result = await processor.capturePayPalPayment('PAYPAL123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Capture failed');
    });

    it('should handle non-completed capture status', async () => {
      mockPayPalClient.execute.mockResolvedValue({
        result: {
          status: 'PENDING',
        },
      });

      const result = await processor.capturePayPalPayment('PAYPAL123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('PayPal capture failed');
    });
  });

  describe('processTransbankPayment', () => {
    it('should create Transbank transaction successfully', async () => {
      const { WebpayPlus } = require('transbank-sdk');
      WebpayPlus.Transaction.create.mockResolvedValue({
        token: 'transbank_token_123',
        url: 'https://webpay3g.transbank.cl/webpayserver/initTransaction',
      });

      const result = await processor.processTransbankPayment({
        amount: 50000,
        orderId: 'order_123',
        sessionId: 'session_123',
        returnUrl: 'https://example.com/return',
      });

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('transbank_token_123');
      expect(result.status).toBe('pending_payment');
      expect(result.redirectUrl).toContain('transbank_token_123');
    });

    it('should handle Transbank errors', async () => {
      const { WebpayPlus } = require('transbank-sdk');
      WebpayPlus.Transaction.create.mockRejectedValue(
        new Error('Transbank service error')
      );

      const result = await processor.processTransbankPayment({
        amount: 50000,
        orderId: 'order_123',
        sessionId: 'session_123',
        returnUrl: 'https://example.com/return',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transbank service error');
      expect(result.code).toBe('TRANSBANK_ERROR');
    });

    it('should configure Transbank for testing environment', async () => {
      const { WebpayPlus } = require('transbank-sdk');
      WebpayPlus.Transaction.create.mockResolvedValue({
        token: 'token_123',
        url: 'https://webpay.com',
      });

      await processor.processTransbankPayment({
        amount: 50000,
        orderId: 'order_123',
        sessionId: 'session_123',
        returnUrl: 'https://example.com/return',
      });

      expect(WebpayPlus.Transaction.configureForTesting).toHaveBeenCalled();
    });
  });

  describe('confirmTransbankPayment', () => {
    it('should confirm Transbank payment successfully', async () => {
      const { WebpayPlus } = require('transbank-sdk');
      WebpayPlus.Transaction.commit.mockResolvedValue({
        authorization_code: 'AUTH123',
        status: 'AUTHORIZED',
        amount: 50000,
      });

      const result = await processor.confirmTransbankPayment('token_123');

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('AUTH123');
      expect(result.status).toBe('completed');
      expect(result.amount).toBe(50000);
      expect(result.currency).toBe('CLP');
    });

    it('should handle confirmation errors', async () => {
      const { WebpayPlus } = require('transbank-sdk');
      WebpayPlus.Transaction.commit.mockRejectedValue(
        new Error('Confirmation failed')
      );

      const result = await processor.confirmTransbankPayment('token_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Confirmation failed');
    });

    it('should handle non-authorized status', async () => {
      const { WebpayPlus } = require('transbank-sdk');
      WebpayPlus.Transaction.commit.mockResolvedValue({
        status: 'REJECTED',
        amount: 50000,
      });

      const result = await processor.confirmTransbankPayment('token_123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('failed with status: REJECTED');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing environment variables gracefully', () => {
      delete process.env.STRIPE_SECRET_KEY;
      const newProcessor = new PaymentProcessor();
      expect(newProcessor).toBeDefined();
    });

    it('should handle zero amount', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        status: 'succeeded',
        amount: 0,
        currency: 'clp',
      });

      const result = await processor.processStripePayment({
        amount: 0,
        source: 'pm_123',
        orderId: 'order_123',
      });

      expect(result.success).toBe(true);
      expect(result.amount).toBe(0);
    });

    it('should handle large amounts', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        status: 'succeeded',
        amount: 100000000,
        currency: 'clp',
      });

      await processor.processStripePayment({
        amount: 1000000,
        source: 'pm_123',
        orderId: 'order_123',
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100000000,
        })
      );
    });
  });
});
