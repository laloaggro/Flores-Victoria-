#!/bin/bash

# Script para generar nixpacks.toml para todos los microservicios

set -e

echo "🔧 Generando nixpacks.toml para todos los servicios..."

# Array de servicios con sus puertos
declare -A services
services=(
    ["user-service"]="3003"
    ["product-service"]="3009"
    ["order-service"]="3004"
    ["cart-service"]="3005"
    ["wishlist-service"]="3006"
    ["review-service"]="3007"
    ["contact-service"]="3008"
    ["payment-service"]="3018"
    ["promotion-service"]="3019"
)

# Función para crear nixpacks.toml
create_nixpacks_toml() {
    local service=$1
    local port=$2
    local nixpacks_file="microservices/${service}/nixpacks.toml"
    
    echo "📝 Creando ${nixpacks_file}..."
    
    cat > "${nixpacks_file}" <<'EOF'
# Nixpacks configuration
[phases.setup]
nixPkgs = ['nodejs-22_x']

[phases.install]
cmds = [
  'npm install --production',
  'mkdir -p node_modules/@flores-victoria',
  'cp -r ../shared node_modules/@flores-victoria/',
  'cd node_modules/@flores-victoria/shared && npm install --production'
]

[start]
cmd = 'node src/server.js'
EOF

    echo "✅ ${nixpacks_file} creado"
}

# Generar nixpacks.toml para cada servicio
for service in "${!services[@]}"; do
    port="${services[$service]}"
    create_nixpacks_toml "$service" "$port"
done

echo ""
echo "✅ Todos los nixpacks.toml generados"
echo ""
echo "📋 Archivos creados:"
for service in "${!services[@]}"; do
    echo "  - microservices/${service}/nixpacks.toml"
done
echo ""
echo "🚀 Ahora Railway usará Nixpacks para construir automáticamente"
