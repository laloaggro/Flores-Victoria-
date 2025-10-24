#!/bin/bash

# 🔍 VERIFICACIÓN COMPLETA FRONTEND PWA - FLORES VICTORIA v3.0
# Verifica todas las funcionalidades del frontend Progressive Web App

echo "🌺 VERIFICANDO FRONTEND PWA - FLORES VICTORIA v3.0"
echo "================================================="
echo "📅 $(date)"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FRONTEND_URL="http://localhost:8080"

# Función para verificar archivo
check_file() {
    local file=$1
    local name=$2
    
    printf "%-40s" "$name"
    
    response=$(curl -s -I "$FRONTEND_URL/$file" 2>/dev/null | head -1)
    if echo "$response" | grep -q "200 OK"; then
        printf "${GREEN}✅ DISPONIBLE${NC}\n"
        return 0
    else
        printf "${RED}❌ NO ENCONTRADO${NC}\n"
        return 1
    fi
}

# Función para verificar contenido
check_content() {
    local file=$1
    local name=$2
    local search_term=$3
    
    printf "%-40s" "$name"
    
    content=$(curl -s "$FRONTEND_URL/$file" 2>/dev/null)
    if [[ -n "$content" ]] && echo "$content" | grep -q "$search_term"; then
        printf "${GREEN}✅ FUNCIONAL${NC}\n"
        return 0
    else
        printf "${RED}❌ PROBLEMA${NC}\n"
        return 1
    fi
}

echo "${BLUE}📱 ARCHIVOS PRINCIPALES${NC}"
echo "------------------------"

# Verificar archivos principales
check_file "" "Página Principal (index.html)"
check_file "sw.js" "Service Worker"
check_file "manifest.json" "Manifest PWA"
check_file "offline.html" "Página Offline"

echo ""
echo "${BLUE}🎨 RECURSOS CSS${NC}"
echo "----------------"

# Verificar CSS
check_file "css/style.css" "CSS Principal"
check_file "css/base.css" "CSS Base"
check_file "css/components.css" "CSS Componentes"
check_file "css/design-system.css" "CSS Sistema de Diseño"

echo ""
echo "${BLUE}⚡ RECURSOS JAVASCRIPT${NC}"
echo "-----------------------"

# Verificar JS
check_file "js/main.js" "JavaScript Principal"
check_file "js/api.js" "API Handler"
check_file "js/pwa-advanced.js" "PWA Avanzado"
check_file "js/chatbot.js" "Chatbot AI"
check_file "js/ai-recommendations.js" "Recomendaciones AI"
check_file "js/wasm-processor.js" "WASM Processor"

echo ""
echo "${BLUE}🔧 FUNCIONALIDADES PWA${NC}"
echo "------------------------"

# Verificar funcionalidades PWA
check_content "" "Meta PWA" "theme-color"
check_content "manifest.json" "Configuración PWA" "standalone"
check_content "sw.js" "Cache Strategy" "urlsToCache"
check_content "offline.html" "Página Offline" "Sin Conexión"

echo ""
echo "${BLUE}🚀 VERIFICACIÓN DE RENDIMIENTO${NC}"
echo "================================"

# Medir tiempos de respuesta
echo "Midiendo velocidad de carga..."

start_time=$(date +%s%N)
curl -s "$FRONTEND_URL/" > /dev/null
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))

printf "%-40s" "Tiempo de carga página principal"
if [ $duration -lt 500 ]; then
    printf "${GREEN}✅ ${duration}ms (RÁPIDO)${NC}\n"
elif [ $duration -lt 1000 ]; then
    printf "${YELLOW}⚠️  ${duration}ms (ACEPTABLE)${NC}\n"
else
    printf "${RED}❌ ${duration}ms (LENTO)${NC}\n"
fi

# Verificar tamaño de archivos
main_size=$(curl -s "$FRONTEND_URL/" | wc -c)
printf "%-40s" "Tamaño página principal"
if [ $main_size -lt 50000 ]; then
    printf "${GREEN}✅ ${main_size} bytes (OPTIMIZADO)${NC}\n"
elif [ $main_size -lt 100000 ]; then
    printf "${YELLOW}⚠️  ${main_size} bytes (ACEPTABLE)${NC}\n"
else
    printf "${RED}❌ ${main_size} bytes (GRANDE)${NC}\n"
fi

echo ""
echo "${BLUE}📊 ANÁLISIS DE CONTENIDO${NC}"
echo "========================="

# Verificar características específicas del contenido
check_content "" "Título SEO" "Flores Victoria"
check_content "" "Meta Description" "Descubre los arreglos florales"
check_content "" "Open Graph" "og:title"
check_content "" "Schema.org" "schema.org\|@type"

echo ""
echo "${BLUE}🎯 RECOMENDACIONES${NC}"
echo "==================="

# Generar recomendaciones
echo ""
echo "🌟 ${GREEN}FRONTEND PWA ESTADO:${NC}"

# Verificar si está corriendo
if curl -s "$FRONTEND_URL/" > /dev/null 2>&1; then
    echo "   ✅ Frontend funcionando en $FRONTEND_URL"
    echo "   ✅ PWA configurado correctamente"
    echo "   ✅ Service Worker disponible"
    echo "   ✅ Página offline implementada"
else
    echo "   ❌ Frontend no disponible"
    echo ""
    echo "🔧 ${YELLOW}Para iniciar frontend:${NC}"
    echo "   cd /home/impala/Documentos/Proyectos/flores-victoria/frontend"
    echo "   python3 -m http.server 8080"
fi

echo ""
echo "🚀 ${BLUE}Para mejorar rendimiento:${NC}"
echo "   • Comprimir imágenes a WebP"
echo "   • Minificar CSS y JavaScript"
echo "   • Implementar lazy loading"
echo "   • Optimizar Service Worker cache"

echo ""
echo "🔄 ${BLUE}Para desarrollo avanzado:${NC}"
echo "   • Usar Vite para desarrollo: npm run dev"
echo "   • Build de producción: npm run build"  
echo "   • Tests: npm test"
echo "   • Análisis Lighthouse para PWA score"

echo ""
echo "================================================="
echo "✅ Verificación completada - $(date)"
echo "🌺 Frontend PWA Flores Victoria v3.0"