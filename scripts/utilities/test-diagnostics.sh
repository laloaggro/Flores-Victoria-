#!/bin/bash
# ============================================================================
# Test del Sistema de Diagnóstico - Flores Victoria v2.0.0
# ============================================================================
# 
# Este script verifica el funcionamiento del sistema de diagnóstico
# en el navegador.
#
# Uso: ./test-diagnostics.sh

set -e

echo "🔍 Iniciando Test de Diagnóstico - Flores Victoria v2.0.0"
echo ""

# Verificar que Vite está corriendo
if ! lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Error: Vite dev server no está corriendo en puerto 5173"
    echo "   Por favor, ejecuta: npm run dev"
    exit 1
fi

echo "✅ Vite dev server detectado en puerto 5173"
echo ""

# Crear archivo temporal con instrucciones de prueba
cat > /tmp/test-diagnostics.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Diagnósticos - Flores Victoria</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1 { color: #C2185B; }
        h2 { color: #333; margin-top: 0; }
        .command {
            background: #1e1e1e;
            color: #00ff00;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            margin: 15px 0;
            cursor: pointer;
            transition: all 0.3s;
        }
        .command:hover {
            background: #2d2d2d;
            transform: translateX(5px);
        }
        .instructions {
            color: #666;
            line-height: 1.8;
        }
        .step {
            background: #e3f2fd;
            padding: 15px;
            border-left: 4px solid #2196F3;
            margin: 10px 0;
        }
        .loading {
            display: inline-block;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #iframe-container {
            width: 100%;
            height: 600px;
            border: 2px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            margin-top: 20px;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🔍 Test de Diagnósticos - Flores Victoria v2.0.0</h1>
        <p class="instructions">
            Este test verificará el funcionamiento del sistema de diagnóstico.
            Sigue estos pasos:
        </p>

        <div class="step">
            <strong>Paso 1:</strong> Abre la consola del navegador (F12 o Ctrl+Shift+I)
        </div>

        <div class="step">
            <strong>Paso 2:</strong> Copia y pega estos comandos en la consola:
        </div>

        <div class="command" onclick="copyToClipboard(this.textContent)">
FloresVictoriaDiagnostics.runAll()
        </div>

        <div class="command" onclick="copyToClipboard(this.textContent)">
FloresVictoriaDiagnostics.checkComponents()
        </div>

        <div class="command" onclick="copyToClipboard(this.textContent)">
FloresVictoriaDiagnostics.checkConfig()
        </div>

        <div class="step">
            <strong>Paso 3:</strong> Verifica que aparezcan los resultados en la consola
        </div>

        <div class="step">
            <strong>Paso 4:</strong> Verifica el sitio en el iframe debajo (debe cargar correctamente)
        </div>
    </div>

    <div class="card">
        <h2>📊 Vista Previa del Sitio</h2>
        <div id="iframe-container">
            <iframe src="http://localhost:5173/" title="Flores Victoria"></iframe>
        </div>
    </div>

    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text.trim()).then(() => {
                const notification = document.createElement('div');
                notification.textContent = '✅ Copiado al portapapeles';
                notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:15px 25px;border-radius:8px;z-index:1000;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 2000);
            });
        }

        // Auto-load diagnostics after iframe loads
        setTimeout(() => {
            console.log('%c🔍 Ejecutando diagnósticos automáticos...', 'color: #C2185B; font-size: 16px; font-weight: bold;');
            
            // Inject diagnostics script into iframe
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                iframe.addEventListener('load', () => {
                    setTimeout(() => {
                        try {
                            const iframeWindow = iframe.contentWindow;
                            if (iframeWindow.FloresVictoriaDiagnostics) {
                                console.log('%c✅ FloresVictoriaDiagnostics disponible en iframe', 'color: green; font-weight: bold;');
                            } else {
                                console.log('%c⚠️ FloresVictoriaDiagnostics no encontrado en iframe', 'color: orange; font-weight: bold;');
                            }
                        } catch (e) {
                            console.log('%c⚠️ No se puede acceder al iframe (CORS)', 'color: orange; font-weight: bold;');
                        }
                    }, 2000);
                });
            }
        }, 1000);
    </script>
</body>
</html>
EOF

echo "📝 Archivo de prueba creado: /tmp/test-diagnostics.html"
echo ""

# Detectar navegador disponible
if command -v google-chrome >/dev/null 2>&1; then
    BROWSER="google-chrome"
elif command -v chromium >/dev/null 2>&1; then
    BROWSER="chromium"
elif command -v firefox >/dev/null 2>&1; then
    BROWSER="firefox"
elif command -v xdg-open >/dev/null 2>&1; then
    BROWSER="xdg-open"
else
    echo "❌ No se encontró un navegador web instalado"
    echo "   Por favor, abre manualmente: http://localhost:5173/"
    echo "   Y ejecuta en consola: FloresVictoriaDiagnostics.runAll()"
    exit 1
fi

echo "🌐 Abriendo navegador: $BROWSER"
echo ""
echo "📋 Instrucciones:"
echo "   1. Se abrirá una página con instrucciones"
echo "   2. Abre la consola del navegador (F12)"
echo "   3. Haz clic en los comandos verdes para copiarlos"
echo "   4. Pega en la consola y presiona Enter"
echo "   5. Verifica los resultados del diagnóstico"
echo ""

# Abrir navegador
$BROWSER /tmp/test-diagnostics.html &

# Esperar un momento
sleep 2

echo ""
echo "✅ Test iniciado"
echo "   Página de prueba: /tmp/test-diagnostics.html"
echo "   Sitio en iframe: http://localhost:5173/"
echo ""
echo "💡 Para ejecutar diagnósticos manualmente:"
echo "   1. Abre http://localhost:5173/ en el navegador"
echo "   2. Abre consola (F12)"
echo "   3. Ejecuta: FloresVictoriaDiagnostics.runAll()"
echo ""
echo "📊 Comandos disponibles:"
echo "   FloresVictoriaDiagnostics.runAll()          - Ejecuta todos los diagnósticos"
echo "   FloresVictoriaDiagnostics.checkComponents() - Verifica componentes"
echo "   FloresVictoriaDiagnostics.checkConfig()     - Verifica configuración"
echo "   FloresVictoriaDiagnostics.checkLoader()     - Verifica cargador"
echo "   FloresVictoriaDiagnostics.checkStorage()    - Verifica localStorage"
echo "   FloresVictoriaDiagnostics.checkPerformance()- Verifica rendimiento"
echo ""
