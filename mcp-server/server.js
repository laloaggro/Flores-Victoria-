// Endpoint: Monitoreo de salud / Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Endpoint: Registrar evento personalizado / Register custom event
app.post('/events', (req, res) => {
  const { type, payload } = req.body;
  const event = { type, payload, timestamp: Date.now() };
  if (!context.events) context.events = [];
  context.events.push(event);
  res.json(event);
});
// MCP Server - Model Context Protocol
// Servidor MCP - Protocolo de Contexto de Modelos
// Bilingüe ES/EN

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Contexto global / Global context
let context = {
  models: [],
  agents: [],
  tasks: [],
  audit: []
};

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
  context = { models: [], agents: [], tasks: [], audit: [] };
  res.json({ status: 'cleared' });
});

// Inicio del servidor / Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});
