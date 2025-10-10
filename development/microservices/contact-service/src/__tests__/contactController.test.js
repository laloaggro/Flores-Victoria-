const ContactController = require('../controllers/contactController');

// Mock del cliente de base de datos
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  insertOne: jest.fn()
};

// Mock de nodemailer
const mockMailer = {
  sendMail: jest.fn()
};

// Mock de la solicitud y respuesta Express
const mockRequest = (body = {}) => ({
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('ContactController', () => {
  let contactController;

  beforeEach(() => {
    contactController = new ContactController(mockDb, mockMailer);
    jest.clearAllMocks();
  });

  describe('submitContactForm', () => {
    it('debería procesar el formulario de contacto correctamente', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta sobre productos',
        message: 'Me gustaría saber más sobre sus productos'
      };

      mockDb.insertOne.mockResolvedValue({ insertedId: '1' });
      mockMailer.sendMail.mockResolvedValue({ messageId: 'mock-message-id' });

      const req = mockRequest(contactData);
      const res = mockResponse();

      await contactController.submitContactForm(req, res);

      expect(mockDb.insertOne).toHaveBeenCalled();
      expect(mockMailer.sendMail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
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

      const req = mockRequest(incompleteData);
      const res = mockResponse();

      await contactController.submitContactForm(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
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

      mockDb.insertOne.mockRejectedValue(new Error('Error de base de datos'));

      const req = mockRequest(contactData);
      const res = mockResponse();

      await contactController.submitContactForm(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
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

      mockDb.insertOne.mockResolvedValue({ insertedId: '1' });
      mockMailer.sendMail.mockRejectedValue(new Error('Error de envío de email'));

      const req = mockRequest(contactData);
      const res = mockResponse();

      await contactController.submitContactForm(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });
});