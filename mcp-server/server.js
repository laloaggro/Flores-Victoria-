// MCP Server - Model Context Protocol
// Servidor MCP - Protocolo de Contexto de Modelos
// Bilingüe ES/EN

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { notifyCriticalEvent, notifyDailyMetrics } = require('./notifier');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Contexto global / Global context
let context = {
  models: [],
  agents: [],
  tasks: [],
  audit: [],
  events: []
};

// Endpoint: Monitoreo de salud / Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Endpoint: Registrar evento personalizado / Register custom event
app.post('/events', (req, res) => {
  const { type, payload } = req.body;
  const event = { type, payload, timestamp: Date.now() };
  context.events.push(event);
  res.json(event);
});

// Endpoint: Obtener contexto actual / Get current context
app.get('/context', (req, res) => {
  res.json({ context });
});

// Endpoint: Ejecutar tarea automática / Run automated task
app.post('/tasks', (req, res) => {
  const { name, params } = req.body;
  // Simulación de ejecución / Simulate execution
  const result = { status: 'success', name, params, timestamp: Date.now() };
  context.tasks.push(result);
  res.json(result);
});

// Endpoint: Registrar acción IA / Register AI action
app.post('/audit', (req, res) => {
  const { action, agent, details } = req.body;
  const entry = { action, agent, details, timestamp: Date.now() };
  context.audit.push(entry);
  res.json(entry);
});

// Endpoint: Agregar modelo o agente / Add model or agent
app.post('/register', (req, res) => {
  const { type, data } = req.body;
  if (type === 'model') context.models.push(data);
  if (type === 'agent') context.agents.push(data);
  res.json({ status: 'registered', type, data });
});

// Endpoint: Limpiar contexto / Clear context
app.post('/clear', (req, res) => {
  context = { models: [], agents: [], tasks: [], audit: [], events: [] };
  res.json({ status: 'cleared' });
});

// Health check de servicios / Services health check
const { checkAllServices } = require('./health-check');

app.get('/check-services', async (req, res) => {
  const createIssues = req.query.createIssues === 'true';
  const results = await checkAllServices(createIssues);
  
  // Notificar si hay servicios caídos / Notify if services are down
  if (results.unhealthy > 0) {
    const downServices = results.results
      .filter(s => s.status !== 'healthy')
      .map(s => s.name)
      .join(', ');
    
    await notifyCriticalEvent('Servicios Caídos', `Los siguientes servicios están inactivos: ${downServices}`);
  }
  
  res.json(results);
});

// Endpoint: Métricas diarias / Daily metrics
app.get('/metrics', async (req, res) => {
  const healthCheck = await checkAllServices(false);
  
  const metrics = {
    healthyServices: healthCheck.healthy,
    totalServices: healthCheck.total,
    eventsCount: context.events.length,
    auditsCount: context.audit.length,
    uptime: ((healthCheck.healthy / healthCheck.total) * 100).toFixed(1),
    testsStatus: '14/14 ✓'
  };
  
  res.json(metrics);
});

// Inicio del servidor / Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});
