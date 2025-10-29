const request = require('supertest');

const app = require('./app');

(async () => {
  try {
    const res404 = await request(app).get('/api/does-not-exist');
    console.log('GET /api/does-not-exist status:', res404.status);
    console.log('content-type:', res404.headers['content-type']);
    console.log('x-request-id:', res404.headers['x-request-id']);
    console.log('body:', res404.body);

    const resHealth = await request(app).get('/health');
    console.log('GET /health status:', resHealth.status);
    console.log('content-type:', resHealth.headers['content-type']);
    console.log('x-request-id:', resHealth.headers['x-request-id']);
    console.log('body:', resHealth.body);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
