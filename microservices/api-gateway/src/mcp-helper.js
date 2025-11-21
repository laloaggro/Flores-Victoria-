/**
 * MCP Helper for API Gateway
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('../../shared/mcp');

// Create MCP helper instance for api-gateway
const { registerEvent, registerAudit } = createMcpHelper('api-gateway');

module.exports = { registerEvent, registerAudit };
