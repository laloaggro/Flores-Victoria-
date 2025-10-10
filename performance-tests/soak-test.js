import http from 'k6/http';
import { check, sleep } from 'k6';

// Opciones de la prueba de soak (larga duración)
export const options = {
  stages: [
    { duration: '5m', target: 10 },  // Ramp up to 10 users over 5 minutes
    { duration: '8h', target: 10 },  // Stay at 10 users for 8 hours
    { duration: '5m', target: 0 },   // Ramp down to 0 users over 5 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

// URL base del servicio de productos
const BASE_URL = 'http://localhost:3002';

export default function () {
  // Test GET /api/products
  const getProductList = http.get(`${BASE_URL}/api/products`);
  check(getProductList, {
    'get products status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test GET /api/products/:id
  const getSingleProduct = http.get(`${BASE_URL}/api/products/1`);
  check(getSingleProduct, {
    'get single product status is 200': (r) => r.status === 200,
  });

  sleep(1);
  
  // Test GET /health
  const healthCheck = http.get(`${BASE_URL}/health`);
  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
  });

  sleep(1);
}