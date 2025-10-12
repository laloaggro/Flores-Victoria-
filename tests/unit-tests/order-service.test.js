const Order = require('../../microservices/order-service/src/models/Order');

describe('Order Service - Unit Tests', () => {
  let orderModel;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    };
    orderModel = new Order(mockDb);
  });

  describe('Order Model', () => {
    describe('create', () => {
      test('should create a new order', async () => {
        const orderData = {
          userId: 1,
          items: [{ productId: 1, quantity: 2, price: 10 }],
          total: 20,
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card'
        };

        const mockResult = {
          rows: [{
            id: 1,
            user_id: 1,
            items: JSON.stringify(orderData.items),
            total: 20,
            shipping_address: '123 Main St',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date()
          }]
        };

        mockDb.query.mockResolvedValue(mockResult);

        const result = await orderModel.create(orderData);

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO orders'),
          [
            orderData.userId,
            JSON.stringify(orderData.items),
            orderData.total,
            orderData.shippingAddress,
            orderData.paymentMethod,
            'pending'
          ]
        );
        expect(result).toEqual(mockResult.rows[0]);
      });
    });

    describe('findByUserId', () => {
      test('should retrieve orders by user ID', async () => {
        const userId = 1;
        const mockOrders = [
          {
            id: 1,
            user_id: userId,
            items: '[{"productId": 1, "quantity": 2, "price": 10}]',
            total: 20,
            shipping_address: '123 Main St',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date()
          }
        ];

        const expectedOrders = [
          {
            id: 1,
            user_id: userId,
            items: [{ productId: 1, quantity: 2, price: 10 }],
            total: 20,
            shipping_address: '123 Main St',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: expect.any(Date)
          }
        ];

        mockDb.query.mockResolvedValue({ rows: mockOrders });

        const result = await orderModel.findByUserId(userId);

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT id, user_id, items, total'),
          [userId]
        );
        expect(result).toEqual(expectedOrders);
      });

      test('should return empty array when no orders found', async () => {
        const userId = 999;
        mockDb.query.mockResolvedValue({ rows: [] });

        const result = await orderModel.findByUserId(userId);

        expect(result).toEqual([]);
      });
    });

    describe('findById', () => {
      test('should retrieve order by ID', async () => {
        const orderId = 1;
        const mockOrder = {
          id: orderId,
          user_id: 1,
          items: '[{"productId": 1, "quantity": 2, "price": 10}]',
          total: 20,
          shipping_address: '123 Main St',
          payment_method: 'credit_card',
          status: 'pending',
          created_at: new Date()
        };

        const expectedOrder = {
          id: orderId,
          user_id: 1,
          items: [{ productId: 1, quantity: 2, price: 10 }],
          total: 20,
          shipping_address: '123 Main St',
          payment_method: 'credit_card',
          status: 'pending',
          created_at: expect.any(Date)
        };

        mockDb.query.mockResolvedValue({ rows: [mockOrder] });

        const result = await orderModel.findById(orderId);

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT id, user_id, items, total'),
          [orderId]
        );
        expect(result).toEqual(expectedOrder);
      });
    });

    describe('updateStatus', () => {
      test('should update order status', async () => {
        const orderId = 1;
        const status = 'completed';
        const mockResult = {
          rows: [{
            id: orderId,
            status,
            updated_at: new Date()
          }]
        };

        mockDb.query.mockResolvedValue(mockResult);

        const result = await orderModel.updateStatus(orderId, status);

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE orders SET status = $1'),
          [status, orderId]
        );
        expect(result).toEqual(mockResult.rows[0]);
      });
    });
  });
});