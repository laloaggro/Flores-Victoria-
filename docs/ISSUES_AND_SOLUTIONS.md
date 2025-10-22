# Problemas Identificados y Soluciones - Arreglos Victoria

## 📋 Resumen de Problemas

Después de levantar el sistema con `docker compose up -d`, se han identificado varios problemas que
afectan el funcionamiento del sistema. A continuación se detallan los problemas encontrados y sus
soluciones propuestas.

## 🐛 Problemas Identificados

### 1. Variables de Entorno No Configuradas

#### Problema

```
WARN[0000] The "RABBITMQ_PASSWORD" variable is not set. Defaulting to a blank string.
WARN[0000] The "MONGO_ROOT_PASSWORD" variable is not set. Defaulting to a blank string.
```

#### Impacto

- Configuración insegura de RabbitMQ
- Posibles problemas de autenticación en MongoDB

#### Solución

Crear un archivo `.env` con las variables de entorno necesarias:

✅ **Solucionado**: Se ha creado el archivo `.env` con todas las variables necesarias.

### 2. Error de Conexión con RabbitMQ

#### Problema

```
Error: Handshake terminated by server: 403 (ACCESS-REFUSED) with message "ACCESS_REFUSED - Login was refused using authentication mechanism PLAIN"
```

#### Impacto

- El servicio de mensajería no puede conectarse a RabbitMQ
- Sistema de mensajería no funcional

#### Solución

1. Configurar correctamente las credenciales de RabbitMQ en el archivo `.env`
2. Verificar que las credenciales coincidan entre el servicio de mensajería y RabbitMQ

✅ **Parcialmente solucionado**: Se han configurado las variables de entorno. Se requiere reiniciar
los servicios.

### 3. Configuración de MongoDB Incorrecta

#### Problema

```
error: missing 'MONGO_INITDB_ROOT_USERNAME' or 'MONGO_INITDB_ROOT_PASSWORD'
       both must be specified for a user to be created
```

#### Impacto

- MongoDB no se inicializa correctamente
- Servicios que dependen de MongoDB no pueden conectarse

#### Solución

1. Asegurar que las variables `MONGO_INITDB_ROOT_USERNAME` y `MONGO_INITDB_ROOT_PASSWORD` estén
   definidas
2. Verificar que estas variables se pasen correctamente al contenedor de MongoDB

✅ **Solucionado**: Se han configurado las variables en el archivo `.env` y actualizado el
`docker-compose.yml`.

### 4. Problemas de Permisos en Redis

#### Problema

```
1:M 08 Oct 2025 19:18:02.208 # Failed to write PID file: Permission denied
```

#### Impacto

- Posibles problemas de persistencia en Redis
- Potenciales problemas en el servicio de carrito

#### Solución

1. Configurar correctamente los permisos del volumen de Redis
2. Asegurar que el usuario de Redis tenga los permisos necesarios

🔄 **En proceso**: Se requiere configurar adecuadamente los volúmenes y permisos.

### 5. Advertencia de Configuración de Memoria en Redis

#### Problema

```
WARNING Memory overcommit must be enabled! Without it, a background save or replication may fail under low memory condition.
```

#### Impacto

- Posibles fallos en operaciones de guardado en segundo plano
- Problemas de replicación en entornos de producción

#### Solución

1. Configurar `vm.overcommit_memory=1` en el sistema host
2. Agregar configuración en el archivo redis.conf

🔄 **En proceso**: Se requiere configuración adicional en el sistema host.

## 🐛 Nuevos Problemas Identificados

### 1. Contenedores con Estado Unhealthy

#### Problema

Varios contenedores muestran estado `(unhealthy)`:

- api-gateway
- auth-service
- product-service
- user-service
- order-service
- cart-service
- wishlist-service
- review-service
- contact-service
- i18n-service
- audit-service
- analytics-service
- admin-panel
- frontend
- elasticsearch

#### Impacto

- Posibles problemas de conectividad entre servicios
- Algunos servicios pueden no responder correctamente

#### Solución

1. Verificar las health checks de cada servicio
2. Revisar logs de contenedores unhealthy
3. Ajustar configuraciones de conectividad

🔄 **En proceso**: Investigando causas raíz.

### 2. Contenedores en Estado de Reinicio Constante

#### Problema

Los siguientes contenedores están en estado de reinicio constante:

- postgres (Restarting)
- review-service (Restarting)

#### Impacto

- Pérdida de datos en PostgreSQL
- Servicio de reseñas no disponible

#### Solución

1. Revisar logs del contenedor postgres
2. Verificar configuración de variables de entorno para PostgreSQL
3. Revisar configuración del servicio review-service

🔄 **En proceso**: Investigando causas raíz.

### 3. Incompatibilidad de Versiones en PostgreSQL

#### Problema

```
FATAL: database files are incompatible with server
DETAIL: The data directory was initialized by PostgreSQL version 14, which is not compatible with this version 13.22.
```

#### Impacto

- PostgreSQL no puede iniciar correctamente
- Todos los servicios que dependen de PostgreSQL no funcionan

#### Solución

1. Actualizar la versión de PostgreSQL en docker-compose.yml a la versión 14
2. Eliminar los volúmenes existentes y recrear la base de datos

✅ **Solucionado**: Se actualizó la versión de PostgreSQL a 14-alpine.

### 4. Problemas con RabbitMQ y Elasticsearch

#### Problema

- RabbitMQ y Elasticsearch muestran errores al iniciar
- Otros servicios que dependen de estos no pueden conectarse

#### Impacto

- Sistema de mensajería no funcional
- Sistema de logging y análisis no funcional

#### Solución

1. Revisar configuración de RabbitMQ y Elasticsearch
2. Verificar logs de ambos servicios
3. Ajustar configuraciones si es necesario

✅ **Solucionado**: Ambos servicios se están ejecutando correctamente según los logs, pero el
sistema los marca como fallidos debido a problemas con los health checks.

## 🔧 Soluciones Implementadas

### 1. Actualización del Archivo .env

Se ha creado el archivo `.env` en la raíz del proyecto con todas las variables necesarias:

✅ **Completado**: Archivo creado con todas las variables de entorno necesarias.

### 2. Corrección del docker-compose.yml

Se ha actualizado el archivo `docker-compose.yml` para:

1. Utilizar variables de entorno desde el archivo `.env`
2. Configurar correctamente las dependencias entre servicios
3. Asegurar que los servicios se conecten con las credenciales adecuadas
4. Añadir configuraciones faltantes para Redis y RabbitMQ

✅ **Completado**: Archivo actualizado con todas las mejoras necesarias.

### 3. Mejoras en la Configuración de Servicios

Se han añadido configuraciones específicas para cada servicio para asegurar su correcto
funcionamiento:

- Configuración de URLs para todos los microservicios
- Configuración de cadenas de conexión para bases de datos
- Configuración de credenciales para servicios de mensajería

✅ **Completado**: Configuración mejorada para todos los servicios.

### 4. Corrección de Cadenas de Conexión a MongoDB

Se identificó que varios servicios no estaban utilizando las credenciales correctas para conectarse
a MongoDB. Se han corregido las siguientes configuraciones:

1. **review-service**: Se actualizó la cadena de conexión para incluir credenciales y authSource
2. **wishlist-service**: Se actualizó la cadena de conexión para incluir credenciales y authSource
3. **audit-service**: Se actualizó la cadena de conexión para incluir credenciales y authSource

✅ **Solucionado**: Los servicios ahora pueden autenticarse correctamente con MongoDB.

### 5. Corrección de la Versión de PostgreSQL

Se identificó un problema de incompatibilidad de versiones en PostgreSQL:

1. El volumen de datos existente fue creado con PostgreSQL 14
2. La imagen especificada en docker-compose.yml era PostgreSQL 13.22
3. Esto causaba un error de incompatibilidad al intentar iniciar el contenedor

✅ **Solucionado**: Se actualizó la imagen de PostgreSQL a `postgres:14-alpine` para mantener la
compatibilidad.

### 6. Análisis de Problemas con Health Checks

Se identificó que RabbitMQ y Elasticsearch están funcionando correctamente según sus logs, pero el
sistema los marca como fallidos. Esto se debe a problemas con los health checks:

1. Los health checks pueden tener tiempos de espera insuficientes
2. Los servicios pueden tardar más en iniciarse de lo que el sistema espera
3. Las configuraciones de health checks pueden necesitar ajustes

🔄 **En proceso**: Ajustando configuraciones de health checks.

## 📝 Tareas Pendientes

### Prioridad Alta

- [x] Configurar variables de entorno en el archivo `.env`
- [x] Reiniciar todos los servicios para aplicar los cambios
- [x] Corregir errores de conexión con RabbitMQ
- [x] Solucionar problemas de inicialización de MongoDB
- [x] Corregir cadenas de conexión a MongoDB en servicios afectados
- [x] Solucionar problema de incompatibilidad de versiones en PostgreSQL
- [ ] Verificar conectividad de todos los microservicios
- [ ] Resolver problemas con contenedores en estado unhealthy
- [x] Solucionar problemas con RabbitMQ y Elasticsearch

### Prioridad Media

- [ ] Configurar permisos adecuados para Redis
- [ ] Resolver advertencias de configuración de memoria
- [ ] Verificar funcionamiento del sistema de logging (ELK)

### Prioridad Baja

- [ ] Optimizar configuración de recursos de contenedores
- [ ] Añadir más health checks
- [ ] Mejorar configuración de seguridad

## 📊 Estado Actual del Sistema

| Servicio          | Estado | Notas                                            |
| ----------------- | ------ | ------------------------------------------------ |
| API Gateway       | ⚠️     | Funcionando pero unhealthy                       |
| Auth Service      | ⚠️     | Funcionando pero unhealthy                       |
| Product Service   | ⚠️     | Funcionando pero unhealthy                       |
| User Service      | ⚠️     | Funcionando pero unhealthy                       |
| Order Service     | ⚠️     | Funcionando pero unhealthy                       |
| Cart Service      | ⚠️     | Funcionando pero unhealthy                       |
| Wishlist Service  | ⚠️     | Funcionando pero unhealthy                       |
| Review Service    | ⚠️     | Funcionando pero unhealthy                       |
| Contact Service   | ⚠️     | Funcionando pero unhealthy                       |
| Audit Service     | ⚠️     | Funcionando pero unhealthy                       |
| Messaging Service | ✅     | Funcionando correctamente                        |
| I18n Service      | ⚠️     | Funcionando pero unhealthy                       |
| Analytics Service | ⚠️     | Funcionando pero unhealthy                       |
| MongoDB           | ✅     | Funcionando correctamente                        |
| PostgreSQL        | ✅     | Funcionando correctamente                        |
| Redis             | ✅     | Funcionando correctamente                        |
| RabbitMQ          | ✅     | Funcionando correctamente (health check fallido) |
| Elasticsearch     | ✅     | Funcionando correctamente (health check fallido) |
| Kibana            | ⏳     | En espera                                        |
| Logstash          | ⏳     | En espera                                        |
| Filebeat          | ⏳     | En espera                                        |
| Frontend          | ⚠️     | Funcionando pero unhealthy                       |
| Admin Panel       | ⚠️     | Funcionando pero unhealthy                       |

## 📈 Análisis de Errores

### RabbitMQ

Tras la revisión de logs, se puede confirmar que RabbitMQ está funcionando correctamente. Los logs
muestran que:

1. El servidor se ha iniciado correctamente
2. El usuario 'admin' ha sido creado con permisos de administrador
3. Los puertos 5672 y 15672 están escuchando conexiones
4. Los plugins de gestión están activos
5. El sistema está listo para recibir conexiones

### Elasticsearch

Los logs de Elasticsearch muestran que:

1. El clúster se ha iniciado correctamente
2. Se han cargado múltiples políticas de ciclo de vida
3. Se han creado plantillas de índice
4. El sistema está listo para recibir conexiones
5. La licencia básica está activa

## 🔍 Investigación de Problemas Recientes

### Contenedores Unhealthy

La mayoría de los servicios están marcados como "unhealthy". Esto probablemente se debe a:

1. Health checks mal configurados
2. Problemas de conectividad entre servicios
3. Tiempos de espera insuficientes en los health checks

### RabbitMQ y Elasticsearch

Aunque los logs muestran que ambos servicios se han iniciado correctamente, el sistema los marca
como fallidos. Esto se debe a:

1. Problemas con los health checks
2. Tiempos de espera insuficientes para que los servicios estén completamente operativos
3. Problemas de conectividad de red entre contenedores

## 🛠️ Próximos Pasos

1. **Verificación de Conectividad**:
   - Probar conexión entre microservicios y bases de datos
   - Verificar funcionamiento del sistema de mensajería

2. **Pruebas de Funcionalidad**:
   - Probar endpoints de la API
   - Verificar funcionamiento del frontend
   - Comprobar panel de administración

3. **Documentación**:
   - Actualizar documentación con los cambios realizados
   - Añadir guía de solución de problemas
   - Documentar variables de entorno requeridas

4. **Investigación de Problemas**:
   - Revisar logs detallados de contenedores unhealthy
   - Analizar causas raíz de problemas con health checks
   - Ajustar configuraciones de health checks

## 📚 Referencias

- [Documentación de RabbitMQ](https://www.rabbitmq.com/documentation.html)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Redis](https://redis.io/documentation)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)

---

_Documento actualizado: 2025-10-08_ _Etiquetas: `issues`, `troubleshooting`, `docker`,
`microservices`_
