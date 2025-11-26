/**
 * MCP Helper for Wishlist Service
 * Uses shared MCP module to avoid code duplication
 */

const { createMcpHelper } = require('@flores-victoria/shared/mcp');

// Create MCP helper instance for wishlist service
const { registerEvent, registerAudit } = createMcpHelper('wishlist-service');

module.exports = { registerEvent, registerAudit };
