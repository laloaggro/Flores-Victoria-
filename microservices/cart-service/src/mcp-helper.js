/**
 * MCP Helper for Cart Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('@flores-victoria/shared/mcp');

// Create MCP helper instance for cart service
const { registerEvent, registerAudit } = createMcpHelper('cart-service');

module.exports = { registerEvent, registerAudit };
