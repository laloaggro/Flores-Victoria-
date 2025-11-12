# 🎨 Sistema de Generación de Imágenes de Productos

Sistema automático que genera imágenes únicas para productos usando **AI Horde** (100% gratis) y
agrega marca de agua del logo de Flores Victoria.

## ✨ Características

- ✅ **Generación con IA** - Usa AI Horde (Stable Diffusion) para crear imágenes realistas
- ✅ **Marca de agua automática** - Agrega logo en esquina inferior derecha
- ✅ **Sin duplicados** - Sistema de cache evita regenerar imágenes
- ✅ **Prompts inteligentes** - Genera prompts basados en flores, colores y categoría
- ✅ **Alta calidad** - Imágenes en 1024x1024px, 95% JPEG quality
- ✅ **Batch processing** - Procesa múltiples productos automáticamente
- ✅ **100% Gratis** - Sin costos de API ni límites

## 🚀 Uso Rápido

### Generar todas las imágenes faltantes

```bash
./generate-images.sh auto
```

### Ver productos sin imagen

```bash
./generate-images.sh list
```

### Generar imagen para un producto específico

```bash
./generate-images.sh single 123
```

### Test (genera 1 imagen)

```bash
./generate-images.sh test
```

### Ver estadísticas

```bash
./generate-images.sh stats
```

## 📖 Comandos Detallados

### `auto` - Generación Automática

Genera imágenes para **todos** los productos que no tienen imagen o tienen placeholder.

```bash
./generate-images.sh auto
```

**Proceso:**

1. Obtiene productos sin imagen desde API
2. Filtra productos sin imagen real
3. Genera prompt inteligente basado en:
   - Categoría del producto
   - Flores incluidas
   - Colores
4. Llama a AI Horde para generar imagen
5. Descarga imagen generada
6. Agrega marca de agua del logo
7. Guarda en `frontend/images/products/generated/`
8. Actualiza cache para evitar duplicados

**Configuración:**

- ⏱️ Delay entre generaciones: **10 segundos**
- 🔢 Máximo concurrente: **2 imágenes**
- 📏 Tamaño: **1024x1024px**
- 🔖 Logo: **80px** con **70% opacidad**

### `single <id>` - Generar Producto Específico

Genera imagen para un solo producto por su ID.

```bash
./generate-images.sh single 42
```

**Ejemplo de output:**

```
🎨 Generando imagen para producto ID: 42
📦 Producto: Ramo de Rosas Rojas Elegante

============================================================
🌸 Procesando: Ramo de Rosas Rojas Elegante
============================================================

📝 Prompt: Professional studio photograph of bouquet with roses in red colors, elegant floral arrangement...
✅ Imagen generada: https://aihorde.net/generated/...
⬇️  Descargando imagen...
🔖 Agregando marca de agua...
✅ Marca de agua agregada
💾 Guardado: ramo-de-rosas-rojas-elegan-a1b2c3d4-1730500000000.jpg
✅ Producto procesado exitosamente
```

### `list` - Listar Productos Sin Imagen

Muestra los primeros 20 productos que necesitan imagen.

```bash
./generate-images.sh list
```

**Output:**

```
📋 Productos sin imagen:

1       Ramo de Rosas Rojas
2       Bouquet de Tulipanes
3       Arreglo Primaveral
...

💡 Usa: ./generate-images.sh single <id> para generar una imagen específica
```

### `test` - Modo Test

Genera **solo 1 imagen** para probar el sistema.

```bash
./generate-images.sh test
```

Útil para:

- ✅ Verificar que AI Horde funciona
- ✅ Probar la marca de agua
- ✅ Ver calidad de las imágenes
- ✅ Validar configuración

### `stats` - Estadísticas

Muestra estadísticas de generación.

```bash
./generate-images.sh stats
```

**Output:**

```
📊 Estadísticas de generación:

Total de productos: 50
Con imagen: 35
Sin imagen: 15
Generadas por IA: 12
```

### `clean` - Limpiar Imágenes

Elimina **todas** las imágenes generadas (requiere confirmación).

```bash
./generate-images.sh clean
```

⚠️ **CUIDADO:** Esta acción no se puede deshacer.

## 🔧 Configuración Avanzada

### Desde Node.js

```javascript
const ProductImageGenerator = require('./scripts/generate-product-images.js');

const generator = new ProductImageGenerator({
  outputDir: './custom/output/path',
  logoPath: './custom/logo.svg',
  watermarkSize: 100, // Tamaño del logo en px
  watermarkOpacity: 0.8, // Opacidad (0-1)
  watermarkPadding: 30, // Padding desde el borde
});

await generator.init();

// Generar para un producto
const result = await generator.processProduct(product);

// Generar para múltiples
const results = await generator.processProducts(products, {
  maxConcurrent: 3, // Máx. generaciones simultáneas
  skipExisting: true, // Saltar productos con imagen
  delay: 5000, // Delay entre generaciones (ms)
});
```

### Personalizar Prompts

Edita `generatePrompt()` en `scripts/generate-product-images.js`:

```javascript
generatePrompt(product) {
  // Tu lógica personalizada
  const prompt = `Tu prompt personalizado para ${product.name}`;

  return {
    prompt,
    negative_prompt: 'blurry, low quality, ...',
  };
}
```

## 📁 Estructura de Archivos

```
flores-victoria/
├── scripts/
│   └── generate-product-images.js    # Generador principal
├── generate-images.sh                # CLI script
└── frontend/
    └── images/
        └── products/
            └── generated/
                ├── .generated-cache.json       # Cache de generaciones
                ├── ramo-rosas-a1b2c3d4.jpg    # Imagen generada
                ├── bouquet-tulipanes-e5f6g7h8.jpg
                └── generation-report-*.json    # Reportes
```

## 🎨 Marca de Agua

### Configuración

```javascript
{
  watermarkSize: 80,        // Tamaño del logo (px)
  watermarkOpacity: 0.7,    // Opacidad (0.0 - 1.0)
  watermarkPadding: 20,     // Distancia del borde (px)
}
```

### Posición

La marca de agua se coloca en la **esquina inferior derecha**:

```
┌─────────────────────────┐
│                         │
│    Imagen del           │
│    Producto             │
│                         │
│                      📱 │ ← Logo aquí
└─────────────────────────┘
```

### Personalizar Logo

1. Reemplaza `frontend/logo.svg`
2. O especifica ruta custom:

```javascript
const generator = new ProductImageGenerator({
  logoPath: '/path/to/custom-logo.svg',
});
```

**Formatos soportados:**

- ✅ SVG (recomendado)
- ✅ PNG con transparencia
- ✅ JPG (sin transparencia)

## 🤖 AI Horde Configuration

### Parámetros de Generación

```javascript
{
  width: 1024,              // Ancho en px
  height: 1024,             // Alto en px
  steps: 30,                // Pasos de inferencia (más = mejor)
  cfg_scale: 7.5,           // Adherencia al prompt (1-20)
  sampler_name: 'k_euler_a', // Algoritmo de sampling
  seed: random(),           // Seed para reproducibilidad
}
```

### Prompts Generados

Para un producto con:

- **Flores:** Rosas
- **Colores:** Rojo
- **Categoría:** Bouquet

**Prompt generado:**

```
Professional studio photograph of bouquet with roses in red colors,
elegant floral arrangement, high quality product photography,
white background, soft natural lighting, commercial photography,
8k resolution, detailed petals and leaves
```

**Negative prompt:**

```
blurry, low quality, watermark, text, logo, cluttered,
dark, shadows, people, hands, vase on table
```

## 📊 Sistema de Cache

### Cache de Generaciones

Evita duplicados usando hash MD5 de:

- Nombre del producto
- Flores
- Colores
- Categoría

**Archivo:** `frontend/images/products/generated/.generated-cache.json`

```json
{
  "a1b2c3d4e5f6g7h8": {
    "productId": "123",
    "productName": "Ramo de Rosas",
    "filename": "ramo-de-rosas-a1b2c3d4.jpg",
    "filepath": "/full/path/to/file.jpg",
    "generatedAt": "2025-11-01T12:00:00.000Z",
    "prompt": "Professional studio photograph...",
    "hash": "a1b2c3d4e5f6g7h8"
  }
}
```

### Limpiar Cache

```bash
# Eliminar cache (mantiene imágenes)
rm frontend/images/products/generated/.generated-cache.json

# Eliminar todo
./generate-images.sh clean
```

## 🚨 Troubleshooting

### Error: API Gateway no está corriendo

```bash
❌ API Gateway no está corriendo en puerto 3000
```

**Solución:**

```bash
npm run start
```

### Error: Servicio de AI Images no disponible

```bash
❌ Servicio de AI Images no disponible
```

**Solución:**

1. Verifica que `microservices/api-gateway/src/routes/aiImages.js` existe
2. Verifica que está registrado en el gateway:

```javascript
// microservices/api-gateway/src/server.js
const aiImagesRoutes = require('./routes/aiImages');
app.use('/api/ai-images', aiImagesRoutes);
```

### Error: Logo no encontrado

```bash
⚠️  Logo no encontrado en /path/to/logo.svg, saltando marca de agua
```

**Solución:**

1. Verifica que `frontend/logo.svg` existe
2. O especifica ruta correcta:

```javascript
const generator = new ProductImageGenerator({
  logoPath: './frontend/public/logo.svg',
});
```

### Error: AI Horde timeout

Si la generación toma demasiado tiempo:

1. **Reduce parámetros:**

   ```javascript
   steps: 20,  // En vez de 30
   width: 768, // En vez de 1024
   ```

2. **Aumenta delay entre generaciones:**

   ```bash
   # En generate-product-images.js
   delay: 15000  // 15 segundos en vez de 10
   ```

3. **Usa modo test para verificar:**
   ```bash
   ./generate-images.sh test
   ```

## 📈 Performance

### Tiempos Estimados

| Operación                 | Tiempo               |
| ------------------------- | -------------------- |
| Generación con AI Horde   | 30-120 segundos      |
| Descarga de imagen        | 2-5 segundos         |
| Procesamiento + watermark | 1-2 segundos         |
| **Total por producto**    | **~40-130 segundos** |

### Optimizaciones

1. **Batch processing**: Procesa múltiples productos en paralelo

   ```javascript
   maxConcurrent: 3; // Hasta 3 simultáneos
   ```

2. **Cache inteligente**: Evita regenerar imágenes existentes

   ```javascript
   skipExisting: true;
   ```

3. **Delay configurable**: Evita saturar AI Horde
   ```javascript
   delay: 10000; // 10 segundos entre generaciones
   ```

## 🎯 Mejores Prácticas

### 1. Empezar con Test

Siempre prueba primero:

```bash
./generate-images.sh test
```

### 2. Generar en Lotes Pequeños

No generar todo de golpe:

```bash
# En vez de generar 100 productos:
# Editar productos.slice(0, 10) en el script
```

### 3. Revisar Calidad

Revisar las primeras imágenes antes de generar todo:

```bash
./generate-images.sh test
# Revisar imagen en frontend/images/products/generated/
```

### 4. Backup de Cache

Respaldar el cache antes de limpiar:

```bash
cp frontend/images/products/generated/.generated-cache.json \
   frontend/images/products/generated/.generated-cache.backup.json
```

## 🔮 Próximas Mejoras

### Planeadas

- [ ] **Variaciones**: Generar múltiples ángulos del mismo producto
- [ ] **Estilos**: Templates de prompts (realista, artístico, minimalista)
- [ ] **Batch smarter**: Agrupar por similitud para optimizar
- [ ] **UI Admin**: Panel en admin para generar/editar imágenes
- [ ] **A/B Testing**: Generar 2 variantes y elegir la mejor
- [ ] **Upscaling**: Aumentar resolución con Real-ESRGAN
- [ ] **Background removal**: Fondo transparente automático

### Contribuir

¿Tienes ideas? Abre un issue o PR!

## 📄 License

MIT - Ver LICENSE file

## 🙏 Créditos

- **AI Horde**: https://aihorde.net - Servicio gratuito de generación de imágenes
- **Sharp**: https://sharp.pixelplumbing.com - Procesamiento de imágenes en Node.js
- **Stable Diffusion**: Modelo de IA para generación de imágenes

---

**¿Preguntas?** Abre un issue en GitHub

**¿Bugs?** Reporta en GitHub Issues

**¿Mejoras?** Pull Requests bienvenidos!
