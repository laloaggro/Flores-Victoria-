/**
 * Tests para Hugging Face Client
 */

const axios = require('axios');

// Mock fs ANTES de importar el cliente
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('test')),
  },
}));

// Mock del logger compartido
jest.mock('@flores-victoria/shared/logging', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock('axios');

const HuggingFaceClient = require('../../services/huggingFaceClient');

describe('HuggingFaceClient', () => {
  let client;
  const mockToken = 'test-hf-token';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HF_TOKEN = mockToken;
  });

  afterEach(() => {
    delete process.env.HF_TOKEN;
    delete process.env.HUGGING_FACE_TOKEN;
  });

  describe('Constructor', () => {
    it('should initialize with token from parameter', () => {
      const customClient = new HuggingFaceClient('custom-token');
      expect(customClient.apiToken).toBe('custom-token');
    });

    it('should initialize with HF_TOKEN from environment', () => {
      client = new HuggingFaceClient();
      expect(client.apiToken).toBe(mockToken);
    });

    it('should initialize with HUGGING_FACE_TOKEN from environment', () => {
      delete process.env.HF_TOKEN;
      process.env.HUGGING_FACE_TOKEN = 'alt-token';
      client = new HuggingFaceClient();
      expect(client.apiToken).toBe('alt-token');
    });

    it('should throw error if no token provided', () => {
      delete process.env.HF_TOKEN;
      expect(() => new HuggingFaceClient()).toThrow('HF_TOKEN no configurado');
    });

    it('should set authorization header', () => {
      client = new HuggingFaceClient();
      expect(client.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should set content-type header', () => {
      client = new HuggingFaceClient();
      expect(client.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('generateImage', () => {
    beforeEach(() => {
      client = new HuggingFaceClient();
    });

    it('should require prompt', async () => {
      await expect(client.generateImage()).rejects.toThrow('Prompt es requerido');
    });

    it('should accept valid prompt', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      const result = await client.generateImage({ prompt: 'Beautiful roses' });
      expect(axios.post).toHaveBeenCalled();
    });

    it('should use default model (flux-schnell)', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({ prompt: 'Flowers' });

      const url = axios.post.mock.calls[0][0];
      expect(url).toContain('FLUX.1-schnell');
    });

    it('should accept custom model', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({
        prompt: 'Garden',
        model: 'flux-dev',
      });

      const url = axios.post.mock.calls[0][0];
      expect(url).toContain('FLUX.1-dev');
    });

    it('should accept width and height parameters', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({
        prompt: 'Roses',
        width: 768,
        height: 768,
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.parameters.width).toBe(768);
      expect(payload.parameters.height).toBe(768);
    });

    it('should accept negative_prompt parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({
        prompt: 'Bouquet',
        negative_prompt: 'blurry, ugly',
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.parameters.negative_prompt).toBe('blurry, ugly');
    });

    it('should accept num_inference_steps parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({
        prompt: 'Flowers',
        num_inference_steps: 30,
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.parameters.num_inference_steps).toBe(30);
    });

    it('should accept guidance_scale parameter', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({
        prompt: 'Garden',
        guidance_scale: 8.0,
      });

      const payload = axios.post.mock.calls[0][1];
      expect(payload.parameters.guidance_scale).toBe(8.0);
    });

    it('should handle API errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.generateImage({ prompt: 'Test' })).rejects.toThrow();
    });

    it('should handle model loading state', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 503,
          data: { error: 'Model is loading' },
        },
      });

      await expect(client.generateImage({ prompt: 'Test' })).rejects.toThrow();
    });
  });

  describe('API Communication', () => {
    beforeEach(() => {
      client = new HuggingFaceClient();
    });

    it('should use correct API endpoint', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({ prompt: 'Flowers' });

      const url = axios.post.mock.calls[0][0];
      expect(url).toContain('api-inference.huggingface.co');
    });

    it('should include authorization header', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({ prompt: 'Test' });

      const config = axios.post.mock.calls[0][2];
      expect(config.headers.Authorization).toContain('Bearer');
    });

    it('should set responseType to arraybuffer', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({ prompt: 'Test' });

      const config = axios.post.mock.calls[0][2];
      expect(config.responseType).toBe('arraybuffer');
    });
  });

  describe('Available Models', () => {
    beforeEach(() => {
      client = new HuggingFaceClient();
    });

    it('should support flux-schnell model', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({
        prompt: 'Test',
        model: 'flux-schnell',
      });

      const url = axios.post.mock.calls[0][0];
      expect(url).toContain('FLUX.1-schnell');
    });

    it('should support flux-dev model', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({
        prompt: 'Test',
        model: 'flux-dev',
      });

      const url = axios.post.mock.calls[0][0];
      expect(url).toContain('FLUX.1-dev');
    });

    it('should support sdxl model', async () => {
      axios.post.mockResolvedValueOnce({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/png' },
      });

      await client.generateImage({
        prompt: 'Test',
        model: 'sdxl',
      });

      const url = axios.post.mock.calls[0][0];
      expect(url).toContain('stable-diffusion-xl');
    });
  });
});
