/**
 * AI Horde API Client
 * Cliente para generación de imágenes usando aihorde.net (100% gratis)
 * Documentación: https://aihorde.net/api
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { createLogger } = require('@flores-victoria/shared/logging');

const logger = createLogger('aihorde-client');
const AI_HORDE_API_BASE = 'https://aihorde.net/api/v2';
// En container, usar volumen montado; en desarrollo local, path relativo
const CACHE_DIR =
  process.env.NODE_ENV === 'production'
    ? '/app/ai-cache/images'
    : path.join(__dirname, '../../../../services/ai-image-service/cache/images');

// Presets de prompts optimizados
const PROMPT_PRESETS = {
  scatter_flowers: {
    prompt:
      'professional product photography of many assorted fresh flowers scattered on pure white background, no vase, vibrant colors, roses, tulips, gerberas, lilies, carnations, daisies, high detail, studio lighting, realistic, 8k',
    negative_prompt: 'vase, pot, container, dark background, blurry, low quality, watermark, text',
    params: {
      width: 512,
      height: 512,
      steps: 20,
      cfg_scale: 7.5,
      sampler_name: 'k_euler_a',
    },
  },
  hero_background: {
    prompt:
      'elegant blurred flower bouquet background, soft focus, desaturated pastel colors, professional photography, dreamy atmosphere, high resolution',
    negative_prompt: 'sharp, busy, cluttered, text, watermark',
    params: {
      width: 768,
      height: 512,
      steps: 20,
      cfg_scale: 6.0,
      sampler_name: 'k_dpmpp_2m',
    },
  },
};

class AIHordeClient {
  constructor(apiKey = null) {
    // Prioridad: 1) parámetro, 2) env var, 3) API key registrada, 4) anonymous
    this.apiKey = apiKey || process.env.AI_HORDE_API_KEY || 'w_IZELag4UqAHWijl6353Q';
    this.headers = {
      apikey: this.apiKey,
      'Content-Type': 'application/json',
      'Client-Agent': 'FloresVictoria:1.0:laloaggro',
    };
  }

  /**
   * Genera imagen asíncrona con AI Horde
   * @param {Object} options - Opciones de generación
   * @returns {Promise<Object>} Resultado con URL de imagen
   */
  async generateImage(options = {}) {
    const {
      prompt,
      width = 512,
      height = 512,
      steps = 20,
      cfg_scale = 7.5,
      sampler_name = 'k_euler_a',
      model = 'Deliberate', // Modelo popular con workers disponibles
      preset = null,
      timeout = 180000, // 3 minutos max
    } = options;

    // Si hay preset, úsalo
    let finalPrompt = prompt;
    let finalParams = { width, height, steps, cfg_scale, sampler_name };

    if (preset && PROMPT_PRESETS[preset]) {
      const presetData = PROMPT_PRESETS[preset];
      finalPrompt = prompt || presetData.prompt;
      finalParams = { ...presetData.params, ...finalParams };
    }

    logger.info('AI Horde: Generando imagen...', {
      prompt: finalPrompt.substring(0, 80),
      width: finalParams.width,
      height: finalParams.height,
    });

    try {
      // 1. Enviar job asíncrono
      const jobResponse = await axios.post(
        `${AI_HORDE_API_BASE}/generate/async`,
        {
          prompt: finalPrompt,
          params: {
            width: finalParams.width,
            height: finalParams.height,
            steps: finalParams.steps,
            cfg_scale: finalParams.cfg_scale,
            sampler_name: finalParams.sampler_name,
            n: 1, // 1 imagen
            post_processing: ['GFPGAN'], // mejora facial opcional
          },
          nsfw: false,
          censor_nsfw: true,
          trusted_workers: false,
          slow_workers: true,
          workers: [],
          models: [model],
          r2: true, // Usar R2 storage para URLs rápidas
          shared: false,
          replacement_filter: true,
        },
        { headers: this.headers }
      );

      const jobId = jobResponse.data.id;
      logger.debug('Job ID:', { jobId });

      // 2. Poll hasta completar
      const result = await this.waitForJob(jobId, timeout);

      // 3. Descargar y cachear
      if (result.generations && result.generations.length > 0) {
        const generation = result.generations[0];
        const imageUrl = generation.img;

        // Descargar imagen
        const imageBuffer = await this.downloadImage(imageUrl);

        // Cachear localmente
        const hash = crypto.createHash('md5').update(finalPrompt).digest('hex');
        const filename = `ai-horde-${hash}.png`;
        const cachePath = path.join(CACHE_DIR, filename);

        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.writeFile(cachePath, imageBuffer);

        logger.info('Imagen generada y cacheada', { filename });

        return {
          success: true,
          filename,
          url: imageUrl,
          localPath: cachePath,
          publicUrl: `/images/productos/${filename}`, // Para servir via frontend
          metadata: {
            prompt: finalPrompt,
            model: generation.model,
            seed: generation.seed,
            kudos: result.kudos,
            worker_id: generation.worker_id,
            worker_name: generation.worker_name,
          },
        };
      } else {
        throw new Error('No se generaron imágenes');
      }
    } catch (error) {
      logger.error('Error AI Horde:', { error: error.message });
      throw error;
    }
  }

  /**
   * Espera a que complete un job
   */
  async waitForJob(jobId, timeout = 180000) {
    const startTime = Date.now();
    const pollInterval = 3000; // 3 segundos

    while (Date.now() - startTime < timeout) {
      try {
        const checkResponse = await axios.get(`${AI_HORDE_API_BASE}/generate/check/${jobId}`, {
          headers: this.headers,
        });

        const status = checkResponse.data;

        if (status.done) {
          // Job completado, obtener resultado final
          const statusResponse = await axios.get(`${AI_HORDE_API_BASE}/generate/status/${jobId}`, {
            headers: this.headers,
          });
          return statusResponse.data;
        }

        if (status.faulted) {
          throw new Error('Job falló en AI Horde');
        }

        // Log progreso
        const queuePosition = status.queue_position || 0;
        const waitTime = status.wait_time || 0;
        logger.debug('Estado de cola:', { queuePosition, waitTime });

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw new Error('Job no encontrado en AI Horde');
        }
        throw error;
      }
    }

    throw new Error('Timeout esperando generación de AI Horde');
  }

  /**
   * Descarga imagen desde URL
   */
  async downloadImage(url) {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    return Buffer.from(response.data);
  }

  /**
   * Obtiene info de modelos disponibles
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${AI_HORDE_API_BASE}/status/models`, {
        headers: this.headers,
      });
      return response.data.filter((m) => m.type === 'image');
    } catch (error) {
      logger.error('Error obteniendo modelos:', { error: error.message });
      return [];
    }
  }

  /**
   * Obtiene estado del servicio
   */
  async getServiceStatus() {
    try {
      const response = await axios.get(`${AI_HORDE_API_BASE}/status/heartbeat`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

module.exports = AIHordeClient;
