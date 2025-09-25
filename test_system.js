// test_system.js - Script para probar la funcionalidad del sistema
async function testSystem() {
  console.log('=== PRUEBAS DEL SISTEMA FLORES VICTORIA ===\n');
  
  // 1. Probar el gateway de API
  console.log('1. Probando gateway de API (puerto 3000)...');
  try {
    const gatewayResponse = await fetch('http://localhost:3000/api/status');
    console.log(`   Estado: ${gatewayResponse.ok ? 'OK' : 'ERROR'} (${gatewayResponse.status})`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // 2. Probar el servicio de productos directamente
  console.log('\n2. Probando servicio de productos (puerto 3002)...');
  try {
    const productsServiceResponse = await fetch('http://localhost:3002/api/products');
    console.log(`   Estado: ${productsServiceResponse.ok ? 'OK' : 'ERROR'} (${productsServiceResponse.status})`);
    
    if (productsServiceResponse.ok) {
      const data = await productsServiceResponse.json();
      console.log(`   Datos: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // 3. Probar el frontend
  console.log('\n3. Probando frontend (puerto 5173)...');
  try {
    const frontendResponse = await fetch('http://localhost:5173/index.html');
    console.log(`   Estado: ${frontendResponse.ok ? 'OK' : 'ERROR'} (${frontendResponse.status})`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // 4. Probar la página de productos
  console.log('\n4. Probando página de productos...');
  try {
    const productsPageResponse = await fetch('http://localhost:5173/pages/products.html');
    console.log(`   Estado: ${productsPageResponse.ok ? 'OK' : 'ERROR'} (${productsPageResponse.status})`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // 5. Probar el archivo de configuración de API
  console.log('\n5. Probando archivo de configuración de API...');
  try {
    const apiConfigResponse = await fetch('http://localhost:5173/assets/js/config/api.js');
    console.log(`   Estado: ${apiConfigResponse.ok ? 'OK' : 'ERROR'} (${apiConfigResponse.status})`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n=== FIN DE PRUEBAS ===');
}

// Ejecutar las pruebas
testSystem();