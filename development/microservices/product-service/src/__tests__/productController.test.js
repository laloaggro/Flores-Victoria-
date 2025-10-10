const ProductController = require('../controllers/productController');
const Product = require('../models/Product');

// Mock de la base de datos
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
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

describe('ProductController', () => {
  let productController;
  let productModel;

  beforeEach(() => {
    productModel = new Product(mockDb);
    productController = new ProductController(mockDb);
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('debería obtener todos los productos correctamente', async () => {
      const mockProducts = [
        { id: '1', name: 'Producto 1', price: 100 },
        { id: '2', name: 'Producto 2', price: 200 }
      ];
      
      mockDb.toArray.mockResolvedValue(mockProducts);

      const req = mockRequest();
      const res = mockResponse();

      await productController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          products: mockProducts
        }
      });
    });

    it('debería manejar errores al obtener productos', async () => {
      mockDb.toArray.mockRejectedValue(new Error('Error de base de datos'));

      const req = mockRequest();
      const res = mockResponse();

      await productController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getProductById', () => {
    it('debería obtener un producto por ID correctamente', async () => {
      const mockProduct = { id: '1', name: 'Producto 1', price: 100 };
      mockDb.findOne.mockResolvedValue(mockProduct);

      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          product: mockProduct
        }
      });
    });

    it('debería devolver 404 si el producto no existe', async () => {
      mockDb.findOne.mockResolvedValue(null);

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Producto no encontrado'
      });
    });
  });

  describe('createProduct', () => {
    it('debería crear un producto correctamente', async () => {
      const newProduct = { 
        name: 'Nuevo Producto', 
        price: 150,
        description: 'Descripción del producto'
      };
      
      const insertedProduct = { 
        id: '1', 
        ...newProduct, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      mockDb.insertOne.mockResolvedValue({ insertedId: '1', ...insertedProduct });

      const req = mockRequest({}, {}, newProduct);
      const res = mockResponse();

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Producto creado exitosamente',
        data: {
          product: insertedProduct
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteProduct = { description: 'Producto sin nombre ni precio' };

      const req = mockRequest({}, {}, incompleteProduct);
      const res = mockResponse();

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Nombre y precio son requeridos'
      });
    });
  });

  describe('updateProduct', () => {
    it('debería actualizar un producto correctamente', async () => {
      const existingProduct = { id: '1', name: 'Producto Existente', price: 100 };
      const updatedProduct = { 
        id: '1', 
        name: 'Producto Actualizado', 
        price: 200,
        updatedAt: new Date()
      };
      
      // Mock para verificar que el producto existe
      mockDb.findOne.mockResolvedValueOnce(existingProduct).mockResolvedValueOnce(updatedProduct);
      mockDb.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const req = mockRequest({ id: '1' }, {}, { name: 'Producto Actualizado', price: 200 });
      const res = mockResponse();

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Producto actualizado exitosamente',
        data: {
          product: updatedProduct
        }
      });
    });

    it('debería devolver 404 al intentar actualizar un producto que no existe', async () => {
      mockDb.findOne.mockResolvedValue(null);

      const req = mockRequest({ id: '999' }, {}, { name: 'Producto Actualizado' });
      const res = mockResponse();

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Producto no encontrado'
      });
    });
  });

  describe('deleteProduct', () => {
    it('debería eliminar un producto correctamente', async () => {
      const existingProduct = { id: '1', name: 'Producto a Eliminar', price: 100 };
      
      // Mock para verificar que el producto existe
      mockDb.findOne.mockResolvedValue(existingProduct);
      mockDb.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Producto eliminado correctamente'
      });
    });

    it('debería devolver 404 al intentar eliminar un producto que no existe', async () => {
      mockDb.findOne.mockResolvedValue(null);

      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Producto no encontrado'
      });
    });
  });
});