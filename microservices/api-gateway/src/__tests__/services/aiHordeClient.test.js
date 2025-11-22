/**
 * Tests para AI Horde Client
 */

const axios = require('axios');
const AIHordeClient = require('../../services/aiHordeClient');

jest.mock('axios');
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../../../shared/logging/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('AIHordeClient', () => {
  let client;
  const mockApiKey = 'test-horde-key';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AI_HORDE_API_KEY = mockApiKey;
  });

  afterEach(() => {
    delete process.env.AI_HORDE_API_KEY;
  });

  describe('Constructor', () => {
    it('should initialize with API key from parameter', () => {
      const customClient = new AIHordeClient('custom-key');
      expect(customClient.apiKey).toBe('custom-key');
    });

    it('should initialize with API key from environment', () => {
      client = new AIHordeClient();
      expect(client.apiKey).toBe(mockApiKey);
    });

    it('should use default anonymous key if none provided', () => {
      delete process.env.AI_HORDE_API_KEY;
      client = new AIHordeClient();
      expect(client.apiKey).toBe('w_IZELag4UqAHWijl6353Q');
    });

    it('should set apikey header', () => {
      client = new AIHordeClient();
      expect(client.headers.apikey).toBe(mockApiKey);
    });

    it('should set content-type header', () => {
      client = new AIHordeClient();
      expect(client.headers['Content-Type']).toBe('application/json');
    });

    it('should set client-agent header', () => {
      client = new AIHordeClient();
      expect(client.headers['Client-Agent']).toContain('FloresVictoria');
    });
  });

  describe('generateImage', () => {
    beforeEach(() => {
      client = new AIHordeClient();
    });

    it('should accept valid prompt', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      const result = await client.generateImage({ prompt: 'Beautiful roses' });
      expect(axios.post).toHaveBeenCalled();
    });

    it('should use default dimensions', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({ prompt: 'Flowers' });
      
      const payload = axios.post.mock.calls[0][1];
      expect(payload.params).toHaveProperty('width');
      expect(payload.params).toHaveProperty('height');
    });

    it('should accept custom width and height', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({
        prompt: 'Garden',
        width: 768,
        height: 768,
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.params.width).toBe(768);
      expect(payload.params.height).toBe(768);
    });

    it('should accept steps parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({
        prompt: 'Roses',
        steps: 30,
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.params.steps).toBe(30);
    });

    it('should accept cfg_scale parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({
        prompt: 'Bouquet',
        cfg_scale: 8.5,
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.params.cfg_scale).toBe(8.5);
    });

    it('should accept sampler_name parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({
        prompt: 'Flowers',
        sampler_name: 'k_dpm_2',
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.params.sampler_name).toBe('k_dpm_2');
    });

    it('should accept model parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({
        prompt: 'Garden',
        model: 'Deliberate',
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.models).toContain('Deliberate');
    });

    it('should handle API errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        client.generateImage({ prompt: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('Preset System', () => {
    beforeEach(() => {
      client = new AIHordeClient();
    });

    it('should accept scatter_flowers preset', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({ preset: 'scatter_flowers' });
      
      const payload = axios.post.mock.calls[0][1];
      expect(payload.prompt).toContain('flowers');
    });

    it('should accept hero_background preset', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({ preset: 'hero_background' });
      
      const payload = axios.post.mock.calls[0][1];
      expect(payload.prompt).toContain('background');
    });

    it('should override preset with custom prompt', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({
        preset: 'scatter_flowers',
        prompt: 'Custom roses',
      });
      
      const payload = axios.post.mock.calls[0][1];
      expect(payload.prompt).toBe('Custom roses');
    });
  });

  describe('API Communication', () => {
    beforeEach(() => {
      client = new AIHordeClient();
    });

    it('should use correct API endpoint for generation', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({ prompt: 'Test' });
      
      const url = axios.post.mock.calls[0][0];
      expect(url).toContain('aihorde.net');
    });

    it('should include apikey header', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          done: true,
          generations: [{ img: 'https://example.com/image.png' }],
        },
      });

      await client.generateImage({ prompt: 'Test' });
      
      const config = axios.post.mock.calls[0][2];
      expect(config.headers.apikey).toBeDefined();
    });

    it('should poll for job completion', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get
        .mockResolvedValueOnce({
          data: {
            done: false,
            wait_time: 5,
          },
        })
        .mockResolvedValueOnce({
          data: {
            done: true,
            generations: [{ img: 'https://example.com/image.png' }],
          },
        });

      await client.generateImage({ prompt: 'Test' });
      
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      client = new AIHordeClient();
    });

    it('should handle job submission errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('Submission failed'));

      await expect(
        client.generateImage({ prompt: 'Test' })
      ).rejects.toThrow();
    });

    it('should handle polling errors', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockRejectedValueOnce(new Error('Polling failed'));

      await expect(
        client.generateImage({ prompt: 'Test' })
      ).rejects.toThrow();
    });

    it('should handle timeout', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 'job-123' },
      });

      axios.get.mockResolvedValue({
        data: {
          done: false,
          wait_time: 999,
        },
      });

      await expect(
        client.generateImage({ prompt: 'Test', timeout: 1000 })
      ).rejects.toThrow();
    });
  });
});
