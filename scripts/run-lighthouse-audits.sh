#!/bin/bash

##############################################################################
# Script de Auditoría Lighthouse Automatizada
# Genera reportes HTML y JSON para análisis detallado
##############################################################################

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="http://localhost:5173"
REPORTS_DIR="./reports/lighthouse-$(date +%Y%m%d-%H%M%S)"
PAGES=(
  "/:homepage"
  "/pages/products.html:products"
  "/pages/product-detail.html?id=1:product-detail"
  "/pages/about.html:about"
  "/pages/contact.html:contact"
)

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}║     🚀 AUDITORÍA LIGHTHOUSE - FLORES VICTORIA 🚀             ║${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que lighthouse está instalado
if ! command -v lighthouse &> /dev/null; then
    echo -e "${YELLOW}⚠️  Lighthouse no encontrado. Instalando...${NC}"
    npm install -g lighthouse
fi

# Verificar que el servidor está corriendo
echo -e "${BLUE}🔍 Verificando servidor...${NC}"
if ! curl -s --head --request GET "$BASE_URL" | grep "200" > /dev/null; then 
    echo -e "${RED}❌ Error: Servidor no accesible en $BASE_URL${NC}"
    echo -e "${YELLOW}💡 Ejecuta: docker-compose -f docker-compose.dev-simple.yml up -d frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Servidor accesible${NC}"
echo ""

# Crear directorio de reportes
mkdir -p "$REPORTS_DIR"
echo -e "${GREEN}📁 Reportes se guardarán en: $REPORTS_DIR${NC}"
echo ""

# Función para ejecutar Lighthouse
run_audit() {
    local path=$1
    local name=$2
    local url="$BASE_URL$path"
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 Auditando: $name${NC}"
    echo -e "${BLUE}🔗 URL: $url${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Ejecutar Lighthouse
    lighthouse "$url" \
        --output html \
        --output json \
        --output-path "$REPORTS_DIR/$name" \
        --chrome-flags="--headless --no-sandbox --disable-gpu" \
        --only-categories=performance,accessibility,best-practices,seo \
        --quiet
    
    # Extraer scores del JSON
    local json_file="$REPORTS_DIR/$name.report.json"
    if [ -f "$json_file" ]; then
        local perf=$(jq '.categories.performance.score * 100' "$json_file" | xargs printf "%.0f")
        local a11y=$(jq '.categories.accessibility.score * 100' "$json_file" | xargs printf "%.0f")
        local bp=$(jq '.categories["best-practices"].score * 100' "$json_file" | xargs printf "%.0f")
        local seo=$(jq '.categories.seo.score * 100' "$json_file" | xargs printf "%.0f")
        
        echo -e "${GREEN}✅ Auditoría completada:${NC}"
        echo -e "   Performance:     $perf/100"
        echo -e "   Accessibility:   $a11y/100"
        echo -e "   Best Practices:  $bp/100"
        echo -e "   SEO:             $seo/100"
        echo ""
        
        # Retornar scores para resumen
        echo "$name,$perf,$a11y,$bp,$seo" >> "$REPORTS_DIR/scores.csv"
    else
        echo -e "${RED}❌ Error: No se pudo generar reporte JSON${NC}"
    fi
}

# Crear header del CSV
echo "Page,Performance,Accessibility,Best Practices,SEO" > "$REPORTS_DIR/scores.csv"

# Ejecutar auditorías
echo -e "${YELLOW}🚀 Iniciando auditorías...${NC}"
echo ""

for page_config in "${PAGES[@]}"; do
    IFS=':' read -r path name <<< "$page_config"
    run_audit "$path" "$name"
    sleep 2  # Pausa para evitar sobrecarga
done

# Generar resumen
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}║                  📊 RESUMEN DE AUDITORÍAS                     ║${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Mostrar tabla de resultados
if [ -f "$REPORTS_DIR/scores.csv" ]; then
    column -t -s',' "$REPORTS_DIR/scores.csv"
    echo ""
    
    # Calcular promedios
    local avg_perf=$(awk -F',' 'NR>1 {sum+=$2; count++} END {printf "%.0f", sum/count}' "$REPORTS_DIR/scores.csv")
    local avg_a11y=$(awk -F',' 'NR>1 {sum+=$3; count++} END {printf "%.0f", sum/count}' "$REPORTS_DIR/scores.csv")
    local avg_bp=$(awk -F',' 'NR>1 {sum+=$4; count++} END {printf "%.0f", sum/count}' "$REPORTS_DIR/scores.csv")
    local avg_seo=$(awk -F',' 'NR>1 {sum+=$5; count++} END {printf "%.0f", sum/count}' "$REPORTS_DIR/scores.csv")
    
    echo -e "${GREEN}📈 PROMEDIOS:${NC}"
    echo -e "   Performance:     $avg_perf/100"
    echo -e "   Accessibility:   $avg_a11y/100"
    echo -e "   Best Practices:  $avg_bp/100"
    echo -e "   SEO:             $avg_seo/100"
    echo ""
fi

# Generar reporte consolidado HTML
cat > "$REPORTS_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lighthouse Audits - Flores Victoria</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            text-align: center;
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 2.5rem;
        }
        .meta {
            text-align: center;
            color: #666;
            margin-bottom: 2rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .card {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 1.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .card h2 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }
        .scores {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .score-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background: #f5f5f5;
            border-radius: 4px;
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
            background: #667eea;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            text-align: center;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #5568d3;
        }
        .summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            text-align: center;
        }
        .summary h2 {
            color: white;
            margin-bottom: 1rem;
        }
        .summary-scores {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .summary-score {
            flex: 1;
            min-width: 120px;
        }
        .summary-score h3 {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
        }
        .summary-score .value {
            font-size: 2.5rem;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Lighthouse Audits</h1>
        <div class="meta">
            <strong>Flores Victoria</strong><br>
            <span id="date"></span>
        </div>
        
        <div class="summary">
            <h2>📊 Resumen General</h2>
            <div class="summary-scores">
                <div class="summary-score">
                    <h3>Performance</h3>
                    <div class="value" id="avg-perf">--</div>
                </div>
                <div class="summary-score">
                    <h3>Accessibility</h3>
                    <div class="value" id="avg-a11y">--</div>
                </div>
                <div class="summary-score">
                    <h3>Best Practices</h3>
                    <div class="value" id="avg-bp">--</div>
                </div>
                <div class="summary-score">
                    <h3>SEO</h3>
                    <div class="value" id="avg-seo">--</div>
                </div>
            </div>
        </div>
        
        <div class="grid" id="reports-grid"></div>
    </div>
    
    <script>
        // Mostrar fecha
        document.getElementById('date').textContent = new Date().toLocaleString('es-ES');
        
        // Cargar scores desde CSV
        fetch('./scores.csv')
            .then(r => r.text())
            .then(csv => {
                const lines = csv.trim().split('\n');
                const reports = lines.slice(1).map(line => {
                    const [page, perf, a11y, bp, seo] = line.split(',');
                    return { page, perf: +perf, a11y: +a11y, bp: +bp, seo: +seo };
                });
                
                // Calcular promedios
                const avg = {
                    perf: Math.round(reports.reduce((s, r) => s + r.perf, 0) / reports.length),
                    a11y: Math.round(reports.reduce((s, r) => s + r.a11y, 0) / reports.length),
                    bp: Math.round(reports.reduce((s, r) => s + r.bp, 0) / reports.length),
                    seo: Math.round(reports.reduce((s, r) => s + r.seo, 0) / reports.length)
                };
                
                document.getElementById('avg-perf').textContent = avg.perf;
                document.getElementById('avg-a11y').textContent = avg.a11y;
                document.getElementById('avg-bp').textContent = avg.bp;
                document.getElementById('avg-seo').textContent = avg.seo;
                
                // Generar cards
                const grid = document.getElementById('reports-grid');
                reports.forEach(r => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <h2>${r.page.charAt(0).toUpperCase() + r.page.slice(1)}</h2>
                        <div class="scores">
                            ${scoreRow('Performance', r.perf)}
                            ${scoreRow('Accessibility', r.a11y)}
                            ${scoreRow('Best Practices', r.bp)}
                            ${scoreRow('SEO', r.seo)}
                        </div>
                        <br>
                        <a href="./${r.page}.report.html" class="btn">Ver Reporte Completo</a>
                    `;
                    grid.appendChild(card);
                });
            });
        
        function scoreRow(label, value) {
            const className = value >= 90 ? 'score-good' : value >= 50 ? 'score-average' : 'score-poor';
            return `
                <div class="score-row">
                    <span>${label}</span>
                    <span class="score-value ${className}">${value}</span>
                </div>
            `;
        }
    </script>
</body>
</html>
EOF

echo -e "${GREEN}✅ Reporte consolidado generado: $REPORTS_DIR/index.html${NC}"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}║  ✅ AUDITORÍAS COMPLETADAS EXITOSAMENTE                       ║${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📁 Ubicación de reportes:${NC}"
echo -e "   $REPORTS_DIR"
echo ""
echo -e "${YELLOW}🌐 Para ver los reportes:${NC}"
echo -e "   1. Abre: $REPORTS_DIR/index.html"
echo -e "   2. O ejecuta: open $REPORTS_DIR/index.html (Mac)"
echo -e "   3. O ejecuta: xdg-open $REPORTS_DIR/index.html (Linux)"
echo ""
echo -e "${GREEN}🎉 ¡Auditoría completada!${NC}"
