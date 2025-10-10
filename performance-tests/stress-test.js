import http from 'k6/http';
import { check, sleep } from 'k6';

// Opciones de la prueba de estrés
export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Ramp up to 10 users
    { duration: '10s', target: 50 },   // Quickly ramp up to 50 users
    { duration: '10s', target: 100 },  // Quickly ramp up to 100 users
    { duration: '10s', target: 200 },  // Quickly ramp up to 200 users
    { duration: '30s', target: 200 },  // Stay at 200 users for 30 seconds
    { duration: '10s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    http_req_failed: ['rate<0.1'],     // Error rate should be less than 10%
  },
};

// URL base del servicio de autenticación
const BASE_URL = 'http://localhost:3001';

export default function () {
  // Test POST /api/auth/register
  const registerPayload = JSON.stringify({
    username: `user_${__VU}_${__ITER}`,
    email: `user_${__VU}_${__ITER}@example.com`,
    password: 'Password123!',
  });

  const registerParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const registerRes = http.post(`${BASE_URL}/api/auth/register`, registerPayload, registerParams);
  check(registerRes, {
    'register status is 201 or 409': (r) => r.status === 201 || r.status === 409,
  });

  sleep(1);

  // Test POST /api/auth/login
  const loginPayload = JSON.stringify({
    email: 'test@example.com',
    password: 'Password123!',
  });

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, registerParams);
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });

  sleep(1);
}