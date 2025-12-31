# 🌸 Mejora de Imágenes con Hugging Face

## Descripción
Script para mejorar la calidad de imágenes usando modelos de IA de Hugging Face.

## ✅ Estado Actual
La imagen `flowers-scatter.webp` ha sido mejorada exitosamente:
- **Original**: 12 KB (1536x1024 pixels)
- **Mejorada**: 33 KB (3072x2048 pixels) - **2x resolución**
- Mejoras aplicadas:
  - ✨ Super-resolución (2x)
  - 🎨 Mejora de contraste (+20%)
  - 🌈 Saturación de color (+10%)
  - 🔍 Nitidez mejorada (+30%)

## 📋 Uso Básico

### Opción 1: Mejora Local (PIL - Ya ejecutado)
```bash
python3 scripts/enhance-image-hf.py
```

### Opción 2: Mejora con API de Hugging Face (Mejor calidad)

#### Paso 1: Obtén tu token de Hugging Face
1. Ve a [huggingface.co](https://huggingface.co/)
2. Regístrate o inicia sesión
3. Ve a Settings → Access Tokens
4. Crea un nuevo token (Read access es suficiente)

#### Paso 2: Agrega el token al archivo .env
```bash
# En el archivo .env de la raíz del proyecto
HF_TOKEN=hf_tu_token_aqui
```

> 💡 **Nota**: El script automáticamente carga el token desde `.env` usando python-dotenv

#### Paso 3: Instala dependencias adicionales (opcional)
```bash
pip install python-dotenv
```

#### Paso 4: Ejecuta el script
```bash
python3 scripts/enhance-image-hf.py
```

## 🤖 Modelos de Hugging Face Disponibles

El script usa el modelo **swin2SR-realworld-sr-x4-64-bsrgan-psnr** que proporciona:
- Super-resolución 4x
- Mejora de calidad fotográfica
- Reducción de ruido
- Restauración de detalles

### Otros modelos recomendados
Puedes modificar el script para usar otros modelos:

```python
# En enhance-image-hf.py, línea ~55, cambiar API_URL por:

# Opción 1: Real-ESRGAN (Mejor para fotos reales)
API_URL = "https://api-inference.huggingface.co/models/caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr"

# Opción 2: SwinIR (Mejor balance calidad/velocidad)
API_URL = "https://api-inference.huggingface.co/models/caidas/swin2SR-classical-sr-x4-64"

# Opción 3: BSRGAN (Mejor para imágenes degradadas)
API_URL = "https://api-inference.huggingface.co/models/eugenesiow/real-esrgan"
```

## 🎯 Resultados

### Antes
![Original](../frontend/images/flowers-scatter-original.webp)
- Resolución: 1536x1024
- Tamaño: 12 KB

### Después
![Mejorada](../frontend/images/flowers-scatter.webp)
- Resolución: 3072x2048
- Tamaño: 33 KB
- Calidad: 95%

## 📁 Archivos Generados

```
frontend/images/
├── flowers-scatter.webp           # ✅ Imagen mejorada (NUEVA)
├── flowers-scatter-original.webp  # 💾 Backup del original

frontend/public/images/
├── flowers-scatter.webp           # ✅ Imagen mejorada (NUEVA)
├── flowers-scatter-original.webp  # 💾 Backup del original

scripts/
└── flowers-scatter-enhanced.webp  # 🔧 Versión procesada
```

## 🚀 Instalación de Dependencias (Opcional)

Para usar modelos locales de Hugging Face (requiere más recursos):

```bash
# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install transformers torch pillow requests
pip install diffusers accelerate

# Ejecutar con mejor calidad
python3 scripts/enhance-image-hf.py
```

## 💡 Consejos

1. **Para mejores resultados**: Usa la API de HF con token
2. **Para rapidez**: Usa la versión local con PIL (ya ejecutada)
3. **Para experimentar**: Prueba diferentes modelos
4. **Para producción**: Optimiza el tamaño final con herramientas de compresión

## 🔧 Personalización

Edita el script para ajustar:
- `quality=95` → Calidad de salida (80-100)
- `new_size = (image.size[0] * 2)` → Factor de escala (1.5x, 2x, 3x, 4x)
- Filtros de mejora (sharpen, contrast, color)

## ⚡ Performance

| Método | Tiempo | Calidad | Tamaño Final |
|--------|--------|---------|--------------|
| PIL Local | ~2s | ⭐⭐⭐ | 33 KB |
| HF API | ~10-30s | ⭐⭐⭐⭐⭐ | Variable |
| HF Local | ~1-5min | ⭐⭐⭐⭐⭐ | Variable |

## 📝 Notas

- Los backups originales están guardados por seguridad
- La imagen mejorada está lista para usar en about.html
- El script puede adaptarse para mejorar otras imágenes
- La API de HF es gratuita pero tiene límites de uso

## 🎨 Aplicaciones en el Proyecto

Esta imagen mejorada se usa en:
- `/frontend/pages/about.html` - Sección "Nuestra Historia"
- Página "Sobre Nosotros" del sitio web
- Representa los arreglos florales de Flores Victoria

## 🔗 Enlaces Útiles

- [Hugging Face Models](https://huggingface.co/models?pipeline_tag=image-to-image)
- [Swin2SR Documentation](https://huggingface.co/caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr)
- [PIL Image Enhancement](https://pillow.readthedocs.io/en/stable/reference/ImageEnhance.html)
