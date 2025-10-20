/**
 * Product Utilities / Utilidades de Productos
 * Helper functions for product operations
 * Funciones auxiliares para operaciones de productos
 */

/**
 * Calculate discount / Calcular descuento
 * Applies percentage discount to a price
 * Aplica descuento porcentual a un precio
 * 
 * @param {number} price - Original price / Precio original
 * @param {number} discountPercent - Discount percentage (0-100) / Porcentaje de descuento (0-100)
 * @returns {number} - Final price after discount / Precio final después del descuento
 */
const calculateDiscount = (price, discountPercent) => {
  if (price < 0 || discountPercent < 0) {
    throw new Error('Price and discount must be positive / Precio y descuento deben ser positivos');
  }
  
  const discountAmount = (price * discountPercent) / 100;
  return price - discountAmount;
};

/**
 * Format product / Formatear producto
 * Formats product data for consistent API responses
 * Formatea datos de producto para respuestas API consistentes
 * 
 * @param {Object} product - Raw product data / Datos crudos del producto
 * @returns {Object} - Formatted product / Producto formateado
 */
const formatProduct = (product) => {
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid product data / Datos de producto inválidos');
  }

  const price = parseFloat(product.price) || 0;

  return {
    id: product._id || product.id,
    name: product.name || 'Unknown',
    description: product.description || '',
    price: price,
    formattedPrice: `$${price.toFixed(2)}`,
    category: product.category || 'uncategorized',
    stock: parseInt(product.stock) || 0,
    images: Array.isArray(product.images) ? product.images : [],
    createdAt: product.createdAt || new Date(),
    updatedAt: product.updatedAt || new Date()
  };
};

/**
 * Validate product data / Validar datos de producto
 * Checks if product data meets requirements
 * Verifica si los datos del producto cumplen los requisitos
 * 
 * @param {Object} product - Product data to validate / Datos del producto a validar
 * @returns {Object} - Validation result / Resultado de validación
 */
const validateProduct = (product) => {
  const errors = [];

  if (!product.name || product.name.trim().length < 3) {
    errors.push('Product name must be at least 3 characters / El nombre del producto debe tener al menos 3 caracteres');
  }

  if (!product.price || product.price <= 0) {
    errors.push('Product price must be greater than 0 / El precio del producto debe ser mayor que 0');
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push('Product must have a category / El producto debe tener una categoría');
  }

  if (product.stock !== undefined && product.stock < 0) {
    errors.push('Stock cannot be negative / El stock no puede ser negativo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate stock status / Calcular estado de stock
 * Determines stock availability level
 * Determina el nivel de disponibilidad de stock
 * 
 * @param {number} stock - Current stock quantity / Cantidad actual en stock
 * @returns {string} - Stock status / Estado del stock
 */
const getStockStatus = (stock) => {
  if (stock <= 0) return 'out_of_stock'; // Sin stock
  if (stock <= 5) return 'low_stock';    // Stock bajo
  if (stock <= 20) return 'medium_stock'; // Stock medio
  return 'in_stock';                      // En stock
};

/**
 * Generate product slug / Generar slug de producto
 * Creates URL-friendly slug from product name
 * Crea slug amigable para URL desde el nombre del producto
 * 
 * @param {string} name - Product name / Nombre del producto
 * @returns {string} - URL-friendly slug / Slug amigable para URL
 */
const generateSlug = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Name must be a valid string / El nombre debe ser un string válido');
  }

  return name
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

module.exports = {
  calculateDiscount,
  formatProduct,
  validateProduct,
  getStockStatus,
  generateSlug
};
