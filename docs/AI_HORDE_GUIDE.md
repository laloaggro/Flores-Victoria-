# 🎨 AI Horde - Generación de Imágenes Gratis

Sistema de generación de imágenes usando **AI Horde** (100% gratis, sin límites).

## 🚀 Quick Start

### Generar imagen con preset (más fácil)

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "preset": "scatter_flowers"
  }'
```

### Generar imagen personalizada

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "elegant red roses bouquet in crystal vase, professional photography",
    "width": 1024,
    "height": 1024,
    "steps": 30,
    "cfg_scale": 7.5
  }'
```

## 📋 Endpoints Disponibles

### POST `/api/ai-images/generate`

Genera una imagen usando AI Horde.

**Body (JSON):**

```json
{
  "prompt": "texto descriptivo de la imagen",
  "negative_prompt": "cosas a evitar",
  "width": 1024,
  "height": 1024,
  "steps": 25,
  "cfg_scale": 7.5,
  "sampler_name": "k_euler_a",
  "model": "FLUX.1-dev",
  "preset": "scatter_flowers"
}
```

**Parámetros:**

- `prompt` (string): Descripción de lo que quieres generar (requerido si no hay preset)
- `negative_prompt` (string, opcional): Cosas a evitar en la imagen
- `width` (number, opcional): Ancho en píxeles (default: 1024)
- `height` (number, opcional): Alto en píxeles (default: 1024)
- `steps` (number, opcional): Pasos de inferencia (default: 25, más = mejor calidad pero más lento)
- `cfg_scale` (number, opcional): Guidance scale (default: 7.5, rango 1-20)
- `sampler_name` (string, opcional): Sampler a usar (default: "k_euler_a")
- `model` (string, opcional): Modelo a usar (default: "FLUX.1-dev")
- `preset` (string, opcional): Usar preset predefinido ("scatter_flowers", "hero_background")

**Respuesta exitosa:**

```json
{
  "success": true,
  "filename": "ai-horde-abc123def.png",
  "url": "https://cdn.aihorde.net/...",
  "localPath": "/path/to/cache/ai-horde-abc123def.png",
  "publicUrl": "/images/productos/ai-horde-abc123def.png",
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

### GET `/api/ai-images/presets`

Lista presets disponibles.

**Respuesta:**

```json
{
  "scatter_flowers": {
    "description": "Flores variadas dispersas en fondo blanco (para about page)",
    "dimensions": "1536x1024"
  },
  "hero_background": {
    "description": "Fondo elegante desenfocado para hero sections",
    "dimensions": "1920x1080"
  }
}
```

### GET `/api/ai-images/models`

Lista modelos disponibles en AI Horde en tiempo real.

**Respuesta:**

```json
{
  "models": [
    {
      "name": "FLUX.1-dev",
      "count": 45,
      "queued": 12,
      "type": "image"
    }
  ]
}
```

### GET `/api/ai-images/status`

Estado del servicio AI Horde.

**Respuesta:**

```json
{
  "available": true,
  "heartbeat": "2025-10-27T12:34:56.789Z"
}
```

## 🎨 Presets Disponibles

### `scatter_flowers`

Ideal para imágenes de about page, fondos con flores variadas.

**Características:**

- Dimensiones: 1536×1024
- Múltiples tipos de flores (rosas, tulipanes, gerberas, lirios, claveles, margaritas)
- Fondo blanco puro
- Sin florero ni contenedor
- Alta calidad, realista
- Optimizado para: banners, hero sections laterales

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{"preset": "scatter_flowers"}'
```

### `hero_background`

Ideal para fondos de hero sections, headers.

**Características:**

- Dimensiones: 1920×1080
- Bouquet desenfocado elegante
- Colores pasteles desaturados
- Atmósfera soñadora
- Optimizado para: backgrounds, hero sections principales

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{"preset": "hero_background"}'
```

## 💡 Ejemplos de Uso

### 1. Generar imagen para About Page

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "preset": "scatter_flowers"
  }' | jq .
```

### 2. Generar bouquet específico

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "premium red roses bouquet with baby breath, elegant wrapping, studio lighting",
    "negative_prompt": "wilted, dead, artificial, plastic",
    "width": 1024,
    "height": 1024,
    "steps": 30,
    "cfg_scale": 8.0
  }' | jq .
```

### 3. Generar background para hero

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "preset": "hero_background",
    "prompt": "elegant pink tulips bouquet blurred background, soft pastel colors"
  }' | jq .
```

### 4. Generar arreglo estacional

```bash
curl -X POST http://localhost:3000/api/ai-images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "autumn flower arrangement with orange gerberas and sunflowers, rustic basket, warm lighting",
    "width": 1024,
    "height": 1024,
    "steps": 25
  }' | jq .
```

## ⚙️ Configuración Avanzada

### Modelos Disponibles

- `FLUX.1-dev` (recomendado, mejor calidad)
- `stable_diffusion_xl` (rápido, buena calidad)
- `stable_diffusion_2.1` (legacy)

### Samplers Disponibles

- `k_euler_a` (recomendado, balanceado)
- `k_dpmpp_2m` (alta calidad, más lento)
- `k_dpmpp_sde` (creativo)
- `k_heun` (preciso)

### Consejos de Prompts

**Buenos prompts:**

```
"professional product photography of fresh red roses bouquet, white background, studio lighting, high detail, 8k"

"elegant flower arrangement with pink peonies and white lilies, crystal vase, soft natural light, shallow depth of field"

"scattered assorted flowers on white surface, roses, tulips, gerberas, overhead view, vibrant colors, no container"
```

**Negative prompts útiles:**

```
"wilted, dead, artificial, plastic, blurry, low quality, watermark, text, logo, vase (si no lo quieres)"
```

## 📊 Tiempos Estimados

- **Cola baja** (< 5 jobs): 10-30 segundos
- **Cola media** (5-20 jobs): 30-90 segundos
- **Cola alta** (> 20 jobs): 1-3 minutos

El sistema espera automáticamente y retorna cuando esté listo (timeout 3 minutos).

## 🔧 Troubleshooting

### Error: "Timeout esperando generación"

- La cola está muy llena. Intenta de nuevo en unos minutos.
- Reduce `steps` a 20-25 para generación más rápida.

### Error: "Job falló en AI Horde"

- El worker no pudo completar. Intenta de nuevo.
- Simplifica el prompt o reduce dimensiones.

### Imagen de baja calidad

- Aumenta `steps` a 30-40
- Aumenta `cfg_scale` a 8.0-10.0
- Usa prompts más descriptivos y específicos
- Prueba modelo `FLUX.1-dev` en lugar de SDXL

## 📁 Cache Local

Las imágenes se guardan en:

```
/services/ai-image-service/cache/images/ai-horde-{hash}.png
```

Y se sirven vía frontend en:

```
http://localhost:5173/images/productos/ai-horde-{hash}.png
```

## 🆓 Costo

**100% GRATIS** - Sin límites, sin tarjeta, sin token.

AI Horde es un servicio comunitario. Opcionalmente puedes:

1. Registrarte en https://aihorde.net/register para mejor prioridad
2. Contribuir tu GPU como worker para ganar "kudos"
3. Los kudos te dan prioridad en la cola (pero sigue siendo gratis)

## 🔗 Recursos

- API Docs: https://aihorde.net/api
- Status: https://aihorde.net/
- Discord: https://discord.gg/3DxrhksKzn
- GitHub: https://github.com/Haidra-Org/AI-Horde

---

**Nota:** El servicio depende de workers voluntarios. En horas pico puede haber espera. Para
producción crítica considera registrarte para mejor prioridad (sigue siendo gratis).
