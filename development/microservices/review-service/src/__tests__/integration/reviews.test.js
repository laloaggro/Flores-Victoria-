const request = require('supertest');
const express = require('express');
const ReviewController = require('../../controllers/reviewController');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Mock de la base de datos para pruebas de integración
let mockDb;

// Inicializar el controlador con una base de datos mock
let reviewController;

// Middleware para inyectar la base de datos mock
app.use((req, res, next) => {
  req.db = mockDb;
  next();
});

// Inicializar controladores con base de datos mock
app.use((req, res, next) => {
  reviewController = new ReviewController(req.db);
  next();
});

// Rutas para pruebas
app.get('/api/reviews', (req, res) => {
  reviewController.getAllReviews(req, res);
});

app.get('/api/reviews/:id', (req, res) => {
  reviewController.getReviewById(req, res);
});

app.post('/api/reviews', (req, res) => {
  reviewController.createReview(req, res);
});

app.put('/api/reviews/:id', (req, res) => {
  reviewController.updateReview(req, res);
});

app.delete('/api/reviews/:id', (req, res) => {
  reviewController.deleteReview(req, res);
});

describe('Review Service Integration Tests', () => {
  beforeEach(() => {
    // Crear una base de datos mock para cada prueba
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      insertOne: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reviews', () => {
    it('debería obtener una lista de reseñas', async () => {
      const mockReviews = [
        { id: '1', productId: '1', userId: '1', rating: 5, comment: 'Excelente producto' },
        { id: '2', productId: '2', userId: '2', rating: 4, comment: 'Buen producto' }
      ];
      
      mockDb.toArray.mockResolvedValueOnce(mockReviews);

      const response = await request(app)
        .get('/api/reviews')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          reviews: mockReviews
        }
      });
    });

    it('debería manejar errores al obtener reseñas', async () => {
      mockDb.toArray.mockRejectedValueOnce(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/api/reviews')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('GET /api/reviews/:id', () => {
    it('debería obtener una reseña por ID', async () => {
      const mockReview = { id: '1', productId: '1', userId: '1', rating: 5, comment: 'Excelente producto' };
      mockDb.findOne.mockResolvedValueOnce(mockReview);

      const response = await request(app)
        .get('/api/reviews/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          review: mockReview
        }
      });
    });

    it('debería devolver 404 si la reseña no existe', async () => {
      mockDb.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/reviews/999')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Reseña no encontrada'
      });
    });
  });

  describe('POST /api/reviews', () => {
    it('debería crear una nueva reseña', async () => {
      const newReview = {
        productId: '1',
        userId: '1', 
        rating: 5,
        comment: 'Excelente producto'
      };
      
      const insertedReview = { 
        id: '1', 
        ...newReview, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      mockDb.insertOne.mockResolvedValueOnce({ insertedId: '1', ...insertedReview });

      const response = await request(app)
        .post('/api/reviews')
        .send(newReview)
        .expect(201);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Reseña creada exitosamente',
        data: {
          review: insertedReview
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteReview = { comment: 'Reseña sin rating' };

      const response = await request(app)
        .post('/api/reviews')
        .send(incompleteReview)
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Producto, usuario y calificación son requeridos'
      });
    });
  });

  describe('PUT /api/reviews/:id', () => {
    it('debería actualizar una reseña existente', async () => {
      const existingReview = { id: '1', productId: '1', userId: '1', rating: 3, comment: 'Producto regular' };
      const updatedReview = { 
        id: '1', 
        productId: '1',
        userId: '1',
        rating: 5,
        comment: 'Excelente producto actualizado',
        updatedAt: new Date()
      };
      
      // Mock para verificar que la reseña existe
      mockDb.findOne.mockResolvedValueOnce(existingReview).mockResolvedValueOnce(updatedReview);
      mockDb.updateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const response = await request(app)
        .put('/api/reviews/1')
        .send({ rating: 5, comment: 'Excelente producto actualizado' })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Reseña actualizada exitosamente',
        data: {
          review: updatedReview
        }
      });
    });

    it('debería devolver 404 al intentar actualizar una reseña que no existe', async () => {
      mockDb.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/reviews/999')
        .send({ rating: 5, comment: 'Excelente producto' })
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Reseña no encontrada'
      });
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('debería eliminar una reseña existente', async () => {
      const existingReview = { id: '1', productId: '1', userId: '1', rating: 5, comment: 'Excelente producto' };
      
      // Mock para verificar que la reseña existe
      mockDb.findOne.mockResolvedValueOnce(existingReview);
      mockDb.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      const response = await request(app)
        .delete('/api/reviews/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Reseña eliminada correctamente'
      });
    });

    it('debería devolver 404 al intentar eliminar una reseña que no existe', async () => {
      mockDb.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/reviews/999')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Reseña no encontrada'
      });
    });
  });
});