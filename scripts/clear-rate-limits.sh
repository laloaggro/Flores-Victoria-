#!/bin/bash

# =============================================================================
# Script para limpiar Rate Limits en Redis
# =============================================================================
# Descripción: Limpia los contadores de rate limiting almacenados en Redis
# Uso: ./scripts/clear-rate-limits.sh
# =============================================================================

source "$(dirname "$0")/lib/common.sh"

print_header "Limpiador de Rate Limits"

# Verificar que Redis está corriendo
print_section "Verificando Redis"
if ! docker ps | grep -q "flores-victoria-redis"; then
    print_error "Redis no está corriendo"
    exit 1
fi

print_success "Redis está corriendo"

# Mostrar contadores actuales
print_section "Contadores Actuales"
KEYS=$(docker exec flores-victoria-redis redis-cli KEYS "rl:*" 2>/dev/null)

if [ -z "$KEYS" ]; then
    print_info "No hay contadores de rate limit activos"
else
    echo "$KEYS" | while read -r key; do
        if [ ! -z "$key" ]; then
            VALUE=$(docker exec flores-victoria-redis redis-cli GET "$key" 2>/dev/null)
            print_info "  $key: $VALUE"
        fi
    done
fi

# Confirmar limpieza
print_section "Limpieza"
if ! confirm "¿Deseas limpiar todos los contadores de rate limit?"; then
    print_warning "Operación cancelada"
    exit 0
fi

# Limpiar Redis
print_info "Limpiando contadores de rate limit..."
if docker exec flores-victoria-redis redis-cli FLUSHDB > /dev/null 2>&1; then
    print_success "Contadores limpiados exitosamente"
else
    print_error "Error al limpiar contadores"
    exit 1
fi

# Reiniciar servicios (opcional)
print_section "Reinicio de Servicios"
if confirm "¿Deseas reiniciar API Gateway y Auth Service para aplicar cambios?"; then
    print_info "Reiniciando API Gateway..."
    docker restart flores-victoria-api-gateway > /dev/null 2>&1
    
    print_info "Reiniciando Auth Service..."
    docker restart flores-victoria-auth-service > /dev/null 2>&1
    
    print_success "Servicios reiniciados"
    
    print_section "Esperando Inicialización"
    print_info "Esperando 30 segundos para que los servicios inicien..."
    
    for i in {30..1}; do
        printf "\r  ⏳ %2d segundos restantes..." $i
        sleep 1
    done
    printf "\r                                        \r"
    
    # Verificar estado
    if docker ps --filter "name=flores-victoria-api-gateway" --format "{{.Status}}" | grep -q "healthy"; then
        print_success "API Gateway está saludable"
    else
        print_warning "API Gateway aún está iniciando"
    fi
    
    if docker ps --filter "name=flores-victoria-auth-service" --format "{{.Status}}" | grep -q "healthy"; then
        print_success "Auth Service está saludable"
    else
        print_warning "Auth Service aún está iniciando"
    fi
else
    print_info "Servicios no reiniciados"
    print_warning "Nota: Es recomendable reiniciar los servicios para que tomen efecto los cambios"
fi

print_section "Resumen"
print_success "Rate limits limpiados exitosamente"
print_info "Ahora puedes intentar hacer login nuevamente"
print_info ""
print_info "Límites actuales (desarrollo):"
print_info "  • API Gateway General: 1000 req / 15 min"
print_info "  • API Gateway Auth: 100 intentos / 15 min"
print_info "  • Microservicios: 1000 req / 15 min"
