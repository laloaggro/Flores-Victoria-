/**
 * Payment Service Routes
 * Handles Stripe, PayPal, and Transbank payments
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe');

// Initialize Stripe (only if key exists)
const stripeClient = process.env.STRIPE_SECRET_KEY ? stripe(process.env.STRIPE_SECRET_KEY) : null;

// ═══════════════════════════════════════════════════════════════
// STRIPE PAYMENT INTENTS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a payment intent for Stripe
 * POST /api/payments/create-intent
 */
router.post('/create-intent', async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(503).json({
        success: false,
        error: 'Stripe no está configurado',
        code: 'STRIPE_NOT_CONFIGURED',
      });
    }

    const {
      amount,
      currency = 'clp',
      customerEmail,
      orderId,
      description,
      metadata = {},
    } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Monto inválido',
        code: 'INVALID_AMOUNT',
      });
    }

    // Create payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      receipt_email: customerEmail,
      description: description || `Flores Victoria - Pedido #${orderId}`,
      metadata: {
        orderId: orderId || 'unknown',
        service: 'flores-victoria',
        customerEmail: customerEmail || '',
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'STRIPE_ERROR',
    });
  }
});

/**
 * Confirm a payment intent
 * POST /api/payments/confirm
 */
router.post('/confirm', async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(503).json({
        success: false,
        error: 'Stripe no está configurado',
      });
    }

    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'paymentIntentId es requerido',
      });
    }

    const paymentIntent = await stripeClient.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    res.json({
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
      requiresAction: paymentIntent.status === 'requires_action',
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get payment status
 * GET /api/payments/:paymentIntentId
 */
router.get('/:paymentIntentId', async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(503).json({
        success: false,
        error: 'Stripe no está configurado',
      });
    }

    const { paymentIntentId } = req.params;
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(404).json({
      success: false,
      error: 'Pago no encontrado',
    });
  }
});

/**
 * Cancel a payment intent
 * POST /api/payments/:paymentIntentId/cancel
 */
router.post('/:paymentIntentId/cancel', async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(503).json({
        success: false,
        error: 'Stripe no está configurado',
      });
    }

    const { paymentIntentId } = req.params;
    const paymentIntent = await stripeClient.paymentIntents.cancel(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      message: 'Pago cancelado exitosamente',
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Create a refund
 * POST /api/payments/:paymentIntentId/refund
 */
router.post('/:paymentIntentId/refund', async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(503).json({
        success: false,
        error: 'Stripe no está configurado',
      });
    }

    const { paymentIntentId } = req.params;
    const { amount, reason } = req.body;

    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundData.reason = reason; // duplicate, fraudulent, requested_by_customer
    }

    const refund = await stripeClient.refunds.create(refundData);

    res.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      message: 'Reembolso procesado exitosamente',
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// STRIPE CUSTOMERS
// ═══════════════════════════════════════════════════════════════

/**
 * Create or get Stripe customer
 * POST /api/payments/customers
 */
router.post('/customers', async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(503).json({
        success: false,
        error: 'Stripe no está configurado',
      });
    }

    const { email, name, phone, metadata = {} } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email es requerido',
      });
    }

    // Check if customer exists
    const existingCustomers = await stripeClient.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return res.json({
        success: true,
        customerId: existingCustomers.data[0].id,
        isNew: false,
      });
    }

    // Create new customer
    const customer = await stripeClient.customers.create({
      email,
      name,
      phone,
      metadata: {
        service: 'flores-victoria',
        ...metadata,
      },
    });

    res.status(201).json({
      success: true,
      customerId: customer.id,
      isNew: true,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT METHODS (List saved cards, etc.)
// ═══════════════════════════════════════════════════════════════

/**
 * List payment methods for a customer
 * GET /api/payments/customers/:customerId/methods
 */
router.get('/customers/:customerId/methods', async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(503).json({
        success: false,
        error: 'Stripe no está configurado',
      });
    }

    const { customerId } = req.params;

    const paymentMethods = await stripeClient.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.json({
      success: true,
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      })),
    });
  } catch (error) {
    console.error('List payment methods error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// MOCK PAYMENT (For development/testing)
// ═══════════════════════════════════════════════════════════════

/**
 * Mock payment for testing
 * POST /api/payments/mock
 */
router.post('/mock', async (req, res) => {
  const { amount, orderId, customerEmail, shouldFail = false } = req.body;

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (shouldFail) {
    return res.status(400).json({
      success: false,
      error: 'Pago simulado fallido',
      code: 'MOCK_PAYMENT_FAILED',
    });
  }

  const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    paymentId: mockPaymentId,
    amount,
    currency: 'clp',
    status: 'completed',
    orderId,
    customerEmail,
    message: '⚠️ Este es un pago simulado para desarrollo',
    transactionData: {
      id: mockPaymentId,
      object: 'mock_payment',
      amount: amount * 100,
      currency: 'clp',
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000),
    },
  });
});

module.exports = router;
