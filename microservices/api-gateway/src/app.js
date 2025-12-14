const compression = require('compression');
const cors = require('cors');

createIndexes(); // Ejecutar script}  }    console.log('\n🔌 Desconectado de MongoDB');    await mongoose.disconnect();  } finally {    process.exit(1);    console.error('❌ Error creando índices:', error);  } catch (error) {    console.log('\n💡 Tip: Ejecuta db.collection.getIndexes() en MongoDB para verificar');    console.log('✅ Todos los índices creados exitosamente');    }      console.log('');      });        console.log(`  - ${index.name}`);      indexes.forEach((index) => {      console.log(`${collectionName}: ${indexes.length} índices`);      const indexes = await collection.indexes();      const collection = db.collection(collectionName);    for (const collectionName of collections) {    ];      'wishlists',      'reviews',      'occasions',      'categories',      'products',    const collections = [    console.log('\n📊 Verificando índices creados...\n');    // ========================================    // VERIFICACIÓN    // ========================================    console.log('  ✓ Índice wishlist_products creado');    await wishlistsCollection.createIndex({ 'items.productId': 1 }, { name: 'wishlist_products' });    console.log('  ✓ Índice user_wishlist creado');    await wishlistsCollection.createIndex({ userId: 1 }, { unique: true, name: 'user_wishlist' });    const wishlistsCollection = db.collection('wishlists');    console.log('\n💝 Creando índices para wishlists...');    // ========================================    // WISHLISTS (wishlists collection)    // ========================================    console.log('  ✓ Índice rating_approved creado');    await reviewsCollection.createIndex({ rating: 1, approved: 1 }, { name: 'rating_approved' });    console.log('  ✓ Índice user_reviews creado');    await reviewsCollection.createIndex({ userId: 1, createdAt: -1 }, { name: 'user_reviews' });    console.log('  ✓ Índice product_reviews creado');    await reviewsCollection.createIndex({ productId: 1, createdAt: -1 }, { name: 'product_reviews' });    const reviewsCollection = db.collection('reviews');    console.log('\n⭐ Creando índices para reseñas...');    // ========================================    // RESEÑAS (reviews collection)    // ========================================    console.log('  ✓ Índice occasion_active creado');    await occasionsCollection.createIndex({ active: 1 }, { name: 'occasion_active' });    console.log('  ✓ Índice occasion_slug creado');    await occasionsCollection.createIndex({ slug: 1 }, { unique: true, name: 'occasion_slug' });    console.log('  ✓ Índice occasion_name creado');    await occasionsCollection.createIndex({ name: 1 }, { unique: true, name: 'occasion_name' });    const occasionsCollection = db.collection('occasions');    console.log('\n🎉 Creando índices para ocasiones...');    // ========================================    // OCASIONES (occasions collection)    // ========================================    console.log('  ✓ Índice active_order creado');    await categoriesCollection.createIndex({ active: 1, order: 1 }, { name: 'active_order' });    console.log('  ✓ Índice category_slug creado');    await categoriesCollection.createIndex({ slug: 1 }, { unique: true, name: 'category_slug' });    console.log('  ✓ Índice category_name creado');    await categoriesCollection.createIndex({ name: 1 }, { unique: true, name: 'category_name' });    const categoriesCollection = db.collection('categories');    console.log('\n📂 Creando índices para categorías...');    // ========================================    // CATEGORÍAS (categories collection)    // ========================================    console.log('  ✓ Índice low_stock creado');    );      }        partialFilterExpression: { stock: { $lt: 10 } },        name: 'low_stock',      {      { active: 1, stock: 1 },    await productsCollection.createIndex(    // Índice para stock bajo (partial index)    console.log('  ✓ Índice slug_unique creado');    await productsCollection.createIndex({ slug: 1 }, { unique: true, name: 'slug_unique' });    // Índice para slug (URLs amigables)    console.log('  ✓ Índice featured_recent creado');    );      { name: 'featured_recent' }      { featured: 1, createdAt: -1, active: 1 },    await productsCollection.createIndex(    // Índice para productos destacados recientes    console.log('  ✓ Índice popular_products creado');    );      { name: 'popular_products' }      { rating: -1, sales: -1, active: 1 },    await productsCollection.createIndex(    // Índice para productos populares (rating + sales)    console.log('  ✓ Índice occasions_featured creado');    );      { name: 'occasions_featured' }      { occasions: 1, featured: 1, active: 1 },    await productsCollection.createIndex(    // Índice para ocasiones + featured    console.log('  ✓ Índice category_price_active creado');    );      { name: 'category_price_active' }      { category: 1, price: 1, active: 1 },    await productsCollection.createIndex(    // Índice compuesto categoría + precio + activo    console.log('  ✓ Índice único de ID creado');    await productsCollection.createIndex({ id: 1 }, { unique: true, name: 'product_id_unique' });    // Índice único para ID    console.log('  ✓ Índice de búsqueda de texto creado');    );      }        default_language: 'spanish',        weights: { name: 10, category: 5, description: 1 },        name: 'text_search_index',      {      { name: 'text', description: 'text', category: 'text' },    await productsCollection.createIndex(    // Índice de texto para búsqueda    const productsCollection = db.collection('products');    console.log('📦 Creando índices para productos...');    // ========================================    // PRODUCTOS (products collection)    // ========================================    const db = mongoose.connection.db;    console.log('✅ Conexión establecida\n');    await mongoose.connect(MONGODB_URI);    console.log('🔗 Conectando a MongoDB...');  try {async function createIndexes() {const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flores_victoria';require('dotenv').config();const mongoose = require('mongoose'); */ * Usage: node scripts/create-mongodb-indexes.js *  * Ejecutar después de deployment para mejorar performance de queries * Script para crear índices optimizados en MongoDBconst express = require('express');

const {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('../../shared/middleware/health-check');
const { responseTime, optimizeJSON } = require('../../shared/middleware/performance');
const { initRedisClient, publicLimiter } = require('../../shared/middleware/rate-limiter');

const config = require('./config');
const { specs, swaggerUi } = require('./config/swagger');
const logger = require('./logger');
const { requestIdMiddleware, requestLogger } = require('./middleware/request-id');
const routes = require('./routes');

// Inicializar Redis para rate limiting
initRedisClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_RATELIMIT_DB || 2,
});

// Crear aplicación Express
const app = express();

// Health check completo - incluye memoria, CPU, uptime
app.get(
  '/health',
  createHealthCheck({
    serviceName: 'api-gateway',
  })
);

// Liveness check simple
app.get('/live', createLivenessCheck('api-gateway'));

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Flores Victoria API Docs',
  })
);

// Middleware para manejar solicitudes a .well-known
app.use('/.well-known', (req, res) => {
  res.status(404).end();
});

// Middleware CORS
app.use(cors());

// Compression middleware (gzip/deflate)
app.use(
  compression({
    level: 6, // Balance entre velocidad y compresión
    threshold: 1024, // Solo comprimir respuestas > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para asegurar Content-Type en todas las respuestas JSON
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, data);
  };
  next();
});

// Performance monitoring
app.use(responseTime());

// Request ID + logging estructurado
app.use(requestIdMiddleware);
app.use(requestLogger);

// Optimize JSON responses
app.use(optimizeJSON());

// Rate limiting global (público por defecto)
app.use(publicLimiter());

// (Health check ya declarado arriba antes del middleware)

// Helpers: dev-only guard and optional token check for dev tools
function ensureDev(req, res) {
  const env = process.env.NODE_ENV || 'development';
  if (env !== 'development') {
    res.status(403).json({ error: 'Forbidden in non-development environments' });
    return false;
  }
  return true;
}

function devAuth(req, res) {
  const token = process.env.DEV_TOOLS_TOKEN;
  if (!token) return true; // No token configured, allow
  const headerToken = req.headers['x-dev-token'];
  const queryToken = req.query.devToken;
  if (headerToken === token || queryToken === token) return true;
  res.status(401).json({ error: 'Invalid dev token' });
  return false;
}

// Development-only: POST frontend errors
app.post('/api/errors/log', (req, res) => {
  try {
    if (!ensureDev(req, res) || !devAuth(req, res)) return;

    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const filePath = path.join(logDir, `frontend-errors-${dateStr}.log`);
    const entry = {
      ts: now.toISOString(),
      ip: (req.ip || '').replace('::ffff:', ''),
      ua: req.headers['user-agent'],
      url: req.headers.referer || req.headers.origin,
      payload: req.body,
    };

    fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`);
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ service: 'api-gateway', error: e }, 'Error writing error log');
    return res.status(500).json({ error: 'Failed to write error log' });
  }
});

// Development-only: GET recent frontend errors
app.get('/api/errors/recent', (req, res) => {
  try {
    if (!ensureDev(req, res) || !devAuth(req, res)) return;

    const fs = require('fs');
    const path = require('path');
    const { date, limit, offset, q, type } = req.query;
    const dateStr = (date && String(date).slice(0, 10)) || new Date().toISOString().slice(0, 10);
    const logDir = path.join(__dirname, '..', 'logs');
    const filePath = path.join(logDir, `frontend-errors-${dateStr}.log`);

    if (!fs.existsSync(filePath)) {
      return res.json({ date: dateStr, count: 0, entries: [] });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const allLines = raw.split('\n').filter(Boolean);
    const entriesAll = [];
    for (const line of allLines) {
      try {
        entriesAll.push(JSON.parse(line));
      } catch (_) {
        // skip malformed line
      }
    }

    // Filtering by query (q) and type
    const needle = (q || '').toString().trim().toLowerCase();
    const typeFilter = (type || '').toString().trim().toLowerCase();
    const filtered = entriesAll.filter((e) => {
      const eType = (e.payload?.type || e.payload?.errorType || '').toString().toLowerCase();
      const eMsg = (e.payload?.message || e.payload?.errorMessage || '').toString().toLowerCase();
      const eUrl = (e.url || e.payload?.url || '').toString().toLowerCase();
      const matchesType = !typeFilter || eType.includes(typeFilter);
      const matchesQ =
        !needle || eType.includes(needle) || eMsg.includes(needle) || eUrl.includes(needle);
      return matchesType && matchesQ;
    });

    // Pagination: take last n with offset
    const n = Math.max(0, Math.min(parseInt(limit || '50', 10) || 50, 1000));
    const off = Math.max(0, parseInt(offset || '0', 10) || 0);
    const end = Math.max(0, filtered.length - off);
    const start = Math.max(0, end - n);
    const entries = filtered.slice(start, end);

    return res.json({
      date: dateStr,
      total: filtered.length,
      count: entries.length,
      offset: off,
      entries,
    });
  } catch (e) {
    logger.error({ service: 'api-gateway', error: e }, 'Error reading error logs');
    return res.status(500).json({ error: 'Failed to read error logs' });
  }
});

// Development-only: Download error logs as CSV or JSON
app.get('/api/errors/download', (req, res) => {
  try {
    if (!ensureDev(req, res) || !devAuth(req, res)) return;

    const fs = require('fs');
    const path = require('path');
    const { date, format, q, type } = req.query;
    const dateStr = (date && String(date).slice(0, 10)) || new Date().toISOString().slice(0, 10);
    const logDir = path.join(__dirname, '..', 'logs');
    const filePath = path.join(logDir, `frontend-errors-${dateStr}.log`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'No log file found for specified date' });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    const all = [];
    for (const line of lines) {
      try {
        all.push(JSON.parse(line));
      } catch (_) {
        // skip malformed line
      }
    }

    // Apply filters if provided
    const needle = (q || '').toString().trim().toLowerCase();
    const typeFilter = (type || '').toString().trim().toLowerCase();
    const entries = all.filter((e) => {
      const eType = (e.payload?.type || e.payload?.errorType || '').toString().toLowerCase();
      const eMsg = (e.payload?.message || e.payload?.errorMessage || '').toString().toLowerCase();
      const eUrl = (e.url || e.payload?.url || '').toString().toLowerCase();
      const matchesType = !typeFilter || eType.includes(typeFilter);
      const matchesQ =
        !needle || eType.includes(needle) || eMsg.includes(needle) || eUrl.includes(needle);
      return matchesType && matchesQ;
    });

    const fmt = (format || 'json').toLowerCase();

    if (fmt === 'csv') {
      // Generate CSV
      const header = 'timestamp,ip,userAgent,url,errorType,errorMessage\n';
      const rows = entries
        .map((e) => {
          const ts = e.ts || '';
          const ip = (e.ip || '').replace(/"/g, '""');
          const ua = (e.ua || '').replace(/"/g, '""');
          // Prefer top-level url field if present, else fallback to payload.url
          const url = (e.url || e.payload?.url || '').replace(/"/g, '""');
          // Support multiple payload shapes: {type,message} or {errorType,errorMessage}
          const type = (e.payload?.type || e.payload?.errorType || 'error').replace(/"/g, '""');
          const msg = (e.payload?.message || e.payload?.errorMessage || '')
            .replace(/"/g, '""')
            .replace(/\n/g, ' ');
          return `"${ts}","${ip}","${ua}","${url}","${type}","${msg}"`;
        })
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="frontend-errors-${dateStr}.csv"`);
      return res.send(header + rows);
    } else {
      // JSON format (default)
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="frontend-errors-${dateStr}.json"`
      );
      return res.json({ date: dateStr, count: entries.length, entries });
    }
  } catch (e) {
    logger.error({ service: 'api-gateway', error: e }, 'Error downloading error logs');
    return res.status(500).json({ error: 'Failed to download error logs' });
  }
});

// Development-only: list available log dates (optionally include counts)
app.get('/api/errors/dates', (req, res) => {
  try {
    if (!ensureDev(req, res) || !devAuth(req, res)) return;

    const fs = require('fs');
    const path = require('path');
    const { includeCounts } = req.query;
    const withCounts =
      String(includeCounts || '').toLowerCase() === '1' ||
      String(includeCounts || '').toLowerCase() === 'true';

    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
      return res.json({ dates: [] });
    }

    const files = fs.readdirSync(logDir);
    const dates = [];
    for (const f of files) {
      const m = f.match(/^frontend-errors-(\d{4}-\d{2}-\d{2})\.log$/);
      if (m) {
        const d = m[1];
        if (withCounts) {
          try {
            const raw = fs.readFileSync(path.join(logDir, f), 'utf8');
            const count = raw.split('\n').filter(Boolean).length;
            dates.push({ date: d, count });
          } catch (_) {
            dates.push({ date: d, count: 0 });
          }
        } else {
          dates.push(d);
        }
      }
    }

    // Sort descending (newest first)
    dates.sort((a, b) => {
      const da = typeof a === 'string' ? a : a.date;
      const db = typeof b === 'string' ? b : b.date;
      return db.localeCompare(da);
    });

    return res.json({ dates });
  } catch (e) {
    logger.error({ service: 'api-gateway', error: e }, 'Error listing error log dates');
    return res.status(500).json({ error: 'Failed to list error log dates' });
  }
});

// Development-only: delete log files older than N days
app.delete('/api/errors/older-than', (req, res) => {
  try {
    if (!ensureDev(req, res) || !devAuth(req, res)) return;

    const fs = require('fs');
    const path = require('path');
    const days = parseInt(req.query.days || '0', 10);
    if (Number.isNaN(days) || days < 0) {
      return res.status(400).json({ error: 'days must be a non-negative integer' });
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
      return res.json({ deleted: [], kept: [], days, cutoff: cutoff.toISOString() });
    }

    const files = fs.readdirSync(logDir);
    const deleted = [];
    const kept = [];
    for (const f of files) {
      const m = f.match(/^frontend-errors-(\d{4}-\d{2}-\d{2})\.log$/);
      if (!m) continue;
      const dStr = m[1];
      const d = new Date(`${dStr}T00:00:00Z`);
      if (d < cutoff) {
        try {
          fs.unlinkSync(path.join(logDir, f));
          deleted.push(f);
        } catch (_) {
          kept.push(f);
        }
      } else {
        kept.push(f);
      }
    }

    return res.json({ days, cutoff: cutoff.toISOString(), deleted, kept });
  } catch (e) {
    logger.error({ service: 'api-gateway', error: e }, 'Error deleting old error logs');
    return res.status(500).json({ error: 'Failed to delete old error logs' });
  }
});

// Development-only: List AI-generated images from cache
app.get('/api/ai-images/list', (req, res) => {
  try {
    if (!ensureDev(req, res) || !devAuth(req, res)) return;

    const fs = require('fs');
    const path = require('path');
    const cacheDir = path.join(__dirname, '..', 'ai-cache', 'images');

    if (!fs.existsSync(cacheDir)) {
      return res.json({ images: [], total: 0, cacheDir });
    }

    const files = fs.readdirSync(cacheDir);
    const images = [];

    for (const filename of files) {
      // Skip symlinks and directories
      const fullPath = path.join(cacheDir, filename);
      const stat = fs.lstatSync(fullPath);
      if (stat.isSymbolicLink() || stat.isDirectory()) continue;

      // Parse filename: victoria-{flower}-{number}-{variant}.{ext}
      const match = filename.match(
        /^victoria-([^-]+)-(\d+)(?:-v\d+)?(?:-(thumb|medium))?\.(webp|png)$/i
      );
      if (!match) continue;

      const [, flowerType, number, size, format] = match;

      // Get image dimensions using basic file info
      const width = 0;
      const height = 0;

      images.push({
        filename,
        flowerType,
        number,
        size: size || 'full',
        format: format.toLowerCase(),
        fileSize: stat.size,
        modifiedDate: stat.mtime.toISOString(),
        url: `/api/ai-images/serve/${filename}`,
        width,
        height,
      });
    }

    // Sort by flower type, then number, then size
    images.sort((a, b) => {
      if (a.flowerType !== b.flowerType) return a.flowerType.localeCompare(b.flowerType);
      if (a.number !== b.number) return parseInt(a.number) - parseInt(b.number);
      const sizeOrder = { thumb: 1, medium: 2, full: 3 };
      return (sizeOrder[a.size] || 3) - (sizeOrder[b.size] || 3);
    });

    return res.json({
      images,
      total: images.length,
      cacheDir,
    });
  } catch (e) {
    logger.error({ service: 'api-gateway', error: e }, 'Error listing AI images');
    return res.status(500).json({ error: 'Failed to list AI images' });
  }
});

// Development-only: Serve AI image from cache
app.get('/api/ai-images/serve/:filename', (req, res) => {
  try {
    if (!ensureDev(req, res) || !devAuth(req, res)) return;

    const fs = require('fs');
    const path = require('path');
    const { filename } = req.params;

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const cacheDir = path.join(__dirname, '..', 'ai-cache', 'images');
    const filePath = path.join(cacheDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return res.status(400).json({ error: 'Not a file' });
    }

    // Set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (e) {
    logger.error({ service: 'api-gateway', error: e }, 'Error serving AI image');
    return res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Readiness check mejorado - verifica servicios críticos
app.get(
  '/ready',
  createReadinessCheck({
    serviceName: 'api-gateway',
    customChecks: [
      {
        name: 'auth-service',
        check: async () => {
          try {
            const response = await fetch(`${config.services.auth}/health`, {
              method: 'GET',
              timeout: 2000,
            });
            return response.ok;
          } catch {
            return false;
          }
        },
      },
      {
        name: 'product-service',
        check: async () => {
          try {
            const response = await fetch(`${config.services.product}/health`, {
              method: 'GET',
              timeout: 2000,
            });
            return response.ok;
          } catch {
            return false;
          }
        },
      },
    ],
  })
);

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: '1.0.0',
  });
});

// Rutas
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway - Arreglos Victoria',
    version: '1.0.0',
  });
});

// 404 JSON handler (después de todas las rutas)
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada',
    requestId: req.id,
    path: req.originalUrl || req.url,
  });
});

// Error-handling middleware JSON

app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message =
    err.expose || (status >= 400 && status < 500)
      ? err.message || 'Solicitud inválida'
      : 'Error interno del servidor';
  res.status(status).json({
    status: status >= 500 ? 'error' : 'fail',
    message,
    requestId: req.id,
  });
});

// 404 para rutas no encontradas bajo /api (respuesta JSON consistente)
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada',
    requestId: req.id,
  });
});

// Manejador de errores global (siempre JSON)

app.use((err, req, res, _next) => {
  const status = typeof err.status === 'number' ? err.status : 500;
  const isServer = status >= 500;
  const payload = {
    status: isServer ? 'error' : 'fail',
    message: err.message || (isServer ? 'Error interno del servidor' : 'Solicitud inválida'),
    requestId: req.id,
  };
  // Adjuntar detalles en desarrollo para facilitar debugging
  if ((process.env.NODE_ENV || 'development') === 'development' && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
});

module.exports = app;
