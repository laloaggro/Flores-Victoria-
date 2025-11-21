const ContactController = require('../../controllers/contactController');

// Mock dependencies
jest.mock('../../config/database', () => ({
  getDb: jest.fn(() => ({
    collection: jest.fn(),
  })),
}));

jest.mock('../../models/Contact');

describe('ContactController', () => {
  let contactController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    contactController = new ContactController();

    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the contact model
    contactController.contactModel = {
      sendContactMessage: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      verifyTransporter: jest.fn(),
    };
  });

  describe('createContact', () => {
    it('should create contact with valid data', async () => {
      mockReq.body = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta',
        message: 'Hola, tengo una pregunta',
      };

      contactController.contactModel.sendContactMessage.mockResolvedValue({
        success: true,
        id: '123',
      });

      await contactController.createContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Mensaje de contacto creado exitosamente',
        data: { success: true, id: '123' },
      });
    });

    it('should reject missing required fields', async () => {
      mockReq.body = {
        name: 'Juan Pérez',
        // Falta email, subject, message
      };

      await contactController.createContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Todos los campos son requeridos',
      });
    });

    it('should reject invalid email format', async () => {
      mockReq.body = {
        name: 'Juan Pérez',
        email: 'invalid-email',
        subject: 'Consulta',
        message: 'Mensaje',
      };

      await contactController.createContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Formato de email inválido',
      });
    });

    it('should handle sendContactMessage errors', async () => {
      mockReq.body = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta',
        message: 'Mensaje',
      };

      contactController.contactModel.sendContactMessage.mockResolvedValue({
        success: false,
        error: 'Email service error',
      });

      await contactController.createContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllContacts', () => {
    it('should return all contacts', async () => {
      const mockContacts = [
        { id: '1', name: 'Juan', email: 'juan@example.com' },
        { id: '2', name: 'María', email: 'maria@example.com' },
      ];

      contactController.contactModel.findAll.mockResolvedValue(mockContacts);

      await contactController.getAllContacts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Mensajes de contacto obtenidos exitosamente',
        data: mockContacts,
      });
    });

    it('should handle errors when getting contacts', async () => {
      contactController.contactModel.findAll.mockRejectedValue(new Error('Database error'));

      await contactController.getAllContacts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });

  describe('getContactById', () => {
    it('should return contact by id', async () => {
      mockReq.params = { id: '123' };
      const mockContact = { id: '123', name: 'Juan', email: 'juan@example.com' };

      contactController.contactModel.findById.mockResolvedValue(mockContact);

      await contactController.getContactById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: expect.any(String),
        data: mockContact,
      });
    });
  });

  describe('updateContact', () => {
    it('should update contact status', async () => {
      mockReq.params = { id: '123' };
      mockReq.body = { status: 'resolved' };

      contactController.contactModel.update.mockResolvedValue({
        id: '123',
        status: 'resolved',
      });

      await contactController.updateContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteContact', () => {
    it('should delete contact', async () => {
      mockReq.params = { id: '123' };

      contactController.contactModel.delete.mockResolvedValue({ deletedCount: 1 });

      await contactController.deleteContact(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
