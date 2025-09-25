const Product = require('../models/Product');

/**
 * Controlador de productos
 */
class ProductController {
  constructor(db) {
    this.productModel = new Product(db);
  }

  /**
   * Obtener todos los productos
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      
      // Construir filtros
      const filters = {};
      if (category) {
        filters.category = category;
      }
      if (search) {
        filters.name = { $regex: search, $options: 'i' };
      }

      const products = await this.productModel.findAll(filters, { page, limit });
      
      res.status(200).json({
        status: 'success',
        data: {
          products
        }
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener producto por ID
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      
      const product = await this.productModel.findById(id);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          product
        }
      });
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear un nuevo producto
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async createProduct(req, res) {
    try {
      const productData = req.body;
      
      // Validar datos requeridos
      if (!productData.name || !productData.price) {
        return res.status(400).json({
          status: 'error',
          message: 'Nombre y precio son requeridos'
        });
      }
      
      const product = await this.productModel.create(productData);
      
      res.status(201).json({
        status: 'success',
        message: 'Producto creado exitosamente',
        data: {
          product
        }
      });
    } catch (error) {
      console.error('Error creando producto:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar un producto
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Verificar si el producto existe
      const existingProduct = await this.productModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado'
        });
      }
      
      const product = await this.productModel.update(id, updateData);
      
      res.status(200).json({
        status: 'success',
        message: 'Producto actualizado exitosamente',
        data: {
          product
        }
      });
    } catch (error) {
      console.error('Error actualizando producto:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar un producto
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el producto existe
      const existingProduct = await this.productModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado'
        });
      }
      
      await this.productModel.delete(id);
      
      res.status(200).json({
        status: 'success',
        message: 'Producto eliminado correctamente'
      });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = ProductController;