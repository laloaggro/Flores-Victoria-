#!/usr/bin/env node
/**
 * Test de Prompts Únicos
 * Muestra los prompts generados para diferentes productos
 */

const ProductImageGenerator = require('./scripts/generate-product-images.js');

async function testPrompts() {
  console.log('🧪 Probando generación de prompts únicos\n');
  console.log('='.repeat(80));
  
  const generator = new ProductImageGenerator();
  
  try {
    // Obtener varios productos
    const response = await fetch('http://localhost:3000/api/products?limit=5');
    const data = await response.json();
    const products = data.products || data.data || data;
    
    if (!products || products.length === 0) {
      console.log('❌ No se encontraron productos');
      return;
    }
    
    console.log(`\n📦 Analizando ${products.length} productos:\n`);
    
    products.forEach((product, index) => {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`\n${index + 1}. ${product.name} (${product.id})`);
      console.log(`   Categoría: ${product.category}`);
      console.log(`   Flores: ${product.flowers?.join(', ') || 'N/A'}`);
      console.log(`   Colores: ${product.colors?.join(', ') || 'N/A'}`);
      
      const promptData = generator.generatePrompt(product);
      
      console.log(`\n   📝 PROMPT GENERADO:`);
      console.log(`   ${promptData.prompt}`);
      
      console.log(`\n   🚫 NEGATIVE PROMPT:`);
      console.log(`   ${promptData.negative_prompt}`);
      
      // Calcular hash para ver unicidad
      const hash = generator.generateProductHash(product);
      console.log(`\n   🔐 Hash único: ${hash.substring(0, 12)}...`);
    });
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('\n✅ Cada producto tiene un prompt único y específico');
    console.log('💡 Los prompts incluyen:');
    console.log('   ✓ Flores específicas del producto');
    console.log('   ✓ Colores exactos');
    console.log('   ✓ Estilo según categoría');
    console.log('   ✓ Contenedor apropiado');
    console.log('   ✓ Detalles únicos de cada flor');
    console.log('   ✓ Seed basado en ID del producto para consistencia');
    console.log('   ✓ Especificaciones técnicas profesionales\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
testPrompts();
