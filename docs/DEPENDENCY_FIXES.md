# Correcciones de Dependencias en Microservicios

## Problema Identificado

Durante la ejecución del sistema, se identificaron problemas con las dependencias compartidas entre microservicios:

1. **Error de módulo no encontrado**: `Cannot find module '@flores-victoria/tracing'`
2. **Error de ruta relativa**: `Cannot find module '../../../shared/tracing/middleware'`

Estos errores ocurren porque los Dockerfiles no estaban configurados correctamente para incluir las dependencias compartidas.

## Solución Implementada

### 1. Creación de Paquetes Compartidos

Se crearon paquetes NPM compartidos para los componentes comunes:

- `@flores-victoria/audit` - Middleware de auditoría
- `@flores-victoria/logging` - Sistema de logging
- `@flores-victoria/metrics` - Sistema de métricas
- `@flores-victoria/tracing` - Sistema de tracing distribuido

### 2. Actualización de Dockerfiles

Se modificó el enfoque de Docker para montar las dependencias compartidas como volúmenes en lugar de copiarlas directamente en la imagen.

### 3. Script de Corrección

Se creó un script `scripts/fix-dockerfile-dependencies.sh` que:

1. Copia las dependencias compartidas a un directorio temporal
2. Crea un nuevo archivo `docker-compose.fixed.yml` con las configuraciones corregidas
3. Monta las dependencias como volúmenes en los contenedores

## Uso

Para ejecutar el sistema con las correcciones:

```bash
# Ejecutar el script de corrección
./scripts/fix-dockerfile-dependencies.sh

# Iniciar el sistema con el archivo corregido
docker-compose -f docker-compose.fixed.yml up -d
```

## Beneficios

1. **Reducción del tamaño de las imágenes**: Las dependencias compartidas no se copian en cada imagen
2. **Facilidad de mantenimiento**: Las actualizaciones de dependencias compartidas se aplican automáticamente
3. **Consistencia**: Todos los microservicios usan las mismas versiones de las dependencias compartidas

## Consideraciones

1. En un entorno de producción, se recomienda copiar las dependencias directamente en las imágenes para evitar dependencias externas
2. El enfoque de volúmenes es más adecuado para desarrollo y pruebas
3. Para producción, se debe considerar el uso de un registro privado de NPM o un sistema de monorepo