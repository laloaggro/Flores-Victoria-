#!/usr/bin/env node

/**
 * Generador de Imágenes Únicas con Hugging Face
 *
 * Genera imágenes completamente nuevas y únicas para cada producto
 * usando Hugging Face API + marca de agua dual
 */

const fs = require('fs').promises;
const path = require('path');

const sharp = require('sharp');

const crypto = require('crypto');

class UniqueImageGenerator {
  constructor() {
    this.hfToken = process.env.HF_TOKEN || 'YOUR_HF_TOKEN_HERE';
    this.hfModel = 'stabilityai/stable-diffusion-xl-base-1.0'; // Modelo de alta calidad
    this.logoPath = path.join(__dirname, 'frontend/public/logo.svg');
    this.outputDir = path.join(__dirname, 'frontend/images/products/generated-hf');
    this.watermarkSize = 80;
    this.watermarkPadding = 20;
    this.cacheFile = path.join(__dirname, '.hf-generated-cache.json');
    this.generatedCache = new Map();
  }

  async init() {
    // Crear directorio de salida
    await fs.mkdir(this.outputDir, { recursive: true });

    // Verificar logo
    try {
      await fs.access(this.logoPath);
      console.log('✅ Logo encontrado:', this.logoPath);
    } catch (error) {
      throw new Error(`Logo no encontrado: ${this.logoPath}`);
    }

    // Cargar cache
    try {
      const cacheData = await fs.readFile(this.cacheFile, 'utf8');
      const cache = JSON.parse(cacheData);
      this.generatedCache = new Map(Object.entries(cache));
      console.log('📦 Cache cargado:', this.generatedCache.size, 'productos');
    } catch (error) {
      console.log('📦 Cache nuevo creado');
    }

    console.log('✅ Generador inicializado');
    console.log('📁 Directorio de salida:', this.outputDir);
  }

  /**
   * Genera un prompt único y detallado para cada producto
   */
  generatePrompt(product) {
    const flowers = product.flowers?.join(', ') || 'flores mixtas';
    const colors = product.colors?.join(' y ') || 'colores variados';
    const category = product.category?.replace(/_/g, ' ') || 'arreglo floral';
    const productName = product.name?.toLowerCase() || '';
    const productId = product.id || '';

    // Determinar el estilo según la categoría
    let style = 'elegant floral arrangement';
    let setting = 'elegant crystal vase';

    if (category.includes('premium')) {
      style = 'luxury premium floral bouquet';
      setting = 'elegant crystal vase';
    }
    if (category.includes('decoracion') || category.includes('verde')) {
      style = 'decorative plant composition';
      setting = 'modern ceramic pot';
    }
    if (category.includes('navidad')) {
      style = 'festive christmas floral decoration';
      setting = 'holiday themed ceramic vase';
    }
    if (category.includes('bodas')) {
      style = 'romantic wedding flower arrangement';
      setting = 'elegant white ceramic vase';
    }
    if (category.includes('amor')) {
      style = 'romantic love flower bouquet';
      setting = 'elegant vase with ribbon';
    }
    if (category.includes('graduacion')) {
      style = 'celebratory graduation flower arrangement';
      setting = 'festive vase';
    }

    // Ajustar según el nombre del producto
    if (productName.includes('terrario')) setting = 'glass terrarium with moss';
    if (productName.includes('maceta')) setting = 'decorative ceramic pot';
    if (productName.includes('ramo') || productName.includes('bouquet'))
      setting = 'elegant wrapping paper';
    if (productName.includes('caja')) setting = 'luxury flower box';
    if (productName.includes('corona')) setting = 'circular wreath';

    // Construir prompt profesional
    let prompt = `Professional product photography of ${style}, `;
    prompt += `featuring ${flowers} in ${colors} colors, `;
    prompt += `beautifully arranged in ${setting}, `;

    // Detalles específicos de las flores
    const flowerLower = flowers.toLowerCase();
    if (flowerLower.includes('rosa')) {
      prompt += `fresh premium roses with perfect petals, `;
    }
    if (flowerLower.includes('orquídea')) {
      prompt += `exotic orchid blooms, `;
    }
    if (flowerLower.includes('girasol')) {
      prompt += `vibrant sunflowers, `;
    }
    if (flowerLower.includes('lili')) {
      prompt += `elegant lilies, `;
    }
    if (flowerLower.includes('tulip')) {
      prompt += `delicate tulips, `;
    }
    if (flowerLower.includes('peonía')) {
      prompt += `lush peonies, `;
    }
    if (flowerLower.includes('amaryllis')) {
      prompt += `bold amaryllis flowers, `;
    }

    // Especificaciones técnicas
    prompt += `studio lighting, pure white background, `;
    prompt += `centered composition, professional product shot, `;
    prompt += `high quality, sharp focus, photorealistic, `;
    prompt += `commercial photography, 8k, detailed`;

    return prompt;
  }

  /**
   * Genera imagen usando Hugging Face API
   */
  async generateImageWithHF(prompt, productId) {
    console.log(`   🎨 Generando con Hugging Face...`);
    console.log(`   📝 Prompt: ${prompt.substring(0, 100)}...`);

    const response = await fetch(`https://api-inference.huggingface.co/models/${this.hfModel}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt:
            'blurry, low quality, distorted, ugly, deformed, watermark, text, logo, signature, multiple objects, cluttered, dark, cartoon',
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 768,
          height: 768,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face error: ${response.status} - ${error}`);
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Aplica marca de agua dual
   */
  async addWatermark(imageBuffer) {
    const logoBuffer = await fs.readFile(this.logoPath);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    console.log(`   📐 Aplicando marca de agua dual...`);

    // 1. LOGO CENTRADO (Protección)
    const centerLogoSize = Math.round(metadata.width * 0.5);
    const centerOpacity = 0.25;

    const centerLogo = await sharp(logoBuffer)
      .resize(centerLogoSize, centerLogoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const centerLogoWithOpacity = await sharp(centerLogo)
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(255 * centerOpacity)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in',
        },
      ])
      .toBuffer();

    const centerX = Math.round((metadata.width - centerLogoSize) / 2);
    const centerY = Math.round((metadata.height - centerLogoSize) / 2);

    // 2. LOGO ESQUINA (Branding)
    const cornerLogoSize = this.watermarkSize;

    const cornerLogo = await sharp(logoBuffer)
      .resize(cornerLogoSize, cornerLogoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const cornerX = metadata.width - cornerLogoSize - this.watermarkPadding;
    const cornerY = metadata.height - cornerLogoSize - this.watermarkPadding;

    // 3. APLICAR AMBAS MARCAS
    const result = await image
      .composite([
        {
          input: centerLogoWithOpacity,
          top: centerY,
          left: centerX,
          blend: 'over',
        },
        {
          input: cornerLogo,
          top: cornerY,
          left: cornerX,
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();

    return result;
  }

  /**
   * Procesa un producto
   */
  async processProduct(product, index, total) {
    console.log(`\n[${'='.repeat(70)}]`);
    console.log(`[${index + 1}/${total}] ${product.name} (${product.id})`);
    console.log(`[${'='.repeat(70)}]`);

    // Generar hash único
    const hash = crypto
      .createHash('md5')
      .update(
        JSON.stringify({
          id: product.id,
          name: product.name,
          flowers: product.flowers,
          colors: product.colors,
        })
      )
      .digest('hex');

    // Verificar si ya se generó
    if (this.generatedCache.has(product.id)) {
      console.log(`   ⚠️  Ya generado anteriormente - saltando`);
      return { success: false, reason: 'already_generated' };
    }

    try {
      // 1. Generar prompt único
      const prompt = this.generatePrompt(product);

      // 2. Generar imagen con Hugging Face
      const generatedImage = await this.generateImageWithHF(prompt, product.id);

      // 3. Aplicar marca de agua dual
      const watermarkedImage = await this.addWatermark(generatedImage);

      // 4. Guardar
      const filename = `${product.id}-${hash.substring(0, 8)}.png`;
      const outputPath = path.join(this.outputDir, filename);

      await fs.writeFile(outputPath, watermarkedImage);

      console.log(`   ✅ Guardado: ${filename}`);

      // Actualizar cache
      this.generatedCache.set(product.id, {
        filename,
        hash,
        timestamp: new Date().toISOString(),
      });

      // Guardar cache
      await this.saveCache();

      return {
        success: true,
        productId: product.id,
        productName: product.name,
        filename,
        path: `/images/products/generated-hf/${filename}`,
        outputPath,
      };
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Guarda el cache
   */
  async saveCache() {
    const cacheObj = Object.fromEntries(this.generatedCache);
    await fs.writeFile(this.cacheFile, JSON.stringify(cacheObj, null, 2));
  }

  /**
   * Procesa todos los productos
   */
  async processAllProducts() {
    console.log('\n🌸 Generador de Imágenes Únicas con Hugging Face');
    console.log('='.repeat(80));

    try {
      // Obtener productos
      console.log('\n📡 Obteniendo productos...');
      const response = await fetch('http://localhost:3000/api/products?limit=100');
      const data = await response.json();
      const products = data.products || data.data || data;

      console.log(`✅ ${products.length} productos encontrados\n`);

      const results = {
        total: products.length,
        success: 0,
        failed: 0,
        skipped: 0,
        details: [],
      };

      // Procesar cada producto
      for (let i = 0; i < products.length; i++) {
        try {
          const result = await this.processProduct(products[i], i, products.length);

          if (result.success) {
            results.success++;
            results.details.push(result);
            // Pausa más larga para evitar rate limit
            console.log('   ⏳ Esperando 5 segundos antes de la siguiente...');
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } else if (result.reason === 'already_generated') {
            results.skipped++;
          } else {
            results.failed++;
            // Pausa menor en caso de error
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`   ❌ Error crítico procesando ${products[i].name}:`, error.message);
          results.failed++;
          // Pausa en caso de error crítico
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Resumen
      console.log(`\n${'='.repeat(80)}`);
      console.log('\n📊 RESUMEN FINAL');
      console.log('='.repeat(80));
      console.log(`\n✅ Generados: ${results.success}/${results.total}`);
      console.log(`⚠️  Saltados: ${results.skipped}/${results.total}`);
      console.log(`❌ Fallidos: ${results.failed}/${results.total}`);

      console.log(`\n📁 Imágenes guardadas en: ${this.outputDir}`);

      // Guardar mapping
      const mappingPath = path.join(this.outputDir, 'hf-mapping.json');
      await fs.writeFile(
        mappingPath,
        JSON.stringify(
          {
            generated_at: new Date().toISOString(),
            model: this.hfModel,
            total_generated: results.success,
            products: results.details.map((r) => ({
              id: r.productId,
              name: r.productName,
              filename: r.filename,
              path: r.path,
            })),
          },
          null,
          2
        )
      );

      console.log(`📋 Mapping guardado: hf-mapping.json`);

      console.log('\n✨ ¡Proceso completado!');
      console.log('\n💡 Características:');
      console.log('   ✓ Imágenes únicas generadas con IA');
      console.log('   ✓ Prompts específicos por producto');
      console.log('   ✓ Marca de agua dual (centrado + esquina)');
      console.log('   ✓ Alta calidad 768x768px\n');

      // Abrir directorio
      const { exec } = require('child_process');
      exec(`xdg-open "${this.outputDir}"`);
    } catch (error) {
      console.error('\n❌ Error fatal:', error.message);
      throw error;
    }
  }
}

// Ejecutar
(async () => {
  try {
    const generator = new UniqueImageGenerator();
    await generator.init();
    await generator.processAllProducts();
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
})();
