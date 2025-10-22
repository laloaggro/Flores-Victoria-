const express = require('express');
const mongoose = require('mongoose');

const { createLogger } = require('./logger');

const logger = createLogger('audit-service');
const app = express();

// Middleware
app.use(express.json());

// Modelo de auditoría
const auditSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  service: String,
  action: String,
  userId: String,
  resourceId: String,
  resourceType: String,
  details: Object,
  ipAddress: String,
  userAgent: String,
});

const Audit = mongoose.model('Audit', auditSchema);

// Ruta para registrar eventos de auditoría
app.post('/audit', async (req, res) => {
  try {
    const auditEvent = new Audit(req.body);
    await auditEvent.save();
    logger.info('Evento de auditoría registrado', {
      service: auditEvent.service,
      action: auditEvent.action,
    });
    res.status(201).json({ message: 'Evento de auditoría registrado correctamente' });
  } catch (error) {
    logger.error('Error al registrar evento de auditoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener eventos de auditoría
app.get('/audit', async (req, res) => {
  try {
    const { service, action, userId, resourceId, startDate, endDate, limit = 50 } = req.query;
    const filter = {};

    if (service) filter.service = service;
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (resourceId) filter.resourceId = resourceId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const auditEvents = await Audit.find(filter).sort({ timestamp: -1 }).limit(parseInt(limit));

    res.status(200).json(auditEvents);
  } catch (error) {
    logger.error('Error al obtener eventos de auditoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un evento de auditoría específico
app.get('/audit/:id', async (req, res) => {
  try {
    const auditEvent = await Audit.findById(req.params.id);
    if (!auditEvent) {
      return res.status(404).json({ error: 'Evento de auditoría no encontrado' });
    }
    res.status(200).json(auditEvent);
  } catch (error) {
    logger.error('Error al obtener evento de auditoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Conexión a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flores-victoria-audit';
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('Conectado a MongoDB para auditoría');
  })
  .catch((error) => {
    logger.error('Error al conectar a MongoDB para auditoría:', error);
  });

const PORT = process.env.PORT || 3005;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de auditoría ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
