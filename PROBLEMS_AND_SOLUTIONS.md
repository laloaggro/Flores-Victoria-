# Problemas y Soluciones Durante la Corrección de Microservicios

## 1. Problemas con Dockerfiles

### 1.1. Problema: Directorios faltantes para módulos compartidos

**Descripción del problema:**
Al construir las imágenes de los microservicios, se producían errores relacionados con la creación de directorios para los módulos compartidos (@flores-victoria/tracing y @flores-victoria/metrics). El sistema no podía encontrar las rutas correctas para copiar estos módulos.

**Errores observados:**
```
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref ...: "/shared/metrics": not found
```

**Solución implementada:**
1. Se modificaron los Dockerfiles para copiar los módulos compartidos en directorios temporales dentro del contenedor:
   ```dockerfile
   COPY shared/tracing ./shared/tracing
   COPY shared/metrics ./shared/metrics
   ```
2. Se instalaron las dependencias de los módulos compartidos por separado:
   ```dockerfile
   RUN cd ./shared/tracing && npm install
   RUN cd ./shared/metrics && npm install
   ```

**Resultado:**
La construcción de imágenes ahora es más robusta y confiable, evitando errores de directorios faltantes.

### 1.2. Problema: Rutas relativas inconsistentes

**Descripción del problema:**
Los Dockerfiles usaban rutas relativas que no eran consistentes cuando se construían desde diferentes directorios, lo que causaba errores en la copia de archivos.

**Errores observados:**
```
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref ...: "/src": not found
```

**Solución implementada:**
1. Se estandarizó el uso de rutas relativas desde el directorio raíz del proyecto
2. Se ajustaron los comandos de construcción para usar el contexto correcto
3. Se especificaron rutas completas para los archivos que se copian:
   ```dockerfile
   COPY microservices/auth-service/package.json ./
   COPY microservices/auth-service/src ./src
   ```

**Resultado:**
La construcción de imágenes es ahora consistente independientemente del directorio desde el cual se ejecuta el comando.

## 2. Problemas con dependencias

### 2.1. Problema: Dependencias faltantes en package.json

**Descripción del problema:**
Algunos microservicios no tenían las dependencias @flores-victoria/tracing y @flores-victoria/metrics listadas en sus archivos package.json, lo que causaba errores al ejecutar los servicios.

**Errores observados:**
```
Error: Cannot find module '@flores-victoria/tracing'
```

**Solución implementada:**
1. Se agregaron las dependencias faltantes a los archivos package.json correspondientes:
   ```json
   "dependencies": {
     "@flores-victoria/tracing": "file:../shared/tracing",
     "@flores-victoria/metrics": "file:../shared/metrics"
   }
   ```
2. Se ajustó la estructura de directorios para que las rutas fueran correctas

**Resultado:**
Los servicios ahora pueden encontrar e importar correctamente los módulos compartidos.

## 3. Problemas con health checks

### 3.1. Problema: Health check fallando

**Descripción del problema:**
El health check en docker-compose.prod.yml estaba configurado incorrectamente, lo que causaba que los servicios se reiniciaran constantemente.

**Errores observados:**
```
curl: (7) Failed to connect to localhost port 3001: Connection refused
```

**Solución implementada:**
1. Se corrigió la configuración del health check en docker-compose.prod.yml:
   ```yaml
   healthcheck:
     test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health || exit 1"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

**Resultado:**
Los health checks ahora funcionan correctamente y los servicios se mantienen estables.

## 4. Problemas con puertos

### 4.1. Problema: Conflictos de puertos

**Descripción del problema:**
Al intentar desplegar el stack, se producían conflictos de puertos porque los servicios ya estaban en ejecución.

**Errores observados:**
```
Error response from daemon: rpc error: code = InvalidArgument desc = port '3001' is already in use
```

**Solución implementada:**
1. Se eliminaron los servicios existentes antes de desplegar el stack:
   ```bash
   docker service rm fv_admin-panel fv_api-gateway fv_auth-service fv_cart-service fv_contact-service fv_notification-service fv_order-service fv_product-service fv_review-service fv_user-service fv_wishlist-service
   ```
2. Se desplegó el stack con el nombre correcto:
   ```bash
   docker stack deploy -c docker-compose.prod.yml flores-victoria
   ```

**Resultado:**
El despliegue del stack ahora se realiza sin conflictos de puertos.

## 5. Impacto general de las soluciones

### 5.1. Mejoras implementadas

1. **Consistencia en Dockerfiles:**
   - Todos los microservicios ahora usan una estructura de Dockerfile consistente
   - Se facilita el mantenimiento y la actualización futura

2. **Manejo robusto de módulos compartidos:**
   - Los módulos @flores-victoria/tracing y @flores-victoria/metrics se integran correctamente
   - Se asegura que todas las dependencias se instalen correctamente

3. **Documentación mejorada:**
   - Se crearon documentos detallados sobre los cambios realizados
   - Se registran los comandos ejecutados y sus resultados
   - Se documentan los problemas encontrados y sus soluciones

### 5.2. Consideraciones importantes

1. **Cambios en la estructura de directorios:**
   - Se modificaron varios Dockerfiles, lo que puede requerir actualizaciones en otros scripts de CI/CD
   - Se cambió la forma en que se construyen las imágenes, lo que puede afectar procesos automatizados existentes

2. **Tiempo de construcción:**
   - Algunas imágenes pueden tardar un poco más en construirse debido a la instalación de dependencias adicionales

## 6. Recomendaciones para evitar problemas futuros

1. **Pruebas de integración:**
   - Implementar pruebas automatizadas para verificar que las imágenes se construyen correctamente
   - Probar cada microservicio individualmente después de cambios importantes

2. **Documentación continua:**
   - Mantener actualizada la documentación del proyecto
   - Registrar cualquier cambio en los procesos de construcción o despliegue

3. **Automatización:**
   - Crear scripts de construcción automatizados para todos los microservicios
   - Implementar pipelines de CI/CD para verificar los cambios automáticamente

4. **Monitoreo:**
   - Monitorear el rendimiento de los servicios después de los cambios
   - Verificar que no haya problemas de rendimiento con las nuevas imágenes