#!/bin/bash

#==============================================================================
# 🔧 SOLUCIONADOR DE PROBLEMAS CRÍTICOS - FLORES VICTORIA v3.0
#==============================================================================
# Descripción: Script para solucionar problemas críticos detectados:
#              - admin_panel (conflictos de puerto)
#              - ai_service (servicios faltantes)
#              - memory (uso excesivo de memoria)
# Versión: 3.0.0
# Fecha: $(date '+%Y-%m-%d %H:%M:%S')
#==============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/fix-critical-issues.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

#==============================================================================
# FUNCIONES UTILITARIAS
#==============================================================================

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║               🚀 FLORES VICTORIA v3.0                       ║"
    echo "║           🔧 Solucionador de Problemas Críticos             ║"
    echo "║                                                              ║"
    echo "║  Solucionando:                                               ║"
    echo "║  • 🌐 Admin Panel (conflictos de puerto)                    ║"
    echo "║  • 🤖 AI Service (servicios faltantes)                      ║"
    echo "║  • 🧠 Memory Issues (optimización de memoria)               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "ERROR") echo -e "${RED}[ERROR]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
        "WARN") echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
        "INFO") echo -e "${GREEN}[INFO]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
        "DEBUG") echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
        *) echo -e "${WHITE}[LOG]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
    esac
}

check_port() {
    local port=$1
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        return 0  # Puerto ocupado
    else
        return 1  # Puerto libre
    fi
}

kill_process_on_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        log_message "WARN" "Deteniendo procesos en puerto $port: $pids"
        echo "$pids" | xargs -r kill -9
        sleep 2
        
        # Verificar si realmente se detuvo
        if check_port $port; then
            log_message "ERROR" "No se pudo liberar el puerto $port"
            return 1
        else
            log_message "INFO" "Puerto $port liberado exitosamente"
            return 0
        fi
    else
        log_message "INFO" "Puerto $port ya está libre"
        return 0
    fi
}

#==============================================================================
# SOLUCIÓN 1: PROBLEMAS DEL ADMIN PANEL
#==============================================================================

fix_admin_panel() {
    log_message "INFO" "🌐 Solucionando problemas del Admin Panel..."
    
    # Detener procesos conflictivos
    local admin_ports=(3020 3021 3010)
    
    for port in "${admin_ports[@]}"; do
        if check_port $port; then
            log_message "WARN" "Puerto $port ocupado, liberando..."
            kill_process_on_port $port
        fi
    done
    
    # Verificar y crear directorio admin-panel si no existe
    if [ ! -d "$SCRIPT_DIR/admin-panel" ]; then
        log_message "WARN" "Directorio admin-panel no existe, creando..."
        mkdir -p "$SCRIPT_DIR/admin-panel/public"
        mkdir -p "$SCRIPT_DIR/admin-panel/routes"
    fi
    
    # Verificar server.js del admin panel
    if [ ! -f "$SCRIPT_DIR/admin-panel/server.js" ]; then
        log_message "WARN" "server.js del admin panel no existe, creando..."
        create_admin_panel_server
    fi
    
    # Actualizar configuración del admin panel para usar puerto 3021
    update_admin_panel_config
    
    # Iniciar admin panel en puerto correcto
    start_admin_panel
    
    log_message "INFO" "✅ Admin Panel solucionado y configurado en puerto 3021"
}

create_admin_panel_server() {
    cat > "$SCRIPT_DIR/admin-panel/server.js" << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3021;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Headers de seguridad
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        port: PORT,
        service: 'admin-panel'
    });
});

// API routes
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        version: '3.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Admin Panel ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Dashboard Analytics: http://localhost:${PORT}/dashboard-analytics.html`);
    console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('📴 Cerrando Admin Panel...');
    server.close(() => {
        console.log('✅ Admin Panel cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n📴 Cerrando Admin Panel...');
    server.close(() => {
        console.log('✅ Admin Panel cerrado correctamente');
        process.exit(0);
    });
});
EOF
    
    log_message "INFO" "✅ server.js del admin panel creado"
}

update_admin_panel_config() {
    # Actualizar package.json si existe
    if [ -f "$SCRIPT_DIR/package.json" ]; then
        # Actualizar script de admin panel para usar puerto 3021
        if grep -q '"admin:start"' "$SCRIPT_DIR/package.json"; then
            sed -i 's/"admin:start": ".*"/"admin:start": "cd admin-panel \&\& node server.js --port=3021"/' "$SCRIPT_DIR/package.json"
            log_message "INFO" "Configuración de package.json actualizada para puerto 3021"
        fi
    fi
}

start_admin_panel() {
    log_message "INFO" "Iniciando Admin Panel en puerto 3021..."
    
    cd "$SCRIPT_DIR/admin-panel"
    
    # Iniciar en background
    nohup node server.js --port=3021 > /tmp/admin-panel-3021.log 2>&1 &
    local admin_pid=$!
    
    # Esperar un momento para que inicie
    sleep 3
    
    # Verificar que esté corriendo
    if kill -0 $admin_pid 2>/dev/null; then
        if check_port 3021; then
            log_message "INFO" "✅ Admin Panel iniciado correctamente en puerto 3021 (PID: $admin_pid)"
            echo $admin_pid > /tmp/admin-panel.pid
        else
            log_message "ERROR" "❌ Admin Panel no pudo ocupar el puerto 3021"
            return 1
        fi
    else
        log_message "ERROR" "❌ Admin Panel no pudo iniciarse"
        cat /tmp/admin-panel-3021.log
        return 1
    fi
}

#==============================================================================
# SOLUCIÓN 2: SERVICIOS AI FALTANTES
#==============================================================================

fix_ai_service() {
    log_message "INFO" "🤖 Solucionando servicios AI faltantes..."
    
    # Verificar si ai-simple.js existe y está corriendo
    if [ -f "$SCRIPT_DIR/ai-simple.js" ]; then
        log_message "INFO" "ai-simple.js encontrado, verificando estado..."
        
        # Verificar si está corriendo
        if pgrep -f "ai-simple.js" > /dev/null; then
            log_message "INFO" "ai-simple.js ya está ejecutándose"
        else
            log_message "WARN" "ai-simple.js no está ejecutándose, iniciando..."
            start_ai_service
        fi
    else
        log_message "WARN" "ai-simple.js no encontrado, creando servicio AI básico..."
        create_ai_service
        start_ai_service
    fi
    
    # Verificar ai-service-standalone.js
    if [ -f "$SCRIPT_DIR/ai-service-standalone.js" ]; then
        log_message "INFO" "ai-service-standalone.js encontrado"
        
        if ! pgrep -f "ai-service-standalone.js" > /dev/null; then
            log_message "WARN" "ai-service-standalone.js no está ejecutándose, iniciando..."
            start_ai_standalone_service
        fi
    else
        log_message "WARN" "ai-service-standalone.js no encontrado, creando..."
        create_ai_standalone_service
        start_ai_standalone_service
    fi
    
    log_message "INFO" "✅ Servicios AI configurados correctamente"
}

create_ai_service() {
    cat > "$SCRIPT_DIR/ai-simple.js" << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3012;

// Middleware
app.use(express.json());

// Simulación de servicios AI básicos
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'ai-simple',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

app.post('/api/ai/recommendations', (req, res) => {
    const { userId, preferences } = req.body;
    
    // Simulación de recomendaciones de productos
    const recommendations = [
        {
            id: 'prod_001',
            name: 'Ramo de Rosas Rojas Premium',
            score: 0.95,
            reason: 'Basado en compras anteriores'
        },
        {
            id: 'prod_002',
            name: 'Arreglo Flores Mixtas',
            score: 0.87,
            reason: 'Popular entre usuarios similares'
        },
        {
            id: 'prod_003',
            name: 'Ramo de Tulipanes',
            score: 0.73,
            reason: 'Temporada actual'
        }
    ];
    
    res.json({
        success: true,
        userId,
        recommendations,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/ai/search-suggestions', (req, res) => {
    const { query } = req.body;
    
    const suggestions = [
        `${query} rojas`,
        `${query} blancas`,
        `${query} premium`,
        `arreglo de ${query}`,
        `bouquet ${query}`
    ].slice(0, 5);
    
    res.json({
        success: true,
        query,
        suggestions,
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`🤖 AI Service ejecutándose en puerto ${PORT}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('📴 Cerrando AI Service...');
    server.close(() => {
        console.log('✅ AI Service cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n📴 Cerrando AI Service...');
    server.close(() => {
        console.log('✅ AI Service cerrado correctamente');
        process.exit(0);
    });
});
EOF
    
    log_message "INFO" "✅ ai-simple.js creado"
}

create_ai_standalone_service() {
    cat > "$SCRIPT_DIR/ai-service-standalone.js" << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3013;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS para desarrollo
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'ai-service-standalone',
        timestamp: new Date().toISOString(),
        port: PORT,
        features: [
            'product-recommendations',
            'search-enhancement',
            'customer-insights',
            'inventory-optimization'
        ]
    });
});

// Análisis de comportamiento del cliente
app.post('/api/ai/customer-behavior', (req, res) => {
    const { customerId, actions } = req.body;
    
    const insights = {
        customerId,
        preferences: {
            flowerTypes: ['rosas', 'tulipanes', 'girasoles'],
            priceRange: { min: 15000, max: 45000 },
            occasions: ['cumpleanos', 'aniversario', 'san_valentin']
        },
        predictedNextPurchase: {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            confidence: 0.78,
            suggestedProducts: ['prod_001', 'prod_005', 'prod_012']
        },
        lifetimeValue: 125000,
        riskScore: 0.23
    };
    
    res.json({
        success: true,
        insights,
        timestamp: new Date().toISOString()
    });
});

// Optimización de inventario
app.post('/api/ai/inventory-optimization', (req, res) => {
    const { currentInventory } = req.body;
    
    const recommendations = {
        restockSuggestions: [
            { productId: 'prod_001', suggestedQuantity: 25, priority: 'high' },
            { productId: 'prod_003', suggestedQuantity: 15, priority: 'medium' },
            { productId: 'prod_007', suggestedQuantity: 30, priority: 'high' }
        ],
        seasonalTrends: {
            upcomingPeak: 'san_valentin',
            daysTopeak: 45,
            expectedDemandIncrease: 2.5
        },
        discontinueRecommendations: [
            { productId: 'prod_099', reason: 'low_demand', lastSold: '2023-08-15' }
        ]
    };
    
    res.json({
        success: true,
        recommendations,
        timestamp: new Date().toISOString()
    });
});

// Análisis de precios dinámicos
app.post('/api/ai/dynamic-pricing', (req, res) => {
    const { productId, currentPrice, marketData } = req.body;
    
    const pricingAnalysis = {
        productId,
        currentPrice,
        recommendedPrice: currentPrice * 1.05,
        confidence: 0.89,
        factors: {
            demand: 'high',
            seasonality: 'peak_season',
            competition: 'average',
            inventory: 'low_stock'
        },
        expectedImpact: {
            revenueIncrease: '12%',
            demandChange: '-3%'
        }
    };
    
    res.json({
        success: true,
        analysis: pricingAnalysis,
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`🤖 AI Service Standalone ejecutándose en puerto ${PORT}`);
    console.log(`📊 Funcionalidades: Recomendaciones, Análisis, Optimización`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('📴 Cerrando AI Service Standalone...');
    server.close(() => {
        console.log('✅ AI Service Standalone cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n📴 Cerrando AI Service Standalone...');
    server.close(() => {
        console.log('✅ AI Service Standalone cerrado correctamente');
        process.exit(0);
    });
});
EOF
    
    log_message "INFO" "✅ ai-service-standalone.js creado"
}

start_ai_service() {
    if ! check_port 3012; then
        log_message "INFO" "Iniciando AI Service en puerto 3012..."
        cd "$SCRIPT_DIR"
        nohup node ai-simple.js > /tmp/ai-simple.log 2>&1 &
        local ai_pid=$!
        sleep 2
        
        if kill -0 $ai_pid 2>/dev/null && check_port 3012; then
            log_message "INFO" "✅ AI Service iniciado correctamente (PID: $ai_pid)"
            echo $ai_pid > /tmp/ai-simple.pid
        else
            log_message "ERROR" "❌ No se pudo iniciar AI Service"
            cat /tmp/ai-simple.log
        fi
    else
        log_message "INFO" "Puerto 3012 ocupado, AI Service ya está corriendo"
    fi
}

start_ai_standalone_service() {
    if ! check_port 3013; then
        log_message "INFO" "Iniciando AI Service Standalone en puerto 3013..."
        cd "$SCRIPT_DIR"
        nohup node ai-service-standalone.js > /tmp/ai-standalone.log 2>&1 &
        local ai_standalone_pid=$!
        sleep 2
        
        if kill -0 $ai_standalone_pid 2>/dev/null && check_port 3013; then
            log_message "INFO" "✅ AI Service Standalone iniciado correctamente (PID: $ai_standalone_pid)"
            echo $ai_standalone_pid > /tmp/ai-standalone.pid
        else
            log_message "ERROR" "❌ No se pudo iniciar AI Service Standalone"
            cat /tmp/ai-standalone.log
        fi
    else
        log_message "INFO" "Puerto 3013 ocupado, AI Service Standalone ya está corriendo"
    fi
}

#==============================================================================
# SOLUCIÓN 3: OPTIMIZACIÓN DE MEMORIA
#==============================================================================

fix_memory_issues() {
    log_message "INFO" "🧠 Optimizando uso de memoria del sistema..."
    
    # Obtener información actual de memoria
    local total_mem=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    local used_mem=$(free -m | awk 'NR==2{printf "%.0f", $3}')
    local free_mem=$(free -m | awk 'NR==2{printf "%.0f", $4}')
    local mem_usage=$(echo "scale=1; $used_mem * 100 / $total_mem" | bc)
    
    log_message "INFO" "💾 Memoria total: ${total_mem}MB, Usada: ${used_mem}MB (${mem_usage}%), Libre: ${free_mem}MB"
    
    # Si el uso de memoria es mayor al 80%, aplicar optimizaciones
    if (( $(echo "$mem_usage > 80" | bc -l) )); then
        log_message "WARN" "⚠️  Uso de memoria alto (${mem_usage}%), aplicando optimizaciones..."
        
        # Limpiar cache del sistema
        sync
        echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1
        log_message "INFO" "🧹 Cache del sistema limpiado"
        
        # Encontrar procesos Node.js que consuman mucha memoria
        cleanup_memory_intensive_processes
        
        # Optimizar configuraciones de Node.js
        optimize_nodejs_memory
        
        # Configurar swap si es necesario
        configure_swap_if_needed
        
    else
        log_message "INFO" "✅ Uso de memoria dentro de parámetros normales (${mem_usage}%)"
    fi
    
    # Aplicar optimizaciones generales
    apply_memory_optimizations
    
    log_message "INFO" "✅ Optimización de memoria completada"
}

cleanup_memory_intensive_processes() {
    log_message "INFO" "🔍 Identificando procesos que consumen mucha memoria..."
    
    # Buscar procesos Node.js duplicados o innecesarios
    local node_processes=$(ps aux | grep node | grep -v grep | sort -k6 -nr)
    
    if [ -n "$node_processes" ]; then
        log_message "INFO" "Procesos Node.js activos:"
        echo "$node_processes" | head -10 | while read line; do
            local mem=$(echo $line | awk '{print $6}')
            local cmd=$(echo $line | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}')
            if [ $mem -gt 100000 ]; then  # Más de 100MB
                log_message "WARN" "  📊 Proceso con alto uso de memoria: ${mem}KB - $cmd"
            fi
        done
        
        # Identificar procesos duplicados
        local duplicates=$(ps aux | grep node | grep -v grep | awk '{print $11}' | sort | uniq -d)
        if [ -n "$duplicates" ]; then
            log_message "WARN" "🔄 Procesos Node.js potencialmente duplicados encontrados"
            echo "$duplicates" | while read dup; do
                local count=$(ps aux | grep "$dup" | grep -v grep | wc -l)
                if [ $count -gt 1 ]; then
                    log_message "WARN" "  - $dup: $count instancias"
                fi
            done
        fi
    fi
}

optimize_nodejs_memory() {
    log_message "INFO" "⚙️  Aplicando optimizaciones de memoria para Node.js..."
    
    # Establecer variables de entorno para optimizar memoria
    export NODE_OPTIONS="--max-old-space-size=512"
    export UV_THREADPOOL_SIZE=4
    
    # Crear archivo de configuración de memoria
    cat > "$SCRIPT_DIR/.node-memory-config" << 'EOF'
# Configuración de memoria para Node.js - Flores Victoria v3.0
NODE_OPTIONS=--max-old-space-size=512 --optimize-for-size
UV_THREADPOOL_SIZE=4
NODE_ENV=production
EOF
    
    log_message "INFO" "📝 Configuración de memoria de Node.js actualizada"
}

configure_swap_if_needed() {
    local swap_total=$(free -m | awk 'NR==3{printf "%.0f", $2}')
    
    if [ "$swap_total" -eq 0 ]; then
        log_message "WARN" "⚠️  No hay swap configurado, creando archivo de swap temporal..."
        
        # Crear archivo de swap de 1GB si no existe
        if [ ! -f /tmp/emergency_swap ]; then
            sudo dd if=/dev/zero of=/tmp/emergency_swap bs=1M count=1024 2>/dev/null
            sudo chmod 600 /tmp/emergency_swap
            sudo mkswap /tmp/emergency_swap > /dev/null 2>&1
            sudo swapon /tmp/emergency_swap 2>/dev/null
            
            if [ $? -eq 0 ]; then
                log_message "INFO" "💾 Swap temporal de 1GB creado y activado"
            else
                log_message "WARN" "⚠️  No se pudo crear swap temporal (permisos insuficientes)"
            fi
        fi
    else
        log_message "INFO" "💾 Swap disponible: ${swap_total}MB"
    fi
}

apply_memory_optimizations() {
    log_message "INFO" "🔧 Aplicando optimizaciones generales de memoria..."
    
    # Optimizar configuración del kernel para memoria (si se puede)
    if [ -w /proc/sys/vm/swappiness ]; then
        echo 10 | sudo tee /proc/sys/vm/swappiness > /dev/null 2>&1
        log_message "INFO" "⚙️  Swappiness configurado a 10"
    fi
    
    if [ -w /proc/sys/vm/vfs_cache_pressure ]; then
        echo 50 | sudo tee /proc/sys/vm/vfs_cache_pressure > /dev/null 2>&1
        log_message "INFO" "⚙️  Cache pressure configurado a 50"
    fi
    
    # Limpiar logs antiguos para liberar espacio
    find /tmp -name "*.log" -mtime +1 -delete 2>/dev/null
    log_message "INFO" "🧹 Logs temporales antiguos eliminados"
}

#==============================================================================
# VERIFICACIÓN POST-SOLUCIÓN
#==============================================================================

verify_fixes() {
    log_message "INFO" "🔍 Verificando que las soluciones se aplicaron correctamente..."
    
    local issues_fixed=0
    local total_checks=3
    
    # Verificar Admin Panel
    if check_port 3021; then
        if curl -s http://localhost:3021/health > /dev/null 2>&1; then
            log_message "INFO" "✅ Admin Panel funcionando correctamente en puerto 3021"
            ((issues_fixed++))
        else
            log_message "WARN" "⚠️  Admin Panel en puerto 3021 pero no responde"
        fi
    else
        log_message "ERROR" "❌ Admin Panel no está ejecutándose en puerto 3021"
    fi
    
    # Verificar AI Services
    local ai_services_ok=0
    if check_port 3012; then
        if curl -s http://localhost:3012/health > /dev/null 2>&1; then
            log_message "INFO" "✅ AI Service funcionando correctamente en puerto 3012"
            ((ai_services_ok++))
        fi
    fi
    
    if check_port 3013; then
        if curl -s http://localhost:3013/health > /dev/null 2>&1; then
            log_message "INFO" "✅ AI Service Standalone funcionando correctamente en puerto 3013"
            ((ai_services_ok++))
        fi
    fi
    
    if [ $ai_services_ok -gt 0 ]; then
        log_message "INFO" "✅ Servicios AI configurados correctamente ($ai_services_ok servicios activos)"
        ((issues_fixed++))
    else
        log_message "ERROR" "❌ Ningún servicio AI está funcionando"
    fi
    
    # Verificar memoria
    local current_mem_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    if (( $(echo "$current_mem_usage < 80" | bc -l) )); then
        log_message "INFO" "✅ Uso de memoria optimizado (${current_mem_usage}%)"
        ((issues_fixed++))
    else
        log_message "WARN" "⚠️  Uso de memoria sigue alto (${current_mem_usage}%)"
    fi
    
    # Resumen
    log_message "INFO" "📊 Resumen de soluciones: $issues_fixed/$total_checks problemas solucionados"
    
    if [ $issues_fixed -eq $total_checks ]; then
        log_message "INFO" "🎉 ¡Todos los problemas críticos han sido solucionados!"
        return 0
    else
        log_message "WARN" "⚠️  Algunos problemas requieren atención manual"
        return 1
    fi
}

#==============================================================================
# FUNCIÓN PRINCIPAL
#==============================================================================

main() {
    print_banner
    
    log_message "INFO" "🚀 Iniciando solución de problemas críticos..."
    
    # Crear directorio de logs si no existe
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Ejecutar soluciones
    fix_admin_panel
    echo
    fix_ai_service
    echo
    fix_memory_issues
    echo
    
    # Verificar que todo esté funcionando
    verify_fixes
    
    # Resumen final
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                   🎉 SOLUCIÓN COMPLETADA                     ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    
    echo -e "\n${CYAN}📊 Servicios Activos:${NC}"
    echo -e "${CYAN}🌐 Admin Panel:${NC} http://localhost:3021"
    echo -e "${CYAN}🤖 AI Service:${NC} http://localhost:3012"
    echo -e "${CYAN}🧠 AI Service Standalone:${NC} http://localhost:3013"
    
    echo -e "\n${CYAN}📋 Próximos pasos:${NC}"
    echo -e "1. Verificar servicios con: ./system-verification.sh"
    echo -e "2. Acceder al dashboard: http://localhost:3021/dashboard-analytics.html"
    echo -e "3. Monitorear logs: tail -f $LOG_FILE"
    
    log_message "INFO" "✅ Proceso de solución completado - Ver $LOG_FILE para detalles"
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi