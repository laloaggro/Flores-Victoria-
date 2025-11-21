const fs = require('fs').promises;
const path = require('path');

const multer = require('multer');

const logger = require('../logger');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/products');

    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp + nombre original limpio
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanName}`;
    cb(null, fileName);
  },
});

// Filtro de tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 5, // Máximo 5 archivos por producto
  },
  fileFilter,
});

// Middleware para subir múltiples imágenes
const uploadProductImages = upload.array('images', 5);

// Validador de URLs de imágenes
const validateImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Validar formato de URL básico
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlPattern.test(url)) {
    return false;
  }

  // Validar extensión de imagen
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  return imageExtensions.test(url);
};

// Validar array de URLs de imágenes
const validateImageUrls = (images) => {
  if (!Array.isArray(images)) {
    return { isValid: false, error: 'Las imágenes deben ser un array' };
  }

  if (images.length === 0) {
    return { isValid: false, error: 'Se requiere al menos una imagen' };
  }

  if (images.length > 10) {
    return { isValid: false, error: 'Máximo 10 imágenes por producto' };
  }

  for (let i = 0; i < images.length; i++) {
    if (!validateImageUrl(images[i])) {
      return {
        isValid: false,
        error: `URL de imagen inválida en posición ${i + 1}: ${images[i]}`,
      };
    }
  }

  return { isValid: true };
};

// Middleware para procesar imágenes subidas
const processUploadedImages = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      // Procesar archivos subidos
      const imageUrls = req.files.map((file) => `/uploads/products/${file.filename}`);

      // Agregar URLs al cuerpo de la petición
      req.body.images = imageUrls;
    }

    next();
  } catch (error) {
    logger.error({ service: 'product-service', error: error.message }, 'Error procesando imágenes');
    res.status(500).json({
      error: 'Error procesando imágenes subidas',
      details: error.message,
    });
  }
};

// Middleware para validar imágenes en el cuerpo de la petición
const validateProductImages = (req, res, next) => {
  if (req.body.images) {
    const validation = validateImageUrls(req.body.images);

    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Imágenes inválidas',
        details: validation.error,
      });
    }
  }

  next();
};

// Función para eliminar archivo de imagen
const deleteImageFile = async (imagePath) => {
  try {
    if (imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '../../', imagePath);
      await fs.unlink(fullPath);
      logger.info({ service: 'product-service', imagePath }, 'Imagen eliminada');
    }
  } catch (error) {
    logger.error(
      { service: 'product-service', imagePath, error: error.message },
      'Error eliminando imagen'
    );
  }
};

// Función para limpiar imágenes huérfanas (no usadas)
const cleanupOrphanImages = async (usedImages) => {
  try {
    const uploadsPath = path.join(__dirname, '../../uploads/products');
    const files = await fs.readdir(uploadsPath);

    for (const file of files) {
      const imagePath = `/uploads/products/${file}`;
      if (!usedImages.includes(imagePath)) {
        await deleteImageFile(imagePath);
      }
    }

    logger.info({ service: 'product-service' }, 'Limpieza de imágenes huérfanas completada');
  } catch (error) {
    logger.error(
      { service: 'product-service', error: error.message },
      'Error en limpieza de imágenes'
    );
  }
};

module.exports = {
  uploadProductImages,
  processUploadedImages,
  validateProductImages,
  validateImageUrl,
  validateImageUrls,
  deleteImageFile,
  cleanupOrphanImages,
};
