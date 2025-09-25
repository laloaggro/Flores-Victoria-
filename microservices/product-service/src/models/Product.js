const { ObjectId } = require('mongodb');

/**
 * Modelo de producto para el servicio de productos
 */
class Product {
  constructor(db) {
    this.collection = db.collection('products');
  }

  /**
   * Crear un nuevo producto
   * @param {object} productData - Datos del producto
   * @returns {object} Producto creado
   */
  async create(productData) {
    const product = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(product);
    return { id: result.insertedId, ...product };
  }

  /**
   * Obtener todos los productos
   * @param {object} filters - Filtros de búsqueda
   * @param {object} options - Opciones de paginación
   * @returns {array} Lista de productos
   */
  /**
   * Obtener todos los productos
   * @param {object} filters - Filtros de búsqueda
   * @param {object} options - Opciones de paginación
   * @returns {array} Lista de productos
   */
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Asegurarse de que los filtros sean un objeto válido
    const queryFilters = filters && typeof filters === 'object' ? filters : {};

    const products = await this.collection
      .find(queryFilters)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Mapear productos para convertir _id a id
    return products.map(product => {
      const mappedProduct = { ...product };
      if (product._id) {
        mappedProduct.id = product._id.toString();
        delete mappedProduct._id;
      }
      return mappedProduct;
    });
  }

  /**
   * Obtener producto por ID
   * @param {string} id - ID del producto
   * @returns {object|null} Producto encontrado o null
   */
  async findById(id) {
    // Verificar si el ID es un ObjectId válido
    if (!ObjectId.isValid(id)) {
      return null;
    }
    
    const product = await this.collection.findOne({ _id: new ObjectId(id) });
    
    if (product) {
      return {
        ...product,
        id: product._id.toString(),
        _id: undefined
      };
    }
    
    return null;
  }

  /**
   * Actualizar un producto
   * @param {string} id - ID del producto
   * @param {object} updateData - Datos a actualizar
   * @returns {object} Producto actualizado
   */
  async update(id, updateData) {
    // Verificar si el ID es un ObjectId válido
    if (!ObjectId.isValid(id)) {
      throw new Error('ID de producto no válido');
    }
    
    const updatedProduct = {
      ...updateData,
      updatedAt: new Date()
    };

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProduct }
    );

    const product = await this.findById(id);
    return product;
  }

  /**
   * Eliminar un producto
   * @param {string} id - ID del producto
   * @returns {object} Resultado de la eliminación
   */
  async delete(id) {
    // Verificar si el ID es un ObjectId válido
    if (!ObjectId.isValid(id)) {
      throw new Error('ID de producto no válido');
    }
    
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }

  /**
   * Contar productos con filtros
   * @param {object} filters - Filtros de búsqueda
   * @returns {number} Número de productos
   */
  async count(filters = {}) {
    return await this.collection.countDocuments(filters);
  }
}

module.exports = Product;