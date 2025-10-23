const express = require('express');
const router = express.Router();

// Importar el catálogo de productos
const {
  getAllProducts,
  getProductsByOccasion,
  getProductsByCategory, 
  getProductsByColor,
  getProductsByPriceRange,
  searchProducts,
  getFeaturedProducts
} = require('../data/catalog');

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

// Rutas específicas (deben ir ANTES de las rutas con parámetros)

// Ruta para obtener productos destacados
router.get('/featured/all', (req, res) => {
  try {
    const featuredProducts = getFeaturedProducts();
    console.log(`✅ Productos destacados obtenidos: ${featuredProducts.length} items`);
    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error('❌ Error al obtener productos destacados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener productos por ocasión específica
router.get('/occasion/:occasion', (req, res) => {
  try {
    const { occasion } = req.params;
    const products = getProductsByOccasion(occasion);
    console.log(`✅ Productos por ocasión '${occasion}': ${products.length} items`);
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos por ocasión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener productos por categoría específica
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const products = getProductsByCategory(category);
    console.log(`✅ Productos por categoría '${category}': ${products.length} items`);
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos por categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para búsqueda de productos
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const products = searchProducts(query);
    console.log(`✅ Búsqueda '${query}': ${products.length} resultados`);
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error en búsqueda de productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todos los productos
router.get('/', (req, res) => {
  try {
    const { 
      occasion, 
      category, 
      color, 
      minPrice, 
      maxPrice, 
      search, 
      featured 
    } = req.query;

    let products = getAllProducts();

    // Aplicar filtros
    if (occasion) {
      products = getProductsByOccasion(occasion);
    }
    
    if (category) {
      products = products.filter((p) => p.category === category);
    }
    
    if (color) {
      products = products.filter((p) => p.colors.includes(color));
    }
    
    if (minPrice || maxPrice) {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || 999;
      products = products.filter((p) => p.price >= min && p.price <= max);
    }
    
    if (search) {
      products = searchProducts(search);
    }
    
    if (featured === 'true') {
      products = products.filter((p) => p.featured === true);
    }

    console.log(`✅ Productos obtenidos: ${products.length} items`);
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un producto por ID (debe ir DESPUÉS de las rutas específicas)
router.get('/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const products = getAllProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log(`✅ Producto ${productId} obtenido del catálogo`);
    res.status(200).json(product);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
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
