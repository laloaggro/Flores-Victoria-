#!/usr/bin/env node

/**
 * Script para probar la funcionalidad del servicio de productos
 */

const https = require('https');
const http = require('http');

// Configuración
const BASE_URL = 'http://localhost:3002';
const TIMEOUT = 5000;

// Función para hacer solicitudes HTTP
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.setTimeout(TIMEOUT);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Función para probar el endpoint de salud
async function testHealthEndpoint() {
  console.log(' Probando endpoint de salud (/health)...');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/health',
      method: 'GET'
    };
    
    const response = await makeRequest(options);
    console.log('  Estado:', response.statusCode);
    console.log('  Datos:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200 && response.data.status === 'OK') {
      console.log('  ✅ Endpoint de salud funciona correctamente\n');
      return true;
    } else {
      console.log('  ❌ Endpoint de salud no responde como se esperaba\n');
      return false;
    }
  } catch (error) {
    console.log('  ❌ Error al probar endpoint de salud:', error.message, '\n');
    return false;
  }
}

// Función para probar la obtención de productos
async function testGetProducts() {
  console.log(' Probando obtención de productos (/products)...');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/products',
      method: 'GET'
    };
    
    const response = await makeRequest(options);
    console.log('  Estado:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('  ✅ Obtención de productos funciona correctamente');
      console.log(`  Número de productos: ${Array.isArray(response.data) ? response.data.length : 'N/A'}\n`);
      return true;
    } else {
      console.log('  ❌ Error al obtener productos\n');
      return false;
    }
  } catch (error) {
    console.log('  ❌ Error al probar obtención de productos:', error.message, '\n');
    return false;
  }
}

// Función para probar la creación de un producto
async function testCreateProduct() {
  console.log(' Probando creación de producto (/products)...');
  
  const productData = {
    name: 'Ramo de Rosas de Prueba',
    price: 29.99,
    category: 'flowers',
    description: 'Ramo de rosas rojas para prueba',
    quantity: 10
  };
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(productData).length
      }
    };
    
    const response = await makeRequest(options, JSON.stringify(productData));
    console.log('  Estado:', response.statusCode);
    
    if (response.statusCode === 201) {
      console.log('  ✅ Creación de producto funciona correctamente');
      console.log('  Producto creado:', JSON.stringify(response.data, null, 2));
      return response.data.id; // Devolver ID para futuras pruebas
    } else {
      console.log('  ❌ Error al crear producto\n');
      return null;
    }
  } catch (error) {
    console.log('  ❌ Error al probar creación de producto:', error.message, '\n');
    return null;
  }
}

// Función para probar la obtención de un producto específico
async function testGetProduct(productId) {
  if (!productId) {
    console.log(' No se proporcionó ID de producto para la prueba\n');
    return false;
  }
  
  console.log(` Probando obtención de producto específico (/products/${productId})...`);
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: `/products/${productId}`,
      method: 'GET'
    };
    
    const response = await makeRequest(options);
    console.log('  Estado:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('  ✅ Obtención de producto específico funciona correctamente\n');
      return true;
    } else {
      console.log('  ❌ Error al obtener producto específico\n');
      return false;
    }
  } catch (error) {
    console.log('  ❌ Error al probar obtención de producto específico:', error.message, '\n');
    return false;
  }
}

// Función principal
async function main() {
  console.log('=== Prueba del Servicio de Productos ===\n');
  
  // Verificar que el servicio esté disponible
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    console.log('❌ El servicio de productos no está disponible. Abortando pruebas.');
    process.exit(1);
  }
  
  // Probar obtención de productos
  await testGetProducts();
  
  // Probar creación de producto
  const productId = await testCreateProduct();
  
  // Probar obtención de producto específico
  if (productId) {
    await testGetProduct(productId);
  }
  
  console.log('=== Fin de las pruebas ===');
}

// Ejecutar las pruebas
if (require.main === module) {
  main().catch((error) => {
    console.error('Error durante las pruebas:', error);
    process.exit(1);
  });
}

module.exports = {
  testHealthEndpoint,
  testGetProducts,
  testCreateProduct,
  testGetProduct
};