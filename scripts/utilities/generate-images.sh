#!/bin/bash

# Script para generar imágenes de productos con marca de agua
# Usa AI Horde para generación gratuita

echo "🌸 Generador de Imágenes de Productos - Flores Victoria"
echo "======================================================="
echo ""

# Verificar que los servicios estén corriendo
echo "🔍 Verificando servicios..."

# Verificar API Gateway
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
  echo "❌ API Gateway no está corriendo en puerto 3000"
  echo "   Ejecuta: npm run start"
  exit 1
fi

echo "✅ API Gateway corriendo"

# Verificar AI Images endpoint
if ! curl -s http://localhost:3000/api/ai-images/status > /dev/null 2>&1; then
  echo "❌ Servicio de AI Images no disponible"
  echo "   Verifica que el API Gateway tenga las rutas de AI configuradas"
  exit 1
fi

echo "✅ Servicio de AI Images disponible"
echo ""

# Opciones
MODE=${1:-"auto"}

case $MODE in
  "auto")
    echo "🚀 Modo: Generación automática (todos los productos sin imagen)"
    echo ""
    node tools/image-generation/generate-product-images.js
    ;;
    
  "single")
    PRODUCT_ID=${2}
    if [ -z "$PRODUCT_ID" ]; then
      echo "❌ Error: Debes especificar un ID de producto"
      echo "   Uso: ./generate-images.sh single <product_id>"
      exit 1
    fi
    
    echo "🎨 Generando imagen para producto ID: $PRODUCT_ID"
    
    # Obtener producto
    PRODUCT=$(curl -s "http://localhost:3000/api/products/$PRODUCT_ID")
    
    if [ -z "$PRODUCT" ]; then
      echo "❌ Producto no encontrado"
      exit 1
    fi
    
    PRODUCT_NAME=$(echo $PRODUCT | jq -r '.name // .data.name')
    echo "📦 Producto: $PRODUCT_NAME"
    
    # Generar imagen
    node -e "
      const ProductImageGenerator = require('./scripts/generate-product-images.js');
      
      (async () => {
        const generator = new ProductImageGenerator();
        await generator.init();
        
        const product = $PRODUCT;
        const result = await generator.processProduct(product.data || product);
        
        console.log('✅ Imagen generada:', result.filename);
      })();
    "
    ;;
    
  "list")
    echo "📋 Productos sin imagen:"
    echo ""
    
    curl -s "http://localhost:3000/api/products?limit=100" | \
      jq -r '.products[] | select(.images == null or .images == [] or (.images[0] | contains("placeholder"))) | "\(.id)\t\(.name)"' | \
      head -20
    
    echo ""
    echo "💡 Usa: ./generate-images.sh single <id> para generar una imagen específica"
    ;;
    
  "test")
    echo "🧪 Modo: Test (genera 1 imagen de prueba)"
    echo ""
    
    # Obtener primer producto sin imagen
    PRODUCT=$(curl -s "http://localhost:3000/api/products?limit=100" | \
      jq -r '.products[] | select(.images == null or .images == [] or (.images[0] | contains("placeholder"))) | @json' | \
      head -1)
    
    if [ -z "$PRODUCT" ]; then
      echo "✅ Todos los productos ya tienen imágenes"
      exit 0
    fi
    
    PRODUCT_NAME=$(echo $PRODUCT | jq -r '.name')
    echo "🎨 Generando imagen de prueba para: $PRODUCT_NAME"
    echo ""
    
    node -e "
      const ProductImageGenerator = require('./scripts/generate-product-images.js');
      
      (async () => {
        const generator = new ProductImageGenerator();
        await generator.init();
        
        const product = $PRODUCT;
        const result = await generator.processProduct(product);
        
        console.log('\\n✅ Test completado!');
        console.log('📁 Imagen:', result.filepath);
      })();
    "
    ;;
    
  "stats")
    echo "📊 Estadísticas de generación:"
    echo ""
    
    TOTAL=$(curl -s "http://localhost:3000/api/products?limit=100" | jq '.products | length')
    WITHOUT_IMAGE=$(curl -s "http://localhost:3000/api/products?limit=100" | \
      jq '[.products[] | select(.images == null or .images == [] or (.images[0] | contains("placeholder")))] | length')
    WITH_IMAGE=$((TOTAL - WITHOUT_IMAGE))
    
    echo "Total de productos: $TOTAL"
    echo "Con imagen: $WITH_IMAGE"
    echo "Sin imagen: $WITHOUT_IMAGE"
    echo ""
    
    if [ -f "frontend/images/products/generated/.generated-cache.json" ]; then
      GENERATED=$(cat frontend/images/products/generated/.generated-cache.json | jq '. | length')
      echo "Generadas por IA: $GENERATED"
    fi
    ;;
    
  "clean")
    echo "🗑️  Limpiando imágenes generadas..."
    
    read -p "¿Estás seguro? (s/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
      rm -rf frontend/images/products/generated/*
      echo "✅ Imágenes eliminadas"
    else
      echo "❌ Cancelado"
    fi
    ;;
    
  "help"|*)
    echo "Uso: ./generate-images.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  auto          - Genera imágenes para todos los productos sin imagen (defecto)"
    echo "  single <id>   - Genera imagen para un producto específico"
    echo "  list          - Lista productos sin imagen"
    echo "  test          - Genera 1 imagen de prueba"
    echo "  stats         - Muestra estadísticas de generación"
    echo "  clean         - Elimina todas las imágenes generadas"
    echo "  help          - Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./generate-images.sh                    # Genera todas"
    echo "  ./generate-images.sh single 123         # Genera solo producto 123"
    echo "  ./generate-images.sh test               # Test con 1 producto"
    echo "  ./generate-images.sh stats              # Ver estadísticas"
    ;;
esac
