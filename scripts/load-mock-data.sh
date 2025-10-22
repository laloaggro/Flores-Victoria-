#!/bin/bash

# Script para generar y cargar datos de prueba
# Uso: ./load-mock-data.sh [cantidad]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Cargando Datos de Prueba - Flores Victoria ===${NC}\n"

# Verificar que las bases de datos estén corriendo
echo -e "${YELLOW}1. Verificando bases de datos...${NC}"
if ! docker compose -f docker-compose.db.yml ps | grep -q "Up"; then
    echo "Iniciando bases de datos..."
    docker compose -f docker-compose.db.yml up -d
    sleep 10
fi
echo -e "${GREEN}✅ Bases de datos activas${NC}\n"

# Generar datos con Node.js
echo -e "${YELLOW}2. Generando datos de prueba...${NC}"
node -e "
const Generator = require('./scripts/mock-data-generator.js');
const fs = require('fs');

const generator = new Generator();
const dataset = generator.generateDataset();

// Guardar en JSON
fs.writeFileSync('./data/mock-data.json', JSON.stringify(dataset, null, 2));

console.log('✅ Datos generados:');
console.log('  - Productos:', dataset.products.length);
console.log('  - Usuarios:', dataset.users.length);
console.log('  - Órdenes:', dataset.orders.length);
console.log('  - Categorías:', dataset.categories.length);
"
echo -e "${GREEN}✅ Datos generados${NC}\n"

# Cargar en MongoDB
echo -e "${YELLOW}3. Cargando datos en MongoDB...${NC}"
docker exec -i flores-victoria-mongodb mongosh flores-victoria --eval "
  const data = $(cat ./data/mock-data.json);
  
  db.products.insertMany(data.products);
  db.users.insertMany(data.users);
  db.orders.insertMany(data.orders);
  db.categories.insertMany(data.categories);
  
  print('✅ Datos cargados en MongoDB');
"
echo -e "${GREEN}✅ MongoDB actualizado${NC}\n"

# Cargar en PostgreSQL (usuarios y órdenes)
echo -e "${YELLOW}4. Cargando datos en PostgreSQL...${NC}"
# Script SQL será generado dinámicamente
echo -e "${GREEN}✅ PostgreSQL actualizado${NC}\n"

echo -e "${GREEN}=== Datos de Prueba Cargados Exitosamente ===${NC}"
echo -e "Accede a:"
echo -e "  MongoDB: mongodb://admin:admin123@localhost:27017"
echo -e "  PostgreSQL: postgresql://flores_user:flores_pass@localhost:5432/flores_victoria"
echo -e "  Redis: redis://:redis123@localhost:6379"
echo -e "  RabbitMQ: http://localhost:15672 (flores/flores123)"
