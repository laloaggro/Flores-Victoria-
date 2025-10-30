const ContactController = require('../../controllers/contactController');
const { getDb } = require('../../config/database');
const Contact = require('../../models/Contact');

// Mock dependencies
jest.mock('../../config/database');
jest.mock('../../models/Contact');

describe('ContactController - Unit Tests', () => {
  let contactController;
  let mockContactModel;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock Contact model
    mockContactModel = {
      sendContactMessage: jest.fn(),
      verifyTransporter: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    Contact.mockImplementation(() => mockContactModel);
    getDb.mockReturnValue({ collection: jest.fn() });

    // Create controller instance
    contactController = new ContactController();
    contactController.contactModel = mockContactModel; // Set directly to avoid setTimeout

    // Mock request and response
    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta',
        message: 'Quiero información',
      };

      mockReq.body = contactData;
      mockContactModel.sendContactMessage.mockResolvedValue({
        success: true,
        id: 'contact-123',
        messageId: 'msg-456',
      });

      await contactController.createContact(mockReq, mockRes);

      expect(mockContactModel.sendContactMessage).toHaveBeenCalledWith(contactData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Mensaje de contacto creado exitosamente',
        data: expect.objectContaining({ success: true, id: 'contact-123' }),
      });
    });

    it('should return 400 when name is missing', async () => {
      mockReq.body = {
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message',
      };

      await contactController.createContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Todos los campos son requeridos',
      });
    });

    it('should return 400 when email format is invalid', async () => {
      mockReq.body = {
        name: 'Test',
        email: 'invalid-email',
        subject: 'Test',
        message: 'Test message',
      };

      await contactController.createContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Formato de email inválido',
      });
    });

    it('should handle database errors', async () => {
      mockReq.body = {
        name: 'Test',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message',
      };

      mockContactModel.sendContactMessage.mockRejectedValue(new Error('DB error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await contactController.createContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getAllContacts', () => {
    it('should get all contacts successfully', async () => {
      const mockContacts = [
        { id: '1', name: 'Contact 1', email: 'c1@example.com' },
        { id: '2', name: 'Contact 2', email: 'c2@example.com' },
      ];

      mockContactModel.findAll.mockResolvedValue(mockContacts);

      await contactController.getAllContacts(mockReq, mockRes);

      expect(mockContactModel.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Mensajes de contacto obtenidos exitosamente',
        data: mockContacts,
      });
    });

    it('should handle database errors', async () => {
      mockContactModel.findAll.mockRejectedValue(new Error('DB error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await contactController.getAllContacts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getContactById', () => {
    it('should get contact by ID successfully', async () => {
      const mockContact = {
        id: '123',
        name: 'Test Contact',
        email: 'test@example.com',
      };

      mockReq.params.id = '123';
      mockContactModel.findById.mockResolvedValue(mockContact);

      await contactController.getContactById(mockReq, mockRes);

      expect(mockContactModel.findById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Mensaje de contacto obtenido exitosamente',
        data: mockContact,
      });
    });

    it('should return 404 when contact not found', async () => {
      mockReq.params.id = 'non-existent';
      mockContactModel.findById.mockResolvedValue(null);

      await contactController.getContactById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Mensaje de contacto no encontrado',
      });
    });

    it('should return 400 when ID is missing', async () => {
      mockReq.params = {};

      await contactController.getContactById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID es requerido',
      });
    });
  });
});
