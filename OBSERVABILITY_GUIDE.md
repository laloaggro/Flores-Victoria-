# 📊 OBSERVABILITY GUIDE - Flores Victoria

**Last Updated**: December 20, 2025  
**Status**: ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Logging Strategy](#logging-strategy)
3. [Metrics & Monitoring](#metrics--monitoring)
4. [Distributed Tracing](#distributed-tracing)
5. [Alerting](#alerting)
6. [Dashboard Setup](#dashboard-setup)

---

## Overview

Observability in Flores Victoria is built on three pillars:

1. **Logs**: Winston (structured JSON logging)
2. **Metrics**: Prometheus (time-series metrics)
3. **Traces**: Request Context Manager + Correlation IDs

### Current Stack

- **Logging**: Winston 3.x with JSON formatting
- **Metrics**: Prometheus + node-exporter
- **Visualization**: Grafana 10.x
- **Tracing**: Correlation ID propagation (lightweight alternative to Jaeger)

---

## Logging Strategy

### Log Levels

```javascript
const logger = require('./logger');

logger.error('Error message');      // Production issues
logger.warn('Warning message');     // Potential issues
logger.info('Info message');        // Important events
logger.debug('Debug message');      // Development info
logger.trace('Trace message');      // Detailed tracking
```

### Structured Logging

All logs are JSON-formatted for easy parsing:

```json
{
  "timestamp": "2024-12-19T10:30:00Z",
  "level": "info",
  "service": "auth-service",
  "request_id": "req-abc123",
  "correlation_id": "corr-xyz789",
  "user_id": "user-456",
  "message": "User logged in",
  "duration_ms": 125
}
```

### Log Configuration

```javascript
// microservices/shared/logging/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: process.env.SERVICE_NAME },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
```

---

## Metrics & Monitoring

### Key Metrics to Track

| Metric | Service | Alert Threshold |
|--------|---------|-----------------|
| Request latency (p95) | All | >500ms |
| Error rate | All | >0.1% |
| CPU usage | All | >80% |
| Memory usage | All | >85% |
| Database connections | Services | >95% pool |
| Cache hit ratio | Cache | <80% |
| Token revocation rate | Auth | >100/min |

### Prometheus Metrics

```javascript
// Express middleware
const promMetrics = require('express-prometheus-middleware');

app.use(promMetrics({
  metricsPath: '/metrics',
  requestDurationBuckets: [0.1, 0.5, 1, 2],
  customLabels: {
    service: process.env.SERVICE_NAME,
  },
}));
```

### Metric Examples

```javascript
// Custom metrics
const prometheus = require('prom-client');

const loginAttempts = new prometheus.Counter({
  name: 'auth_login_attempts_total',
  help: 'Total login attempts',
  labelNames: ['status'],
});

const tokenRevocations = new prometheus.Counter({
  name: 'auth_token_revocations_total',
  help: 'Total token revocations',
  labelNames: ['reason'],
});

loginAttempts.inc({ status: 'success' });
tokenRevocations.inc({ reason: 'logout' });
```

---

## Distributed Tracing

### Correlation ID Propagation

All requests include a correlation ID for tracing:

```
Request Flow:
┌─────────────────────────────────────────────────────────────┐
│ Client                                                      │
│ POST /api/products                                          │
│ X-Correlation-ID: corr-abc123                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ API Gateway                                                 │
│ Extracts/Generates X-Correlation-ID                        │
│ Forwards to Product Service                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Product Service                                             │
│ Uses X-Correlation-ID in:                                  │
│ - Logs                                                      │
│ - Database queries                                          │
│ - Service calls                                             │
└─────────────────────────────────────────────────────────────┘
```

### Request Context Implementation

```javascript
// microservices/shared/utils/request-context.js
const { AsyncLocalStorage } = require('async_hooks');

const contextStore = new AsyncLocalStorage();

function createContext(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || generateId();
  const context = {
    correlationId,
    requestId: generateId(),
    userId: req.user?.id,
    timestamp: Date.now(),
  };

  contextStore.run(context, () => {
    res.setHeader('X-Correlation-ID', correlationId);
    next();
  });
}

function getContext() {
  return contextStore.getStore();
}

module.exports = { createContext, getContext };
```

---

## Alerting

### Alert Rules (Prometheus)

```yaml
groups:
  - name: flores-victoria-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.001
        for: 5m
        annotations:
          summary: "High error rate on {{ $labels.service }}"

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
        for: 5m
        annotations:
          summary: "High latency on {{ $labels.service }}"

      - alert: ServiceDown
        expr: up{service=~".*-service"} == 0
        for: 1m
        annotations:
          summary: "Service {{ $labels.service }} is down"
```

### Alert Channels

- **Slack**: Critical and Error alerts
- **Email**: Error and Warning alerts
- **PagerDuty**: Critical alerts (on-call rotation)

---

## Dashboard Setup

### Grafana Dashboards

Pre-configured dashboards are available:

1. **System Overview**: CPU, Memory, Disk
2. **Service Health**: Error rates, latency, uptime
3. **Business Metrics**: Login attempts, orders, revenue
4. **Database**: Query performance, connection pools

### Creating Custom Dashboards

```bash
# Navigate to Grafana
http://localhost:3000

# Default credentials
username: admin
password: admin

# Add Prometheus data source
Configuration > Data Sources > Add Prometheus
```

### Dashboard Example

```json
{
  "dashboard": {
    "title": "Flores Victoria - Service Health",
    "panels": [
      {
        "title": "Request Latency (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## Implementation Checklist

- [ ] Winston logging configured in all services
- [ ] Correlation IDs propagated through all requests
- [ ] Prometheus metrics exposed on `/metrics`
- [ ] Grafana dashboards created
- [ ] Alert rules configured
- [ ] Log aggregation setup (optional)
- [ ] Distributed tracing enabled
- [ ] Health check endpoints implemented
- [ ] Performance baselines established
- [ ] Monitoring alerts tested

---

## Best Practices

1. **Log Structured Data**: Always include context (user_id, request_id)
2. **Use Correlation IDs**: Propagate through all service boundaries
3. **Set Appropriate Levels**: Don't over-log in production
4. **Monitor Key Metrics**: Error rate, latency, saturation
5. **Alert on Business Metrics**: Not just technical metrics
6. **Test Alerts**: Ensure they trigger and notify correctly
7. **Review Regularly**: Check dashboard data for anomalies

---

## Resources

- [Winston Logger](https://github.com/winstonjs/winston)
- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [ELK Stack Guide](https://www.elastic.co/what-is/elk-stack)

