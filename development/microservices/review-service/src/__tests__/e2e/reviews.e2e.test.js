const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Importar la aplicación real
const app = require('../../app');

// Configurar MongoDB en memoria para pruebas E2E
let mongoServer;

beforeAll(async () => {
  // Crear un servidor MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Conectar a la base de datos en memoria
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Desconectar y detener el servidor MongoDB en memoria
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Review Service E2E Tests', () => {
  beforeEach(async () => {
    // Limpiar la base de datos antes de cada prueba
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('POST /api/reviews', () => {
    it('debería crear una nueva reseña correctamente', async () => {
      const newReview = {
        productId: '1',
        userId: '1', 
        rating: 5,
        comment: 'Excelente producto'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(newReview)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Reseña creada exitosamente');
      expect(response.body.data.review).toMatchObject({
        productId: newReview.productId,
        userId: newReview.userId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      expect(response.body.data.review.id).toBeDefined();
    });

    it('debería devolver error 400 si los datos requeridos están ausentes', async () => {
      const incompleteReview = {
        comment: 'Reseña sin datos requeridos'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(incompleteReview)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Producto, usuario y calificación son requeridos');
    });
  });

  describe('GET /api/reviews', () => {
    it('debería obtener una lista de reseñas', async () => {
      // Crear algunas reseñas de prueba
      const review1 = {
        productId: '1',
        userId: '1', 
        rating: 5,
        comment: 'Excelente producto'
      };

      const review2 = {
        productId: '2',
        userId: '2', 
        rating: 4,
        comment: 'Buen producto'
      };

      // Crear las reseñas en la base de datos
      await request(app)
        .post('/api/reviews')
        .send(review1)
        .expect(201);

      await request(app)
        .post('/api/reviews')
        .send(review2)
        .expect(201);

      // Obtener la lista de reseñas
      const response = await request(app)
        .get('/api/reviews')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.reviews).toHaveLength(2);
      expect(response.body.data.reviews[0]).toMatchObject(review1);
      expect(response.body.data.reviews[1]).toMatchObject(review2);
    });
  });

  describe('GET /api/reviews/:id', () => {
    it('debería obtener una reseña por ID', async () => {
      // Crear una reseña de prueba
      const newReview = {
        productId: '1',
        userId: '1', 
        rating: 5,
        comment: 'Excelente producto'
      };

      const createResponse = await request(app)
        .post('/api/reviews')
        .send(newReview)
        .expect(201);

      const reviewId = createResponse.body.data.review.id;

      // Obtener la reseña por ID
      const response = await request(app)
        .get(`/api/reviews/${reviewId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.review).toMatchObject(newReview);
      expect(response.body.data.review.id).toBe(reviewId);
    });

    it('debería devolver 404 si la reseña no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011'; // ID de MongoDB válido pero no existente

      const response = await request(app)
        .get(`/api/reviews/${nonExistentId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Reseña no encontrada');
    });
  });

  describe('PUT /api/reviews/:id', () => {
    it('debería actualizar una reseña existente', async () => {
      // Crear una reseña de prueba
      const newReview = {
        productId: '1',
        userId: '1', 
        rating: 3,
        comment: 'Producto regular'
      };

      const createResponse = await request(app)
        .post('/api/reviews')
        .send(newReview)
        .expect(201);

      const reviewId = createResponse.body.data.review.id;

      // Actualizar la reseña
      const updatedReview = {
        rating: 5,
        comment: 'Excelente producto actualizado'
      };

      const response = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .send(updatedReview)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.review).toMatchObject({
        productId: newReview.productId,
        userId: newReview.userId,
        rating: updatedReview.rating,
        comment: updatedReview.comment
      });
      expect(response.body.data.review.id).toBe(reviewId);
    });

    it('debería devolver 404 al intentar actualizar una reseña que no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updatedReview = {
        rating: 5,
        comment: 'Excelente producto'
      };

      const response = await request(app)
        .put(`/api/reviews/${nonExistentId}`)
        .send(updatedReview)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Reseña no encontrada');
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('debería eliminar una reseña existente', async () => {
      // Crear una reseña de prueba
      const newReview = {
        productId: '1',
        userId: '1', 
        rating: 5,
        comment: 'Excelente producto'
      };

      const createResponse = await request(app)
        .post('/api/reviews')
        .send(newReview)
        .expect(201);

      const reviewId = createResponse.body.data.review.id;

      // Eliminar la reseña
      const response = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Reseña eliminada correctamente');

      // Verificar que la reseña ya no existe
      await request(app)
        .get(`/api/reviews/${reviewId}`)
        .expect(404);
    });

    it('debería devolver 404 al intentar eliminar una reseña que no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/reviews/${nonExistentId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Reseña no encontrada');
    });
  });
});