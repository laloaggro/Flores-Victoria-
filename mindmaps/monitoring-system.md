# Mapa Mental: Sistema de Monitoreo

## Prometheus

- **Recopilación de Métricas**
  - Scraping cada 15 segundos
    - Intervalo configurable
    - Recopilación automática
  - Evaluación de reglas
    - Alertas basadas en condiciones
    - Reglas de registro
  - Almacenamiento de datos
    - Series temporales
    - Compresión eficiente

- **Fuentes de Métricas**
  - Servicios individuales (puertos 3000-3008)
    - Métricas HTTP
    - Tiempos de respuesta
    - Códigos de estado
    - Tasa de solicitudes
  - Bases de datos
    - PostgreSQL (puerto 9187)
      - Conexiones activas
      - Consultas por segundo
      - Tamaño de base de datos
      - Caché hit ratio
    - Redis (puerto 9121)
      - Uso de memoria
      - Comandos procesados
      - Conexiones de cliente
      - Hit ratio de caché
    - MongoDB (puerto 9216)
      - Operaciones por segundo
      - Uso de memoria
      - Estado de réplicas
      - Tamaño de colecciones
  - RabbitMQ (puerto 15692)
    - Mensajes en colas
    - Consumidores activos
    - Tasa de publicación
    - Tasa de entrega

- **Configuración**
  - Archivo: prometheus.yml
    - Configuración global
    - Reglas de scraping
    - Alertmanagers
  - Intervalos de scraping
    - scrape_interval: 15s
    - evaluation_interval: 15s
  - Jobs para cada servicio
    - Configuración individual
    - Endpoints específicos
    - Rutas de métricas

## Grafana

- **Visualización**
  - Dashboards
    - Paneles personalizados
    - Variables de dashboard
    - Templates
  - Gráficos en tiempo real
    - Series temporales
    - Gráficos de barra
    - Gráficos circulares
    - Mapas de calor
  - Alertas
    - Reglas de alerta
    - Canales de notificación
    - Umbrales configurables

- **Conexión**
  - Fuente de datos: Prometheus
    - Selección de fuente
    - Configuración de acceso
  - Puerto: 3009
    - Acceso web seguro
    - Enrutamiento de red
  - Acceso web
    - Interfaz de usuario
    - Explorador de métricas
    - Editor de consultas

- **Configuración**
  - Aprovisionamiento automático
    - Configuración en archivos
    - Recarga sin reinicio
  - Datasource: Prometheus
    - Nombre: Prometheus
    - URL: http://prometheus:9090
    - Acceso: proxy
  - URL: http://prometheus:9090
    - Conexión interna
    - Sin exposición externa

## Exportadores de Métricas

- **Postgres Exporter**
  - Imagen: quay.io/prometheuscommunity/postgres-exporter:v0.12.0
    - Versión estable
    - Mantenido por la comunidad
  - Puerto: 9187
    - Endpoint: /metrics
    - Seguridad de red
  - Conexión: PostgreSQL
    - Variables de entorno
    - Cadena de conexión segura
  - Métricas específicas
    - pg_database_size
    - pg_stat_database
    - pg_stat_user_tables

- **Redis Exporter**
  - Imagen: oliver006/redis_exporter:v1.50.0
    - Exportador popular
    - Actualizaciones frecuentes
  - Puerto: 9121
    - Endpoint: /metrics
    - Compatibilidad
  - Conexión: Redis
    - Dirección del host
    - Puerto estándar
  - Métricas específicas
    - redis_connected_clients
    - redis_commands_processed_total
    - redis_keyspace_hits_total

- **MongoDB Exporter**
  - Imagen: percona/mongodb_exporter:0.35.0
    - Exportador especializado
    - Métricas detalladas
  - Puerto: 9216
    - Endpoint: /metrics
    - Configuración flexible
  - Conexión: MongoDB
    - URI completa
    - Autenticación incluida
  - Métricas específicas
    - mongodb_ss_metrics_operation
    - mongodb_ss_wt_cache
    - mongodb_dbstats_collections

## Acceso a Interfaces

- **Prometheus**
  - URL: http://localhost:9090
    - Acceso local
    - Sin exposición pública
  - Interfaz web
    - Menú de consola
    - Graph y Status
    - Targets y Rules
  - Consultas PromQL
    - Lenguaje de consulta
    - Funciones de agregación
    - Operadores

- **Grafana**
  - URL: http://localhost:3009
    - Puerto específico
    - Acceso administrativo
  - Usuario: admin
    - Credenciales por defecto
    - Cambio recomendado
  - Contraseña: admin
    - Seguridad inicial
    - Configuración de seguridad

## Métricas Disponibles

- **Por Servicio**
  - Estado del servicio
    - http_requests_total
    - http_request_duration_seconds
    - process_cpu_seconds_total
  - Tiempo de respuesta
    - Histogramas
    - Percentiles (50, 95, 99)
  - Carga del sistema
    - Uso de CPU
    - Uso de memoria
    - Hilos activos

- **Por Base de Datos**
  - Conexiones
    - Conexiones activas
    - Conexiones máximas
    - Tasa de conexión
  - Consultas por segundo
    - Lecturas
    - Escrituras
    - Totales
  - Uso de memoria
    - Caché
    - Buffers
    - Total del sistema

- **Por Mensajería**
  - Colas
    - Mensajes en espera
    - Mensajes no entregados
    - Tamaño de colas
  - Mensajes procesados
    - Publicados
    - Entregados
    - Confirmados
  - Consumidores
    - Activos
    - Inactivos
    - Por cola