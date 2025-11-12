# Solución Temporal: Problema de Permisos en Cache de AI Horde

## 🐛 Problema Detectado

El servicio AI Horde del API Gateway intenta escribir en:

```
/home/impala/Documentos/Proyectos/flores-victoria/services/ai-image-service/cache/images/
```

Pero este directorio tiene permisos protegidos (probablemente creado por Docker o root).

## ✅ Solución Implementada

Por ahora, vamos a **usar imágenes existentes** como base y aplicar el sistema de marca de agua dual
que ya funciona perfectamente.

### Opción 1: Usar Imágenes Existentes (RECOMENDADO)

Ya tienes 56 productos con imágenes de alta calidad. El sistema de marca de agua dual ya funciona:

```bash
# Ver demo de marca de agua dual
xdg-open demo-watermark-combined.jpg
```

### Opción 2: Arreglar Permisos (Temporal)

```bash
# Como root o con sudo
sudo chown -R $USER:$USER /home/impala/Documentos/Proyectos/flores-victoria/services/ai-image-service/cache

# O recrear el directorio
sudo rm -rf /home/impala/Documentos/Proyectos/flores-victoria/services/ai-image-service/cache
mkdir -p /home/impala/Documentos/Proyectos/flores-victoria/services/ai-image-service/cache/images
```

### Opción 3: Cambiar Directorio de Cache en API Gateway

Editar `microservices/api-gateway/src/services/aiHordeClient.js`:

```javascript
// Línea ~13
const CACHE_DIR = path.join(__dirname, '../../../../cache/ai-images');
//  Cambiar a:
const CACHE_DIR = path.join(__dirname, '../../../../frontend/images/products/generated/ai-cache');
```

## 🎯 Lo Que Ya Funciona

1. ✅ **Sistema de Prompts Únicos**: Cada producto genera un prompt diferente
   - Basado en flores específicas
   - Colores exactos
   - Categoría y estilo
   - Seed único por producto

2. ✅ **Marca de Agua Dual**:
   - Logo centrado (50% width, 25% opacity) - Protección
   - Logo esquina (80px, 100% opacity) - Branding

3. ✅ **Scripts de Demostración**:
   - `test-unique-prompts.js` - Ver prompts generados
   - `demo-watermark-combined.js` - Ver marca de agua dual

## 📊 Productos Actuales

```
Total: 56 productos
Con imágenes: 56
Sin imágenes: 0
```

## 🚀 Siguiente Paso Recomendado

**Aplicar marca de agua a imágenes existentes:**

```javascript
// Crear script: apply-watermark-to-existing.js
const ProductImageGenerator = require('./scripts/generate-product-images.js');
const fs = require('fs').promises;
const path = require('path');

async function applyWatermarks() {
  const generator = new ProductImageGenerator();
  await generator.init();

  // Obtener todos los productos
  const response = await fetch('http://localhost:3000/api/products');
  const data = await response.json();
  const products = data.products || data.data || data;

  for (const product of products) {
    if (product.images && product.images.length > 0) {
      const imagePath = path.join(__dirname, 'frontend', product.images[0]);

      try {
        // Leer imagen existente
        const imageBuffer = await fs.readFile(imagePath);

        // Aplicar marca de agua dual
        const watermarked = await generator.addWatermark(imageBuffer);

        // Guardar en directorio de generados
        const outputPath = path.join(generator.outputDir, `${product.id}-watermarked.png`);

        await fs.writeFile(outputPath, watermarked);
        console.log(`✅ ${product.name} - Marca de agua aplicada`);
      } catch (error) {
        console.error(`❌ ${product.name}:`, error.message);
      }
    }
  }
}

applyWatermarks();
```

Esto te daría:

- ✅ Las imágenes profesionales que ya tienes
- ✅ Con doble marca de agua (protección + branding)
- ✅ Sin depender de AI Horde (que tiene problemas de permisos)

¿Quieres que cree este script?
