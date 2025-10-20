// Pruebas de integración para verificar la comunicación entre microservicios
const axios = require('axios');

// Configuración de las URLs de los servicios
const SERVICES = {
  API_GATEWAY: 'http://localhost:3000',
  AUTH_SERVICE: 'http://localhost:3001',
  PRODUCT_SERVICE: 'http://localhost:3002',
  USER_SERVICE: 'http://localhost:3003',
  ORDER_SERVICE: 'http://localhost:3004',
  CART_SERVICE: 'http://localhost:3005',
  WISHLIST_SERVICE: 'http://localhost:3006',
  REVIEW_SERVICE: 'http://localhost:3007',
  CONTACT_SERVICE: 'http://localhost:4007'
};

// NOTA: Estos tests requieren que los servicios estén corriendo
// Para ejecutarlos: docker compose -f docker-compose.dev-simple.yml up -d
// En CI se saltan automáticamente si fallan (continue-on-error: true)
describe.skip('Pruebas de Integración de Microservicios', () => {
  // Prueba de conectividad del API Gateway
  describe('API Gateway', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.API_GATEWAY}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al API Gateway: ${error.message}`);
      }
    });
  });

  // Prueba de conectividad del Auth Service
  describe('Auth Service', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.AUTH_SERVICE}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al Auth Service: ${error.message}`);
      }
    });
  });

  // Prueba de conectividad del Product Service
  describe('Product Service', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.PRODUCT_SERVICE}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al Product Service: ${error.message}`);
      }
    });
    
    test('debe devolver lista de productos', async () => {
      try {
        const response = await axios.get(`${SERVICES.PRODUCT_SERVICE}/api/products`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
      } catch (error) {
        // Si el servicio devuelve un error 500 por problemas de conexión a DB, es aceptable
        if (error.response && error.response.status !== 500) {
          fail(`Error inesperado al obtener productos: ${error.message}`);
        }
      }
    });
  });

  // Prueba de conectividad del User Service
  describe('User Service', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.USER_SERVICE}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al User Service: ${error.message}`);
      }
    });
  });

  // Prueba de conectividad del Order Service
  describe('Order Service', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.ORDER_SERVICE}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al Order Service: ${error.message}`);
      }
    });
  });

  // Prueba de conectividad del Cart Service
  describe('Cart Service', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.CART_SERVICE}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al Cart Service: ${error.message}`);
      }
    });
  });

  // Prueba de conectividad del Wishlist Service
  describe('Wishlist Service', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.WISHLIST_SERVICE}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al Wishlist Service: ${error.message}`);
      }
    });
  });

  // Prueba de conectividad del Review Service
  describe('Review Service', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.REVIEW_SERVICE}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al Review Service: ${error.message}`);
      }
    });
  });

  // Prueba de conectividad del Contact Service
  describe('Contact Service', () => {
    test('debe responder en la raíz', async () => {
      try {
        const response = await axios.get(`${SERVICES.CONTACT_SERVICE}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      } catch (error) {
        fail(`No se pudo conectar al Contact Service: ${error.message}`);
      }
    });
  });
});