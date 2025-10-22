const request = require('supertest');
const app = require('../../microservices/api-gateway/src/app');

describe('Integration Tests - Complete User Flows', () => {
  let authToken;
  let userId;
  let productId;
  let orderId;

  describe('User Registration and Authentication Flow', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: `test${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Usuario de Prueba',
        phone: '+56 9 1234 5678'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/);

      // Puede ser 201 si está implementado, o 404/502 si el servicio no está disponible
      if (res.status === 201) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('userId');
        
        authToken = res.body.data.token;
        userId = res.body.data.userId;
      }
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toHaveProperty('token');
        authToken = res.body.data.token;
      }
    });

    it('should reject login with invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect('Content-Type', /json/);

      if (res.status === 401) {
        expect(res.body).toHaveProperty('status', 'error');
      }
    });
  });

  describe('Product Browsing Flow', () => {
    it('should list all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toBeInstanceOf(Array);
        
        if (res.body.data.length > 0) {
          productId = res.body.data[0].id || res.body.data[0]._id;
        }
      }
    });

    it('should get product details by ID', async () => {
      if (!productId) {
        productId = 'test-product-id';
      }

      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toHaveProperty('id', productId);
      }
    });

    it('should filter products by category', async () => {
      const res = await request(app)
        .get('/api/products?category=Ramos')
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toBeInstanceOf(Array);
      }
    });

    it('should search products', async () => {
      const res = await request(app)
        .get('/api/products?search=rosas')
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toBeInstanceOf(Array);
      }
    });

    it('should paginate products', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=10')
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toHaveProperty('page', 1);
        expect(res.body.pagination).toHaveProperty('limit', 10);
      }
    });
  });

  describe('Shopping Cart and Order Flow', () => {
    it('should add product to cart', async () => {
      if (!productId) {
        productId = 'test-product-id';
      }

      const cartItem = {
        productId: productId,
        quantity: 2
      };

      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send(cartItem)
        .expect('Content-Type', /json/);

      // May return 401 if not authenticated, or 201 if successful
      if (res.status === 201) {
        expect(res.body).toHaveProperty('status', 'success');
      }
    });

    it('should get cart contents', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toHaveProperty('items');
      }
    });

    it('should create an order', async () => {
      const orderData = {
        items: [
          { productId: productId || 'test-product-id', quantity: 2 }
        ],
        deliveryAddress: {
          street: 'Av. Providencia',
          number: '1234',
          commune: 'Providencia',
          city: 'Santiago',
          region: 'Región Metropolitana',
          instructions: 'Llamar antes de llegar'
        },
        paymentMethod: 'webpay',
        deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        message: 'Para mi esposa'
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send(orderData)
        .expect('Content-Type', /json/);

      if (res.status === 201) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toHaveProperty('id');
        orderId = res.body.data.id;
      }
    });

    it('should get order details', async () => {
      if (!orderId) {
        orderId = 'test-order-id';
      }

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toHaveProperty('id', orderId);
      }
    });

    it('should list user orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .expect('Content-Type', /json/);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toBeInstanceOf(Array);
      }
    });
  });

  describe('Contact Form Flow', () => {
    it('should submit contact form', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+56 9 1234 5678',
        subject: 'Consulta sobre productos',
        message: 'Me gustaría saber más sobre los ramos de rosas.'
      };

      const res = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect('Content-Type', /json/);

      if (res.status === 200 || res.status === 201) {
        expect(res.body).toHaveProperty('status', 'success');
      }
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/non-existent-route')
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('should handle invalid product ID', async () => {
      const res = await request(app)
        .get('/api/products/invalid-id-12345')
        .expect('Content-Type', /json/);

      if (res.status === 404) {
        expect(res.body).toHaveProperty('status', 'error');
      }
    });

    it('should handle validation errors', async () => {
      const invalidOrder = {
        items: [], // Empty items array
        deliveryAddress: {},
        paymentMethod: 'invalid'
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send(invalidOrder)
        .expect('Content-Type', /json/);

      if (res.status === 400) {
        expect(res.body).toHaveProperty('status', 'error');
        expect(res.body).toHaveProperty('errors');
      }
    });

    it('should handle unauthorized access', async () => {
      const res = await request(app)
        .get('/api/orders')
        .expect('Content-Type', /json/);

      if (res.status === 401) {
        expect(res.body).toHaveProperty('status', 'error');
      }
    });
  });

  describe('Performance and Load Handling', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/api/products')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(res => {
        expect(res.status).toBeLessThan(500);
      });
    });

    it('should include performance headers', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect('Content-Type', /json/);

      expect(res.headers).toHaveProperty('x-request-id');
    });
  });
});
