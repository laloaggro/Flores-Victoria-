#!/usr/bin/env node

/**
 * Generador por Lotes - Genera imágenes en grupos pequeños
 * Para evitar rate limits de Hugging Face
 */

const fs = require('fs').promises;
const path = require('path');

const sharp = require('sharp');

const crypto = require('crypto');

// Configuración
const HF_TOKEN = process.env.HF_TOKEN || 'YOUR_HF_TOKEN_HERE';
const HF_MODEL = 'black-forest-labs/FLUX.1-schnell'; // Modelo más rápido
const LOGO_PATH = path.join(__dirname, 'frontend/public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, 'frontend/images/products/generated-hf');
const CACHE_FILE = path.join(__dirname, '.hf-generated-cache.json');
const BATCH_SIZE = 5; // Generar 5 imágenes a la vez

async function main() {
  // Cargar cache
  let cache = {};
  try {
    const cacheData = await fs.readFile(CACHE_FILE, 'utf8');
    cache = JSON.parse(cacheData);
  } catch (error) {
    console.log('📦 Cache vacío, empezando desde cero');
  }

  // Crear directorio
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Función para generar prompt único
  function generatePrompt(product) {
    const flowers = product.flowers?.join(', ') || 'flores mixtas';
    const colors = product.colors?.join(' and ') || 'mixed colors';

    return `professional product photo, ${flowers} flowers, ${colors}, elegant vase, white background, studio lighting, high quality, sharp focus, 8k`;
  }

  // Función para generar con HF
  async function generateWithHF(prompt) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 4, // Rápido
          guidance_scale: 0,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HF Error ${response.status}: ${error}`);
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return Buffer.from(buffer);
  }

  // Función para aplicar marca de agua
  async function addWatermark(imageBuffer) {
    const logoBuffer = await fs.readFile(LOGO_PATH);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Logo centrado
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

    // Logo esquina
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

    // Aplicar
    return await image
      .composite([
        { input: centerWithOpacity, top: centerY, left: centerX, blend: 'over' },
        { input: cornerLogo, top: cornerY, left: cornerX, blend: 'over' },
      ])
      .png()
      .toBuffer();
  }

  // Obtener productos
  console.log('📡 Obteniendo productos...\n');
  const response = await fetch('http://localhost:3000/api/products?limit=100');
  const data = await response.json();
  const products = (data.products || data.data || data).filter((p) => !cache[p.id]);

  console.log(`✅ ${products.length} productos pendientes de generar`);
  console.log(`📦 ${Object.keys(cache).length} productos ya generados\n`);

  if (products.length === 0) {
    console.log('🎉 ¡Todos los productos ya tienen imágenes generadas!');
    process.exit(0);
  }

  console.log(`🔄 Generando en lotes de ${BATCH_SIZE}...\n`);

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
      console.log(`   📝 ${prompt.substring(0, 60)}...`);

      // Generar imagen
      console.log(`   🎨 Generando...`);
      const image = await generateWithHF(prompt);

      // Aplicar marca de agua
      console.log(`   🔖 Aplicando marca de agua...`);
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

      // Pausa entre generaciones
      if (i < Math.min(products.length, BATCH_SIZE) - 1) {
        console.log(`   ⏳ Esperando 10 segundos...\n`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      failed++;
    }
  }

  // Resumen
  console.log('='.repeat(70));
  console.log(`\n✅ Generados: ${generated}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(
    `📦 Total acumulado: ${Object.keys(cache).length}/${products.length + Object.keys(cache).length}`
  );
  console.log(`\n💡 Para continuar, ejecuta el script nuevamente\n`);
  console.log(`📁 Imágenes en: ${OUTPUT_DIR}`);
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
});
