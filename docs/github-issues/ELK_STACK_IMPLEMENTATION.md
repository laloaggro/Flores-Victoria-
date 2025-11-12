# 🗄️ Implementar ELK Stack para Logging Centralizado

## 📋 Descripción

Implementar stack completo de ELK (Elasticsearch, Logstash, Kibana) para logging centralizado y
análisis de logs en el sistema Flores Victoria.

**Estado actual:** Configuración preparada pero no activa  
**Versión objetivo:** v2.1 o superior  
**Prioridad:** Media  
**Estimación:** 2-3 días

## 🎯 Objetivos

- [ ] Crear `docker-compose.elk.yml` funcional
- [ ] Integrar ELK Stack con sistema principal
- [ ] Configurar pipelines de Logstash para cada microservicio
- [ ] Crear dashboards en Kibana para visualización
- [ ] Conectar Winston logs de microservicios a Logstash
- [ ] Documentar uso y configuración

## 📊 Contexto

### Infraestructura Existente

**✅ Ya tenemos:**

- `logging/filebeat/filebeat.yml` - Configuración de Filebeat
- `logging/logstash/config/` - Configuración de Logstash
- `logging/logstash/pipeline/` - Pipelines preparados
- `admin-panel/public/elk-stack.html` - UI completa (470 líneas)
- Enlaces en navegación del admin panel

**❌ Falta:**

- Docker compose para levantar servicios
- Integración con microservicios actuales
- Configuración de índices en Elasticsearch
- Dashboards configurados en Kibana

### Análisis Completo

Ver documentación detallada en:

- `docs/RECURSOS_NO_UTILIZADOS.md` (sección 1 - ELK Stack)

## 🔧 Plan de Implementación

### Fase 1: Docker Compose (Día 1 - Medio día)

Crear `docker-compose.elk.yml`:

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: flores-victoria-elasticsearch
    restart: unless-stopped
    ports:
      - '9200:9200'
      - '9300:9300'
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - 'ES_JAVA_OPTS=-Xms512m -Xmx512m'
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - app-network
    healthcheck:
      test: ['CMD-SHELL', 'curl -f http://localhost:9200/_cluster/health || exit 1']
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: flores-victoria-logstash
    restart: unless-stopped
    ports:
      - '5000:5000'
      - '9600:9600'
    volumes:
      - ./logging/logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml
      - ./logging/logstash/pipeline:/usr/share/logstash/pipeline
    environment:
      - 'LS_JAVA_OPTS=-Xms256m -Xmx256m'
    networks:
      - app-network
    depends_on:
      - elasticsearch
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9600']
      interval: 30s
      timeout: 10s
      retries: 5

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: flores-victoria-kibana
    restart: unless-stopped
    ports:
      - '5601:5601'
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - app-network
    depends_on:
      - elasticsearch
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:5601/api/status']
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    container_name: flores-victoria-filebeat
    restart: unless-stopped
    user: root
    volumes:
      - ./logging/filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - app-network
    depends_on:
      - logstash
      - elasticsearch

networks:
  app-network:
    external: true

volumes:
  elasticsearch-data:
    driver: local
```

### Fase 2: Integración con Microservicios (Día 1-2)

**Configurar Winston en cada microservicio:**

```javascript
// Agregar a cada servicio: auth, user, product, etc.
const winston = require('winston');
const LogstashTransport = require('winston-logstash/lib/winston-logstash-latest');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new LogstashTransport({
      port: 5000,
      host: 'logstash',
      max_connect_retries: -1,
    }),
  ],
});
```

**Instalar dependencias:**

```bash
cd microservices/auth-service && npm install winston-logstash
cd microservices/user-service && npm install winston-logstash
cd microservices/product-service && npm install winston-logstash
# Repetir para cada servicio
```

### Fase 3: Configuración de Logstash (Día 2)

**Actualizar `logging/logstash/pipeline/logstash.conf`:**

```conf
input {
  tcp {
    port => 5000
    codec => json
  }
  beats {
    port => 5044
  }
}

filter {
  if [service] {
    mutate {
      add_field => { "[@metadata][service]" => "%{service}" }
    }
  }

  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:msg}" }
  }

  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "flores-victoria-%{[@metadata][service]}-%{+YYYY.MM.dd}"
  }

  stdout { codec => rubydebug }
}
```

### Fase 4: Dashboards Kibana (Día 2-3)

**Crear índices y visualizaciones:**

1. Acceder a Kibana: http://localhost:5601
2. Crear index patterns: `flores-victoria-*`
3. Crear dashboards:
   - Logs por servicio
   - Errores en tiempo real
   - Requests por minuto
   - Latencia de servicios

### Fase 5: Scripts de Gestión (Día 3)

**Agregar a `package.json`:**

```json
{
  "scripts": {
    "elk:up": "docker compose -f docker-compose.elk.yml up -d",
    "elk:down": "docker compose -f docker-compose.elk.yml down",
    "elk:logs": "docker compose -f docker-compose.elk.yml logs -f",
    "elk:restart": "npm run elk:down && npm run elk:up",
    "elk:clean": "docker compose -f docker-compose.elk.yml down -v"
  }
}
```

**Actualizar `start-all.sh`:**

```bash
# Agregar después de levantar servicios principales
echo "📊 Levantando ELK Stack (opcional)..."
read -p "¿Deseas levantar ELK Stack? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose -f docker-compose.elk.yml up -d
    echo "✅ ELK Stack iniciado"
fi
```

## 📈 Beneficios Esperados

### Logging Centralizado

- **Un solo lugar** para ver logs de todos los microservicios
- **Búsqueda avanzada** con Elasticsearch
- **Retención configurable** de logs históricos

### Debugging Mejorado

- **Correlación de eventos** entre servicios
- **Análisis de errores** en tiempo real
- **Trazabilidad completa** de requests

### Monitoreo Proactivo

- **Alertas automáticas** en errores críticos
- **Métricas visuales** de rendimiento
- **Análisis de tendencias** a largo plazo

## 📊 Recursos Requeridos

### Requisitos de Sistema

- **RAM adicional:** ~2-3 GB (Elasticsearch 1-2GB, Logstash 500MB, Kibana 500MB)
- **Disco:** ~5-10 GB para logs (depende de retención)
- **CPU:** Mínimo 2 cores recomendado

### Tiempos Estimados

- **Setup inicial:** 4-6 horas
- **Configuración pipelines:** 2-3 horas
- **Integración microservicios:** 3-4 horas
- **Dashboards y testing:** 2-3 horas
- **Total:** 11-16 horas (2-3 días)

## ✅ Criterios de Aceptación

- [ ] ELK Stack levanta con `npm run elk:up`
- [ ] Elasticsearch responde en puerto 9200
- [ ] Kibana accesible en puerto 5601
- [ ] Logstash recibiendo logs en puerto 5000
- [ ] Logs de microservicios llegan a Elasticsearch
- [ ] Admin panel muestra Kibana embebido sin errores
- [ ] Dashboards básicos configurados
- [ ] Documentación actualizada
- [ ] Scripts de gestión funcionando
- [ ] Tests de integración pasando

## 📚 Documentación a Actualizar

- [ ] `README.md` - Agregar sección ELK Stack
- [ ] `QUICK_REFERENCE.md` - Comandos de ELK
- [ ] `docs/RECURSOS_NO_UTILIZADOS.md` - Marcar como implementado
- [ ] `CHANGELOG.md` - Agregar en v2.1
- [ ] Crear `docs/ELK_STACK_GUIDE.md` - Guía completa de uso

## 🔗 Referencias

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Logstash Documentation](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Winston Logstash Transport](https://github.com/jaakkos/winston-logstash)
- Análisis interno: `docs/RECURSOS_NO_UTILIZADOS.md`

## 🏷️ Labels

- `enhancement`
- `infrastructure`
- `logging`
- `v2.1`
- `medium-priority`

## 👥 Asignado a

@laloaggro

## 📅 Milestone

v2.1 - Enhanced Observability

---

**Nota:** Este issue fue generado automáticamente desde el análisis de recursos no utilizados
(22/10/2025). Ver `docs/RECURSOS_NO_UTILIZADOS.md` para contexto completo.
