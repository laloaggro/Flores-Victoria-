const {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../../controllers/orderController');

jest.mock('../../models/Order');
const Order = require('../../models/Order');

describe('Order Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 'user123' },
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

  describe('createOrder', () => {
    it('should create a new order', async () => {
      req.body = {
        items: [{ productId: 'prod1', quantity: 2, price: 29.99 }],
        shippingAddress: {
          street: '123 Main St',
          city: 'Santiago',
          country: 'Chile',
        },
        paymentMethod: 'credit_card',
      };

      const mockOrder = {
        _id: 'order123',
        ...req.body,
        userId: 'user123',
        status: 'pending',
        total: 59.98,
        save: jest.fn().mockResolvedValue(true),
      };

      Order.mockImplementation(() => mockOrder);

      await createOrder(req, res);

      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should validate required fields', async () => {
      req.body = {};

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should calculate total correctly', async () => {
      req.body = {
        items: [
          { productId: 'p1', quantity: 2, price: 10 },
          { productId: 'p2', quantity: 1, price: 15 },
        ],
        shippingAddress: { street: 'Test', city: 'Test' },
      };

      const mockOrder = {
        _id: 'order123',
        save: jest.fn().mockResolvedValue(true),
      };

      Order.mockImplementation(() => mockOrder);

      await createOrder(req, res);

      expect(mockOrder.save).toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should get order by id', async () => {
      req.params.id = 'order123';
      const mockOrder = {
        _id: 'order123',
        userId: 'user123',
        total: 100,
      };

      Order.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder),
      });

      await getOrderById(req, res);

      expect(Order.findById).toHaveBeenCalledWith('order123');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if order not found', async () => {
      req.params.id = 'nonexistent';
      Order.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getUserOrders', () => {
    it('should get all orders for user', async () => {
      const mockOrders = [
        { _id: 'o1', total: 100, status: 'delivered' },
        { _id: 'o2', total: 50, status: 'pending' },
      ];

      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOrders),
        }),
      });

      await getUserOrders(req, res);

      expect(Order.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter by status', async () => {
      req.query.status = 'delivered';

      Order.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      });

      await getUserOrders(req, res);

      expect(Order.find).toHaveBeenCalledWith({
        userId: 'user123',
        status: 'delivered',
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      req.params.id = 'order123';
      req.body = { status: 'shipped' };

      const mockOrder = {
        _id: 'order123',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      Order.findById = jest.fn().mockResolvedValue(mockOrder);

      await updateOrderStatus(req, res);

      expect(mockOrder.status).toBe('shipped');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should validate status value', async () => {
      req.params.id = 'order123';
      req.body = { status: 'invalid_status' };

      const mockOrder = {
        _id: 'order123',
        status: 'pending',
      };

      Order.findById = jest.fn().mockResolvedValue(mockOrder);

      await updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      req.params.id = 'order123';

      const mockOrder = {
        _id: 'order123',
        userId: 'user123',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      Order.findById = jest.fn().mockResolvedValue(mockOrder);

      await cancelOrder(req, res);

      expect(mockOrder.status).toBe('cancelled');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should not cancel already shipped orders', async () => {
      req.params.id = 'order123';

      const mockOrder = {
        _id: 'order123',
        status: 'shipped',
      };

      Order.findById = jest.fn().mockResolvedValue(mockOrder);

      await cancelOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
