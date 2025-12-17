/**
 * Tests completos para Payment Service Routes
 * Cobertura: Stripe, PayPal, Mock payments
 */

const request = require('supertest');
const express = require('express');

// Mock de Stripe
const mockPaymentIntentsCreate = jest.fn();
const mockPaymentIntentsConfirm = jest.fn();
const mockPaymentIntentsRetrieve = jest.fn();
const mockPaymentIntentsCancel = jest.fn();
const mockRefundsCreate = jest.fn();
const mockCustomersCreate = jest.fn();
const mockCustomersList = jest.fn();
const mockPaymentMethodsList = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: mockPaymentIntentsCreate,
      confirm: mockPaymentIntentsConfirm,
      retrieve: mockPaymentIntentsRetrieve,
      cancel: mockPaymentIntentsCancel,
    },
    refunds: {
      create: mockRefundsCreate,
    },
    customers: {
      create: mockCustomersCreate,
      list: mockCustomersList,
    },
    paymentMethods: {
      list: mockPaymentMethodsList,
    },
  }));
});

// Crear app de pruebas
const createTestApp = (stripeConfigured = true) => {
  // Reset modules para poder cambiar la configuración de Stripe
  jest.resetModules();

  if (stripeConfigured) {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
  } else {
    delete process.env.STRIPE_SECRET_KEY;
  }

  const app = express();
  app.use(express.json());

  // Re-require el router después de configurar env
  const paymentsRouter = require('../routes/payments');
  app.use('/api/payments', paymentsRouter);

  return app;
};

describe('Payment Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp(true);
  });

  // ═══════════════════════════════════════════════════════════════
  // CREATE PAYMENT INTENT
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/payments/create-intent', () => {
    const validPaymentData = {
      amount: 15000,
      currency: 'clp',
      customerEmail: 'test@example.com',
      orderId: 'ORDER-123',
      description: 'Test payment',
    };

    it('should create payment intent successfully', async () => {
      mockPaymentIntentsCreate.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 1500000,
        currency: 'clp',
      });

      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(validPaymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.clientSecret).toBe('pi_test_123_secret_abc');
      expect(response.body.paymentIntentId).toBe('pi_test_123');
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1500000,
          currency: 'clp',
        })
      );
    });

    it('should return 400 when amount is missing', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .send({ currency: 'clp' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_AMOUNT');
    });

    it('should return 400 when amount is negative', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .send({ amount: -100 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_AMOUNT');
    });

    it('should return 400 when amount is zero', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .send({ amount: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle Stripe errors gracefully', async () => {
      mockPaymentIntentsCreate.mockRejectedValue(new Error('Stripe API error'));

      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(validPaymentData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Stripe API error');
    });

    it('should use default currency when not provided', async () => {
      mockPaymentIntentsCreate.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'secret',
        amount: 1000000,
        currency: 'clp',
      });

      await request(app).post('/api/payments/create-intent').send({ amount: 10000 }).expect(200);

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'clp',
        })
      );
    });

    it('should include metadata in payment intent', async () => {
      mockPaymentIntentsCreate.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'secret',
        amount: 1000000,
        currency: 'clp',
      });

      await request(app)
        .post('/api/payments/create-intent')
        .send({
          ...validPaymentData,
          metadata: { customField: 'value' },
        })
        .expect(200);

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            customField: 'value',
            service: 'flores-victoria',
          }),
        })
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CONFIRM PAYMENT
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/payments/confirm', () => {
    it('should confirm payment successfully', async () => {
      mockPaymentIntentsConfirm.mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        client_secret: 'secret',
      });

      const response = await request(app)
        .post('/api/payments/confirm')
        .send({
          paymentIntentId: 'pi_test_123',
          paymentMethodId: 'pm_card_visa',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('succeeded');
    });

    it('should return 400 when paymentIntentId is missing', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .send({ paymentMethodId: 'pm_card_visa' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('paymentIntentId es requerido');
    });

    it('should handle requires_action status', async () => {
      mockPaymentIntentsConfirm.mockResolvedValue({
        id: 'pi_test_123',
        status: 'requires_action',
        client_secret: 'secret_for_3ds',
      });

      const response = await request(app)
        .post('/api/payments/confirm')
        .send({
          paymentIntentId: 'pi_test_123',
          paymentMethodId: 'pm_card_visa',
        })
        .expect(200);

      expect(response.body.requiresAction).toBe(true);
      expect(response.body.success).toBe(false);
    });

    it('should handle Stripe confirmation errors', async () => {
      mockPaymentIntentsConfirm.mockRejectedValue(new Error('Card declined'));

      const response = await request(app)
        .post('/api/payments/confirm')
        .send({
          paymentIntentId: 'pi_test_123',
          paymentMethodId: 'pm_card_visa',
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Card declined');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GET PAYMENT STATUS
  // ═══════════════════════════════════════════════════════════════

  describe('GET /api/payments/:paymentIntentId', () => {
    it('should retrieve payment status successfully', async () => {
      mockPaymentIntentsRetrieve.mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 1500000,
        currency: 'clp',
        metadata: { orderId: 'ORDER-123' },
        created: 1700000000,
      });

      const response = await request(app).get('/api/payments/pi_test_123').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('succeeded');
      expect(response.body.amount).toBe(15000);
      expect(response.body.currency).toBe('clp');
    });

    it('should return 404 when payment not found', async () => {
      mockPaymentIntentsRetrieve.mockRejectedValue(new Error('No such payment_intent'));

      const response = await request(app).get('/api/payments/pi_invalid').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Pago no encontrado');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CANCEL PAYMENT
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/payments/:paymentIntentId/cancel', () => {
    it('should cancel payment successfully', async () => {
      mockPaymentIntentsCancel.mockResolvedValue({
        id: 'pi_test_123',
        status: 'canceled',
      });

      const response = await request(app).post('/api/payments/pi_test_123/cancel').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('canceled');
      expect(response.body.message).toBe('Pago cancelado exitosamente');
    });

    it('should handle cancellation errors', async () => {
      mockPaymentIntentsCancel.mockRejectedValue(new Error('Cannot cancel payment'));

      const response = await request(app).post('/api/payments/pi_test_123/cancel').expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // REFUNDS
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/payments/:paymentIntentId/refund', () => {
    it('should create full refund successfully', async () => {
      mockRefundsCreate.mockResolvedValue({
        id: 're_test_123',
        amount: 1500000,
        status: 'succeeded',
      });

      const response = await request(app)
        .post('/api/payments/pi_test_123/refund')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.refundId).toBe('re_test_123');
      expect(response.body.amount).toBe(15000);
    });

    it('should create partial refund', async () => {
      mockRefundsCreate.mockResolvedValue({
        id: 're_test_123',
        amount: 500000,
        status: 'succeeded',
      });

      const response = await request(app)
        .post('/api/payments/pi_test_123/refund')
        .send({ amount: 5000 })
        .expect(200);

      expect(mockRefundsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500000,
        })
      );
    });

    it('should include reason in refund', async () => {
      mockRefundsCreate.mockResolvedValue({
        id: 're_test_123',
        amount: 1500000,
        status: 'succeeded',
      });

      await request(app)
        .post('/api/payments/pi_test_123/refund')
        .send({ reason: 'requested_by_customer' })
        .expect(200);

      expect(mockRefundsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'requested_by_customer',
        })
      );
    });

    it('should handle refund errors', async () => {
      mockRefundsCreate.mockRejectedValue(new Error('Refund already exists'));

      const response = await request(app)
        .post('/api/payments/pi_test_123/refund')
        .send({})
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CUSTOMERS
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/payments/customers', () => {
    it('should create new customer', async () => {
      mockCustomersList.mockResolvedValue({ data: [] });
      mockCustomersCreate.mockResolvedValue({
        id: 'cus_test_123',
      });

      const response = await request(app)
        .post('/api/payments/customers')
        .send({
          email: 'new@example.com',
          name: 'Test User',
          phone: '+56912345678',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.customerId).toBe('cus_test_123');
      expect(response.body.isNew).toBe(true);
    });

    it('should return existing customer', async () => {
      mockCustomersList.mockResolvedValue({
        data: [{ id: 'cus_existing_123' }],
      });

      const response = await request(app)
        .post('/api/payments/customers')
        .send({ email: 'existing@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.customerId).toBe('cus_existing_123');
      expect(response.body.isNew).toBe(false);
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/payments/customers')
        .send({ name: 'Test User' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email es requerido');
    });

    it('should include metadata in customer creation', async () => {
      mockCustomersList.mockResolvedValue({ data: [] });
      mockCustomersCreate.mockResolvedValue({ id: 'cus_test_123' });

      await request(app)
        .post('/api/payments/customers')
        .send({
          email: 'test@example.com',
          metadata: { userId: 'user_123' },
        })
        .expect(201);

      expect(mockCustomersCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            userId: 'user_123',
            service: 'flores-victoria',
          }),
        })
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PAYMENT METHODS
  // ═══════════════════════════════════════════════════════════════

  describe('GET /api/payments/customers/:customerId/methods', () => {
    it('should list payment methods', async () => {
      mockPaymentMethodsList.mockResolvedValue({
        data: [
          {
            id: 'pm_test_123',
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2025,
            },
          },
          {
            id: 'pm_test_456',
            card: {
              brand: 'mastercard',
              last4: '8888',
              exp_month: 6,
              exp_year: 2026,
            },
          },
        ],
      });

      const response = await request(app)
        .get('/api/payments/customers/cus_test_123/methods')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.paymentMethods).toHaveLength(2);
      expect(response.body.paymentMethods[0]).toEqual({
        id: 'pm_test_123',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
      });
    });

    it('should return empty array when no methods', async () => {
      mockPaymentMethodsList.mockResolvedValue({ data: [] });

      const response = await request(app)
        .get('/api/payments/customers/cus_test_123/methods')
        .expect(200);

      expect(response.body.paymentMethods).toHaveLength(0);
    });

    it('should handle list errors', async () => {
      mockPaymentMethodsList.mockRejectedValue(new Error('Invalid customer'));

      const response = await request(app)
        .get('/api/payments/customers/invalid/methods')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MOCK PAYMENT
  // ═══════════════════════════════════════════════════════════════

  describe('POST /api/payments/mock', () => {
    it('should process mock payment successfully', async () => {
      const response = await request(app)
        .post('/api/payments/mock')
        .send({
          amount: 15000,
          orderId: 'ORDER-123',
          customerEmail: 'test@example.com',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(15000);
      expect(response.body.status).toBe('completed');
      expect(response.body.paymentId).toMatch(/^mock_/);
    });

    it('should fail mock payment when shouldFail is true', async () => {
      const response = await request(app)
        .post('/api/payments/mock')
        .send({
          amount: 15000,
          shouldFail: true,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MOCK_PAYMENT_FAILED');
    });

    it('should include transaction data', async () => {
      const response = await request(app)
        .post('/api/payments/mock')
        .send({ amount: 10000 })
        .expect(200);

      expect(response.body.transactionData).toBeDefined();
      expect(response.body.transactionData.object).toBe('mock_payment');
      expect(response.body.transactionData.status).toBe('succeeded');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // STRIPE NOT CONFIGURED
  // ═══════════════════════════════════════════════════════════════

  describe('Stripe not configured', () => {
    beforeEach(() => {
      app = createTestApp(false);
    });

    it('should return 503 for create-intent', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .send({ amount: 15000 })
        .expect(503);

      expect(response.body.code).toBe('STRIPE_NOT_CONFIGURED');
    });

    it('should return 503 for confirm', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .send({ paymentIntentId: 'pi_test' })
        .expect(503);

      expect(response.body.success).toBe(false);
    });

    it('should return 503 for get payment', async () => {
      const response = await request(app).get('/api/payments/pi_test_123').expect(503);

      expect(response.body.success).toBe(false);
    });

    it('should return 503 for cancel', async () => {
      const response = await request(app).post('/api/payments/pi_test_123/cancel').expect(503);

      expect(response.body.success).toBe(false);
    });

    it('should return 503 for refund', async () => {
      const response = await request(app)
        .post('/api/payments/pi_test_123/refund')
        .send({})
        .expect(503);

      expect(response.body.success).toBe(false);
    });

    it('should return 503 for customers', async () => {
      const response = await request(app)
        .post('/api/payments/customers')
        .send({ email: 'test@example.com' })
        .expect(503);

      expect(response.body.success).toBe(false);
    });

    it('should return 503 for payment methods', async () => {
      const response = await request(app)
        .get('/api/payments/customers/cus_123/methods')
        .expect(503);

      expect(response.body.success).toBe(false);
    });

    it('mock payment should still work', async () => {
      const response = await request(app)
        .post('/api/payments/mock')
        .send({ amount: 15000 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
