const nodemailer = require('nodemailer');
const Contact = require('../../microservices/contact-service/src/models/Contact');

// Mock de MongoDB
const mockCollection = {
  insertOne: jest.fn()
};

// Mock de Nodemailer
jest.mock('nodemailer');

describe('Contact Service - Unit Tests', () => {
  let contactModel;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    // Mock para nodemailer.createTransport
    nodemailer.createTransport.mockReturnValue({
      verify: jest.fn().mockResolvedValue(),
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    });
    
    contactModel = new Contact(mockDb);
    jest.clearAllMocks();
  });

  describe('Contact Model', () => {
    describe('sendContactMessage', () => {
      test('should save contact message to database and send email', async () => {
        const contactData = {
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'Test message content'
        };

        const mockInsertResult = {
          insertedId: 'test-id'
        };

        mockCollection.insertOne.mockResolvedValue(mockInsertResult);

        const result = await contactModel.sendContactMessage(contactData);

        expect(mockDb.collection).toHaveBeenCalledWith('contacts');
        expect(mockCollection.insertOne).toHaveBeenCalledWith({
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          message: contactData.message,
          createdAt: expect.any(Date)
        });
        
        expect(result).toEqual({
          success: true,
          id: mockInsertResult.insertedId,
          message: 'Mensaje de contacto guardado exitosamente'
        });
      });

      test('should save contact message even when email transport is not configured', async () => {
        // Crear una instancia sin transporte de correo
        const contactModelWithoutEmail = new Contact(mockDb);
        contactModelWithoutEmail.transporter = null;
        
        const contactData = {
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'Test message content'
        };

        const mockInsertResult = {
          insertedId: 'test-id'
        };

        mockCollection.insertOne.mockResolvedValue(mockInsertResult);

        const result = await contactModelWithoutEmail.sendContactMessage(contactData);

        expect(mockDb.collection).toHaveBeenCalledWith('contacts');
        expect(mockCollection.insertOne).toHaveBeenCalledWith({
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          message: contactData.message,
          createdAt: expect.any(Date)
        });
        
        expect(result).toEqual({
          success: true,
          id: mockInsertResult.insertedId,
          message: 'Mensaje de contacto guardado exitosamente'
        });
      });

      test('should handle database error', async () => {
        const contactData = {
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'Test message content'
        };

        const error = new Error('Database error');
        mockCollection.insertOne.mockRejectedValue(error);

        await expect(contactModel.sendContactMessage(contactData))
          .rejects.toThrow('Error al guardar mensaje de contacto');
      });
    });

    describe('getAllContacts', () => {
      test('should retrieve all contacts from database', async () => {
        const mockContacts = [
          {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Test Subject',
            message: 'Test message',
            createdAt: new Date()
          }
        ];

        const mockCollectionFind = {
          sort: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockContacts)
        };

        mockDb.collection.mockReturnValue({
          find: jest.fn().mockReturnValue(mockCollectionFind)
        });

        const result = await contactModel.getAllContacts();

        expect(result).toEqual(mockContacts);
      });
    });

    describe('getContactById', () => {
      test('should retrieve contact by ID', async () => {
        const contactId = 'test-id';
        const mockContact = {
          _id: contactId,
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'Test message',
          createdAt: new Date()
        };

        mockDb.collection.mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockContact)
        });

        const result = await contactModel.getContactById(contactId);

        expect(result).toEqual(mockContact);
      });
    });
  });
});