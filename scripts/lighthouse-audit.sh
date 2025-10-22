#!/bin/bash

# Script para ejecutar auditorías Lighthouse automatizadas
# Genera reportes para todas las páginas principales

echo "🚦 Auditoría Lighthouse - Arreglos Victoria"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuración
BASE_URL_DEFAULT="http://localhost:5173"
# Permitir override vía variable de entorno BASE_URL
BASE_URL="${BASE_URL:-$BASE_URL_DEFAULT}"
REPORTS_DIR="/home/impala/Documentos/Proyectos/flores-victoria/lighthouse-reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FOLDER="$REPORTS_DIR/audit-$TIMESTAMP"

# Páginas a auditar
PAGES=(
    "index.html:Inicio"
    "pages/products.html:Productos"
    "pages/product-detail.html:Detalle de Producto"
    "pages/cart.html:Carrito"
    "pages/about.html:Nosotros"
    "pages/contact.html:Contacto"
    "pages/wishlist.html:Lista de Deseos"
)

# Contadores
success_count=0
error_count=0

# Verificar dependencias
check_dependencies() {
    echo "🔍 Verificando dependencias..."
    
    if ! command -v lighthouse &> /dev/null; then
        echo "❌ Lighthouse no está instalado"
        echo ""
        echo "Instalar con:"
        echo "  npm install -g lighthouse"
        echo ""
        exit 1
    fi
    
    # Verificar que el servidor esté corriendo; si 5173 no responde, probar 5174
    if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
        # Intentar detectar Vite en 5174 como fallback común
        if curl -s "http://localhost:5174" > /dev/null 2>&1; then
            BASE_URL="http://localhost:5174"
            echo "ℹ Detectado Vite en $BASE_URL (5173 ocupado)"
        else
            echo "❌ El servidor no está corriendo en $BASE_URL"
            echo ""
            echo "Inicia el servidor con:"
            echo "  cd frontend && npm run dev"
            echo ""
            exit 1
        fi
    fi
    
    echo "✅ Todas las dependencias listas"
    echo ""
}

# Crear directorio de reportes
setup_reports_dir() {
    mkdir -p "$REPORT_FOLDER"
    echo "📁 Reportes se guardarán en: $REPORT_FOLDER"
    echo ""
}

# Función para ejecutar auditoría en una página
audit_page() {
    local page_path=$1
    local page_name=$2
    local url="$BASE_URL/$page_path"
    local filename=$(echo "$page_path" | tr '/' '-' | sed 's/\.html//')
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Auditando: $page_name"
    echo "   URL: $url"
    
    # Ejecutar Lighthouse
    # Categorías: performance, accessibility, best-practices, seo, pwa
    lighthouse "$url" \
        --output html \
        --output json \
        --output-path "$REPORT_FOLDER/$filename" \
        --chrome-flags="--headless --no-sandbox" \
        --quiet \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Completado"
        
        # Extraer scores del JSON
        local json_file="$REPORT_FOLDER/$filename.report.json"
        if [ -f "$json_file" ]; then
            local perf=$(jq -r '.categories.performance.score * 100 | floor' "$json_file" 2>/dev/null || echo "N/A")
            local a11y=$(jq -r '.categories.accessibility.score * 100 | floor' "$json_file" 2>/dev/null || echo "N/A")
            local bp=$(jq -r '.categories."best-practices".score * 100 | floor' "$json_file" 2>/dev/null || echo "N/A")
            local seo=$(jq -r '.categories.seo.score * 100 | floor' "$json_file" 2>/dev/null || echo "N/A")
            local pwa=$(jq -r '.categories.pwa.score * 100 | floor' "$json_file" 2>/dev/null || echo "N/A")
            
            echo "   📈 Scores:"
            echo "      Performance:    $perf/100"
            echo "      Accessibility:  $a11y/100"
            echo "      Best Practices: $bp/100"
            echo "      SEO:            $seo/100"
            echo "      PWA:            $pwa/100"
        fi
        
        ((success_count++))
    else
        echo "   ❌ Error en la auditoría"
        ((error_count++))
    fi
    
    echo ""
}

# Generar resumen en HTML
generate_summary() {
    local summary_file="$REPORT_FOLDER/index.html"
    
    cat > "$summary_file" << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resumen Auditoría Lighthouse - Arreglos Victoria</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #2d5016;
            margin-bottom: 0.5rem;
            font-size: 2rem;
        }
        .timestamp {
            color: #666;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .report-card {
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s;
            cursor: pointer;
        }
        .report-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            border-color: #2d5016;
        }
        .report-card h3 {
            color: #2d5016;
            margin-bottom: 1rem;
        }
        .scores {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .score-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .score-label {
            font-size: 0.9rem;
            color: #666;
        }
        .score-value {
            font-weight: bold;
            font-size: 1.1rem;
        }
        .score-good { color: #0cce6b; }
        .score-average { color: #ffa400; }
        .score-poor { color: #ff4e42; }
        .btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #2d5016;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.9rem;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #1f3810;
        }
        .stats {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f5f5f5;
            border-radius: 8px;
        }
        .stat {
            flex: 1;
            text-align: center;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #2d5016;
        }
        .stat-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.25rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚦 Auditoría Lighthouse</h1>
        <div class="timestamp">Generado: TIMESTAMP_PLACEHOLDER</div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value" id="totalPages">0</div>
                <div class="stat-label">Páginas Auditadas</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="avgPerf">0</div>
                <div class="stat-label">Performance Promedio</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="avgA11y">0</div>
                <div class="stat-label">Accesibilidad Promedio</div>
            </div>
        </div>
        
        <div class="reports-grid" id="reportsGrid">
            <!-- Los reportes se insertarán aquí -->
        </div>
    </div>
    
    <script>
        // Esta sección se llenará dinámicamente
        const reports = REPORTS_DATA_PLACEHOLDER;
        
        const grid = document.getElementById('reportsGrid');
        let totalPerf = 0;
        let totalA11y = 0;
        
        reports.forEach((report, index) => {
            totalPerf += report.performance;
            totalA11y += report.accessibility;
            
            const card = document.createElement('div');
            card.className = 'report-card';
            card.innerHTML = `
                <h3>${report.name}</h3>
                <div class="scores">
                    ${createScoreRow('Performance', report.performance)}
                    ${createScoreRow('Accessibility', report.accessibility)}
                    ${createScoreRow('Best Practices', report.bestPractices)}
                    ${createScoreRow('SEO', report.seo)}
                    ${createScoreRow('PWA', report.pwa)}
                </div>
                <a href="${report.file}" class="btn" target="_blank">Ver Reporte Completo →</a>
            `;
            grid.appendChild(card);
        });
        
        // Actualizar estadísticas
        document.getElementById('totalPages').textContent = reports.length;
        document.getElementById('avgPerf').textContent = Math.round(totalPerf / reports.length);
        document.getElementById('avgA11y').textContent = Math.round(totalA11y / reports.length);
        
        function createScoreRow(label, score) {
            const scoreClass = score >= 90 ? 'score-good' : score >= 50 ? 'score-average' : 'score-poor';
            return `
                <div class="score-row">
                    <span class="score-label">${label}:</span>
                    <span class="score-value ${scoreClass}">${score}</span>
                </div>
            `;
        }
    </script>
</body>
</html>
EOF
    
    # Reemplazar timestamp
    sed -i "s/TIMESTAMP_PLACEHOLDER/$(date '+%d\/%m\/%Y %H:%M:%S')/g" "$summary_file"
    
    # Construir array de datos JSON
    local reports_data="["
    for page_info in "${PAGES[@]}"; do
        IFS=':' read -r page_path page_name <<< "$page_info"
        local filename=$(echo "$page_path" | tr '/' '-' | sed 's/\.html//')
        local json_file="$REPORT_FOLDER/$filename.report.json"
        
        if [ -f "$json_file" ]; then
            local perf=$(jq -r '.categories.performance.score * 100 | floor' "$json_file" 2>/dev/null || echo "0")
            local a11y=$(jq -r '.categories.accessibility.score * 100 | floor' "$json_file" 2>/dev/null || echo "0")
            local bp=$(jq -r '.categories."best-practices".score * 100 | floor' "$json_file" 2>/dev/null || echo "0")
            local seo=$(jq -r '.categories.seo.score * 100 | floor' "$json_file" 2>/dev/null || echo "0")
            local pwa=$(jq -r '.categories.pwa.score * 100 | floor' "$json_file" 2>/dev/null || echo "0")
            
            reports_data+="{\"name\":\"$page_name\",\"file\":\"$filename.report.html\",\"performance\":$perf,\"accessibility\":$a11y,\"bestPractices\":$bp,\"seo\":$seo,\"pwa\":$pwa},"
        fi
    done
    reports_data="${reports_data%,}]"  # Eliminar última coma
    
    # Reemplazar datos
    sed -i "s/REPORTS_DATA_PLACEHOLDER/$reports_data/g" "$summary_file"
    
    echo "📄 Resumen generado: $summary_file"
}

# Función principal
main() {
    check_dependencies
    setup_reports_dir
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Iniciando auditorías..."
    echo ""
    
    for page_info in "${PAGES[@]}"; do
        IFS=':' read -r page_path page_name <<< "$page_info"
        audit_page "$page_path" "$page_name"
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ AUDITORÍA COMPLETADA"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Resumen:"
    echo "   Páginas auditadas exitosamente: $success_count"
    echo "   Errores: $error_count"
    echo "   Total de páginas: ${#PAGES[@]}"
    echo ""
    
    if command -v jq &> /dev/null; then
        echo "📈 Generando resumen HTML..."
        generate_summary
        echo ""
    fi
    
    echo "📁 Reportes disponibles en:"
    echo "   $REPORT_FOLDER"
    echo ""
    echo "💡 Para ver los reportes:"
    echo "   xdg-open $REPORT_FOLDER/index.html"
    echo ""
}

# Mostrar ayuda
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    cat << EOF
Uso: ./lighthouse-audit.sh

Este script ejecuta auditorías Lighthouse en todas las páginas principales
del sitio y genera reportes HTML y JSON.

Requisitos:
  - Lighthouse CLI (npm install -g lighthouse)
  - jq (sudo apt-get install jq) - opcional para resumen
  - Servidor corriendo en http://localhost:5173

Páginas auditadas:
EOF
    for page_info in "${PAGES[@]}"; do
        IFS=':' read -r page_path page_name <<< "$page_info"
        echo "  - $page_name ($page_path)"
    done
    echo ""
    echo "Reportes generados:"
    echo "  - HTML individual para cada página"
    echo "  - JSON con datos de la auditoría"
    echo "  - Resumen HTML interactivo"
    echo ""
    exit 0
fi

main
