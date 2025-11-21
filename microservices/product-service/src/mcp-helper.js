/**
 * MCP Helper for Product Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('../../shared/mcp');

// Create MCP helper instance for product service
const { registerEvent, registerAudit } = createMcpHelper('product-service');

module.exports = { registerEvent, registerAudit };
