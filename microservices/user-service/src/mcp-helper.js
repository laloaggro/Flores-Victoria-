/**
 * MCP Helper for User Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('@flores-victoria/shared/mcp');

// Create MCP helper instance for user service
const { registerEvent, registerAudit } = createMcpHelper('user-service');

module.exports = { registerEvent, registerAudit };
