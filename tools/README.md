# 🛠️ Herramientas de Desarrollo - Flores Victoria

Este directorio contiene herramientas de desarrollo y utilidades para el proyecto Flores Victoria.

## 📁 Estructura

```
tools/
├── image-generation/    # Herramientas de generación y optimización de imágenes
├── testing/            # Scripts de pruebas y validación
└── analysis/           # Herramientas de análisis y visualización
```

## 🖼️ Image Generation

Herramientas para generar, optimizar y validar imágenes de productos usando IA.

### Archivos principales:

- **`generate-leonardo.js`** - Generación de imágenes con Leonardo AI
- **`generate-replicate.js`** - Generación con Replicate API
- **`generate-batch-hf.js`** - Generación por lotes con Hugging Face
- **`generate-unique-images-hf.js`** - Generación de imágenes únicas
- **`improve-product-images.js`** - Mejora automática de imágenes existentes
- **`fix-product-images.js`** - Corrección de problemas en imágenes
- **`unify-product-images.js`** - Unificación de estilos
- **`validate-product-images.js`** - Validación de calidad
- **`optimize-images.js`** - Optimización de tamaño y rendimiento
- **`ai-service-standalone.js`** - Servicio AI independiente

### Uso:

```bash
# Generar imágenes con Leonardo AI
node tools/image-generation/generate-leonardo.js

# Optimizar todas las imágenes
node tools/image-generation/optimize-images.js

# Validar imágenes de productos
node tools/image-generation/validate-product-images.js
```

## 🧪 Testing

Scripts de pruebas para diferentes componentes del sistema.

### Archivos principales:

- **`test-db.js`** - Pruebas de conexión a base de datos
- **`test-image-gen.js`** - Pruebas de generación de imágenes
- **`test-hf-single.js`** - Prueba individual de Hugging Face
- **`test-forced-generation.js`** - Pruebas de generación forzada
- **`test-unique-prompts.js`** - Validación de prompts únicos
- **`test_system.js`** - Pruebas del sistema completo

### Uso:

```bash
# Probar conexión a BD
node tools/testing/test-db.js

# Probar generación de imágenes
node tools/testing/test-image-gen.js

# Pruebas del sistema completo
node tools/testing/test_system.js
```

## 📊 Analysis

Herramientas de análisis, visualización y validación.

### Archivos principales:

- **`roi-analysis.html`** - Análisis de ROI y métricas
- **`watermark-preview.html`** - Previsualización de marcas de agua
- **`navegacion-central.html`** - Visualización de navegación

### Uso:

Abrir los archivos HTML directamente en el navegador:

```bash
# Análisis de ROI
open tools/analysis/roi-analysis.html

# Preview de watermark
open tools/analysis/watermark-preview.html

# Visualización de navegación
open tools/analysis/navegacion-central.html
```

## 📝 Notas

- Todos los scripts Node.js requieren las dependencias instaladas: `npm install`
- Configurar variables de entorno necesarias antes de usar generadores de IA
- Los archivos HTML son independientes y no requieren servidor

## 🔗 Referencias

- [Documentación principal](../docs/README.md)
- [Scripts de automatización](../scripts/README.md)
- [Configuración](../config/README.md)

## 🤝 Contribuir

Al agregar nuevas herramientas:

1. Colocarlas en el subdirectorio apropiado
2. Documentar su uso en este README
3. Incluir comentarios en el código
4. Agregar ejemplos de uso

---

**Flores Victoria** - Sistema de E-commerce con Microservicios
