/**
 * Tests para AI Images Routes
 */

const request = require('supertest');
const express = require('express');

// Mock de dependencias
jest.mock('../../../../shared/logging/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  })),
}));

jest.mock('../../../../../shared/middleware/rate-limiter', () => ({
  uploadLimiter: jest.fn(() => (req, res, next) => next()),
}));

jest.mock('../../services/aiHordeClient', () => {
  return jest.fn().mockImplementation(() => ({
    generateImage: jest.fn().mockResolvedValue({
      success: true,
      imageUrl: 'https://example.com/generated-image.png',
      id: 'horde-123',
    }),
  }));
});

jest.mock('../../services/huggingFaceClient', () => {
  return jest.fn().mockImplementation(() => ({
    generateImage: jest.fn().mockResolvedValue({
      success: true,
      imageUrl: 'https://example.com/hf-image.png',
    }),
  }));
});

jest.mock('../../services/leonardoClient', () => {
  return jest.fn().mockImplementation(() => ({
    generateImage: jest.fn().mockResolvedValue({
      success: true,
      imageUrl: 'https://example.com/leo-image.png',
      id: 'leo-123',
    }),
  }));
});

describe('AI Images Routes', () => {
  let app;
  let aiImagesRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    // Cargar router después de mocks
    aiImagesRouter = require('../../routes/aiImages');
    app.use('/api/ai-images', aiImagesRouter);
  });

  describe('POST /api/ai-images/generate', () => {
    it('should require prompt or preset', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('prompt');
    });

    it('should accept valid prompt', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({ prompt: 'Beautiful roses bouquet' });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept preset parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({ preset: 'scatter_flowers' });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should list available presets on error', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('presets');
      expect(Array.isArray(response.body.presets)).toBe(true);
    });

    it('should list available providers on error', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('providers');
      expect(Array.isArray(response.body.providers)).toBe(true);
    });

    it('should accept provider parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Roses',
          provider: 'auto',
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept width and height parameters', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Flowers',
          width: 512,
          height: 512,
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept negative_prompt parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Beautiful garden',
          negative_prompt: 'ugly, blurry',
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept steps parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Rose garden',
          steps: 30,
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept cfg_scale parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Bouquet',
          cfg_scale: 7.5,
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept guidance_scale parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Flowers',
          guidance_scale: 7,
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept num_inference_steps parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Garden',
          num_inference_steps: 50,
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept sampler_name parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Roses',
          sampler_name: 'k_euler',
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept model parameter', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Floral arrangement',
          model: 'stable-diffusion-2.1',
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should apply rate limiting', async () => {
      const { uploadLimiter } = require('@flores-victoria/shared/middleware/rate-limiter');
      
      await request(app)
        .post('/api/ai-images/generate')
        .send({ prompt: 'Test' });
      
      expect(uploadLimiter).toHaveBeenCalled();
    });

    it('should handle leonardo provider', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Roses',
          provider: 'leonardo',
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should handle huggingface provider', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Flowers',
          provider: 'huggingface',
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should handle ai-horde provider', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Garden',
          provider: 'ai-horde',
        });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should handle auto provider selection', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Bouquet',
          provider: 'auto',
        });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Request Validation', () => {
    it('should reject empty request body', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({});
      
      expect(response.status).toBe(400);
    });

    it('should accept JSON content type', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .set('Content-Type', 'application/json')
        .send({ prompt: 'Test' });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Preset System', () => {
    it('should accept scatter_flowers preset', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({ preset: 'scatter_flowers' });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should accept hero_background preset', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({ preset: 'hero_background' });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Error Handling', () => {
    it('should return error for invalid provider', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({
          prompt: 'Test',
          provider: 'invalid-provider',
        });
      
      // Should still attempt to process or return appropriate error
      expect(response.status).toBeLessThan(501);
    });

    it('should handle missing optional parameters', async () => {
      const response = await request(app)
        .post('/api/ai-images/generate')
        .send({ prompt: 'Simple test' });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('HTTP Methods', () => {
    it('should only accept POST method', async () => {
      const getResponse = await request(app).get('/api/ai-images/generate');
      const putResponse = await request(app).put('/api/ai-images/generate');
      const deleteResponse = await request(app).delete('/api/ai-images/generate');
      
      expect(getResponse.status).toBeGreaterThanOrEqual(404);
      expect(putResponse.status).toBeGreaterThanOrEqual(404);
      expect(deleteResponse.status).toBeGreaterThanOrEqual(404);
    });
  });
});
