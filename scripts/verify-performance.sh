#!/bin/bash

# ========================================
# 📊 Script de Verificación de Performance
# Post-Deploy en Oracle Cloud
# ========================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuración
SITE_URL="${1:-https://arreglosvictoria.com}"
PAGE_URL="$SITE_URL/pages/products.html"

echo ""
echo "========================================="
echo "📊 Verificación de Performance"
echo "========================================="
echo ""
echo "🌐 URL: $PAGE_URL"
echo ""

# 1. Verificar que el sitio responde
echo -e "${BLUE}1. Verificando disponibilidad...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}   ✅ Sitio disponible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}   ❌ Sitio no disponible (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

# 2. Verificar HTTP/2
echo -e "${BLUE}2. Verificando HTTP/2...${NC}"
HTTP_VERSION=$(curl -sI --http2 "$SITE_URL" 2>/dev/null | grep -i "HTTP/" | head -1 || echo "HTTP/1.1")

if echo "$HTTP_VERSION" | grep -q "HTTP/2"; then
    echo -e "${GREEN}   ✅ HTTP/2 habilitado${NC}"
else
    echo -e "${YELLOW}   ⚠️  HTTP/2 no detectado: $HTTP_VERSION${NC}"
fi

# 3. Verificar Gzip/Compression
echo -e "${BLUE}3. Verificando compresión...${NC}"
COMPRESSION=$(curl -sI -H "Accept-Encoding: gzip, br" "$PAGE_URL" 2>/dev/null | grep -i "content-encoding" | awk '{print $2}' | tr -d '\r')

if [ -n "$COMPRESSION" ]; then
    echo -e "${GREEN}   ✅ Compresión: $COMPRESSION${NC}"
else
    echo -e "${YELLOW}   ⚠️  Compresión no detectada${NC}"
fi

# 4. Verificar Cache Headers
echo -e "${BLUE}4. Verificando cache headers...${NC}"
CACHE_CONTROL=$(curl -sI "$PAGE_URL" 2>/dev/null | grep -i "cache-control" | awk -F': ' '{print $2}' | tr -d '\r')

if [ -n "$CACHE_CONTROL" ]; then
    echo -e "${GREEN}   ✅ Cache-Control: $CACHE_CONTROL${NC}"
else
    echo -e "${YELLOW}   ⚠️  Cache headers no detectados${NC}"
fi

# 5. Verificar SSL/TLS
echo -e "${BLUE}5. Verificando SSL/TLS...${NC}"
if echo "$SITE_URL" | grep -q "https://"; then
    SSL_INFO=$(echo | openssl s_client -servername "${SITE_URL#https://}" -connect "${SITE_URL#https://}:443" 2>/dev/null | grep "Protocol" | head -1 || echo "N/A")
    if [ "$SSL_INFO" != "N/A" ]; then
        echo -e "${GREEN}   ✅ $SSL_INFO${NC}"
    else
        echo -e "${YELLOW}   ⚠️  SSL info no disponible${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Sitio no usa HTTPS${NC}"
fi

# 6. Verificar tamaño de assets
echo -e "${BLUE}6. Verificando tamaño de assets críticos...${NC}"

# CSS
CSS_SIZE=$(curl -sI -H "Accept-Encoding: identity" "$SITE_URL/assets/css/products-0e22c5be.css" 2>/dev/null | grep -i "content-length" | awk '{print $2}' | tr -d '\r' || echo "0")
if [ "$CSS_SIZE" != "0" ]; then
    CSS_KB=$((CSS_SIZE / 1024))
    echo -e "${GREEN}   ✅ CSS principal: ${CSS_KB} KB${NC}"
else
    echo -e "${YELLOW}   ⚠️  CSS no encontrado o sin content-length${NC}"
fi

# 7. Lighthouse Audit (si está disponible)
echo ""
echo -e "${BLUE}7. Ejecutando Lighthouse audit...${NC}"

if command -v npx &> /dev/null; then
    TIMESTAMP=$(date +%s)
    AUDIT_FILE="/tmp/lighthouse-verify-${TIMESTAMP}.json"
    
    npx lighthouse "$PAGE_URL" \
        --only-categories=performance \
        --output=json \
        --output-path="$AUDIT_FILE" \
        --chrome-flags="--headless --no-sandbox --disable-gpu" \
        --quiet 2>/dev/null || true
    
    if [ -f "$AUDIT_FILE" ]; then
        echo ""
        echo "   📊 Resultados de Performance:"
        
        # Extraer métricas
        SCORE=$(cat "$AUDIT_FILE" | jq -r '.categories.performance.score * 100 | floor' 2>/dev/null || echo "N/A")
        FCP=$(cat "$AUDIT_FILE" | jq -r '.audits["first-contentful-paint"].displayValue' 2>/dev/null || echo "N/A")
        LCP=$(cat "$AUDIT_FILE" | jq -r '.audits["largest-contentful-paint"].displayValue' 2>/dev/null || echo "N/A")
        TBT=$(cat "$AUDIT_FILE" | jq -r '.audits["total-blocking-time"].displayValue' 2>/dev/null || echo "N/A")
        CLS=$(cat "$AUDIT_FILE" | jq -r '.audits["cumulative-layout-shift"].displayValue' 2>/dev/null || echo "N/A")
        
        echo ""
        
        # Score con color
        if [ "$SCORE" != "N/A" ]; then
            if [ "$SCORE" -ge 60 ]; then
                echo -e "   ${GREEN}✅ Performance Score: $SCORE/100${NC}"
            elif [ "$SCORE" -ge 50 ]; then
                echo -e "   ${YELLOW}⚠️  Performance Score: $SCORE/100${NC}"
            else
                echo -e "   ${RED}❌ Performance Score: $SCORE/100${NC}"
            fi
        fi
        
        echo "   • FCP: $FCP"
        echo "   • LCP: $LCP"
        echo "   • TBT: $TBT"
        echo "   • CLS: $CLS"
        
        echo ""
        echo -e "${BLUE}   📄 Reporte completo: $AUDIT_FILE${NC}"
        
        # Recomendaciones basadas en score
        if [ "$SCORE" != "N/A" ] && [ "$SCORE" -lt 60 ]; then
            echo ""
            echo -e "${YELLOW}   💡 Recomendaciones para mejorar:${NC}"
            echo "      • Verificar que nginx tiene gzip/br habilitado"
            echo "      • Confirmar que HTTP/2 está activo"
            echo "      • Revisar cache headers en /etc/nginx/sites-available/"
            echo "      • Considerar Oracle Object Storage para imágenes"
        fi
    else
        echo -e "${YELLOW}   ⚠️  Lighthouse no disponible o falló${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  npx no disponible, saltando Lighthouse${NC}"
fi

echo ""
echo "========================================="
echo "✅ Verificación Completada"
echo "========================================="
echo ""

# 8. Resumen de recomendaciones
echo "📚 Documentación:"
echo "  • Guía completa: ORACLE_CLOUD_PERFORMANCE.md"
echo "  • Troubleshooting: Ver sección correspondiente en la guía"
echo ""
echo "🔧 Comandos útiles:"
echo "  • Ver logs nginx: sudo tail -f /var/log/nginx/access.log"
echo "  • Reload nginx: sudo systemctl reload nginx"
echo "  • Test nginx config: sudo nginx -t"
echo ""
