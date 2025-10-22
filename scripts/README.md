# Scripts de Prueba - Flores Victoria

Este directorio contiene scripts para probar y validar el sistema completo.

## Scripts Disponibles

### 1. `test-system.sh` - Prueba Completa del Sistema

Script principal que ejecuta todas las pruebas del sistema.

**Uso:**

```bash
./scripts/test-system.sh
```

**Qué prueba:**

- ✓ Conectividad de todos los microservicios (API Gateway, Auth Service, Product Service)
- ✓ Funcionalidad de autenticación (login, registro, validación de credenciales)
- ✓ Servicio de productos (obtención y búsqueda)
- ✓ Frontend (páginas de login, registro, productos)
- ✓ Integración completa (flujo de login → obtener productos)

**Salida:** El script muestra resultados en color:

- ✓ Verde: Prueba exitosa
- ✗ Rojo: Prueba fallida
- Amarillo: Advertencias

### 2. `test-complete-system.js` - Script de Prueba en Node.js

Script detallado en Node.js que realiza todas las pruebas.

**Uso:**

```bash
node scripts/test-complete-system.js
```

Este script es ejecutado automáticamente por `test-system.sh`.

### 3. `run-all-tests.sh` - Pruebas de Integración y Carga

Script para ejecutar pruebas de integración con Jest y pruebas de carga con k6.

**Uso:**

```bash
./scripts/run-all-tests.sh
```

**Requisitos:**

- Jest instalado
- k6 instalado

### 4. `run-integration-tests.sh` - Solo Pruebas de Integración

Ejecuta únicamente las pruebas de integración.

**Uso:**

```bash
./scripts/run-integration-tests.sh
```

### 5. `run-load-tests.sh` - Solo Pruebas de Carga

Ejecuta únicamente las pruebas de carga con k6.

**Uso:**

```bash
./scripts/run-load-tests.sh
```

## Ejecución Rápida

Para una validación rápida del sistema completo:

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/test-system.sh
```

## Requisitos Previos

Antes de ejecutar las pruebas, asegúrate de que:

1. **Docker Compose está corriendo:**

   ```bash
   docker compose -f docker-compose.dev-simple.yml ps
   ```

2. **Todos los servicios están activos:**
   - API Gateway (puerto 3000)
   - Auth Service (puerto 3001)
   - Product Service (puerto 3009)
   - Frontend (puerto 5173)

3. **Node.js está instalado** (para scripts .js)

## Solución de Problemas

### Si las pruebas fallan:

1. **Verificar que los servicios están corriendo:**

   ```bash
   docker compose -f docker-compose.dev-simple.yml ps
   ```

2. **Revisar logs de servicios:**

   ```bash
   docker compose -f docker-compose.dev-simple.yml logs --tail=50 [servicio]
   ```

3. **Reiniciar servicios si es necesario:**

   ```bash
   docker compose -f docker-compose.dev-simple.yml restart
   ```

4. **Verificar puertos:**
   ```bash
   netstat -tuln | grep -E "(3000|3001|3009|5173)"
   ```

## Ejemplos de Salida

### Prueba Exitosa:

```
✓ API Gateway: (200)
✓ Auth Service: (200)
✓ Login con credenciales válidas: Inicio de sesión exitoso
✓ Obtener lista de productos: (3 productos encontrados)
```

### Prueba Fallida:

```
✗ Frontend: (404)
✗ Login con credenciales válidas: Connection refused
```

## Integración Continua

Estos scripts pueden ser integrados en pipelines de CI/CD:

```yaml
# Ejemplo para GitHub Actions
- name: Run System Tests
  run: ./scripts/test-system.sh
```

## Contribuir

Al agregar nuevas funcionalidades al sistema, actualiza los scripts de prueba para incluir
validaciones de las nuevas características.
