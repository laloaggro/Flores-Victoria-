const WishlistController = require('../controllers/wishlistController');

// Mock del cliente de Redis
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  sadd: jest.fn(),
  srem: jest.fn(),
  smembers: jest.fn()
};

// Mock de la solicitud y respuesta Express
const mockRequest = (params = {}, query = {}, body = {}, user = null) => ({
  params,
  query,
  body,
  user
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('WishlistController', () => {
  let wishlistController;

  beforeEach(() => {
    wishlistController = new WishlistController(mockRedis);
    jest.clearAllMocks();
  });

  describe('getWishlist', () => {
    it('debería obtener la lista de deseos del usuario correctamente', async () => {
      const mockWishlist = {
        userId: 1,
        items: [
          { productId: 1, name: 'Producto 1', price: 10.00 },
          { productId: 2, name: 'Producto 2', price: 15.00 }
        ]
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(mockWishlist));

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await wishlistController.getWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          wishlist: mockWishlist
        }
      });
    });

    it('debería devolver una lista de deseos vacía si no existe', async () => {
      mockRedis.get.mockResolvedValue(null);

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await wishlistController.getWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          wishlist: {
            userId: 1,
            items: []
          }
        }
      });
    });

    it('debería manejar errores al obtener la lista de deseos', async () => {
      mockRedis.get.mockRejectedValue(new Error('Error de Redis'));

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await wishlistController.getWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('addItem', () => {
    it('debería agregar un item a la lista de deseos correctamente', async () => {
      const newItem = {
        productId: 1,
        name: 'Producto 1',
        price: 10.00
      };
      
      mockRedis.sadd.mockResolvedValue(1);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK');

      const req = mockRequest({}, {}, newItem, { id: 1 });
      const res = mockResponse();

      await wishlistController.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Producto agregado a la lista de deseos',
        data: {
          wishlist: {
            userId: 1,
            items: [newItem]
          }
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteItem = {
        name: 'Producto sin ID'
      };

      const req = mockRequest({}, {}, incompleteItem, { id: 1 });
      const res = mockResponse();

      await wishlistController.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID, nombre y precio del producto son requeridos'
      });
    });
  });

  describe('removeItem', () => {
    it('debería eliminar un item de la lista de deseos correctamente', async () => {
      const existingWishlist = {
        userId: 1,
        items: [
          { productId: 1, name: 'Producto 1', price: 10.00 },
          { productId: 2, name: 'Producto 2', price: 15.00 }
        ]
      };
      
      const updatedWishlist = {
        userId: 1,
        items: [
          { productId: 2, name: 'Producto 2', price: 15.00 }
        ]
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(existingWishlist));
      mockRedis.srem.mockResolvedValue(1);
      mockRedis.setex.mockResolvedValue('OK');

      const req = mockRequest({ productId: '1' }, {}, {}, { id: 1 });
      const res = mockResponse();

      await wishlistController.removeItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Producto eliminado de la lista de deseos',
        data: {
          wishlist: updatedWishlist
        }
      });
    });

    it('debería devolver 404 si el producto no está en la lista de deseos', async () => {
      const existingWishlist = {
        userId: 1,
        items: [{ productId: 2, name: 'Producto 2', price: 15.00 }]
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(existingWishlist));
      mockRedis.srem.mockResolvedValue(0);

      const req = mockRequest({ productId: '1' }, {}, {}, { id: 1 });
      const res = mockResponse();

      await wishlistController.removeItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Producto no encontrado en la lista de deseos'
      });
    });
  });

  describe('clearWishlist', () => {
    it('debería limpiar la lista de deseos correctamente', async () => {
      mockRedis.del.mockResolvedValue(1);

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await wishlistController.clearWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Lista de deseos vaciada'
      });
    });

    it('debería manejar errores al limpiar la lista de deseos', async () => {
      mockRedis.del.mockRejectedValue(new Error('Error de Redis'));

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await wishlistController.clearWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });
});