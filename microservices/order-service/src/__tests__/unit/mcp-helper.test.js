/**
 * Tests para mcp-helper de order-service
 */

const mcpHelper = require('../../mcp-helper');

describe('MCP Helper - Order Service', () => {
  it('should be defined', () => {
    expect(mcpHelper).toBeDefined();
  });

  it('should export helper functions', () => {
    expect(typeof mcpHelper).toBe('object');
  });
});
