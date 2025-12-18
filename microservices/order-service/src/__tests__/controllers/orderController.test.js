/**
 * Tests del Order Controller
 * @fileoverview Tests unitarios del controlador de pedidos
 */

// Mocks primero
const mockCreate = jest.fn();
const mockFindByUserId = jest.fn();
const mockFindById = jest.fn();
const mockUpdateStatus = jest.fn();
const mockCancel = jest.fn();

jest.mock('../../models/Order', () => {
  return jest.fn().mockImplementation(() => ({
    create: mockCreate,
    findByUserId: mockFindByUserId,
    findById: mockFindById,
    updateStatus: mockUpdateStatus,
    cancel: mockCancel,
  }));
});

jest.mock('../../logger.simple', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

const OrderController = require('../../controllers/orderController');

describe('OrderController', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {};
    controller = new OrderController(mockDb);

    mockReq = {
      user: { id: 'user-123' },
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createOrder', () => {
    const validOrderData = {
      items: [{ productId: 'prod-1', quantity: 2, price: 100 }],
      total: 200,
      shippingAddress: {
        street: 'Calle Principal 123',
        city: 'Santiago',
        country: 'Chile',
      },
      paymentMethod: 'credit_card',
    };

    it('should create order successfully with valid data', async () => {
      mockReq.body = validOrderData;
      const createdOrder = { id: 'order-123', ...validOrderData, userId: 'user-123' };
      mockCreate.mockResolvedValue(createdOrder);

      await controller.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Pedido creado exitosamente',
        data: { order: createdOrder },
      });
    });

    it('should return 400 when items are missing', async () => {
      mockReq.body = { ...validOrderData, items: undefined };

      await controller.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Items, total, dirección de envío y método de pago son requeridos',
      });
    });

    it('should return 400 when total is missing', async () => {
      mockReq.body = { ...validOrderData, total: undefined };

      await controller.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when shippingAddress is missing', async () => {
      mockReq.body = { ...validOrderData, shippingAddress: undefined };

      await controller.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when paymentMethod is missing', async () => {
      mockReq.body = { ...validOrderData, paymentMethod: undefined };

      await controller.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on database error', async () => {
      mockReq.body = validOrderData;
      mockCreate.mockRejectedValue(new Error('Database error'));

      await controller.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders successfully', async () => {
      const orders = [
        { id: 'order-1', total: 100 },
        { id: 'order-2', total: 200 },
      ];
      mockFindByUserId.mockResolvedValue(orders);

      await controller.getUserOrders(mockReq, mockRes);

      expect(mockFindByUserId).toHaveBeenCalledWith('user-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { orders },
      });
    });

    it('should return empty array when user has no orders', async () => {
      mockFindByUserId.mockResolvedValue([]);

      await controller.getUserOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { orders: [] },
      });
    });

    it('should return 500 on database error', async () => {
      mockFindByUserId.mockRejectedValue(new Error('Database error'));

      await controller.getUserOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getOrderById', () => {
    it('should return order by id successfully', async () => {
      mockReq.params.orderId = 'order-123';
      const order = { id: 'order-123', total: 100, userId: 'user-123' };
      mockFindById.mockResolvedValue(order);

      await controller.getOrderById(mockReq, mockRes);

      expect(mockFindById).toHaveBeenCalledWith('order-123', 'user-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { order },
      });
    });

    it('should return 404 when order not found', async () => {
      mockReq.params.orderId = 'nonexistent';
      mockFindById.mockResolvedValue(null);

      await controller.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Pedido no encontrado',
      });
    });

    it('should return 500 on database error', async () => {
      mockReq.params.orderId = 'order-123';
      mockFindById.mockRejectedValue(new Error('Database error'));

      await controller.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      mockReq.params.orderId = 'order-123';
      mockReq.body = { status: 'shipped' };
      const updatedOrder = { id: 'order-123', status: 'shipped' };
      mockUpdateStatus.mockResolvedValue(updatedOrder);

      await controller.updateOrderStatus(mockReq, mockRes);

      expect(mockUpdateStatus).toHaveBeenCalledWith('order-123', 'shipped');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when status is invalid', async () => {
      mockReq.params.orderId = 'order-123';
      mockReq.body = { status: 'invalid_status' };

      await controller.updateOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when order not found', async () => {
      mockReq.params.orderId = 'nonexistent';
      mockReq.body = { status: 'shipped' };
      mockUpdateStatus.mockResolvedValue(null);

      await controller.updateOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      mockReq.params.orderId = 'order-123';
      const cancelledOrder = { id: 'order-123', status: 'cancelled' };
      mockCancel.mockResolvedValue(cancelledOrder);

      await controller.cancelOrder(mockReq, mockRes);

      expect(mockCancel).toHaveBeenCalledWith('order-123', 'user-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when order not found', async () => {
      mockReq.params.orderId = 'nonexistent';
      mockCancel.mockResolvedValue(null);

      await controller.cancelOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params.orderId = 'order-123';
      mockCancel.mockRejectedValue(new Error('Cannot cancel'));

      await controller.cancelOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
