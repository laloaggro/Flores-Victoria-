const OrderController = require('../controllers/orderController');

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

describe('OrderController', () => {
  let orderController;

  beforeEach(() => {
    orderController = new OrderController(mockDb);
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('debería obtener todos los pedidos correctamente', async () => {
      const mockOrders = [
        { 
          id: 1, 
          userId: 1, 
          products: [{ id: 1, name: 'Producto 1', quantity: 2, price: 10.00 }],
          total: 20.00,
          status: 'pending'
        },
        { 
          id: 2, 
          userId: 2, 
          products: [{ id: 2, name: 'Producto 2', quantity: 1, price: 15.00 }],
          total: 15.00,
          status: 'completed'
        }
      ];
      
      mockDb.query.mockResolvedValue({ rows: mockOrders });

      const req = mockRequest();
      const res = mockResponse();

      await orderController.getAllOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          orders: mockOrders
        }
      });
    });

    it('debería manejar errores al obtener pedidos', async () => {
      mockDb.query.mockRejectedValue(new Error('Error de base de datos'));

      const req = mockRequest();
      const res = mockResponse();

      await orderController.getAllOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getOrderById', () => {
    it('debería obtener un pedido por ID correctamente', async () => {
      const mockOrder = { 
        id: 1, 
        userId: 1, 
        products: [{ id: 1, name: 'Producto 1', quantity: 2, price: 10.00 }],
        total: 20.00,
        status: 'pending'
      };
      mockDb.query.mockResolvedValue({ rows: [mockOrder] });

      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      await orderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          order: mockOrder
        }
      });
    });

    it('debería devolver 404 si el pedido no existe', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await orderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Pedido no encontrado'
      });
    });
  });

  describe('createOrder', () => {
    it('debería crear un pedido correctamente', async () => {
      const newOrder = {
        userId: 1,
        products: [{ id: 1, quantity: 2 }],
        total: 20.00
      };
      
      const createdOrder = {
        id: 1,
        ...newOrder,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      mockDb.query.mockResolvedValue({ rows: [createdOrder] });

      const req = mockRequest({}, {}, newOrder);
      const res = mockResponse();

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Pedido creado exitosamente',
        data: {
          order: createdOrder
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteOrder = {
        userId: 1
      };

      const req = mockRequest({}, {}, incompleteOrder);
      const res = mockResponse();

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario y productos son requeridos'
      });
    });
  });

  describe('updateOrder', () => {
    it('debería actualizar un pedido correctamente', async () => {
      const existingOrder = { 
        id: 1, 
        userId: 1, 
        products: [{ id: 1, name: 'Producto 1', quantity: 2, price: 10.00 }],
        total: 20.00,
        status: 'pending'
      };
      
      const updatedOrder = { 
        id: 1, 
        userId: 1, 
        products: [{ id: 1, name: 'Producto 1', quantity: 2, price: 10.00 }],
        total: 20.00,
        status: 'completed'
      };
      
      // Mock para verificar que el pedido existe
      mockDb.query
        .mockResolvedValueOnce({ rows: [existingOrder] }) // Para verificar existencia
        .mockResolvedValueOnce({ rowCount: 1 }); // Para actualizar

      const req = mockRequest({ id: '1' }, {}, { status: 'completed' });
      const res = mockResponse();

      await orderController.updateOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Pedido actualizado exitosamente',
        data: {
          order: updatedOrder
        }
      });
    });

    it('debería devolver 404 al intentar actualizar un pedido que no existe', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const req = mockRequest({ id: '999' }, {}, { status: 'completed' });
      const res = mockResponse();

      await orderController.updateOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Pedido no encontrado'
      });
    });
  });
});