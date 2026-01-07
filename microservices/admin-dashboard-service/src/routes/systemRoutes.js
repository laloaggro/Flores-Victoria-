/**
 * Rutas para el sistema (monitoreo, health, URLs)
 * Migrado desde admin-panel legacy
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { logger } = require('@flores-victoria/shared/utils/logger');

/**
 * @route   GET /api/system/status
 * @desc    Estado general del sistema
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'success',
    data: {
      servers: [
        { id: 1, name: 'Frontend Server', status: 'running', uptime: '99.9%' },
        { id: 2, name: 'API Gateway', status: 'running', uptime: '99.8%' },
        { id: 3, name: 'MongoDB', status: 'running', uptime: '100%' },
        { id: 4, name: 'Auth Service', status: 'running', uptime: '99.9%' },
        { id: 5, name: 'Product Service', status: 'running', uptime: '99.7%' }
      ],
      metrics: {
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 30) + 40,
        disk: Math.floor(Math.random() * 20) + 20,
        network: Math.floor(Math.random() * 100) + 50
      },
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route   GET /api/system/health
 * @desc    Health check del sistema completo
 */
router.get('/health', async (req, res) => {
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
  
  const health = {
    status: 'healthy',
    environment: isRailway ? 'railway' : 'local',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {}
  };

  // Check if we can reach internal services
  if (isRailway) {
    health.checks.railway = 'ok';
    health.checks.services = 'use /api/dashboard for service status';
  } else {
    try {
      const dockerCheck = await new Promise((resolve) => {
        exec('docker ps -q | head -1', (error) => {
          resolve(!error ? 'ok' : 'unavailable');
        });
      });
      health.checks.docker = dockerCheck;
    } catch (e) {
      health.checks.docker = 'unavailable';
    }
  }

  res.json(health);
});

/**
 * @route   GET /api/system/logs
 * @desc    Logs del sistema
 */
router.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const level = req.query.level; // info, warning, error
  
  // En producción, esto leería de un archivo de logs real
  const mockLogs = [
    { timestamp: new Date().toISOString(), level: 'info', message: 'Sistema iniciado correctamente' },
    { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'info', message: 'Health check completado' },
    { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'warning', message: 'Uso de memoria alto' },
    { timestamp: new Date(Date.now() - 180000).toISOString(), level: 'info', message: 'Backup automático completado' },
    { timestamp: new Date(Date.now() - 240000).toISOString(), level: 'info', message: 'Usuario admin inició sesión' }
  ];

  let logs = mockLogs;
  if (level) {
    logs = logs.filter(log => log.level === level);
  }

  res.json({
    status: 'success',
    data: logs.slice(0, limit)
  });
});

/**
 * @route   GET /api/system/urls
 * @desc    URLs del sistema
 */
router.get('/urls', (req, res) => {
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
  const PORT = process.env.PORT || 3021;

  const urls = isRailway ? [
    { name: 'Frontend', url: 'https://frontend-production-d0b0.up.railway.app', type: 'web', status: 'active' },
    { name: 'API Gateway', url: 'https://api-gateway-production-b02f.up.railway.app', type: 'api', status: 'active' },
    { name: 'Admin Dashboard', url: 'https://admin-dashboard-service-production.up.railway.app', type: 'web', status: 'active' },
    { name: 'Auth Service', url: 'https://auth-service-production-6a6a.up.railway.app', type: 'api', status: 'active' }
  ] : [
    { name: 'Admin Dashboard', url: `http://localhost:${PORT}`, type: 'web', status: 'active' },
    { name: 'API Gateway', url: 'http://localhost:3000', type: 'api', status: 'unknown' },
    { name: 'Frontend', url: 'http://localhost:5173', type: 'web', status: 'unknown' },
    { name: 'Auth Service', url: 'http://localhost:3001', type: 'api', status: 'unknown' }
  ];

  res.json({
    status: 'success',
    message: 'System URLs retrieved',
    data: urls,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/system/maintenance
 * @desc    Ejecutar script de mantenimiento
 */
router.post('/maintenance', (req, res) => {
  const action = req.body.action || 'status';
  
  // En producción, esto ejecutaría scripts de mantenimiento reales
  logger.info(`Maintenance action requested: ${action}`);
  
  res.json({
    status: 'success',
    message: `Maintenance action '${action}' queued`,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/system/analytics
 * @desc    Analytics del sistema
 */
router.get('/analytics', (req, res) => {
  res.json({
    status: 'success',
    data: {
      visitors: {
        today: Math.floor(Math.random() * 500) + 100,
        week: Math.floor(Math.random() * 3000) + 500,
        month: Math.floor(Math.random() * 10000) + 2000
      },
      orders: {
        today: Math.floor(Math.random() * 50) + 10,
        week: Math.floor(Math.random() * 200) + 50,
        month: Math.floor(Math.random() * 800) + 200
      },
      revenue: {
        today: Math.floor(Math.random() * 500000) + 100000,
        week: Math.floor(Math.random() * 2000000) + 500000,
        month: Math.floor(Math.random() * 8000000) + 2000000
      },
      topProducts: [
        { name: 'Ramo de Rosas', sales: 45 },
        { name: 'Arreglo Premium', sales: 32 },
        { name: 'Bouquet Mixto', sales: 28 }
      ]
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
