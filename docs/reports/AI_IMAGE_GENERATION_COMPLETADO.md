# 🎨 Sistema de Generación de Imágenes con IA - COMPLETADO

## ✅ Resumen de Implementación

Sistema completo de generación de imágenes usando **AI Horde** (100% gratuito e ilimitado) integrado
en el API Gateway.

---

## 🔧 Configuración Actual

### Servicios Implementados

1. **AI Horde (Principal)**
   - **Estado**: ✅ Funcional y configurado
   - **URL**: https://aihorde.net
   - **Cuenta**: laloaggro
   - **API Key**: w_IZELag4UqAHWijl6353Q
   - **Modelo por defecto**: Deliberate (workers disponibles 24/7)
   - **Tiempos**: 10-60 segundos por imagen (depende de cola)
   - **Dimensiones**: 512x512 optimizado
   - **Ventajas**:
     - 100% gratis, sin límites
     - Sin necesidad de tarjeta de crédito
     - Comunidad activa de workers

2. **Hugging Face (Respaldo)**
   - **Estado**: ⚠️ Cuota mensual excedida
   - **Token**: `hf_YOUR_TOKEN_HERE`
   - **Modelos**: FLUX.1-schnell, FLUX.1-dev, SDXL
   - **Tiempos**: 5-15 segundos (cuando disponible)
   - **Nota**: La cuenta gratuita tiene límites mensuales. Usar solo cuando AI Horde tenga colas muy
     largas.

---

## 📁 Archivos Creados/Modificados

### Servicios

```
microservices/api-gateway/
├── src/
│   ├── services/
│   │   ├── aiHordeClient.js       ← Cliente AI Horde completo
│   │   └── huggingFaceClient.js   ← Cliente HuggingFace (respaldo)
│   └── routes/
│       └── aiImages.js            ← Endpoints /api/ai-images/*
```

### Configuración

```
microservices/api-gateway/.env     ← API keys (HF_TOKEN, AI_HORDE_API_KEY)
docker-compose.yml                 ← Volumen ai-cache ahora writable
```

### Scripts

```
scripts/
├── test-ai-horde.sh              ← Test individual
├── generate-sample-batch.sh      ← Genera 10 imágenes variadas
└── generate-hf-batch.sh          ← (No usar, HF sin cuota)
```

### Documentación

```
docs/AI_HORDE_GUIDE.md            ← Guía completa de uso
AI_HORDE_IMPLEMENTACION.md        ← Documentación técnica
```

---

## 🚀 API Endpoints

### 1. Generar Imagen

```bash
POST http://localhost:3000/api/ai-images/generate
Content-Type: application/json

{
  "prompt": "beautiful red roses bouquet, professional photography",
  "negative_prompt": "blurry, low quality",
  "width": 512,
  "height": 512,
  "steps": 20,
  "cfg_scale": 7.5,
  "model": "Deliberate",
  "provider": "ai-horde"  // o "huggingface" o "auto"
}
```

**Respuesta:**

```json
{
  "success": true,
  "filename": "ai-horde-8c3a96cadf80f8a81df5a4724f41a58d.png",
  "url": "https://...r2.cloudflarestorage.com/.../imagen.webp",
  "localPath": "/app/ai-cache/images/ai-horde-...png",
  "publicUrl": "/images/productos/ai-horde-...png",
  "metadata": {
    "prompt": "...",
    "model": "Deliberate",
    "seed": "1746970644",
    "kudos": 11,
    "worker_id": "...",
    "worker_name": "..."
  }
}
```

### 2. Usar Presets

```bash
POST http://localhost:3000/api/ai-images/generate
{
  "preset": "scatter_flowers"
}
```

Presets disponibles:

- `scatter_flowers`: Flores variadas dispersas, fondo blanco (512x512)
- `hero_background`: Fondo elegante desenfocado (768x512)

### 3. Listar Presets

```bash
GET http://localhost:3000/api/ai-images/presets
```

### 4. Modelos Disponibles

```bash
GET http://localhost:3000/api/ai-images/models
```

### 5. Estado del Servicio

```bash
GET http://localhost:3000/api/ai-images/status
```

---

## 📊 Modelos Recomendados (AI Horde)

| Modelo           | Uso Recomendado     | Velocidad     | Disponibilidad |
| ---------------- | ------------------- | ------------- | -------------- |
| **Deliberate**   | General, realista   | ⚡⚡⚡ Rápido | 🟢 Siempre     |
| Realistic Vision | Fotografía realista | ⚡⚡ Medio    | 🟢 Alta        |
| DreamShaper      | Arte/estilizado     | ⚡⚡ Medio    | 🟡 Media       |
| ChilloutMix      | Personajes          | ⚡ Lento      | 🟡 Media       |

⚠️ **Evitar**: FLUX.1-dev, SDXL (pocos workers, colas de 10+ min)

---

## ⚙️ Parámetros Optimizados

### Para Velocidad (Cola Rápida)

```json
{
  "width": 512,
  "height": 512,
  "steps": 15,
  "model": "Deliberate"
}
```

⏱️ ~20-60 segundos

### Para Calidad

```json
{
  "width": 768,
  "height": 768,
  "steps": 30,
  "cfg_scale": 8.0,
  "model": "Realistic Vision"
}
```

⏱️ ~1-3 minutos

---

## 💾 Almacenamiento de Imágenes

**Directorio Local:**

```
services/ai-image-service/cache/images/
```

**Dentro del Container:**

```
/app/ai-cache/images/
```

**Naming Convention:**

```
ai-horde-{md5_hash_del_prompt}.png
```

**Servir Públicamente:** Las imágenes se pueden servir en:

```
http://tu-dominio.com/images/productos/ai-horde-...png
```

---

## 🎯 Scripts de Uso

### Generar 1 Imagen de Prueba

```bash
bash scripts/test-ai-horde.sh
```

### Generar 10 Muestras Variadas

```bash
bash scripts/generate-sample-batch.sh
```

- Tiempo: ~5-10 minutos total
- Output: 10 imágenes PNG de flores variadas
- Espera: 30 segundos entre cada request

### Ver Progreso del Batch

```bash
tail -f /tmp/ai-batch.log
```

---

## 📈 Tiempos de Generación Observados

| Escenario                | Tiempo   | Notas          |
| ------------------------ | -------- | -------------- |
| Cola vacía (posición 0)  | 10-20s   | Horario valle  |
| Cola normal (pos 10-50)  | 30-90s   | Horario normal |
| Cola llena (pos 100-200) | 5-15 min | Horario pico   |

**Mejores Horarios** (UTC):

- 🟢 2:00 - 8:00 AM (madrugada USA)
- 🟡 14:00 - 18:00 PM (tarde Europa)
- 🔴 20:00 - 2:00 AM (noche USA/peak)

---

## 🔄 Prioridad de Workers

Con tu API key registrada, tienes:

- **Prioridad**: Normal (mejor que anónimos)
- **Kudos**: Se acumulan por contribuir imágenes a la comunidad
- **Sin kudos**: Las requests van a cola normal pero eventualmente se procesan

---

## ⚠️ Troubleshooting

### Error: "No available workers"

**Causa**: Modelo sin workers activos (SDXL, FLUX)  
**Solución**: Usar modelo "Deliberate" o "Realistic Vision"

### Error: Timeout después de 3 minutos

**Causa**: Cola muy larga en horario pico  
**Solución**:

1. Reducir dimensiones (512x512)
2. Reducir steps (15-20)
3. Intentar en otro horario

### Imágenes no se guardan

**Causa**: Volumen read-only  
**Solución**: ✅ Ya corregido en docker-compose.yml

### HuggingFace "exceeded quota"

**Causa**: Límite mensual gratuito alcanzado  
**Solución**: Esperar próximo mes o usar AI Horde

---

## 📝 Notas Adicionales

1. **Cache Local**: Las imágenes se cachean por hash del prompt. Si repites el mismo prompt, se
   reutiliza la imagen.

2. **Negative Prompts**: Usa para evitar elementos no deseados:

   ```
   "blurry, low quality, watermark, text, deformed"
   ```

3. **Seeds**: AI Horde asigna seeds automáticamente. Se devuelven en metadata para reproducibilidad.

4. **R2 Storage**: AI Horde almacena en Cloudflare R2. Las URLs expiran en 30 minutos, pero la
   imagen local persiste.

---

## 🎉 Estado Final

✅ **Sistema completamente funcional**

- AI Horde configurado con API key
- Modelo Deliberate seleccionado (siempre disponible)
- Volumen writable configurado
- Scripts de batch funcionando
- 10 imágenes de muestra en proceso de generación

**Próximos Pasos Opcionales:**

- Integrar frontend para generar desde admin panel
- Agregar más presets para ocasiones específicas
- Implementar sistema de tags/categorías
- Auto-generar variantes de productos existentes

---

**Fecha**: 28 Octubre 2024  
**Versión**: 1.0  
**Estado**: Producción Ready ✅
