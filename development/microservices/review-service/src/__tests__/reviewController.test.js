const ReviewController = require('../controllers/reviewController');

// Mock del cliente de base de datos
const mockDb = {
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

describe('ReviewController', () => {
  let reviewController;

  beforeEach(() => {
    reviewController = new ReviewController(mockDb);
    jest.clearAllMocks();
  });

  describe('getAllReviews', () => {
    it('debería obtener todas las reseñas correctamente', async () => {
      const mockReviews = [
        { id: '1', productId: '1', userId: '1', rating: 5, comment: 'Excelente producto' },
        { id: '2', productId: '2', userId: '2', rating: 4, comment: 'Buen producto' }
      ];
      
      mockDb.toArray.mockResolvedValue(mockReviews);

      const req = mockRequest();
      const res = mockResponse();

      await reviewController.getAllReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          reviews: mockReviews
        }
      });
    });

    it('debería manejar errores al obtener reseñas', async () => {
      mockDb.toArray.mockRejectedValue(new Error('Error de base de datos'));

      const req = mockRequest();
      const res = mockResponse();

      await reviewController.getAllReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getReviewById', () => {
    it('debería obtener una reseña por ID correctamente', async () => {
      const mockReview = { id: '1', productId: '1', userId: '1', rating: 5, comment: 'Excelente producto' };
      mockDb.findOne.mockResolvedValue(mockReview);

      const req = mockRequest({ id: '1' } );
      const res = mockResponse();

      await reviewController.getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          review: mockReview
        }
      });
    });

    it('debería devolver 404 si la reseña no existe', async () => {
      mockDb.findOne.mockResolvedValue(null);

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await reviewController.getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Reseña no encontrada'
      });
    });
  });

  describe('createReview', () => {
    it('debería crear una reseña correctamente', async () => {
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
      
      mockDb.insertOne.mockResolvedValue({ insertedId: '1', ...insertedReview });

      const req = mockRequest({}, {}, newReview);
      const res = mockResponse();

      await reviewController.createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reseña creada exitosamente',
        data: {
          review: insertedReview
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteReview = { comment: 'Reseña sin rating' };

      const req = mockRequest({}, {}, incompleteReview);
      const res = mockResponse();

      await reviewController.createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Producto, usuario y calificación son requeridos'
      });
    });
  });

  describe('updateReview', () => {
    it('debería actualizar una reseña correctamente', async () => {
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
      mockDb.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const req = mockRequest({ id: '1' }, {}, { rating: 5, comment: 'Excelente producto actualizado' });
      const res = mockResponse();

      await reviewController.updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reseña actualizada exitosamente',
        data: {
          review: updatedReview
        }
      });
    });

    it('debería devolver 404 al intentar actualizar una reseña que no existe', async () => {
      mockDb.findOne.mockResolvedValue(null);

      const req = mockRequest({ id: '999' }, {}, { rating: 5, comment: 'Excelente producto' });
      const res = mockResponse();

      await reviewController.updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Reseña no encontrada'
      });
    });
  });

  describe('deleteReview', () => {
    it('debería eliminar una reseña correctamente', async () => {
      const existingReview = { id: '1', productId: '1', userId: '1', rating: 5, comment: 'Excelente producto' };
      
      // Mock para verificar que la reseña existe
      mockDb.findOne.mockResolvedValue(existingReview);
      mockDb.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      await reviewController.deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reseña eliminada correctamente'
      });
    });

    it('debería devolver 404 al intentar eliminar una reseña que no existe', async () => {
      mockDb.findOne.mockResolvedValue(null);

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await reviewController.deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Reseña no encontrada'
      });
    });
  });
});