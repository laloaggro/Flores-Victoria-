const Product = require('../models/Product');

// Mock de la colección de MongoDB
const mockCollection = {
  insertOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
};

// Mock de la base de datos
const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
};

describe('Product Model', () => {
  let productModel;

  beforeEach(() => {
    productModel = new Product(mockDb);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un nuevo producto', async () => {
      const productData = {
        name: 'Producto de prueba',
        price: 100,
        description: 'Descripción de prueba',
      };

      const insertedProduct = {
        _id: '12345',
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: '12345', ...insertedProduct });

      const result = await productModel.create(productData);

      expect(mockDb.collection).toHaveBeenCalledWith('products');
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        ...productData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual({ id: '12345', ...insertedProduct });
    });
  });

  describe('findAll', () => {
    it('debería obtener todos los productos con filtros y paginación', async () => {
      const mockProducts = [
        { _id: '1', name: 'Producto 1', price: 100 },
        { _id: '2', name: 'Producto 2', price: 200 },
      ];

      const expectedProducts = [
        { id: '1', name: 'Producto 1', price: 100 },
        { id: '2', name: 'Producto 2', price: 200 },
      ];

      mockCollection.toArray.mockResolvedValue(mockProducts);

      const filters = { category: 'ramos' };
      const options = { page: 1, limit: 10 };

      const result = await productModel.findAll(filters, options);

      expect(mockDb.collection).toHaveBeenCalledWith('products');
      expect(mockCollection.find).toHaveBeenCalledWith(filters);
      expect(mockCollection.skip).toHaveBeenCalledWith(0);
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(mockCollection.toArray).toHaveBeenCalled();
      expect(result).toEqual(expectedProducts);
    });

    it('debería manejar correctamente cuando no se proporcionan filtros', async () => {
      const mockProducts = [{ _id: '1', name: 'Producto 1', price: 100 }];

      const expectedProducts = [{ id: '1', name: 'Producto 1', price: 100 }];

      mockCollection.toArray.mockResolvedValue(mockProducts);

      const result = await productModel.findAll();

      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('findById', () => {
    it('debería encontrar un producto por ID', async () => {
      const mockProduct = { _id: '12345', name: 'Producto de prueba', price: 100 };
      const expectedProduct = { id: '12345', name: 'Producto de prueba', price: 100 };

      mockCollection.findOne.mockResolvedValue(mockProduct);

      const result = await productModel.findById('12345');

      expect(mockDb.collection).toHaveBeenCalledWith('products');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: '12345' });
      expect(result).toEqual(expectedProduct);
    });

    it('debería devolver null si el producto no existe', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await productModel.findById('12345');

      expect(result).toBeNull();
    });

    it('debería devolver null si el ID no es válido', async () => {
      const result = await productModel.findById('invalid-id');

      expect(result).toBeNull();
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debería actualizar un producto', async () => {
      const updateData = { name: 'Producto actualizado', price: 150 };
      const updatedProduct = {
        _id: '12345',
        ...updateData,
        updatedAt: new Date(),
      };

      const expectedProduct = {
        id: '12345',
        ...updateData,
        updatedAt: expect.any(Date),
      };

      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCollection.findOne.mockResolvedValue(updatedProduct);

      const result = await productModel.update('12345', updateData);

      expect(mockDb.collection).toHaveBeenCalledWith('products');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: '12345' },
        { $set: { ...updateData, updatedAt: expect.any(Date) } }
      );
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: '12345' });
      expect(result).toEqual(expectedProduct);
    });

    it('debería lanzar un error si el ID no es válido', async () => {
      await expect(productModel.update('invalid-id', { name: 'Producto' })).rejects.toThrow(
        'ID de producto no válido'
      );
    });
  });

  describe('delete', () => {
    it('debería eliminar un producto', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await productModel.delete('12345');

      expect(mockDb.collection).toHaveBeenCalledWith('products');
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: '12345' });
      expect(result).toEqual({ deletedCount: 1 });
    });

    it('debería lanzar un error si el ID no es válido', async () => {
      await expect(productModel.delete('invalid-id')).rejects.toThrow('ID de producto no válido');
    });
  });

  describe('count', () => {
    it('debería contar productos con filtros', async () => {
      mockCollection.countDocuments.mockResolvedValue(5);

      const filters = { category: 'ramos' };
      const result = await productModel.count(filters);

      expect(mockDb.collection).toHaveBeenCalledWith('products');
      expect(mockCollection.countDocuments).toHaveBeenCalledWith(filters);
      expect(result).toBe(5);
    });
  });
});
