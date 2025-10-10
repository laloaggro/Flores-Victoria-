const request = require('supertest');
const express = require('express');
const ContactController = require('../../controllers/contactController');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Mock de la base de datos y nodemailer para pruebas de integración
let mockDb;
let mockMailer;

// Inicializar el controlador con mocks
let contactController;

// Middleware para inyectar los mocks
app.use((req, res, next) => {
  req.db = mockDb;
  req.mailer = mockMailer;
  next();
});

// Inicializar controlador con mocks
app.use((req, res, next) => {
  contactController = new ContactController(req.db, req.mailer);
  next();
});

// Ruta para pruebas
app.post('/api/contact', (req, res) => {
  contactController.submitContactForm(req, res);
});

describe('Contact Service Integration Tests', () => {
  beforeEach(() => {
    // Crear mocks para cada prueba
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      insertOne: jest.fn()
    };
    
    mockMailer = {
      sendMail: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/contact', () => {
    it('debería procesar el formulario de contacto correctamente', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta sobre productos',
        message: 'Me gustaría saber más sobre sus productos'
      };

      mockDb.insertOne.mockResolvedValueOnce({ insertedId: '1' });
      mockMailer.sendMail.mockResolvedValueOnce({ messageId: 'mock-message-id' });

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Mensaje enviado exitosamente'
      });
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

      expect(response.body).toEqual({
        status: 'error',
        message: 'Nombre, email, asunto y mensaje son requeridos'
      });
    });

    it('debería manejar errores al guardar en la base de datos', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta sobre productos',
        message: 'Me gustaría saber más sobre sus productos'
      };

      mockDb.insertOne.mockRejectedValueOnce(new Error('Error de base de datos'));

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });

    it('debería manejar errores al enviar el email', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta sobre productos',
        message: 'Me gustaría saber más sobre sus productos'
      };

      mockDb.insertOne.mockResolvedValueOnce({ insertedId: '1' });
      mockMailer.sendMail.mockRejectedValueOnce(new Error('Error de envío de email'));

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });
});