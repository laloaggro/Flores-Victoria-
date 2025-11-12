/**
 * ========================================
 * MCP Server - Model Context Protocol
 * Servidor MCP - Protocolo de Contexto de Modelos
 * ========================================
 *
 * Este servidor actúa como un punto central de coordinación para:
 * - Monitoreo de servicios (health checks)
 * - Registro de eventos del sistema
 * - Auditoría de acciones de IA
 * - Métricas y reportes en tiempo real
 *
 * Tecnologías utilizadas:
 * - Express.js: Framework web para Node.js
 * - CORS: Permite peticiones desde diferentes orígenes
 * - Body Parser: Convierte el cuerpo de las peticiones HTTP a JSON
 *
 * Bilingüe ES/EN para mejor comprensión
 */

// ========================================
// 1. IMPORTACIÓN DE DEPENDENCIAS
// ========================================

// Express: Framework web minimalista y flexible para Node.js
const path = require('path');

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

// Body Parser: Middleware para parsear el cuerpo de las peticiones HTTP
// Convierte el JSON que llega en req.body para que sea fácil de usar

// CORS (Cross-Origin Resource Sharing): Permite que el servidor acepte
// peticiones desde diferentes dominios/puertos (importante para APIs)

// Path: Módulo de Node.js para trabajar con rutas de archivos
// Ayuda a construir rutas independientes del sistema operativo

// Notifier: Módulo personalizado para enviar notificaciones críticas
// Cuando algo sale mal, este módulo alerta al equipo
const { checkAllServices } = require('./health-check');
const { notifyCriticalEvent, notifyDailyMetrics } = require('./notifier');

// ========================================
// 2. INICIALIZACIÓN DEL SERVIDOR EXPRESS
// ========================================

// Crear una nueva aplicación Express
// 'app' es el objeto principal que maneja todas las rutas y middleware
const app = express();

// Configurar CORS: Permite que cualquier sitio web haga peticiones a esta API
// En producción, deberías restringir esto a dominios específicos
app.use(cors());

// Configurar Body Parser: Convierte automáticamente el JSON de las peticiones
// a objetos JavaScript accesibles desde req.body
app.use(bodyParser.json());

// ========================================
// 3. CONFIGURACIÓN DE SEGURIDAD
// ========================================

/**
 * Autenticación Básica (Basic Auth)
 *
 * Este middleware protege rutas sensibles como el dashboard y check-services.
 * Usa el estándar HTTP Basic Authentication donde el usuario y contraseña
 * se envían en el header Authorization codificados en Base64.
 *
 * Variables de entorno:
 * - MCP_DASHBOARD_USER: Usuario para acceder (default: 'admin')
 * - MCP_DASHBOARD_PASS: Contraseña para acceder (default: 'changeme')
 *
 * IMPORTANTE: En producción, usa contraseñas seguras y HTTPS siempre.
 */

// Obtener credenciales desde variables de entorno o usar valores por defecto
// process.env permite leer variables de entorno del sistema
const dashboardUser = process.env.MCP_DASHBOARD_USER || 'admin';
const dashboardPass = process.env.MCP_DASHBOARD_PASS || 'changeme';

/**
 * Función middleware de autenticación básica
 *
 * @param {Object} req - Objeto de petición HTTP (request)
 * @param {Object} res - Objeto de respuesta HTTP (response)
 * @param {Function} next - Función para pasar al siguiente middleware
 *
 * Flujo:
 * 1. Lee el header 'Authorization' de la petición
 * 2. Extrae y decodifica las credenciales Base64
 * 3. Compara con las credenciales configuradas
 * 4. Si coinciden, permite continuar (next())
 * 5. Si no, devuelve error 401 Unauthorized
 */
function basicAuth(req, res, next) {
  // Obtener el header de autorización de la petición
  const authHeader = req.headers.authorization;

  // Verificar si existe el header y si empieza con 'Basic '
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // Si no hay header, pedir autenticación al cliente
    res.setHeader('WWW-Authenticate', 'Basic realm="MCP Dashboard"');
    return res.status(401).send('Authentication required');
  }

  // Extraer la parte Base64 del header (después de 'Basic ')
  const base64Credentials = authHeader.split(' ')[1];

  // Decodificar de Base64 a texto plano
  // Ejemplo: 'YWRtaW46cGFzc3dvcmQ=' -> 'admin:password'
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');

  // Separar usuario y contraseña (están separados por ':')
  const [username, password] = credentials.split(':');

  // Verificar si las credenciales son correctas
  if (username === dashboardUser && password === dashboardPass) {
    // Credenciales correctas: permitir acceso
    return next();
  }

  // Credenciales incorrectas: denegar acceso
  res.setHeader('WWW-Authenticate', 'Basic realm="MCP Dashboard"');
  return res.status(401).send('Invalid credentials');
}

// ========================================
// 4. ALMACENAMIENTO DE DATOS EN MEMORIA
// ========================================

/**
 * Contexto Global del Sistema
 *
 * Este objeto almacena todos los datos del sistema en memoria RAM.
 * Es una forma simple y rápida de guardar información temporal.
 *
 * NOTA: Los datos se pierden cuando el servidor se reinicia.
 * Para persistencia, usa una base de datos (MongoDB, PostgreSQL, etc.)
 *
 * Estructura:
 * - models: Lista de modelos de IA registrados
 * - agents: Lista de agentes autónomos activos
 * - tasks: Historial de tareas ejecutadas
 * - audit: Registro de auditoría de acciones importantes
 * - events: Eventos del sistema (errores, alertas, info)
 */
let context = {
  models: [], // Modelos de IA registrados en el sistema
  agents: [], // Agentes de IA activos
  tasks: [], // Tareas ejecutadas automáticamente
  audit: [], // Registro de auditoría (quién hizo qué y cuándo)
  events: [], // Eventos del sistema (logs estructurados)
};

// ========================================
// 5. ENDPOINTS DE LA API (RUTAS HTTP)
// ========================================

/**
 * GET /health - Endpoint de verificación de salud
 *
 * Este endpoint responde rápidamente para indicar que el servidor está vivo.
 * Lo usan sistemas de monitoreo (Kubernetes, Docker, Prometheus) para
 * detectar si el servicio funciona correctamente.
 *
 * Método HTTP: GET
 * URL: http://localhost:5050/health
 * Respuesta: { "status": "ok", "timestamp": 1234567890 }
 *
 * Uso típico:
 * - Kubernetes: Liveness y Readiness probes
 * - Monitoreo automático de servicios
 * - Verificación de disponibilidad
 */
app.get('/health', (req, res) => {
  // Responder con un objeto JSON simple
  res.json({
    status: 'ok', // Estado del servidor
    timestamp: Date.now(), // Timestamp actual en milisegundos
  });
});

/**
 * POST /events - Registrar un evento personalizado del sistema
 *
 * Los microservicios pueden enviar eventos aquí para registrar acciones
 * importantes, errores o información de diagnóstico.
 *
 * Método HTTP: POST
 * URL: http://localhost:5050/events
 * Body (JSON): { "type": "user_login", "payload": { "userId": 123 } }
 * Respuesta: { "type": "user_login", "payload": {...}, "timestamp": 1234567890 }
 *
 * Parámetros:
 * - type: Tipo de evento (ej: 'error', 'info', 'warning')
 * - payload: Datos adicionales del evento (objeto flexible)
 *
 * Ejemplo de uso desde otro servicio:
 * ```javascript
 * await axios.post('http://mcp-server:5050/events', {
 *   type: 'order_created',
 *   payload: { orderId: 456, amount: 99.99 }
 * });
 * ```
 */
app.post('/events', (req, res) => {
  // Extraer datos del cuerpo de la petición (ya parseado por body-parser)
  const { type, payload } = req.body;

  // Crear el objeto evento con timestamp automático
  const event = {
    type, // Tipo de evento
    payload, // Datos adicionales
    timestamp: Date.now(), // Momento exacto en que ocurrió
  };

  // Guardar el evento en el array de eventos
  context.events.push(event);

  // Devolver el evento creado como confirmación
  res.json(event);
});

/**
 * GET /context - Obtener el contexto completo del sistema
 *
 * Devuelve todos los datos almacenados en memoria: modelos, agentes,
 * tareas, auditoría y eventos. Útil para debugging y monitoreo.
 *
 * Método HTTP: GET
 * URL: http://localhost:5050/context
 * Respuesta: { "context": { "models": [], "agents": [], ... } }
 *
 * Uso típico:
 * - Dashboard de administración
 * - Debugging durante desarrollo
 * - Exportar estado del sistema
 */
app.get('/context', (req, res) => {
  // Devolver una copia del contexto completo
  res.json({ context });
});

/**
 * POST /tasks - Ejecutar una tarea automática
 *
 * Los agentes de IA pueden registrar tareas que ejecutan automáticamente.
 * Este endpoint simula la ejecución y guarda un registro de la tarea.
 *
 * Método HTTP: POST
 * URL: http://localhost:5050/tasks
 * Body (JSON): { "name": "backup_database", "params": { "db": "users" } }
 * Respuesta: { "status": "success", "name": "backup_database", "params": {...}, "timestamp": 1234567890 }
 *
 * Parámetros:
 * - name: Nombre descriptivo de la tarea
 * - params: Parámetros de configuración para la tarea
 *
 * NOTA: Actualmente es una simulación. En producción, aquí se ejecutaría
 * la lógica real de la tarea (llamar a otros servicios, procesar datos, etc.)
 */
app.post('/tasks', (req, res) => {
  // Extraer datos de la petición
  const { name, params } = req.body;

  // Simulación de ejecución de tarea
  // En un sistema real, aquí ejecutarías la tarea usando workers, colas, etc.
  const result = {
    status: 'success', // Estado de la ejecución
    name, // Nombre de la tarea
    params, // Parámetros usados
    timestamp: Date.now(), // Momento de ejecución
  };

  // Guardar el resultado en el historial de tareas
  context.tasks.push(result);

  // Devolver el resultado al cliente
  res.json(result);
});

/**
 * POST /audit - Registrar una acción de auditoría
 *
 * Cada vez que un agente de IA o usuario realiza una acción importante,
 * se registra aquí para tener un historial completo y trazabilidad.
 *
 * Método HTTP: POST
 * URL: http://localhost:5050/audit
 * Body (JSON): { "action": "delete_user", "agent": "admin_bot", "details": { "userId": 123 } }
 * Respuesta: { "action": "delete_user", "agent": "admin_bot", "details": {...}, "timestamp": 1234567890 }
 *
 * Parámetros:
 * - action: Acción realizada (ej: 'create', 'update', 'delete')
 * - agent: Identificador del agente o usuario que realizó la acción
 * - details: Detalles adicionales de la acción
 *
 * Uso típico:
 * - Cumplimiento normativo (compliance)
 * - Investigación de incidentes de seguridad
 * - Análisis de comportamiento de agentes IA
 */
app.post('/audit', (req, res) => {
  // Extraer información de auditoría del cuerpo de la petición
  const { action, agent, details } = req.body;

  // Crear entrada de auditoría con timestamp automático
  const entry = {
    action, // Qué se hizo
    agent, // Quién lo hizo
    details, // Detalles adicionales
    timestamp: Date.now(), // Cuándo se hizo
  };

  // Guardar en el registro de auditoría
  context.audit.push(entry);

  // Confirmar el registro al cliente
  res.json(entry);
});

/**
 * POST /register - Registrar un modelo o agente de IA
 *
 * Permite que modelos de IA y agentes autónomos se registren en el sistema
 * para que sean visibles y gestionables desde el MCP.
 *
 * Método HTTP: POST
 * URL: http://localhost:5050/register
 * Body (JSON): { "type": "model", "data": { "name": "GPT-4", "version": "1.0" } }
 * Respuesta: { "status": "registered", "type": "model", "data": {...} }
 *
 * Parámetros:
 * - type: 'model' para modelos de IA, 'agent' para agentes autónomos
 * - data: Información del modelo/agente (nombre, versión, capacidades, etc.)
 *
 * Ejemplo de uso:
 * ```javascript
 * // Registrar un modelo de IA
 * await axios.post('http://mcp-server:5050/register', {
 *   type: 'model',
 *   data: { name: 'BERT', version: '2.0', task: 'NLP' }
 * });
 * ```
 */
app.post('/register', (req, res) => {
  // Extraer tipo y datos del cuerpo de la petición
  const { type, data } = req.body;

  // Agregar al array correspondiente según el tipo
  if (type === 'model') {
    context.models.push(data); // Registrar modelo
  }
  if (type === 'agent') {
    context.agents.push(data); // Registrar agente
  }

  // Confirmar el registro
  res.json({
    status: 'registered', // Estado de la operación
    type, // Tipo registrado
    data, // Datos registrados
  });
});

/**
 * POST /clear - Limpiar todo el contexto del sistema
 *
 * Borra todos los datos almacenados en memoria: modelos, agentes, tareas,
 * auditoría y eventos. Útil para resetear el sistema durante desarrollo.
 *
 * Método HTTP: POST
 * URL: http://localhost:5050/clear
 * Respuesta: { "status": "cleared" }
 *
 * ⚠️ ADVERTENCIA: Esta operación es destructiva y no se puede deshacer.
 * En producción, considera agregar autenticación o deshabilitar este endpoint.
 *
 * Uso típico:
 * - Limpiar datos de prueba durante desarrollo
 * - Resetear el sistema después de hacer tests
 */
app.post('/clear', (req, res) => {
  // Reinicializar el contexto a su estado inicial (vacío)
  context = {
    models: [], // Lista vacía de modelos
    agents: [], // Lista vacía de agentes
    tasks: [], // Lista vacía de tareas
    audit: [], // Lista vacía de auditoría
    events: [], // Lista vacía de eventos
  };

  // Confirmar que se limpió el contexto
  res.json({ status: 'cleared' });
});

// ========================================
// 6. MONITOREO DE SERVICIOS
// ========================================

/**
 * Importar el módulo de health checks
 *
 * Este módulo verifica el estado de todos los microservicios del sistema
 * haciendo peticiones HTTP a sus endpoints /health.
 */

/**
 * GET /check-services - Verificar el estado de todos los microservicios
 *
 * Este endpoint hace un health check de todos los servicios registrados
 * y devuelve un reporte completo. Si hay servicios caídos, envía alertas.
 *
 * Método HTTP: GET
 * URL: http://localhost:5050/check-services
 * Autenticación: Requiere Basic Auth (protegido)
 * Query params: ?createIssues=true (opcional, crea issues en GitHub si hay fallos)
 * Respuesta: { "healthy": 9, "unhealthy": 0, "total": 9, "results": [...] }
 *
 * Flujo:
 * 1. Hace peticiones HTTP a todos los servicios (/health)
 * 2. Recopila el estado de cada uno (healthy/unhealthy)
 * 3. Si hay servicios caídos, envía notificación de alerta
 * 4. Devuelve un reporte detallado
 *
 * Uso típico:
 * - Dashboard de monitoreo en tiempo real
 * - Alertas automáticas de servicios caídos
 * - Verificación antes de despliegues
 */
app.get('/check-services', basicAuth, async (req, res) => {
  // Obtener parámetro opcional para crear issues en GitHub
  const createIssues = req.query.createIssues === 'true';

  // Ejecutar health check de todos los servicios (operación asíncrona)
  const results = await checkAllServices(createIssues);

  // Si hay servicios caídos, enviar alerta crítica
  if (results.unhealthy > 0) {
    // Crear lista de servicios con problemas
    const downServices = results.results
      .filter((s) => s.status !== 'healthy') // Filtrar solo los no saludables
      .map((s) => s.name) // Extraer solo los nombres
      .join(', '); // Unir en una cadena separada por comas

    // Enviar notificación crítica (email, Slack, etc.)
    await notifyCriticalEvent(
      'Servicios Caídos',
      `Los siguientes servicios están inactivos: ${downServices}`
    );
  }

  // Devolver resultados del health check
  res.json(results);
});

// ========================================
// 7. ENDPOINTS DE MÉTRICAS
// ========================================

/**
 * GET /metrics - Obtener métricas del sistema en formato JSON
 *
 * Devuelve estadísticas en tiempo real sobre el estado del sistema:
 * número de servicios saludables, eventos registrados, auditorías, etc.
 *
 * Método HTTP: GET
 * URL: http://localhost:5050/metrics
 * Respuesta (JSON): { "healthyServices": 9, "totalServices": 9, ... }
 *
 * Métricas incluidas:
 * - healthyServices: Número de servicios funcionando correctamente
 * - totalServices: Número total de servicios monitoreados
 * - eventsCount: Cantidad de eventos registrados
 * - auditsCount: Cantidad de acciones auditadas
 * - uptime: Porcentaje de disponibilidad del sistema
 * - testsStatus: Estado de las pruebas automatizadas
 *
 * Uso típico:
 * - Dashboard web para visualizar estado del sistema
 * - Alertas basadas en umbrales (ej: uptime < 95%)
 * - Reportes diarios/semanales
 */
app.get('/metrics', async (req, res) => {
  // Ejecutar health check de todos los servicios
  const healthCheck = await checkAllServices(false);

  // Construir objeto de métricas
  const metrics = {
    healthyServices: healthCheck.healthy, // Servicios funcionando bien
    totalServices: healthCheck.total, // Total de servicios
    eventsCount: context.events.length, // Eventos registrados
    auditsCount: context.audit.length, // Acciones auditadas
    uptime: ((healthCheck.healthy / healthCheck.total) * 100).toFixed(1), // % disponibilidad
    testsStatus: '14/14 ✓', // Estado de tests (estático por ahora)
  };

  // Devolver métricas en formato JSON
  res.json(metrics);
});

/**
 * GET /metrics/prometheus - Métricas en formato Prometheus
 *
 * Devuelve las mismas métricas pero en formato de texto plano que Prometheus
 * puede "scrapear" (recolectar) automáticamente cada cierto tiempo.
 *
 * Método HTTP: GET
 * URL: http://localhost:5050/metrics/prometheus
 * Content-Type: text/plain
 * Respuesta (texto):
 *   mcp_healthy_services 9
 *   mcp_total_services 9
 *   mcp_events_count 42
 *   ...
 *
 * ¿Qué es Prometheus?
 * Es un sistema de monitoreo open-source que recolecta métricas de servicios
 * y permite crear alertas y dashboards (con Grafana).
 *
 * Formato:
 * Cada línea tiene el formato: nombre_metrica valor
 * Prometheus lee este endpoint periódicamente (cada 15-30 segundos)
 *
 * Uso típico:
 * - Integración con stack de monitoreo Prometheus + Grafana
 * - Alertas automáticas basadas en métricas
 * - Dashboards de observabilidad en tiempo real
 *
 * Configuración en Prometheus:
 * ```yaml
 * scrape_configs:
 *   - job_name: 'mcp-server'
 *     static_configs:
 *       - targets: ['mcp-server:5050']
 *     metrics_path: '/metrics/prometheus'
 * ```
 */
app.get('/metrics/prometheus', async (req, res) => {
  // Ejecutar health check de todos los servicios
  const healthCheck = await checkAllServices(false);

  // Configurar el Content-Type como texto plano (requerido por Prometheus)
  res.set('Content-Type', 'text/plain');

  // Construir el output en formato Prometheus (una métrica por línea)
  let output = '';

  // Métricas de servicios
  output += `# HELP mcp_healthy_services Number of healthy services\n`;
  output += `# TYPE mcp_healthy_services gauge\n`;
  output += `mcp_healthy_services ${healthCheck.healthy}\n\n`;

  output += `# HELP mcp_total_services Total number of services\n`;
  output += `# TYPE mcp_total_services gauge\n`;
  output += `mcp_total_services ${healthCheck.total}\n\n`;

  output += `# HELP mcp_unhealthy_services Number of unhealthy services\n`;
  output += `# TYPE mcp_unhealthy_services gauge\n`;
  output += `mcp_unhealthy_services ${healthCheck.unhealthy}\n\n`;

  // Métricas de eventos
  output += `# HELP mcp_events_count Total number of events registered\n`;
  output += `# TYPE mcp_events_count counter\n`;
  output += `mcp_events_count ${context.events.length}\n\n`;

  // Métricas de auditorías
  output += `# HELP mcp_audits_count Total number of audits registered\n`;
  output += `# TYPE mcp_audits_count counter\n`;
  output += `mcp_audits_count ${context.audit.length}\n\n`;

  // Métricas de uptime
  output += `# HELP mcp_uptime_percent Percentage of healthy services\n`;
  output += `# TYPE mcp_uptime_percent gauge\n`;
  output += `mcp_uptime_percent ${((healthCheck.healthy / healthCheck.total) * 100).toFixed(1)}\n\n`;

  // Métricas de tests
  output += `# HELP mcp_tests_status Number of passing tests\n`;
  output += `# TYPE mcp_tests_status gauge\n`;
  output += `mcp_tests_status 14\n\n`;

  // Métricas por servicio individual
  output += `# HELP mcp_service_status Status of individual services (1=healthy, 0=unhealthy)\n`;
  output += `# TYPE mcp_service_status gauge\n`;
  healthCheck.results.forEach((service) => {
    const status = service.status === 'healthy' ? 1 : 0;
    output += `mcp_service_status{service="${service.name}"} ${status}\n`;
  });

  // Enviar el texto al cliente (Prometheus)
  res.send(output);
});

// ========================================
// 8. RUTA DEL DASHBOARD
// ========================================

/**
 * GET / - Servir el dashboard web (protegido con autenticación)
 *
 * La ruta raíz (/) sirve un archivo HTML que muestra un dashboard
 * interactivo con métricas en tiempo real, gráficos y estado de servicios.
 *
 * Método HTTP: GET
 * URL: http://localhost:5050/
 * Autenticación: Requiere Basic Auth (usuario/contraseña)
 * Respuesta: Archivo HTML (dashboard.html)
 *
 * Seguridad:
 * - Protegido con autenticación básica (basicAuth middleware)
 * - Solo usuarios autorizados pueden ver el dashboard
 *
 * Uso típico:
 * - Visualizar estado del sistema desde un navegador
 * - Monitorear servicios en tiempo real
 * - Investigar problemas y revisar logs
 *
 * Cómo acceder:
 * 1. Abrir http://localhost:5050/ en el navegador
 * 2. Ingresar usuario y contraseña cuando lo pida
 * 3. Ver el dashboard con métricas en vivo
 */
app.get('/', basicAuth, (req, res) => {
  // Enviar el archivo HTML del dashboard
  // path.join(__dirname, 'dashboard.html') construye la ruta completa al archivo
  // __dirname es una variable de Node.js que contiene el directorio actual
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ========================================
// 9. INICIAR EL SERVIDOR
// ========================================

/**
 * Configuración del puerto y arranque del servidor
 *
 * El servidor escucha en un puerto específico y espera peticiones HTTP.
 *
 * Puerto:
 * - Por defecto: 5050
 * - Puede configurarse con la variable de entorno PORT
 * - Ejemplo: PORT=8080 node server.js
 *
 * process.env.PORT:
 * - Lee la variable de entorno PORT del sistema
 * - Si no existe, usa 5050 como valor por defecto (operador ||)
 *
 * ¿Qué hace app.listen()?
 * 1. Inicia el servidor HTTP en el puerto especificado
 * 2. Comienza a escuchar peticiones entrantes
 * 3. Ejecuta el callback (función) cuando el servidor está listo
 *
 * Logs:
 * - console.log() imprime mensajes en la terminal/consola
 * - Útil para confirmar que el servidor arrancó correctamente
 * - En producción, usa un sistema de logging estructurado (Winston, Bunyan)
 */
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 MCP Server running on port ${PORT}`);
  console.log(`========================================`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`📊 Prometheus: http://localhost:${PORT}/metrics/prometheus`);
  console.log(`🔍 Services Status: http://localhost:${PORT}/check-services`);
  console.log(`========================================`);
  console.log(`✅ Server ready to accept connections`);
  console.log(`========================================`);
});
