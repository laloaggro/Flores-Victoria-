/**
 * @fileoverview AI Image Generation Routes
 * @description Endpoints para generación de imágenes con IA (Hugging Face, AI Horde)
 * @version 4.0.0 - Eliminado Leonardo.ai, Hugging Face como principal
 */
const express = require('express');
const { createLogger } = require('@flores-victoria/shared/logging');

// Rate limiter con fallback
let uploadLimiter = (req, res, next) => next(); // Default passthrough middleware
try {
  const rateLimiterModule = require('@flores-victoria/shared/middleware/rate-limiter');
  if (rateLimiterModule && rateLimiterModule.uploadLimiter) {
    uploadLimiter = rateLimiterModule.uploadLimiter;
  } else {
    console.warn(
      '[aiImages] uploadLimiter no disponible en rate-limiter module, usando passthrough'
    );
  }
} catch (error) {
  console.warn(
    '[aiImages] Rate limiter no disponible, usando passthrough middleware:',
    error.message
  );
}

const AIHordeClient = require('../services/aiHordeClient');
const HuggingFaceClient = require('../services/huggingFaceClient');

const router = express.Router();
const logger = createLogger('ai-images-routes');

// Clientes disponibles (prioridad: HF > AI Horde)
let hfClient = null;
try {
  hfClient = new HuggingFaceClient();
  logger.info('Hugging Face disponible como proveedor principal de IA');
} catch (e) {
  logger.warn('Hugging Face no disponible', { error: e.message });
}

const aiHorde = new AIHordeClient();
logger.info('AI Horde disponible como proveedor de respaldo');

/**
 * POST /api/ai-images/generate
 * Genera imágenes con AI (Hugging Face prioritario, AI Horde fallback)
 * Rate limited: 50 requests/hora
 */
router.post('/generate', uploadLimiter, async (req, res) => {
  try {
    const {
      prompt,
      negative_prompt,
      width,
      height,
      steps,
      cfg_scale,
      guidance_scale,
      num_inference_steps,
      sampler_name,
      model,
      preset,
      provider, // 'huggingface', 'ai-horde', o 'auto'
    } = req.body;

    if (!prompt && !preset) {
      return res.status(400).json({
        error: 'Se requiere "prompt" o "preset"',
        presets: ['scatter_flowers', 'hero_background'],
        providers: hfClient
          ? ['huggingface', 'ai-horde', 'auto']
          : ['ai-horde'],
      });
    }

    // Determinar provider (HF > AI Horde)
    let selectedProvider = provider;
    if (!selectedProvider || selectedProvider === 'auto') {
      selectedProvider = hfClient ? 'huggingface' : 'ai-horde';
    }

    let result;

    if (selectedProvider === 'huggingface' && hfClient) {
      // Usar Hugging Face (rápido, 5-15 seg)
      result = await hfClient.generateImage({
        prompt,
        negative_prompt,
        width,
        height,
        num_inference_steps: num_inference_steps || steps || 25,
        guidance_scale: guidance_scale || cfg_scale || 7.5,
        model: model || 'flux-schnell',
      });
    } else {
      // Usar AI Horde (gratis ilimitado pero más lento)
      result = await aiHorde.generateImage({
        prompt,
        negative_prompt,
        width,
        height,
        steps,
        cfg_scale,
        sampler_name,
        model,
        preset,
      });
    }

    res.json(result);
  } catch (error) {
    logger.error('Error generando imagen', { error: error.message });

    // Fallback a AI Horde si HF falla
    if (error.message?.includes('rate') || error.message?.includes('limit') || error.message?.includes('quota')) {
      logger.info('Hugging Face con límite alcanzado, usando AI Horde como fallback...');
      try {
        const result = await aiHorde.generateImage({
          prompt: req.body.prompt,
          width: req.body.width || 512,
          height: req.body.height || 512,
        });
        return res.json(result);
      } catch (fallbackError) {
        logger.error('Error en fallback', { error: fallbackError.message });
        return res.status(500).json({
          success: false,
          error: 'Error en todos los servicios de IA',
        });
      }
    }

    res.status(500).json({
      error: 'Error generando imagen',
      message: error.message,
    });
  }
});

/**
 * GET /api/ai-images/presets
 * Lista presets disponibles
 */
router.get('/presets', (req, res) => {
  res.json({
    scatter_flowers: {
      description: 'Flores variadas dispersas en fondo blanco (para about page)',
      dimensions: '1536x1024',
    },
    hero_background: {
      description: 'Fondo elegante desenfocado para hero sections',
      dimensions: '1920x1080',
    },
  });
});

/**
 * GET /api/ai-images/models
 * Modelos disponibles en AI Horde
 */
router.get('/models', async (req, res) => {
  try {
    const models = await aiHorde.getAvailableModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai-images/status
 * Estado del servicio y proveedores disponibles
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      providers: {
        huggingface: {
          available: !!hfClient,
          speed: '5-15 segundos',
          priority: 1,
          note: 'Proveedor principal - API gratuita con cuota',
        },
        ai_horde: {
          available: true,
          credits: 'Ilimitado',
          speed: '10-60 segundos',
          priority: 2,
          note: 'Proveedor de respaldo - gratuito e ilimitado',
        },
      },
    };

    // Estado de AI Horde
    try {
      const hordeStatus = await aiHorde.getServiceStatus();
      status.providers.ai_horde.service_status = hordeStatus;
    } catch (_e) {
      // Ignorar si falla
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
