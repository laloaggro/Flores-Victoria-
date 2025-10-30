const Order = require('../../models/Order');

describe('Order Model - Unit Tests', () => {
  let order;
  let mockDb;

  beforeEach(() => {
    // Mock PostgreSQL database
    mockDb = {
      query: jest.fn(),
    };

    order = new Order(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 'prod1', name: 'Ramo de Rosas', price: 25000, quantity: 2 }],
        total: 50000,
        shippingAddress: 'Av. Libertador 123, Santiago',
        paymentMethod: 'credit_card',
      };

      const mockResult = {
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(orderData.items),
            total: 50000,
            shipping_address: orderData.shippingAddress,
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      };

      mockDb.query.mockResolvedValue(mockResult);

      const result = await order.create(orderData);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO orders'),
        expect.arrayContaining([
          orderData.userId,
          JSON.stringify(orderData.items),
          orderData.total,
          orderData.shippingAddress,
          orderData.paymentMethod,
          'pending',
        ])
      );

      expect(result).toEqual(mockResult.rows[0]);
      expect(result.status).toBe('pending');
    });

    it('should handle database errors when creating order', async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        total: 25000,
        shippingAddress: 'Test Address',
        paymentMethod: 'credit_card',
      };

      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(order.create(orderData)).rejects.toThrow('Database connection failed');
    });

    it('should store items as JSON string', async () => {
      const orderData = {
        userId: 1,
        items: [
          { productId: 'prod1', name: 'Rosas', price: 25000, quantity: 2 },
          { productId: 'prod2', name: 'Lirios', price: 30000, quantity: 1 },
        ],
        total: 80000,
        shippingAddress: 'Test Address',
        paymentMethod: 'debit_card',
      };

      const mockResult = {
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(orderData.items),
            total: 80000,
            shipping_address: orderData.shippingAddress,
            payment_method: 'debit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      };

      mockDb.query.mockResolvedValue(mockResult);

      await order.create(orderData);

      const callArgs = mockDb.query.mock.calls[0][1];
      expect(typeof callArgs[1]).toBe('string'); // items should be stringified
      expect(JSON.parse(callArgs[1])).toEqual(orderData.items);
    });
  });

  describe('findByUserId', () => {
    it('should find all orders for a user', async () => {
      const userId = 1;
      const mockOrders = [
        {
          id: 1,
          user_id: userId,
          items: JSON.stringify([{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 2 }]),
          total: 50000,
          shipping_address: 'Address 1',
          payment_method: 'credit_card',
          status: 'pending',
          created_at: new Date('2025-01-01'),
        },
        {
          id: 2,
          user_id: userId,
          items: JSON.stringify([
            { productId: 'prod2', name: 'Lirios', price: 30000, quantity: 1 },
          ]),
          total: 30000,
          shipping_address: 'Address 2',
          payment_method: 'debit_card',
          status: 'delivered',
          created_at: new Date('2025-01-02'),
        },
      ];

      mockDb.query.mockResolvedValue({ rows: mockOrders });

      const result = await order.findByUserId(userId);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [userId]);

      expect(result).toHaveLength(2);
      expect(result[0].items).toBeInstanceOf(Array); // Items should be parsed
      expect(result[0].items[0].name).toBe('Rosas');
      expect(result[1].items[0].name).toBe('Lirios');
    });

    it('should return empty array when user has no orders', async () => {
      const userId = 999;

      mockDb.query.mockResolvedValue({ rows: [] });

      const result = await order.findByUserId(userId);

      expect(result).toEqual([]);
    });

    it('should order results by created_at DESC', async () => {
      const userId = 1;

      mockDb.query.mockResolvedValue({ rows: [] });

      await order.findByUserId(userId);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        [userId]
      );
    });

    it('should parse JSON items correctly', async () => {
      const userId = 1;
      const itemsArray = [
        { productId: 'prod1', name: 'Ramo Mixto', price: 35000, quantity: 1 },
        { productId: 'prod2', name: 'Tarjeta', price: 2000, quantity: 1 },
      ];

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: userId,
            items: JSON.stringify(itemsArray),
            total: 37000,
            shipping_address: 'Test',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      const result = await order.findByUserId(userId);

      expect(result[0].items).toEqual(itemsArray);
    });
  });

  describe('findById', () => {
    it('should find order by ID', async () => {
      const orderId = 1;
      const mockOrder = {
        id: orderId,
        user_id: 1,
        items: JSON.stringify([{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 2 }]),
        total: 50000,
        shipping_address: 'Test Address',
        payment_method: 'credit_card',
        status: 'pending',
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValue({ rows: [mockOrder] });

      const result = await order.findById(orderId);

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [orderId]);

      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items[0].name).toBe('Rosas');
    });

    it('should return null when order not found', async () => {
      const orderId = 999;

      mockDb.query.mockResolvedValue({ rows: [] });

      const result = await order.findById(orderId);

      expect(result).toBeNull();
    });

    it('should parse items JSON correctly', async () => {
      const orderId = 1;
      const itemsArray = [
        { productId: 'prod1', name: 'Rosas', price: 25000, quantity: 2 },
        { productId: 'prod2', name: 'Lirios', price: 30000, quantity: 1 },
      ];

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: orderId,
            user_id: 1,
            items: JSON.stringify(itemsArray),
            total: 80000,
            shipping_address: 'Test',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      const result = await order.findById(orderId);

      expect(result.items).toEqual(itemsArray);
    });

    it('should handle database errors', async () => {
      const orderId = 1;

      mockDb.query.mockRejectedValue(new Error('Database error'));

      await expect(order.findById(orderId)).rejects.toThrow('Database error');
    });
  });

  describe('createTables', () => {
    it('should create orders table', async () => {
      mockDb.query.mockResolvedValue({});

      await order.createTables();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS orders')
      );
    });

    it('should include all required columns', async () => {
      mockDb.query.mockResolvedValue({});

      await order.createTables();

      const query = mockDb.query.mock.calls[0][0];
      expect(query).toContain('id SERIAL PRIMARY KEY');
      expect(query).toContain('user_id INTEGER NOT NULL');
      expect(query).toContain('items JSONB NOT NULL');
      expect(query).toContain('total DECIMAL(10, 2) NOT NULL');
      expect(query).toContain('shipping_address TEXT NOT NULL');
      expect(query).toContain('payment_method VARCHAR(50) NOT NULL');
      expect(query).toContain("status VARCHAR(20) DEFAULT 'pending'");
      expect(query).toContain('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      expect(query).toContain('updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    });

    it('should handle database errors when creating table', async () => {
      mockDb.query.mockRejectedValue(new Error('Permission denied'));

      await expect(order.createTables()).rejects.toThrow('Permission denied');
    });
  });

  describe('Edge Cases', () => {
    it('should handle order with single item', async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 'prod1', name: 'Rosa Individual', price: 5000, quantity: 1 }],
        total: 5000,
        shippingAddress: 'Test',
        paymentMethod: 'cash',
      };

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(orderData.items),
            total: 5000,
            shipping_address: 'Test',
            payment_method: 'cash',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      const result = await order.create(orderData);

      expect(result.total).toBe(5000);
    });

    it('should handle order with many items', async () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        productId: `prod${i}`,
        name: `Product ${i}`,
        price: 10000,
        quantity: 1,
      }));

      const orderData = {
        userId: 1,
        items,
        total: 200000,
        shippingAddress: 'Test',
        paymentMethod: 'credit_card',
      };

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(items),
            total: 200000,
            shipping_address: 'Test',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      const result = await order.create(orderData);

      expect(result.total).toBe(200000);
    });

    it('should handle large total amounts', async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 'prod1', name: 'Premium Arrangement', price: 999999.99, quantity: 1 }],
        total: 999999.99,
        shippingAddress: 'Test',
        paymentMethod: 'credit_card',
      };

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(orderData.items),
            total: 999999.99,
            shipping_address: 'Test',
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      const result = await order.create(orderData);

      expect(result.total).toBe(999999.99);
    });

    it('should handle special characters in shipping address', async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 'prod1', name: 'Rosas', price: 25000, quantity: 1 }],
        total: 25000,
        shippingAddress: 'Calle Ñuñoa #123, Depto 4-B, Santiago - Chile',
        paymentMethod: 'credit_card',
      };

      mockDb.query.mockResolvedValue({
        rows: [
          {
            id: 1,
            user_id: 1,
            items: JSON.stringify(orderData.items),
            total: 25000,
            shipping_address: orderData.shippingAddress,
            payment_method: 'credit_card',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      });

      const result = await order.create(orderData);

      expect(result.shipping_address).toBe('Calle Ñuñoa #123, Depto 4-B, Santiago - Chile');
    });
  });
});
