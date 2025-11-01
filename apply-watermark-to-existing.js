#!/usr/bin/env node

/**
 * Aplicar Marca de Agua Dual a Imágenes Existentes
 * 
 * Toma las imágenes actuales de productos y les aplica:
 * - Logo centrado (50% width, 25% opacity) - Protección anti-copia
 * - Logo esquina (80px, 100% opacity) - Branding profesional
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class WatermarkApplicator {
  constructor() {
    this.logoPath = path.join(__dirname, 'frontend/public/logo.svg');
    this.outputDir = path.join(__dirname, 'frontend/images/products/watermarked');
    this.watermarkSize = 80;
    this.watermarkPadding = 20;
  }

  async init() {
    // Crear directorio de salida
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Verificar que existe el logo
    try {
      await fs.access(this.logoPath);
      console.log('✅ Logo encontrado:', this.logoPath);
    } catch (error) {
      throw new Error(`Logo no encontrado en: ${this.logoPath}`);
    }
    
    console.log('✅ Directorio de salida:', this.outputDir);
  }

  /**
   * Aplica marca de agua dual a una imagen
   */
  async addWatermark(imageBuffer) {
    // Leer logo
    const logoBuffer = await fs.readFile(this.logoPath);
    
    // Obtener información de la imagen
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    console.log(`   📐 Dimensiones: ${metadata.width}x${metadata.height}px`);
    
    // 1. LOGO CENTRADO (Protección anti-copia)
    const centerLogoSize = Math.round(metadata.width * 0.5); // 50% del ancho
    const centerOpacity = 0.25; // 25% opacidad
    
    const centerLogo = await sharp(logoBuffer)
      .resize(centerLogoSize, centerLogoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    
    // Aplicar opacidad reducida al logo centrado
    const centerLogoWithOpacity = await sharp(centerLogo)
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(255 * centerOpacity)]),
          raw: {
            width: 1,
            height: 1,
            channels: 4,
          },
          tile: true,
          blend: 'dest-in',
        },
      ])
      .toBuffer();
    
    // Calcular posición centrada
    const centerX = Math.round((metadata.width - centerLogoSize) / 2);
    const centerY = Math.round((metadata.height - centerLogoSize) / 2);
    
    // 2. LOGO ESQUINA (Branding profesional)
    const cornerLogoSize = this.watermarkSize; // 80px
    
    const cornerLogo = await sharp(logoBuffer)
      .resize(cornerLogoSize, cornerLogoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    
    // Calcular posición esquina inferior derecha
    const cornerX = metadata.width - cornerLogoSize - this.watermarkPadding;
    const cornerY = metadata.height - cornerLogoSize - this.watermarkPadding;
    
    console.log(`   🎨 Logo centrado: ${centerLogoSize}px a (${centerX}, ${centerY}), opacidad ${centerOpacity * 100}%`);
    console.log(`   🎨 Logo esquina: ${cornerLogoSize}px a (${cornerX}, ${cornerY}), opacidad 100%`);
    
    // 3. APLICAR AMBAS MARCAS DE AGUA
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
    console.log(`\n[${'='.repeat(60)}]`);
    console.log(`[${index + 1}/${total}] ${product.name} (${product.id})`);
    console.log(`[${'='.repeat(60)}]`);
    
    if (!product.images || product.images.length === 0) {
      console.log('   ⚠️  Sin imágenes - saltando');
      return { success: false, reason: 'no_images' };
    }
    
    // Tomar la primera imagen
    const imageRelativePath = product.images[0];
    const imagePath = path.join(__dirname, 'frontend/public', imageRelativePath);
    
    console.log(`   📁 Imagen original: ${imageRelativePath}`);
    
    try {
      // Verificar que existe
      await fs.access(imagePath);
      
      // Leer imagen
      const imageBuffer = await fs.readFile(imagePath);
      
      // Aplicar marca de agua dual
      const watermarked = await this.addWatermark(imageBuffer);
      
      // Guardar con marca de agua
      const outputFilename = `${product.id}-watermarked.png`;
      const outputPath = path.join(this.outputDir, outputFilename);
      
      await fs.writeFile(outputPath, watermarked);
      
      console.log(`   ✅ Guardado: ${outputFilename}`);
      
      return {
        success: true,
        productId: product.id,
        productName: product.name,
        originalImage: imageRelativePath,
        watermarkedImage: `/images/products/watermarked/${outputFilename}`,
        outputPath,
      };
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Procesa todos los productos
   */
  async processAllProducts() {
    console.log('\n🌸 Aplicando Marca de Agua Dual a Imágenes Existentes');
    console.log('='.repeat(80));
    
    try {
      // Obtener todos los productos
      console.log('\n📡 Obteniendo productos desde API...');
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
        const result = await this.processProduct(products[i], i, products.length);
        
        if (result.success) {
          results.success++;
          results.details.push(result);
        } else if (result.reason === 'no_images') {
          results.skipped++;
        } else {
          results.failed++;
        }
        
        // Pequeña pausa para no saturar
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      
      // Resumen final
      console.log('\n' + '='.repeat(80));
      console.log('\n📊 RESUMEN FINAL');
      console.log('='.repeat(80));
      console.log(`\n✅ Exitosos: ${results.success}/${results.total}`);
      console.log(`⚠️  Saltados: ${results.skipped}/${results.total}`);
      console.log(`❌ Fallidos: ${results.failed}/${results.total}`);
      
      console.log(`\n📁 Imágenes guardadas en: ${this.outputDir}`);
      
      // Guardar mapping de productos -> imágenes con marca de agua
      const mappingPath = path.join(this.outputDir, 'watermark-mapping.json');
      await fs.writeFile(
        mappingPath,
        JSON.stringify(
          {
            generated_at: new Date().toISOString(),
            total_processed: results.success,
            products: results.details.map((r) => ({
              id: r.productId,
              name: r.productName,
              original: r.originalImage,
              watermarked: r.watermarkedImage,
            })),
          },
          null,
          2
        )
      );
      
      console.log(`📋 Mapping guardado: watermark-mapping.json`);
      
      console.log('\n✨ ¡Proceso completado!');
      console.log('\n💡 Características de las imágenes:');
      console.log('   ✓ Logo centrado (50% width, 25% opacidad) - Protección anti-copia');
      console.log('   ✓ Logo esquina (80px, 100% opacidad) - Branding profesional');
      console.log('   ✓ Formato PNG de alta calidad');
      console.log('   ✓ Dimensiones originales preservadas\n');
      
      // Abrir directorio de salida
      console.log('🖼️  Abriendo directorio de imágenes...\n');
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
    const applicator = new WatermarkApplicator();
    await applicator.init();
    await applicator.processAllProducts();
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
})();
