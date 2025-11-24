#!/usr/bin/env node

/**
 * Generador de Imágenes con Leonardo.ai
 *
 * Leonardo ofrece 150 créditos DIARIOS gratis
 * Cada imagen cuesta ~8-10 créditos = ~15 imágenes por día
 * https://app.leonardo.ai/settings
 */

const fs = require('fs').promises;
const path = require('path');

const sharp = require('sharp');

const crypto = require('crypto');

// Configuración
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY || 'YOUR_KEY_HERE';
const LOGO_PATH = path.join(__dirname, 'frontend/public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, 'frontend/images/products/generated-leonardo');
const CACHE_FILE = path.join(__dirname, '.leonardo-generated-cache.json');
const BATCH_SIZE = 10; // Leonardo permite más requests simultáneos
const DELAY_MS = 3000; // 3 segundos entre requests

// Modelo recomendado: Leonardo Kino XL (alta calidad, realista)
const MODEL_ID = '6b645e3a-d64f-4341-a6d8-7a3690fbf042'; // Leonardo Kino XL

async function main() {
  console.log('🌸 Generador de Imágenes con Leonardo.ai\n');
  console.log('='.repeat(70));

  // Verificar API key
  if (LEONARDO_API_KEY === 'YOUR_KEY_HERE') {
    console.log('\n❌ Error: Necesitas configurar LEONARDO_API_KEY\n');
    console.log('📋 Pasos para obtener tu API key:\n');
    console.log('1. Ve a: https://app.leonardo.ai/');
    console.log('2. Regístrate gratis (150 créditos diarios)');
    console.log('3. Settings → API Access → Create API Key');
    console.log('4. Ejecuta: export LEONARDO_API_KEY="tu_key_aqui"\n');
    console.log('💡 Leonardo es GRATIS: 150 créditos diarios = ~15 imágenes/día');
    console.log('📊 Con 27 imágenes pendientes = 2 días de generación\n');
    process.exit(1);
  }

  // Crear directorio de salida
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Cargar cache
  let cache = {};
  try {
    const cacheData = await fs.readFile(CACHE_FILE, 'utf8');
    cache = JSON.parse(cacheData);
    console.log(`\n📦 Cache cargado: ${Object.keys(cache).length} productos ya generados`);
  } catch (error) {
    console.log('\n📦 Cache vacío, empezando desde cero');
  }

  console.log(`📁 Directorio: ${OUTPUT_DIR}`);

  // Función para generar prompt único por producto
  function generatePrompt(product) {
    const flowers = product.flowers?.join(', ') || 'flores mixtas';
    const colors = product.colors?.join(' y ') || 'colores variados';
    const category = product.category || 'arreglo';

    let style = 'elegant professional product photography';
    if (category === 'premium') style = 'luxury high-end product photography';
    if (category === 'navidad') style = 'festive christmas product photography';
    if (category === 'bodas') style = 'romantic wedding product photography';

    return `${style}, beautiful ${flowers} flower arrangement in ${colors} colors, studio lighting, white background, commercial quality, 8k, ultra detailed, centered composition, soft shadows`;
  }

  // Función para generar con Leonardo
  async function generateWithLeonardo(prompt) {
    console.log('   🎨 Enviando a Leonardo.ai...');

    // Paso 1: Crear generación
    const generateResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LEONARDO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        modelId: MODEL_ID,
        width: 768,
        height: 768,
        num_images: 1,
        guidance_scale: 7,
        num_inference_steps: 30,
        public: false,
      }),
    });

    if (!generateResponse.ok) {
      const error = await generateResponse.text();
      throw new Error(`Leonardo error ${generateResponse.status}: ${error}`);
    }

    const generateData = await generateResponse.json();
    const generationId = generateData.sdGenerationJob.generationId;

    console.log(`   ⏳ Generación iniciada (ID: ${generationId.substring(0, 8)}...)`);

    // Paso 2: Esperar a que termine (polling)
    let attempts = 0;
    const maxAttempts = 60; // 60 intentos = 2 minutos max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2s

      const statusResponse = await fetch(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        {
          headers: {
            Authorization: `Bearer ${LEONARDO_API_KEY}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Error checking status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      const generation = statusData.generations_by_pk;

      if (generation.status === 'COMPLETE') {
        const imageUrl = generation.generated_images[0].url;
        console.log('   ✅ Imagen generada, descargando...');

        // Descargar imagen
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Error descargando imagen: ${imageResponse.status}`);
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        return imageBuffer;
      }

      if (generation.status === 'FAILED') {
        throw new Error('La generación falló en Leonardo');
      }

      attempts++;
      process.stdout.write('.');
    }

    throw new Error('Timeout esperando la generación');
  }

  // Función para aplicar marca de agua dual
  async function addWatermark(imageBuffer) {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Preparar logo
    const logoBuffer = await fs.readFile(LOGO_PATH);
    const logoSvg = logoBuffer.toString('utf-8');

    // Logo centrado (50% ancho, 25% opacidad)
    const centerWidth = Math.floor(width * 0.5);
    const centerLogo = await sharp(Buffer.from(logoSvg))
      .resize(centerWidth, null, { fit: 'inside' })
      .png()
      .toBuffer();

    const centerMeta = await sharp(centerLogo).metadata();
    const centerX = Math.floor((width - centerMeta.width) / 2);
    const centerY = Math.floor((height - centerMeta.height) / 2);

    const centerWithOpacity = await sharp(centerLogo)
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.floor(255 * 0.25)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in',
        },
      ])
      .toBuffer();

    // Logo esquina (80px, 100% opacidad)
    const cornerLogo = await sharp(Buffer.from(logoSvg))
      .resize(80, null, { fit: 'inside' })
      .png()
      .toBuffer();

    const cornerMeta = await sharp(cornerLogo).metadata();
    const cornerX = width - cornerMeta.width - 10;
    const cornerY = height - cornerMeta.height - 10;

    // Compositar ambas marcas
    return image
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
  console.log(`💡 Con 150 créditos diarios puedes generar ~15 imágenes\n`);

  // Procesar en lotes
  let generated = 0;
  let failed = 0;

  for (let i = 0; i < Math.min(products.length, BATCH_SIZE); i++) {
    const product = products[i];

    console.log(
      `[${i + 1}/${Math.min(products.length, BATCH_SIZE)}] ${product.name} (${product.id})`
    );

    try {
      // Generar prompt
      const prompt = generatePrompt(product);
      console.log(`   📝 ${prompt.substring(0, 70)}...`);

      // Generar imagen
      const image = await generateWithLeonardo(prompt);

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

      // Delay entre requests
      if (i < Math.min(products.length, BATCH_SIZE) - 1) {
        console.log(`   ⏳ Esperando ${DELAY_MS / 1000}s...\n`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      failed++;

      // Si es error de créditos, informar
      if (error.message.includes('insufficient') || error.message.includes('credit')) {
        console.log(`\n⚠️  Has agotado tus créditos diarios de Leonardo.ai`);
        console.log(`💡 Se resetean cada 24 horas (150 créditos = ~15 imágenes)`);
        console.log(`📊 Progreso actual: ${Object.keys(cache).length}/${allProducts.length}\n`);
        break;
      }
    }
  }

  // Resumen
  console.log('='.repeat(70));
  console.log(`\n✅ Generados: ${generated}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`📦 Total: ${Object.keys(cache).length}/${allProducts.length}`);

  const remaining = allProducts.length - Object.keys(cache).length;
  if (remaining > 0) {
    const daysNeeded = Math.ceil(remaining / 15);
    console.log(`\n📅 Faltan ${remaining} imágenes (~${daysNeeded} días con Leonardo gratuito)`);
    console.log(`💡 Ejecuta el script mañana para continuar`);
  }

  console.log(`\n📁 Imágenes en: ${OUTPUT_DIR}\n`);
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
});
