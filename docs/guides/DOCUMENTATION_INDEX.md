# 📚 Índice de Documentación - Flores Victoria

> Acceso rápido a toda la documentación del proyecto

## 🚀 Guías de Inicio Rápido

### Para Desarrolladores

1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guía completa de deployment
   - Instalación local
   - Deployment con Docker
   - Deployment en producción
   - Variables de entorno
   - Troubleshooting

2. **[CONNECTIVITY_GUIDE.md](./CONNECTIVITY_GUIDE.md)** - Arquitectura y conectividad
   - Diagrama de arquitectura del sistema
   - Configuración del API Gateway
   - Configuración de microservicios
   - Guía de troubleshooting
   - Scripts de testing

3. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Referencia completa de API
   - Autenticación y seguridad
   - Endpoints de productos
   - API de recomendaciones AI
   - Procesamiento de imágenes WASM
   - Servicio de pagos
   - Generación de imágenes AI
   - Rate limiting y códigos de estado

## 📖 Documentación Técnica

### Arquitectura

- **[ADMIN_PANEL_v4.0_DOCUMENTATION.md](./ADMIN_PANEL_v4.0_DOCUMENTATION.md)** - Panel de
  administración unificado
- **[ADMIN_PANEL_ARCHITECTURE_DIAGRAM.txt](./ADMIN_PANEL_ARCHITECTURE_DIAGRAM.txt)** - Diagrama de
  arquitectura del admin
- **[ARQUITECTURA_VISUAL.md](./ARQUITECTURA_VISUAL.md)** - Arquitectura visual del sistema
- **[ANALISIS_ESTRUCTURA_PROYECTO.md](./ANALISIS_ESTRUCTURA_PROYECTO.md)** - Análisis de estructura

### Implementación

- **[COMPLETE_IMPLEMENTATION_REPORT.md](./COMPLETE_IMPLEMENTATION_REPORT.md)** - Reporte de
  implementación completo
- **[CONSOLIDACION_FINAL_COMPLETADA.md](./CONSOLIDACION_FINAL_COMPLETADA.md)** - Consolidación final
- **[ADMIN_UNIFICADO_COMPLETADO.md](./ADMIN_UNIFICADO_COMPLETADO.md)** - Admin unificado completado

### Actualizaciones

- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios
- **[ACTUALIZACION_COMPLETADA_v3.0.md](./ACTUALIZACION_COMPLETADA_v3.0.md)** - Actualización v3.0
- **[ACTUALIZACION_v2.0.0_RESUMEN.md](./ACTUALIZACION_v2.0.0_RESUMEN.md)** - Actualización v2.0

## 🛠️ Guías de Operación

### Estado del Sistema

- **[ESTADO_ACTUAL_PROYECTO.md](./ESTADO_ACTUAL_PROYECTO.md)** - Estado actual del proyecto
- **[ESTADO_FINAL_SISTEMA.txt](./ESTADO_FINAL_SISTEMA.txt)** - Estado final del sistema
- **[GUIA_SERVICIOS_ACTIVOS.md](./GUIA_SERVICIOS_ACTIVOS.md)** - Guía de servicios activos

### Uso y Mejoras

- **[GUIA_USO_SISTEMA.md](./GUIA_USO_SISTEMA.md)** - Guía de uso del sistema
- **[GUIA_USO_MEJORAS.md](./GUIA_USO_MEJORAS.md)** - Guía de uso de mejoras
- **[GUIA_VENTANA_LOGS.md](./GUIA_VENTANA_LOGS.md)** - Guía de ventana de logs

## 🔐 Seguridad y Validación

- **[REPORTE_VALIDACION_FINAL.md](./REPORTE_VALIDACION_FINAL.md)** - Reporte de validación final
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Código de conducta
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guía para contribuir

## 📊 Análisis y Reportes

### CSS y Frontend

- **[CSS_ANALYSIS_REPORT.md](./CSS_ANALYSIS_REPORT.md)** - Reporte de análisis CSS
- **[CSS_CORRECTIONS_APPLIED.md](./CSS_CORRECTIONS_APPLIED.md)** - Correcciones CSS aplicadas

### Servidores y Servicios

- **[ANALISIS_SERVIDORES_5173_5175.md](./ANALISIS_SERVIDORES_5173_5175.md)** - Análisis de
  servidores

## 🧪 Testing y Desarrollo

- **[CHROME_DEVTOOLS_SETUP.md](./CHROME_DEVTOOLS_SETUP.md)** - Setup de Chrome DevTools
- **Backend Tests**: `backend/tests/`
- **Frontend Tests**: `frontend/tests/`
- **Integration Tests**: `tests/integration/`

## 📝 Scripts de Automatización

### Deployment

```bash
./flores-victoria.sh    # Script principal
./dev.sh                # Modo desarrollo
./automate-optimized.sh # Automatización optimizada
```

### Mantenimiento

```bash
./automated-backup.sh   # Backups automáticos
./fix-critical-issues.sh # Solución de problemas críticos
```

### Análisis

```bash
./analytics.sh          # Analytics
./check-detailed-status.sh # Estado detallado
```

## 🐳 Docker y Orquestación

### Docker Compose Files

- **[docker-compose.yml](./docker-compose.yml)** - Configuración principal
- **[docker-compose.dev.yml](./docker-compose.dev.yml)** - Desarrollo
- **[docker-compose.prod.yml](./docker-compose.prod.yml)** - Producción
- **[docker-compose.testing.yml](./docker-compose.testing.yml)** - Testing

### Dockerfiles

- **[Dockerfile.ai-service](./Dockerfile.ai-service)** - Servicio AI
- **[Dockerfile.auth-service](./Dockerfile.auth-service)** - Servicio Auth
- **[Dockerfile.order-service](./Dockerfile.order-service)** - Servicio Orders
- **[Dockerfile.payment-service](./Dockerfile.payment-service)** - Servicio Payments

## 🎨 Recursos Visuales

- **[arquitectura-interactiva.html](./arquitectura-interactiva.html)** - Arquitectura interactiva
- **[diagramas-tecnicos.js](./diagramas-tecnicos.js)** - Diagramas técnicos

## 📌 Referencias Rápidas

### Puertos del Sistema

```
Frontend:          5173
Admin Panel:       3021
API Gateway:       3000
AI Recommendations: 3002
WASM Processor:    3003 (container) / 3012 (host)
Payment Service:   3018
MongoDB:           27017
PostgreSQL:        5432
Redis:             6379
```

Ver más en: **[PUERTOS_PROYECTOS.md](./PUERTOS_PROYECTOS.md)** y
**[EJEMPLOS_PUERTOS.md](./EJEMPLOS_PUERTOS.md)**

### Variables de Entorno

Ver **[ENVIRONMENT_COLORS_GUIDE.md](./ENVIRONMENT_COLORS_GUIDE.md)**

### Tareas Pendientes

Ver **[COSAS PENDIENTES.md](./COSAS%20PENDIENTES.md)**

## 🆘 Ayuda Rápida

### ¿Cómo empiezo?

1. Lee [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Configura el entorno siguiendo las instrucciones
3. Ejecuta `./flores-victoria.sh` o `npm run start`

### ¿Cómo funciona la arquitectura?

1. Lee [CONNECTIVITY_GUIDE.md](./CONNECTIVITY_GUIDE.md)
2. Revisa [ARQUITECTURA_VISUAL.md](./ARQUITECTURA_VISUAL.md)
3. Consulta el diagrama en [arquitectura-interactiva.html](./arquitectura-interactiva.html)

### ¿Cómo uso las APIs?

1. Consulta [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Prueba los endpoints con los ejemplos cURL incluidos
3. Revisa Swagger UI en `http://localhost:3000/api-docs`

### ¿Problemas?

1. Revisa la sección Troubleshooting en [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Consulta [GUIA_SERVICIOS_ACTIVOS.md](./GUIA_SERVICIOS_ACTIVOS.md)
3. Ejecuta `./check-detailed-status.sh` para ver el estado

## 📱 Contacto y Contribuciones

- **Reportar bugs**: Abre un issue en GitHub
- **Contribuir**: Lee [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Código de conducta**: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

---

**Última actualización**: 28 de octubre de 2025  
**Versión del sistema**: 4.0.0 Enterprise Edition
