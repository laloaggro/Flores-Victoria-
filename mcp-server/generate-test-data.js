#!/usr/bin/env node
/**
 * Script para generar eventos de prueba en el MCP Server
 * Esto simula actividad real de los microservicios
 */

const axios = require('axios');

const MCP_URL = process.env.MCP_URL || 'http://localhost:5050';

// Tipos de eventos simulados
const eventTypes = [
  {
    type: 'product_viewed',
    service: 'product-service',
    payload: { productId: 123, category: 'rosas' },
  },
  {
    type: 'product_created',
    service: 'product-service',
    payload: { productId: 456, name: 'Rosa Roja' },
  },
  {
    type: 'user_login',
    service: 'auth-service',
    payload: { userId: 789, email: 'usuario@flores.com' },
  },
  { type: 'order_created', service: 'order-service', payload: { orderId: 321, total: 150.5 } },
  { type: 'cart_updated', service: 'cart-service', payload: { userId: 789, items: 3 } },
  { type: 'review_submitted', service: 'review-service', payload: { productId: 123, rating: 5 } },
  { type: 'wishlist_added', service: 'wishlist-service', payload: { userId: 789, productId: 456 } },
  { type: 'contact_message', service: 'contact-service', payload: { email: 'cliente@mail.com' } },
];

const auditActions = [
  { action: 'user_login', agent: 'auth-service', details: 'Login exitoso' },
  {
    action: 'product_created',
    agent: 'admin-panel',
    details: 'Nuevo producto agregado al catálogo',
  },
  { action: 'order_completed', agent: 'order-service', details: 'Pedido procesado correctamente' },
  { action: 'payment_processed', agent: 'payment-service', details: 'Pago confirmado' },
  { action: 'email_sent', agent: 'notification-service', details: 'Confirmación enviada' },
];

// Función para enviar un evento
async function sendEvent(event) {
  try {
    await axios.post(`${MCP_URL}/events`, {
      type: event.type,
      payload: {
        ...event.payload,
        service: event.service,
        timestamp: Date.now(),
      },
    });
    console.log(`✅ Evento enviado: ${event.type} (${event.service})`);
  } catch (error) {
    console.error(`❌ Error enviando evento ${event.type}:`, error.message);
  }
}

// Función para enviar una auditoría
async function sendAudit(audit) {
  try {
    await axios.post(`${MCP_URL}/audit`, audit);
    console.log(`📝 Auditoría enviada: ${audit.action} (${audit.agent})`);
  } catch (error) {
    console.error(`❌ Error enviando auditoría ${audit.action}:`, error.message);
  }
}

// Función principal
async function generateTestData() {
  console.log('🚀 Generando datos de prueba para MCP Server...\n');

  // Generar múltiples eventos de cada tipo
  for (let i = 0; i < 5; i++) {
    console.log(`\n📊 Ciclo ${i + 1}/5:`);

    // Enviar eventos
    for (const event of eventTypes) {
      await sendEvent(event);
      await sleep(200); // Pequeña pausa entre eventos
    }

    // Enviar auditorías
    for (const audit of auditActions) {
      await sendAudit(audit);
      await sleep(200);
    }

    await sleep(1000); // Pausa entre ciclos
  }

  console.log('\n✅ Generación de datos de prueba completada!');
  console.log(`\n📈 Visita el dashboard en: http://localhost:5050/`);
  console.log(`   Usuario: admin`);
  console.log(`   Contraseña: changeme\n`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ejecutar
generateTestData().catch(console.error);
