const CartController = require('../controllers/cartController');

// Mock del cliente de Redis
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  exists: jest.fn()
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

describe('CartController', () => {
  let cartController;

  beforeEach(() => {
    cartController = new CartController(mockRedis);
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('debería obtener el carrito del usuario correctamente', async () => {
      const mockCart = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2, price: 10.00 },
          { productId: 2, quantity: 1, price: 15.00 }
        ],
        total: 35.00
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(mockCart));

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await cartController.getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          cart: mockCart
        }
      });
    });

    it('debería devolver un carrito vacío si no existe', async () => {
      mockRedis.get.mockResolvedValue(null);

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await cartController.getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          cart: {
            userId: 1,
            items: [],
            total: 0
          }
        }
      });
    });

    it('debería manejar errores al obtener el carrito', async () => {
      mockRedis.get.mockRejectedValue(new Error('Error de Redis'));

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await cartController.getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('addItem', () => {
    it('debería agregar un item al carrito correctamente', async () => {
      const newItem = {
        productId: 1,
        quantity: 2,
        price: 10.00
      };
      
      const existingCart = {
        userId: 1,
        items: [],
        total: 0
      };
      
      const updatedCart = {
        userId: 1,
        items: [newItem],
        total: 20.00
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.setex.mockResolvedValue('OK');

      const req = mockRequest({}, {}, newItem, { id: 1 });
      const res = mockResponse();

      await cartController.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Producto agregado al carrito',
        data: {
          cart: updatedCart
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteItem = {
        productId: 1
      };

      const req = mockRequest({}, {}, incompleteItem, { id: 1 });
      const res = mockResponse();

      await cartController.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Producto, cantidad y precio son requeridos'
      });
    });
  });

  describe('updateItem', () => {
    it('debería actualizar un item en el carrito correctamente', async () => {
      const existingCart = {
        userId: 1,
        items: [{ productId: 1, quantity: 2, price: 10.00 }],
        total: 20.00
      };
      
      const updatedCart = {
        userId: 1,
        items: [{ productId: 1, quantity: 5, price: 10.00 }],
        total: 50.00
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.setex.mockResolvedValue('OK');

      const req = mockRequest({ productId: '1' }, {}, { quantity: 5 }, { id: 1 });
      const res = mockResponse();

      await cartController.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Carrito actualizado',
        data: {
          cart: updatedCart
        }
      });
    });

    it('debería devolver 404 si el producto no está en el carrito', async () => {
      const existingCart = {
        userId: 1,
        items: [{ productId: 2, quantity: 1, price: 15.00 }],
        total: 15.00
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));

      const req = mockRequest({ productId: '1' }, {}, { quantity: 5 }, { id: 1 });
      const res = mockResponse();

      await cartController.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Producto no encontrado en el carrito'
      });
    });
  });

  describe('removeItem', () => {
    it('debería eliminar un item del carrito correctamente', async () => {
      const existingCart = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2, price: 10.00 },
          { productId: 2, quantity: 1, price: 15.00 }
        ],
        total: 35.00
      };
      
      const updatedCart = {
        userId: 1,
        items: [
          { productId: 2, quantity: 1, price: 15.00 }
        ],
        total: 15.00
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.setex.mockResolvedValue('OK');

      const req = mockRequest({ productId: '1' }, {}, {}, { id: 1 });
      const res = mockResponse();

      await cartController.removeItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Producto eliminado del carrito',
        data: {
          cart: updatedCart
        }
      });
    });

    it('debería devolver 404 si el producto no está en el carrito', async () => {
      const existingCart = {
        userId: 1,
        items: [{ productId: 2, quantity: 1, price: 15.00 }],
        total: 15.00
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));

      const req = mockRequest({ productId: '1' }, {}, {}, { id: 1 });
      const res = mockResponse();

      await cartController.removeItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Producto no encontrado en el carrito'
      });
    });
  });

  describe('clearCart', () => {
    it('debería limpiar el carrito correctamente', async () => {
      mockRedis.del.mockResolvedValue(1);

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await cartController.clearCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Carrito vaciado'
      });
    });

    it('debería manejar errores al limpiar el carrito', async () => {
      mockRedis.del.mockRejectedValue(new Error('Error de Redis'));

      const req = mockRequest({}, {}, {}, { id: 1 });
      const res = mockResponse();

      await cartController.clearCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });
});