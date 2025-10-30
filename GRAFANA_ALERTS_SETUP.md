# Grafana Alerting Configuration

# Configure alerts for production monitoring

## 🚨 Alert Rules

### 1. High CPU Usage Alert

```yaml
apiVersion: 1
groups:
  - name: system_alerts
    interval: 1m
    rules:
      - alert: HighCPUUsage
        expr: (100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High CPU usage detected on {{ $labels.instance }}'
          description: 'CPU usage is above 80% (current: {{ $value }}%)'
```

### 2. High Memory Usage Alert

```yaml
- alert: HighMemoryUsage
  expr:
    (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
    > 85
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: 'High memory usage on {{ $labels.instance }}'
    description: 'Memory usage is above 85% (current: {{ $value }}%)'
```

### 3. Service Down Alert

```yaml
- alert: ServiceDown
  expr: up == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: 'Service {{ $labels.job }} is down'
    description: '{{ $labels.instance }} has been down for more than 2 minutes'
```

### 4. High Error Rate

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: 'High error rate in {{ $labels.service }}'
    description: 'Error rate is above 5% (current: {{ $value }}%)'
```

### 5. Slow Response Time

```yaml
- alert: SlowResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: 'Slow response time in {{ $labels.service }}'
    description: '95th percentile response time is above 2s (current: {{ $value }}s)'
```

### 6. Database Connection Pool Exhaustion

```yaml
- alert: DatabaseConnectionPoolExhausted
  expr: mongodb_connections_available < 10
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: 'MongoDB connection pool nearly exhausted'
    description: 'Only {{ $value }} connections available'
```

## 📧 Notification Channels

### Email Notifications

```yaml
apiVersion: 1
notifiers:
  - name: email-alerts
    type: email
    uid: email-alerts
    is_default: true
    settings:
      addresses: admin@flores-victoria.com
      singleEmail: true
```

### Slack Notifications

```yaml
- name: slack-alerts
  type: slack
  uid: slack-alerts
  settings:
    url: ${SLACK_WEBHOOK_URL}
    username: Grafana Alerts
    icon_emoji: ':chart_with_upwards_trend:'
    mentionChannel: 'here'
```

### Webhook Notifications

```yaml
- name: webhook-alerts
  type: webhook
  uid: webhook-alerts
  settings:
    url: http://localhost:3000/api/alerts
    httpMethod: POST
    authorization: Bearer ${WEBHOOK_TOKEN}
```

## 🎯 Alert Configuration Files

### Create Grafana Alert Rules

1. **Create alert rules file:**

```bash
# Create directory
mkdir -p monitoring/grafana/provisioning/alerting

# Create rules file
cat > monitoring/grafana/provisioning/alerting/alerts.yml << 'EOF'
apiVersion: 1
groups:
  - name: flores_victoria_alerts
    interval: 1m
    rules:
      - alert: HighCPUUsage
        expr: (100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 5m
        labels:
          severity: warning
          service: system
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is {{ $value }}%"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
          service: system
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"

      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
          service: "{{ $labels.job }}"
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service has been unreachable for 2+ minutes"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
          service: "{{ $labels.service }}"
        annotations:
          summary: "High 5xx error rate"
          description: "Error rate is {{ $value }}%"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
          service: "{{ $labels.service }}"
        annotations:
          summary: "Slow API response time"
          description: "P95 response time is {{ $value }}s"

      - alert: HighRequestRate
        expr: rate(http_requests_total[1m]) > 1000
        for: 5m
        labels:
          severity: info
          service: "{{ $labels.service }}"
        annotations:
          summary: "High request rate"
          description: "Request rate is {{ $value }} req/s"
EOF
```

2. **Create notification channels:**

```bash
cat > monitoring/grafana/provisioning/notifiers/channels.yml << 'EOF'
apiVersion: 1
notifiers:
  - name: email-alerts
    type: email
    uid: email-alerts
    org_id: 1
    is_default: true
    send_reminder: true
    frequency: "24h"
    settings:
      addresses: "admin@flores-victoria.com"
      singleEmail: true

  - name: slack-alerts
    type: slack
    uid: slack-alerts
    org_id: 1
    settings:
      url: "${SLACK_WEBHOOK_URL}"
      recipient: "#alerts"
      username: "Grafana"
      icon_emoji: ":grafana:"
      mentionChannel: "here"
EOF
```

3. **Update docker-compose to include provisioning:**

```yaml
grafana:
  volumes:
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
```

## 🔧 Setup Instructions

### 1. Configure Environment Variables

```bash
# Add to .env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL=admin@flores-victoria.com
WEBHOOK_TOKEN=your-secure-token
```

### 2. Restart Grafana

```bash
docker-compose restart grafana
```

### 3. Verify Alerts

1. Open Grafana: http://localhost:3001
2. Navigate to **Alerting** → **Alert rules**
3. Verify rules are loaded
4. Test notifications: **Contact points** → **Test**

### 4. Create Dashboard Alerts

In any dashboard panel:

1. Click **Edit** → **Alert** tab
2. Configure alert conditions
3. Set notification channel
4. Save

## 📊 Alert Priorities

| Priority     | Response Time | Examples                        |
| ------------ | ------------- | ------------------------------- |
| **Critical** | Immediate     | Service down, DB unavailable    |
| **Warning**  | 15 minutes    | High CPU/memory, slow responses |
| **Info**     | 1 hour        | High traffic, scheduled tasks   |

## 💡 Best Practices

1. **Use appropriate thresholds:** Don't alert on every spike
2. **Group related alerts:** Reduce alert fatigue
3. **Add runbooks:** Include resolution steps in annotations
4. **Test regularly:** Verify alerts fire correctly
5. **Review and tune:** Adjust thresholds based on patterns

## 📱 Mobile Alerts

Install Grafana mobile app for push notifications:

- iOS: https://apps.apple.com/app/grafana/id1437657022
- Android: https://play.google.com/store/apps/details?id=com.grafana.mobile.android

## 🔍 Troubleshooting

### Alerts not firing

1. Check Prometheus is scraping targets
2. Verify alert expression syntax
3. Check evaluation interval
4. Review Grafana logs

### Notifications not sending

1. Test contact points
2. Verify webhook URLs/SMTP settings
3. Check firewall rules
4. Review notification logs

## ✅ Quick Start Checklist

- [ ] Create alert rules file
- [ ] Configure notification channels
- [ ] Set environment variables
- [ ] Restart Grafana
- [ ] Test alerts
- [ ] Configure dashboard panels
- [ ] Add team members to notifications
- [ ] Create runbook documentation

---

**Status**: Ready to configure  
**Priority**: High  
**Estimated setup time**: 30 minutes
