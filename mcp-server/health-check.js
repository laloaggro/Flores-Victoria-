// Health Check endpoint con creación automática de issues en GitHub
// Bilingüe ES/EN

const axios = require('axios');

const SERVICES_TO_CHECK = [
  // Use explicit /health endpoints to avoid 404 when services expose health at /health
  { name: 'api-gateway', url: 'http://localhost:3000/health', port: 3000 },
  { name: 'auth-service', url: 'http://localhost:3001/health', port: 3001 },
  { name: 'product-service', url: 'http://localhost:3009/health', port: 3009 },
  { name: 'user-service', url: 'http://localhost:3003/health', port: 3003 },
  { name: 'order-service', url: 'http://localhost:3004/health', port: 3004 },
  { name: 'cart-service', url: 'http://localhost:3005/health', port: 3005 },
  { name: 'wishlist-service', url: 'http://localhost:3006/health', port: 3006 },
  { name: 'review-service', url: 'http://localhost:3007/health', port: 3007 },
  { name: 'contact-service', url: 'http://localhost:3008/health', port: 3008 }
];

/**
 * Verifica salud de un servicio / Check service health
 */
async function checkServiceHealth(service) {
  try {
    const response = await axios.get(service.url, { timeout: 5000 });
    return {
      name: service.name,
      status: 'healthy',
      statusCode: response.status,
      message: 'Service is responding'
    };
  } catch (error) {
    return {
      name: service.name,
      status: 'unhealthy',
      statusCode: error.response?.status || 0,
      message: error.message,
      error: error.code
    };
  }
}

/**
 * Crea issue en GitHub si servicio está caído / Create GitHub issue if service is down
 */
async function createGitHubIssue(service, healthCheck) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'laloaggro';
  const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'Flores-Victoria-';

  if (!GITHUB_TOKEN) {
    console.log('⚠️ GITHUB_TOKEN no configurado, saltando creación de issue');
    return;
  }

  const issueTitle = `⚠️ ${service.name} no responde / ${service.name} not responding`;
  const issueBody = `
## 🚨 Alerta de Servicio / Service Alert

El servicio **${service.name}** no está respondiendo correctamente.
The service **${service.name}** is not responding correctly.

### Detalles / Details

- **Servicio / Service:** ${service.name}
- **Puerto / Port:** ${service.port}
- **URL:** ${service.url}
- **Estado / Status:** ${healthCheck.status}
- **Código HTTP / HTTP Code:** ${healthCheck.statusCode}
- **Error:** ${healthCheck.error || 'N/A'}
- **Mensaje / Message:** ${healthCheck.message}
- **Timestamp:** ${new Date().toISOString()}

### Acciones Recomendadas / Recommended Actions

1. Verificar logs del servicio / Check service logs
2. Verificar estado de Docker containers / Check Docker containers status
3. Revisar configuración de red / Review network configuration
4. Verificar dependencias (DB, Redis, etc.) / Check dependencies (DB, Redis, etc.)

### Comandos Útiles / Useful Commands

\`\`\`bash
# Ver logs del servicio
docker logs flores-victoria-${service.name}-1

# Verificar estado del container
docker ps | grep ${service.name}

# Reiniciar servicio
docker compose -f docker-compose.dev-simple.yml restart ${service.name}
\`\`\`

---
*Este issue fue creado automáticamente por el sistema de monitoreo MCP.*
*This issue was created automatically by the MCP monitoring system.*
`;

  try {
    const response = await axios.post(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
      {
        title: issueTitle,
        body: issueBody,
        labels: ['bug', 'high-priority', 'automated', `service:${service.name}`]
      },
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    console.log(`✅ Issue creado: ${response.data.html_url}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando issue en GitHub:', error.message);
    return null;
  }
}

/**
 * Endpoint para verificar salud de todos los servicios / Endpoint to check all services health
 */
async function checkAllServices(createIssuesOnFailure = false) {
  const results = [];
  const failed = [];

  for (const service of SERVICES_TO_CHECK) {
    const healthCheck = await checkServiceHealth(service);
    results.push(healthCheck);

    if (healthCheck.status === 'unhealthy') {
      failed.push(service.name);
      
      if (createIssuesOnFailure) {
        await createGitHubIssue(service, healthCheck);
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    total: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    unhealthy: results.filter(r => r.status === 'unhealthy').length,
    results,
    failed
  };
}

module.exports = { checkAllServices, checkServiceHealth, createGitHubIssue };
