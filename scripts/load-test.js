/**
 * K6 Load Testing Script
 * 
 * Simula carga realista en Flores Victoria
 * Stages: Ramp-up -> Sustain -> Ramp-down
 * 
 * Instalar k6: https://k6.io/docs/getting-started/installation/
 * 
 * Ejecutar:
 * k6 run scripts/load-test.js
 * k6 run scripts/load-test.js --vus 50 --duration 5m
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Gauge, Counter } from 'k6/metrics';

// Configuración
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp-up a 10 VUs
    { duration: '5m', target: 20 },   // Ramp-up a 20 VUs
    { duration: '10m', target: 20 },  // Sostener 20 VUs
    { duration: '5m', target: 10 },   // Ramp-down a 10 VUs
    { duration: '2m', target: 0 },    // Ramp-down a 0
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // P95 < 500ms, P99 < 1s
    'http_req_failed': ['rate<0.1'],                   // < 10% error rate
    'http_requests': ['count>1000'],                   // Al menos 1000 requests
  }
};

// Métricas custom
const errorRate = new Rate('errors');
const requestDuration = new Trend('request_duration');
const successCount = new Counter('successes');
const activeVUs = new Gauge('active_vus');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// Estado compartido
const state = {
  userId: null,
  token: null,
  productId: null,
  orderId: null
};

export default function () {
  // Actualizar VUs activos
  activeVUs.set(__VU);

  // Test 1: Health Check
  group('Health Checks', () => {
    const res = http.get(`${BASE_URL}/health`);
    
    const success = check(res, {
      'health returns 200': (r) => r.status === 200,
      'health response < 50ms': (r) => r.timings.duration < 50,
      'has status ok': (r) => r.json('status') === 'ok'
    });

    if (!success) errorRate.add(1);
    else successCount.add(1);
    requestDuration.add(res.timings.duration);
  });

  sleep(1);

  // Test 2: Auth - Register (si no autenticado)
  if (!state.token) {
    group('Auth - Register', () => {
      const email = `user-${Date.now()}-${Math.random()}@example.com`;
      
      const res = http.post(
        `${BASE_URL}/api/auth/register`,
        JSON.stringify({
          name: 'Test User',
          email: email,
          password: 'TestPass123!'
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );

      const success = check(res, {
        'register returns 201 or 200': (r) => r.status === 201 || r.status === 200,
        'response has userId': (r) => r.json('data.id') !== undefined,
        'register response < 500ms': (r) => r.timings.duration < 500
      });

      if (!success) {
        errorRate.add(1);
      } else {
        state.userId = res.json('data.id');
        successCount.add(1);
      }
      requestDuration.add(res.timings.duration);
    });

    sleep(1);
  }

  // Test 3: Auth - Login
  group('Auth - Login', () => {
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPass123!'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    const success = check(res, {
      'login returns 200': (r) => r.status === 200,
      'has access token': (r) => r.json('data.accessToken') !== undefined,
      'login response < 300ms': (r) => r.timings.duration < 300
    });

    if (success) {
      state.token = res.json('data.accessToken');
      successCount.add(1);
    } else {
      errorRate.add(1);
    }
    requestDuration.add(res.timings.duration);
  });

  sleep(1);

  // Test 4: Products - List
  group('Products - List', () => {
    const params = {
      headers: {
        'Authorization': `Bearer ${state.token || AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const res = http.get(`${BASE_URL}/api/products?limit=20&page=1`, params);

    const success = check(res, {
      'products list returns 200': (r) => r.status === 200,
      'has products array': (r) => r.json('data') !== undefined && Array.isArray(r.json('data')),
      'list response < 300ms': (r) => r.timings.duration < 300,
      'has pagination': (r) => r.json('pagination') !== undefined
    });

    if (success) {
      const products = res.json('data');
      if (products.length > 0) {
        state.productId = products[0].id;
      }
      successCount.add(1);
    } else {
      errorRate.add(1);
    }
    requestDuration.add(res.timings.duration);
  });

  sleep(1);

  // Test 5: Products - Detail
  if (state.productId) {
    group('Products - Detail', () => {
      const params = {
        headers: {
          'Authorization': `Bearer ${state.token || AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };

      const res = http.get(`${BASE_URL}/api/products/${state.productId}`, params);

      const success = check(res, {
        'product detail returns 200': (r) => r.status === 200,
        'has product data': (r) => r.json('data.id') !== undefined,
        'detail response < 200ms': (r) => r.timings.duration < 200,
        'has price': (r) => r.json('data.price') !== undefined
      });

      if (!success) errorRate.add(1);
      else successCount.add(1);
      requestDuration.add(res.timings.duration);
    });

    sleep(1);
  }

  // Test 6: Products - Search
  group('Products - Search', () => {
    const params = {
      headers: {
        'Authorization': `Bearer ${state.token || AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const res = http.get(`${BASE_URL}/api/products/search?q=rose&limit=10`, params);

    const success = check(res, {
      'search returns 200': (r) => r.status === 200,
      'search has results': (r) => r.json('data') !== undefined,
      'search response < 500ms': (r) => r.timings.duration < 500
    });

    if (!success) errorRate.add(1);
    else successCount.add(1);
    requestDuration.add(res.timings.duration);
  });

  sleep(1);

  // Test 7: Cart - Add Item
  if (state.productId && state.token) {
    group('Cart - Add Item', () => {
      const res = http.post(
        `${BASE_URL}/api/cart/items`,
        JSON.stringify({
          productId: state.productId,
          quantity: 1
        }),
        {
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const success = check(res, {
        'add to cart returns 200': (r) => r.status === 200 || r.status === 201,
        'cart add response < 300ms': (r) => r.timings.duration < 300
      });

      if (!success) errorRate.add(1);
      else successCount.add(1);
      requestDuration.add(res.timings.duration);
    });

    sleep(1);
  }

  // Test 8: Orders - Create
  if (state.token && state.productId) {
    group('Orders - Create', () => {
      const res = http.post(
        `${BASE_URL}/api/orders`,
        JSON.stringify({
          items: [{ productId: state.productId, quantity: 1 }],
          shippingAddress: {
            street: '123 Main St',
            city: 'City',
            country: 'Country',
            zipCode: '12345'
          }
        }),
        {
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const success = check(res, {
        'order creation returns 200 or 201': (r) => r.status === 200 || r.status === 201,
        'has order id': (r) => r.json('data.id') !== undefined,
        'order response < 1000ms': (r) => r.timings.duration < 1000
      });

      if (success) {
        state.orderId = res.json('data.id');
        successCount.add(1);
      } else {
        errorRate.add(1);
      }
      requestDuration.add(res.timings.duration);
    });

    sleep(1);
  }

  // Test 9: Reviews - List
  if (state.productId && state.token) {
    group('Reviews - List', () => {
      const res = http.get(
        `${BASE_URL}/api/reviews?productId=${state.productId}`,
        {
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const success = check(res, {
        'reviews list returns 200': (r) => r.status === 200,
        'has reviews array': (r) => Array.isArray(r.json('data')),
        'reviews response < 300ms': (r) => r.timings.duration < 300
      });

      if (!success) errorRate.add(1);
      else successCount.add(1);
      requestDuration.add(res.timings.duration);
    });

    sleep(1);
  }

  // Resumen
  console.log(`VU: ${__VU} | Iteration: ${__ITER}`);
}

/**
 * Summary de resultados
 */
export function handleSummary(data) {
  console.log('\n=================================');
  console.log('📊 Load Test Results');
  console.log('=================================\n');

  console.log(`Total Requests: ${data.metrics.http_reqs.value}`);
  console.log(`Successful: ${successCount.value}`);
  console.log(`Errors: ${errorRate.value}`);
  console.log(`Error Rate: ${((errorRate.value / data.metrics.http_reqs.value) * 100).toFixed(2)}%`);
  console.log(`\nLatency:`);
  console.log(`  Avg: ${data.metrics.http_req_duration.values.avg?.toFixed(2)}ms`);
  console.log(`  P95: ${data.metrics.http_req_duration.values['p(95)']?.toFixed(2)}ms`);
  console.log(`  P99: ${data.metrics.http_req_duration.values['p(99)']?.toFixed(2)}ms`);
  console.log(`  Max: ${data.metrics.http_req_duration.values.max?.toFixed(2)}ms`);

  return {
    stdout: JSON.stringify(data, null, 2)
  };
}
