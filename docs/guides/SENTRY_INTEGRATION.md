# Sentry Integration Guide

# Real-time Error Tracking and Performance Monitoring

## 📊 Overview

Sentry provides:

- **Error Tracking**: Capture and aggregate errors
- **Performance Monitoring**: Track API response times
- **Release Tracking**: Monitor deployments
- **User Context**: See which users are affected
- **Breadcrumbs**: Trace user actions leading to errors

## 🚀 Setup Instructions

### 1. Create Sentry Account

```bash
# 1. Go to https://sentry.io
# 2. Sign up for free account (up to 5k events/month)
# 3. Create new project for "Flores Victoria"
# 4. Select "Node.js" as platform
# 5. Copy your DSN (Data Source Name)
```

### 2. Install Sentry SDK

```bash
# Install in all microservices
cd microservices/api-gateway && npm install @sentry/node @sentry/profiling-node
cd microservices/auth-service && npm install @sentry/node @sentry/profiling-node
cd microservices/user-service && npm install @sentry/node @sentry/profiling-node
cd microservices/product-service && npm install @sentry/node @sentry/profiling-node
cd microservices/cart-service && npm install @sentry/node @sentry/profiling-node
cd microservices/order-service && npm install @sentry/node @sentry/profiling-node

# Install in frontend
cd frontend && npm install @sentry/react @sentry/tracing
```

### 3. Configure Environment Variables

```bash
# Add to .env file
SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=flores-victoria@1.0.0
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### 4. Backend Integration (Node.js)

Create `shared/sentry.js`:

```javascript
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

function initializeSentry(serviceName) {
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    release: process.env.SENTRY_RELEASE,

    // Performance Monitoring
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: 0.1,

    // Service context
    tags: {
      service: serviceName,
    },

    // Integrations
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: true }),
      new ProfilingIntegration(),
    ],

    // Ignore common errors
    ignoreErrors: ['ECONNREFUSED', 'ENOTFOUND', 'NetworkError'],

    // Before send hook
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.headers?.authorization;
        delete event.request.headers?.cookie;
      }
      return event;
    },
  });

  console.log(`✅ Sentry initialized for ${serviceName}`);
}

// Express middleware
function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

function sentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

// Manual error capturing
function captureError(error, context = {}) {
  Sentry.captureException(error, {
    extra: context,
  });
}

function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, level);
}

module.exports = {
  initializeSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  captureError,
  captureMessage,
  Sentry,
};
```

### 5. Update Service app.js

For each microservice, update `app.js`:

```javascript
const express = require('express');
const {
  initializeSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
} = require('../shared/sentry');

const app = express();

// Initialize Sentry FIRST
initializeSentry('product-service'); // Change service name per service

// Sentry request handler MUST be first middleware
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// ... your other middleware ...

// Routes
app.use('/products', productRoutes);

// Sentry error handler MUST be before other error handlers
app.use(sentryErrorHandler());

// Your error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
```

### 6. Frontend Integration (React)

Update `frontend/src/main.jsx`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';

// Initialize Sentry
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    release: import.meta.env.VITE_SENTRY_RELEASE,

    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event) {
      // Filter sensitive data
      if (event.request?.headers) {
        delete event.request.headers.authorization;
      }
      return event;
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
```

Create error fallback component:

```javascript
// components/ErrorFallback.jsx
function ErrorFallback({ error, componentStack, resetError }) {
  return (
    <div className="error-fallback">
      <h1>Oops! Algo salió mal</h1>
      <p>Lo sentimos, ha ocurrido un error inesperado.</p>
      <button onClick={resetError}>Intentar de nuevo</button>
      {process.env.NODE_ENV === 'development' && (
        <details>
          <summary>Error details</summary>
          <pre>{error.toString()}</pre>
          <pre>{componentStack}</pre>
        </details>
      )}
    </div>
  );
}
```

### 7. Manual Error Tracking

#### In try-catch blocks:

```javascript
const { captureError } = require('../shared/sentry');

try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    userId: req.user?.id,
    operation: 'riskyOperation',
    input: sanitizedInput,
  });
  throw error;
}
```

#### Custom messages:

```javascript
const { captureMessage } = require('../shared/sentry');

captureMessage('Payment processed successfully', 'info');
captureMessage('Suspicious login attempt detected', 'warning');
```

#### Set user context:

```javascript
const { Sentry } = require('../shared/sentry');

app.use((req, res, next) => {
  if (req.user) {
    Sentry.setUser({
      id: req.user.id,
      email: req.user.email,
      username: req.user.name,
    });
  }
  next();
});
```

#### Add breadcrumbs:

```javascript
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
  data: {
    userId: user.id,
    method: 'email',
  },
});
```

## 📊 Monitoring Features

### 1. Releases

Track deployments:

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Create release
sentry-cli releases new flores-victoria@1.0.0

# Associate commits
sentry-cli releases set-commits flores-victoria@1.0.0 --auto

# Finalize release
sentry-cli releases finalize flores-victoria@1.0.0

# Deploy to environment
sentry-cli releases deploys flores-victoria@1.0.0 new -e production
```

### 2. Performance Monitoring

Track custom transactions:

```javascript
const transaction = Sentry.startTransaction({
  op: 'order.process',
  name: 'Process Order',
});

try {
  const span1 = transaction.startChild({ op: 'db', description: 'Fetch products' });
  await fetchProducts();
  span1.finish();

  const span2 = transaction.startChild({ op: 'payment', description: 'Process payment' });
  await processPayment();
  span2.finish();

  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### 3. Alerts

Configure in Sentry dashboard:

- **Error spike**: Alert when errors increase by 50%
- **New issue**: Alert on first occurrence
- **Regression**: Alert when resolved issue reoccurs
- **Performance degradation**: Alert on slow transactions

## 🎯 Best Practices

### 1. Sample Rates

```javascript
// Production
tracesSampleRate: 0.1; // 10% of transactions
replaysSessionSampleRate: 0.1; // 10% of sessions
replaysOnErrorSampleRate: 1.0; // 100% of error sessions

// Development
tracesSampleRate: 1.0; // 100% for testing
```

### 2. Error Grouping

Use fingerprinting for better grouping:

```javascript
beforeSend(event) {
  if (event.exception) {
    const error = event.exception.values[0];
    if (error.type === 'DatabaseError') {
      event.fingerprint = ['database', error.value];
    }
  }
  return event;
}
```

### 3. Sensitive Data

Always filter:

```javascript
beforeSend(event) {
  // Remove sensitive fields
  if (event.request?.data) {
    delete event.request.data.password;
    delete event.request.data.creditCard;
  }
  return event;
}
```

## 📱 Dashboards

Create custom dashboards in Sentry:

1. **Error Overview**: Total errors, affected users, trends
2. **Performance**: P95 response times, slow endpoints
3. **Releases**: Error rates per deployment
4. **User Impact**: Most affected users

## 🔧 CI/CD Integration

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Create Sentry release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: flores-victoria
    SENTRY_PROJECT: backend
  run: |
    curl -sL https://sentry.io/get-cli/ | bash
    sentry-cli releases new "$GITHUB_SHA"
    sentry-cli releases set-commits "$GITHUB_SHA" --auto
    sentry-cli releases finalize "$GITHUB_SHA"
    sentry-cli releases deploys "$GITHUB_SHA" new -e production
```

## ✅ Verification Checklist

- [ ] Sentry account created
- [ ] DSN added to .env
- [ ] SDK installed in all services
- [ ] Middleware configured in app.js
- [ ] Frontend integration complete
- [ ] Test error sent and received
- [ ] Alerts configured
- [ ] Team members invited
- [ ] Release tracking setup
- [ ] CI/CD integration added

## 🆘 Test Integration

```bash
# Test backend
curl http://localhost:3000/debug-sentry

# Test frontend
# Trigger error button in UI
```

Create test endpoint:

```javascript
app.get('/debug-sentry', (req, res) => {
  throw new Error('Sentry test error');
});
```

---

**Status**: Ready to configure  
**Priority**: High  
**Estimated setup time**: 45 minutes  
**Free tier**: 5,000 errors/month
