/**
 * MCP Helper for Auth Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('../../shared/mcp');

// Create MCP helper instance for auth service
const { registerEvent, registerAudit } = createMcpHelper('auth-service');

module.exports = { registerEvent, registerAudit };
