/**
 * Leonardo.ai API Client
 * Cliente para generación ultra-rápida de imágenes (3-8 segundos)
 * FREE TIER: 150 generaciones/día
 * Documentación: https://docs.leonardo.ai/reference/creategeneration
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const axios = require('axios');

const LEONARDO_API_BASE = 'https://cloud.leonardo.ai/api/rest/v1';

// Directorio de cache
const CACHE_DIR =
  process.env.NODE_ENV === 'production'
    ? '/app/ai-cache/images'
    : path.join(__dirname, '../../../../services/ai-image-service/cache/images');

// Modelos Leonardo optimizados
const LEONARDO_MODELS = {
  'leonardo-diffusion': '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // General, rápido
  'leonardo-creative': 'aa77f04e-3eec-4034-9c07-d0f619684628', // Creativo
  'leonardo-signature': '291be633-cb24-434f-898f-e662799936ad', // Firma Leonardo
  photoreal: 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Fotorealista
  'kino-xl': 'aa77f04e-3eec-4034-9c07-d0f619684628', // Cinematográfico
};

class LeonardoClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.LEONARDO_API_KEY;

    if (!this.apiKey) {
      throw new Error(
        'Leonardo API key no configurado. ' +
          'Obtén uno gratis en https://app.leonardo.ai/settings (150 créditos/día). ' +
          'Configura LEONARDO_API_KEY en .env'
      );
    }

    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Genera imagen con Leonardo.ai (3-8 segundos)
   * @param {Object} options - Opciones de generación
   * @returns {Promise<Object>} Resultado con URL de imagen
   */
  async generateImage(options = {}) {
    const {
      prompt,
      negative_prompt = 'blurry, bad quality, distorted, ugly, watermark',
      width = 512,
      height = 512,
      num_images = 1,
      guidance_scale = 7,
      num_inference_steps = 30,
      model = 'leonardo-diffusion', // o 'photoreal', 'leonardo-creative'
      preset = 'LEONARDO', // LEONARDO, CINEMATIC, CREATIVE, VIBRANT, NONE
    } = options;

    if (!prompt) {
      throw new Error('Prompt es requerido');
    }

    // Validar dimensiones (Leonardo requiere múltiplos de 8)
    const validWidth = Math.round(width / 8) * 8;
    const validHeight = Math.round(height / 8) * 8;

    console.log(`🎨 Leonardo.ai: Generando imagen...`);
    console.log(`   Prompt: ${prompt.substring(0, 80)}...`);
    console.log(`   Modelo: ${model}`);
    console.log(`   Dimensiones: ${validWidth}x${validHeight}`);

    try {
      // 1. Crear generación
      const modelId = LEONARDO_MODELS[model] || LEONARDO_MODELS['leonardo-diffusion'];

      const generationResponse = await axios.post(
        `${LEONARDO_API_BASE}/generations`,
        {
          prompt,
          negative_prompt,
          modelId,
          width: validWidth,
          height: validHeight,
          num_images,
          guidance_scale,
          num_inference_steps,
          presetStyle: preset,
          public: false,
          nsfw: false,
        },
        { headers: this.headers }
      );

      const generationId = generationResponse.data.sdGenerationJob.generationId;
      console.log(`   Job ID: ${generationId}`);

      // 2. Esperar a que complete (polling cada 2 segundos)
      const result = await this.waitForGeneration(generationId);

      // 3. Descargar y cachear
      if (result.generated_images && result.generated_images.length > 0) {
        const image = result.generated_images[0];
        const imageUrl = image.url;

        // Descargar imagen
        const imageBuffer = await this.downloadImage(imageUrl);

        // Cachear localmente
        const hash = crypto.createHash('md5').update(prompt).digest('hex');
        const filename = `leonardo-${hash}.png`;
        const cachePath = path.join(CACHE_DIR, filename);

        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.writeFile(cachePath, imageBuffer);

        console.log(`✅ Imagen generada y cacheada: ${filename}`);

        return {
          success: true,
          filename,
          url: imageUrl,
          localPath: cachePath,
          publicUrl: `/images/productos/${filename}`,
          metadata: {
            prompt,
            model,
            modelId,
            width: validWidth,
            height: validHeight,
            guidance_scale,
            steps: num_inference_steps,
            generationId,
            nsfw: image.nsfw || false,
          },
        };
      } else {
        throw new Error('No se generaron imágenes');
      }
    } catch (error) {
      console.error('❌ Error Leonardo.ai:', error.response?.data || error.message);

      // Mensajes de error más descriptivos
      if (error.response?.status === 401) {
        throw new Error('API key inválida. Verifica tu token en https://app.leonardo.ai/settings');
      }
      if (error.response?.status === 429) {
        throw new Error('Límite de 150 créditos/día alcanzado. Intenta mañana o usa AI Horde');
      }
      if (error.response?.data?.error) {
        throw new Error(`Leonardo.ai: ${error.response.data.error}`);
      }

      throw error;
    }
  }

  /**
   * Espera a que complete la generación
   */
  async waitForGeneration(generationId, timeout = 30000) {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 segundos

    while (Date.now() - startTime < timeout) {
      try {
        const response = await axios.get(`${LEONARDO_API_BASE}/generations/${generationId}`, {
          headers: this.headers,
        });

        const generation = response.data.generations_by_pk;

        if (generation.status === 'COMPLETE') {
          console.log(`   ✅ Completado en ${Math.round((Date.now() - startTime) / 1000)}s`);
          return generation;
        }

        if (generation.status === 'FAILED') {
          throw new Error('Generación falló en Leonardo.ai');
        }

        // Log progreso
        console.log(`   ⏳ Estado: ${generation.status}...`);

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (error.response?.status === 404) {
          // Aún no está disponible, continuar esperando
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        } else {
          throw error;
        }
      }
    }

    throw new Error('Timeout esperando generación de Leonardo.ai');
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
   * Obtiene información de la cuenta
   */
  async getUserInfo() {
    try {
      const response = await axios.get(`${LEONARDO_API_BASE}/me`, { headers: this.headers });

      return {
        user_id: response.data.user_details[0].user.id,
        username: response.data.user_details[0].user.username,
        token_renewal_date: response.data.user_details[0].tokenRenewalDate,
        subscription_tokens: response.data.user_details[0].subscriptionTokens,
        subscription_gpt_tokens: response.data.user_details[0].subscriptionGptTokens,
        api_credit: response.data.user_details[0].apiCredit,
      };
    } catch (error) {
      console.error('Error obteniendo info de usuario:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Valida que la API key funciona
   */
  async validateToken() {
    try {
      await this.getUserInfo();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = LeonardoClient;
