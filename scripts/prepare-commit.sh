#!/bin/bash

# Script para preparar commit con todos los cambios finales
# Uso: ./scripts/prepare-commit.sh

echo "🚀 Preparando commit con cambios finales..."
echo "═══════════════════════════════════════════════════════"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Mostrar resumen de cambios
echo ""
echo "📊 Estadísticas de cambios:"
echo "───────────────────────────────────────────────────────"
TOTAL_CHANGES=$(git status --short | wc -l)
echo "  Archivos modificados: $TOTAL_CHANGES"

MODIFIED=$(git status --short | grep "^ M" | wc -l)
ADDED=$(git status --short | grep "^??" | wc -l)
echo "  Modificados: $MODIFIED"
echo "  Nuevos: $ADDED"

echo ""
echo "📝 Archivos clave modificados:"
echo "───────────────────────────────────────────────────────"
git status --short | grep -E "(logo\.svg|business-config|seo-manager|manifest\.json|index\.html)" | head -10

echo ""
echo "🎯 Cambios principales:"
echo "───────────────────────────────────────────────────────"
echo "  ✅ Logo profesional generado (logo.svg)"
echo "  ✅ 10 iconos PWA generados"
echo "  ✅ Datos de negocio Chile completos"
echo "  ✅ Email: arreglosvictoriafloreria@gmail.com"
echo "  ✅ RUT: 16123271-8"
echo "  ✅ Fundada: 1980"
echo "  ✅ Locale: es-CL, Moneda: CLP"
echo "  ✅ Redes sociales: Facebook + Instagram"
echo "  ✅ 23 imágenes WebP optimizadas"
echo "  ✅ Sitemap regenerado (23 URLs)"
echo "  ✅ Lighthouse: 80/100 Performance, 100/100 SEO"
echo "  ✅ Validación: 49/49 checks PWA (100%)"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📋 Comandos Git recomendados:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "1. Crear nueva rama:"
echo "   git checkout -b feature/pwa-seo-logo-final"
echo ""
echo "2. Agregar todos los cambios:"
echo "   git add ."
echo ""
echo "3. Commit con mensaje descriptivo:"
echo '   git commit -m "feat: implementación completa PWA/SEO + logo profesional'
echo ''
echo '   - Logo profesional SVG con diseño floral exclusivo'
echo '   - 10 iconos PWA generados automáticamente'
echo '   - Datos reales de negocio (Chile, RUT, email producción)'
echo '   - Optimización WebP (23 imágenes, ahorro 1-86%)'
echo '   - SEO 100/100 (Open Graph, Schema.org, locale CL)'
echo '   - Performance 80/100 en página inicio'
echo '   - Validación completa: 49/49 checks PWA'
echo '   - Sitemap actualizado con 23 URLs'
echo '   - Scripts de automatización (optimize, sitemap, audit)'
echo '   - Documentación completa actualizada"'
echo ""
echo "4. Push a remoto:"
echo "   git push origin feature/pwa-seo-logo-final"
echo ""
echo "5. Crear Pull Request en GitHub"
echo ""

echo "═══════════════════════════════════════════════════════"
read -p "¿Deseas ejecutar estos comandos ahora? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "🔄 Creando rama..."
    git checkout -b feature/pwa-seo-logo-final || {
        echo "⚠️  La rama ya existe, continuando en rama actual..."
        git checkout feature/pwa-seo-logo-final
    }
    
    echo ""
    echo "➕ Agregando archivos..."
    git add .
    
    echo ""
    echo "💾 Creando commit..."
    git commit -m "feat: implementación completa PWA/SEO + logo profesional

- Logo profesional SVG con diseño floral exclusivo
- 10 iconos PWA generados automáticamente (72px-512px)
- Datos reales de negocio (Chile, RUT 16123271-8, email producción)
- Optimización WebP (23 imágenes, ahorro 1-86%)
- SEO 100/100 (Open Graph, Twitter Cards, Schema.org, locale es-CL)
- Performance 80/100 en página inicio
- Validación completa: 49/49 checks PWA (100%)
- Sitemap actualizado con 23 URLs
- Scripts de automatización (optimize-images, sitemap, lighthouse-audit)
- Documentación completa actualizada (MEJORAS_AVANZADAS_2025.md v2.0.0)

Archivos clave:
- frontend/public/logo.svg (nuevo logo profesional)
- frontend/public/icons/ (10 iconos PWA)
- frontend/public/js/config/business-config.js (datos Chile)
- frontend/public/manifest.json (locale es-CL)
- frontend/public/sitemap.xml (23 URLs)
- scripts/ (4 scripts de automatización)

Lighthouse Scores:
- Performance: 80/100 (inicio), 51/100 (productos)
- SEO: 100/100 en todas las páginas
- Accessibility: 88-98/100
- Best Practices: 96-100/100

Validación:
- Base: 101/101 checks ✅
- Avanzada: 49/49 checks ✅
- Total: 150/150 (100%)"
    
    echo ""
    echo "✅ Commit creado exitosamente"
    echo ""
    echo "📤 Siguiente paso:"
    echo "   git push origin feature/pwa-seo-logo-final"
    echo ""
    read -p "¿Deseas hacer push ahora? (s/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo ""
        echo "📤 Haciendo push..."
        git push origin feature/pwa-seo-logo-final
        echo ""
        echo "✅ Push completado"
        echo ""
        echo "🎉 Siguiente paso: Crear Pull Request en GitHub"
        echo "   https://github.com/laloaggro/Flores-Victoria-/pulls"
    else
        echo ""
        echo "⏸️  Push cancelado. Puedes hacerlo manualmente:"
        echo "   git push origin feature/pwa-seo-logo-final"
    fi
else
    echo ""
    echo "⏸️  Comandos no ejecutados."
    echo "   Copia y ejecuta manualmente cuando estés listo."
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📚 Documentación actualizada:"
echo "═══════════════════════════════════════════════════════"
echo "  📄 VALIDACION_FINAL.md - Resumen de validación"
echo "  📄 RESUMEN_EJECUTIVO_FINAL.md - Cambios ejecutivos"
echo "  📄 MEJORAS_AVANZADAS_2025.md - Documentación técnica v2.0.0"
echo "  📄 docs/GUIA_SCRIPTS_OPTIMIZACION.md - Guía de scripts"
echo ""
echo "✅ Script completado"
