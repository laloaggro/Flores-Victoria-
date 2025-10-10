import http from 'k6/http';
import { check, sleep } from 'k6';

// Opciones de la prueba de carga
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users over 30 seconds
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

  // Test GET /api/products/:id (con un ID fijo para esta prueba)
  const getSingleProduct = http.get(`${BASE_URL}/api/products/1`);
  check(getSingleProduct, {
    'get single product status is 200': (r) => r.status === 200,
  });

  sleep(1);
}