// MCP Helper - Facilita integración con MCP server
// Bilingüe ES/EN

const axios = require('axios');
const MCP_URL = process.env.MCP_URL || 'http://mcp-server:5050';

/**
 * Registrar evento personalizado en MCP / Register custom event in MCP
 * @param {string} type - Tipo de evento / Event type
 * @param {object} payload - Datos del evento / Event data
 */
async function registerEvent(type, payload) {
  try {
    await axios.post(`${MCP_URL}/events`, { type, payload });
  } catch (err) {
    console.error('Error al registrar evento en MCP:', err.message);
  }
}

/**
 * Registrar auditoría en MCP / Register audit in MCP
 * @param {string} action - Acción realizada / Action performed
 * @param {string} agent - Agente responsable / Responsible agent
 * @param {string} details - Detalles / Details
 */
async function registerAudit(action, agent, details) {
  try {
    await axios.post(`${MCP_URL}/audit`, { action, agent, details });
  } catch (err) {
    console.error('Error al registrar auditoría en MCP:', err.message);
  }
}

module.exports = { registerEvent, registerAudit };
