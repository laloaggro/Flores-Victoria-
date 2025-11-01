#!/usr/bin/env node
/**
 * Generador de Imagen Forzado
 * Genera UNA imagen para demostrar el sistema de prompts únicos
 */

const ProductImageGenerator = require('./scripts/generate-product-images.js');

async function generateTestImage() {
  console.log('🧪 Generando imagen de prueba con prompts únicos\n');
  console.log('='.repeat(80));
  
  const generator = new ProductImageGenerator({
    outputDir: './frontend/images/products/generated',
    watermarkPath: './frontend/images/logo.png',
  });
  
  await generator.init();
  
  try {
    // Obtener un producto interesante
    const response = await fetch('http://localhost:3000/api/products?limit=10');
    const data = await response.json();
    const products = data.products || data.data || data;
    
    if (!products || products.length === 0) {
      console.log('❌ No se encontraron productos');
      return;
    }
    
    // Seleccionar un producto con flores interesantes
    const product = products.find(p => 
      p.flowers && p.flowers.length > 0 && !p.name.includes('Terrario')
    ) || products[0];
    
    console.log(`\n📦 Producto seleccionado:`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Categoría: ${product.category}`);
    console.log(`   Flores: ${product.flowers?.join(', ') || 'N/A'}`);
    console.log(`   Colores: ${product.colors?.join(', ') || 'N/A'}`);
    
    const promptData = generator.generatePrompt(product);
    
    console.log(`\n📝 PROMPT GENERADO:`);
    console.log(`   ${promptData.prompt.substring(0, 200)}...`);
    
    console.log(`\n🎨 Generando imagen con AI Horde...`);
    console.log(`   (Esto puede tardar 30-60 segundos)\n`);
    
    const result = await generator.processProduct(product);
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`\n✅ ¡Imagen generada exitosamente!`);
    console.log(`\n📁 Ubicación: ${result.filepath}`);
    console.log(`🔗 URL: ${result.url}`);
    console.log(`\n✨ Características:`);
    console.log(`   ✓ Prompt único basado en flores y colores del producto`);
    console.log(`   ✓ Seed: ${product.id} para consistencia`);
    console.log(`   ✓ Doble marca de agua (centrado 25% + esquina 100%)`);
    console.log(`   ✓ Calidad profesional 8k`);
    console.log(`   ✓ Fondo blanco limpio`);
    
    // Abrir la imagen
    console.log(`\n🖼️  Abriendo imagen...`);
    const { exec } = require('child_process');
    exec(`xdg-open "${result.filepath}"`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', await error.response.text());
    }
  }
}

// Ejecutar
generateTestImage();
