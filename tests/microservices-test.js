// Pruebas automatizadas para los microservicios del sistema Flores Victoria
const { execSync } = require('child_process');

// Configuración
const NAMESPACE = 'flores-victoria';
const SERVICES = [
  { name: 'user-service', port: 3003, healthPath: '/api/users/' },
  { name: 'contact-service', port: 3008, healthPath: '/' },
  { name: 'review-service', port: 3007, healthPath: '/api/reviews' },
  { name: 'auth-service', port: 3001, healthPath: '/' },
  { name: 'product-service', port: 3002, healthPath: '/products' },
  { name: 'order-service', port: 3004, healthPath: '/' },
  { name: 'cart-service', port: 3005, healthPath: '/' },
  { name: 'wishlist-service', port: 3006, healthPath: '/' }
];

// Función para ejecutar comandos kubectl
function kubectlCommand(command) {
  try {
    const result = execSync(`kubectl ${command}`, { encoding: 'utf-8' });
    return result.trim();
  } catch (error) {
    console.error(`Error ejecutando comando: kubectl ${command}`);
    console.error(error.message);
    return null;
  }
}

// Función para verificar el estado de un servicio
async function checkService(service) {
  console.log(`\nVerificando ${service.name}...`);
  
  try {
    // Verificar si el pod está corriendo
    const podStatus = kubectlCommand(`get pods -n ${NAMESPACE} -l app=${service.name} -o jsonpath='{.items[0].status.phase}'`);
    
    if (podStatus !== 'Running') {
      console.error(`  ❌ ${service.name} no está en estado Running (Estado actual: ${podStatus})`);
      return false;
    }
    
    // Verificar si todos los contenedores están listos
    const readyContainers = kubectlCommand(`get pods -n ${NAMESPACE} -l app=${service.name} -o jsonpath='{.items[0].status.containerStatuses[*].ready}'`);
    
    if (!readyContainers || readyContainers.includes('false')) {
      console.error(`  ❌ ${service.name} tiene contenedores no listos`);
      return false;
    }
    
    // Verificar la ruta de salud si se proporcionó
    if (service.healthPath) {
      const response = kubectlCommand(`exec -n ${NAMESPACE} api-gateway-5fcd8f9d8d-k7vbz -- wget -qO- --timeout=5 http://${service.name}:${service.port}${service.healthPath}`);
      
      if (response === null) {
        console.error(`  ❌ ${service.name} no responde en ${service.healthPath}`);
        return false;
      }
      
      console.log(`  ✅ ${service.name} está respondiendo correctamente en ${service.healthPath}`);
    } else {
      console.log(`  ✅ ${service.name} está corriendo con todos los contenedores listos`);
    }
    
    return true;
  } catch (error) {
    console.error(`  ❌ Error al verificar ${service.name}:`, error.message);
    return false;
  }
}

// Función principal de prueba
async function runTests() {
  console.log('=== Pruebas automatizadas de microservicios - Flores Victoria ===');
  console.log(new Date().toString());
  
  let passedTests = 0;
  let totalTests = SERVICES.length;
  
  // Verificar cada microservicio
  console.log('\nVerificando microservicios...');
  
  for (const service of SERVICES) {
    const result = await checkService(service);
    if (result) {
      passedTests++;
    }
  }
  
  // Resultados
  console.log('\n=== Resultados de las pruebas ===');
  console.log(`✅ Pruebas pasadas: ${passedTests}`);
  console.log(`❌ Pruebas fallidas: ${totalTests - passedTests}`);
  console.log(`📊 Total de pruebas: ${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron');
    process.exit(1);
  }
}

// Ejecutar las pruebas
runTests().catch(error => {
  console.error('Error durante la ejecución de las pruebas:', error);
  process.exit(1);
});