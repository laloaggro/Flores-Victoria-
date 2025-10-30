const OrderController = require('../../controllers/orderController');

describe('OrderController - Unit Tests', () => {
  let orderController;
  let mockDb;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };

    orderController = new OrderController(mockDb);

    mockReq = {
      user: { id: 1 },
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 2 }],
        total: 50000,
        shippingAddress: 'Av. Libertador 123, Santiago',
        paymentMethod: 'credit_card',
      };

      mockReq.body = orderData;

      const mockCreatedOrder = {
        id: 1,
        user_id: 1,
        items: JSON.stringify(orderData.items),
        total: 50000,
        shipping_address: orderData.shippingAddress,
        payment_method: 'credit_card',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValue({ rows: [mockCreatedOrder] });

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Pedido creado exitosamente',
        data: {
          order: mockCreatedOrder,
        },
      });
    });

    it('should return 400 when items are missing', async () => {
      mockReq.body = {
        total: 50000,
        shippingAddress: 'Test Address',
        paymentMethod: 'credit_card',
      };

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Items, total, dirección de envío y método de pago son requeridos',
      });
    });

    it('should return 400 when total is missing', async () => {
      mockReq.body = {
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        shippingAddress: 'Test Address',
        paymentMethod: 'credit_card',
      };

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Items, total, dirección de envío y método de pago son requeridos',
      });
    });

    it('should return 400 when shippingAddress is missing', async () => {
      mockReq.body = {
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        total: 25000,
        paymentMethod: 'credit_card',
      };

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Items, total, dirección de envío y método de pago son requeridos',
      });
    });

    it('should return 400 when paymentMethod is missing', async () => {
      mockReq.body = {
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        total: 25000,
        shippingAddress: 'Test Address',
      };

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Items, total, dirección de envío y método de pago son requeridos',
      });
    });

    it('should handle database errors', async () => {
      mockReq.body = {
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        total: 25000,
        shippingAddress: 'Test Address',
        paymentMethod: 'credit_card',
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDb.query.mockRejectedValue(new Error('Database error'));

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should use userId from req.user', async () => {
      mockReq.user.id = 42;
      mockReq.body = {
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        total: 25000,
        shippingAddress: 'Test Address',
        paymentMethod: 'credit_card',
      };

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 42,
            items: JSON.stringify(mockReq.body.items),
            total: 25000,
            shipping_address: 'Test Address',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getUserOrders', () => {
    it('should get all user orders successfully', async () => {
      const mockOrders = [
        {
          id: 1,
          user_id: 1,
          items: JSON.stringify([{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 2 }]),
          total: 50000,
          shipping_address: 'Address 1',
          payment_method: 'credit_card',
          status: 'pending',
          created_at: new Date(),
        },
        {
          id: 2,
          user_id: 1,
          items: JSON.stringify([
            { productId: 'prod2', name: 'Lirios', price: 30000, quantity: 1 },
          ]),
          total: 30000,
          shipping_address: 'Address 2',
          payment_method: 'debit_card',
          status: 'delivered',
          created_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValue({ rows: mockOrders });

      await orderController.getUserOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          orders: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              items: expect.any(Array),
            }),
            expect.objectContaining({
              id: 2,
              items: expect.any(Array),
            }),
          ]),
        },
      });
    });

    it('should return empty array when user has no orders', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      await orderController.getUserOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          orders: [],
        },
      });
    });

    it('should handle database errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDb.query.mockRejectedValue(new Error('Database error'));

      await orderController.getUserOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should use userId from req.user', async () => {
      mockReq.user.id = 99;

      mockDb.query.mockResolvedValue({ rows: [] });

      await orderController.getUserOrders(mockReq, mockRes);

      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [99]);
    });
  });

  describe('getOrderById', () => {
    it('should get order by ID successfully', async () => {
      mockReq.params.id = '1';
      mockReq.user.id = 1;

      const mockOrder = {
        id: 1,
        user_id: 1,
        items: JSON.stringify([{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 2 }]),
        total: 50000,
        shipping_address: 'Test Address',
        payment_method: 'credit_card',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValue({ rows: [mockOrder] });

      await orderController.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          order: expect.objectContaining({
            id: 1,
            user_id: 1,
            items: expect.any(Array),
          }),
        },
      });
    });

    it('should return 404 when order not found', async () => {
      mockReq.params.id = '999';

      mockDb.query.mockResolvedValue({ rows: [] });

      await orderController.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Pedido no encontrado',
      });
    });

    it('should return 403 when order belongs to different user', async () => {
      mockReq.params.id = '1';
      mockReq.user.id = 1;

      const mockOrder = {
        id: 1,
        user_id: 2, // Different user
        items: JSON.stringify([{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 2 }]),
        total: 50000,
        shipping_address: 'Test Address',
        payment_method: 'credit_card',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValue({ rows: [mockOrder] });

      await orderController.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'No tienes permiso para acceder a este pedido',
      });
    });

    it('should handle database errors', async () => {
      mockReq.params.id = '1';

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDb.query.mockRejectedValue(new Error('Database error'));

      await orderController.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should allow user to access their own order', async () => {
      mockReq.params.id = '5';
      mockReq.user.id = 10;

      const mockOrder = {
        id: 5,
        user_id: 10,
        items: JSON.stringify([{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }]),
        total: 25000,
        shipping_address: 'Test Address',
        payment_method: 'credit_card',
        status: 'delivered',
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValue({ rows: [mockOrder] });

      await orderController.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          order: expect.objectContaining({
            id: 5,
            user_id: 10,
          }),
        },
      });
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle missing user in request', async () => {
      delete mockReq.user;
      mockReq.body = {
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        total: 25000,
        shippingAddress: 'Test',
        paymentMethod: 'credit_card',
      };

      // En producción, el middleware auth debe garantizar req.user existe
      // Si falta, causará un TypeError al acceder a req.user.id
      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });

    it('should handle large order totals', async () => {
      mockReq.body = {
        items: [{ productId: 'prod1', name: 'Premium', price: 999999.99, quantity: 1 }],
        total: 999999.99,
        shippingAddress: 'Test',
        paymentMethod: 'credit_card',
      };

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(mockReq.body.items),
            total: 999999.99,
            shipping_address: 'Test',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle special characters in shipping address', async () => {
      mockReq.body = {
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        total: 25000,
        shippingAddress: 'Calle Ñuñoa #123, Depto 4-B "El Roble"',
        paymentMethod: 'credit_card',
      };

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(mockReq.body.items),
            total: 25000,
            shipping_address: mockReq.body.shippingAddress,
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
