#!/bin/bash

# Script para organizar y consolidar documentación
# Fecha: 2025-10-22

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  📚 Consolidación de Documentación - Flores Victoria     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Crear estructura de directorios
echo "📁 Creando estructura de directorios..."

mkdir -p docs/{architecture,development,validation,guides,deprecated}
mkdir -p docs/admin-panel
mkdir -p docs/scripts

echo "✅ Estructura creada"
echo ""

# ═══════════════════════════════════════════════════════════════
# ARQUITECTURA
# ═══════════════════════════════════════════════════════════════
echo "📦 Moviendo archivos de arquitectura..."

if [ -f "ARCHITECTURE.md" ]; then
    mv ARCHITECTURE.md docs/architecture/
fi

if [ -f "PROJECT_OVERVIEW.md" ]; then
    mv PROJECT_OVERVIEW.md docs/architecture/
fi

if [ -f "TECHNICAL_DOCUMENTATION.md" ]; then
    mv TECHNICAL_DOCUMENTATION.md docs/architecture/
fi

if [ -f "DOCUMENTACION.md" ]; then
    mv DOCUMENTACION.md docs/architecture/
fi

if [ -f "PORTS_CONFIGURATION.md" ]; then
    mv PORTS_CONFIGURATION.md docs/architecture/
fi

if [ -f "PUERTOS_UTILIZADOS.md" ]; then
    mv PUERTOS_UTILIZADOS.md docs/architecture/
fi

# ═══════════════════════════════════════════════════════════════
# DESARROLLO
# ═══════════════════════════════════════════════════════════════
echo "🔧 Moviendo archivos de desarrollo..."

if [ -f "DEVELOPMENT_GUIDE.md" ]; then
    mv DEVELOPMENT_GUIDE.md docs/development/
fi

if [ -f "DEVELOPMENT_GUIDE_COMPLETE.md" ]; then
    mv DEVELOPMENT_GUIDE_COMPLETE.md docs/development/
fi

if [ -f "DEV_WORKFLOW.md" ]; then
    mv DEV_WORKFLOW.md docs/development/
fi

if [ -f "DEV_QUICKSTART.md" ]; then
    mv DEV_QUICKSTART.md docs/development/
fi

if [ -f "CHROME_DEVTOOLS_SETUP.md" ]; then
    mv CHROME_DEVTOOLS_SETUP.md docs/development/
fi

if [ -f "DOCKER_GUIDE.md" ]; then
    mv DOCKER_GUIDE.md docs/development/
fi

if [ -f "KUBERNETES_DEPLOYMENT_SUMMARY.md" ]; then
    mv KUBERNETES_DEPLOYMENT_SUMMARY.md docs/development/
fi

# ═══════════════════════════════════════════════════════════════
# VALIDACIÓN
# ═══════════════════════════════════════════════════════════════
echo "✅ Moviendo archivos de validación..."

if [ -f "VALIDATION_CHECKLIST.md" ]; then
    mv VALIDATION_CHECKLIST.md docs/validation/
fi

if [ -f "VALIDACION_FINAL.md" ]; then
    mv VALIDACION_FINAL.md docs/validation/
fi

if [ -f "VALIDACION_DESARROLLO.md" ]; then
    mv VALIDACION_DESARROLLO.md docs/validation/
fi

if [ -f "VALIDACION_COMPLETA_2025.md" ]; then
    mv VALIDACION_COMPLETA_2025.md docs/validation/
fi

if [ -f "VALIDACION_COMPLETA_FINAL.md" ]; then
    mv VALIDACION_COMPLETA_FINAL.md docs/validation/
fi

if [ -f "REPORTE_VALIDACION_FINAL.md" ]; then
    mv REPORTE_VALIDACION_FINAL.md docs/validation/
fi

# ═══════════════════════════════════════════════════════════════
# GUÍAS Y MEJORAS
# ═══════════════════════════════════════════════════════════════
echo "📖 Moviendo guías y documentos de mejoras..."

if [ -f "MEJORAS_IMPLEMENTADAS.md" ]; then
    mv MEJORAS_IMPLEMENTADAS.md docs/guides/
fi

if [ -f "MEJORAS_COMPLETADAS_2025.md" ]; then
    mv MEJORAS_COMPLETADAS_2025.md docs/guides/
fi

if [ -f "MEJORAS_AVANZADAS_2025.md" ]; then
    mv MEJORAS_AVANZADAS_2025.md docs/guides/
fi

if [ -f "DESIGN_QUICK_GUIDE.md" ]; then
    mv DESIGN_QUICK_GUIDE.md docs/guides/
fi

if [ -f "DESIGN_AUDIT_2025.md" ]; then
    mv DESIGN_AUDIT_2025.md docs/guides/
fi

if [ -f "RECOMENDACIONES_ADICIONALES.md" ]; then
    mv RECOMENDACIONES_ADICIONALES.md docs/guides/
fi

if [ -f "NEXT_STEPS.md" ]; then
    mv NEXT_STEPS.md docs/guides/
fi

# ═══════════════════════════════════════════════════════════════
# ADMIN PANEL
# ═══════════════════════════════════════════════════════════════
echo "🎨 Moviendo documentación de Admin Panel..."

if [ -f "ADMIN_SITE_GUIDE.md" ]; then
    mv ADMIN_SITE_GUIDE.md docs/admin-panel/
fi

if [ -f "ADMIN_SITE_IMPLEMENTATION.md" ]; then
    mv ADMIN_SITE_IMPLEMENTATION.md docs/admin-panel/
fi

if [ -f "ADMIN_PANEL_ACTUALIZACION.md" ]; then
    mv ADMIN_PANEL_ACTUALIZACION.md docs/admin-panel/
fi

if [ -f "CONSOLIDACION_ADMIN_PANEL.md" ]; then
    mv CONSOLIDACION_ADMIN_PANEL.md docs/admin-panel/
fi

if [ -f "README_ADMIN_SITE.md" ]; then
    mv README_ADMIN_SITE.md docs/admin-panel/
fi

# ═══════════════════════════════════════════════════════════════
# SCRIPTS
# ═══════════════════════════════════════════════════════════════
echo "📜 Moviendo documentación de scripts..."

if [ -f "SCRIPTS_NPM.md" ]; then
    mv SCRIPTS_NPM.md docs/scripts/
fi

# ═══════════════════════════════════════════════════════════════
# DEPRECATED (archivos viejos/redundantes)
# ═══════════════════════════════════════════════════════════════
echo "🗄️  Moviendo archivos deprecated..."

# Versiones antiguas y reportes redundantes
if [ -f "ALL_IMPROVEMENTS_COMPLETED.md" ]; then
    mv ALL_IMPROVEMENTS_COMPLETED.md docs/deprecated/
fi

if [ -f "COMPLETE_IMPLEMENTATION_REPORT.md" ]; then
    mv COMPLETE_IMPLEMENTATION_REPORT.md docs/deprecated/
fi

if [ -f "IMPLEMENTACION_COMPLETADA.md" ]; then
    mv IMPLEMENTACION_COMPLETADA.md docs/deprecated/
fi

if [ -f "DEV_IMPROVEMENTS_COMPLETED.md" ]; then
    mv DEV_IMPROVEMENTS_COMPLETED.md docs/deprecated/
fi

if [ -f "ACTUALIZACION_v2.0.0_RESUMEN.md" ]; then
    mv ACTUALIZACION_v2.0.0_RESUMEN.md docs/deprecated/
fi

if [ -f "TRABAJO_COMPLETADO_v2.0.md" ]; then
    mv TRABAJO_COMPLETADO_v2.0.md docs/deprecated/
fi

if [ -f "CORRECCIONES_v1.0.1.md" ]; then
    mv CORRECCIONES_v1.0.1.md docs/deprecated/
fi

if [ -f "DEV_SUMMARY_EXECUTIVE.md" ]; then
    mv DEV_SUMMARY_EXECUTIVE.md docs/deprecated/
fi

if [ -f "RESUMEN_EJECUTIVO_FINAL.md" ]; then
    mv RESUMEN_EJECUTIVO_FINAL.md docs/deprecated/
fi

if [ -f "PROJECT_SUMMARY.md" ]; then
    mv PROJECT_SUMMARY.md docs/deprecated/
fi

if [ -f "PORT_MANAGEMENT_RECOMMENDATIONS.md" ]; then
    mv PORT_MANAGEMENT_RECOMMENDATIONS.md docs/deprecated/
fi

if [ -f "PRODUCT_SERVICE_CHANGES.md" ]; then
    mv PRODUCT_SERVICE_CHANGES.md docs/deprecated/
fi

if [ -f "LIGHTHOUSE_RESULTS.md" ]; then
    mv LIGHTHOUSE_RESULTS.md docs/deprecated/
fi

if [ -f "MONGODB_VISUALIZATION.md" ]; then
    mv MONGODB_VISUALIZATION.md docs/deprecated/
fi

if [ -f "PLANILLA_PROS_CONTRAS.md" ]; then
    mv PLANILLA_PROS_CONTRAS.md docs/deprecated/
fi

if [ -f "DOCKER_COMPOSE_LEGACY_README.md" ]; then
    mv DOCKER_COMPOSE_LEGACY_README.md docs/deprecated/
fi

if [ -f "CONTEXTO.md" ]; then
    mv CONTEXTO.md docs/deprecated/
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Consolidación completada!"
echo ""
echo "📁 Estructura final:"
echo ""
echo "docs/"
echo "├── architecture/      # Documentos de arquitectura"
echo "├── development/       # Guías de desarrollo"
echo "├── validation/        # Documentos de validación"
echo "├── guides/            # Guías y mejoras"
echo "├── admin-panel/       # Documentación admin panel"
echo "├── scripts/           # Documentación de scripts"
echo "└── deprecated/        # Archivos antiguos"
echo ""
echo "📊 Archivos organizados por categoría"
echo ""

# Crear índice
echo "📄 Creando índice de documentación..."

cat > docs/README.md << 'HEREDOC'
# 📚 Documentación Flores Victoria

## Estructura de Documentación

### 🏗️ Architecture
Documentos sobre la arquitectura del sistema:
- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) - Arquitectura general
- [PROJECT_OVERVIEW.md](architecture/PROJECT_OVERVIEW.md) - Visión general
- [TECHNICAL_DOCUMENTATION.md](architecture/TECHNICAL_DOCUMENTATION.md) - Documentación técnica
- [PORTS_CONFIGURATION.md](architecture/PORTS_CONFIGURATION.md) - Configuración de puertos

### 🔧 Development
Guías para desarrolladores:
- [DEVELOPMENT_GUIDE.md](development/DEVELOPMENT_GUIDE.md) - Guía de desarrollo
- [DEV_WORKFLOW.md](development/DEV_WORKFLOW.md) - Flujo de trabajo
- [DEV_QUICKSTART.md](development/DEV_QUICKSTART.md) - Inicio rápido
- [CHROME_DEVTOOLS_SETUP.md](development/CHROME_DEVTOOLS_SETUP.md) - Configuración DevTools
- [DOCKER_GUIDE.md](development/DOCKER_GUIDE.md) - Guía Docker
- [KUBERNETES_DEPLOYMENT_SUMMARY.md](development/KUBERNETES_DEPLOYMENT_SUMMARY.md) - Deploy K8s

### ✅ Validation
Documentos de validación y testing:
- [VALIDATION_CHECKLIST.md](validation/VALIDATION_CHECKLIST.md) - Checklist de validación
- [VALIDACION_COMPLETA_FINAL.md](validation/VALIDACION_COMPLETA_FINAL.md) - Validación completa
- [REPORTE_VALIDACION_FINAL.md](validation/REPORTE_VALIDACION_FINAL.md) - Reporte final

### 📖 Guides
Guías y documentos de mejoras:
- [MEJORAS_IMPLEMENTADAS.md](guides/MEJORAS_IMPLEMENTADAS.md) - Mejoras implementadas
- [DESIGN_QUICK_GUIDE.md](guides/DESIGN_QUICK_GUIDE.md) - Guía de diseño
- [RECOMENDACIONES_ADICIONALES.md](guides/RECOMENDACIONES_ADICIONALES.md) - Recomendaciones
- [NEXT_STEPS.md](guides/NEXT_STEPS.md) - Próximos pasos

### 🎨 Admin Panel
Documentación del panel de administración:
- [ADMIN_SITE_GUIDE.md](admin-panel/ADMIN_SITE_GUIDE.md) - Guía del admin site
- [CONSOLIDACION_ADMIN_PANEL.md](admin-panel/CONSOLIDACION_ADMIN_PANEL.md) - Consolidación

### 📜 Scripts
Documentación de scripts:
- [SCRIPTS_NPM.md](scripts/SCRIPTS_NPM.md) - Scripts NPM disponibles

### 🗄️ Deprecated
Documentos antiguos/deprecados (para referencia histórica)

---

## Quick Links

### Para Empezar
1. [Quick Start](development/DEV_QUICKSTART.md)
2. [Workflow de Desarrollo](development/DEV_WORKFLOW.md)
3. [Arquitectura](architecture/ARCHITECTURE.md)

### Para Desarrolladores
1. [Guía de Desarrollo](development/DEVELOPMENT_GUIDE.md)
2. [Chrome DevTools Setup](development/CHROME_DEVTOOLS_SETUP.md)
3. [Scripts NPM](scripts/SCRIPTS_NPM.md)

### Para Testing/QA
1. [Validation Checklist](validation/VALIDATION_CHECKLIST.md)
2. [Reporte de Validación](validation/REPORTE_VALIDACION_FINAL.md)

---

**Última actualización**: 2025-10-22
HEREDOC

echo "✅ Índice creado: docs/README.md"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🎉 ¡Documentación organizada exitosamente!"
echo ""
echo "📖 Ver índice: cat docs/README.md"
echo ""
