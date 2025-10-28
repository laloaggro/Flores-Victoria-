# 🎨 Alternativas Gratuitas para Generación de Imágenes con IA

## 📊 Comparativa Completa (Actualizado Octubre 2024)

### 1. **AI Horde** ⭐ (YA IMPLEMENTADO)
- **URL**: https://aihorde.net
- **Estado**: ✅ Activo en el proyecto
- **Costo**: 100% gratis, ilimitado
- **Registro**: Opcional (mejora prioridad)
- **Límites**: Ninguno
- **Velocidad**: 10-60s (depende de cola)
- **Modelos**: SDXL, Deliberate, Realistic Vision, FLUX
- **API**: Sí, REST API completa
- **Ventajas**: Completamente gratis, sin tarjeta
- **Desventajas**: Tiempos de cola variables

---

### 2. **Leonardo.ai** 🌟 RECOMENDADO
- **URL**: https://leonardo.ai
- **Costo**: FREE TIER generoso
- **Créditos**: 150 tokens/día GRATIS
- **Registro**: Email (sin tarjeta)
- **Límites**: ~30-60 imágenes/día
- **Velocidad**: ⚡⚡⚡ 3-8 segundos
- **Modelos**: Leonardo Diffusion, SDXL, custom models
- **Calidad**: ⭐⭐⭐⭐⭐ Excelente
- **API**: ✅ Sí (150 créditos incluidos en free)
- **Ventajas**: 
  - Muy rápido
  - Calidad superior
  - Interfaz excelente
  - Modelos exclusivos optimizados
- **Desventajas**: Límite diario (pero suficiente)

**Ejemplo API Leonardo:**
```bash
curl -X POST "https://cloud.leonardo.ai/api/rest/v1/generations" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "beautiful red roses bouquet",
    "width": 512,
    "height": 512,
    "num_images": 1,
    "modelId": "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3"
  }'
```

---

### 3. **Getimg.ai** 🚀
- **URL**: https://getimg.ai
- **Costo**: FREE TIER
- **Créditos**: 100 créditos/mes gratis
- **Registro**: Email
- **Límites**: ~100 imágenes/mes
- **Velocidad**: ⚡⚡⚡ 2-5 segundos
- **Modelos**: 60+ modelos (SDXL, FLUX, etc)
- **API**: ✅ Excelente documentación
- **Ventajas**:
  - Muy rápido
  - Muchos modelos
  - API simple
- **Desventajas**: Límite mensual

**Ejemplo API Getimg:**
```bash
curl -X POST "https://api.getimg.ai/v1/stable-diffusion/text-to-image" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "professional flower photography",
    "width": 512,
    "height": 512,
    "steps": 25
  }'
```

---

### 4. **Segmind** 💎
- **URL**: https://www.segmind.com
- **Costo**: FREE TIER
- **Créditos**: $5 gratis iniciales
- **Registro**: Email
- **Velocidad**: ⚡⚡⚡ 1-3 segundos (serverless)
- **Modelos**: SDXL, FLUX, Stable Diffusion
- **API**: ✅ Muy rápida (serverless)
- **Ventajas**:
  - Extremadamente rápido
  - Infraestructura serverless
  - Pay-as-you-go después
- **Desventajas**: Créditos limitados

---

### 5. **Stability.ai** (DreamStudio)
- **URL**: https://dreamstudio.ai
- **Costo**: FREE TIER
- **Créditos**: 25 créditos gratis
- **Registro**: Email
- **Límites**: ~25 imágenes iniciales
- **Velocidad**: ⚡⚡ 5-10 segundos
- **Modelos**: SDXL Turbo, SD 3.0
- **API**: ✅ Oficial Stable Diffusion
- **Ventajas**: Calidad oficial SDXL
- **Desventajas**: Pocos créditos gratis

---

### 6. **Clipdrop (Stability AI)** 
- **URL**: https://clipdrop.co
- **Costo**: FREE TIER
- **Límites**: Watermark en free tier
- **Registro**: Email
- **Velocidad**: ⚡⚡⚡ Rápido
- **API**: ✅ Sí
- **Ventajas**: Múltiples herramientas (upscale, remove bg, etc)
- **Desventajas**: Marca de agua en plan gratis

---

### 7. **Replicate** 🔧
- **URL**: https://replicate.com
- **Costo**: FREE TIER pequeño
- **Créditos**: $0.10 gratis
- **Registro**: GitHub/Email
- **Velocidad**: ⚡⚡ Variable
- **Modelos**: FLUX, SDXL, muchos custom
- **API**: ✅ Excelente
- **Ventajas**: 
  - Muchos modelos community
  - Buena API
  - Serverless
- **Desventajas**: Muy pocos créditos gratis

---

### 8. **Craiyon** (ex DALL-E mini)
- **URL**: https://www.craiyon.com
- **Costo**: 100% gratis con ads
- **Registro**: No requerido
- **Límites**: Ilimitado (con ads)
- **Velocidad**: ⚡ 60-90 segundos
- **API**: ❌ No oficial
- **Ventajas**: Completamente gratis
- **Desventajas**: Calidad inferior, lento

---

### 9. **Ideogram** 🆕
- **URL**: https://ideogram.ai
- **Costo**: FREE TIER
- **Límites**: 25 prompts/día gratis
- **Registro**: Email/Google
- **Velocidad**: ⚡⚡⚡ Rápido
- **API**: 🔄 En desarrollo
- **Ventajas**: 
  - Excelente con texto en imágenes
  - Calidad alta
- **Desventajas**: Sin API aún

---

### 10. **Prodia** 🎯
- **URL**: https://prodia.com
- **Costo**: 100% gratis
- **Registro**: No requerido
- **Límites**: Rate limit suave
- **Velocidad**: ⚡⚡ 10-30 segundos
- **Modelos**: SDXL, SD 1.5, varios custom
- **API**: ✅ Sí (no oficial pero funcional)
- **Ventajas**: Gratis ilimitado
- **Desventajas**: Sin soporte oficial

---

## 🏆 Ranking por Caso de Uso

### Para Producción (Mejor Balance)
1. **Leonardo.ai** - 150 créditos/día, muy rápido
2. **Getimg.ai** - 100 imágenes/mes, API excelente
3. **AI Horde** - Ilimitado pero más lento

### Para Volumen Alto (Gratis Ilimitado)
1. **AI Horde** ⭐ (ya implementado)
2. **Prodia** - Sin límites pero sin soporte
3. **Craiyon** - Con ads

### Para Mejor Calidad
1. **Leonardo.ai** - Modelos optimizados
2. **Stability.ai** - SDXL oficial
3. **Getimg.ai** - 60+ modelos

### Para Velocidad Máxima
1. **Segmind** - 1-3 seg (serverless)
2. **Leonardo.ai** - 3-8 seg
3. **Getimg.ai** - 2-5 seg

---

## 💡 Recomendación de Implementación

### Estrategia Multi-Provider (Recomendado)

```javascript
const providers = {
  primary: 'leonardo',      // 150 imgs/día, rápido
  secondary: 'getimg',      // 100 imgs/mes backup
  fallback: 'ai-horde',     // Ilimitado cuando otros se agoten
  emergency: 'prodia'       // Último recurso
};
```

### Ejemplo de Cliente Multi-Provider

```javascript
class MultiProviderAI {
  constructor() {
    this.leonardo = new LeonardoClient(process.env.LEONARDO_API_KEY);
    this.getimg = new GetimgClient(process.env.GETIMG_API_KEY);
    this.aiHorde = new AIHordeClient(process.env.AI_HORDE_KEY);
  }

  async generateImage(prompt, options = {}) {
    // 1. Intentar Leonardo (rápido, límite diario)
    try {
      return await this.leonardo.generate(prompt, options);
    } catch (error) {
      if (error.code === 'QUOTA_EXCEEDED') {
        console.log('Leonardo quota reached, trying Getimg...');
      }
    }

    // 2. Intentar Getimg (backup)
    try {
      return await this.getimg.generate(prompt, options);
    } catch (error) {
      console.log('Getimg failed, using AI Horde...');
    }

    // 3. AI Horde (siempre disponible)
    return await this.aiHorde.generate(prompt, options);
  }
}
```

---

## 📋 Tabla Comparativa Rápida

| Servicio | Gratis | Límite | Velocidad | API | Calidad | Recomendado |
|----------|--------|--------|-----------|-----|---------|-------------|
| **Leonardo.ai** | ✅ | 150/día | ⚡⚡⚡ | ✅ | ⭐⭐⭐⭐⭐ | 🥇 Sí |
| **Getimg.ai** | ✅ | 100/mes | ⚡⚡⚡ | ✅ | ⭐⭐⭐⭐ | 🥈 Sí |
| **AI Horde** | ✅ | Ilimitado | ⚡⚡ | ✅ | ⭐⭐⭐ | 🥉 Implementado |
| **Segmind** | ⚠️ | $5 init | ⚡⚡⚡ | ✅ | ⭐⭐⭐⭐ | Para testing |
| **Stability** | ⚠️ | 25 init | ⚡⚡ | ✅ | ⭐⭐⭐⭐⭐ | Limitado |
| **Prodia** | ✅ | Soft limit | ⚡⚡ | ⚠️ | ⭐⭐⭐ | Backup |
| **Replicate** | ⚠️ | $0.10 | ⚡⚡ | ✅ | ⭐⭐⭐⭐ | Muy limitado |
| **Craiyon** | ✅ | Ilimitado | ⚡ | ❌ | ⭐⭐ | No para API |

---

## 🚀 Siguiente Paso Recomendado

### Opción 1: Agregar Leonardo.ai (MEJOR)
- Registrarse en https://leonardo.ai
- Obtener API key
- 150 generaciones/día gratis
- Velocidad 3-8 segundos
- Calidad excelente

### Opción 2: Agregar Getimg.ai
- Registrarse en https://getimg.ai
- 100 créditos/mes
- API simple
- 60+ modelos

### Opción 3: Sistema Híbrido
- Leonardo para producción diaria (rápido)
- AI Horde para volumen alto (cuando se acaben créditos)
- Mejor de ambos mundos

---

## 💰 Análisis de Costos

### Plan Gratuito Combinado (Sin Pagar Nada)
```
Leonardo.ai:  150 imágenes/día  = 4,500/mes
Getimg.ai:    100 imágenes/mes  = 100/mes
AI Horde:     Ilimitado         = ∞
-------------------------------------------------
TOTAL:        ~4,600 imágenes/mes GRATIS
```

### Si Decides Pagar Después
```
Leonardo.ai:  $10/mes  = 8,500 créditos (~850 imgs)
Getimg.ai:    $12/mes  = 3,000 imágenes
Segmind:      Pay-as-you-go: $0.003-0.01/img
```

---

## 🎯 Conclusión

**Para tu proyecto Flores Victoria:**

1. **Implementar Leonardo.ai** como primary (150/día gratis)
2. **Mantener AI Horde** como fallback ilimitado
3. **Opcional: Getimg.ai** para backup (100/mes)

Esto te da:
- ✅ ~4,500+ imágenes/mes GRATIS
- ✅ Velocidad promedio 3-10 segundos
- ✅ Alta calidad
- ✅ Backup ilimitado con AI Horde
- ✅ Sin necesidad de tarjeta de crédito

---

**Última actualización**: 28 Octubre 2024  
**Siguiente revisión**: Verificar nuevos servicios en 3 meses
