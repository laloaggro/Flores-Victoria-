#!/bin/bash

# Script para integrar MCP en servicios restantes
# Integration script for remaining services

SERVICES="cart-service wishlist-service contact-service notification-service"

for service in $SERVICES; do
    echo "Procesando $service..."
    
    SERVER_FILE="microservices/$service/src/server.js"
    
    if [ ! -f "$SERVER_FILE" ]; then
        echo "  ✗ No se encontró $SERVER_FILE"
        continue
    fi
    
    # Verificar si ya tiene la integración MCP
    if grep -q "mcp-helper" "$SERVER_FILE"; then
        echo "  ℹ️ Ya tiene integración MCP"
        continue
    fi
    
    echo "  ✓ Integrando MCP en $service"
    
    # Crear backup
    cp "$SERVER_FILE" "$SERVER_FILE.backup"
    
    # Añadir import de mcp-helper después de los requires
    sed -i '1a const { registerAudit, registerEvent } = require('"'"'./mcp-helper'"'"');' "$SERVER_FILE"
    
    echo "  ✓ Import agregado"
done

echo ""
echo "✓ Integración completada. Revisar manualmente cada servicio para añadir:"
echo "  - await registerAudit('start', 'SERVICE-NAME', {...}) en el inicio"
echo "  - await registerAudit('shutdown', 'SERVICE-NAME', {...}) en SIGTERM/SIGINT"
echo "  - await registerEvent('ERROR-TYPE', {...}) en manejo de errores"
