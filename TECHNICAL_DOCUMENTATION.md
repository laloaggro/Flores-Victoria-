# Flores Victoria - Documentación Técnica

## Arquitectura del Sistema

El sistema utiliza una arquitectura de microservicios implementada con Node.js y Docker. Los servicios se comunican a través de una API Gateway y utilizan RabbitMQ para la mensajería asíncrona.

### 1.1 Componentes Principales

#### API Gateway
- **Función**: Punto de entrada único para todas las solicitudes del cliente
- **Tecnología**: Node.js
- **Puerto**: 3000

#### Auth Service
- **Función**: Manejo de autenticación y autorización de usuarios
- **Tecnología**: Node.js
- **Puerto**: 3001
- **Dependencias**: 
  - @flores-victoria/logging
  - @flores-victoria/tracing
  - @flores-victoria/audit
  - @flores-victoria/metrics

#### User Service
- **Función**: Gestión de perfiles de usuario
- **Tecnología**: Node.js
- **Puerto**: 3003
- **Dependencias**: 
  - @flores-victoria/logging
  - @flores-victoria/tracing
  - @flores-victoria/audit
  - @flores-victoria/metrics

#### Product Service
- **Función**: Gestión del catálogo de productos
- **Tecnología**: Node.js
- **Puerto**: 3002
- **Dependencias**: 
  - @flores-victoria/logging
  - @flores-victoria/tracing
  - @flores-victoria/audit
  - @flores-victoria/metrics

#### Order Service
- **Función**: Procesamiento de pedidos
- **Tecnología**: Node.js
- **Puerto**: 3004

#### Cart Service
- **Función**: Gestión del carrito de compras
- **Tecnología**: Node.js
- **Puerto**: 3005

#### Wishlist Service
- **Función**: Lista de deseos de productos
- **Tecnología**: Node.js
- **Puerto**: 3006

#### Review Service
- **Función**: Reseñas y calificaciones de productos
- **Tecnología**: Node.js
- **Puerto**: 3007

#### Contact Service
- **Función**: Formulario de contacto
- **Tecnología**: Node.js
- **Puerto**: 3008

#### Admin Panel
- **Función**: Panel de administración
- **Tecnología**: Node.js
- **Puerto**: 3009

#### Frontend
- **Función**: Interfaz de usuario web
- **Tecnología**: Vue.js
- **Servidor**: Nginx

### 1.2 Módulos Compartidos

#### @flores-victoria/logging
- **Función**: Proporciona funcionalidad de registro estandarizada
- **Componentes principales**:
  - logger.js: Funciones de registro

#### @flores-victoria/tracing
- **Función**: Implementa trazabilidad distribuida
- **Componentes principales**:
  - tracer.js: Configuración del tracer
  - index.js: Middleware de trazabilidad

#### @flores-victoria/audit
- **Función**: Registro de auditoría de acciones
- **Componentes principales**:
  - middleware.js: Middleware para capturar acciones

#### @flores-victoria/metrics
- **Función**: Métricas de rendimiento
- **Componentes principales**:
  - index.js: Configuración de métricas
  - middleware.js: Middleware para recolección de métricas

## Scripts Disponibles

### Scripts de Despliegue

1. **deploy.sh**
   - Despliega todos los servicios en Docker
   - Configura variables de entorno y redes necesarias
   - Inicia contenedores y verifica su estado

2. **stop.sh**
   - Detiene todos los servicios en Docker
   - Limpia recursos y elimina contenedores
   - Verifica que todos los servicios estén detenidos

3. **restart.sh**
   - Detiene y vuelve a iniciar todos los servicios
   - Utiliza scripts `stop.sh` y `deploy.sh`
   - Verifica el estado de los servicios después del reinicio

4. **update.sh**
   - Actualiza el código fuente del proyecto
   - Detiene y vuelve a desplegar los servicios
   - Verifica que todos los servicios estén actualizados

### Scripts de Diagnóstico y Mantenimiento

1. **advanced-diagnostics.sh**
   - Realiza un diagnóstico completo del sistema
   - Genera informes detallados en el directorio `logs/`
   - Verifica estado de contenedores, puertos, archivos de configuración, etc.

2. **system-maintenance.sh**
   - Proporciona un menú interactivo para tareas de mantenimiento
   - Permite verificar estado del sistema, reiniciar servicios, limpiar recursos, etc.
   - Genera registros de todas las operaciones en el directorio `logs/`

3. **check-services-detailed.sh**
   - Verifica el estado detallado de los servicios
   - Comprueba conectividad, logs de contenedores y uso de recursos
   - Genera informes en el directorio `logs/`

4. **scheduled-diagnostics.sh**
   - Script para ejecutar diagnósticos programados cada 25 horas
   - Ejecuta diagnósticos avanzados y verificaciones detalladas
   - Limpia automáticamente los logs antiguos

5. **cleanup-logs.sh**
   - Limpia los archivos de log más antiguos (más de 2 semanas)
   - Mantiene solo los registros de las últimas 2 semanas
   - Se ejecuta automáticamente como parte del script programado

6. **auto-fix-issues.sh**
   - Resuelve automáticamente problemas comunes del sistema
   - Verifica y corrige permisos de scripts
   - Reinicia contenedores con errores
   - Limpia recursos no utilizados de Docker
   - Genera informes en el directorio `logs/`

### Programación de Tareas

El sistema está configurado para ejecutar diagnósticos automáticos cada 25 horas. Para configurar esta programación:

1. Agregar la siguiente entrada al crontab:
   ```
   # Ejecutar diagnósticos cada 25 horas
   0 */25 * * * cd /ruta/al/proyecto/flores-victoria && ./scripts/scheduled-diagnostics.sh
   ```

2. El script realiza las siguientes acciones:
   - Ejecuta diagnósticos avanzados del sistema
   - Verifica el estado detallado de los servicios
   - Limpia automáticamente los logs antiguos

3. Todos los resultados se almacenan en archivos de log en el directorio `logs/` con marcas de tiempo.

### Gestión de Logs

- Los logs se almacenan en el directorio `logs/` en la raíz del proyecto
- Cada ejecución de script genera un archivo de log único con la fecha y hora
- Los logs se rotan automáticamente y se eliminan después de 2 semanas
- Los logs contienen información detallada de diagnóstico para análisis posteriores

### Documentación de Eventos Inusuales

Cuando se detectan eventos inusuales durante los diagnósticos:

1. Se registran en los archivos de log correspondientes
2. Se incluye información detallada del evento, incluyendo:
   - Fecha y hora exacta del evento
   - Descripción del problema detectado
   - Estado del sistema en el momento del evento
   - Recursos afectados (contenedores, puertos, etc.)
3. Se recomienda revisar los logs regularmente para identificar patrones o problemas recurrentes

### Auto-Fix de Problemas

El sistema incluye capacidades de auto-fix para resolver automáticamente problemas comunes:

1. **Verificación de Docker**: Comprueba que Docker esté instalado y funcionando correctamente
2. **Corrección de permisos**: Verifica y corrige automáticamente los permisos de los scripts
3. **Verificación de dependencias**: Comprueba la existencia de módulos y dependencias críticas
4. **Reinicio de contenedores**: Reinicia automáticamente contenedores que hayan fallado
5. **Limpieza de recursos**: Elimina contenedores detenidos, imágenes colgadas y otros recursos no utilizados

Para ejecutar el auto-fix manualmente:
```bash
./scripts/auto-fix-issues.sh
```

O utilizar la opción 9 del menú del script de mantenimiento del sistema:
```bash
./scripts/system-maintenance.sh
```

El auto-fix genera registros detallados en el directorio `logs/` que documentan todas las acciones realizadas y cualquier problema encontrado.

## Problemas Identificados

### 2.1 Problemas de Dependencias

#### Error con rutas de dependencias locales
- **Descripción**: Las rutas especificadas en los archivos package.json de los microservicios apuntaban a directorios incorrectos.
- **Solución aplicada**: Se corrigieron las rutas relativas en los archivos package.json para apuntar al directorio [shared](file:///home/impala/Documentos/Proyectos/flores-victoria/shared/) en la raíz del proyecto.

#### Error al instalar módulos compartidos en Docker
- **Descripción**: Durante la construcción de las imágenes Docker, los módulos compartidos no se instalaban correctamente.
- **Error específico**: `npm error Cannot read properties of undefined (reading 'extraneous')`
- **Causa**: Problemas al empaquetar e instalar los módulos compartidos como paquetes npm dentro del contenedor.
- **Solución propuesta**: Utilizar una estrategia diferente para instalar los módulos compartidos, como enlaces simbólicos o instalación directa desde directorios.

### 2.2 Problemas de Docker

#### Problemas con Dockerfile
- **Descripción**: Los Dockerfiles de los microservicios tenían rutas incorrectas para copiar los módulos compartidos.
- **Solución aplicada**: Se corrigieron las rutas en los Dockerfiles para copiar correctamente los módulos compartidos desde el directorio raíz del proyecto.

#### Problemas con construcción de imágenes
- **Descripción**: Las imágenes Docker no se construían correctamente debido a errores en la instalación de dependencias.
- **Solución propuesta**: Simplificar el proceso de instalación de dependencias y módulos compartidos en los Dockerfiles.

### 2.3 Problemas de Configuración

#### Variables de entorno
- **Descripción**: Algunos servicios requieren variables de entorno específicas que pueden no estar correctamente configuradas.
- **Solución propuesta**: Verificar y actualizar el archivo .env con todas las variables necesarias.

## Soluciones Propuestas

### 3.1 Enfoque para Resolver Problemas de Dependencias

1. **Instalación directa de módulos compartidos**:
   - En lugar de empaquetar los módulos compartidos, instalarlos directamente desde sus directorios.
   - Utilizar `npm install file:./shared/module-name` para instalar los módulos compartidos.

2. **Uso de enlaces simbólicos**:
   - Crear enlaces simbólicos a los módulos compartidos en el directorio node_modules de cada servicio.
   - Esto evita la necesidad de empaquetar e instalar los módulos compartidos.

### 3.2 Mejoras en Dockerfiles

1. **Simplificación del proceso de construcción**:
   - Reducir la complejidad de los comandos RUN en los Dockerfiles.
   - Utilizar múltiples etapas de construcción si es necesario para optimizar el tamaño de las imágenes.

2. **Gestión de dependencias**:
   - Utilizar mejor las capas de caché de Docker para acelerar las reconstrucciones.
   - Copiar package.json por separado antes del código fuente para aprovechar mejor el caché.

## Próximos Pasos

1. **Implementar la solución propuesta para las dependencias compartidas**
2. **Verificar que todos los servicios se construyan y ejecuten correctamente**
3. **Actualizar la documentación con los cambios realizados**
4. **Realizar pruebas integrales del sistema**