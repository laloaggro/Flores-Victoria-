# Guía de Docker Compose

## Introducción

Este documento explica las diferencias entre los archivos `docker-compose.yml` en el proyecto Flores Victoria y cuándo se debe usar cada uno.

## Archivos Docker Compose

### 1. `docker-compose.yml` (Raíz del proyecto)

Este es el archivo principal de Docker Compose que define todos los servicios para un despliegue completo en producción o pruebas.

**Características:**
- Incluye todos los microservicios
- Configurado para entornos de producción
- Contiene configuraciones de salud y monitoreo completas
- Utiliza volúmenes persistentes para bases de datos

**Uso:**
```bash
# Desde la raíz del proyecto
docker-compose up -d
```

### 2. `development/docker-compose.yml`

Este archivo está optimizado para el entorno de desarrollo local.

**Características:**
- Configurado para desarrollo rápido
- Tiempos de espera más cortos en health checks
- Volúmenes montados para desarrollo en vivo
- Configuraciones específicas para debugging

**Uso:**
```bash
# Desde el directorio development
cd development
docker-compose up -d
```

## Diferencias Clave

| Característica | Raíz (`docker-compose.yml`) | Desarrollo (`development/docker-compose.yml`) |
|----------------|-----------------------------|-----------------------------------------------|
| Propósito | Producción/Pruebas completas | Desarrollo local |
| Health Checks | Intervalos más largos | Intervalos más cortos |
| Volúmenes | Persistentes | Para desarrollo en vivo |
| Configuración | Optimizada para rendimiento | Optimizada para debugging |

## Recomendaciones de Uso

### Para Desarrollo
Utiliza el archivo en el directorio `development` cuando:
- Estés desarrollando nuevas funcionalidades
- Necesites debugging en vivo
- Quieras recargar código automáticamente

### Para Pruebas y Producción
Utiliza el archivo en la raíz del proyecto cuando:
- Despliegues en servidores de prueba
- Lleves a producción
- Realices pruebas de integración completa

## Mejores Prácticas

1. **Mantén consistencia**: Asegúrate de que ambos archivos definan los mismos servicios con configuraciones equivalentes.

2. **Documenta cambios**: Cualquier diferencia significativa entre los archivos debe estar documentada.

3. **Prueba ambos**: Antes de hacer cambios importantes, prueba con ambos archivos para asegurar compatibilidad.

4. **Variables de entorno**: Utiliza archivos `.env` para manejar diferencias de configuración entre entornos.

## Solución de Problemas

Si encuentras diferencias inesperadas entre los entornos:

1. Verifica que ambos archivos estén sincronizados
2. Comprueba las variables de entorno
3. Asegúrate de usar el archivo correcto para tu propósito
4. Revisa los logs de los contenedores para identificar problemas de configuración