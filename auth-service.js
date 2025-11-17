const { promisify } = require('util');

const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const client = require('prom-client');

// Port Manager Integration
const PortManager = require('./scripts/port-manager');
const environment = process.env.NODE_ENV || 'development';
let PORT;

try {
  const portManager = new PortManager();
  PORT = portManager.getPort('auth-service', environment);
} catch (error) {
  // Fallback chain: CLI args → env vars → default
  const cliPort = process.argv.find((arg) => arg.startsWith('--port='));
  PORT = cliPort ? parseInt(cliPort.split('=')[1]) : process.env.AUTH_SERVICE_PORT || 3017;
}

const app = express();
app.use(express.json());

// Prometheus Metrics
const register = new client.Registry();

// Default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const authAttempts = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['status', 'method'],
  registers: [register],
});

const activeTokens = new client.Gauge({
  name: 'auth_active_tokens',
  help: 'Number of active JWT tokens',
  registers: [register],
});

const tokenGenerationDuration = new client.Histogram({
  name: 'auth_token_generation_duration_seconds',
  help: 'Duration of token generation',
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

const userRegistrations = new client.Counter({
  name: 'auth_user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['status'],
  registers: [register],
});

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'flores-victoria-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// In-memory user store (replace with database in production)
const users = new Map();
const refreshTokens = new Set();

// Initialize with a demo user
const initDemoUser = async () => {
  const hashedPassword = await bcrypt.hash('demo123', 10);
  users.set('demo@flores-victoria.com', {
    id: '1',
    email: 'demo@flores-victoria.com',
    password: hashedPassword,
    name: 'Demo User',
    roles: ['user', 'admin'],
    createdAt: new Date().toISOString(),
  });
  console.log('✅ Demo user created: demo@flores-victoria.com / demo123');
};

// Middleware: Verify JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware: Check Roles
const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const hasRole = roles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.roles,
      });
    }
    next();
  };

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'auth-service',
    environment,
    port: PORT,
    timestamp: new Date().toISOString(),
    metrics: {
      totalUsers: users.size,
      activeTokens: refreshTokens.size,
    },
  });
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// POST /register - Register new user
app.post('/register', async (req, res) => {
  const timer = tokenGenerationDuration.startTimer();

  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      userRegistrations.inc({ status: 'validation_error' });
      return res.status(400).json({
        error: 'Email, password, and name are required',
      });
    }

    // Check if user exists
    if (users.has(email)) {
      userRegistrations.inc({ status: 'duplicate' });
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      roles: ['user'],
      createdAt: new Date().toISOString(),
    };

    users.set(email, user);
    userRegistrations.inc({ status: 'success' });
    activeTokens.inc();

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign({ id: user.id, email: user.email, type: 'refresh' }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    refreshTokens.add(refreshToken);

    timer();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    userRegistrations.inc({ status: 'error' });
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /login - Authenticate user
app.post('/login', async (req, res) => {
  const timer = tokenGenerationDuration.startTimer();

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      authAttempts.inc({ status: 'validation_error', method: 'password' });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      authAttempts.inc({ status: 'user_not_found', method: 'password' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      authAttempts.inc({ status: 'invalid_password', method: 'password' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign({ id: user.id, email: user.email, type: 'refresh' }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    refreshTokens.add(refreshToken);
    activeTokens.inc();
    authAttempts.inc({ status: 'success', method: 'password' });

    timer();

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    authAttempts.inc({ status: 'error', method: 'password' });
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /refresh - Refresh access token
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
    if (err || decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const user = Array.from(users.values()).find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      accessToken: newAccessToken,
    });
  });
});

// POST /google - Google OAuth authentication
app.post('/google', async (req, res) => {
  const timer = tokenGenerationDuration.startTimer();

  try {
    const { googleId, email, name, picture } = req.body;

    // Validation
    if (!googleId || !email) {
      authAttempts.inc({ status: 'validation_error', method: 'google' });
      return res.status(400).json({ error: 'Google ID and email are required' });
    }

    // Find or create user
    let user = users.get(email);

    if (!user) {
      // Create new user from Google data
      user = {
        id: Date.now().toString(),
        email,
        password: `google_${googleId}`, // No real password for Google users
        name: name || email.split('@')[0],
        picture: picture || null,
        roles: ['user'],
        provider: 'google',
        googleId,
        createdAt: new Date().toISOString(),
      };

      users.set(email, user);
      userRegistrations.inc({ status: 'success' });
      console.log(`✅ New user created via Google: ${email}`);
    } else {
      // Update existing user's picture if provided
      if (picture && picture !== user.picture) {
        user.picture = picture;
        users.set(email, user);
      }
      console.log(`✅ Existing user logged in via Google: ${email}`);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign({ id: user.id, email: user.email, type: 'refresh' }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    refreshTokens.add(refreshToken);
    activeTokens.inc();
    authAttempts.inc({ status: 'success', method: 'google' });

    timer();

    res.json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        roles: user.roles,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    authAttempts.inc({ status: 'error', method: 'google' });
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// POST /logout - Invalidate refresh token
app.post('/logout', (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens.delete(refreshToken);
    activeTokens.dec();
  }

  res.json({ message: 'Logged out successfully' });
});

// GET /verify - Verify token validity
app.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

// GET /profile - Get user profile (protected)
app.get('/profile', authenticateToken, (req, res) => {
  const user = Array.from(users.values()).find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    createdAt: user.createdAt,
  });
});

// GET /users - List all users (admin only)
app.get('/users', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const userList = Array.from(users.values()).map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    createdAt: user.createdAt,
  }));

  res.json({
    total: userList.length,
    users: userList,
  });
});

// PUT /users/:id/roles - Update user roles (admin only)
app.put('/users/:id/roles', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;

  const user = Array.from(users.values()).find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: 'Roles must be an array' });
  }

  user.roles = roles;
  users.set(user.email, user);

  res.json({
    message: 'Roles updated successfully',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const startServer = async () => {
  await initDemoUser();

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           🔐 AUTH SERVICE - Flores Victoria              ║
╚═══════════════════════════════════════════════════════════╝

  Environment: ${environment}
  Port:        ${PORT}
  Health:      http://localhost:${PORT}/health
  Metrics:     http://localhost:${PORT}/metrics

  📋 Available Endpoints:
  ├─ POST   /register       - Register new user
  ├─ POST   /login          - Login user
  ├─ POST   /refresh        - Refresh access token
  ├─ POST   /logout         - Logout user
  ├─ GET    /verify         - Verify token (protected)
  ├─ GET    /profile        - Get user profile (protected)
  ├─ GET    /users          - List users (admin only)
  └─ PUT    /users/:id/roles - Update roles (admin only)

  🔑 Demo Credentials:
  Email:    demo@flores-victoria.com
  Password: demo123
  Roles:    user, admin

  ⚙️  Configuration:
  JWT Secret:     ${JWT_SECRET.substring(0, 20)}...
  Access Token:   ${JWT_EXPIRES_IN}
  Refresh Token:  ${REFRESH_TOKEN_EXPIRES_IN}

  📊 Metrics:
  ├─ auth_attempts_total
  ├─ auth_active_tokens
  ├─ auth_token_generation_duration_seconds
  └─ auth_user_registrations_total
`);
  });
};

startServer().catch(console.error);

module.exports = { app, authenticateToken, authorizeRoles };
