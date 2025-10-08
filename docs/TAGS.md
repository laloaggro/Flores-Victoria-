# Sistema de Etiquetas y Tags - Flores Victoria

## Introducción

Este documento define el sistema de etiquetas y tags utilizado en el proyecto Flores Victoria para facilitar la organización, búsqueda y mantenimiento de la documentación y código.

## Categorías de Etiquetas

### 1. Tipo de Cambio
Etiquetas que identifican la naturaleza del cambio o adición:

- `feature` - Nueva funcionalidad
- `bugfix` - Corrección de errores
- `refactor` - Refactorización de código
- `docs` - Cambios en documentación
- `security` - Mejoras de seguridad
- `performance` - Mejoras de rendimiento
- `deployment` - Cambios en despliegue
- `config` - Cambios en configuración
- `test` - Adición o modificación de pruebas
- `maintenance` - Tareas de mantenimiento
- `cleanup` - Limpieza de código
- `hotfix` - Correcciones urgentes

### 2. Componente del Sistema
Etiquetas que identifican el componente afectado:

- `frontend` - Interfaz de usuario
- `backend` - Lógica del servidor
- `api-gateway` - Gateway de servicios
- `auth-service` - Servicio de autenticación
- `product-service` - Servicio de productos
- `user-service` - Servicio de usuarios
- `order-service` - Servicio de pedidos
- `cart-service` - Servicio de carrito
- `wishlist-service` - Servicio de lista de deseos
- `review-service` - Servicio de reseñas
- `contact-service` - Servicio de contacto
- `audit-service` - Servicio de auditoría
- `messaging-service` - Servicio de mensajería
- `i18n-service` - Servicio de internacionalización
- `analytics-service` - Servicio de análisis
- `admin-panel` - Panel de administración
- `database` - Cambios en base de datos
- `docker` - Configuración de contenedores
- `kubernetes` - Orquestación de contenedores
- `monitoring` - Monitoreo y observabilidad
- `ci-cd` - Integración y despliegue continuo
- `logging` - Sistema de logs
- `cache` - Sistema de caché
- `messaging` - Sistema de mensajería

### 3. Prioridad
Etiquetas que indican la importancia del cambio:

- `critical` - Crítico para el funcionamiento del sistema
- `high` - Alta prioridad
- `medium` - Prioridad media
- `low` - Baja prioridad

### 4. Estado
Etiquetas que indican el estado de una tarea o cambio:

- `wip` - Trabajo en progreso
- `review` - En revisión
- `approved` - Aprobado
- `rejected` - Rechazado
- `completed` - Completado
- `blocked` - Bloqueado
- `on-hold` - En espera

### 5. Complejidad
Etiquetas que indican la complejidad técnica:

- `beginner` - Adecuado para principiantes
- `intermediate` - Complejidad intermedia
- `advanced` - Complejidad avanzada
- `expert` - Requiere conocimiento experto

## Tags de Git

### Convención de Nombres de Branches
- `feature/nombre-de-la-funcionalidad` - Nuevas funcionalidades
- `bugfix/nombre-del-error` - Correcciones de errores
- `hotfix/nombre-del-error-urgente` - Correcciones urgentes
- `release/version` - Preparación de lanzamientos
- `docs/nombre-de-la-documentacion` - Cambios en documentación
- `refactor/nombre-del-componente` - Refactorización

### Tags de Versionado
- `v1.0.0` - Versiones principales
- `v1.0.1` - Parches y correcciones
- `v1.1.0` - Versiones menores con nuevas funcionalidades

## Uso de Etiquetas en Commits

### Formato de Mensajes de Commit
```
tipo(componente): descripción breve

Cuerpo del mensaje (opcional)

Etiquetas: etiqueta1, etiqueta2, etiqueta3
```

### Ejemplos
```
feat(auth-service): implementar autenticación con Google

Añadida funcionalidad de autenticación con Google OAuth 2.0

Etiquetas: feature, auth-service, security
```

```
fix(product-service): corregir error en cálculo de precios

Se corrigió un error en el cálculo de precios cuando se aplican descuentos

Etiquetas: bugfix, product-service, critical
```

```
docs: actualizar guía de despliegue en Kubernetes

Actualizada la documentación de despliegue con nuevas configuraciones

Etiquetas: docs, kubernetes, deployment
```

## Sistema de Búsqueda por Etiquetas

### En GitHub/GitLab
Utilizar la búsqueda con sintaxis:
- `label:feature` - Buscar por etiqueta específica
- `label:feature label:auth-service` - Buscar por múltiples etiquetas
- `label:bugfix state:open` - Buscar errores abiertos

### En Documentación
Cada documento debe incluir al final:
```markdown
## Etiquetas
- `etiqueta1`
- `etiqueta2`
- `etiqueta3`
```

## Gestión de Etiquetas Eliminadas

### Registro de Etiquetas Eliminadas
Cuando se eliminen etiquetas, registrarlas aquí:

| Etiqueta | Fecha de Eliminación | Razón | Reemplazada Por |
|---------|---------------------|-------|-----------------|
| `legacy` | 2025-10-08 | Migración a microservicios completada | `refactor` |

## Mejores Prácticas

### 1. Consistencia
- Usar siempre las mismas etiquetas para conceptos similares
- Mantener la nomenclatura consistente

### 2. Especificidad
- Ser específico con las etiquetas de componente
- Evitar etiquetas demasiado generales

### 3. Relevancia
- Usar solo etiquetas relevantes para el cambio
- No abusar de las etiquetas

### 4. Actualización
- Mantener este documento actualizado
- Revisar periódicamente la relevancia de las etiquetas

## Integración con Herramientas

### GitHub
Configurar etiquetas en la sección Issues del repositorio:
1. Ir a Settings > Labels
2. Crear etiquetas con colores consistentes
3. Asignar descripciones claras

### Sistema de CI/CD
Utilizar etiquetas para:
- Trigger de pipelines específicos
- Generación de releases
- Notificaciones automatizadas

## Ejemplos de Uso

### En CHANGELOG.md
```markdown
### [DOC-001] - Sistema de Documentación Profesional
- **Fecha**: 2025-10-08
- **Autor**: AI Lingma
- **Tipo**: Nueva Funcionalidad
- **Componente**: Documentación
- **Etiquetas**: `documentacion`, `registro`, `proyecto`
- **Descripción**: Creación del sistema de registro y documentación oficial del proyecto
```

### En Commits
```bash
git commit -m "feat(api-gateway): implementar rate limiting

Añadido middleware de rate limiting para proteger los servicios

Etiquetas: feature, api-gateway, security"
```

## Mantenimiento del Sistema

### Revisión Periódica
- Revisar etiquetas cada 3 meses
- Eliminar etiquetas obsoletas
- Añadir nuevas según evolución del proyecto

### Responsables
- **Líder Técnico**: Mantenimiento del sistema de etiquetas
- **Equipo de Desarrollo**: Uso correcto de etiquetas
- **QA Team**: Validación del uso de etiquetas

---
*Última actualización: 2025-10-08*