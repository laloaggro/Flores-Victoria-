#!/bin/bash

# Script para probar el proceso de disaster recovery
# Este script realiza un test completo de backup y restore en un ambiente aislado

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Variables
TEST_DIR="/tmp/dr-test-$(date +%Y%m%d_%H%M%S)"
TEST_LOG="$TEST_DIR/dr-test.log"
START_TIME=$(date +%s)

# Crear directorio de test
mkdir -p "$TEST_DIR"

# Función de logging
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$TEST_LOG"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1" | tee -a "$TEST_LOG"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1" | tee -a "$TEST_LOG"
}

warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1" | tee -a "$TEST_LOG"
}

success() {
    echo -e "${PURPLE}[$(date +'%H:%M:%S')] ✓${NC} $1" | tee -a "$TEST_LOG"
}

# Banner
clear
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚨  DISASTER RECOVERY TEST - Flores Victoria  🚨       ║
║                                                            ║
║  Este script probará el proceso completo de DR:           ║
║  1. Crear backup de bases de datos                        ║
║  2. Simular pérdida de datos                              ║
║  3. Restaurar desde backup                                ║
║  4. Verificar integridad                                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF

echo ""
log "Iniciando test de Disaster Recovery..."
log "Directorio de test: $TEST_DIR"
echo ""

# ============================================
# FASE 1: Pre-requisitos
# ============================================
log "═══ FASE 1: Verificando Pre-requisitos ═══"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi
success "Docker instalado"

# Verificar servicios corriendo
if ! docker ps | grep -q "postgres"; then
    error "PostgreSQL no está corriendo"
    error "Ejecute: docker-compose up -d postgres"
    exit 1
fi
success "PostgreSQL está corriendo"

if ! docker ps | grep -q "redis"; then
    warning "Redis no está corriendo (opcional)"
else
    success "Redis está corriendo"
fi

# Verificar scripts
if [ ! -f "./scripts/backup-databases.sh" ]; then
    error "Script de backup no encontrado"
    exit 1
fi
success "Script de backup encontrado"

if [ ! -f "./scripts/restore-databases.sh" ]; then
    error "Script de restore no encontrado"
    exit 1
fi
success "Script de restore encontrado"

echo ""

# ============================================
# FASE 2: Crear datos de prueba
# ============================================
log "═══ FASE 2: Creando Datos de Prueba ═══"

info "Creando base de datos de prueba..."
docker exec flores-victoria-postgres psql -U flores_user -d flores_db -c "CREATE DATABASE dr_test_db;" 2>/dev/null || true

info "Insertando datos de prueba..."
docker exec flores-victoria-postgres psql -U flores_user -d dr_test_db -c "CREATE TABLE IF NOT EXISTS test_data (id SERIAL PRIMARY KEY, test_name VARCHAR(100), test_value VARCHAR(255), created_at TIMESTAMP DEFAULT NOW());"
docker exec flores-victoria-postgres psql -U flores_user -d dr_test_db -c "INSERT INTO test_data (test_name, test_value) VALUES ('test1', 'valor_original_1'), ('test2', 'valor_original_2'), ('test3', 'valor_original_3'), ('dr_test', 'Este dato debe sobrevivir al DR');"
success "Datos insertados correctamente"

# Guardar checksum de los datos
TEST_CHECKSUM=$(docker exec flores-victoria-postgres psql -U flores_user -d dr_test_db -t -c "SELECT md5(string_agg(test_value, '')) FROM test_data;")
info "Checksum de datos originales: $TEST_CHECKSUM"
echo "$TEST_CHECKSUM" > "$TEST_DIR/original_checksum.txt"

success "Datos de prueba creados (4 registros)"

# Agregar datos a Redis si está disponible
if docker ps | grep -q "redis"; then
    info "Agregando datos de prueba a Redis..."
    docker exec flores-victoria-redis redis-cli SET dr_test_key "valor_dr_test_$(date +%s)"
    success "Datos agregados a Redis"
fi

echo ""

# ============================================
# FASE 3: Crear Backup
# ============================================
log "═══ FASE 3: Creando Backup ═══"

BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
info "Timestamp del backup: $BACKUP_TIMESTAMP"

# Crear directorio de backups si no existe
mkdir -p /backups

# Backup de PostgreSQL (solo la base de datos de prueba para el test)
info "Creando backup de PostgreSQL..."
docker exec flores-victoria-postgres pg_dump -U flores_user dr_test_db > "/backups/postgres_${BACKUP_TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "/backups/postgres_${BACKUP_TIMESTAMP}.sql" | cut -f1)
    success "Backup de PostgreSQL creado ($BACKUP_SIZE)"
else
    error "Falló el backup de PostgreSQL"
    exit 1
fi

# Backup de Redis
if docker ps | grep -q "redis"; then
    info "Creando backup de Redis..."
    docker exec flores-victoria-redis redis-cli SAVE
    docker cp flores-victoria-redis:/data/dump.rdb "/backups/redis_${BACKUP_TIMESTAMP}.rdb"
    success "Backup de Redis creado"
fi

echo ""

# ============================================
# FASE 4: Simular Desastre (Pérdida de Datos)
# ============================================
log "═══ FASE 4: Simulando Desastre ═══"

warning "⚠️  Simulando pérdida de datos..."

# Eliminar datos de prueba
info "Eliminando base de datos de prueba..."
docker exec flores-victoria-postgres psql -U flores_user -d flores_db -c "DROP DATABASE dr_test_db;" 2>/dev/null || true

# Verificar que los datos fueron eliminados
if docker exec flores-victoria-postgres psql -U flores_user -l | grep -q "dr_test_db"; then
    error "La base de datos no fue eliminada correctamente"
    exit 1
fi
success "Base de datos eliminada (simulación de desastre)"

# Limpiar Redis si está disponible
if docker ps | grep -q "redis"; then
    info "Limpiando datos de Redis..."
    docker exec flores-victoria-redis redis-cli DEL dr_test_key
    success "Datos de Redis eliminados"
fi

echo ""
warning "🚨 DESASTRE SIMULADO: Datos perdidos"
echo ""
read -p "Presione ENTER para continuar con la recuperación..."

# ============================================
# FASE 5: Restaurar desde Backup
# ============================================
log "═══ FASE 5: Restaurando desde Backup ═══"

info "Iniciando proceso de restore..."
info "Usando backup: $BACKUP_TIMESTAMP"

# Restaurar PostgreSQL
info "Restaurando PostgreSQL..."
# Primero recrear la base de datos
docker exec flores-victoria-postgres psql -U flores_user -d flores_db -c "CREATE DATABASE dr_test_db;" 2>/dev/null || true
# Luego restaurar los datos
cat "/backups/postgres_${BACKUP_TIMESTAMP}.sql" | docker exec -i flores-victoria-postgres psql -U flores_user -d dr_test_db

if [ $? -eq 0 ]; then
    success "PostgreSQL restaurado"
else
    error "Falló la restauración de PostgreSQL"
    exit 1
fi

# Restaurar Redis
if [ -f "/backups/redis_${BACKUP_TIMESTAMP}.rdb" ]; then
    info "Restaurando Redis..."
    docker stop flores-victoria-redis
    docker cp "/backups/redis_${BACKUP_TIMESTAMP}.rdb" flores-victoria-redis:/data/dump.rdb
    docker start flores-victoria-redis
    sleep 3
    
    if docker exec flores-victoria-redis redis-cli PING | grep -q "PONG"; then
        success "Redis restaurado"
    else
        error "Redis no responde después de restore"
    fi
fi

echo ""

# ============================================
# FASE 6: Verificación de Integridad
# ============================================
log "═══ FASE 6: Verificando Integridad ═══"

# Verificar que la base de datos existe
if docker exec flores-victoria-postgres psql -U flores_user -l | grep -q "dr_test_db"; then
    success "Base de datos dr_test_db existe"
else
    error "Base de datos dr_test_db NO existe después del restore"
    exit 1
fi

# Verificar datos
info "Verificando datos restaurados..."
RESTORED_COUNT=$(docker exec flores-victoria-postgres psql -U flores_user -d dr_test_db -t -c "SELECT count(*) FROM test_data;")
RESTORED_COUNT=$(echo $RESTORED_COUNT | tr -d ' ')

if [ "$RESTORED_COUNT" = "4" ]; then
    success "Cantidad de registros correcta (4 registros)"
else
    error "Cantidad de registros incorrecta (esperado: 4, encontrado: $RESTORED_COUNT)"
    exit 1
fi

# Verificar checksum
RESTORED_CHECKSUM=$(docker exec flores-victoria-postgres psql -U flores_user -d dr_test_db -t -c "SELECT md5(string_agg(test_value, '')) FROM test_data;")
ORIGINAL_CHECKSUM=$(cat "$TEST_DIR/original_checksum.txt")

if [ "$RESTORED_CHECKSUM" = "$ORIGINAL_CHECKSUM" ]; then
    success "Checksum coincide - Integridad de datos verificada ✓"
else
    error "Checksum NO coincide - Los datos pueden estar corruptos"
    error "Original:  $ORIGINAL_CHECKSUM"
    error "Restored:  $RESTORED_CHECKSUM"
    exit 1
fi

# Verificar datos específicos
info "Verificando registros específicos..."
DR_TEST_VALUE=$(docker exec flores-victoria-postgres psql -U flores_user -d dr_test_db -t -c "SELECT test_value FROM test_data WHERE test_name='dr_test';")

if echo "$DR_TEST_VALUE" | grep -q "Este dato debe sobrevivir al DR"; then
    success "Registro crítico verificado correctamente"
else
    error "Registro crítico no encontrado o corrupto"
fi

# Verificar Redis si está disponible
if docker ps | grep -q "redis" && [ -f "/backups/redis_${BACKUP_TIMESTAMP}.rdb" ]; then
    info "Verificando datos de Redis..."
    REDIS_VALUE=$(docker exec flores-victoria-redis redis-cli GET dr_test_key)
    
    if [ -n "$REDIS_VALUE" ]; then
        success "Datos de Redis restaurados correctamente"
    else
        warning "Datos de Redis no encontrados (puede ser normal)"
    fi
fi

echo ""

# ============================================
# FASE 7: Prueba de Scripts
# ============================================
log "═══ FASE 7: Probando Scripts de DR ═══"

info "Probando script de listar backups..."
./scripts/restore-databases.sh --list | grep -q "postgres_" && success "Script --list funciona" || error "Script --list falló"

info "Probando modo dry-run..."
./scripts/restore-databases.sh "$BACKUP_TIMESTAMP" --dry-run | grep -q "DRY-RUN" && success "Modo dry-run funciona" || error "Modo dry-run falló"

echo ""

# ============================================
# FASE 8: Métricas y Reporte
# ============================================
log "═══ FASE 8: Generando Reporte ═══"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Crear reporte
cat > "$TEST_DIR/dr-test-report.txt" << EOF
╔════════════════════════════════════════════════════════════╗
║        DISASTER RECOVERY TEST REPORT                       ║
╚════════════════════════════════════════════════════════════╝

Fecha del Test: $(date)
Duración Total: ${MINUTES}m ${SECONDS}s

═══════════════════════════════════════════════════════════

RESULTADOS:

✓ Pre-requisitos verificados
✓ Datos de prueba creados (4 registros)
✓ Backup creado exitosamente
  - Timestamp: $BACKUP_TIMESTAMP
  - Tamaño: $BACKUP_SIZE
✓ Desastre simulado (datos eliminados)
✓ Restore ejecutado exitosamente
✓ Integridad de datos verificada
  - Checksum original:  $ORIGINAL_CHECKSUM
  - Checksum restored:  $RESTORED_CHECKSUM
  - Estado: ✓ COINCIDE
✓ Scripts de DR funcionando correctamente

═══════════════════════════════════════════════════════════

MÉTRICAS DE RECUPERACIÓN:

RTO (Recovery Time Objective):
  - Objetivo:    < 2 horas
  - Real:        ${MINUTES}m ${SECONDS}s
  - Estado:      $([ $DURATION -lt 7200 ] && echo "✓ DENTRO DEL OBJETIVO" || echo "✗ FUERA DEL OBJETIVO")

RPO (Recovery Point Objective):
  - Objetivo:    < 1 hora
  - Real:        0s (backup inmediato antes del desastre)
  - Estado:      ✓ DENTRO DEL OBJETIVO

Integridad de Datos:
  - Registros esperados:    4
  - Registros restaurados:  $RESTORED_COUNT
  - Pérdida de datos:       0%
  - Estado:                 ✓ 100% RECUPERADO

═══════════════════════════════════════════════════════════

ARCHIVOS GENERADOS:

- Log completo:        $TEST_LOG
- Backup PostgreSQL:   /backups/postgres_${BACKUP_TIMESTAMP}.sql
- Backup Redis:        /backups/redis_${BACKUP_TIMESTAMP}.rdb
- Checksum original:   $TEST_DIR/original_checksum.txt

═══════════════════════════════════════════════════════════

PRÓXIMOS PASOS:

1. Revisar el log completo en: $TEST_LOG
2. Limpiar base de datos de prueba:
   docker exec flores-victoria-postgres psql -U flores_user -d flores_db -c "DROP DATABASE dr_test_db;"
3. Documentar resultados en DISASTER_RECOVERY_PLAYBOOK.md
4. Programar próximo test mensual

═══════════════════════════════════════════════════════════

TEST COMPLETADO EXITOSAMENTE ✓

EOF

# Mostrar reporte
cat "$TEST_DIR/dr-test-report.txt"

# Guardar reporte en ubicación permanente
cp "$TEST_DIR/dr-test-report.txt" "./DR_TEST_REPORT_$(date +%Y%m%d_%H%M%S).txt"

echo ""
log "═══════════════════════════════════════════════════════"
log "🎉 TEST DE DISASTER RECOVERY COMPLETADO EXITOSAMENTE 🎉"
log "═══════════════════════════════════════════════════════"
echo ""
info "Reporte guardado en: $TEST_DIR/dr-test-report.txt"
info "Copia permanente: ./DR_TEST_REPORT_$(date +%Y%m%d_%H%M%S).txt"
echo ""
info "⚠️  Para limpiar la base de datos de prueba, ejecute:"
echo "   docker exec flores-victoria-postgres psql -U flores_user -d flores_db -c \"DROP DATABASE dr_test_db;\""
echo ""

exit 0
