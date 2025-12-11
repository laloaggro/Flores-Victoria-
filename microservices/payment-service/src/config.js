require('dotenv').config();

const config = {
  port: process.env.PORT || process.env.PAYMENT_SERVICE_PORT || 3005,
  database: {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'flores_payments',
    user: process.env.PGUSER || 'flores_user',
    password: process.env.PGPASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publicKey: process.env.STRIPE_PUBLIC_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  },
};

module.exports = config;
