#!/usr/bin/env node

/**
 * Test: Genera UNA imagen con Hugging Face
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

async function testSingleImage() {
  console.log('🧪 Test de Generación con Hugging Face\n');
  
  const hfToken = process.env.HF_TOKEN || 'YOUR_HF_TOKEN_HERE';
  const model = 'stabilityai/stable-diffusion-xl-base-1.0';
  
  // Prompt de prueba
  const prompt = `Professional product photography of elegant floral arrangement, 
    featuring fresh red and pink roses in a crystal vase, 
    studio lighting, pure white background, centered composition, 
    high quality, photorealistic, 8k, commercial photography`;
  
  console.log('📝 Prompt:', prompt);
  console.log('\n🎨 Generando imagen con Hugging Face...');
  console.log('⏳ Esto puede tardar 10-30 segundos...\n');
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'blurry, low quality, distorted, watermark, text',
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 768,
            height: 768,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error:', response.status, error);
      return;
    }

    console.log('✅ Imagen generada!');
    console.log('📐 Aplicando marca de agua dual...\n');

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Aplicar marca de agua
    const logoPath = path.join(__dirname, 'frontend/public/logo.svg');
    const logoBuffer = await fs.readFile(logoPath);
    
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Logo centrado
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
    
    // Logo esquina
    const cornerLogoSize = 80;
    const cornerPadding = 20;
    
    const cornerLogo = await sharp(logoBuffer)
      .resize(cornerLogoSize, cornerLogoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    
    const cornerX = metadata.width - cornerLogoSize - cornerPadding;
    const cornerY = metadata.height - cornerLogoSize - cornerPadding;
    
    // Aplicar ambas marcas
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
    
    // Guardar
    const outputPath = 'test-hf-generation.png';
    await fs.writeFile(outputPath, result);
    
    console.log('✅ Imagen guardada:', outputPath);
    console.log('\n💡 Características:');
    console.log('   ✓ Generada con Hugging Face Stable Diffusion XL');
    console.log('   ✓ Marca de agua centrada (50% width, 25% opacity)');
    console.log('   ✓ Marca de agua esquina (80px, 100% opacity)');
    console.log('   ✓ Resolución: 768x768px\n');
    
    // Abrir imagen
    const { exec } = require('child_process');
    exec(`xdg-open "${outputPath}"`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSingleImage();
