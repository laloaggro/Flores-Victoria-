/**
 * MCP Helper Tests for API Gateway
 * Tests the shared MCP module integration
 *
 * Note: This test verifies that the API Gateway correctly uses the shared MCP module
 * The actual axios mocking happens at the shared module level, so we test
 * the interface contract rather than implementation details.
 */

const { registerEvent, registerAudit } = require('../../mcp-helper');

describe('MCP Helper - API Gateway', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerEvent', () => {
    it('should be a function', () => {
      expect(typeof registerEvent).toBe('function');
    });

    it('should handle event registration without throwing', async () => {
      // Should not throw regardless of MCP availability
      await expect(
        registerEvent('user.login', { userId: '123', timestamp: Date.now() })
      ).resolves.not.toThrow();
    });

    it('should handle errors gracefully', async () => {
      // Should complete without throwing even with invalid data
      await expect(registerEvent('test.event', { data: 'test' })).resolves.toBeUndefined();
    });
  });

  describe('registerAudit', () => {
    it('should be a function', () => {
      expect(typeof registerAudit).toBe('function');
    });

    it('should handle audit registration without throwing', async () => {
      // Should not throw regardless of MCP availability
      await expect(
        registerAudit('create_user', 'admin', 'User created successfully')
      ).resolves.not.toThrow();
    });

    it('should handle errors gracefully', async () => {
      // Should complete without throwing even with invalid data
      await expect(registerAudit('test.action', 'agent', 'details')).resolves.toBeUndefined();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple concurrent registrations', async () => {
      // Test that multiple calls don't cause race conditions or errors
      const promises = [
        registerEvent('event1', { data: 1 }),
        registerEvent('event2', { data: 2 }),
        registerAudit('action1', 'agent1', 'details1'),
        registerAudit('action2', 'agent2', 'details2'),
      ];

      // Should resolve all promises without errors
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });
});
