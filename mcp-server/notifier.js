const axios = require('axios');

// Configuración de webhooks (definir en variables de entorno)
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || '';
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';

/**
 * Enviar notificación a Slack
 */
async function sendSlackNotification(message, severity = 'info') {
    if (!SLACK_WEBHOOK) {
        console.log('⚠️ Slack webhook no configurado');
        return;
    }

    const color = {
        'error': '#ef4444',
        'warning': '#fbbf24',
        'info': '#3b82f6',
        'success': '#4ade80'
    }[severity] || '#3b82f6';

    const payload = {
        attachments: [{
            color: color,
            title: `🌺 Flores Victoria - ${severity.toUpperCase()}`,
            text: message,
            footer: 'MCP Server Notification',
            ts: Math.floor(Date.now() / 1000)
        }]
    };

    try {
        await axios.post(SLACK_WEBHOOK, payload);
        console.log('✓ Notificación Slack enviada');
    } catch (error) {
        console.error('✗ Error al enviar notificación Slack:', error.message);
    }
}

/**
 * Enviar notificación a Discord
 */
async function sendDiscordNotification(message, severity = 'info') {
    if (!DISCORD_WEBHOOK) {
        console.log('⚠️ Discord webhook no configurado');
        return;
    }

    const color = {
        'error': 15548997,    // Rojo
        'warning': 16705372,  // Amarillo
        'info': 3901635,      // Azul
        'success': 5025616    // Verde
    }[severity] || 3901635;

    const emoji = {
        'error': '🔴',
        'warning': '🟡',
        'info': '🔵',
        'success': '🟢'
    }[severity] || '🔵';

    const payload = {
        embeds: [{
            title: `${emoji} Flores Victoria - ${severity.toUpperCase()}`,
            description: message,
            color: color,
            footer: {
                text: 'MCP Server Notification'
            },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await axios.post(DISCORD_WEBHOOK, payload);
        console.log('✓ Notificación Discord enviada');
    } catch (error) {
        console.error('✗ Error al enviar notificación Discord:', error.message);
    }
}

/**
 * Notificar evento crítico (servicios caídos, errores graves)
 */
async function notifyCriticalEvent(serviceName, details) {
    const message = `⚠️ **ALERTA CRÍTICA**\n\n` +
        `Servicio: ${serviceName}\n` +
        `Detalles: ${details}\n` +
        `Timestamp: ${new Date().toLocaleString('es-ES')}`;

    await Promise.all([
        sendSlackNotification(message, 'error'),
        sendDiscordNotification(message, 'error')
    ]);
}

/**
 * Notificar despliegue exitoso
 */
async function notifyDeployment(version, environment) {
    const message = `🚀 **DESPLIEGUE EXITOSO**\n\n` +
        `Versión: ${version}\n` +
        `Ambiente: ${environment}\n` +
        `Timestamp: ${new Date().toLocaleString('es-ES')}`;

    await Promise.all([
        sendSlackNotification(message, 'success'),
        sendDiscordNotification(message, 'success')
    ]);
}

/**
 * Notificar métricas diarias
 */
async function notifyDailyMetrics(metrics) {
    const message = `📊 **REPORTE DIARIO**\n\n` +
        `Servicios Activos: ${metrics.healthyServices}/${metrics.totalServices}\n` +
        `Eventos Registrados: ${metrics.eventsCount}\n` +
        `Auditorías: ${metrics.auditsCount}\n` +
        `Uptime: ${metrics.uptime}%\n` +
        `Tests: ${metrics.testsStatus}`;

    await Promise.all([
        sendSlackNotification(message, 'info'),
        sendDiscordNotification(message, 'info')
    ]);
}

/**
 * Notificar nuevo PR
 */
async function notifyPullRequest(prNumber, title, author) {
    const message = `🔔 **NUEVO PULL REQUEST**\n\n` +
        `PR #${prNumber}: ${title}\n` +
        `Autor: ${author}\n` +
        `Acción requerida: Revisión de código`;

    await Promise.all([
        sendSlackNotification(message, 'info'),
        sendDiscordNotification(message, 'info')
    ]);
}

/**
 * Notificar issue crítico
 */
async function notifyCriticalIssue(issueNumber, title, labels) {
    const message = `🚨 **ISSUE CRÍTICO**\n\n` +
        `Issue #${issueNumber}: ${title}\n` +
        `Labels: ${labels.join(', ')}\n` +
        `Acción requerida: Atención inmediata`;

    await Promise.all([
        sendSlackNotification(message, 'error'),
        sendDiscordNotification(message, 'error')
    ]);
}

module.exports = {
    sendSlackNotification,
    sendDiscordNotification,
    notifyCriticalEvent,
    notifyDeployment,
    notifyDailyMetrics,
    notifyPullRequest,
    notifyCriticalIssue
};
