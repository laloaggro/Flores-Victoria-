const express = require('express');

const AIHordeClient = require('../services/aiHordeClient');
const HuggingFaceClient = require('../services/huggingFaceClient');
const LeonardoClient = require('../services/leonardoClient');

const router = express.Router();

// Clientes disponibles (prioridad: Leonardo > HF > AI Horde)
let leonardoClient = null;
try {
  leonardoClient = new LeonardoClient();
  console.log('✅ Leonardo.ai disponible (150 créditos/día)');
} catch (e) {
  console.warn('⚠️  Leonardo.ai no disponible:', e.message);
}

let hfClient = null;
try {
  hfClient = new HuggingFaceClient();
} catch (e) {
  console.warn('⚠️  Hugging Face no disponible:', e.message);
}

const aiHorde = new AIHordeClient();

/**
 * POST /api/ai-images/generate
 * Genera imágenes con AI (Leonardo prioritario, HF y AI Horde fallback)
 */
router.post('/generate', async (req, res) => {
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
      provider, // 'leonardo', 'huggingface', 'ai-horde', o 'auto'
    } = req.body;

    if (!prompt && !preset) {
      return res.status(400).json({
        error: 'Se requiere "prompt" o "preset"',
        presets: ['scatter_flowers', 'hero_background'],
        providers: leonardoClient 
          ? ['leonardo', 'huggingface', 'ai-horde', 'auto'] 
          : hfClient 
            ? ['huggingface', 'ai-horde', 'auto']
            : ['ai-horde'],
      });
    }

    // Determinar provider (Leonardo > HF > AI Horde)
    let selectedProvider = provider;
    if (!selectedProvider || selectedProvider === 'auto') {
      if (leonardoClient) {
        selectedProvider = 'leonardo';
      } else if (hfClient) {
        selectedProvider = 'huggingface';
      } else {
        selectedProvider = 'ai-horde';
      }
    }

    let result;

    if (selectedProvider === 'leonardo' && leonardoClient) {
      // Usar Leonardo.ai (ultra rápido, 3-8 seg, 150/día)
      result = await leonardoClient.generateImage({
        prompt,
        negative_prompt,
        width,
        height,
        num_inference_steps: num_inference_steps || steps || 30,
        guidance_scale: guidance_scale || cfg_scale || 7,
        model: model || 'leonardo-diffusion',
      });
    } else if (selectedProvider === 'huggingface' && hfClient) {
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
    console.error('Error generando imagen:', error);
    
    // Si Leonardo falla por cuota, intentar fallback
    if (error.message && error.message.includes('150 créditos')) {
      console.log('💡 Leonardo sin créditos, usando AI Horde como fallback...');
      try {
        const result = await aiHorde.generateImage({
          prompt: req.body.prompt,
          width: req.body.width || 512,
          height: req.body.height || 512,
        });
        return res.json(result);
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
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
 * Estado del servicio y créditos disponibles
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      providers: {
        leonardo: {
          available: !!leonardoClient,
          credits_per_day: 150,
          speed: '3-8 segundos',
          priority: 1,
        },
        huggingface: {
          available: !!hfClient,
          speed: '5-15 segundos',
          priority: 2,
          note: 'Cuota mensual limitada',
        },
        ai_horde: {
          available: true,
          credits: 'Ilimitado',
          speed: '10-60 segundos',
          priority: 3,
        },
      },
    };

    // Obtener info de Leonardo si está disponible
    if (leonardoClient) {
      try {
        const leonardoInfo = await leonardoClient.getUserInfo();
        status.providers.leonardo.user_info = {
          tokens_available: leonardoInfo.subscription_tokens,
          api_credits: leonardoInfo.api_credit,
          renewal_date: leonardoInfo.token_renewal_date,
        };
      } catch (e) {
        status.providers.leonardo.error = 'No se pudo obtener información de cuenta';
      }
    }

    // Estado de AI Horde
    try {
      const hordeStatus = await aiHorde.getServiceStatus();
      status.providers.ai_horde.service_status = hordeStatus;
    } catch (e) {
      // Ignorar si falla
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
