#!/usr/bin/env node

/**
 * 🤖 AI SERVICE STANDALONE - FLORES VICTORIA v3.0
 * Servicio de inteligencia artificial simplificado para desarrollo
 */

const express = require('express');
const app = express();

app.use(express.json());

// Datos de ejemplo para recomendaciones
const sampleProducts = [
  { id: 1, name: 'Ramo de Rosas Rojas', category: 'rosas', price: 45000, popularity: 95 },
  { id: 2, name: 'Bouquet Tulipanes', category: 'tulipanes', price: 35000, popularity: 87 },
  { id: 3, name: 'Arreglo Primaveral', category: 'mixto', price: 55000, popularity: 92 },
  { id: 4, name: 'Rosas Blancas Elegantes', category: 'rosas', price: 50000, popularity: 89 },
  { id: 5, name: 'Girasoles Alegres', category: 'girasoles', price: 40000, popularity: 82 },
];

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[AI Service] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AI Service',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    features: ['recommendations', 'chatbot', 'analytics'],
  });
});

// AI Recommendations with userId
app.get('/ai/recommendations/:userId', (req, res) => {
  const userId = req.params.userId || 'guest';
  const limit = parseInt(req.query.limit) || 5;

  // Simulación de recomendaciones AI
  const recommendations = sampleProducts
    .sort(() => 0.5 - Math.random())
    .slice(0, limit)
    .map((product) => ({
      ...product,
      confidence: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100,
      reason: `Recomendado para usuario ${userId} basado en preferencias`,
    }));

  res.json({
    success: true,
    userId,
    recommendations,
    metadata: {
      timestamp: new Date().toISOString(),
      algorithm: 'collaborative-filtering-v3',
      confidence: 'high',
    },
  });
});

// AI Recommendations without userId
app.get('/ai/recommendations', (req, res) => {
  const userId = 'guest';
  const limit = parseInt(req.query.limit) || 5;

  // Simulación de recomendaciones AI
  const recommendations = sampleProducts
    .sort(() => 0.5 - Math.random())
    .slice(0, limit)
    .map((product) => ({
      ...product,
      confidence: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100, // 0.6-1.0
      reason: `Recomendado para usuario ${userId} basado en preferencias`,
    }));

  res.json({
    success: true,
    userId,
    recommendations,
    metadata: {
      timestamp: new Date().toISOString(),
      algorithm: 'collaborative-filtering-v3',
      confidence: 'high',
    },
  });
});

// AI Chat/Chatbot
app.post('/ai/chat', (req, res) => {
  const { message, userId = 'guest' } = req.body;

  // Respuestas automáticas básicas
  const responses = {
    hola: '¡Hola! Soy tu asistente de Flores Victoria. ¿En qué puedo ayudarte?',
    productos:
      'Tenemos hermosos ramos de rosas, tulipanes, y arreglos especiales. ¿Qué ocasión celebras?',
    precios: 'Nuestros arreglos van desde $35.000 hasta $55.000. ¿Te gustaría ver recomendaciones?',
    entrega: 'Realizamos entregas en Santiago en 24 horas. ¿Necesitas entrega urgente?',
  };

  const lowerMessage = message?.toLowerCase() || '';
  const response =
    responses[lowerMessage] ||
    'Interesante pregunta. Te puedo ayudar con información sobre nuestros productos, precios y entregas.';

  res.json({
    success: true,
    userId,
    message,
    response,
    confidence: 0.85,
    timestamp: new Date().toISOString(),
  });
});

// AI Analytics
app.get('/ai/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalRecommendations: Math.floor(Math.random() * 10000) + 5000,
      accuracy: '94.2%',
      userSatisfaction: '91.8%',
      activeUsers: Math.floor(Math.random() * 500) + 200,
      topCategories: ['rosas', 'tulipanes', 'mixto', 'girasoles'],
      performance: {
        avgResponseTime: '89ms',
        uptime: '99.97%',
        requestsToday: Math.floor(Math.random() * 1000) + 500,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[AI Service Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal AI Service Error',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /ai/recommendations/:userId',
      'POST /ai/chat',
      'GET /ai/analytics',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🤖 AI Service iniciado exitosamente');
  console.log(`📡 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`💡 Recomendaciones: http://localhost:${PORT}/ai/recommendations/user123`);
  console.log(`💬 Chat: POST http://localhost:${PORT}/ai/chat`);
  console.log(`📊 Analytics: http://localhost:${PORT}/ai/analytics`);
  console.log('✅ AI Service listo para usar');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Cerrando AI Service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Cerrando AI Service...');
  process.exit(0);
});
