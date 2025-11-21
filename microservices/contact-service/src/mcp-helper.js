/**
 * MCP Helper for Contact Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('../../shared/mcp');

// Create MCP helper instance for contact service
const { registerEvent, registerAudit } = createMcpHelper('contact-service');

module.exports = { registerEvent, registerAudit };
