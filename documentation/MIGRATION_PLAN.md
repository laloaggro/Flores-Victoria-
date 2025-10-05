# Plan de Migración - Eliminación del Backend Monolítico

## Objetivo

Eliminar la duplicación entre el backend monolítico y los microservicios migrando completamente a una arquitectura de microservicios.

## Estado Actual

Actualmente existe duplicación de funcionalidades:
- El backend monolítico en `/backend` contiene implementaciones de:
  - Autenticación de usuarios
  - Gestión de productos
  - Gestión de órdenes
  - Sistema de reseñas
  - Carrito de compras
  - Lista de deseos
  - Formulario de contacto

- Los microservicios en `/microservices` contienen implementaciones equivalentes de las mismas funcionalidades.

- El frontend ya está configurado para usar los microservicios a través del API Gateway:
  - Configuración de API en `/frontend/assets/js/config/api.js` apunta al puerto 3000
  - Configuración de API en `/frontend/public/js/config/api.js` apunta al puerto 3000

## Scripts Útiles Migrados

Antes de eliminar el directorio `/backend`, se han migrado los siguientes scripts útiles al directorio `/scripts`:

1. **init-db.js** - Script para inicializar la base de datos
2. **generate-sample-data.js** - Script para generar datos de muestra
3. **add-20-more-products.js** - Script para agregar 20 productos adicionales
4. **add-missing-category-products.js** - Script para agregar productos de categorías faltantes
5. **add-more-categories.js** - Script para agregar más categorías
6. **add-more-products.js** - Script para agregar más productos
7. **add-new-products.js** - Script para agregar nuevos productos
8. **add-temp-images-to-products.js** - Script para agregar imágenes temporales a productos
9. **add-test-products.js** - Script para agregar productos de prueba
10. **migrate-products-to-mongodb.js** - Script para migrar productos a MongoDB

## Plan de Migración

### Fase 1: Análisis y Preparación

1. **Identificar dependencias del backend monolítico**:
   - Frontend que apunta al backend monolítico
   - Scripts y herramientas que utilizan el backend monolítico
   - Configuraciones de despliegue

2. **Verificar la completitud de los microservicios**:
   - Asegurar que todos los endpoints del monolítico están implementados en los microservicios
   - Verificar que todas las funcionalidades están cubiertas

### Fase 2: Actualización del Frontend

1. **Modificar las llamadas API del frontend**:
   - Redirigir todas las llamadas del frontend al API Gateway en lugar del backend monolítico
   - Actualizar las URL de las API a las rutas del API Gateway

2. **Pruebas de integración**:
   - Verificar que todas las funcionalidades del frontend trabajan correctamente con los microservicios
   - Asegurar que no hay pérdida de funcionalidad

### Fase 3: Eliminación del Backend Monolítico

1. **Eliminar el directorio `/backend`**:
   - Mover cualquier script útil a los microservicios o a una ubicación compartida
   - Eliminar configuraciones de docker-compose relacionadas

2. **Actualizar docker-compose**:
   - Remover referencias al backend monolítico
   - Asegurar que todos los microservicios están correctamente configurados

3. **Actualizar documentación**:
   - Remover referencias al backend monolítico
   - Actualizar diagramas y descripciones de arquitectura

### Fase 4: Verificación Final

1. **Pruebas completas del sistema**:
   - Verificar que todas las funcionalidades trabajan correctamente
   - Asegurar que no hay rutas muertas o errores

2. **Optimización**:
   - Revisar posibles mejoras en la comunicación entre microservicios
   - Verificar el rendimiento del sistema

## Lista de Verificación

### Análisis del Backend Monolítico
- [ ] Identificar todos los endpoints de la API
- [ ] Mapear funcionalidades a microservicios equivalentes
- [ ] Verificar qué scripts dependen del backend monolítico
- [ ] Documentar configuraciones específicas del backend

### Verificación de Microservicios
- [ ] Auth Service completamente funcional
- [ ] User Service completamente funcional
- [ ] Product Service completamente funcional
- [ ] Cart Service completamente funcional
- [ ] Order Service completamente funcional
- [ ] Review Service completamente funcional
- [ ] Contact Service completamente funcional
- [ ] Wishlist Service completamente funcional
- [ ] API Gateway correctamente configurado

### Actualización del Frontend
- [ ] Redirigir llamadas de autenticación al Auth Service
- [ ] Redirigir llamadas de productos al Product Service
- [ ] Redirigir llamadas de carrito al Cart Service
- [ ] Redirigir llamadas de órdenes al Order Service
- [ ] Redirigir llamadas de reseñas al Review Service
- [ ] Redirigir llamadas de contacto al Contact Service
- [ ] Redirigir llamadas de lista de deseos al Wishlist Service
- [ ] Verificar que todas las páginas funcionan correctamente

### Eliminación del Backend
- [x] Mover scripts útiles a ubicaciones apropiadas
- [ ] Eliminar directorio `/backend`
- [ ] Actualizar docker-compose.yml
- [ ] Actualizar documentación

## Cronograma Estimado

1. **Fase 1**: 2 días
2. **Fase 2**: 3 días
3. **Fase 3**: 1 día
4. **Fase 4**: 2 días

**Total**: 8 días

## Consideraciones de Riesgo

1. **Tiempo de inactividad**: Planificar la migración durante un período de baja actividad
2. **Pérdida de datos**: Asegurar copias de seguridad antes de la migración
3. **Regresiones**: Pruebas exhaustivas para evitar pérdida de funcionalidades
4. **Problemas de rendimiento**: Monitorear el rendimiento después de la migración

## Criterios de Éxito

- [ ] El frontend funciona completamente con microservicios
- [ ] No hay funcionalidades perdidas
- [ ] El sistema tiene un rendimiento aceptable o mejorado
- [ ] La arquitectura es más clara y mantenible
- [ ] No hay código duplicado