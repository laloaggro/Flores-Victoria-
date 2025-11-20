const express = require('express');
const request = require('supertest');

describe('Wishlist Routes - Integration Tests', () => {
  let app;
  let wishlistRoutes;
  let mockWishlistController;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWishlistController = {
      getWishlist: jest.fn((req, res) =>
        res.json({ status: 'success', data: { wishlist: { items: [] } } })
      ),
      addItem: jest.fn((req, res) =>
        res.json({ status: 'success', data: { wishlist: { items: [req.body] } } })
      ),
      removeItem: jest.fn((req, res) =>
        res.json({ status: 'success', data: { wishlist: { items: [] } } })
      ),
      clearWishlist: jest.fn((req, res) =>
        res.json({ status: 'success', message: 'Lista de deseos vaciada exitosamente' })
      ),
    };

    jest.doMock('../../controllers/wishlistController', () =>
      jest.fn().mockImplementation(() => mockWishlistController)
    );

    wishlistRoutes = require('../../routes/wishlist');

    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: 'user-123' };
      next();
    });

    const mockRedis = {};
    wishlistRoutes.setRedis(mockRedis);

    app.use('/wishlist', wishlistRoutes);
  });

  describe('GET /wishlist', () => {
    it('should get user wishlist', async () => {
      const response = await request(app).get('/wishlist');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(mockWishlistController.getWishlist).toHaveBeenCalled();
    });
  });

  describe('POST /wishlist/items', () => {
    it('should add item to wishlist', async () => {
      const item = {
        productId: '123',
        name: 'Test Product',
        price: 100,
      };

      const response = await request(app).post('/wishlist/items').send(item);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(mockWishlistController.addItem).toHaveBeenCalled();
    });
  });

  describe('DELETE /wishlist/items/:productId', () => {
    it('should remove item from wishlist', async () => {
      const response = await request(app).delete('/wishlist/items/123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(mockWishlistController.removeItem).toHaveBeenCalled();
    });
  });

  describe('DELETE /wishlist', () => {
    it('should clear entire wishlist', async () => {
      const response = await request(app).delete('/wishlist');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(mockWishlistController.clearWishlist).toHaveBeenCalled();
    });
  });
});
