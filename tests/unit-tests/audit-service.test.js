const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock de axios
jest.mock('axios');

// Importar la aplicación
let app;
let mongoServer;

describe('Audit Service', () => {
  beforeAll(async () => {
    // Configurar MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Configurar las variables de entorno
    process.env.MONGO_URI = mongoUri;
    
    // Importar la aplicación después de configurar las variables de entorno
    app = require('../../microservices/audit-service/src/app');
  });

  afterAll(async () => {
    // Limpiar las conexiones
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    // Limpiar los mocks
    jest.clearAllMocks();
  });

  test('debería registrar un evento de auditoría', async () => {
    // Mock de la respuesta de axios
    axios.post.mockResolvedValue({ data: { message: 'Evento de auditoría registrado correctamente' } });

    // Datos de prueba
    const auditEvent = {
      service: 'product-service',
      action: 'CREATE_PRODUCT',
      userId: 'user123',
      resourceId: 'product456',
      resourceType: 'Product',
      details: {
        productName: 'Ramo de Rosas'
      }
    };

    // Enviar solicitud al servicio de auditoría
    const response = await axios.post('http://localhost:3005/audit', auditEvent);

    // Verificar la respuesta
    expect(response.status).toBe(201);
    expect(response.data.message).toBe('Evento de auditoría registrado correctamente');
    expect(axios.post).toHaveBeenCalledWith('http://localhost:3005/audit', auditEvent);
  });

  test('debería obtener eventos de auditoría', async () => {
    // Mock de la respuesta de axios
    const auditEvents = [
      {
        service: 'product-service',
        action: 'CREATE_PRODUCT',
        userId: 'user123',
        resourceId: 'product456',
        resourceType: 'Product',
        details: {
          productName: 'Ramo de Rosas'
        }
      }
    ];

    axios.get.mockResolvedValue({ data: auditEvents });

    // Enviar solicitud para obtener eventos
    const response = await axios.get('http://localhost:3005/audit');

    // Verificar la respuesta
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3005/audit');
  });
});