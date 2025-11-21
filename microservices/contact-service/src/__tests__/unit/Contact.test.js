const Contact = require('../../models/Contact');

// Mock del logger
jest.mock('../../logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

const logger = require('../../logger');

// Mock nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

// Mock mongodb ObjectId
jest.mock('mongodb', () => {
  const actualMongodb = jest.requireActual('mongodb');
  return {
    ...actualMongodb,
    ObjectId: jest.fn((id) => ({ _id: id })),
  };
});

const { ObjectId } = require('mongodb');

describe('Contact Model - Unit Tests', () => {
  let mockDb;
  let mockCollection;
  let mockTransporter;
  let contact;

  beforeEach(() => {
    // Reset environment variables
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'test_password';
    process.env.EMAIL_HOST = 'smtp.gmail.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_SECURE = 'false';

    // Mock collection
    mockCollection = {
      insertOne: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    // Mock database
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    // Mock transporter
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'test-message-id-123',
      }),
    };

    // Mock nodemailer.createTransport
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    // Create instance
    contact = new Contact(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
  });

  describe('Constructor', () => {
    it('should initialize with email configuration', () => {
      expect(mockDb.collection).toHaveBeenCalledWith('contacts');
      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(contact.transporter).toBe(mockTransporter);
    });

    it('should set transporter to null when EMAIL_USER is missing', () => {
      delete process.env.EMAIL_USER;
      logger.warn.mockClear();

      const contactWithoutEmail = new Contact(mockDb);

      expect(contactWithoutEmail.transporter).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ service: 'contact-service' }),
        expect.stringContaining('Credenciales de correo electrónico no configuradas')
      );
    });

    it('should set transporter to null when EMAIL_PASS is missing', () => {
      delete process.env.EMAIL_PASS;
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const contactWithoutEmail = new Contact(mockDb);

      expect(contactWithoutEmail.transporter).toBeNull();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('sendContactMessage', () => {
    it('should save contact message and send email successfully', async () => {
      const contactData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        subject: 'Consulta sobre flores',
        message: 'Quiero hacer un pedido de rosas',
      };

      const mockInsertResult = {
        insertedId: 'test-id-123',
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await contact.sendContactMessage(contactData);

      // Verificar que se guardó en la base de datos
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        createdAt: expect.any(Date),
      });

      // Verificar que se verificó el transporter
      expect(mockTransporter.verify).toHaveBeenCalled();

      // Verificar que se envió el correo
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'contacto@arreglosvictoria.cl',
          replyTo: contactData.email,
          subject: expect.stringContaining(contactData.subject),
        })
      );

      // Verificar que se actualizó con el messageId
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockInsertResult.insertedId },
        { $set: { messageId: 'test-message-id-123' } }
      );

      // Verificar el resultado
      expect(result).toEqual({
        success: true,
        id: 'test-id-123',
        messageId: 'test-message-id-123',
      });
    });

    it('should save contact even when email sending fails', async () => {
      const contactData = {
        name: 'María García',
        email: 'maria@example.com',
        subject: 'Problema con pedido',
        message: 'Mi pedido no llegó',
      };

      const mockInsertResult = {
        insertedId: 'test-id-456',
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await contact.sendContactMessage(contactData);

      // Verificar que se guardó en la base de datos
      expect(mockCollection.insertOne).toHaveBeenCalled();

      // Verificar que se intentó enviar el correo
      expect(mockTransporter.sendMail).toHaveBeenCalled();

      // Verificar el resultado con warning
      expect(result).toEqual({
        success: true,
        id: 'test-id-456',
        messageId: null,
        warning: expect.stringContaining('no se pudo enviar el correo'),
      });

      consoleErrorSpy.mockRestore();
    });

    it('should save contact when transporter is not configured', async () => {
      // Create contact without email configuration
      delete process.env.EMAIL_USER;
      const contactWithoutEmail = new Contact(mockDb);

      const contactData = {
        name: 'Pedro López',
        email: 'pedro@example.com',
        subject: 'Consulta',
        message: 'Test message',
      };

      const mockInsertResult = {
        insertedId: 'test-id-789',
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await contactWithoutEmail.sendContactMessage(contactData);

      // Verificar que se guardó en la base de datos
      expect(mockCollection.insertOne).toHaveBeenCalled();

      // Verificar que NO se intentó enviar el correo
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();

      // Verificar el resultado con warning
      expect(result).toEqual({
        success: true,
        id: 'test-id-789',
        messageId: null,
        warning: 'Mensaje guardado pero el servicio de correo no está configurado',
      });
    });

    it('should include HTML and text versions in email', async () => {
      const contactData = {
        name: 'Ana Martínez',
        email: 'ana@example.com',
        subject: 'Agradecimiento',
        message: 'Excelente servicio',
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'test-id' });
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await contact.sendContactMessage(contactData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Ana Martínez'),
          html: expect.stringContaining('<h2>Nuevo mensaje de contacto</h2>'),
        })
      );
    });
  });

  describe('verifyTransporter', () => {
    it('should verify transporter successfully', async () => {
      logger.info.mockClear();

      const result = await contact.verifyTransporter();

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ service: 'contact-service' }),
        'Servidor de correo verificado correctamente'
      );
    });

    it('should handle transporter verification errors', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));
      logger.error.mockClear();

      const result = await contact.verifyTransporter();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all contacts sorted by createdAt DESC', async () => {
      const mockContacts = [
        {
          _id: '2',
          name: 'Contact 2',
          email: 'contact2@example.com',
          createdAt: new Date('2024-01-02'),
        },
        {
          _id: '1',
          name: 'Contact 1',
          email: 'contact1@example.com',
          createdAt: new Date('2024-01-01'),
        },
      ];

      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockContacts),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await contact.findAll();

      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCursor.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockContacts);
    });

    it('should return empty array when no contacts exist', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await contact.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find contact by ID', async () => {
      const mockContact = {
        _id: 'test-id-123',
        name: 'Test Contact',
        email: 'test@example.com',
      };

      mockCollection.findOne.mockResolvedValue(mockContact);

      const result = await contact.findById('test-id-123');

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
      expect(result).toEqual(mockContact);
    });

    it('should return null when contact not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await contact.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockCollection.findOne.mockRejectedValue(new Error('Database error'));
      logger.error.mockClear();

      const result = await contact.findById('test-id');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update contact successfully', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const updateData = { status: 'read' };
      const result = await contact.update('test-id-123', updateData);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { $set: updateData }
      );
      expect(result).toBe(true);
    });

    it('should return false when no contact was modified', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await contact.update('non-existent-id', { status: 'read' });

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      mockCollection.updateOne.mockRejectedValue(new Error('Database error'));
      logger.error.mockClear();

      const result = await contact.update('test-id', { status: 'read' });

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete contact successfully', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await contact.delete('test-id-123');

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
      expect(result).toBe(true);
    });

    it('should return false when no contact was deleted', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await contact.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      mockCollection.deleteOne.mockRejectedValue(new Error('Database error'));
      logger.error.mockClear();

      const result = await contact.delete('test-id');

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in contact data', async () => {
      const contactData = {
        name: 'José María Ñuñez',
        email: 'jose.maria@ñandú.cl',
        subject: 'Consulta sobre "flores especiales"',
        message: 'Necesito flores para el día de la madre <3',
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'test-id' });
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await contact.sendContactMessage(contactData);

      expect(result.success).toBe(true);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          name: contactData.name,
          email: contactData.email,
        })
      );
    });

    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(10000);
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Long message',
        message: longMessage,
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'test-id' });
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await contact.sendContactMessage(contactData);

      expect(result.success).toBe(true);
    });

    it('should handle multiple email domains', async () => {
      const emails = [
        'test@gmail.com',
        'user@outlook.com',
        'contact@empresa.cl',
        'admin@subdomain.domain.co.uk',
      ];

      for (const email of emails) {
        mockCollection.insertOne.mockResolvedValue({ insertedId: 'test-id' });
        mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

        const result = await contact.sendContactMessage({
          name: 'Test',
          email,
          subject: 'Test',
          message: 'Test',
        });

        expect(result.success).toBe(true);
      }
    });
  });
});
