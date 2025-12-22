/**
 * Stripe Webhooks Handler
 * Handles payment events from Stripe
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe');
const logger = require('../logger');

// Initialize Stripe
const stripeClient = process.env.STRIPE_SECRET_KEY ? stripe(process.env.STRIPE_SECRET_KEY) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe Webhook Endpoint
 * POST /api/webhooks/stripe
 *
 * Note: This route must use express.raw() middleware for signature verification
 */
router.post('/stripe', async (req, res) => {
  if (!stripeClient) {
    logger.warn('Stripe not configured, ignoring webhook');
    return res.status(200).json({ received: true, configured: false });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // En producción, SIEMPRE verificar firma
    const isProduction = process.env.NODE_ENV === 'production';

    if (!webhookSecret && isProduction) {
      logger.error('STRIPE_WEBHOOK_SECRET no configurado en producción');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!sig && isProduction) {
      logger.error('Falta stripe-signature header');
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Verify webhook signature
    if (webhookSecret && sig) {
      event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else if (!isProduction) {
      // Solo en desarrollo sin webhook secret
      event = req.body;
      logger.warn('⚠️ Webhook signature not verified (DEVELOPMENT MODE ONLY)');
    } else {
      return res.status(400).json({ error: 'Invalid webhook request' });
    }
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  logger.info('Received Stripe event', { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        logger.debug('Unhandled event type', { type: event.type });
    }

    res.json({ received: true, type: event.type });
  } catch (error) {
    logger.error('Error handling webhook', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ═══════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent) {
  const { orderId, customerEmail: _customerEmail } = paymentIntent.metadata;

  logger.info('Payment succeeded', {
    paymentId: paymentIntent.id,
    orderId,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  });

  // TODO: Update order status in database
  // await updateOrderStatus(orderId, 'paid');

  // TODO: Send confirmation email
  // await sendPaymentConfirmationEmail(customerEmail, {
  //   orderId,
  //   amount: paymentIntent.amount / 100,
  //   currency: paymentIntent.currency,
  // });

  // TODO: Notify notification service
  // await notifyService('order.paid', { orderId, paymentId: paymentIntent.id });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  const { orderId, customerEmail: _customerEmail } = paymentIntent.metadata;
  const error = paymentIntent.last_payment_error;

  logger.warn('Payment failed', {
    paymentId: paymentIntent.id,
    orderId,
    error: error?.message || 'Unknown error',
    code: error?.code,
  });

  // TODO: Update order status
  // await updateOrderStatus(orderId, 'payment_failed');

  // TODO: Send failure notification email
  // await sendPaymentFailedEmail(customerEmail, {
  //   orderId,
  //   reason: error?.message || 'Unknown error',
  // });
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent) {
  const { orderId } = paymentIntent.metadata;

  logger.info('Payment canceled', {
    paymentId: paymentIntent.id,
    orderId,
  });

  // TODO: Update order status
  // await updateOrderStatus(orderId, 'canceled');

  // TODO: Release reserved inventory
  // await releaseInventory(orderId);
}

/**
 * Handle refund
 */
async function handleChargeRefunded(charge) {
  const { orderId } = charge.metadata || {};
  const refundAmount = charge.amount_refunded / 100;

  logger.info('Charge refunded', {
    chargeId: charge.id,
    orderId,
    refundAmount,
    currency: charge.currency,
  });

  // TODO: Update order with refund info
  // await updateOrderRefund(orderId, refundAmount);

  // TODO: Send refund confirmation email
  // await sendRefundConfirmationEmail(charge.receipt_email, {
  //   orderId,
  //   amount: refundAmount,
  // });
}

/**
 * Handle new customer
 */
async function handleCustomerCreated(customer) {
  logger.info('Customer created', {
    customerId: customer.id,
    email: customer.email,
  });

  // TODO: Sync customer with internal database
  // await syncCustomer({
  //   stripeCustomerId: customer.id,
  //   email: customer.email,
  //   name: customer.name,
  // });
}

/**
 * Handle paid invoice
 */
async function handleInvoicePaid(invoice) {
  logger.info('Invoice paid', {
    invoiceId: invoice.id,
    amount: invoice.amount_paid / 100,
    customerId: invoice.customer,
  });

  // TODO: Handle subscription or recurring payments
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice) {
  logger.warn('Invoice payment failed', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    attemptCount: invoice.attempt_count,
  });

  // TODO: Handle subscription payment failure
  // - Send notification to customer
  // - Potentially pause subscription
}

module.exports = router;
