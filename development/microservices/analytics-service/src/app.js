const express = require('express');
const mongoose = require('mongoose');
const { createLogger } = require('./logger');

const logger = createLogger('analytics-service');
const app = express();

// Middleware
app.use(express.json());

// Modelo para datos de análisis
const analyticsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  eventType: String,
  userId: String,
  productId: String,
  orderId: String,
  sessionId: String,
  userAgent: String,
  ipAddress: String,
  pageUrl: String,
  referrer: String,
  deviceType: String,
  browser: String,
  os: String,
  country: String,
  city: String,
  value: mongoose.Schema.Types.Mixed
});

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsSchema);

// Modelo para reportes
const reportSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  query: Object,
  data: Object,
  generatedAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// Ruta para registrar eventos de análisis
app.post('/events', async (req, res) => {
  try {
    const event = new AnalyticsEvent(req.body);
    await event.save();
    logger.info('Evento de análisis registrado', { eventType: event.eventType });
    res.status(201).json({ message: 'Evento registrado correctamente' });
  } catch (error) {
    logger.error('Error al registrar evento de análisis:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener estadísticas básicas
app.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate, eventType } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    if (eventType) {
      filter.eventType = eventType;
    }
    
    // Contar eventos totales
    const totalEvents = await AnalyticsEvent.countDocuments(filter);
    
    // Contar eventos por tipo
    const eventsByType = await AnalyticsEvent.aggregate([
      { $match: filter },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);
    
    // Contar usuarios únicos
    const uniqueUsers = await AnalyticsEvent.distinct('userId', filter);
    
    res.status(200).json({
      totalEvents,
      eventsByType,
      uniqueUsers: uniqueUsers.length
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener datos de productos populares
app.get('/popular-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const popularProducts = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'PRODUCT_VIEW' } },
      { $group: { _id: '$productId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.status(200).json(popularProducts);
  } catch (error) {
    logger.error('Error al obtener productos populares:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener datos de ventas
app.get('/sales-data', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { eventType: 'ORDER_COMPLETED' };
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const salesData = await AnalyticsEvent.aggregate([
      { $match: filter },
      { $group: {
          _id: { 
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          totalSales: { $sum: '$value.amount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.status(200).json(salesData);
  } catch (error) {
    logger.error('Error al obtener datos de ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para generar un reporte personalizado
app.post('/reports', async (req, res) => {
  try {
    const { name, type, description, query } = req.body;
    
    // Ejecutar la consulta
    const data = await AnalyticsEvent.find(query);
    
    // Crear el reporte
    const report = new Report({
      name,
      type,
      description,
      query,
      data
    });
    
    await report.save();
    
    res.status(201).json({
      message: 'Reporte generado correctamente',
      reportId: report._id
    });
  } catch (error) {
    logger.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un reporte específico
app.get('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    res.status(200).json(report);
  } catch (error) {
    logger.error('Error al obtener reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todos los reportes
app.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({}, { data: 0 }).sort({ generatedAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    logger.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para eliminar un reporte
app.delete('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    res.status(200).json({ message: 'Reporte eliminado correctamente' });
  } catch (error) {
    logger.error('Error al eliminar reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'analytics-service' });
});

// Conexión a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flores-victoria-analytics';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Conectado a MongoDB para análisis');
})
.catch((error) => {
  logger.error('Error al conectar a MongoDB para análisis:', error);
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de análisis ejecutándose en el puerto ${PORT}`);
});

module.exports = app;