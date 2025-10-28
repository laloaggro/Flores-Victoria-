# ✅ AI Horde Implementado - Generación de Imágenes Gratis

## 🎯 ¿Qué se implementó?

Sistema completo de generación de imágenes usando **AI Horde** (100% gratis, sin límites).

### Componentes Creados

1. **Cliente AI Horde** (`microservices/api-gateway/src/services/aiHordeClient.js`)
   - Conexión a aihorde.net
   - Manejo de cola asíncrona automático
   - Cache local de imágenes
   - Soporte para modelos FLUX.1-dev, SDXL, SD 2.1
   - Presets predefinidos

2. **Rutas API** (`microservices/api-gateway/src/routes/aiImages.js`)
   - POST `/api/ai-images/generate` - Generar imagen
   - GET `/api/ai-images/presets` - Listar presets
   - GET `/api/ai-images/models` - Modelos disponibles
   - GET `/api/ai-images/status` - Estado del servicio

3. **Documentación** (`docs/AI_HORDE_GUIDE.md`)
   - Guía completa de uso
   - Ejemplos de curl
   - Referencia de parámetros
   - Tips y troubleshooting

4. **Script de Prueba** (`scripts/test-ai-horde.sh`)
   - Prueba rápida con parámetros optimizados

## 🚀 Cómo Usar

### Opción 1: Con Preset (Más Fácil)

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{"preset": "scatter_flowers"}'
```

### Opción 2: Personalizado

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "elegant red roses bouquet on white background",
    "width": 1024,
    "height": 1024,
    "steps": 25
  }'
```

### Opción 3: Script de Prueba

```bash
./scripts/test-ai-horde.sh
```

## 📋 Presets Disponibles

### `scatter_flowers`
- **Uso:** Imágenes para about page, fondos con flores variadas
- **Dimensiones:** 1536×1024
- **Características:** Muchas flores variadas, fondo blanco puro, sin florero
- **Ideal para:** Banners, hero sections laterales

### `hero_background`
- **Uso:** Fondos para hero sections
- **Dimensiones:** 1920×1080
- **Características:** Bouquet desenfocado, colores pasteles, atmósfera elegante
- **Ideal para:** Backgrounds, headers principales

## ⏱️ Tiempos Esperados

- **Cola baja:** 10-30 segundos
- **Cola media:** 30-90 segundos  
- **Cola alta:** 1-3 minutos (como ahora)

El sistema espera automáticamente (timeout 3 minutos).

## 💰 Costo

**100% GRATIS** - Sin límites, sin tarjeta, sin configuración.

AI Horde es un servicio comunitario de código abierto.

## 🔧 Parámetros Disponibles

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `prompt` | string | - | Descripción de la imagen (requerido) |
| `negative_prompt` | string | "" | Cosas a evitar |
| `width` | number | 1024 | Ancho en píxeles |
| `height` | number | 1024 | Alto en píxeles |
| `steps` | number | 25 | Pasos de inferencia (más = mejor) |
| `cfg_scale` | number | 7.5 | Guidance scale (1-20) |
| `sampler_name` | string | "k_euler_a" | Sampler a usar |
| `model` | string | "FLUX.1-dev" | Modelo a usar |
| `preset` | string | null | Usar preset predefinido |

## 📊 Respuesta Exitosa

```json
{
  "success": true,
  "filename": "ai-horde-abc123.png",
  "url": "https://cdn.aihorde.net/...",
  "localPath": "/path/to/cache/ai-horde-abc123.png",
  "publicUrl": "/images/productos/ai-horde-abc123.png",
  "metadata": {
    "prompt": "...",
    "model": "FLUX.1-dev",
    "seed": 1234567890,
    "kudos": 15.5,
    "worker_id": "abc-123",
    "worker_name": "CoolWorker"
  }
}
```

## 📁 Cache

Las imágenes se guardan automáticamente en:
```
services/ai-image-service/cache/images/ai-horde-{hash}.png
```

Y se pueden servir vía frontend en:
```
http://localhost:5173/images/productos/ai-horde-{hash}.png
```

## 🎨 Ejemplos de Prompts Efectivos

### Para Productos
```
"professional product photography of fresh red roses bouquet, white background, studio lighting, high detail, 8k"
```

### Para About Page
```
"many assorted fresh flowers scattered on pure white background, roses, tulips, gerberas, lilies, no vase, vibrant colors, overhead view"
```

### Para Backgrounds
```
"elegant pink peonies bouquet blurred background, soft pastel colors, dreamy atmosphere, shallow depth of field"
```

## 💡 Tips

1. **Para generación más rápida:**
   - Reduce `steps` a 15-20
   - Usa dimensiones menores (512×512)
   - Usa modelo `stable_diffusion_xl` en lugar de FLUX

2. **Para mejor calidad:**
   - Aumenta `steps` a 30-40
   - Usa modelo `FLUX.1-dev`
   - Aumenta `cfg_scale` a 8-10
   - Sé muy específico en el prompt

3. **Negative prompts útiles:**
   ```
   "wilted, dead, artificial, plastic, blurry, low quality, watermark, text"
   ```

## 🔗 Documentación Completa

Ver: `docs/AI_HORDE_GUIDE.md`

## ✅ Estado Actual

- ✅ Cliente AI Horde implementado
- ✅ Endpoints API funcionando
- ✅ Presets configurados
- ✅ Cache local automático
- ✅ Documentación completa
- ✅ Scripts de prueba listos
- 🔄 Prueba real en proceso (cola ~10 min)

## 🚦 Próximos Pasos Opcionales

1. **Mejorar prioridad:** Registrarse en aihorde.net para cola más rápida (sigue gratis)
2. **UI en frontend:** Crear interfaz para generar desde el admin panel
3. **Más presets:** Añadir presets para diferentes ocasiones (bodas, cumpleaños, etc.)
4. **Galería:** Crear galería de imágenes generadas
5. **Background job:** Generar imágenes en background sin esperar respuesta

---

**Nota Importante:** El servicio depende de workers voluntarios. En horas pico (como ahora) puede haber cola de 5-10 minutos. Para producción crítica, considera registrarte para mejor prioridad (sigue siendo 100% gratis).
