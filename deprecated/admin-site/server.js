import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import yaml from 'js-yaml';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;

// Seguridad básica
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());

// CORS para frontend externo (5173) si necesita acceder a /api desde admin-site
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && origin.startsWith('http://localhost:')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Rate limiting para rutas proxy
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 600 });
app.use(['/api', '/panel', '/mcp'], apiLimiter);

// Middleware de autenticación para rutas protegidas
function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_token;
  if (!token) {
    return res.status(401).send('<script>window.location.href="/pages/login.html"</script>');
  }
  // Nota: No verificamos firma aquí; asumimos que el Gateway valida el JWT
  // Opcional: validar estructura básica del JWT
  next();
}

// Inyectar Authorization en solicitudes proxied si hay cookie
function onProxyReq(proxyReq, req) {
  const token = req.cookies?.admin_token;
  if (token) {
    proxyReq.setHeader('Authorization', `Bearer ${token}`);
  }
}

// Error handler para proxy
function onProxyError(err, req, res) {
  console.error('Proxy error:', err.message);
  if (!res.headersSent) {
    res.status(502).json({
      error: 'Servicio no disponible',
      detail: err.code === 'ECONNREFUSED' ? 'No se pudo conectar al servicio' : err.message,
    });
  }
}

// Proxy /api -> Gateway (http://localhost:3000/api)
// Permitir rutas públicas de auth sin requireAdmin (login/register/forgot/reset/refresh/health)
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' },
  onProxyReq,
  onError: onProxyError,
  proxyTimeout: 30000,
});

app.use('/api', (req, res, next) => {
  const p = req.path || '';
  // Dejar que rutas específicas definidas más abajo manejen login/profile con fallback
  const handledByCustom = /^\/auth\/(login|profile)(\/|$)/.test(p);
  if (handledByCustom) return next();
  // Rutas de trabajador con verificación de rol local
  if (p.startsWith('/worker/')) return next();
  // Rutas públicas de auth que no requieren cookie (se van por el proxy)
  const isPublicAuth =
    /^\/auth\/(register|forgot-password|reset-password|refresh|health)(\/|$)/.test(p);
  if (isPublicAuth) return apiProxy(req, res, next);
  // Todo lo demás requiere admin
  return requireAdmin(req, res, () => apiProxy(req, res, next));
});

// Proxy /panel -> Admin Panel (http://localhost:3010)
app.use(
  '/panel',
  requireAdmin,
  createProxyMiddleware({
    target: 'http://localhost:3010',
    changeOrigin: true,
    pathRewrite: { '^/panel': '/' },
    onProxyReq,
    onError: onProxyError,
    proxyTimeout: 30000,
  })
);

// Proxy /mcp -> MCP Server (http://localhost:5050)
app.use(
  '/mcp',
  requireAdmin,
  createProxyMiddleware({
    target: 'http://localhost:5050',
    changeOrigin: true,
    pathRewrite: { '^/mcp': '/' },
    onProxyReq,
    onError: onProxyError,
    proxyTimeout: 30000,
  })
);

// Archivos estáticos del admin-site
// Endpoint para setear cookie HttpOnly (usado por login)
app.post('/auth/set-cookie', express.json(), async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token requerido' });

  // Validar token contra Gateway
  try {
    let response = await fetch('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Fallback a auth-service directo si gateway rate-limitea o falla
    if (!response.ok) {
      if (response.status === 429 || response.status === 503) {
        response = await fetch('http://localhost:3001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }
    if (!response.ok) throw new Error('Token inválido o perfil no disponible');

    const data = await response.json();
    const user = data.data?.user;
    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    // Cookie HttpOnly, Secure en producción (omitir Secure en dev si HTTP)
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    res.json({ ok: true, user });
  } catch (error) {
    res.status(401).json({ error: 'Validación de token falló' });
  }
});

// Endpoint para limpiar cookie (logout)
app.post('/auth/logout', (req, res) => {
  res.clearCookie('admin_token', { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true });
});

// Archivos estáticos del admin-site
app.use(express.static(__dirname));

// ---------- Rutas públicas de autenticación (con fallback si hay 429 en Gateway) ----------
app.post('/api/auth/login', express.json(), async (req, res) => {
  try {
    const body = JSON.stringify(req.body || {});
    let r = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!r.ok && r.status === 429) {
      r = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    }
    const text = await r.text();
    res
      .status(r.status)
      .type(r.headers.get('content-type') || 'application/json')
      .send(text);
  } catch (e) {
    res.status(502).json({ error: 'Login no disponible', detail: String(e.message || e) });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const token =
      req.cookies?.admin_token || (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    let r = await fetch('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok && r.status === 429) {
      r = await fetch('http://localhost:3001/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    const text = await r.text();
    res
      .status(r.status)
      .type(r.headers.get('content-type') || 'application/json')
      .send(text);
  } catch (e) {
    res.status(502).json({ error: 'Perfil no disponible', detail: String(e.message || e) });
  }
});

// --- Worker proxy con verificación de rol (worker o admin) ---
const tokenRoleCache = new Map(); // token -> { role, exp }

async function getRoleFromToken(token) {
  const now = Date.now();
  const cached = tokenRoleCache.get(token);
  if (cached && cached.exp > now) return cached.role;
  let r = await fetch('http://localhost:3000/api/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok && r.status === 429) {
    r = await fetch('http://localhost:3001/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  if (!r.ok) throw new Error('perfil no disponible');
  const data = await r.json();
  const role = data?.data?.user?.role;
  tokenRoleCache.set(token, { role, exp: now + 60_000 }); // cache 60s
  return role;
}

app.use('/api/worker', async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    const role = await getRoleFromToken(token).catch(() => null);
    if (!(role === 'worker' || role === 'trabajador' || role === 'admin')) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    // Proxy a /api
    const workerProxy = createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^/api/worker': '/api' },
      onProxyReq,
      onError: onProxyError,
      proxyTimeout: 30000,
    });
    return workerProxy(req, res, next);
  } catch (e) {
    return res.status(502).json({ error: 'Proxy worker no disponible' });
  }
});

// ---------- Admin Endpoints (require admin) ----------
app.use('/admin', requireAdmin, express.json());

// Rate limiting específico para admin (más estricto en acciones de cambio de estado)
const adminCriticalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const adminLogsLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });

// Compose helper: fallback a docker-compose si no hay compose v2
function getComposeBin() {
  try {
    execSync('docker compose version', { stdio: 'ignore' });
    return 'docker compose';
  } catch {
    return 'docker-compose';
  }
}

// Whitelist de servicios válidos (evita inyección en CLI)
const allowedServices = new Set([
  'api-gateway',
  'auth-service',
  'product-service',
  'admin-panel',
  'frontend',
]);

// Servicio: estado general (docker ps, health)
app.get('/admin/status', async (req, res) => {
  const compose = getComposeBin();
  exec(
    `cd ${path.join(__dirname, '..')} && ${compose} -f docker-compose.dev-simple.yml ps`,
    async (err, stdout, stderr) => {
      const healthRes = await fetch('http://localhost:9000/health')
        .then((r) => r.json())
        .catch(() => ({ ok: false }));
      res.json({
        ok: !err,
        compose: err ? stderr : stdout,
        health: healthRes,
      });
    }
  );
});

// Servicio: acciones docker compose (up/down/restart)
app.post('/admin/services', adminCriticalLimiter, (req, res) => {
  const { action, services = [] } = req.body || {};
  const allowed = new Set(['up', 'down', 'restart']);
  if (!allowed.has(action)) return res.status(400).json({ error: 'Acción inválida' });
  // Validar servicios contra whitelist
  const cleanServices = (Array.isArray(services) ? services : []).filter((s) =>
    allowedServices.has(String(s))
  );
  const svcArgs = cleanServices.length ? cleanServices.join(' ') : '';
  const base = path.join(__dirname, '..');
  const compose = getComposeBin();
  let cmd = `cd ${base} && ${compose} -f docker-compose.dev-simple.yml ${action}`;
  if (action === 'up') cmd += ` -d ${svcArgs}`;
  else cmd += ` ${svcArgs}`;
  exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    res.json({ ok: !err, output: (stdout || '') + (stderr || '') });
  });
});

// MCP: reinicio sencillo (mata puerto y arranca)
app.post('/admin/mcp/restart', adminCriticalLimiter, (req, res) => {
  const mcpDir = path.join(__dirname, '..', 'mcp-server');
  const cmd = `lsof -ti:5050 | xargs -r kill -9; cd ${mcpDir} && nohup node server.js > /tmp/mcp-server.log 2>&1 & echo $!`;
  exec(cmd, (err, stdout, stderr) => {
    res.json({ ok: !err, output: (stdout || '') + (stderr || '') });
  });
});

// Pipelines: smoke/full/load
app.post('/admin/pipeline', adminCriticalLimiter, (req, res) => {
  const { name } = req.body || {};
  const projectRoot = path.join(__dirname, '..');
  const map = {
    smoke: `cd ${projectRoot} && ./scripts/test-smoke.sh`,
    full: `cd ${projectRoot} && ./scripts/test-full.sh`,
    load: `cd ${projectRoot} && ./scripts/run-load-tests.sh`,
  };
  const cmd = map[name];
  if (!cmd) return res.status(400).json({ error: 'Pipeline desconocido' });
  exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    res.json({ ok: !err, output: (stdout || '') + (stderr || '') });
  });
});

// Logs: docker services o archivos /tmp
app.get('/admin/logs', adminLogsLimiter, (req, res) => {
  const { target = 'api-gateway', lines = '200' } = req.query;
  const n = Math.max(50, parseInt(lines, 10) || 200);
  const projectRoot = path.join(__dirname, '..');
  let cmd = '';
  if (
    ['api-gateway', 'auth-service', 'product-service', 'admin-panel', 'frontend'].includes(target)
  ) {
    const compose = getComposeBin();
    cmd = `cd ${projectRoot} && ${compose} -f docker-compose.dev-simple.yml logs --tail=${n} ${target}`;
  } else if (target === 'admin-site') {
    cmd = `tail -n ${n} /tmp/admin-site.log`;
  } else if (target === 'mcp') {
    cmd = `tail -n ${n} /tmp/mcp-server.log`;
  } else {
    return res.status(400).json({ error: 'Target desconocido' });
  }
  exec(cmd, { maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
    res.json({ ok: !err, output: (stdout || '') + (stderr || '') });
  });
});

// Logs en vivo (SSE)
app.get('/admin/logs/stream', requireAdmin, (req, res) => {
  const { target = 'api-gateway' } = req.query;
  const projectRoot = path.join(__dirname, '..');
  let cmd = '';
  if (
    ['api-gateway', 'auth-service', 'product-service', 'admin-panel', 'frontend'].includes(target)
  ) {
    const compose = getComposeBin();
    cmd = `cd ${projectRoot} && ${compose} -f docker-compose.dev-simple.yml logs -f ${target}`;
  } else if (target === 'admin-site') {
    cmd = `tail -n 0 -F /tmp/admin-site.log`;
  } else if (target === 'mcp') {
    cmd = `tail -n 0 -F /tmp/mcp-server.log`;
  } else {
    return res.status(400).json({ error: 'Target desconocido' });
  }

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': req.get('origin') || '*',
  });
  res.write('\n');

  const child = exec(cmd, { maxBuffer: 10 * 1024 * 1024 });
  const send = (line) => {
    res.write(`data: ${line.replace(/\n/g, '\\n')}\n\n`);
  };
  child.stdout.on('data', (chunk) => {
    const str = chunk.toString();
    str.split('\n').forEach((line) => line && send(line));
  });
  child.stderr.on('data', (chunk) => {
    const str = chunk.toString();
    str.split('\n').forEach((line) => line && send(`[ERR] ${line}`));
  });
  child.on('close', (code) => {
    send(`[END] stream cerrado code=${code}`);
    res.end();
  });
  req.on('close', () => {
    try {
      child.kill('SIGTERM');
    } catch {}
  });
});

// Lista de servicios desde docker-compose
app.get('/admin/services/list', requireAdmin, (req, res) => {
  try {
    const composePath = path.join(__dirname, '..', 'docker-compose.dev-simple.yml');
    const raw = fs.readFileSync(composePath, 'utf8');
    const doc = yaml.load(raw);
    const names = Object.keys(doc.services || {});
    res.json({ services: names });
  } catch (e) {
    // Fallback a whitelist si falla parseo
    res.json({ services: Array.from(allowedServices) });
  }
});

// Problemas: integrar con issue-tracking-system básico (mock simplificado)
app.get('/admin/problems', (req, res) => {
  // Intento de lectura de un JSON si existe, sino mock
  const file = path.join(__dirname, '..', 'issue-tracking-system', 'logs', 'issues.json');
  let items = [
    {
      id: 1,
      title: 'Reiniciar gateway por alta latencia',
      status: 'open',
      quickFix: 'restart-gateway',
      description: 'Latencia > 1s en /api/products',
    },
    {
      id: 2,
      title: 'Limpiar logs antiguos',
      status: 'open',
      quickFix: 'cleanup-logs',
      description: 'Particionar logs > 100MB',
    },
    {
      id: 3,
      title: 'Verificar health del MCP',
      status: 'closed',
      description: 'Reiniciado y estable',
    },
  ];
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    }
  } catch {}
  res.json({ items });
});

// Quick-fix ejecuta acciones rápidas mapeadas a scripts/commands
app.post('/admin/quick-fix', adminCriticalLimiter, (req, res) => {
  const { action } = req.body || {};
  const projectRoot = path.join(__dirname, '..');
  const fixes = {
    'restart-gateway': `cd ${projectRoot} && docker compose -f docker-compose.dev-simple.yml restart api-gateway`,
    'cleanup-logs': `cd ${projectRoot} && ./scripts/cleanup-logs.sh`,
  };
  const cmd = fixes[action];
  if (!cmd) return res.status(400).json({ error: 'Acción no soportada' });
  exec(cmd, (err, stdout, stderr) => {
    res.json({
      ok: !err,
      message: !err ? 'Acción ejecutada' : 'Error',
      output: (stdout || '') + (stderr || ''),
    });
  });
});

// Salud completa con checks de servicios
app.get('/health', async (req, res) => {
  const checks = {
    gateway: { url: 'http://localhost:3000/health', ok: false },
    auth: { url: 'http://localhost:3001/health', ok: false },
    products: { url: 'http://localhost:3009/health', ok: false },
    adminPanel: { url: 'http://localhost:3010', ok: false },
    mcp: { url: 'http://localhost:5050/health', ok: false },
  };

  const promises = Object.keys(checks).map(async (service) => {
    try {
      const response = await fetch(checks[service].url, { signal: AbortSignal.timeout(3000) });
      checks[service].ok = response.ok;
      checks[service].status = response.status;
    } catch (error) {
      checks[service].ok = false;
      checks[service].error = error.message;
    }
  });

  await Promise.all(promises);

  const allOk = Object.values(checks).every((c) => c.ok);
  res.status(allOk ? 200 : 503).json({
    ok: allOk,
    service: 'admin-site',
    time: new Date().toISOString(),
    services: checks,
  });
});

// Métricas demo para Owner Dashboard (hasta conectar servicio real)
app.get('/admin/metrics/demo', requireAdmin, (req, res) => {
  // Generar serie simple y top categorías ficticias
  const today = new Date();
  const series = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      date: d.toISOString().slice(0, 10),
      total: Math.round(100000 + Math.random() * 50000),
      orders: Math.round(20 + Math.random() * 30),
    };
  });
  const totals = {
    today: series[6],
    week: series.reduce((a, b) => ({ total: a.total + b.total, orders: a.orders + b.orders }), {
      total: 0,
      orders: 0,
    }),
  };
  const topProducts = [
    { name: 'Ramo Rosas Deluxe', qty: 42 },
    { name: 'Tulipanes Vibrantes', qty: 31 },
    { name: 'Orquídea Blanca', qty: 19 },
  ];
  const topCategories = [
    { name: 'Rosas', qty: 85 },
    { name: 'Tulipanes', qty: 54 },
    { name: 'Orquídeas', qty: 33 },
  ];
  res.json({ series, totals, topProducts, topCategories });
});

// Productos con cache y fallback (para Owner Dashboard y otros)
const productsCache = { data: null, ts: 0 };
app.get('/admin/products', requireAdmin, async (req, res) => {
  const now = Date.now();
  const maxAge = 20 * 1000; // 20 segundos
  if (productsCache.data && now - productsCache.ts < maxAge) {
    return res.json({ ok: true, from: 'cache', items: productsCache.data });
  }
  try {
    let r = await fetch('http://localhost:3000/api/products');
    if (!r.ok && r.status === 429) {
      r = await fetch('http://localhost:3009/api/products');
    }
    if (!r.ok) throw new Error(`status ${r.status}`);
    const data = await r.json().catch(() => null);
    const items = Array.isArray(data) ? data : data?.data || [];
    productsCache.data = items;
    productsCache.ts = now;
    res.json({ ok: true, from: 'live', items });
  } catch (e) {
    if (productsCache.data)
      return res.json({ ok: true, from: 'stale-cache', items: productsCache.data });
    res
      .status(502)
      .json({ ok: false, error: 'No se pudo obtener productos', detail: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`🌸 Admin Site with Proxy running on ${PORT}`);
  console.log('=========================================');
  console.log(`Home:      http://localhost:${PORT}`);
  console.log(`Login:     http://localhost:${PORT}/pages/login.html`);
  console.log(`Panel:     http://localhost:${PORT}/panel`);
  console.log(`MCP:       http://localhost:${PORT}/mcp`);
  console.log(`API proxy: http://localhost:${PORT}/api/*`);
  console.log('=========================================');
});
