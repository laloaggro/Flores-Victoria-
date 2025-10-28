/**
 * Hugging Face Inference Client
 * Cliente para generación rápida de imágenes usando HF Inference API
 * Documentación: https://huggingface.co/docs/inference-providers
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const HF_API_BASE = 'https://api-inference.huggingface.co/models';
const CACHE_DIR = path.join(__dirname, '../../../../services/ai-image-service/cache/images');

// Modelos recomendados (ordenados por velocidad/calidad)
const MODELS = {
  'flux-schnell': 'black-forest-labs/FLUX.1-schnell', // Más rápido (2-5 seg)
  'flux-dev': 'black-forest-labs/FLUX.1-dev', // Alta calidad (5-15 seg)
  'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0', // Balance (10-20 seg)
};

class HuggingFaceClient {
  constructor(apiToken = null) {
    this.apiToken = apiToken || process.env.HF_TOKEN || process.env.HUGGING_FACE_TOKEN;
    
    if (!this.apiToken) {
      throw new Error('HF_TOKEN no configurado. Obtén uno gratis en https://huggingface.co/settings/tokens');
    }

    this.headers = {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Genera imagen usando Hugging Face Inference API
   */
  async generateImage(options = {}) {
    const {
      prompt,
      negative_prompt = '',
      width = 1024,
      height = 1024,
      num_inference_steps = 25,
      guidance_scale = 7.5,
      model = 'flux-schnell', // Por defecto el más rápido
    } = options;

    if (!prompt) {
      throw new Error('Prompt es requerido');
    }

    const modelId = MODELS[model] || MODELS['flux-schnell'];

    console.log(`🎨 Hugging Face: Generando imagen...`);
    console.log(`   Modelo: ${modelId}`);
    console.log(`   Prompt: ${prompt.substring(0, 80)}...`);
    console.log(`   Dimensiones: ${width}x${height}`);

    try {
      // Llamada a la API
      const response = await axios.post(
        `${HF_API_BASE}/${modelId}`,
        {
          inputs: prompt,
          parameters: {
            negative_prompt,
            width,
            height,
            num_inference_steps,
            guidance_scale,
          },
        },
        {
          headers: this.headers,
          responseType: 'arraybuffer',
          timeout: 120000, // 2 minutos timeout
        }
      );

      // Guardar imagen
      const imageBuffer = Buffer.from(response.data);
      const hash = crypto.createHash('md5').update(prompt).digest('hex');
      const filename = `hf-${model}-${hash}.png`;
      const cachePath = path.join(CACHE_DIR, filename);

      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(cachePath, imageBuffer);

      const fileSize = (imageBuffer.length / 1024).toFixed(2);
      console.log(`✅ Imagen generada: ${filename} (${fileSize} KB)`);

      return {
        success: true,
        filename,
        localPath: cachePath,
        publicUrl: `/images/productos/${filename}`,
        size: fileSize,
        metadata: {
          prompt,
          negative_prompt,
          model: modelId,
          width,
          height,
          steps: num_inference_steps,
          guidance: guidance_scale,
          provider: 'huggingface',
        },
      };
    } catch (error) {
      console.error('❌ Error Hugging Face:', error.message);
      
      // Mensajes de error mejorados
      if (error.response?.status === 401) {
        throw new Error('Token HF inválido. Verifica HF_TOKEN en .env');
      } else if (error.response?.status === 503) {
        throw new Error('Modelo cargándose en HF. Intenta de nuevo en 20 segundos.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit HF alcanzado. Espera 1 minuto.');
      }
      
      throw error;
    }
  }

  /**
   * Lista modelos disponibles
   */
  getAvailableModels() {
    return Object.entries(MODELS).map(([key, value]) => ({
      id: key,
      name: value,
      speed: key === 'flux-schnell' ? 'fastest' : key === 'flux-dev' ? 'fast' : 'medium',
      quality: key === 'flux-dev' ? 'highest' : key === 'flux-schnell' ? 'high' : 'good',
    }));
  }

  /**
   * Verifica que el token sea válido
   */
  async validateToken() {
    try {
      await axios.get('https://huggingface.co/api/whoami-v2', {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        timeout: 5000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = HuggingFaceClient;
