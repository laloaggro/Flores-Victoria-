const crypto = require('crypto');

const express = require('express');
const client = require('prom-client');

// Port Manager Integration (optional for Docker)
let PortManager;
try {
  PortManager = require('./scripts/port-manager');
} catch (e) {
  // PortManager not available (Docker environment)
  PortManager = null;
}

const environment = process.env.NODE_ENV || 'development';
let PORT;

if (PortManager) {
  try {
    const portManager = new PortManager();
    PORT = portManager.getPort('payment-service', environment);
  } catch (error) {
    // Fallback chain: CLI args → env vars → default
    const cliPort = process.argv.find((arg) => arg.startsWith('--port='));
    PORT = cliPort ? parseInt(cliPort.split('=')[1]) : process.env.PAYMENT_SERVICE_PORT || 3018;
  }
} else {
  // Docker or no PortManager: use env vars directly
  const cliPort = process.argv.find((arg) => arg.startsWith('--port='));
  PORT = cliPort
    ? parseInt(cliPort.split('=')[1])
    : process.env.PAYMENT_SERVICE_PORT || process.env.PORT || 3018;
}

const app = express();
app.use(express.json());

// Prometheus Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const paymentsTotal = new client.Counter({
  name: 'payments_total',
  help: 'Total number of payment transactions',
  labelNames: ['status', 'method', 'currency'],
  registers: [register],
});

const paymentsAmount = new client.Counter({
  name: 'payments_amount_total',
  help: 'Total amount of payments processed',
  labelNames: ['currency', 'method'],
  registers: [register],
});

const paymentProcessingDuration = new client.Histogram({
  name: 'payment_processing_duration_seconds',
  help: 'Duration of payment processing',
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

const pendingPayments = new client.Gauge({
  name: 'payments_pending',
  help: 'Number of pending payments',
  registers: [register],
});

const refundsTotal = new client.Counter({
  name: 'refunds_total',
  help: 'Total number of refunds processed',
  labelNames: ['status'],
  registers: [register],
});

// Payment Configuration
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'MXN', 'CLP'];
const SUPPORTED_METHODS = ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'];

// In-memory payment store (replace with database in production)
const payments = new Map();
const refunds = new Map();

// Payment status enum
const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

// Generate transaction ID
const generateTransactionId = () =>
  `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// Simulate payment processing (replace with real payment gateway)
const processPaymentGateway = async (payment) =>
  new Promise((resolve) => {
    // Simulate network delay
    const delay = Math.random() * 2000 + 500; // 500-2500ms

    setTimeout(() => {
      // 90% success rate simulation
      const success = Math.random() > 0.1;

      if (success) {
        resolve({
          success: true,
          gatewayTransactionId: `GTW-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
          processedAt: new Date().toISOString(),
        });
      } else {
        resolve({
          success: false,
          error: 'Payment declined by gateway',
          code: 'DECLINED',
        });
      }
    }, delay);
  });

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'payment-service',
    environment,
    port: PORT,
    timestamp: new Date().toISOString(),
    metrics: {
      totalPayments: payments.size,
      totalRefunds: refunds.size,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      supportedMethods: SUPPORTED_METHODS,
    },
  });
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// POST /payments - Create new payment
app.post('/payments', async (req, res) => {
  const timer = paymentProcessingDuration.startTimer();

  try {
    const { amount, currency, method, customer, metadata } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      paymentsTotal.inc({
        status: 'validation_error',
        method: method || 'unknown',
        currency: currency || 'unknown',
      });
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!currency || !SUPPORTED_CURRENCIES.includes(currency)) {
      paymentsTotal.inc({
        status: 'validation_error',
        method: method || 'unknown',
        currency: currency || 'unknown',
      });
      return res.status(400).json({
        error: 'Invalid currency',
        supported: SUPPORTED_CURRENCIES,
      });
    }

    if (!method || !SUPPORTED_METHODS.includes(method)) {
      paymentsTotal.inc({ status: 'validation_error', method: method || 'unknown', currency });
      return res.status(400).json({
        error: 'Invalid payment method',
        supported: SUPPORTED_METHODS,
      });
    }

    // Create payment record
    const transactionId = generateTransactionId();
    const payment = {
      transactionId,
      amount,
      currency,
      method,
      customer: customer || {},
      metadata: metadata || {},
      status: PaymentStatus.PROCESSING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    payments.set(transactionId, payment);
    pendingPayments.inc();
    paymentsTotal.inc({ status: 'initiated', method, currency });

    // Process payment through gateway
    const gatewayResult = await processPaymentGateway(payment);

    // Update payment status
    if (gatewayResult.success) {
      payment.status = PaymentStatus.COMPLETED;
      payment.gatewayTransactionId = gatewayResult.gatewayTransactionId;
      payment.processedAt = gatewayResult.processedAt;
      payment.updatedAt = new Date().toISOString();

      paymentsTotal.inc({ status: 'success', method, currency });
      paymentsAmount.inc({ currency, method }, amount);
      pendingPayments.dec();

      timer();

      res.status(201).json({
        success: true,
        message: 'Payment processed successfully',
        payment: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          processedAt: payment.processedAt,
        },
      });
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.errorCode = gatewayResult.code;
      payment.errorMessage = gatewayResult.error;
      payment.updatedAt = new Date().toISOString();

      paymentsTotal.inc({ status: 'failed', method, currency });
      pendingPayments.dec();

      timer();

      res.status(402).json({
        success: false,
        error: 'Payment failed',
        payment: {
          transactionId: payment.transactionId,
          status: payment.status,
          errorCode: payment.errorCode,
          errorMessage: payment.errorMessage,
        },
      });
    }
  } catch (error) {
    pendingPayments.dec();
    paymentsTotal.inc({ status: 'error', method: 'unknown', currency: 'unknown' });
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// GET /payments/:id - Get payment details
app.get('/payments/:id', (req, res) => {
  const { id } = req.params;
  const payment = payments.get(id);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  res.json({
    transactionId: payment.transactionId,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    customer: payment.customer,
    metadata: payment.metadata,
    createdAt: payment.createdAt,
    processedAt: payment.processedAt,
    gatewayTransactionId: payment.gatewayTransactionId,
  });
});

// GET /payments - List all payments
app.get('/payments', (req, res) => {
  const { status, method, currency, limit = 50, offset = 0 } = req.query;

  let paymentList = Array.from(payments.values());

  // Filters
  if (status) {
    paymentList = paymentList.filter((p) => p.status === status);
  }
  if (method) {
    paymentList = paymentList.filter((p) => p.method === method);
  }
  if (currency) {
    paymentList = paymentList.filter((p) => p.currency === currency);
  }

  // Pagination
  const total = paymentList.length;
  const paginatedList = paymentList
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
    .map((p) => ({
      transactionId: p.transactionId,
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      status: p.status,
      createdAt: p.createdAt,
    }));

  res.json({
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    payments: paginatedList,
  });
});

// POST /payments/:id/refund - Refund a payment
app.post('/payments/:id/refund', async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const payment = payments.get(id);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  if (payment.status !== PaymentStatus.COMPLETED) {
    refundsTotal.inc({ status: 'invalid_status' });
    return res.status(400).json({
      error: 'Only completed payments can be refunded',
      currentStatus: payment.status,
    });
  }

  if (payment.status === PaymentStatus.REFUNDED) {
    refundsTotal.inc({ status: 'already_refunded' });
    return res.status(400).json({ error: 'Payment already refunded' });
  }

  const refundAmount = amount || payment.amount;
  if (refundAmount > payment.amount) {
    refundsTotal.inc({ status: 'invalid_amount' });
    return res.status(400).json({
      error: 'Refund amount cannot exceed payment amount',
      maxRefund: payment.amount,
    });
  }

  // Create refund record
  const refundId = `RFD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const refund = {
    refundId,
    transactionId: id,
    amount: refundAmount,
    currency: payment.currency,
    reason: reason || 'Customer request',
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  refunds.set(refundId, refund);

  // Update payment status
  payment.status = PaymentStatus.REFUNDED;
  payment.refundId = refundId;
  payment.updatedAt = new Date().toISOString();

  refundsTotal.inc({ status: 'success' });
  paymentsAmount.inc({ currency: payment.currency, method: payment.method }, -refundAmount);

  res.json({
    success: true,
    message: 'Refund processed successfully',
    refund: {
      refundId: refund.refundId,
      transactionId: refund.transactionId,
      amount: refund.amount,
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status,
    },
  });
});

// GET /refunds/:id - Get refund details
app.get('/refunds/:id', (req, res) => {
  const { id } = req.params;
  const refund = refunds.get(id);

  if (!refund) {
    return res.status(404).json({ error: 'Refund not found' });
  }

  res.json(refund);
});

// GET /stats - Get payment statistics
app.get('/stats', (req, res) => {
  const allPayments = Array.from(payments.values());

  const stats = {
    total: {
      payments: allPayments.length,
      refunds: refunds.size,
    },
    byStatus: {},
    byMethod: {},
    byCurrency: {},
    totalAmount: {},
  };

  // Calculate stats
  allPayments.forEach((payment) => {
    // By status
    stats.byStatus[payment.status] = (stats.byStatus[payment.status] || 0) + 1;

    // By method
    stats.byMethod[payment.method] = (stats.byMethod[payment.method] || 0) + 1;

    // By currency
    stats.byCurrency[payment.currency] = (stats.byCurrency[payment.currency] || 0) + 1;

    // Total amount by currency
    if (payment.status === PaymentStatus.COMPLETED) {
      stats.totalAmount[payment.currency] =
        (stats.totalAmount[payment.currency] || 0) + payment.amount;
    }
  });

  res.json(stats);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         💳 PAYMENT SERVICE - Flores Victoria             ║
╚═══════════════════════════════════════════════════════════╝

  Environment: ${environment}
  Port:        ${PORT}
  Health:      http://localhost:${PORT}/health
  Metrics:     http://localhost:${PORT}/metrics

  📋 Available Endpoints:
  ├─ POST   /payments           - Create payment
  ├─ GET    /payments           - List payments (with filters)
  ├─ GET    /payments/:id       - Get payment details
  ├─ POST   /payments/:id/refund - Process refund
  ├─ GET    /refunds/:id        - Get refund details
  └─ GET    /stats              - Payment statistics

  💰 Supported Currencies:
  ${SUPPORTED_CURRENCIES.join(', ')}

  💳 Supported Payment Methods:
  ${SUPPORTED_METHODS.join(', ')}

  📊 Metrics:
  ├─ payments_total
  ├─ payments_amount_total
  ├─ payment_processing_duration_seconds
  ├─ payments_pending
  └─ refunds_total

  ⚠️  Demo Mode: Using simulated payment gateway
     90% success rate for testing purposes
`);
});

module.exports = { app, PaymentStatus };
