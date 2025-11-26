/**
 * MCP Helper for Order Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('@flores-victoria/shared/mcp');

// Create MCP helper instance for order service
const { registerEvent, registerAudit } = createMcpHelper('order-service');

module.exports = { registerEvent, registerAudit };
