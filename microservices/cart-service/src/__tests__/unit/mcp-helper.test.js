/**
 * Tests para mcp-helper de cart-service
 */

const mcpHelper = require('../../mcp-helper');

describe('MCP Helper - Cart Service', () => {
  it('should be defined', () => {
    expect(mcpHelper).toBeDefined();
  });

  it('should export helper functions', () => {
    expect(typeof mcpHelper).toBe('object');
  });
});
