const {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} = require('../../controllers/Contact');

jest.mock('../../models/Contact');
const Contact = require('../../models/Contact');

describe('Contact Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createContact', () => {
    it('should create a new contact message', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Question',
        message: 'Hello, I have a question',
      };

      const mockContact = {
        _id: 'contact123',
        ...req.body,
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      Contact.mockImplementation(() => mockContact);

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
        })
      );
    });

    it('should validate email format', async () => {
      req.body = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Test',
      };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAllContacts', () => {
    it('should get all contact messages', async () => {
      const mockContacts = [
        { _id: 'c1', name: 'John', email: 'john@test.com' },
        { _id: 'c2', name: 'Jane', email: 'jane@test.com' },
      ];

      Contact.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockContacts),
      });

      await getAllContacts(req, res);

      expect(Contact.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockContacts,
        })
      );
    });

    it('should filter by status', async () => {
      req.query.status = 'pending';

      Contact.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await getAllContacts(req, res);

      expect(Contact.find).toHaveBeenCalledWith({ status: 'pending' });
    });
  });

  describe('getContactById', () => {
    it('should get contact by id', async () => {
      req.params.id = 'contact123';
      const mockContact = {
        _id: 'contact123',
        name: 'John',
        email: 'john@test.com',
      };

      Contact.findById = jest.fn().mockResolvedValue(mockContact);

      await getContactById(req, res);

      expect(Contact.findById).toHaveBeenCalledWith('contact123');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if contact not found', async () => {
      req.params.id = 'nonexistent';
      Contact.findById = jest.fn().mockResolvedValue(null);

      await getContactById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateContactStatus', () => {
    it('should update contact status', async () => {
      req.params.id = 'contact123';
      req.body = { status: 'resolved' };

      const mockContact = {
        _id: 'contact123',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      Contact.findById = jest.fn().mockResolvedValue(mockContact);

      await updateContactStatus(req, res);

      expect(mockContact.status).toBe('resolved');
      expect(mockContact.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact', async () => {
      req.params.id = 'contact123';

      Contact.findByIdAndDelete = jest.fn().mockResolvedValue({
        _id: 'contact123',
      });

      await deleteContact(req, res);

      expect(Contact.findByIdAndDelete).toHaveBeenCalledWith('contact123');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
