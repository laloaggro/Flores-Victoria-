const express = require('express');
const router = express.Router();
// Corrigiendo las rutas de importación de los módulos compartidos
const logger = require('@flores-victoria/logging');

const { traceMiddleware } = require('../../../shared/tracing/index.js');

// Ruta para crear un producto
router.post('/', async (req, res) => {
  try {
    const { name, price, category, description, images, quantity } = req.body;

    // Crear un nuevo producto
    const newProduct = new Product({
      name,
      price,
      category,
      description,
      images,
      quantity,
    });

    // Guardar en la base de datos
    const savedProduct = await newProduct.save();

    logger.info('Producto creado', { productId: savedProduct.id });
    res.status(201).json(savedProduct);
  } catch (error) {
    logger.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try {
    // Obtener productos de la base de datos
    const products = await Product.find({});

    logger.info('Productos obtenidos de la base de datos');
    res.status(200).json(products);
  } catch (error) {
    logger.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Obtener producto de la base de datos
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    logger.info(`Producto ${productId} obtenido de la base de datos`);
    res.status(200).json(product);
  } catch (error) {
    logger.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para actualizar un producto
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // Actualizar producto en la base de datos
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    logger.info(`Producto ${productId} actualizado`);
    res.status(200).json(updatedProduct);
  } catch (error) {
    logger.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Eliminar producto de la base de datos
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    logger.info(`Producto ${productId} eliminado`);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    logger.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
