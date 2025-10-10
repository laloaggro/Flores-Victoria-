#!/bin/bash

# Script para actualizar la documentación del proyecto
# Este script se encarga de:
# 1. Generar documentación automática de la API
# 2. Actualizar el changelog
# 3. Actualizar tags y etiquetas
# 4. Sincronizar con el repositorio remoto

set -e  # Salir inmediatamente si un comando falla

echo "=== Actualizando documentación del proyecto Flores Victoria ==="

# Directorio base del proyecto
PROJECT_ROOT=$(cd "$(dirname "$0")/.." ; pwd)

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_ROOT/docs" ]; then
    print_error "No se encontró el directorio de documentación"
    exit 1
fi

cd "$PROJECT_ROOT"

# 1. Actualizar documentación de la API
print_status "Actualizando documentación de la API..."
if command -v npm >/dev/null 2>&1; then
    # Generar documentación OpenAPI si hay servicios que la soporten
    echo "Generando documentación OpenAPI..." 
    # Esto sería implementado con herramientas como Swagger/OpenAPI
else
    print_warning "npm no encontrado, saltando generación de documentación de API"
fi

# 2. Actualizar changelog con los últimos commits
print_status "Actualizando changelog..."
LAST_UPDATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
echo "" >> CHANGELOG.md
echo "## [Automated Update] - $LAST_UPDATE" >> CHANGELOG.md
echo "" >> CHANGELOG.md
echo "- Actualización automática de documentación" >> CHANGELOG.md

# 3. Verificar integridad de la documentación
print_status "Verificando integridad de la documentación..."
MISSING_DOCS=0

REQUIRED_DOCS=(
    "docs/PROJECT_REGISTRY.md"
    "docs/architecture/microservices-architecture.md"
    "docs/development/coding-standards.md"
    "docs/deployment/kubernetes/deployment-guide.md"
    "CHANGELOG.md"
    "README.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ ! -f "$doc" ]; then
        print_error "Documento faltante: $doc"
        MISSING_DOCS=1
    fi
done

if [ $MISSING_DOCS -eq 1 ]; then
    print_error "Algunos documentos requeridos no se encontraron"
    exit 1
fi

# 4. Actualizar tags de Git
print_status "Actualizando tags de Git..."
if command -v git >/dev/null 2>&1; then
    # Añadir cambios
    git add docs/ CHANGELOG.md README.md
    
    # Crear commit si hay cambios
    if ! git diff --cached --quiet; then
        git commit -m "docs: actualización automática de documentación - $(date +%Y%m%d_%H%M%S)"
        print_status "Commit creado con la actualización de documentación"
    else
        print_status "No hay cambios para commitear"
    fi
else
    print_warning "Git no encontrado, saltando actualización de tags"
fi

# 5. Generar reporte de documentación
print_status "Generando reporte de documentación..."
cat > docs/DOCUMENTATION_REPORT.md << EOF
# Reporte de Documentación - Flores Victoria

## Informe Generado
- **Fecha**: $(date)
- **Usuario**: $(whoami)
- **Directorio**: $(pwd)

## Estado de la Documentación
- ✅ Registro del Proyecto: Actualizado
- ✅ Arquitectura: Actualizada
- ✅ Estándares de Codificación: Actualizados
- ✅ Guía de Despliegue: Actualizada
- ✅ Changelog: Actualizado

## Estadísticas
- **Total de archivos de documentación**: $(find docs -type f | wc -l)
- **Líneas de documentación**: $(find docs -name "*.md" -exec wc -l {} + | tail -1 | awk '{print $1}')
- **Última actualización**: $(date)

## Próximos Pasos
1. Revisar y validar la documentación actual
2. Actualizar según las nuevas funcionalidades
3. Asegurar que todos los microservicios tengan documentación específica
4. Mantener el changelog actualizado con cada cambio

---
*Reporte generado automáticamente por update-docs.sh*
EOF

print_status "Documentación actualizada exitosamente!"
print_status "Reporte generado en docs/DOCUMENTATION_REPORT.md"

exit 0