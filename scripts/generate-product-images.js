#!/usr/bin/env node

/**
 * Generador de Imágenes de Productos con Marca de Agua
 * 
 * Genera imágenes únicas para productos usando AI Horde
 * y agrega el logo como marca de agua en la esquina inferior derecha
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

class ProductImageGenerator {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'http://localhost:3000/api/ai-images';
    this.outputDir = options.outputDir || path.join(__dirname, 'frontend/images/products/generated');
    this.logoPath = options.logoPath || path.join(__dirname, 'frontend/logo.svg');
    this.watermarkSize = options.watermarkSize || 80; // Tamaño del logo en px
    this.watermarkOpacity = options.watermarkOpacity || 0.7;
    this.watermarkPadding = options.watermarkPadding || 20;
    
    // Cache de productos generados para evitar duplicados
    this.generatedCache = new Map();
    this.cacheFile = path.join(this.outputDir, '.generated-cache.json');
  }

  /**
   * Inicializa el generador
   */
  async init() {
    // Crear directorio de salida
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Cargar cache de generaciones previas
    await this.loadCache();
    
    console.log('✅ Generador de imágenes inicializado');
    console.log(`📁 Directorio de salida: ${this.outputDir}`);
    console.log(`🖼️  Logo: ${this.logoPath}`);
  }

  /**
   * Carga cache de generaciones previas
   */
  async loadCache() {
    try {
      const cacheData = await fs.readFile(this.cacheFile, 'utf-8');
      const cache = JSON.parse(cacheData);
      
      this.generatedCache = new Map(Object.entries(cache));
      console.log(`📦 Cache cargado: ${this.generatedCache.size} productos`);
    } catch (error) {
      // Cache no existe, crear nuevo
      this.generatedCache = new Map();
      console.log('📦 Cache nuevo creado');
    }
  }

  /**
   * Guarda cache de generaciones
   */
  async saveCache() {
    const cacheObj = Object.fromEntries(this.generatedCache);
    await fs.writeFile(this.cacheFile, JSON.stringify(cacheObj, null, 2));
    console.log('💾 Cache guardado');
  }

  /**
   * Genera hash único para un producto
   */
  generateProductHash(product) {
    const data = JSON.stringify({
      name: product.name,
      flowers: product.flowers?.sort(),
      colors: product.colors?.sort(),
      category: product.category,
    });
    
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Genera prompt detallado para la imagen
   */
  generatePrompt(product) {
    const flowers = product.flowers?.join(', ') || 'flores mixtas';
    const colors = product.colors?.join(' y ') || 'colores variados';
    const category = product.category?.replace(/_/g, ' ') || 'arreglo floral';
    const occasions = product.occasions?.slice(0, 2).join(', ') || '';
    const productName = product.name?.toLowerCase() || '';
    const productId = product.id || '';
    
    // Determinar el estilo según la categoría
    let style = 'elegant floral arrangement';
    let setting = 'elegant vase';
    
    if (category.includes('premium')) {
      style = 'luxury premium floral bouquet';
      setting = 'crystal vase';
    }
    if (category.includes('decoracion') || category.includes('verde')) {
      style = 'decorative plant composition';
      setting = 'modern decorative pot';
    }
    if (category.includes('navidad')) {
      style = 'festive christmas floral decoration';
      setting = 'holiday themed container';
    }
    if (category.includes('bodas')) {
      style = 'romantic wedding flower arrangement';
      setting = 'elegant wedding vase';
    }
    if (category.includes('amor')) {
      style = 'romantic love flower bouquet';
      setting = 'romantic gift wrapping';
    }
    if (category.includes('graduacion')) {
      style = 'celebratory graduation flower arrangement';
      setting = 'celebratory presentation';
    }
    
    // Ajustar según el nombre del producto
    if (productName.includes('terrario')) setting = 'glass terrarium with cork lid';
    if (productName.includes('maceta')) setting = 'decorative ceramic pot';
    if (productName.includes('ramo') || productName.includes('bouquet')) setting = 'elegant wrapping paper with ribbon';
    if (productName.includes('caja')) setting = 'luxury flower box';
    if (productName.includes('corona')) setting = 'circular wreath base';
    if (productName.includes('centros de mesa')) setting = 'table centerpiece arrangement';
    
    // Construir prompt principal con detalles específicos del producto
    let prompt = `Professional commercial product photography of a ${style}. `;
    prompt += `Featuring ${flowers} flowers in beautiful ${colors} tones, `;
    prompt += `presented in ${setting}. `;
    
    // Agregar detalles específicos de las flores para más unicidad
    const flowerLower = flowers.toLowerCase();
    if (flowerLower.includes('rosa')) {
      prompt += `Premium fresh roses with perfect layered petals and green foliage, `;
    }
    if (flowerLower.includes('orquídea')) {
      prompt += `Exotic orchid blooms with graceful curved stems, `;
    }
    if (flowerLower.includes('girasol')) {
      prompt += `Large vibrant sunflowers with bright yellow petals and dark centers, `;
    }
    if (flowerLower.includes('lili')) {
      prompt += `Elegant stargazer lilies with large showy blooms, `;
    }
    if (flowerLower.includes('tulip')) {
      prompt += `Smooth delicate tulip petals in classic cup shape, `;
    }
    if (flowerLower.includes('peonía')) {
      prompt += `Lush peony blooms with abundant ruffled petals, `;
    }
    if (flowerLower.includes('amaryllis')) {
      prompt += `Bold amaryllis with large trumpet-shaped flowers, `;
    }
    if (flowerLower.includes('suculenta')) {
      prompt += `Variety of succulent plants with fleshy leaves, `;
    }
    
    // Agregar seed único basado en el ID del producto para consistencia
    const seed = productId ? parseInt(productId.replace(/\D/g, '') || '0') : Math.floor(Math.random() * 10000);
    
    // Especificaciones técnicas profesionales
    prompt += `studio lighting with soft shadows, pure white seamless background, `;
    prompt += `centered composition at eye level, professional product photography, `;
    prompt += `high resolution 8k quality, razor sharp focus, photorealistic detail, `;
    prompt += `commercial advertising quality, vibrant natural colors, `;
    prompt += `perfect lighting balance, no text overlays, no watermarks, `;
    prompt += `single standalone arrangement, seed:${seed}`;
    
    // Prompt negativo mejorado
    const negativePrompt = 'blurry, low quality, pixelated, grainy, watermark, text, logo, signature, ' +
      'cluttered background, dark shadows, underexposed, overexposed, multiple arrangements, ' +
      'people, hands, fingers, table surface, distorted flowers, wilted petals, ' +
      'artificial looking, cartoon, drawing, painting, 3D render';
    
    return {
      prompt: prompt,
      negative_prompt: negativePrompt,
    };
  }

  /**
   * Verifica si ya se generó imagen para este producto
   */
  hasGeneratedImage(productHash) {
    return this.generatedCache.has(productHash);
  }

  /**
   * Genera imagen usando AI Horde
   */
  async generateImage(product) {
    const productHash = this.generateProductHash(product);
    
    // Verificar si ya existe
    if (this.hasGeneratedImage(productHash)) {
      const cached = this.generatedCache.get(productHash);
      console.log(`⚡ Producto ya generado: ${cached.filename}`);
      return cached;
    }
    
    console.log(`🎨 Generando imagen para: ${product.name}`);
    
    const { prompt, negative_prompt } = this.generatePrompt(product);
    
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    
    // Llamar a AI Horde API
    try {
      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          negative_prompt,
          width: 1024,
          height: 1024,
          steps: 30,
          cfg_scale: 7.5,
          sampler_name: 'k_euler_a',
          seed: Math.floor(Math.random() * 2147483647), // Seed aleatorio para unicidad
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.image_url) {
        throw new Error('No se recibió imagen válida');
      }
      
      console.log(`✅ Imagen generada: ${result.image_url}`);
      
      return {
        imageUrl: result.image_url,
        generationId: result.id,
        prompt: result.prompt,
      };
    } catch (error) {
      console.error(`❌ Error generando imagen: ${error.message}`);
      throw error;
    }
  }

  /**
   * Descarga imagen desde URL
   */
  async downloadImage(url) {
    console.log(`⬇️  Descargando imagen...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error descargando imagen: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Agrega marca de agua combinada del logo
   * Logo centrado grande (25% opacidad) + logo esquina (100% opacidad)
   */
  async addWatermark(imageBuffer) {
    console.log(`🔖 Agregando marca de agua combinada...`);
    
    // Cargar logo
    let logoBuffer;
    try {
      logoBuffer = await fs.readFile(this.logoPath);
    } catch (error) {
      console.warn(`⚠️  Logo no encontrado en ${this.logoPath}, saltando marca de agua`);
      return imageBuffer;
    }
    
    // Procesar imagen base
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // CONFIGURACIÓN DUAL
    const centerLogoSize = Math.round(metadata.width * 0.5); // 50% del ancho
    const centerOpacity = 0.25; // 25% de opacidad (sutil)
    const cornerLogoSize = this.watermarkSize; // 80px por defecto
    const cornerPadding = this.watermarkPadding; // 20px por defecto
    
    console.log(`   - Logo centrado: ${centerLogoSize}px al ${centerOpacity * 100}%`);
    console.log(`   - Logo esquina: ${cornerLogoSize}px al 100%`);
    
    // 1. Crear logo CENTRADO con baja opacidad
    const centerLogo = await sharp(logoBuffer)
      .resize(centerLogoSize, centerLogoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .ensureAlpha()
      .toBuffer();
    
    // Aplicar opacidad reducida al logo centrado
    const centerLogoWithOpacity = await sharp(centerLogo)
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(255 * centerOpacity)]),
          raw: {
            width: 1,
            height: 1,
            channels: 4
          },
          tile: true,
          blend: 'dest-in'
        }
      ])
      .toBuffer();
    
    const centerLogoMetadata = await sharp(centerLogoWithOpacity).metadata();
    const centerX = Math.round((metadata.width - centerLogoMetadata.width) / 2);
    const centerY = Math.round((metadata.height - centerLogoMetadata.height) / 2);
    
    // 2. Crear logo ESQUINA con 100% opacidad
    const cornerLogo = await sharp(logoBuffer)
      .resize(cornerLogoSize, cornerLogoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    const cornerX = metadata.width - cornerLogoSize - cornerPadding;
    const cornerY = metadata.height - cornerLogoSize - cornerPadding;
    
    // 3. Aplicar AMBAS marcas de agua
    const watermarked = await image
      .composite([
        // Primero el logo centrado (fondo, protección)
        {
          input: centerLogoWithOpacity,
          top: centerY,
          left: centerX,
          blend: 'over'
        },
        // Luego el logo de esquina (frente, branding)
        {
          input: cornerLogo,
          top: cornerY,
          left: cornerX,
          blend: 'over'
        }
      ])
      .jpeg({ quality: 95 })
      .toBuffer();
    
    console.log(`✅ Marca de agua combinada agregada (protección + branding)`);
    
    return watermarked;
  }

  /**
   * Genera nombre de archivo único
   */
  generateFilename(product, extension = 'jpg') {
    const productHash = this.generateProductHash(product);
    const timestamp = Date.now();
    const sanitized = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 30);
    
    return `${sanitized}-${productHash.substring(0, 8)}-${timestamp}.${extension}`;
  }

  /**
   * Procesa un producto completo: genera, descarga y agrega marca de agua
   */
  async processProduct(product) {
    const productHash = this.generateProductHash(product);
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🌸 Procesando: ${product.name}`);
      console.log(`${'='.repeat(60)}\n`);
      
      // 1. Generar imagen con AI
      const generation = await this.generateImage(product);
      
      // 2. Descargar imagen
      const imageBuffer = await this.downloadImage(generation.imageUrl);
      
      // 3. Agregar marca de agua
      const watermarkedBuffer = await this.addWatermark(imageBuffer);
      
      // 4. Guardar archivo
      const filename = this.generateFilename(product);
      const filepath = path.join(this.outputDir, filename);
      
      await fs.writeFile(filepath, watermarkedBuffer);
      
      console.log(`💾 Guardado: ${filename}`);
      
      // 5. Actualizar cache
      const result = {
        productId: product.id,
        productName: product.name,
        filename,
        filepath,
        generatedAt: new Date().toISOString(),
        prompt: generation.prompt,
        hash: productHash,
      };
      
      this.generatedCache.set(productHash, result);
      await this.saveCache();
      
      console.log(`✅ Producto procesado exitosamente\n`);
      
      return result;
    } catch (error) {
      console.error(`❌ Error procesando ${product.name}: ${error.message}\n`);
      throw error;
    }
  }

  /**
   * Procesa múltiples productos
   */
  async processProducts(products, options = {}) {
    const {
      maxConcurrent = 2, // Máximo 2 generaciones simultáneas (AI Horde puede ser lento)
      skipExisting = true,
      delay = 5000, // 5 segundos entre generaciones para no saturar
    } = options;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 INICIANDO GENERACIÓN MASIVA`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total de productos: ${products.length}`);
    console.log(`Concurrencia: ${maxConcurrent}`);
    console.log(`Delay entre generaciones: ${delay}ms`);
    console.log(`Saltar existentes: ${skipExisting}`);
    console.log(`${'='.repeat(60)}\n`);
    
    const results = {
      success: [],
      skipped: [],
      failed: [],
    };
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productHash = this.generateProductHash(product);
      
      console.log(`\n[${i + 1}/${products.length}] ${product.name}`);
      
      // Saltar si ya existe y skipExisting está habilitado
      if (skipExisting && this.hasGeneratedImage(productHash)) {
        console.log(`⏭️  Saltando (ya existe)`);
        results.skipped.push({
          productId: product.id,
          productName: product.name,
          reason: 'already_exists',
        });
        continue;
      }
      
      try {
        const result = await this.processProduct(product);
        results.success.push(result);
        
        // Delay antes del siguiente (excepto el último)
        if (i < products.length - 1) {
          console.log(`⏳ Esperando ${delay / 1000}s antes del siguiente...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        results.failed.push({
          productId: product.id,
          productName: product.name,
          error: error.message,
        });
      }
    }
    
    // Resumen final
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 RESUMEN DE GENERACIÓN`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Exitosas: ${results.success.length}`);
    console.log(`⏭️  Saltadas: ${results.skipped.length}`);
    console.log(`❌ Fallidas: ${results.failed.length}`);
    console.log(`${'='.repeat(60)}\n`);
    
    if (results.failed.length > 0) {
      console.log(`\n❌ PRODUCTOS FALLIDOS:`);
      results.failed.forEach(f => {
        console.log(`  - ${f.productName}: ${f.error}`);
      });
    }
    
    return results;
  }

  /**
   * Obtiene lista de productos desde API
   */
  async fetchProducts() {
    console.log('📡 Obteniendo productos desde API...');
    
    try {
      const response = await fetch('http://localhost:3000/api/products?limit=100');
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const products = data.products || data.data || data;
      
      console.log(`✅ ${products.length} productos obtenidos\n`);
      
      return products;
    } catch (error) {
      console.error(`❌ Error obteniendo productos: ${error.message}`);
      throw error;
    }
  }
}

// CLI
if (require.main === module) {
  const generator = new ProductImageGenerator();
  
  (async () => {
    try {
      await generator.init();
      
      // Obtener productos
      const products = await generator.fetchProducts();
      
      // Filtrar solo productos sin imagen (opcional)
      const productsWithoutImage = products.filter(p => 
        !p.images || p.images.length === 0 || 
        p.images[0].includes('placeholder')
      );
      
      console.log(`🎯 Productos sin imagen: ${productsWithoutImage.length}`);
      
      if (productsWithoutImage.length === 0) {
        console.log('✅ Todos los productos ya tienen imágenes!');
        return;
      }
      
      // Confirmar antes de generar
      console.log('\n⚠️  Se generarán imágenes para los siguientes productos:');
      productsWithoutImage.slice(0, 10).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}`);
      });
      
      if (productsWithoutImage.length > 10) {
        console.log(`  ... y ${productsWithoutImage.length - 10} más`);
      }
      
      console.log('\n💡 Presiona Ctrl+C para cancelar, o espera 5 segundos para continuar...\n');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Procesar productos
      const results = await generator.processProducts(productsWithoutImage, {
        maxConcurrent: 2,
        skipExisting: true,
        delay: 10000, // 10 segundos entre generaciones
      });
      
      console.log('\n🎉 ¡Generación completada!');
      console.log(`\n📁 Las imágenes están en: ${generator.outputDir}`);
      
      // Guardar reporte
      const reportPath = path.join(generator.outputDir, `generation-report-${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
      console.log(`📄 Reporte guardado en: ${reportPath}`);
      
    } catch (error) {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    }
  })();
}

module.exports = ProductImageGenerator;
