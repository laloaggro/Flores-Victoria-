const UserController = require('../controllers/userController');

// Mock del cliente de base de datos
const mockDb = {
  query: jest.fn()
};

// Mock de la solicitud y respuesta Express
const mockRequest = (params = {}, query = {}, body = {}) => ({
  params,
  query,
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  let userController;

  beforeEach(() => {
    userController = new UserController(mockDb);
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('debería obtener todos los usuarios correctamente', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' }
      ];
      
      mockDb.query.mockResolvedValue({ rows: mockUsers });

      const req = mockRequest();
      const res = mockResponse();

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          users: mockUsers
        }
      });
    });

    it('debería manejar errores al obtener usuarios', async () => {
      mockDb.query.mockRejectedValue(new Error('Error de base de datos'));

      const req = mockRequest();
      const res = mockResponse();

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getUserById', () => {
    it('debería obtener un usuario por ID correctamente', async () => {
      const mockUser = { id: 1, username: 'user1', email: 'user1@example.com' };
      mockDb.query.mockResolvedValue({ rows: [mockUser] });

      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: mockUser
        }
      });
    });

    it('debería devolver 404 si el usuario no existe', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });
  });

  describe('updateUser', () => {
    it('debería actualizar un usuario correctamente', async () => {
      const existingUser = { id: 1, username: 'user1', email: 'user1@example.com' };
      const updatedUser = { id: 1, username: 'updatedUser', email: 'updated@example.com' };
      
      // Mock para verificar que el usuario existe
      mockDb.query
        .mockResolvedValueOnce({ rows: [existingUser] }) // Para verificar existencia
        .mockResolvedValueOnce({ rows: [] }) // Para verificar email único
        .mockResolvedValueOnce({ rowCount: 1 }); // Para actualizar

      const req = mockRequest({ id: '1' }, {}, { username: 'updatedUser', email: 'updated@example.com' });
      const res = mockResponse();

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: {
          user: {
            id: 1,
            username: 'updatedUser',
            email: 'updated@example.com'
          }
        }
      });
    });

    it('debería devolver 404 al intentar actualizar un usuario que no existe', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const req = mockRequest({ id: '999' }, {}, { username: 'updatedUser' });
      const res = mockResponse();

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });
  });

  describe('deleteUser', () => {
    it('debería eliminar un usuario correctamente', async () => {
      const existingUser = { id: 1, username: 'user1', email: 'user1@example.com' };
      
      // Mock para verificar que el usuario existe
      mockDb.query
        .mockResolvedValueOnce({ rows: [existingUser] }) // Para verificar existencia
        .mockResolvedValueOnce({ rowCount: 1 }); // Para eliminar

      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario eliminado correctamente'
      });
    });

    it('debería devolver 404 al intentar eliminar un usuario que no existe', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });
  });
});