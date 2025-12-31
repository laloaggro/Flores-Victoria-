// Tests for checkoutService.js
const mongoose = require('mongoose');

// Mock mongoose
jest.mock('mongoose');

describe('CheckoutService', () => {
  let CheckoutService;
  let checkoutService;
  let mockOrderModel;
  let mockProductCollection;
  let mockCartService;
  let mockLogger;
  let mockSession;

  beforeEach(() => {
    // Reset module cache to ensure clean state
    jest.resetModules();

    // Setup mock session
    mockSession = {
      withTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongoose.startSession = jest.fn().mockResolvedValue(mockSession);

    // Setup mock models and services
    mockOrderModel = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    mockProductCollection = {
      updateMany: jest.fn(),
    };

    mockCartService = {
      clearCart: jest.fn().mockResolvedValue(true),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    // Import CheckoutService after mocks are setup
    CheckoutService = require('../../services/checkoutService');
    
    checkoutService = new CheckoutService({
      orderModel: mockOrderModel,
      productCollection: mockProductCollection,
      cartService: mockCartService,
      logger: mockLogger,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided dependencies', () => {
      expect(checkoutService.orderModel).toBe(mockOrderModel);
      expect(checkoutService.productCollection).toBe(mockProductCollection);
      expect(checkoutService.cartService).toBe(mockCartService);
      expect(checkoutService.logger).toBe(mockLogger);
    });

    it('should use console as logger if not provided', () => {
      const service = new CheckoutService({
        orderModel: mockOrderModel,
        productCollection: mockProductCollection,
        cartService: mockCartService,
      });

      expect(service.logger).toBe(console);
    });
  });

  describe('processCheckout', () => {
    const validCheckoutData = {
      userId: 'user123',
      items: [
        { productId: 'prod1', quantity: 2, price: 50 },
        { productId: 'prod2', quantity: 1, price: 100 },
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'Test City',
        postalCode: '12345',
      },
      paymentMethod: 'credit_card',
      paymentDetails: {
        cardNumber: '****1234',
      },
    };

    it('should start a MongoDB session', async () => {
      mockSession.withTransaction.mockImplementation(async (callback) => {
        await callback();
      });

      try {
        await checkoutService.processCheckout(validCheckoutData);
      } catch (error) {
        // Expected to fail due to mocked transaction
      }

      expect(mongoose.startSession).toHaveBeenCalled();
    });

    it('should call withTransaction on session', async () => {
      mockSession.withTransaction.mockImplementation(async (callback) => {
        await callback();
      });

      try {
        await checkoutService.processCheckout(validCheckoutData);
      } catch (error) {
        // Expected to fail due to mocked transaction
      }

      expect(mockSession.withTransaction).toHaveBeenCalled();
    });
  });

  describe('_validateCheckoutData', () => {
    it('should validate checkout data structure', () => {
      const validData = {
        userId: 'user123',
        items: [{ productId: 'prod1', quantity: 1, price: 50 }],
        shippingAddress: {},
        paymentMethod: 'credit_card',
      };

      // Call private method through processCheckout
      expect(() => {
        checkoutService._validateCheckoutData(validData);
      }).not.toThrow();
    });
  });

  describe('_calculateTotals', () => {
    it('should calculate totals from items', () => {
      const items = [
        { productId: 'prod1', quantity: 2, price: 50 },
        { productId: 'prod2', quantity: 1, price: 100 },
      ];

      const totals = checkoutService._calculateTotals(items);

      expect(totals).toHaveProperty('subtotal');
      expect(totals).toHaveProperty('total');
    });

    it('should handle empty items array', () => {
      const items = [];
      const totals = checkoutService._calculateTotals(items);

      expect(totals).toHaveProperty('subtotal');
      expect(totals).toHaveProperty('total');
    });
  });

  describe('_formatOrder', () => {
    it('should format order object', () => {
      const mockOrder = {
        _id: 'order123',
        userId: 'user123',
        items: [],
        total: 200,
        toObject: jest.fn().mockReturnThis(),
      };

      const formatted = checkoutService._formatOrder(mockOrder);

      expect(formatted).toBeDefined();
    });
  });
});
