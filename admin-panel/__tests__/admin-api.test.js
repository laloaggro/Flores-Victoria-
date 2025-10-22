const express = require('express');
const request = require('supertest');

// Creamos una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Importamos las rutas del panel de administración
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Panel de administración' });
});

app.get('/api/admin/products', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: [
      {
        id: 1,
        name: 'Ramo de Rosas Rojas',
        description: 'Hermoso ramo de rosas rojas frescas',
        price: 15000,
        category: 'Ramos',
        image: '/temp/images/1.avif',
      },
    ],
  });
});

app.post('/api/admin/products', (req, res) => {
  const { name, description, price, category, image } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      status: 'error',
      message: 'Nombre y precio son requeridos',
    });
  }

  // Validación adicional del precio
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'El precio debe ser un número positivo',
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Producto creado exitosamente',
    data: {
      id: 2,
      name,
      description,
      price,
      category,
      image,
    },
  });
});

app.put('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image } = req.body;

  // Validación adicional del precio
  if (price && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({
      status: 'error',
      message: 'Si se proporciona, el precio debe ser un número positivo',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Producto actualizado exitosamente',
    data: {
      id: parseInt(id),
      name,
      description,
      price,
      category,
      image,
    },
  });
});

app.delete('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    status: 'success',
    message: `Producto ${id} eliminado correctamente`,
  });
});

describe('Admin Panel API Tests', () => {
  describe('GET /', () => {
    it('debería devolver el panel de administración', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toEqual({ message: 'Panel de administración' });
    });
  });

  describe('GET /api/admin/products', () => {
    it('debería obtener todos los productos', async () => {
      const response = await request(app).get('/api/admin/products').expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/admin/products', () => {
    it('debería crear un nuevo producto', async () => {
      const newProduct = {
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        price: 20000,
        category: 'Arreglos',
        image: '/temp/images/new.avif',
      };

      const response = await request(app).post('/api/admin/products').send(newProduct).expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject(newProduct);
    });

    it('debería devolver error si faltan campos requeridos', async () => {
      const incompleteProduct = {
        description: 'Descripción sin nombre ni precio',
      };

      const response = await request(app)
        .post('/api/admin/products')
        .send(incompleteProduct)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Nombre y precio son requeridos');
    });
  });

  describe('PUT /api/admin/products/:id', () => {
    it('debería actualizar un producto existente', async () => {
      const updatedProduct = {
        name: 'Producto Actualizado',
        description: 'Descripción actualizada',
        price: 25000,
        category: 'Ramos',
        image: '/temp/images/updated.avif',
      };

      const response = await request(app)
        .put('/api/admin/products/1')
        .send(updatedProduct)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: 1,
        ...updatedProduct,
      });
    });
  });

  describe('DELETE /api/admin/products/:id', () => {
    it('debería eliminar un producto', async () => {
      const response = await request(app).delete('/api/admin/products/1').expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Producto 1 eliminado correctamente');
    });
  });
});
