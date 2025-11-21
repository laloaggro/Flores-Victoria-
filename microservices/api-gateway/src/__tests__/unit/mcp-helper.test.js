const { registerEvent, registerAudit } = require('../../mcp-helper');
const axios = require('axios');

jest.mock('axios');
jest.mock('../../logger');

describe('MCP Helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerEvent', () => {
    it('should successfully register an event', async () => {
      axios.post.mockResolvedValue({ status: 200 });

      await registerEvent('user.login', { userId: '123', timestamp: Date.now() });

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/events'),
        expect.objectContaining({
          type: 'user.login',
          payload: expect.any(Object),
        })
      );
    });

    it('should handle errors gracefully when MCP is unavailable', async () => {
      axios.post.mockRejectedValue(new Error('Connection refused'));

      // Should not throw
      await expect(registerEvent('test.event', { data: 'test' })).resolves.not.toThrow();
    });

    it('should log error when registration fails', async () => {
      const logger = require('../../logger');
      axios.post.mockRejectedValue(new Error('Network error'));

      await registerEvent('test.event', { data: 'test' });

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('registerAudit', () => {
    it('should successfully register an audit entry', async () => {
      axios.post.mockResolvedValue({ status: 200 });

      await registerAudit('create_user', 'admin', 'User created successfully');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/audit'),
        expect.objectContaining({
          action: 'create_user',
          agent: 'admin',
          details: 'User created successfully',
        })
      );
    });

    it('should handle errors gracefully when MCP is unavailable', async () => {
      axios.post.mockRejectedValue(new Error('Connection refused'));

      // Should not throw
      await expect(registerAudit('test.action', 'agent', 'details')).resolves.not.toThrow();
    });

    it('should log error when audit registration fails', async () => {
      const logger = require('../../logger');
      axios.post.mockRejectedValue(new Error('Network error'));

      await registerAudit('test.action', 'agent', 'details');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple concurrent registrations', async () => {
      axios.post.mockResolvedValue({ status: 200 });

      const promises = [
        registerEvent('event1', { data: 1 }),
        registerEvent('event2', { data: 2 }),
        registerAudit('action1', 'agent1', 'details1'),
        registerAudit('action2', 'agent2', 'details2'),
      ];

      await Promise.all(promises);

      expect(axios.post).toHaveBeenCalledTimes(4);
    });
  });
});
