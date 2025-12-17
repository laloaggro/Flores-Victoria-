/* eslint-disable no-console */
/**
 * Stripe Webhooks Handler
 * Handles payment events from Stripe
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe');

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
    console.warn('Stripe not configured, ignoring webhook');
    return res.status(200).json({ received: true, configured: false });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    if (webhookSecret && sig) {
      event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For development without webhook secret
      event = req.body;
      console.warn('⚠️ Webhook signature not verified (development mode)');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log(`📩 Received Stripe event: ${event.type}`);

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
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, type: event.type });
  } catch (error) {
    console.error('Error handling webhook:', error);
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
  // eslint-disable-next-line no-console
  console.log('✅ Payment succeeded:', paymentIntent.id);

  const { orderId, customerEmail: _customerEmail } = paymentIntent.metadata;

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

  console.log(`Order ${orderId} marked as paid`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  // eslint-disable-next-line no-console
  console.log('❌ Payment failed:', paymentIntent.id);

  const { orderId, customerEmail: _customerEmail } = paymentIntent.metadata;
  const error = paymentIntent.last_payment_error;

  // TODO: Update order status
  // await updateOrderStatus(orderId, 'payment_failed');

  // TODO: Send failure notification email
  // await sendPaymentFailedEmail(customerEmail, {
  //   orderId,
  //   reason: error?.message || 'Unknown error',
  // });

  console.log(`Payment failed for order ${orderId}: ${error?.message}`);
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent) {
  console.log('🚫 Payment canceled:', paymentIntent.id);

  const { orderId } = paymentIntent.metadata;

  // TODO: Update order status
  // await updateOrderStatus(orderId, 'canceled');

  // TODO: Release reserved inventory
  // await releaseInventory(orderId);

  console.log(`Order ${orderId} canceled`);
}

/**
 * Handle refund
 */
async function handleChargeRefunded(charge) {
  console.log('💸 Charge refunded:', charge.id);

  const { orderId } = charge.metadata || {};
  const refundAmount = charge.amount_refunded / 100;

  // TODO: Update order with refund info
  // await updateOrderRefund(orderId, refundAmount);

  // TODO: Send refund confirmation email
  // await sendRefundConfirmationEmail(charge.receipt_email, {
  //   orderId,
  //   amount: refundAmount,
  // });

  console.log(`Refund of ${refundAmount} processed for order ${orderId}`);
}

/**
 * Handle new customer
 */
async function handleCustomerCreated(customer) {
  console.log('👤 Customer created:', customer.id);

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
  console.log('📄 Invoice paid:', invoice.id);

  // TODO: Handle subscription or recurring payments
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);

  // TODO: Handle subscription payment failure
  // - Send notification to customer
  // - Potentially pause subscription
}

module.exports = router;
