const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const nodemailer = require('nodemailer');

// Importar la aplicación real
const app = require('../../app');

// Configurar MongoDB en memoria para pruebas E2E
let mongoServer;

// Mock de nodemailer
let mockMailer;

beforeAll(async () => {
  // Crear un servidor MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Conectar a la base de datos en memoria
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Crear mock de nodemailer
  mockMailer = {
    sendMail: jest.fn()
  };
  
  // Inyectar el mock de nodemailer en la aplicación
  app.locals.mailer = mockMailer;
});

afterAll(async () => {
  // Desconectar y detener el servidor MongoDB en memoria
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Contact Service E2E Tests', () => {
  beforeEach(async () => {
    // Limpiar la base de datos antes de cada prueba
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    // Resetear el mock de nodemailer
    mockMailer.sendMail.mockReset();
  });

  describe('POST /api/contact', () => {
    it('debería procesar el formulario de contacto correctamente', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta sobre productos',
        message: 'Me gustaría saber más sobre sus productos'
      };

      // Configurar el mock de nodemailer para que resuelva correctamente
      mockMailer.sendMail.mockResolvedValue({ messageId: 'mock-message-id' });

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Mensaje enviado exitosamente');
      
      // Verificar que se haya llamado a sendMail
      expect(mockMailer.sendMail).toHaveBeenCalled();
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteData = {
        name: 'Juan Pérez',
        email: 'juan@example.com'
        // Falta subject y message
      };

      const response = await request(app)
        .post('/api/contact')
        .send(incompleteData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Nombre, email, asunto y mensaje son requeridos');
    });

    it('debería manejar errores al guardar en la base de datos', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta sobre productos',
        message: 'Me gustaría saber más sobre sus productos'
      };

      // Simular un error en la base de datos desconectando mongoose
      await mongoose.connection.close();

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Error interno del servidor');
    });

    it('debería manejar errores al enviar el email', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta sobre productos',
        message: 'Me gustaría saber más sobre sus productos'
      };

      // Configurar el mock de nodemailer para que rechace con un error
      mockMailer.sendMail.mockRejectedValue(new Error('Error de envío de email'));

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Error interno del servidor');
    });
  });
});