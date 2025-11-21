// MCP Helper - Facilita integración con MCP server
// Bilingüe ES/EN

const logger = require('./logger');

let axios;
try {
  axios = require('axios');
} catch (e) {
  axios = null;
  logger.warn({ service: 'notification-service' }, '⚠️ axios no está disponible en este contenedor. Las llamadas a MCP serán NO-OP.');
}
const MCP_URL = process.env.MCP_URL || 'http://mcp-server:5050';

/**
 * Registrar evento personalizado en MCP / Register custom event in MCP
 * @param {string} type - Tipo de evento / Event type
 * @param {object} payload - Datos del evento / Event data
 */
async function registerEvent(type, payload) {
  if (!axios) return logger.warn({ service: 'notification-service' }, 'registerEvent: axios no disponible, evento no enviado');
  try {
    await axios.post(`${MCP_URL}/events`, { type, payload });
  } catch (err) {
    logger.error({ service: 'notification-service', err: err.message }, 'Error al registrar evento en MCP');
  }
}

/**
 * Registrar auditoría en MCP / Register audit in MCP
 * @param {string} action - Acción realizada / Action performed
 * @param {string} agent - Agente responsable / Responsible agent
 * @param {string} details - Detalles / Details
 */
async function registerAudit(action, agent, details) {
  if (!axios) return logger.warn({ service: 'notification-service' }, 'registerAudit: axios no disponible, auditoría no enviada');
  try {
    await axios.post(`${MCP_URL}/audit`, { action, agent, details });
  } catch (err) {
    logger.error({ service: 'notification-service', err: err.message }, 'Error al registrar auditoría en MCP');
  }
}

module.exports = { registerEvent, registerAudit };
