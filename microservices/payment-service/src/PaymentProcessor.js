/**
 * Sistema de Pagos Integral para Flores Victoria
 * Soporte para Stripe, PayPal y Transbank (Chile)
 */

const paypal = require('@paypal/checkout-server-sdk');
const stripe = require('stripe');

class PaymentProcessor {
  constructor() {
    // Configuración de Stripe
    this.stripe = stripe(process.env.STRIPE_SECRET_KEY);

    // Configuración de PayPal
    this.paypalEnvironment =
      process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
          )
        : new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
          );

    this.paypalClient = new paypal.core.PayPalHttpClient(this.paypalEnvironment);

    // Configuración de Transbank para Chile
    this.transbank = {
      commerceCode: process.env.TRANSBANK_COMMERCE_CODE,
      apiKey: process.env.TRANSBANK_API_KEY,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'integration',
    };
  }

  /**
   * Procesar pago con Stripe
   */
  async processStripePayment(paymentData) {
    try {
      const {
        amount,
        currency = 'clp',
        source,
        description,
        customerEmail,
        orderId,
        metadata = {},
      } = paymentData;

      // Crear Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency: currency.toLowerCase(),
        payment_method: source,
        confirmation_method: 'manual',
        confirm: true,
        description: `Flores Victoria - Order #${orderId}`,
        receipt_email: customerEmail,
        metadata: {
          orderId,
          service: 'flores-victoria',
          ...metadata,
        },
      });

      // Manejar estados del payment intent
      if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      } else if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: 'completed',
          transactionData: paymentIntent,
        };
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'STRIPE_ERROR',
      };
    }
  }

  /**
   * Confirmar pago de Stripe (para 3D Secure)
   */
  async confirmStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      console.error('Stripe confirmation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Procesar pago con PayPal
   */
  async processPayPalPayment(paymentData) {
    try {
      const { amount, currency = 'USD', orderId, description, returnUrl, cancelUrl } = paymentData;

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            description: description || `Flores Victoria - Order #${orderId}`,
            amount: {
              currency_code: currency.toUpperCase(),
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Flores Victoria',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      });

      const order = await this.paypalClient.execute(request);

      return {
        success: true,
        paymentId: order.result.id,
        approvalUrl: order.result.links.find((link) => link.rel === 'approve')?.href,
        status: 'pending_approval',
        orderData: order.result,
      };
    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        error: error.message,
        code: 'PAYPAL_ERROR',
      };
    }
  }

  /**
   * Capturar pago de PayPal después de aprobación
   */
  async capturePayPalPayment(paypalOrderId) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
      request.requestBody({});

      const capture = await this.paypalClient.execute(request);

      if (capture.result.status === 'COMPLETED') {
        return {
          success: true,
          paymentId: capture.result.id,
          status: 'completed',
          amount: parseFloat(capture.result.purchase_units[0].payments.captures[0].amount.value),
          currency: capture.result.purchase_units[0].payments.captures[0].amount.currency_code,
          transactionData: capture.result,
        };
      } else {
        throw new Error(`PayPal capture failed with status: ${capture.result.status}`);
      }
    } catch (error) {
      console.error('PayPal capture error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Procesar pago con Transbank (Chile)
   */
  async processTransbankPayment(paymentData) {
    try {
      const { amount, orderId, returnUrl, sessionId } = paymentData;

      // Configuración de Transbank WebPay Plus
      const WebpayPlus = require('transbank-sdk').WebpayPlus;
      const Transaction = WebpayPlus.Transaction;

      // Configurar ambiente
      if (this.transbank.environment === 'production') {
        Transaction.configureForProduction(this.transbank.commerceCode, this.transbank.apiKey);
      } else {
        Transaction.configureForTesting();
      }

      // Crear transacción
      const createResponse = await Transaction.create(
        orderId, // buyOrder
        sessionId, // sessionId
        Math.round(amount), // amount (en pesos chilenos)
        returnUrl // returnUrl
      );

      return {
        success: true,
        paymentId: createResponse.token,
        redirectUrl: `${createResponse.url}?token_ws=${createResponse.token}`,
        status: 'pending_payment',
        token: createResponse.token,
      };
    } catch (error) {
      console.error('Transbank payment error:', error);
      return {
        success: false,
        error: error.message,
        code: 'TRANSBANK_ERROR',
      };
    }
  }

  /**
   * Confirmar pago de Transbank
   */
  async confirmTransbankPayment(token) {
    try {
      const WebpayPlus = require('transbank-sdk').WebpayPlus;
      const Transaction = WebpayPlus.Transaction;

      // Configurar ambiente
      if (this.transbank.environment === 'production') {
        Transaction.configureForProduction(this.transbank.commerceCode, this.transbank.apiKey);
      } else {
        Transaction.configureForTesting();
      }

      // Confirmar transacción
      const confirmResponse = await Transaction.commit(token);

      if (confirmResponse.status === 'AUTHORIZED') {
        return {
          success: true,
          paymentId: confirmResponse.authorization_code,
          status: 'completed',
          amount: confirmResponse.amount,
          currency: 'CLP',
          transactionData: confirmResponse,
        };
      } else {
        throw new Error(`Transbank payment failed with status: ${confirmResponse.status}`);
      }
    } catch (error) {
      console.error('Transbank confirmation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Procesar reembolso
   */
  async processRefund(refundData) {
    try {
      const { paymentMethod, paymentId, amount, reason } = refundData;

      switch (paymentMethod) {
        case 'stripe':
          return await this.processStripeRefund(paymentId, amount, reason);
        case 'paypal':
          return await this.processPayPalRefund(paymentId, amount, reason);
        case 'transbank':
          return await this.processTransbankRefund(paymentId, amount, reason);
        default:
          throw new Error(`Método de reembolso no soportado: ${paymentMethod}`);
      }
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reembolso con Stripe
   */
  async processStripeRefund(paymentIntentId, amount, reason) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || 'requested_by_customer',
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        refundData: refund,
      };
    } catch (error) {
      throw new Error(`Stripe refund failed: ${error.message}`);
    }
  }

  /**
   * Reembolso con PayPal
   */
  async processPayPalRefund(captureId, amount, reason) {
    try {
      const request = new paypal.payments.CapturesRefundRequest(captureId);
      request.requestBody({
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2),
        },
        note_to_payer: reason || 'Refund from Flores Victoria',
      });

      const refund = await this.paypalClient.execute(request);

      return {
        success: true,
        refundId: refund.result.id,
        amount: parseFloat(refund.result.amount.value),
        status: refund.result.status,
        refundData: refund.result,
      };
    } catch (error) {
      throw new Error(`PayPal refund failed: ${error.message}`);
    }
  }

  /**
   * Reembolso con Transbank
   */
  async processTransbankRefund(authorizationCode, amount, reason) {
    try {
      const WebpayPlus = require('transbank-sdk').WebpayPlus;
      const Transaction = WebpayPlus.Transaction;

      // Configurar ambiente
      if (this.transbank.environment === 'production') {
        Transaction.configureForProduction(this.transbank.commerceCode, this.transbank.apiKey);
      } else {
        Transaction.configureForTesting();
      }

      // Procesar reembolso (anulación en Transbank)
      const refundResponse = await Transaction.refund(authorizationCode, Math.round(amount));

      return {
        success: true,
        refundId: refundResponse.authorization_code,
        amount: refundResponse.amount,
        status: 'completed',
        refundData: refundResponse,
      };
    } catch (error) {
      throw new Error(`Transbank refund failed: ${error.message}`);
    }
  }

  /**
   * Verificar estado de pago
   */
  async getPaymentStatus(paymentMethod, paymentId) {
    try {
      switch (paymentMethod) {
        case 'stripe': {
          const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
          return {
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
          };
        }

        case 'paypal': {
          const request = new paypal.orders.OrdersGetRequest(paymentId);
          const order = await this.paypalClient.execute(request);
          return {
            success: true,
            status: order.result.status,
            amount: parseFloat(order.result.purchase_units[0].amount.value),
            currency: order.result.purchase_units[0].amount.currency_code,
          };
        }

        case 'transbank':
          // Transbank no tiene endpoint de consulta directa
          return {
            success: true,
            status: 'unknown',
            message: 'Consultar directamente en Transbank',
          };

        default:
          throw new Error(`Método de consulta no soportado: ${paymentMethod}`);
      }
    } catch (error) {
      console.error('Payment status error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validar configuración de pagos
   */
  validateConfiguration() {
    const errors = [];

    // Validar Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      errors.push('STRIPE_SECRET_KEY no configurado');
    }

    // Validar PayPal
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      errors.push('Credenciales de PayPal no configuradas');
    }

    // Validar Transbank
    if (!process.env.TRANSBANK_COMMERCE_CODE || !process.env.TRANSBANK_API_KEY) {
      errors.push('Credenciales de Transbank no configuradas');
    }

    return {
      isValid: errors.length === 0,
      errors,
      configured: {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        paypal: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
        transbank: !!(process.env.TRANSBANK_COMMERCE_CODE && process.env.TRANSBANK_API_KEY),
      },
    };
  }
}

module.exports = PaymentProcessor;
