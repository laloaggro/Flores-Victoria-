#!/usr/bin/env node

/**
 * Script de prueba completa del sistema Flores Victoria
 * 
 * Este script valida:
 * - Conectividad de todos los microservicios
 * - Endpoints de API Gateway
 * - Funcionalidad de autenticación (login, registro)
 * - Servicio de productos
 * - Frontend
 * - Integración completa
 */

const http = require('http');
const https = require('https');

// Colores y estilos para la terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

// Emojis para mejor visualización
const icons = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  rocket: '🚀',
  check: '✔',
  cross: '✘',
  star: '⭐',
  target: '🎯',
  gear: '⚙',
  lock: '🔒',
  package: '📦',
  page: '📄',
  link: '🔗',
  timer: '⏱',
  chart: '📊'
};

// Estadísticas globales
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  startTime: Date.now()
};

// Función para hacer peticiones HTTP con reintentos
async function makeRequest(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        // Cabeceras por defecto - solo Accept para GET, mínimas para POST
        const defaultHeaders = {};
        
        // Solo agregar Accept para peticiones GET o si no hay Content-Type
        if (!options.method || options.method === 'GET') {
          defaultHeaders['Accept'] = 'text/html,application/json,*/*';
        }
        
        // Agregar Content-Length automáticamente si hay body
        const finalHeaders = { ...defaultHeaders, ...options.headers };
        if (options.body && !finalHeaders['Content-Length']) {
          finalHeaders['Content-Length'] = Buffer.byteLength(options.body);
        }
        
        const reqOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname + parsedUrl.search,
          method: options.method || 'GET',
          headers: finalHeaders,
          timeout: 5000
        };
        
        const req = protocol.request(reqOptions, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data
            });
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
        
        if (options.body) {
          req.write(options.body);
        }
        
        req.end();
      });
    } catch (error) {
      if (i === retries - 1) throw error;
      // Esperar antes de reintentar (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Función para imprimir resultados con mejor formato
function printResult(testName, success, message = '', timing = null) {
  stats.total++;
  if (success) {
    stats.passed++;
  } else {
    stats.failed++;
  }
  
  const icon = success ? `${colors.green}${icons.success}` : `${colors.red}${icons.error}`;
  const statusColor = success ? colors.green : colors.red;
  const timingStr = timing ? `${colors.dim}(${timing}ms)${colors.reset}` : '';
  
  // Formatear el nombre del test con padding
  const paddedName = testName.padEnd(45, ' ');
  
  console.log(`  ${icon} ${colors.white}${paddedName}${colors.reset} ${statusColor}${message}${colors.reset} ${timingStr}`);
}

// Función para imprimir encabezado de sección
function printHeader(title, icon = icons.gear) {
  const width = 70;
  const padding = Math.floor((width - title.length - 4) / 2);
  
  console.log(`\n${colors.cyan}${'═'.repeat(width)}`);
  console.log(`${' '.repeat(padding)}${icon}  ${colors.bright}${title}${colors.reset}${colors.cyan}  ${icon}`);
  console.log(`${'═'.repeat(width)}${colors.reset}\n`);
}

// Función para imprimir barra de progreso
function printProgressBar(current, total, label = '') {
  const percentage = Math.round((current / total) * 100);
  const barLength = 40;
  const filledLength = Math.round((barLength * current) / total);
  const emptyLength = barLength - filledLength;
  
  const bar = `${colors.bgGreen}${' '.repeat(filledLength)}${colors.reset}${colors.dim}${'░'.repeat(emptyLength)}${colors.reset}`;
  const percentStr = `${colors.bright}${percentage}%${colors.reset}`;
  
  process.stdout.write(`\r  ${label} ${bar} ${percentStr} (${current}/${total})`);
  
  if (current === total) {
    console.log(); // Nueva línea al completar
  }
}

// Función para imprimir banner principal
function printBanner() {
  const width = 70;
  console.clear();
  console.log(`${colors.bgMagenta}${colors.white}${colors.bright}`);
  console.log(`${'═'.repeat(width)}`);
  console.log(`║${' '.repeat(68)}║`);
  console.log(`║     ${icons.rocket}  SISTEMA DE PRUEBAS - FLORES VICTORIA  ${icons.rocket}          ║`);
  console.log(`║${' '.repeat(68)}║`);
  console.log(`${'═'.repeat(width)}`);
  console.log(colors.reset);
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  console.log(`${colors.dim}  📅 Fecha: ${dateStr}${colors.reset}`);
  console.log(`${colors.dim}  ${icons.target} Objetivo: Validación completa del sistema${colors.reset}\n`);
}

// Función para imprimir resumen final
function printSummary() {
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
  
  console.log(`\n${colors.cyan}${'═'.repeat(70)}`);
  console.log(`${colors.bright}${colors.white}  ${icons.chart} RESUMEN DE RESULTADOS${colors.reset}${colors.cyan}`);
  console.log(`${'═'.repeat(70)}${colors.reset}\n`);
  
  // Tabla de resultados
  const tableWidth = 50;
  console.log(`${colors.white}  ┌${'─'.repeat(tableWidth)}┐${colors.reset}`);
  console.log(`${colors.white}  │${colors.bright}  Métrica${' '.repeat(19)}│  Valor${' '.repeat(11)}│${colors.reset}`);
  console.log(`${colors.white}  ├${'─'.repeat(tableWidth)}┤${colors.reset}`);
  
  const metrics = [
    { label: `${icons.check} Pruebas totales`, value: stats.total, color: colors.white },
    { label: `${icons.success} Pruebas exitosas`, value: stats.passed, color: colors.green },
    { label: `${icons.error} Pruebas fallidas`, value: stats.failed, color: colors.red },
    { label: `${icons.star} Tasa de éxito`, value: `${successRate}%`, color: colors.cyan },
    { label: `${icons.timer} Duración`, value: `${duration}s`, color: colors.yellow }
  ];
  
  metrics.forEach(metric => {
    const label = metric.label.padEnd(28, ' ');
    const value = String(metric.value).padStart(10, ' ');
    console.log(`${colors.white}  │  ${metric.color}${label}${colors.reset}${colors.white}│${metric.color}${value}  ${colors.reset}${colors.white}│${colors.reset}`);
  });
  
  console.log(`${colors.white}  └${'─'.repeat(tableWidth)}┘${colors.reset}\n`);
  
  // Mensaje final
  if (stats.failed === 0) {
    console.log(`${colors.bgGreen}${colors.white}${colors.bright}`);
    console.log(`  ${icons.success} ${icons.success} ${icons.success}  ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!  ${icons.success} ${icons.success} ${icons.success}  `);
    console.log(colors.reset);
  } else {
    console.log(`${colors.bgYellow}${colors.white}${colors.bright}`);
    console.log(`  ${icons.warning} ATENCIÓN: ${stats.failed} prueba(s) fallaron. Revisa los detalles arriba. ${icons.warning}  `);
    console.log(colors.reset);
  }
  
  console.log();
}

// Test 1: Verificar servicios básicos
async function testBasicServices() {
  printHeader('VERIFICACIÓN DE SERVICIOS BÁSICOS', icons.gear);
  
  const services = [
    { name: 'API Gateway', url: 'http://localhost:3000/health', icon: icons.link },
    { name: 'Auth Service', url: 'http://localhost:3001/health', icon: icons.lock },
    { name: 'Product Service', url: 'http://localhost:3009/health', icon: icons.package },
    { name: 'Frontend', url: 'http://localhost:5173/', icon: icons.page }
  ];
  
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    const startTime = Date.now();
    
    try {
      const response = await makeRequest(service.url);
      const timing = Date.now() - startTime;
      printResult(
        `${service.icon} ${service.name}`,
        response.statusCode === 200,
        `HTTP ${response.statusCode}`,
        timing
      );
    } catch (error) {
      const timing = Date.now() - startTime;
      printResult(`${service.icon} ${service.name}`, false, error.message, timing);
    }
    
    // Actualizar barra de progreso
    printProgressBar(i + 1, services.length, `${colors.cyan}Progreso:${colors.reset}`);
  }
}

// Test 2: Verificar autenticación
async function testAuthentication() {
  printHeader('PRUEBAS DE AUTENTICACIÓN', icons.lock);
  
  const tests = [
    {
      name: 'Login con credenciales válidas',
      data: { email: 'admin@arreglosvictoria.com', password: 'admin123' },
      expectedStatus: 200,
      expectedMessage: 'exitoso'
    },
    {
      name: 'Login con credenciales inválidas',
      data: { email: 'wrong@test.com', password: 'wrongpass' },
      expectedStatus: 401,
      expectedMessage: 'inválidas'
    },
    {
      name: 'Registro de nuevo usuario',
      data: { 
        email: `test${Date.now()}@test.com`, 
        password: 'test123',
        name: 'Test User'
      },
      endpoint: '/api/auth/register',
      expectedStatus: 201,
      expectedMessage: 'registrado'
    }
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const startTime = Date.now();
    
    try {
      const response = await makeRequest(
        `http://localhost:3000${test.endpoint || '/api/auth/login'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.data)
        }
      );
      
      const timing = Date.now() - startTime;
      const success = response.statusCode === test.expectedStatus;
      let message = `HTTP ${response.statusCode}`;
      
      if (success) {
        message += ` - ${test.expectedMessage}`;
      }
      
      printResult(test.name, success, message, timing);
    } catch (error) {
      const timing = Date.now() - startTime;
      printResult(test.name, false, error.message, timing);
    }
    
    printProgressBar(i + 1, tests.length, `${colors.cyan}Progreso:${colors.reset}`);
  }
}

// Test 3: Verificar servicio de productos
async function testProductService() {
  printHeader('PRUEBAS DE SERVICIO DE PRODUCTOS', icons.package);
  
  const tests = [
    { name: 'Obtener lista de productos', url: 'http://localhost:3000/api/products' },
    { name: 'Búsqueda de productos', url: 'http://localhost:3000/api/products?search=rosa' }
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const startTime = Date.now();
    
    try {
      const response = await makeRequest(test.url);
      const timing = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        const count = Array.isArray(data) ? data.length : (data.products ? data.products.length : 0);
        printResult(test.name, true, `${count} productos encontrados`, timing);
      } else {
        printResult(test.name, false, `HTTP ${response.statusCode}`, timing);
      }
    } catch (error) {
      const timing = Date.now() - startTime;
      printResult(test.name, false, error.message, timing);
    }
    
    printProgressBar(i + 1, tests.length, `${colors.cyan}Progreso:${colors.reset}`);
  }
}

// Test 4: Verificar frontend
async function testFrontend() {
  printHeader('PRUEBAS DE FRONTEND', icons.page);
  
  const pages = [
    { name: 'Página principal', url: 'http://localhost:5173/' },
    { name: 'Página de login', url: 'http://localhost:5173/pages/login.html' },
    { name: 'Página de registro', url: 'http://localhost:5173/pages/register.html' },
    { name: 'Página de productos', url: 'http://localhost:5173/pages/products.html' }
  ];
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const startTime = Date.now();
    
    try {
      const response = await makeRequest(page.url);
      const timing = Date.now() - startTime;
      const success = response.statusCode === 200;
      printResult(page.name, success, `HTTP ${response.statusCode}`, timing);
    } catch (error) {
      const timing = Date.now() - startTime;
      printResult(page.name, false, error.message, timing);
    }
    
    printProgressBar(i + 1, pages.length + 1, `${colors.cyan}Progreso:${colors.reset}`);
  }
  
  // Test adicional: archivo de configuración
  const startTime = Date.now();
  try {
    const response = await makeRequest('http://localhost:5173/js/config/api.js');
    const timing = Date.now() - startTime;
    const success = response.statusCode === 200;
    printResult('Archivo de configuración API', success, `HTTP ${response.statusCode}`, timing);
  } catch (error) {
    const timing = Date.now() - startTime;
    printResult('Archivo de configuración API', false, error.message, timing);
  }
  
  printProgressBar(pages.length + 1, pages.length + 1, `${colors.cyan}Progreso:${colors.reset}`);
}

// Test 5: Verificar integración completa
async function testIntegration() {
  printHeader('PRUEBAS DE INTEGRACIÓN', icons.link);
  
  console.log(`${colors.yellow}  ${icons.info} Ejecutando flujo completo: Login → Obtener productos\n${colors.reset}`);
  
  let authToken = null;
  const startTime = Date.now();
  
  // Paso 1: Login
  try {
    const loginData = JSON.stringify({
      email: 'admin@arreglosvictoria.com',
      password: 'admin123'
    });
    
    const step1Start = Date.now();
    const response = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      },
      body: loginData
    });
    
    const step1Timing = Date.now() - step1Start;
    const result = JSON.parse(response.body);
    
    if (response.statusCode === 200 && result.status === 'success') {
      authToken = result.token || 'mock-token';
      printResult('Paso 1: Autenticación de usuario', true, 'Token obtenido', step1Timing);
    } else {
      printResult('Paso 1: Autenticación de usuario', false, `HTTP ${response.statusCode}`, step1Timing);
      return;
    }
  } catch (error) {
    const step1Timing = Date.now() - startTime;
    printResult('Paso 1: Autenticación de usuario', false, error.message, step1Timing);
    return;
  }
  
  printProgressBar(1, 2, `${colors.cyan}Progreso:${colors.reset}`);
  
  // Paso 2: Obtener productos (simulando usuario autenticado)
  try {
    const step2Start = Date.now();
    const response = await makeRequest('http://localhost:3000/api/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const step2Timing = Date.now() - step2Start;
    const result = JSON.parse(response.body);
    const count = Array.isArray(result) ? result.length : (result.products ? result.products.length : 0);
    
    printResult(
      'Paso 2: Obtener productos autenticado',
      response.statusCode === 200,
      `${count} productos`,
      step2Timing
    );
  } catch (error) {
    const step2Timing = Date.now() - startTime;
    printResult('Paso 2: Obtener productos autenticado', false, error.message, step2Timing);
  }
  
  printProgressBar(2, 2, `${colors.cyan}Progreso:${colors.reset}`);
  
  const totalTiming = Date.now() - startTime;
  console.log(`\n${colors.dim}  ${icons.timer} Tiempo total del flujo: ${totalTiming}ms${colors.reset}`);
}

// Función principal
async function runAllTests() {
  printBanner();
  
  try {
    await testBasicServices();
    await testAuthentication();
    await testProductService();
    await testFrontend();
    await testIntegration();
    
    printSummary();
    
    // Código de salida basado en resultados
    process.exit(stats.failed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error(`\n${colors.bgRed}${colors.white} ${icons.error} ERROR CRÍTICO ${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}\n`);
    console.error(`${colors.dim}Stack trace:${colors.reset}`);
    console.error(`${colors.dim}${error.stack}${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar pruebas
runAllTests();
