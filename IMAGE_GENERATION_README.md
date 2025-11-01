# 🎨 Generador de Imágenes de Productos

Sistema completo para generar imágenes únicas de productos usando **AI Horde** (100% gratis) con marca de agua del logo de Flores Victoria.

## ⚡ Quick Start

### 1. Ver estadísticas actuales

```bash
./generate-images.sh stats
```

### 2. Generar todas las imágenes faltantes

```bash
./generate-images.sh auto
```

### 3. Probar con 1 imagen

```bash
./generate-images.sh test
```

## 🎯 Características

✅ **100% Gratis** - Usa AI Horde (sin costos ni límites)  
✅ **Marca de agua automática** - Logo en esquina inferior derecha  
✅ **Sin duplicados** - Sistema de cache inteligente  
✅ **Imágenes únicas** - Seed aleatorio garantiza variedad  
✅ **Alta calidad** - 1024x1024px, JPEG 95%  
✅ **Prompts inteligentes** - Basados en flores, colores y categoría  

## 📖 Comandos Disponibles

```bash
./generate-images.sh auto          # Genera todas las imágenes faltantes
./generate-images.sh single <id>   # Genera imagen para producto específico
./generate-images.sh list          # Lista productos sin imagen
./generate-images.sh test          # Genera 1 imagen de prueba
./generate-images.sh stats         # Muestra estadísticas
./generate-images.sh clean         # Elimina todas las imágenes generadas
./generate-images.sh help          # Ayuda completa
```

## 🔧 Configuración

### Marca de Agua Combinada

El sistema aplica **doble marca de agua** para máxima protección y branding:

```javascript
// scripts/generate-product-images.js
{
  // Logo centrado (protección anti-copia)
  centerLogoSize: 50% del ancho de la imagen
  centerOpacity: 0.25,      // 25% opacidad (muy sutil)
  
  // Logo esquina (branding profesional)
  watermarkSize: 80,        // Tamaño del logo (px)
  watermarkOpacity: 1.0,    // 100% opacidad (totalmente visible)
  watermarkPadding: 20,     // Distancia del borde (px)
}
```

**Resultado:** Protección efectiva + marca profesional sin ser invasivo

### Generación AI

```javascript
{
  width: 1024,              // Ancho
  height: 1024,             // Alto
  steps: 30,                // Calidad (20-50)
  cfg_scale: 7.5,           // Adherencia al prompt
  sampler_name: 'k_euler_a' // Algoritmo
}
```

## 📁 Estructura

```
flores-victoria/
├── scripts/
│   └── generate-product-images.js    # Generador principal (Node.js)
├── generate-images.sh                # CLI helper (Bash)
├── docs/
│   └── IMAGE_GENERATION_GUIDE.md     # Documentación completa
└── frontend/
    └── images/
        └── products/
            └── generated/
                ├── .generated-cache.json      # Cache
                ├── producto-a1b2c3d4.jpg     # Imágenes
                └── generation-report-*.json   # Reportes
```

## 🚀 Ejemplos de Uso

### Generar imagen para producto específico

```bash
./generate-images.sh single 42
```

Output:
```
🎨 Generando imagen para producto ID: 42
📦 Producto: Ramo de Rosas Rojas Elegante

============================================================
🌸 Procesando: Ramo de Rosas Rojas Elegante
============================================================

📝 Prompt: Professional studio photograph of bouquet...
✅ Imagen generada
⬇️  Descargando...
🔖 Agregando marca de agua...
💾 Guardado: ramo-de-rosas-rojas-a1b2c3d4.jpg
✅ Completado
```

### Desde Node.js

```javascript
const ProductImageGenerator = require('./scripts/generate-product-images.js');

const generator = new ProductImageGenerator({
  outputDir: './custom/path',
  logoPath: './custom-logo.svg',
  watermarkSize: 100,
});

await generator.init();

// Un producto
await generator.processProduct(product);

// Múltiples productos
await generator.processProducts(products, {
  maxConcurrent: 2,
  skipExisting: true,
  delay: 10000
});
```

## 🎨 Prompts Inteligentes

El sistema genera prompts basados en el producto:

**Producto:**
```json
{
  "name": "Ramo de Rosas",
  "flowers": ["rosas"],
  "colors": ["rojo"],
  "category": "bouquet"
}
```

**Prompt generado:**
```
Professional studio photograph of bouquet with rosas in rojo colors,
elegant floral arrangement, high quality product photography,
white background, soft natural lighting, commercial photography,
8k resolution, detailed petals and leaves
```

**Negative prompt:**
```
blurry, low quality, watermark, text, logo, cluttered,
dark, shadows, people, hands, vase on table
```

## 📊 Performance

| Operación | Tiempo |
|-----------|--------|
| Generación AI | 30-120s |
| Descarga | 2-5s |
| Watermark | 1-2s |
| **Total** | **~40-130s** |

**Optimizaciones:**
- ✅ Procesamiento paralelo (max 2 simultáneos)
- ✅ Cache para evitar duplicados
- ✅ Delay configurable (10s por defecto)

## 🔍 Sistema de Cache

### Hash Único

Evita duplicados usando MD5 de:
- Nombre del producto
- Flores incluidas
- Colores
- Categoría

### Estructura del Cache

```json
{
  "a1b2c3d4e5f6g7h8": {
    "productId": "123",
    "productName": "Ramo de Rosas",
    "filename": "ramo-de-rosas-a1b2c3d4.jpg",
    "generatedAt": "2025-11-01T12:00:00Z",
    "hash": "a1b2c3d4e5f6g7h8"
  }
}
```

## 🚨 Troubleshooting

### API Gateway no corre

```bash
npm run start
```

### AI Images no disponible

Verifica rutas en `microservices/api-gateway/src/server.js`

### Logo no encontrado

Verifica que existe `frontend/logo.svg`

### Timeout en generación

Reduce parámetros:
```javascript
steps: 20,  // En vez de 30
width: 768  // En vez de 1024
```

## 📚 Documentación Completa

Ver: [`docs/IMAGE_GENERATION_GUIDE.md`](docs/IMAGE_GENERATION_GUIDE.md)

Incluye:
- ✅ Configuración avanzada
- ✅ Personalización de prompts
- ✅ API reference
- ✅ Troubleshooting detallado
- ✅ Mejores prácticas

## 🎯 Próximos Pasos

1. **Test inicial**
   ```bash
   ./generate-images.sh test
   ```

2. **Revisar calidad**
   - Abrir imagen generada
   - Verificar marca de agua
   - Validar prompt

3. **Generar en lotes**
   ```bash
   ./generate-images.sh auto
   ```

4. **Integrar con productos**
   - Actualizar URLs en base de datos
   - Configurar CDN (opcional)

## 🔗 Links Útiles

- [AI Horde](https://aihorde.net) - Servicio de generación
- [Sharp Docs](https://sharp.pixelplumbing.com) - Procesamiento de imágenes
- [Stable Diffusion](https://stability.ai) - Modelo de IA

## 🙏 Créditos

- **AI Horde**: Generación gratuita de imágenes
- **Sharp**: Procesamiento y watermarking
- **Stable Diffusion**: Modelo de IA

---

**Estado actual:** ✅ Sistema completamente funcional

**Imágenes generadas:** Ver `./generate-images.sh stats`

**Soporte:** Abre un issue en GitHub
