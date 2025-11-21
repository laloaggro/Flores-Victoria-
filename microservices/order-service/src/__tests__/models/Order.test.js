const Order = require('../../models/Order');

describe('Order Model', () => {
  let order;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };

    order = new Order(mockDb);
  });

  describe('create', () => {
    it('should create new order', async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: '1', quantity: 2 }],
        total: 100,
        shippingAddress: '123 Main St',
        paymentMethod: 'credit_card',
      };

      const mockResult = {
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(orderData.items),
            total: 100,
            shipping_address: '123 Main St',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      };

      mockDb.query.mockResolvedValue(mockResult);

      const result = await order.create(orderData);

      expect(result).toEqual(mockResult.rows[0]);
      expect(mockDb.query).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return orders for user', async () => {
      const mockResult = {
        rows: [
          {
            id: 1,
            user_id: 1,
            items: '[{"productId":"1","quantity":2}]',
            total: 100,
            status: 'pending',
            created_at: new Date(),
          },
        ],
      };

      mockDb.query.mockResolvedValue(mockResult);

      const result = await order.findByUserId(1);

      expect(result).toHaveLength(1);
      expect(result[0].items).toEqual([{ productId: '1', quantity: 2 }]);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });
  });

  describe('findById', () => {
    it('should return order by id', async () => {
      const mockResult = {
        rows: [
          {
            id: 1,
            user_id: 1,
            items: '[{"productId":"1","quantity":2}]',
            total: 100,
            status: 'pending',
            created_at: new Date(),
          },
        ],
      };

      mockDb.query.mockResolvedValue(mockResult);

      const result = await order.findById(1);

      expect(result).toBeDefined();
      expect(result.items).toEqual([{ productId: '1', quantity: 2 }]);
    });

    it('should return null if order not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const result = await order.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('createTables', () => {
    it('should create tables without error', async () => {
      mockDb.query.mockResolvedValue({});

      await expect(order.createTables()).resolves.not.toThrow();
      expect(mockDb.query).toHaveBeenCalled();
    });
  });
});
