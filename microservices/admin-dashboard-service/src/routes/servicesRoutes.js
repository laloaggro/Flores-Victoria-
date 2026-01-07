/**
 * Rutas para control de servicios Docker
 * Migrado desde admin-panel legacy
 */
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { logger } = require('@flores-victoria/shared/utils/logger');

/**
 * @route   GET /api/services/status
 * @desc    Obtener estado de todos los servicios Docker
 */
router.get('/status', (req, res) => {
  // En Railway usamos healthchecks HTTP, en local usamos Docker
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
  
  if (isRailway) {
    // En Railway, retornar servicios configurados con health checks
    return res.json({
      success: true,
      environment: 'railway',
      message: 'Use /api/dashboard/services for Railway services status',
      services: []
    });
  }

  const command = 'docker ps --format "{{json .}}"';

  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error('Error getting services:', { error: error.message, stderr });
      return res.status(500).json({ 
        error: 'Error al obtener estado de servicios', 
        details: stderr || error.message 
      });
    }

    try {
      const lines = stdout.trim().split('\n').filter(line => line);
      const services = lines.map(line => {
        try {
          const container = JSON.parse(line);
          const name = container.Names || '';
          const displayName = name.replace('flores-victoria-', '').replace(/-/g, ' ').toUpperCase();
          const state = container.State || '';
          const status = container.Status || '';
          const ports = container.Ports || '';

          return {
            name: name,
            displayName: displayName,
            status: state === 'running' ? 'running' : 'stopped',
            health: state === 'running' && status.includes('healthy') ? 'healthy' :
                    state === 'running' ? 'running' : 'stopped',
            uptime: status,
            port: ports.split(',')[0] || 'N/A'
          };
        } catch (e) {
          logger.error('Error parsing container line:', { line, error: e.message });
          return null;
        }
      }).filter(s => s !== null);

      res.json({ success: true, services, count: services.length });
    } catch (parseError) {
      logger.error('Error parsing services:', { error: parseError.message });
      res.status(500).json({ error: 'Error al parsear servicios', details: parseError.message });
    }
  });
});

/**
 * @route   POST /api/services/control
 * @desc    Controlar servicios (start, stop, restart)
 */
router.post('/control', (req, res) => {
  const { service, action } = req.body;

  if (!service || !action) {
    return res.status(400).json({ error: 'Servicio y acción son requeridos' });
  }

  const validActions = ['start', 'stop', 'restart'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: 'Acción inválida. Use: start, stop, restart' });
  }

  const command = `docker ${action} ${service}`;
  logger.info(`Executing: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Error ${action} service:`, { error: error.message, stderr });
      return res.status(500).json({
        success: false,
        error: `Error al ${action} servicio`,
        details: stderr || error.message
      });
    }

    res.json({
      success: true,
      message: `Servicio ${service} ${action} exitosamente`,
      output: stdout
    });
  });
});

/**
 * @route   GET /api/services/:service/logs
 * @desc    Obtener logs de un servicio
 */
router.get('/:service/logs', (req, res) => {
  const { service } = req.params;
  const lines = req.query.lines || 100;

  const command = `docker logs --tail ${lines} ${service}`;
  logger.info(`Getting logs: ${command}`);

  exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      logger.error('Error getting logs:', { error: error.message, stderr });
      return res.status(500).json({
        success: false,
        error: 'Error al obtener logs',
        details: stderr || error.message
      });
    }

    const logs = stdout || stderr || 'No hay logs disponibles';
    res.json({ success: true, logs });
  });
});

/**
 * @route   POST /api/services/start/:service?
 * @desc    Iniciar servicio(s)
 */
router.post('/start/:service?', (req, res) => {
  const service = req.params.service;
  
  if (service) {
    const command = `docker start ${service}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: `Error al iniciar ${service}`,
          details: stderr || error.message
        });
      }
      res.json({
        success: true,
        message: `Servicio ${service} iniciado`,
        output: stdout
      });
    });
  } else {
    // Start all flores-victoria services
    const command = 'docker ps -a --filter "name=flores-victoria" --format "{{.Names}}" | xargs -r docker start';
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: 'Error al iniciar servicios',
          details: stderr || error.message
        });
      }
      res.json({
        success: true,
        message: 'Todos los servicios iniciados',
        output: stdout
      });
    });
  }
});

/**
 * @route   POST /api/services/stop/:service?
 * @desc    Detener servicio(s)
 */
router.post('/stop/:service?', (req, res) => {
  const service = req.params.service;
  
  if (service) {
    const command = `docker stop ${service}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: `Error al detener ${service}`,
          details: stderr || error.message
        });
      }
      res.json({
        success: true,
        message: `Servicio ${service} detenido`,
        output: stdout
      });
    });
  } else {
    const command = 'docker ps --filter "name=flores-victoria" --format "{{.Names}}" | xargs -r docker stop';
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: 'Error al detener servicios',
          details: stderr || error.message
        });
      }
      res.json({
        success: true,
        message: 'Todos los servicios detenidos',
        output: stdout
      });
    });
  }
});

/**
 * @route   POST /api/services/restart/:service?
 * @desc    Reiniciar servicio(s)
 */
router.post('/restart/:service?', (req, res) => {
  const service = req.params.service;
  
  if (service) {
    const command = `docker restart ${service}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: `Error al reiniciar ${service}`,
          details: stderr || error.message
        });
      }
      res.json({
        success: true,
        message: `Servicio ${service} reiniciado`,
        output: stdout
      });
    });
  } else {
    const command = 'docker ps --filter "name=flores-victoria" --format "{{.Names}}" | xargs -r docker restart';
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: 'Error al reiniciar servicios',
          details: stderr || error.message
        });
      }
      res.json({
        success: true,
        message: 'Todos los servicios reiniciados',
        output: stdout
      });
    });
  }
});

module.exports = router;
