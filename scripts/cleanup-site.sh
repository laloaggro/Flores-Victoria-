#!/bin/bash

# 🔧 Script de Limpieza y Organización - Flores Victoria
# Ejecuta las mejoras identificadas en la auditoría

set -e  # Exit on error

echo "🚀 Iniciando limpieza y organización del sitio..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de acciones
DELETED=0
MOVED=0
FIXED=0

# Crear backup
echo -e "${YELLOW}📦 Creando backup...${NC}"
BACKUP_DIR="backups/site-cleanup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r frontend "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup creado en: $BACKUP_DIR${NC}"
echo ""

# =============================================================================
# FASE 1: ELIMINAR DUPLICADOS
# =============================================================================

echo -e "${YELLOW}🗑️  FASE 1: Eliminando archivos duplicados...${NC}"

# 1.1 Eliminar archivos duplicados en raíz
echo "  → Eliminando archivos duplicados en raíz..."
FILES_TO_DELETE=(
    "frontend/productos.html"
    "frontend/products.html"
    "frontend/sistema-contable.html"
    "frontend/checklist-validacion.html"
)

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo -e "    ${RED}✗${NC} Eliminado: $file"
        ((DELETED++))
    fi
done

# 1.2 Mover documentación técnica a /docs/
echo "  → Moviendo documentación técnica..."
mkdir -p frontend/docs

DOCS_TO_MOVE=(
    "frontend/DOCUMENTATION.html"
    "frontend/ARCHITECTURE.html"
    "frontend/performance-benchmark.html"
)

for doc in "${DOCS_TO_MOVE[@]}"; do
    if [ -f "$doc" ]; then
        filename=$(basename "$doc")
        mv "$doc" "frontend/docs/$filename"
        echo -e "    ${GREEN}→${NC} Movido: $doc → frontend/docs/$filename"
        ((MOVED++))
    fi
done

# 1.3 Eliminar subcarpetas duplicadas
echo "  → Eliminando subcarpetas duplicadas..."
FOLDERS_TO_DELETE=(
    "frontend/pages/auth"
    "frontend/pages/shop"
    "frontend/pages/user"
    "frontend/pages/info"
    "frontend/pages/support"
    "frontend/admin-site"
)

for folder in "${FOLDERS_TO_DELETE[@]}"; do
    if [ -d "$folder" ]; then
        # Mover archivos únicos antes de eliminar
        if [ "$folder" == "frontend/pages/legal" ]; then
            # Mantener privacy.html y terms.html en /pages/
            [ -f "$folder/privacy.html" ] && cp "$folder/privacy.html" "frontend/pages/" 2>/dev/null || true
            [ -f "$folder/terms.html" ] && cp "$folder/terms.html" "frontend/pages/" 2>/dev/null || true
        fi
        
        rm -rf "$folder"
        echo -e "    ${RED}✗${NC} Eliminado: $folder/"
        ((DELETED++))
    fi
done

# 1.4 Eliminar sitemaps duplicados (mantener solo /pages/sitemap.html)
echo "  → Eliminando sitemaps duplicados..."
find frontend/pages -name "sitemap.html" -not -path "frontend/pages/sitemap.html" -delete 2>/dev/null || true
echo -e "    ${RED}✗${NC} Eliminados sitemaps duplicados"

# 1.5 Limpiar /public/ si existe y no es necesario
if [ -d "frontend/public" ] && [ "$(ls -A frontend/public)" ]; then
    echo "  → Revisando frontend/public/..."
    # Solo mantener assets necesarios, eliminar HTMLs duplicados
    find frontend/public -name "*.html" -delete 2>/dev/null || true
    echo -e "    ${RED}✗${NC} Limpiado: frontend/public/"
fi

echo -e "${GREEN}✓ Fase 1 completada${NC}"
echo ""

# =============================================================================
# FASE 2: ESTANDARIZAR RUTAS EN ARCHIVOS HTML
# =============================================================================

echo -e "${YELLOW}🔗 FASE 2: Estandarizando rutas en archivos HTML...${NC}"

# Función para corregir rutas en un archivo
fix_routes() {
    local file=$1
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    # Backup del archivo
    cp "$file" "$file.bak"
    
    # Corregir rutas comunes
    sed -i 's|href="../index.html"|href="/index.html"|g' "$file"
    sed -i 's|href="index.html"|href="/index.html"|g' "$file"
    sed -i 's|href="/about.html"|href="/pages/about.html"|g' "$file"
    sed -i 's|href="/contact.html"|href="/pages/contact.html"|g' "$file"
    sed -i 's|href="/login.html"|href="/pages/login.html"|g' "$file"
    sed -i 's|href="/register.html"|href="/pages/register.html"|g' "$file"
    sed -i 's|href="./sitemap.html"|href="/pages/sitemap.html"|g' "$file"
    
    # Si el archivo cambió, incrementar contador
    if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
        ((FIXED++))
        echo -e "    ${GREEN}✓${NC} Rutas corregidas: $(basename $file)"
    fi
    
    # Eliminar backup
    rm "$file.bak"
}

# Corregir rutas en archivos principales
echo "  → Corrigiendo rutas en páginas principales..."
for file in frontend/pages/*.html; do
    [ -f "$file" ] && fix_routes "$file"
done

echo -e "${GREEN}✓ Fase 2 completada${NC}"
echo ""

# =============================================================================
# FASE 3: CREAR ESTRUCTURA DE NAVEGACIÓN MEJORADA
# =============================================================================

echo -e "${YELLOW}🧭 FASE 3: Creando componentes de navegación mejorados...${NC}"

# Crear componente de navegación mejorado
cat > frontend/components/navigation.html << 'EOF'
<!-- Navegación Principal Mejorada -->
<nav class="main-nav">
    <ul>
        <li><a href="/index.html" class="nav-link" data-page="home">Inicio</a></li>
        <li class="has-dropdown">
            <a href="/pages/products.html" class="nav-link" data-page="products">Productos</a>
            <ul class="dropdown">
                <li><a href="/pages/products.html?category=rosas">Rosas</a></li>
                <li><a href="/pages/products.html?category=tulipanes">Tulipanes</a></li>
                <li><a href="/pages/products.html?category=bouquets">Bouquets</a></li>
                <li><a href="/pages/products.html?featured=true">Destacados</a></li>
            </ul>
        </li>
        <li><a href="/pages/gallery.html" class="nav-link" data-page="gallery">Galería</a></li>
        <li><a href="/pages/about.html" class="nav-link" data-page="about">Nosotros</a></li>
        <li><a href="/pages/blog.html" class="nav-link" data-page="blog">Blog</a></li>
        <li><a href="/pages/contact.html" class="nav-link" data-page="contact">Contacto</a></li>
    </ul>
</nav>
EOF

echo -e "    ${GREEN}✓${NC} Creado: components/navigation.html"

# Crear componente de breadcrumbs
cat > frontend/components/breadcrumbs.html << 'EOF'
<!-- Breadcrumbs Component -->
<nav class="breadcrumbs" aria-label="breadcrumb">
    <ol>
        <li><a href="/index.html">Inicio</a></li>
        <!-- El resto se genera dinámicamente por JS -->
    </ol>
</nav>
EOF

echo -e "    ${GREEN}✓${NC} Creado: components/breadcrumbs.html"

# Crear footer mejorado
cat > frontend/components/footer-enhanced.html << 'EOF'
<!-- Footer Mejorado -->
<footer class="footer">
    <div class="container">
        <div class="footer-grid">
            <!-- Columna 1: Compra -->
            <div class="footer-column">
                <h4>Compra</h4>
                <ul>
                    <li><a href="/pages/products.html">Productos</a></li>
                    <li><a href="/pages/products.html?featured=true">Destacados</a></li>
                    <li><a href="/pages/shipping.html">Envíos</a></li>
                    <li><a href="/pages/faq.html">Preguntas Frecuentes</a></li>
                </ul>
            </div>
            
            <!-- Columna 2: Nosotros -->
            <div class="footer-column">
                <h4>Nosotros</h4>
                <ul>
                    <li><a href="/pages/about.html">Sobre Nosotros</a></li>
                    <li><a href="/pages/testimonials.html">Testimonios</a></li>
                    <li><a href="/pages/blog.html">Blog</a></li>
                    <li><a href="/pages/gallery.html">Galería</a></li>
                </ul>
            </div>
            
            <!-- Columna 3: Legal -->
            <div class="footer-column">
                <h4>Legal</h4>
                <ul>
                    <li><a href="/pages/privacy.html">Política de Privacidad</a></li>
                    <li><a href="/pages/terms.html">Términos y Condiciones</a></li>
                </ul>
            </div>
            
            <!-- Columna 4: Ayuda -->
            <div class="footer-column">
                <h4>Ayuda</h4>
                <ul>
                    <li><a href="/pages/contact.html">Contacto</a></li>
                    <li><a href="/pages/faq.html">FAQ</a></li>
                    <li><a href="/pages/sitemap.html">Mapa del Sitio</a></li>
                </ul>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>&copy; 2025 Flores Victoria. Todos los derechos reservados.</p>
            <div class="social-links">
                <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            </div>
        </div>
    </div>
</footer>
EOF

echo -e "    ${GREEN}✓${NC} Creado: components/footer-enhanced.html"

echo -e "${GREEN}✓ Fase 3 completada${NC}"
echo ""

# =============================================================================
# FASE 4: CREAR PÁGINAS FALTANTES
# =============================================================================

echo -e "${YELLOW}📄 FASE 4: Verificando páginas faltantes...${NC}"

# Verificar que existan las páginas críticas
CRITICAL_PAGES=(
    "frontend/pages/gallery.html"
    "frontend/pages/blog.html"
    "frontend/pages/testimonials.html"
    "frontend/pages/sitemap.html"
)

for page in "${CRITICAL_PAGES[@]}"; do
    if [ ! -f "$page" ]; then
        echo -e "    ${YELLOW}⚠${NC} Falta: $page (necesita ser creado)"
    else
        echo -e "    ${GREEN}✓${NC} Existe: $page"
    fi
done

echo ""

# =============================================================================
# RESUMEN
# =============================================================================

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ LIMPIEZA COMPLETADA${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Resumen de acciones:"
echo -e "  ${RED}✗${NC} Archivos eliminados: $DELETED"
echo -e "  ${GREEN}→${NC} Archivos movidos: $MOVED"
echo -e "  ${GREEN}✓${NC} Archivos corregidos: $FIXED"
echo ""
echo "📦 Backup guardado en: $BACKUP_DIR"
echo ""
echo "📝 Próximos pasos recomendados:"
echo "  1. Revisar que el sitio funcione correctamente"
echo "  2. Crear páginas faltantes (gallery, blog, sitemap)"
echo "  3. Actualizar navegación en index.html con components/navigation.html"
echo "  4. Implementar breadcrumbs con components/breadcrumbs.html"
echo "  5. Reemplazar footer con components/footer-enhanced.html"
echo ""
echo -e "${YELLOW}⚠ IMPORTANTE:${NC} Prueba el sitio antes de hacer commit"
echo ""

exit 0
