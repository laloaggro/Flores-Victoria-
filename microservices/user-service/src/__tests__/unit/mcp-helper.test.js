/**
 * Tests para mcp-helper de user-service
 */

const mcpHelper = require('../../mcp-helper');

describe('MCP Helper - User Service', () => {
  it('should be defined', () => {
    expect(mcpHelper).toBeDefined();
  });

  it('should export helper module', () => {
    expect(typeof mcpHelper).toBe('object');
  });
});
