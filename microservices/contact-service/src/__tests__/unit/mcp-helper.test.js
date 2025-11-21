/**
 * Tests para mcp-helper de contact-service
 */

const mcpHelper = require('../../mcp-helper');

describe('MCP Helper - Contact Service', () => {
  it('should be defined', () => {
    expect(mcpHelper).toBeDefined();
  });

  it('should export module', () => {
    expect(typeof mcpHelper).toBe('object');
  });
});
