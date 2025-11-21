/**
 * MCP Helper for Notification Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('../../shared/mcp');

// Create MCP helper instance for notification service
const { registerEvent, registerAudit } = createMcpHelper('notification-service');

module.exports = { registerEvent, registerAudit };
