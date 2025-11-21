const mcpHelper = require('../mcp-helper');

jest.mock('axios');

describe('MCP Helper - Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerEvent', () => {
    it('should be a function', () => {
      expect(typeof mcpHelper.registerEvent).toBe('function');
    });

    it('should handle event registration', async () => {
      await expect(
        mcpHelper.registerEvent('notification.sent', { userId: '123' })
      ).resolves.not.toThrow();
    });
  });

  describe('registerAudit', () => {
    it('should be a function', () => {
      expect(typeof mcpHelper.registerAudit).toBe('function');
    });

    it('should handle audit registration', async () => {
      await expect(
        mcpHelper.registerAudit('email.sent', 'system', 'Email sent to user')
      ).resolves.not.toThrow();
    });
  });
});
