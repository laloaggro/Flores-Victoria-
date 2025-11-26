/**
 * MCP Helper for Review Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('@flores-victoria/shared/mcp');

// Create MCP helper instance for review service
const { registerEvent, registerAudit } = createMcpHelper('review-service');

module.exports = { registerEvent, registerAudit };
