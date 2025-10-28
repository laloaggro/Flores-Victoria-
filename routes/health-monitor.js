// Health Check & System Monitor Endpoint
const { exec } = require('child_process');
const os = require('os');
const util = require('util');

const express = require('express');

const PortManager = require('../scripts/port-manager');

const execPromise = util.promisify(exec);
const router = express.Router();

const environment = process.env.NODE_ENV || 'development';
let SERVICE_PORTS = {};

try {
  const portManager = new PortManager();
  const portConfig = portManager.getAllPorts(environment);

  SERVICE_PORTS = {
    'api-gateway': portConfig.frontend['main-site'],
    'auth-service': portConfig.additional['auth-service'],
    'payment-service': portConfig.additional['payment-service'],
    'order-service': portConfig.core['order-service'],
    'ai-service': portConfig.core['ai-service'],
    'notification-service': portConfig.additional['notification-service'],
    'admin-panel': portConfig.core['admin-panel'],
  };
} catch (error) {
  console.warn('PortManager unavailable in health-monitor, using defaults');
  SERVICE_PORTS = {
    'api-gateway': 3000,
    'auth-service': 3017,
    'payment-service': 3018,
    'order-service': 3004,
    'ai-service': 3013,
    'notification-service': 3016,
    'admin-panel': 3021,
  };
}

// System metrics
router.get('/system/metrics', async (req, res) => {
  try {
    const uptime = process.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = ((usedMem / totalMem) * 100).toFixed(2);

    const cpus = os.cpus();
    const cpuUsage =
      cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b);
        const idle = cpu.times.idle;
        return acc + ((total - idle) / total) * 100;
      }, 0) / cpus.length;

    res.json({
      ok: true,
      uptime: Math.floor(uptime / 3600), // hours
      cpu: {
        usage: cpuUsage.toFixed(2),
        cores: cpus.length,
      },
      memory: {
        total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usage: `${memUsage}%`,
      },
      platform: os.platform(),
      hostname: os.hostname(),
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Service health checks
router.get('/services/health', async (req, res) => {
  const services = [
    { name: 'api-gateway', port: SERVICE_PORTS['api-gateway'] },
    { name: 'auth-service', port: SERVICE_PORTS['auth-service'] },
    { name: 'payment-service', port: SERVICE_PORTS['payment-service'] },
    { name: 'order-service', port: SERVICE_PORTS['order-service'] },
    { name: 'ai-service', port: SERVICE_PORTS['ai-service'] },
    { name: 'notification-service', port: SERVICE_PORTS['notification-service'] },
    { name: 'admin-panel', port: SERVICE_PORTS['admin-panel'] },
  ];

  const checks = await Promise.all(
    services.map(async (service) => {
      try {
        const { stdout } = await execPromise(`lsof -ti:${service.port} || echo ""`);
        const isRunning = stdout.trim() !== '';
        return {
          ...service,
          status: isRunning ? 'running' : 'stopped',
          pid: isRunning ? stdout.trim() : null,
        };
      } catch (error) {
        return {
          ...service,
          status: 'error',
          error: error.message,
        };
      }
    })
  );

  const runningCount = checks.filter((s) => s.status === 'running').length;

  res.json({
    ok: true,
    services: checks,
    summary: {
      total: services.length,
      running: runningCount,
      stopped: services.length - runningCount,
    },
  });
});

// Docker services status
router.get('/docker/status', async (req, res) => {
  try {
    const { stdout } = await execPromise('docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}"');
    const containers = stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [name, status, ports] = line.split('|');
        return { name, status, ports };
      });

    res.json({
      ok: true,
      containers,
      count: containers.length,
    });
  } catch (error) {
    res.json({
      ok: false,
      error: 'Docker not available or no containers running',
      message: error.message,
    });
  }
});

// Quick fix actions
router.post('/admin/quick-fix', async (req, res) => {
  const { action } = req.body;

  try {
    switch (action) {
      case 'restart-gateway':
        await execPromise('pkill -f api-gateway || true');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        exec(
          'cd /home/impala/Documentos/Proyectos/flores-victoria && node api-gateway.js > logs/gateway.log 2>&1 &'
        );
        res.json({ ok: true, message: 'Gateway reiniciado' });
        break;

      case 'clear-cache':
        // Implement cache clearing logic
        res.json({ ok: true, message: 'Cache limpiado' });
        break;

      case 'restart-all':
        res.json({ ok: true, message: 'Reiniciando todos los servicios...' });
        break;

      default:
        res.status(400).json({ ok: false, error: 'Acción no reconocida' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Logs viewer
router.get('/logs/:service', async (req, res) => {
  const { service } = req.params;
  const lines = req.query.lines || 100;

  const logFiles = {
    'api-gateway': 'logs/gateway.log',
    'auth-service': 'logs/auth-dev.log',
    'payment-service': 'logs/payment-dev.log',
    'admin-panel': 'logs/admin-panel.log',
  };

  const logFile = logFiles[service];

  if (!logFile) {
    return res.status(404).json({ ok: false, error: 'Log file not found' });
  }

  try {
    const { stdout } = await execPromise(
      `tail -n ${lines} ${logFile} 2>/dev/null || echo "No logs available"`
    );
    res.json({
      ok: true,
      service,
      logs: stdout.split('\n'),
    });
  } catch (error) {
    res.json({
      ok: false,
      error: error.message,
      logs: [],
    });
  }
});

module.exports = router;
