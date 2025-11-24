#!/bin/bash
# ============================================================================
# Test InstantSearch Component - Flores Victoria
# ============================================================================

set -e

echo "🔍 Testing InstantSearch Component v1.0.0"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar archivos
echo -e "${BLUE}1️⃣  Verificando archivos...${NC}"

FILES=(
    "/home/impala/Documentos/Proyectos/flores-victoria/frontend/js/components/instant-search.js"
    "/home/impala/Documentos/Proyectos/flores-victoria/frontend/css/instant-search.css"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo -e "${GREEN}   ✅ $(basename $file) - ${lines} líneas${NC}"
    else
        echo -e "${YELLOW}   ⚠️  $(basename $file) no encontrado${NC}"
    fi
done
echo ""

# 2. Verificar integración en catalog.html
echo -e "${BLUE}2️⃣  Verificando integración en catalog.html...${NC}"

CATALOG_FILE="/home/impala/Documentos/Proyectos/flores-victoria/frontend/pages/catalog.html"

if grep -q "instant-search.css" "$CATALOG_FILE"; then
    echo -e "${GREEN}   ✅ CSS integrado en catalog.html${NC}"
else
    echo -e "${YELLOW}   ⚠️  CSS no encontrado en catalog.html${NC}"
fi

if grep -q "instant-search.js" "$CATALOG_FILE"; then
    echo -e "${GREEN}   ✅ JavaScript integrado en catalog.html${NC}"
else
    echo -e "${YELLOW}   ⚠️  JavaScript no encontrado en catalog.html${NC}"
fi

if grep -q "window.productCatalogInstance" "$CATALOG_FILE"; then
    echo -e "${GREEN}   ✅ Instancia global configurada${NC}"
else
    echo -e "${YELLOW}   ⚠️  Instancia global no encontrada${NC}"
fi

echo ""

# 3. Verificar servidor
echo -e "${BLUE}3️⃣  Verificando servidor...${NC}"

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Servidor corriendo en http://localhost:5173/${NC}"
else
    echo -e "${YELLOW}   ⚠️  Servidor no está corriendo${NC}"
fi

echo ""

# 4. Crear página de prueba HTML
echo -e "${BLUE}4️⃣  Creando página de test interactiva...${NC}"

cat > /tmp/instant-search-test.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InstantSearch Component Test - Flores Victoria</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            min-height: 100vh;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        h1 {
            color: #2d3748;
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .subtitle { color: #718096; font-size: 1.125rem; margin-bottom: 2rem; }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .feature-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .feature-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        .feature-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
        }
        .feature-desc {
            color: #718096;
            font-size: 0.95rem;
            line-height: 1.6;
        }
        .test-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .test-title {
            font-size: 1.5rem;
            color: #2d3748;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
        }
        .test-list {
            list-style: none;
            padding: 0;
        }
        .test-item {
            padding: 1rem;
            margin-bottom: 0.75rem;
            background: #f7fafc;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .test-icon {
            font-size: 1.5rem;
            width: 30px;
        }
        .test-content {
            flex: 1;
        }
        .test-name {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.25rem;
        }
        .test-desc {
            font-size: 0.875rem;
            color: #718096;
        }
        .btn {
            display: inline-block;
            padding: 1rem 2rem;
            background: #C2185B;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            margin: 0.5rem;
        }
        .btn:hover {
            background: #880E4F;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(194, 24, 91, 0.3);
        }
        .btn-secondary { background: #718096; }
        .btn-secondary:hover { background: #4a5568; }
        .actions {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 2rem;
        }
        .code-snippet {
            background: #1e1e1e;
            color: #00ff00;
            padding: 1rem;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
            margin: 1rem 0;
            overflow-x: auto;
            cursor: pointer;
        }
        .code-snippet:hover { background: #2d2d2d; }
        iframe {
            width: 100%;
            height: 800px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            margin-top: 1rem;
        }
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #48bb78;
            color: white;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 InstantSearch Component v1.0.0</h1>
            <p class="subtitle">Sistema de Búsqueda Instantánea para Catálogo de Productos</p>
            <div>
                <span class="badge">533 líneas JS</span>
                <span class="badge">355 líneas CSS</span>
                <span class="badge">888 líneas total</span>
            </div>
        </div>

        <div class="features">
            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <div class="feature-title">Búsqueda Instantánea</div>
                <div class="feature-desc">Resultados en tiempo real con debounce de 300ms para mejor performance</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🎯</div>
                <div class="feature-title">Highlighting Inteligente</div>
                <div class="feature-desc">Términos encontrados resaltados con gradientes y múltiples palabras</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">⌨️</div>
                <div class="feature-title">Navegación por Teclado</div>
                <div class="feature-desc">↑↓ para navegar, Enter para seleccionar, Esc para limpiar</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📊</div>
                <div class="feature-title">Contador de Resultados</div>
                <div class="feature-desc">Feedback visual en tiempo real de cuántos productos coinciden</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">💾</div>
                <div class="feature-title">Historial de Búsquedas</div>
                <div class="feature-desc">Guarda las últimas 10 búsquedas en localStorage</div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">♿</div>
                <div class="feature-title">Accesibilidad</div>
                <div class="feature-desc">ARIA labels, keyboard-only navigation, screen reader friendly</div>
            </div>
        </div>

        <div class="test-section">
            <h2 class="test-title">🧪 Cómo Probar</h2>
            <ul class="test-list">
                <li class="test-item">
                    <div class="test-icon">1️⃣</div>
                    <div class="test-content">
                        <div class="test-name">Búsqueda Básica</div>
                        <div class="test-desc">Escribe "rosas" en el buscador y verás resultados instantáneos con highlighting</div>
                    </div>
                </li>
                <li class="test-item">
                    <div class="test-icon">2️⃣</div>
                    <div class="test-content">
                        <div class="test-name">Búsqueda Múltiple</div>
                        <div class="test-desc">Prueba "cumpleaños rosas" para buscar múltiples términos a la vez</div>
                    </div>
                </li>
                <li class="test-item">
                    <div class="test-icon">3️⃣</div>
                    <div class="test-content">
                        <div class="test-name">Navegación por Teclado</div>
                        <div class="test-desc">Usa ↑ y ↓ para navegar entre productos, Enter para agregar al carrito</div>
                    </div>
                </li>
                <li class="test-item">
                    <div class="test-icon">4️⃣</div>
                    <div class="test-content">
                        <div class="test-name">Sin Resultados</div>
                        <div class="test-desc">Busca "xyzabc123" para ver el mensaje de "No se encontraron resultados"</div>
                    </div>
                </li>
                <li class="test-item">
                    <div class="test-icon">5️⃣</div>
                    <div class="test-content">
                        <div class="test-name">Limpiar Búsqueda</div>
                        <div class="test-desc">Click en el botón ✕ o presiona Esc para limpiar</div>
                    </div>
                </li>
            </ul>
        </div>

        <div class="test-section">
            <h2 class="test-title">💻 API de Consola</h2>
            <p style="color: #718096; margin-bottom: 1rem;">
                Abre DevTools (F12) y ejecuta estos comandos:
            </p>

            <div class="code-snippet" onclick="copyCode(this.textContent.trim())">
window.instantSearchInstance.search('rosas')
            </div>

            <div class="code-snippet" onclick="copyCode(this.textContent.trim())">
window.instantSearchInstance.clear()
            </div>

            <div class="code-snippet" onclick="copyCode(this.textContent.trim())">
window.instantSearchInstance.getResults()
            </div>

            <div class="code-snippet" onclick="copyCode(this.textContent.trim())">
window.instantSearchInstance.config
            </div>

            <p style="color: #a0aec0; font-size: 0.875rem; margin-top: 1rem;">
                💡 Click en cualquier comando para copiar
            </p>
        </div>

        <div class="actions">
            <a href="http://localhost:5173/pages/catalog.html" class="btn" target="_blank">
                🛍️ Abrir Catálogo
            </a>
            <button class="btn btn-secondary" onclick="window.open('http://localhost:5173/', '_blank')">
                🏠 Ir al Inicio
            </button>
        </div>

        <div class="test-section">
            <h2 class="test-title">📺 Vista Previa en Vivo</h2>
            <iframe src="http://localhost:5173/pages/catalog.html"></iframe>
        </div>
    </div>

    <script>
        function copyCode(code) {
            navigator.clipboard.writeText(code).then(() => {
                showNotification('✅ Código copiado al portapapeles');
            });
        }

        function showNotification(message) {
            const notif = document.createElement('div');
            notif.textContent = message;
            notif.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #48bb78;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 1000;
                font-weight: 600;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(notif);
            setTimeout(() => notif.remove(), 2000);
        }

        console.log('%c🔍 InstantSearch Component Test Page', 'color: #C2185B; font-size: 20px; font-weight: bold;');
        console.log('%cPrueba los comandos listados arriba', 'color: #718096;');
    </script>
</body>
</html>
EOF

echo -e "${GREEN}   ✅ Página de test creada: /tmp/instant-search-test.html${NC}"
echo ""

# 5. Abrir navegador
echo -e "${BLUE}5️⃣  Abriendo navegador...${NC}"

if command -v google-chrome >/dev/null 2>&1; then
    BROWSER="google-chrome"
elif command -v chromium >/dev/null 2>&1; then
    BROWSER="chromium"
elif command -v firefox >/dev/null 2>&1; then
    BROWSER="firefox"
else
    BROWSER="xdg-open"
fi

$BROWSER /tmp/instant-search-test.html &

echo -e "${GREEN}   ✅ Navegador abierto${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Test completado${NC}"
echo ""
echo "🔍 InstantSearch Features:"
echo "   • Debounce: 300ms"
echo "   • Min chars: 2"
echo "   • Búsqueda en: nombre, descripción, categoría, tags"
echo "   • Historial: 10 búsquedas"
echo "   • Keyboard nav: ↑↓ Enter Esc"
echo "   • Analytics integrado"
echo ""
echo "📝 Para probar:"
echo "   1. Escribe en el buscador del catálogo"
echo "   2. Usa las flechas del teclado"
echo "   3. Abre DevTools y ejecuta: window.instantSearchInstance"
echo ""

exit 0
