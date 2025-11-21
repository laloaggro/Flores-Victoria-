/**
 * MCP Helper - Módulo compartido para integración con MCP Server
 * Shared MCP Helper - For integration with MCP Server
 *
 * Este módulo centraliza la lógica de comunicación con el MCP Server
 * para evitar duplicación de código entre microservicios.
 */

const { createLogger } = require('../logging/logger');

// Lazy load axios to handle environments where it's not installed
let axios;
try {
  axios = require('axios');
} catch (_e) {
  axios = null;
}

const MCP_URL = process.env.MCP_URL || 'http://mcp-server:5050';

/**
 * Crea funciones de MCP helper para un servicio específico
 * @param {string} serviceName - Nombre del servicio que usa el helper
 * @returns {object} Objeto con funciones registerEvent y registerAudit
 */
function createMcpHelper(serviceName = 'unknown-service') {
  const logger = createLogger(serviceName);

  // Log warning once if axios is not available
  if (!axios) {
    logger.warn(
      { service: serviceName },
      '⚠️ axios no está disponible. Las llamadas a MCP serán NO-OP.'
    );
  }

  /**
   * Registrar evento personalizado en MCP
   * Register custom event in MCP
   * @param {string} type - Tipo de evento / Event type
   * @param {object} payload - Datos del evento / Event data
   */
  async function registerEvent(type, payload) {
    if (!axios) {
      logger.warn(
        { service: serviceName },
        'registerEvent: axios no disponible, evento no enviado'
      );
      return;
    }

    try {
      await axios.post(`${MCP_URL}/events`, { type, payload });
      logger.debug({ service: serviceName, type, payload }, 'Evento registrado en MCP');
    } catch (err) {
      logger.error(
        { service: serviceName, type, err: err.message },
        'Error al registrar evento en MCP'
      );
    }
  }

  /**
   * Registrar auditoría en MCP
   * Register audit in MCP
   * @param {string} action - Acción realizada / Action performed
   * @param {string} agent - Agente responsable / Responsible agent
   * @param {string} details - Detalles / Details
   */
  async function registerAudit(action, agent, details) {
    if (!axios) {
      logger.warn(
        { service: serviceName },
        'registerAudit: axios no disponible, auditoría no enviada'
      );
      return;
    }

    try {
      await axios.post(`${MCP_URL}/audit`, { action, agent, details });
      logger.debug({ service: serviceName, action, agent }, 'Auditoría registrada en MCP');
    } catch (err) {
      logger.error(
        { service: serviceName, action, err: err.message },
        'Error al registrar auditoría en MCP'
      );
    }
  }

  return {
    registerEvent,
    registerAudit,
  };
}

module.exports = { createMcpHelper };
