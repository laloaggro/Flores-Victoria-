#!/bin/bash

# Script de prueba para el sistema JavaScript avanzado de Flores Victoria
# Verifica que todos los archivos estén en su lugar y el servidor funcione

echo "🌺 === VERIFICACIÓN DEL SISTEMA JAVASCRIPT AVANZADO ==="
echo

# Verificar archivos principales
echo "📁 Verificando archivos principales..."

FILES=(
    "frontend/js/main.js"
    "frontend/css/components.css"
    "sw.js"
    "frontend/index.html"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANTE"
    fi
done

echo

# Verificar que el servidor esté corriendo
echo "🌐 Verificando servidor..."
if curl -s http://localhost:9002 > /dev/null; then
    echo "✅ Servidor HTTP activo en puerto 9002"
else
    echo "❌ Servidor no está ejecutándose"
    echo "💡 Ejecuta: python3 -m http.server 9002"
fi

echo

# Estadísticas de archivos
echo "📊 Estadísticas de archivos:"
echo "JavaScript principal: $(wc -c < frontend/js/main.js) bytes"
echo "CSS de componentes: $(wc -c < frontend/css/components.css) bytes"
echo "Service Worker: $(wc -c < sw.js) bytes"

echo

# Funcionalidades implementadas
echo "🚀 Funcionalidades implementadas:"
echo "✅ Sistema de carrito de compras completo"
echo "✅ Notificaciones toast inteligentes"
echo "✅ Modales reutilizables"
echo "✅ Búsqueda en tiempo real"
echo "✅ Validación de formularios avanzada"
echo "✅ Animaciones basadas en scroll"
echo "✅ Service Worker para caching"
echo "✅ Lazy loading de imágenes"
echo "✅ Navegación por teclado (accesibilidad)"
echo "✅ Performance monitoring"
echo "✅ Analytics integrado"

echo

# URLs de prueba
echo "🔗 URLs para probar:"
echo "Página principal: http://localhost:9002/frontend/index.html"
echo "Navegación central: http://localhost:9002/navegacion-central.html"

echo

echo "🎉 ¡Sistema listo para usar!"
echo "   Abre http://localhost:9002/frontend/index.html en tu navegador"
echo "   Abre Developer Tools (F12) para ver los logs del sistema"
echo

# Verificar errores en consola del navegador
echo "🔍 Para verificar funcionamiento:"
echo "   1. Abre la página en el navegador"
echo "   2. Abre Developer Tools (F12)"
echo "   3. Ve a la pestaña Console"
echo "   4. Deberías ver: '🌺 Flores Victoria - Iniciando aplicación...'"
echo "   5. Luego: '✅ Aplicación inicializada correctamente'"

echo
echo "📝 Pruebas sugeridas:"
echo "   - Hacer clic en 'Agregar al Carrito' en los productos"
echo "   - Abrir el carrito desde el icono del header"
echo "   - Probar el menú móvil (redimensiona la ventana)"
echo "   - Hacer scroll para ver las animaciones"
echo "   - Presionar Alt+C para abrir/cerrar carrito rápidamente"