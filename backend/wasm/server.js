/**
 * WebAssembly Image Processing Server - Flores Victoria
 * High-performance image processing service using WebAssembly
 * Open Source Project - MIT License
 */

const compression = require('compression');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const multer = require('multer');
const sharp = require('sharp');
const winston = require('winston');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3003;
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE) || 67108864; // 64MB

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'wasm-processor' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'wasm-processor',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

// Service information endpoint
app.get('/info', (req, res) => {
  res.json({
    service: 'Flores Victoria WebAssembly Image Processor',
    version: '1.0.0',
    description: 'High-performance image processing using WebAssembly',
    endpoints: {
      health: 'GET /health',
      info: 'GET /info',
      process: 'POST /process',
      optimize: 'POST /optimize',
      thumbnail: 'POST /thumbnail',
      enhance: 'POST /enhance',
    },
    limits: {
      maxFileSize: MAX_IMAGE_SIZE,
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      maxImageDimensions: '4096x4096',
    },
  });
});

// Image processing endpoint
app.post(
  '/process',
  upload.single('image'),
  [
    body('operations').isArray().withMessage('Operations must be an array'),
    body('operations.*.type')
      .isIn(['resize', 'filters', 'crop', 'edges', 'equalize', 'blur', 'temperature'])
      .withMessage('Invalid operation type'),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
      }

      const operations = JSON.parse(req.body.operations || '[]');
      if (!Array.isArray(operations) || operations.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid operations provided',
        });
      }

      // Process image with Sharp (fallback implementation)
      const result = await processImageWithSharp(req.file.buffer, operations);

      res.json({
        success: true,
        data: {
          width: result.info.width,
          height: result.info.height,
          format: result.info.format,
          size: result.data.length,
          operations: operations.length,
        },
        processing: {
          engine: 'sharp-fallback',
          timestamp: new Date().toISOString(),
        },
      });

      // Set appropriate headers for image response
      res.set({
        'Content-Type': `image/${result.info.format}`,
        'Content-Length': result.data.length,
        'Cache-Control': 'public, max-age=31536000',
      });

      res.end(result.data);
    } catch (error) {
      logger.error('Image processing failed', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        error: 'Image processing failed',
        details: error.message,
      });
    }
  }
);

// Web optimization endpoint
app.post('/optimize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    const maxWidth = parseInt(req.body.maxWidth) || 1920;
    const quality = parseFloat(req.body.quality) || 0.85;

    const result = await sharp(req.file.buffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: Math.round(quality * 100) })
      .toBuffer({ resolveWithObject: true });

    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': result.data.length,
      'Cache-Control': 'public, max-age=31536000',
    });

    res.end(result.data);
  } catch (error) {
    logger.error('Web optimization failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Web optimization failed',
      details: error.message,
    });
  }
});

// Thumbnail generation endpoint
app.post('/thumbnail', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    const size = parseInt(req.body.size) || 300;

    const result = await sharp(req.file.buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85 })
      .toBuffer({ resolveWithObject: true });

    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': result.data.length,
      'Cache-Control': 'public, max-age=31536000',
    });

    res.end(result.data);
  } catch (error) {
    logger.error('Thumbnail generation failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Thumbnail generation failed',
      details: error.message,
    });
  }
});

// Product enhancement endpoint
app.post('/enhance', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    const result = await sharp(req.file.buffer)
      .modulate({
        brightness: 1.05,
        saturation: 1.2,
      })
      .sharpen()
      .normalize()
      .jpeg({ quality: 90 })
      .toBuffer({ resolveWithObject: true });

    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': result.data.length,
      'Cache-Control': 'public, max-age=31536000',
    });

    res.end(result.data);
  } catch (error) {
    logger.error('Product enhancement failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Product enhancement failed',
      details: error.message,
    });
  }
});

// Sharp-based image processing (fallback when WASM is not available)
async function processImageWithSharp(imageBuffer, operations) {
  let pipeline = sharp(imageBuffer);

  for (const operation of operations) {
    switch (operation.type) {
      case 'resize':
        pipeline = pipeline.resize(operation.width, operation.height, {
          fit: 'fill',
        });
        break;

      case 'filters':
        const { brightness = 1, contrast = 1, saturation = 1 } = operation.filters;
        pipeline = pipeline.modulate({
          brightness: brightness + 1,
          saturation,
        });
        if (contrast !== 1) {
          pipeline = pipeline.linear(contrast, -(128 * contrast) + 128);
        }
        if (operation.filters.sharpness > 0) {
          pipeline = pipeline.sharpen();
        }
        break;

      case 'crop':
        const { x, y, width, height } = operation.cropArea;
        pipeline = pipeline.extract({ left: x, top: y, width, height });
        break;

      case 'blur':
        pipeline = pipeline.blur(operation.radius || 2);
        break;

      case 'equalize':
        pipeline = pipeline.normalize();
        break;

      default:
        logger.warn(`Unknown operation type: ${operation.type}`);
    }
  }

  return pipeline.jpeg({ quality: 90 }).toBuffer({ resolveWithObject: true });
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        maxSize: MAX_IMAGE_SIZE,
      });
    }
  }

  logger.error('Unhandled error', { error: error.message, stack: error.stack });
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`WebAssembly Image Processor started on port ${PORT}`, {
    port: PORT,
    maxImageSize: MAX_IMAGE_SIZE,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
