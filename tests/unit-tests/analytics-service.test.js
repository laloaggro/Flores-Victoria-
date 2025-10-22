const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock de axios
jest.mock('axios');

// Importar la aplicación
const request = require('supertest');

let _app;

let mongoServer;

describe('Analytics Service', () => {
  beforeAll(async () => {
    // Configurar MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Configurar las variables de entorno
    process.env.MONGO_URI = mongoUri;

    // Importar la aplicación después de configurar las variables de entorno
    app = require('../../microservices/analytics-service/src/app');
  });

  afterAll(async () => {
    // Limpiar las conexiones
    // await mongoose.disconnect();
    // await mongoServer.stop();
  });

  beforeEach(() => {
    // Limpiar los mocks
    jest.clearAllMocks();
  });

  test('debería registrar un evento de análisis', async () => {
    // Mock de la respuesta de axios
    axios.post.mockResolvedValue({ data: { message: 'Evento registrado correctamente' } });

    // Datos de prueba
    const event = {
      eventType: 'PRODUCT_VIEW',
      userId: 'user123',
      productId: 'product456',
      sessionId: 'session789',
    };

    // Enviar solicitud al servicio de análisis
    const response = await axios.post('http://localhost:3008/events', event);

    // Verificar la respuesta
    expect(response.status).toBe(201);
    expect(response.data.message).toBe('Evento registrado correctamente');
    expect(axios.post).toHaveBeenCalledWith('http://localhost:3008/events', event);
  });

  test('debería obtener estadísticas básicas', async () => {
    // Mock de la respuesta de axios
    const stats = {
      totalEvents: 100,
      eventsByType: [
        { _id: 'PRODUCT_VIEW', count: 80 },
        { _id: 'ADD_TO_CART', count: 20 },
      ],
      uniqueUsers: 50,
    };

    axios.get.mockResolvedValue({ data: stats });

    // Enviar solicitud para obtener estadísticas
    const response = await axios.get('http://localhost:3008/stats');

    // Verificar la respuesta
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('totalEvents');
    expect(response.data).toHaveProperty('eventsByType');
    expect(response.data).toHaveProperty('uniqueUsers');
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3008/stats');
  });

  test('debería obtener productos populares', async () => {
    // Mock de la respuesta de axios
    const popularProducts = [
      { _id: 'product1', views: 100 },
      { _id: 'product2', views: 80 },
      { _id: 'product3', views: 60 },
    ];

    axios.get.mockResolvedValue({ data: popularProducts });

    // Enviar solicitud para obtener productos populares
    const response = await axios.get('http://localhost:3008/popular-products');

    // Verificar la respuesta
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3008/popular-products');
  });
});
