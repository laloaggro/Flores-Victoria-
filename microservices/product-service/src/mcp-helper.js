/**
 * MCP Helper for Product Service
 * Uses shared MCP module to avoid code duplication
 * 
 * NOTE: MCP integration disabled in dev-simple environment (no MCP server available)
 */

// NO-OP functions - MCP server not available in dev-simple
const registerEvent = async () => {};
const registerAudit = async () => {};

module.exports = { registerEvent, registerAudit };
