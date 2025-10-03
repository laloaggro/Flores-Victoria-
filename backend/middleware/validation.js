/**
 * Middleware de validación para mejorar la seguridad de las entradas
 */

// Validar ID de MongoDB
const validateId = (req, res, next) => {
  const id = req.params.id;
  
  // Verificar que el ID tenga el formato correcto
  if (!id || typeof id !== 'string' || id.length !== 24) {
    return res.status(400).json({ 
      error: 'ID inválido' 
    });
  }
  
  next();
};

// Validar datos de producto
const validateProduct = (req, res, next) => {
  const { name, description, price, category, imageUrl, stock } = req.body;
  
  // Validar campos requeridos
  if (!name || !description || price === undefined || !category) {
    return res.status(400).json({ 
      error: 'Los campos name, description, price y category son requeridos' 
    });
  }
  
  // Validar tipos de datos
  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ 
      error: 'El nombre debe ser una cadena no vacía' 
    });
  }
  
  if (typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({ 
      error: 'La descripción debe ser una cadena no vacía' 
    });
  }
  
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ 
      error: 'El precio debe ser un número positivo' 
    });
  }
  
  if (typeof category !== 'string' || category.trim().length === 0) {
    return res.status(400).json({ 
      error: 'La categoría debe ser una cadena no vacía' 
    });
  }
  
  // Validar imageUrl si se proporciona
  if (imageUrl && (typeof imageUrl !== 'string' || !isValidUrl(imageUrl))) {
    return res.status(400).json({ 
      error: 'La URL de la imagen no es válida' 
    });
  }
  
  // Validar stock si se proporciona
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))) {
    return res.status(400).json({ 
      error: 'El stock debe ser un número entero no negativo' 
    });
  }
  
  next();
};

// Validar datos de usuario
const validateUser = (req, res, next) => {
  const { username, email, password, phone } = req.body;
  
  // Validar campos requeridos
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Los campos username, email y password son requeridos' 
    });
  }
  
  // Validar username
  if (typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ 
      error: 'El nombre de usuario debe tener al menos 3 caracteres' 
    });
  }
  
  // Validar email
  if (typeof email !== 'string' || !isValidEmail(email)) {
    return res.status(400).json({ 
      error: 'El email no es válido' 
    });
  }
  
  // Validar password
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 6 caracteres' 
    });
  }
  
  // Validar phone si se proporciona
  if (phone && (typeof phone !== 'string' || phone.trim().length === 0)) {
    return res.status(400).json({ 
      error: 'El teléfono debe ser una cadena no vacía' 
    });
  }
  
  next();
};

// Validar datos de login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  // Validar campos requeridos
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Los campos email y password son requeridos' 
    });
  }
  
  // Validar email
  if (typeof email !== 'string' || !isValidEmail(email)) {
    return res.status(400).json({ 
      error: 'El email no es válido' 
    });
  }
  
  // Validar password
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ 
      error: 'La contraseña no puede estar vacía' 
    });
  }
  
  next();
};

// Función auxiliar para validar emails
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función auxiliar para validar URLs
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = {
  validateId,
  validateProduct,
  validateUser,
  validateLogin
};