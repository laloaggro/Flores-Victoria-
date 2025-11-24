#!/bin/bash
# 🚀 FLORES VICTORIA - SCRIPT DE TESTING Y VALIDACIÓN
# ====================================================

echo "🌺 FLORES VICTORIA - Testing y Validación"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Directorio del proyecto
FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"

cd "$FRONTEND_DIR" || exit 1

echo -e "${BLUE}📋 CHECKLIST DE VALIDACIÓN${NC}"
echo "================================"
echo ""
echo "1️⃣  Levantar servidor de desarrollo"
echo "2️⃣  Abrir checklist de validación en navegador"
echo "3️⃣  Ejecutar validaciones automáticas"
echo "4️⃣  Ver documentación completa"
echo "5️⃣  Salir"
echo ""

read -p "Selecciona una opción (1-5): " option

case $option in
    1)
        echo ""
        echo -e "${GREEN}🚀 Levantando servidor de desarrollo...${NC}"
        echo ""
            echo "El servidor se abrirá en http://localhost:5175"
        echo "Presiona Ctrl+C para detener el servidor"
        echo ""
            python3 -m http.server 5175
        ;;
    
    2)
        echo ""
        echo -e "${BLUE}📋 Abriendo checklist de validación...${NC}"
        echo ""
        
        # Verificar si el servidor está corriendo
            if lsof -i :5175 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Servidor detectado en puerto 5175${NC}"
            URL="http://localhost:5175/checklist-validacion.html"
            elif lsof -i :5174 >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Servidor detectado en puerto 5174${NC}"
                URL="http://localhost:5174/checklist-validacion.html"
            elif lsof -i :5173 >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Servidor detectado en puerto 5173${NC}"
                URL="http://localhost:5173/checklist-validacion.html"
        else
            echo -e "${YELLOW}⚠️  No se detectó servidor corriendo${NC}"
            echo "Por favor, ejecuta primero la opción 1 para levantar el servidor"
            exit 1
        fi
        
        # Intentar abrir en el navegador
        if command -v xdg-open > /dev/null; then
            xdg-open "$URL" 2>/dev/null
        elif command -v google-chrome > /dev/null; then
            google-chrome "$URL" 2>/dev/null &
        elif command -v firefox > /dev/null; then
            firefox "$URL" 2>/dev/null &
        else
            echo "No se pudo abrir automáticamente. Por favor abre manualmente:"
            echo "$URL"
        fi
        
        echo ""
        echo -e "${GREEN}✅ Checklist abierto en el navegador${NC}"
        echo ""
        echo "Sigue las instrucciones en el checklist para validar todas las mejoras"
        ;;
    
    3)
        echo ""
        echo -e "${BLUE}🔍 Ejecutando validaciones automáticas...${NC}"
        echo ""
        
        cd /home/impala/Documentos/Proyectos/flores-victoria
        
        if [ -f "validate-improvements.sh" ]; then
            chmod +x validate-improvements.sh
            ./validate-improvements.sh
        else
            echo -e "${YELLOW}⚠️  Script de validación no encontrado${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}✅ Validación completada${NC}"
        ;;
    
    4)
        echo ""
        echo -e "${BLUE}📚 Abriendo documentación...${NC}"
        echo ""
        
        DOC_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
        
        echo "Documentación disponible:"
        echo ""
        echo "1. MEJORAS_FLORES_VICTORIA.md - Documentación técnica completa"
        echo "2. GUIA_USO_MEJORAS.md - Guía práctica de uso"
        echo ""
        
        read -p "¿Qué documento quieres ver? (1-2): " doc_option
        
        case $doc_option in
            1)
                if [ -f "$DOC_DIR/MEJORAS_FLORES_VICTORIA.md" ]; then
                    if command -v bat > /dev/null; then
                        bat "$DOC_DIR/MEJORAS_FLORES_VICTORIA.md"
                    elif command -v cat > /dev/null; then
                        cat "$DOC_DIR/MEJORAS_FLORES_VICTORIA.md" | less
                    fi
                fi
                ;;
            2)
                if [ -f "$DOC_DIR/GUIA_USO_MEJORAS.md" ]; then
                    if command -v bat > /dev/null; then
                        bat "$DOC_DIR/GUIA_USO_MEJORAS.md"
                    elif command -v cat > /dev/null; then
                        cat "$DOC_DIR/GUIA_USO_MEJORAS.md" | less
                    fi
                fi
                ;;
        esac
        ;;
    
    5)
        echo ""
        echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
        exit 0
        ;;
    
    *)
        echo ""
        echo -e "${YELLOW}⚠️  Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Proceso completado${NC}"
echo ""
