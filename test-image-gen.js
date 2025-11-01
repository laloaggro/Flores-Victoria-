const ProductImageGenerator = require('./scripts/generate-product-images.js');

(async () => {
  const generator = new ProductImageGenerator();
  await generator.init();
  
  // Producto de ejemplo para prueba
  const testProduct = {
    id: 'test-1',
    name: 'Ramo de Rosas Rojas Elegante',
    flowers: ['rosas'],
    colors: ['rojo'],
    category: 'bouquet',
    description: 'Hermoso ramo de rosas rojas'
  };
  
  console.log('\n🎨 Generando imagen de prueba...');
  console.log('📦 Producto:', testProduct.name);
  
  try {
    const result = await generator.processProduct(testProduct);
    console.log('\n✅ ¡Imagen generada exitosamente!');
    console.log('📁 Ubicación:', result.filepath);
    console.log('📝 Nombre:', result.filename);
    console.log('\n💡 Abre la imagen con:');
    console.log(`   xdg-open "${result.filepath}"`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
})();
