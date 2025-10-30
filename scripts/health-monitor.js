#!/usr/bin/env node

/**
 * Health Check Monitoring Service
 * Pings microservices and sends alerts on failures
 * Run with: node scripts/health-monitor.js
 */

const axios = require('axios');
const nodemailer = require('nodemailer');

// Configuration
const CONFIG = {
  // Services to monitor
  services: [
    { name: 'API Gateway', url: 'http://localhost:3000/health', critical: true },
    { name: 'Auth Service', url: 'http://localhost:3001/health', critical: true },
    { name: 'User Service', url: 'http://localhost:3002/health', critical: true },
    { name: 'Product Service', url: 'http://localhost:3009/health', critical: true },
    { name: 'Cart Service', url: 'http://localhost:3003/health', critical: true },
    { name: 'Order Service', url: 'http://localhost:3004/health', critical: false },
    { name: 'Frontend', url: 'http://localhost:5173', critical: true },
    { name: 'Admin Panel', url: 'http://localhost:3021', critical: false },
  ],

  // Check interval (milliseconds)
  checkInterval: 5 * 60 * 1000, // 5 minutes

  // Request timeout (milliseconds)
  timeout: 10000, // 10 seconds

  // Alert thresholds
  alerts: {
    failureThreshold: 3, // Send alert after N consecutive failures
    emailEnabled: process.env.ALERT_EMAIL_ENABLED === 'true',
    slackEnabled: process.env.ALERT_SLACK_ENABLED === 'true',
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
  },

  // Email configuration
  email: {
    from: process.env.ALERT_EMAIL_FROM || 'monitor@flores-victoria.com',
    to: process.env.ALERT_EMAIL_TO || 'admin@flores-victoria.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },
};

// State tracking
const state = {
  serviceStatus: {},
  consecutiveFailures: {},
  lastAlertSent: {},
  startTime: Date.now(),
  totalChecks: 0,
};

/**
 * Check health of a single service
 */
async function checkService(service) {
  try {
    const startTime = Date.now();
    const response = await axios.get(service.url, {
      timeout: CONFIG.timeout,
      validateStatus: (status) => status < 500, // 4xx is OK, 5xx is not
    });

    const responseTime = Date.now() - startTime;

    const isHealthy =
      response.status === 200 &&
      (response.data.status === 'ok' ||
        response.data.status === 'healthy' ||
        response.status < 400);

    return {
      name: service.name,
      url: service.url,
      status: isHealthy ? 'UP' : 'DEGRADED',
      statusCode: response.status,
      responseTime,
      timestamp: new Date().toISOString(),
      details: response.data,
    };
  } catch (error) {
    return {
      name: service.name,
      url: service.url,
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check all services
 */
async function checkAllServices() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🏥 HEALTH CHECK - ${new Date().toLocaleString()}`);
  console.log('='.repeat(80));

  const results = await Promise.all(CONFIG.services.map(checkService));

  let upCount = 0;
  let downCount = 0;
  let degradedCount = 0;

  for (const result of results) {
    const icon = result.status === 'UP' ? '✅' : result.status === 'DEGRADED' ? '⚠️' : '❌';
    const timeStr = result.responseTime ? `${result.responseTime}ms` : 'N/A';

    console.log(
      `${icon} ${result.name.padEnd(20)} ${result.status.padEnd(10)} ${timeStr.padEnd(10)}`
    );

    // Update state
    state.serviceStatus[result.name] = result;

    if (result.status === 'UP') {
      upCount++;
      state.consecutiveFailures[result.name] = 0;
    } else if (result.status === 'DOWN') {
      downCount++;
      state.consecutiveFailures[result.name] = (state.consecutiveFailures[result.name] || 0) + 1;

      // Check if we should send alert
      const failures = state.consecutiveFailures[result.name];
      const service = CONFIG.services.find((s) => s.name === result.name);

      if (failures >= CONFIG.alerts.failureThreshold && service?.critical) {
        await sendAlert(result, failures);
      }
    } else {
      degradedCount++;
    }
  }

  state.totalChecks++;

  console.log('-'.repeat(80));
  console.log(
    `📊 Status: ${upCount} UP | ${degradedCount} DEGRADED | ${downCount} DOWN | Total Checks: ${state.totalChecks}`
  );
  console.log('='.repeat(80));

  return results;
}

/**
 * Send alert for service failure
 */
async function sendAlert(result, failures) {
  const now = Date.now();
  const lastAlert = state.lastAlertSent[result.name] || 0;
  const cooldown = 30 * 60 * 1000; // 30 minutes

  // Don't spam alerts
  if (now - lastAlert < cooldown) {
    console.log(`⏳ Alert cooldown active for ${result.name} (${failures} failures)`);
    return;
  }

  state.lastAlertSent[result.name] = now;

  const message = {
    service: result.name,
    status: result.status,
    url: result.url,
    error: result.error,
    failures,
    timestamp: result.timestamp,
  };

  console.log(`\n🚨 ALERT: ${result.name} is ${result.status} (${failures} consecutive failures)`);

  // Send email alert
  if (CONFIG.alerts.emailEnabled) {
    await sendEmailAlert(message);
  }

  // Send Slack/webhook alert
  if (CONFIG.alerts.slackEnabled && CONFIG.alerts.webhookUrl) {
    await sendWebhookAlert(message);
  }
}

/**
 * Send email alert
 */
async function sendEmailAlert(message) {
  try {
    if (!CONFIG.email.smtp.auth.user || !CONFIG.email.smtp.auth.pass) {
      console.log('⏭️  Email credentials not configured, skipping email alert');
      return;
    }

    const transporter = nodemailer.createTransporter(CONFIG.email.smtp);

    const mailOptions = {
      from: CONFIG.email.from,
      to: CONFIG.email.to,
      subject: `🚨 ALERT: ${message.service} is ${message.status}`,
      html: `
        <h2>Service Health Alert</h2>
        <p><strong>Service:</strong> ${message.service}</p>
        <p><strong>Status:</strong> ${message.status}</p>
        <p><strong>URL:</strong> ${message.url}</p>
        <p><strong>Error:</strong> ${message.error || 'N/A'}</p>
        <p><strong>Consecutive Failures:</strong> ${message.failures}</p>
        <p><strong>Timestamp:</strong> ${message.timestamp}</p>
        <hr>
        <p><em>This is an automated alert from Flores Victoria Health Monitor</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email alert sent to ${CONFIG.email.to}`);
  } catch (error) {
    console.error('❌ Failed to send email alert:', error.message);
  }
}

/**
 * Send webhook/Slack alert
 */
async function sendWebhookAlert(message) {
  try {
    await axios.post(CONFIG.alerts.webhookUrl, {
      text: `🚨 *ALERT*: ${message.service} is ${message.status}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Service:* ${message.service}\n*Status:* ${message.status}\n*URL:* ${message.url}\n*Failures:* ${message.failures}\n*Error:* ${message.error || 'N/A'}`,
          },
        },
      ],
    });
    console.log('💬 Webhook alert sent');
  } catch (error) {
    console.error('❌ Failed to send webhook alert:', error.message);
  }
}

/**
 * Print uptime statistics
 */
function printStats() {
  const uptime = Math.floor((Date.now() - state.startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  console.log('\n📈 STATISTICS');
  console.log(`   Monitor Uptime: ${hours}h ${minutes}m`);
  console.log(`   Total Checks: ${state.totalChecks}`);
  console.log(`   Check Interval: ${CONFIG.checkInterval / 1000}s`);
  console.log(`   Services Monitored: ${CONFIG.services.length}`);
}

/**
 * Main monitoring loop
 */
async function startMonitoring() {
  console.log('🚀 Health Check Monitoring Service Started');
  console.log(`   Check Interval: ${CONFIG.checkInterval / 1000} seconds`);
  console.log(`   Monitored Services: ${CONFIG.services.length}`);
  console.log(`   Alert Email: ${CONFIG.alerts.emailEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`   Alert Webhook: ${CONFIG.alerts.slackEnabled ? 'Enabled' : 'Disabled'}\n`);

  // Initial check
  await checkAllServices();

  // Schedule periodic checks
  setInterval(async () => {
    await checkAllServices();
  }, CONFIG.checkInterval);

  // Print stats every hour
  setInterval(printStats, 60 * 60 * 1000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down health monitor...');
  printStats();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down health monitor...');
  printStats();
  process.exit(0);
});

// Run if executed directly
if (require.main === module) {
  startMonitoring().catch((error) => {
    console.error('💥 Health monitor failed:', error);
    process.exit(1);
  });
}

module.exports = { checkAllServices, checkService, CONFIG };
