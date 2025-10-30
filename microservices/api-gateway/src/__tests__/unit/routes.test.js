const request = require('supertest');
const express = require('express');
const ServiceProxy = require('../../utils/proxy');

// Mock del proxy
jest.mock('../../utils/proxy');

describe('API Gateway Routes - Unit Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    // Crear app de Express
    app = express();
    app.use(express.json());

    // Configurar rutas básicas para testing
    const router = express.Router();

    router.get('/', (req, res) => {
      res.json({
        status: 'success',
        message: 'API Gateway - Arreglos Victoria',
        version: '1.0.0',
      });
    });

    router.use('/auth', (req, res) => {
      req.url = `/api/auth${req.url}`;
      ServiceProxy.routeToService('http://auth-service:3001', req, res);
    });

    router.use('/products', (req, res) => {
      req.url = `/products${req.url}`;
      ServiceProxy.routeToService('http://product-service:3009', req, res);
    });

    router.get('/users/profile', (req, res) => {
      req.url = '/api/auth/profile';
      ServiceProxy.routeToService('http://auth-service:3001', req, res);
    });

    app.use('/api', router);
  });

  describe('Root Route', () => {
    it('should return gateway information', async () => {
      const response = await request(app).get('/api/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'API Gateway - Arreglos Victoria',
        version: '1.0.0',
      });
    });

    it('should have correct content-type', async () => {
      const response = await request(app).get('/api/');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Auth Routes Proxy', () => {
    beforeEach(() => {
      ServiceProxy.routeToService.mockImplementation((serviceUrl, req, res) => {
        res.status(200).json({ success: true, url: req.url });
      });
    });

    it('should proxy /api/auth/login to auth service', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(ServiceProxy.routeToService).toHaveBeenCalledWith(
        'http://auth-service:3001',
        expect.objectContaining({
          url: '/api/auth/login',
        }),
        expect.any(Object)
      );
    });

    it('should proxy /api/auth/register to auth service', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: 'password123' });

      expect(ServiceProxy.routeToService).toHaveBeenCalledWith(
        'http://auth-service:3001',
        expect.objectContaining({
          url: '/api/auth/register',
        }),
        expect.any(Object)
      );
    });

    it('should transform auth route URLs correctly', async () => {
      const response = await request(app).post('/api/auth/login');

      expect(response.body.url).toBe('/api/auth/login');
    });
  });

  describe('Products Routes Proxy', () => {
    beforeEach(() => {
      ServiceProxy.routeToService.mockImplementation((serviceUrl, req, res) => {
        res.status(200).json({ success: true, url: req.url });
      });
    });

    it('should proxy /api/products to product service', async () => {
      await request(app).get('/api/products');

      expect(ServiceProxy.routeToService).toHaveBeenCalledWith(
        'http://product-service:3009',
        expect.objectContaining({
          url: '/products/',
        }),
        expect.any(Object)
      );
    });

    it('should proxy /api/products/:id to product service', async () => {
      await request(app).get('/api/products/123');

      expect(ServiceProxy.routeToService).toHaveBeenCalledWith(
        'http://product-service:3009',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should proxy POST /api/products to product service', async () => {
      await request(app).post('/api/products').send({ name: 'Test Product', price: 100 });

      expect(ServiceProxy.routeToService).toHaveBeenCalledWith(
        'http://product-service:3009',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should transform products route URLs correctly', async () => {
      const response = await request(app).get('/api/products/featured');

      expect(response.body.url).toBe('/products/featured');
    });
  });

  describe('Users Profile Route', () => {
    beforeEach(() => {
      ServiceProxy.routeToService.mockImplementation((serviceUrl, req, res) => {
        res.status(200).json({ success: true, url: req.url });
      });
    });

    it('should proxy /api/users/profile to auth service', async () => {
      await request(app).get('/api/users/profile');

      expect(ServiceProxy.routeToService).toHaveBeenCalledWith(
        'http://auth-service:3001',
        expect.objectContaining({
          url: '/api/auth/profile',
        }),
        expect.any(Object)
      );
    });

    it('should transform profile route URL correctly', async () => {
      const response = await request(app).get('/api/users/profile');

      expect(response.body.url).toBe('/api/auth/profile');
    });
  });

  describe('Error Handling', () => {
    it('should handle proxy errors gracefully', async () => {
      ServiceProxy.routeToService.mockImplementation((serviceUrl, req, res) => {
        res.status(500).json({
          status: 'error',
          message: 'Service unavailable',
        });
      });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Service unavailable',
      });
    });

    it('should handle 404 from services', async () => {
      ServiceProxy.routeToService.mockImplementation((serviceUrl, req, res) => {
        res.status(404).json({
          status: 'fail',
          message: 'Resource not found',
        });
      });

      const response = await request(app).get('/api/products/nonexistent');

      expect(response.status).toBe(404);
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      ServiceProxy.routeToService.mockImplementation((serviceUrl, req, res) => {
        res.status(200).json({ method: req.method });
      });
    });

    it('should handle GET requests', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.method).toBe('GET');
    });

    it('should handle POST requests', async () => {
      const response = await request(app).post('/api/products').send({ data: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.method).toBe('POST');
    });

    it('should handle PUT requests', async () => {
      const response = await request(app).put('/api/products/123').send({ data: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.method).toBe('PUT');
    });

    it('should handle DELETE requests', async () => {
      const response = await request(app).delete('/api/products/123');

      expect(response.status).toBe(200);
      expect(response.body.method).toBe('DELETE');
    });

    it('should handle PATCH requests', async () => {
      const response = await request(app).patch('/api/products/123').send({ data: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.method).toBe('PATCH');
    });
  });

  describe('Request Body Handling', () => {
    beforeEach(() => {
      ServiceProxy.routeToService.mockImplementation((serviceUrl, req, res) => {
        res.status(200).json({ receivedBody: req.body });
      });
    });

    it('should pass JSON body to service', async () => {
      const testData = { name: 'Test', value: 123 };

      const response = await request(app).post('/api/products').send(testData);

      expect(response.body.receivedBody).toEqual(testData);
    });

    it('should handle empty body', async () => {
      const response = await request(app).post('/api/auth/login');

      expect(response.body.receivedBody).toEqual({});
    });
  });
});
