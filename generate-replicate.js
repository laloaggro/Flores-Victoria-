#!/usr/bin/env node

/**
 * Generador de Imágenes con Replicate
 * 
 * Replicate ofrece créditos gratuitos mensuales + pricing muy bajo
 * https://replicate.com/account/api-tokens
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

// Configuración
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || 'r8_YOUR_TOKEN_HERE';
const LOGO_PATH = path.join(__dirname, 'frontend/public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, 'frontend/images/products/generated-replicate');
const CACHE_FILE = path.join(__dirname, '.replicate-generated-cache.json');
const BATCH_SIZE = 2; // Comenzar con solo 2 para probar
const DELAY_MS = 12000; // 12 segundos entre requests

async function main() {
  console.log('🌸 Generador de Imágenes con Replicate\n');
  console.log('='.repeat(70));
  
  // Verificar token
  if (REPLICATE_API_TOKEN === 'r8_YOUR_TOKEN_HERE') {
    console.log('\n❌ Error: Necesitas configurar REPLICATE_API_TOKEN\n');
    console.log('📋 Pasos para obtener tu token:\n');
    console.log('1. Ve a: https://replicate.com/account/api-tokens');
    console.log('2. Crea una cuenta (si no tienes)');
    console.log('3. Copia tu API token');
    console.log('4. Exporta la variable:\n');
    console.log('   export REPLICATE_API_TOKEN="r8_tu_token_aqui"\n');
    console.log('5. Ejecuta este script de nuevo\n');
    console.log('💡 Replicate ofrece:');
    console.log('   - Créditos gratuitos mensuales');
    console.log('   - Pricing muy bajo: ~$0.003 por imagen');
    console.log('   - Sin límites estrictos como HuggingFace\n');
    process.exit(1);
  }
  
  // Cargar cache
  let cache = {};
  try {
    const cacheData = await fs.readFile(CACHE_FILE, 'utf8');
    cache = JSON.parse(cacheData);
  } catch (error) {
    console.log('\n📦 Cache vacío, empezando desde cero');
  }
  
  // Crear directorio
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log('📁 Directorio:', OUTPUT_DIR);
  
  // Función para generar prompt único
  function generatePrompt(product) {
    const flowers = product.flowers?.join(', ') || 'mixed flowers';
    const colors = product.colors?.join(' and ') || 'mixed colors';
    const category = product.category || '';
    
    let style = 'professional product photography';
    if (category.includes('premium')) style = 'luxury premium';
    if (category.includes('navidad')) style = 'festive christmas';
    if (category.includes('bodas')) style = 'elegant wedding';
    
    return `${style}, ${flowers} flowers in ${colors} colors, elegant vase, pure white background, studio lighting, high quality, sharp focus, professional photo, 8k`;
  }
  
  // Función para generar con Replicate
  async function generateWithReplicate(prompt) {
    console.log('   🎨 Enviando a Replicate...');
    
    // Usar API más simple con el endpoint de modelo directo
    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          num_inference_steps: 4,
          guidance_scale: 0,
          width: 768,
          height: 768,
        },
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Replicate error ${response.status}: ${error}`);
    }
    
    const prediction = await response.json();
    console.log('   ⏳ Esperando generación...');
    
    // Esperar a que complete
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          },
        }
      );
      
      result = await checkResponse.json();
    }
    
    if (result.status === 'failed') {
      throw new Error('Generation failed');
    }
    
    // Descargar imagen
    const imageUrl = result.output[0];
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  // Función para aplicar marca de agua
  async function addWatermark(imageBuffer) {
    const logoBuffer = await fs.readFile(LOGO_PATH);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Logo centrado (25% opacity)
    const centerSize = Math.round(metadata.width * 0.5);
    const centerLogo = await sharp(logoBuffer)
      .resize(centerSize, centerSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    
    const centerWithOpacity = await sharp(centerLogo)
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(255 * 0.25)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in',
        },
      ])
      .toBuffer();
    
    const centerX = Math.round((metadata.width - centerSize) / 2);
    const centerY = Math.round((metadata.height - centerSize) / 2);
    
    // Logo esquina (100% opacity)
    const cornerSize = 80;
    const cornerLogo = await sharp(logoBuffer)
      .resize(cornerSize, cornerSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    
    const cornerX = metadata.width - cornerSize - 20;
    const cornerY = metadata.height - cornerSize - 20;
    
    // Aplicar ambas
    return await image
      .composite([
        { input: centerWithOpacity, top: centerY, left: centerX, blend: 'over' },
        { input: cornerLogo, top: cornerY, left: cornerX, blend: 'over' },
      ])
      .png()
      .toBuffer();
  }
  
  // Obtener productos
  console.log('\n📡 Obteniendo productos...\n');
  const response = await fetch('http://localhost:3000/api/products?limit=100');
  const data = await response.json();
  const allProducts = data.products || data.data || data;
  const products = allProducts.filter((p) => !cache[p.id]);
  
  console.log(`✅ ${products.length} productos pendientes`);
  console.log(`📦 ${Object.keys(cache).length} productos ya generados\n`);
  
  if (products.length === 0) {
    console.log('🎉 ¡Todos los productos ya tienen imágenes!\n');
    process.exit(0);
  }
  
  console.log(`🔄 Generando en lotes de ${BATCH_SIZE}...\n`);
  
  // Procesar en lotes
  let generated = 0;
  let failed = 0;
  
  for (let i = 0; i < Math.min(products.length, BATCH_SIZE); i++) {
    const product = products[i];
    
    console.log(`[${i + 1}/${Math.min(products.length, BATCH_SIZE)}] ${product.name} (${product.id})`);
    
    try {
      // Generar prompt
      const prompt = generatePrompt(product);
      console.log(`   📝 ${prompt.substring(0, 70)}...`);
      
      // Generar imagen
      const image = await generateWithReplicate(prompt);
      
      // Aplicar marca de agua
      console.log('   🔖 Aplicando marca de agua...');
      const watermarked = await addWatermark(image);
      
      // Guardar
      const hash = crypto.createHash('md5').update(product.id).digest('hex').substring(0, 8);
      const filename = `${product.id}-${hash}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      await fs.writeFile(filepath, watermarked);
      
      // Actualizar cache
      cache[product.id] = { filename, timestamp: new Date().toISOString() };
      await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
      
      console.log(`   ✅ ${filename}\n`);
      generated++;
      
      // Delay para evitar rate limiting (6 req/min = 10s entre requests)
      if (i < Math.min(products.length, BATCH_SIZE) - 1) {
        console.log(`   ⏳ Esperando ${DELAY_MS / 1000}s para evitar rate limit...`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      failed++;
      
      // Si es rate limit error, esperar más tiempo
      if (error.message.includes('429') || error.message.includes('throttled')) {
        console.log(`   ⏳ Rate limit detectado, esperando 15s...`);
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }
    }
  }
  
  // Resumen
  console.log('='.repeat(70));
  console.log(`\n✅ Generados: ${generated}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`📦 Total: ${Object.keys(cache).length}/${allProducts.length}`);
  console.log(`\n💡 Para continuar, ejecuta el script nuevamente`);
  console.log(`📁 Imágenes en: ${OUTPUT_DIR}\n`);
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
});
