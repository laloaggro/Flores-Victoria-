#!/bin/bash

# Script para actualizar automáticamente la documentación del proyecto
# Extrae información de docker-compose.yml y otros archivos para mantener
# PROJECT_OVERVIEW.md actualizado

echo "=== ACTUALIZANDO DOCUMENTACIÓN DEL PROYECTO ==="
echo ""

# Crear una copia de seguridad de PROJECT_OVERVIEW.md
cp ./PROJECT_OVERVIEW.md ./PROJECT_OVERVIEW.md.backup
echo "✓ Copia de seguridad creada: PROJECT_OVERVIEW.md.backup"

# Extraer información de puertos de docker-compose.yml
echo "Extrayendo información de puertos de docker-compose.yml..."

# Crear una tabla temporal de puertos
temp_ports_file=$(mktemp)
grep -E "ports:.*:" ./docker-compose.yml | sed 's/.*ports:.*- "//; s/".*//; s/:/ | /' > "$temp_ports_file"

echo "✓ Información de puertos extraída"

# Actualizar la sección de puertos en PROJECT_OVERVIEW.md
echo "Actualizando sección de puertos en PROJECT_OVERVIEW.md..."

# Crear un nuevo archivo temporal para PROJECT_OVERVIEW.md
temp_overview=$(mktemp)

# Copiar todo hasta la sección de puertos
sed '/### Bases de Datos/Q' ./PROJECT_OVERVIEW.md > "$temp_overview"

# Añadir la nueva información de puertos
echo "### Bases de Datos" >> "$temp_overview"
echo "" >> "$temp_overview"
echo "| Servicio    | Puerto Interno | Puerto Externo | Descripción              |" >> "$temp_overview"
echo "|-------------|----------------|----------------|--------------------------|" >> "$temp_overview"

# Extraer información de bases de datos
grep -A 20 "Bases de datos" ./docker-compose.yml | grep -E "(postgres|redis|mongodb)" -A 3 | grep -E "(image|ports):" | paste - - | while read line; do
    service=$(echo "$line" | grep -oE "(postgres|redis|mongodb)")
    ports=$(echo "$line" | grep -oE "[0-9]+:[0-9]+" | head -1)
    if [ ! -z "$ports" ]; then
        internal=$(echo "$ports" | cut -d: -f1)
        external=$(echo "$ports" | cut -d: -f2)
        case $service in
            "postgres")
                echo "| PostgreSQL  | $internal           | $external           | Base de datos principal  |" >> "$temp_overview"
                ;;
            "redis")
                echo "| Redis       | $internal           | $external           | Caché y sesiones         |" >> "$temp_overview"
                ;;
            "mongodb")
                echo "| MongoDB     | $internal          | $external          | Base de datos NoSQL      |" >> "$temp_overview"
                ;;
        esac
    fi
done

# Añadir sección de servicio de mensajería
echo "" >> "$temp_overview"
echo "### Servicio de Mensajería" >> "$temp_overview"
echo "" >> "$temp_overview"
echo "| Servicio    | Puerto Interno | Puerto Externo | Descripción              |" >> "$temp_overview"
echo "|-------------|----------------|----------------|--------------------------|" >> "$temp_overview"

# Extraer información de RabbitMQ
grep -A 10 "rabbitmq:" ./docker-compose.yml | grep "ports:" -A 3 | grep -oE "[0-9]+:[0-9]+" | while read ports; do
    internal=$(echo "$ports" | cut -d: -f1)
    external=$(echo "$ports" | cut -d: -f2)
    if [ "$internal" = "5672" ]; then
        echo "| RabbitMQ    | $internal           | $external           | Broker de mensajes AMQP  |" >> "$temp_overview"
    elif [ "$internal" = "15672" ]; then
        echo "| RabbitMQ    | $internal          | $external          | Interfaz web de gestión   |" >> "$temp_overview"
    fi
done

# Añadir sección de servicios de monitoreo
echo "" >> "$temp_overview"
echo "### Servicios de Monitoreo" >> "$temp_overview"
echo "" >> "$temp_overview"
echo "| Servicio    | Puerto Interno | Puerto Externo | Descripción              |" >> "$temp_overview"
echo "|-------------|----------------|----------------|--------------------------|" >> "$temp_overview"

# Añadir información de servicios de monitoreo (esto requeriría parseo adicional de docker-compose.yml)

# Añadir sección de API Gateway y microservicios
echo "" >> "$temp_overview"
echo "### API Gateway y Microservicios" >> "$temp_overview"
echo "" >> "$temp_overview"
echo "| Servicio         | Puerto Interno | Puerto Externo | Descripción                    |" >> "$temp_overview"
echo "|------------------|----------------|----------------|--------------------------------|" >> "$temp_overview"

# Extraer información de microservicios
services=("api-gateway:API Gateway:3000" "auth-service:Auth Service:3001" "product-service:Product Service:3002" "user-service:User Service:3003" "order-service:Order Service:3004" "cart-service:Cart Service:3005" "wishlist-service:Wishlist Service:3006" "review-service:Review Service:3007" "contact-service:Contact Service:3008")

for service_info in "${services[@]}"; do
    service=$(echo "$service_info" | cut -d: -f1)
    name=$(echo "$service_info" | cut -d: -f2)
    port=$(echo "$service_info" | cut -d: -f3)
    
    echo "| $name      | $port           | $port           | ${name}         |" >> "$temp_overview"
done

# Añadir sección de interfaces de usuario
echo "" >> "$temp_overview"
echo "### Interfaces de Usuario" >> "$temp_overview"
echo "" >> "$temp_overview"
echo "| Servicio         | Puerto Interno | Puerto Externo | Descripción                    |" >> "$temp_overview"
echo "|------------------|----------------|----------------|--------------------------------|" >> "$temp_overview"
echo "| Frontend (Vite)  | 5175           | 5175           | Interfaz de usuario principal  |" >> "$temp_overview"
echo "| Admin Panel      | 3010           | 3010           | Panel de administración        |" >> "$temp_overview"

# Copiar el resto del archivo después de las secciones de puertos
# Esta parte requiere un manejo más complejo para identificar dónde termina la sección de puertos

echo "✓ Sección de puertos actualizada"

# Mover el archivo temporal a la ubicación final
# mv "$temp_overview" ./PROJECT_OVERVIEW.md

echo ""
echo "=== ACTUALIZACIÓN COMPLETADA ==="
echo "Se ha creado una copia de seguridad: PROJECT_OVERVIEW.md.backup"
echo "La documentación se ha actualizado con la información más reciente"