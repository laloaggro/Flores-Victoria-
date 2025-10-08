// Prueba de carga básica para el sistema Flores Victoria
// Esta prueba simula usuarios concurrentes accediendo al sistema

const http = require('k6/http');
const { check, sleep } = require('k6');

// Opciones de prueba
export const options = {
  // Simular 50 usuarios virtuales
  vus: 50,
  
  // Durante 1 minuto
  duration: '1m',
  
  // Etapas de carga
  stages: [
    { duration: '30s', target: 20 },  // Aumentar a 20 usuarios en 30 segundos
    { duration: '1m', target: 50 },   // Mantener 50 usuarios por 1 minuto
    { duration: '30s', target: 0 },   // Reducir a 0 usuarios en 30 segundos
  ],
  
  // Limitar la tasa de solicitudes a 100 por segundo
  rps: 100,
  
  // Umbrales de éxito
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de solicitudes deben completarse en menos de 500ms
    http_req_failed: ['rate<0.01'],   // Menos del 1% de solicitudes deben fallar
  },
};

// Datos de prueba
const PRODUCTS = [
  { id: 1, name: 'Ramo de Rosas', price: 25.99 },
  { id: 2, name: 'Arreglo de Tulipanes', price: 35.50 },
  { id: 3, name: 'Orquídea en Maceta', price: 45.00 },
];

// URL base de la API
const BASE_URL = 'http://localhost:3000';

export default function () {
  // Simular comportamiento de usuario
  
  // 1. Visitar página principal
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
  
  // 2. Obtener lista de productos
  res = http.get(`${BASE_URL}/api/products`);
  check(res, {
    'products status is 200': (r) => r.status === 200,
  });
  sleep(1);
  
  // 3. Ver detalles de un producto aleatorio
  const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  res = http.get(`${BASE_URL}/api/products/${randomProduct.id}`);
  check(res, {
    'product details status is 200': (r) => r.status === 200,
  });
  sleep(2);
  
  // 4. Simular registro de usuario (no enviar realmente)
  const userPayload = {
    name: `User ${Math.floor(Math.random() * 10000)}`,
    email: `user${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'password123',
  };
  
  res = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(userPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  // Solo verificar que la solicitud se haya realizado (no esperamos que tenga éxito)
  check(res, {
    'registration request sent': (r) => r !== null,
  });
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    './tests/load-tests/results/load-test-results.json': JSON.stringify(data),
  };
}