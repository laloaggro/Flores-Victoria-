require('dotenv').config();

// Parsear DATABASE_URL si está disponible (Railway)
const parseDbUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number.parseInt(parsed.port, 10) || 5432,
      database: parsed.pathname.slice(1),
      user: parsed.username,
      password: parsed.password,
    };
  } catch {
    return null;
  }
};

const dbFromUrl = parseDbUrl(process.env.DATABASE_URL);

const config = {
  port: process.env.PORT || process.env.PAYMENT_SERVICE_PORT || 3005,
  database: {
    host: dbFromUrl?.host || process.env.PGHOST || 'localhost',
    port: dbFromUrl?.port || process.env.PGPORT || 5432,
    database: dbFromUrl?.database || process.env.PGDATABASE || 'flores_payments',
    user: dbFromUrl?.user || process.env.PGUSER || 'flores_user',
    password: dbFromUrl?.password || process.env.PGPASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
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
