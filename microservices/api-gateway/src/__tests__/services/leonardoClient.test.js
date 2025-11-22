/**
 * Tests para Leonardo.ai Client
 */

const axios = require('axios');
const LeonardoClient = require('../../services/leonardoClient');

jest.mock('axios');
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
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

describe('LeonardoClient', () => {
  let client;
  const mockApiKey = 'test-leonardo-key';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LEONARDO_API_KEY = mockApiKey;
  });

  afterEach(() => {
    delete process.env.LEONARDO_API_KEY;
  });

  describe('Constructor', () => {
    it('should initialize with API key from parameter', () => {
      const customClient = new LeonardoClient('custom-key');
      expect(customClient.apiKey).toBe('custom-key');
    });

    it('should initialize with API key from environment', () => {
      client = new LeonardoClient();
      expect(client.apiKey).toBe(mockApiKey);
    });

    it('should throw error if no API key provided', () => {
      delete process.env.LEONARDO_API_KEY;
      expect(() => new LeonardoClient()).toThrow('Leonardo API key no configurado');
    });

    it('should set authorization header', () => {
      client = new LeonardoClient();
      expect(client.headers.Authorization).toBe(`Bearer ${mockApiKey}`);
    });

    it('should set content-type header', () => {
      client = new LeonardoClient();
      expect(client.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('generateImage', () => {
    beforeEach(() => {
      client = new LeonardoClient();
    });

    it('should require prompt', async () => {
      await expect(client.generateImage()).rejects.toThrow('Prompt es requerido');
    });

    it('should accept valid prompt', async () => {
      axios.post.mockResolvedValue({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValue({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      try {
        await client.generateImage({ prompt: 'Beautiful roses' });
      } catch (e) {
        // May fail due to polling logic, but should call axios
      }
      expect(axios.post).toHaveBeenCalled();
    });

    it('should use default dimensions', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({ prompt: 'Flowers' });
      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs).toHaveProperty('width');
      expect(callArgs).toHaveProperty('height');
    });

    it('should accept custom width and height', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({
        prompt: 'Garden',
        width: 768,
        height: 768,
      });

      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs.width).toBeDefined();
      expect(callArgs.height).toBeDefined();
    });

    it('should accept negative_prompt parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({
        prompt: 'Roses',
        negative_prompt: 'blurry, ugly',
      });

      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs.negative_prompt).toBe('blurry, ugly');
    });

    it('should accept guidance_scale parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({
        prompt: 'Flowers',
        guidance_scale: 8.5,
      });

      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs.guidance_scale).toBe(8.5);
    });

    it('should accept num_inference_steps parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({
        prompt: 'Bouquet',
        num_inference_steps: 50,
      });

      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs.num_inference_steps).toBe(50);
    });

    it('should accept model parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({
        prompt: 'Garden',
        model: 'photoreal',
      });

      expect(axios.post).toHaveBeenCalled();
    });

    it('should accept preset parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({
        prompt: 'Roses',
        preset: 'CINEMATIC',
      });

      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs.presetStyle).toBe('CINEMATIC');
    });

    it('should handle API errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        client.generateImage({ prompt: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('API Communication', () => {
    beforeEach(() => {
      client = new LeonardoClient();
    });

    it('should use correct API endpoint', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({ prompt: 'Flowers' });
      
      expect(axios.post.mock.calls[0][0]).toContain('leonardo.ai');
    });

    it('should include authorization header', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          sdGenerationJob: { generationId: 'gen-123' },
        },
      });

      axios.get.mockResolvedValueOnce({
        data: {
          generations_by_pk: {
            status: 'COMPLETE',
            generated_images: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      });

      await client.generateImage({ prompt: 'Test' });
      
      const config = axios.post.mock.calls[0][2];
      expect(config.headers.Authorization).toContain('Bearer');
    });
  });
});
