# 🎨 Guía de Prompt Engineering para Generación de Imágenes de Flores

## 📚 Técnicas Profesionales para Mejores Resultados

---

## 1. 🏗️ Estructura de Prompts Efectivos

### Fórmula Base (SUBJECT + STYLE + QUALITY + TECHNICAL)

```
[SUJETO PRINCIPAL] + [ESTILO/MOOD] + [CALIDAD] + [DETALLES TÉCNICOS]
```

### Ejemplo Básico vs Profesional

❌ **Básico** (resultados mediocres):
```
"red roses"
```

✅ **Profesional** (resultados excelentes):
```
"professional photography of vibrant red roses in full bloom, elegant arrangement, 
soft natural lighting, shallow depth of field, white background, commercial product 
photography, high detail, 8k resolution, studio quality"
```

---

## 2. 📸 Técnicas Específicas para Flores

### A) Fotografía de Producto (E-commerce)

**Objetivo**: Imágenes limpias para catálogo

```javascript
const productPrompt = {
  prompt: `professional product photography of ${flowerType}, 
    isolated on pure white background, centered composition, 
    vibrant natural colors, studio lighting, high detail, 
    commercial quality, clean aesthetic, sharp focus, 
    professional florist photo, 8k resolution`,
  
  negative_prompt: `vase, pot, container, dark background, shadows, 
    blurry, low quality, watermark, text, people, hands, 
    cluttered, busy composition, artificial lighting artifacts`,
  
  width: 1024,
  height: 1024,
  steps: 30,
  guidance_scale: 8.0
};
```

**Ejemplos Específicos**:

```bash
# Rosas elegantes
"dozen red roses arranged in bouquet, professional florist photography, 
white background, studio lighting, elegant presentation, high detail, 
commercial quality, valentine's day style"

# Tulipanes frescos
"fresh spring tulips in various colors, product photography, 
clean white background, natural vibrant colors, professional 
arrangement, detailed petals, botanical photography style"

# Orquídeas premium
"premium white phalaenopsis orchid, luxury flower photography, 
minimalist white background, elegant exotic flower, high-end 
product shot, professional studio lighting, ultra detailed"
```

---

### B) Fotografía Artística/Decorativa

**Objetivo**: Imágenes emotivas para hero sections y banners

```javascript
const artisticPrompt = {
  prompt: `beautiful ${flowerType} in dreamy garden setting, 
    soft golden hour lighting, bokeh background, romantic mood, 
    pastel color palette, professional nature photography, 
    fine art style, ethereal atmosphere, cinematic composition`,
  
  negative_prompt: `ugly, deformed, artificial, plastic, fake, 
    harsh lighting, oversaturated, cartoon, 3d render, low quality`,
  
  width: 1920,
  height: 1080,
  steps: 40,
  guidance_scale: 7.5
};
```

---

### C) Macro/Close-up (Detalles)

**Objetivo**: Destacar textura y detalles

```javascript
const macroPrompt = {
  prompt: `extreme macro photography of ${flowerName} petals, 
    water droplets on petals, intricate details, shallow depth of field, 
    soft natural lighting, delicate texture, botanical art, 
    professional macro lens, ultra detailed, 8k quality`,
  
  negative_prompt: `blurry, out of focus, low detail, grainy, noisy`,
  
  width: 1024,
  height: 768,
  steps: 35,
  guidance_scale: 8.5
};
```

---

## 3. 🎭 Estilos y Moods Efectivos

### Estilos Visuales

| Estilo | Keywords | Uso Recomendado |
|--------|----------|-----------------|
| **Fotorealista** | `professional photography, photorealistic, high detail, studio quality` | E-commerce, catálogos |
| **Artístico** | `fine art, dreamy, ethereal, painterly, artistic interpretation` | Decoración, hero images |
| **Minimalista** | `minimalist, clean, simple, white background, zen aesthetic` | Diseño moderno, premium |
| **Romántico** | `romantic, soft, pastel colors, gentle, delicate, valentine style` | Bodas, amor, regalos |
| **Vibrante** | `vibrant, colorful, bold, energetic, cheerful, bright` | Celebraciones, alegría |
| **Elegante** | `elegant, sophisticated, luxury, premium, high-end, refined` | Productos premium |

---

### Ambientes y Lighting

```javascript
// Luz natural suave
"soft natural lighting, golden hour, warm tones, gentle shadows"

// Estudio profesional
"studio lighting, softbox lighting, professional setup, clean lighting"

// Dramático
"dramatic lighting, side lighting, high contrast, moody atmosphere"

// Brillante y alegre
"bright natural light, cheerful, sunny day, vibrant illumination"
```

---

## 4. 🎯 Palabras Mágicas (Power Keywords)

### Para Calidad Técnica
```
professional, high-resolution, 8k, ultra detailed, sharp focus, 
commercial quality, award-winning, masterpiece, pristine, flawless
```

### Para Composición
```
centered, symmetrical, balanced composition, rule of thirds, 
professional framing, elegant arrangement, well-composed
```

### Para Texturas
```
detailed texture, intricate details, fine details, delicate petals, 
velvety texture, smooth gradients, natural organic texture
```

### Para Colores
```
vibrant colors, natural color palette, rich hues, saturated, 
pastel tones, warm/cool tones, complementary colors
```

---

## 5. 🚫 Negative Prompts Efectivos

### Template Universal para Flores

```javascript
const negativePrompt = `
  ugly, deformed, disfigured, blurry, low quality, pixelated, grainy,
  watermark, text, signature, username, logo, artificial, plastic, fake,
  cartoon, 3d render, CGI, painting, drawing, illustration,
  dark, gloomy, dead flowers, wilted, brown, dying,
  cluttered, messy, chaotic, busy background,
  people, hands, face, body parts,
  vase (si no quieres), pot, container (si no quieres)
`.trim();
```

### Específicos por Caso

```javascript
// Para fondo blanco limpio
"shadows, dark background, colored background, gradient, texture on background"

// Para realismo
"cartoon, anime, painting, drawing, sketch, artistic rendering, stylized"

// Para productos premium
"cheap, low-end, discount, artificial, fake, plastic flowers"
```

---

## 6. 📐 Dimensiones Optimizadas

### Por Uso

| Uso | Dimensiones | Aspect Ratio | Notas |
|-----|-------------|--------------|-------|
| **Producto cuadrado** | 1024×1024 | 1:1 | Instagram, catálogo |
| **Producto vertical** | 768×1024 | 3:4 | Pinterest, móvil |
| **Hero horizontal** | 1920×1080 | 16:9 | Banners web |
| **Hero panorámico** | 2048×1024 | 2:1 | Headers anchos |
| **Thumbnail** | 512×512 | 1:1 | Previews rápidos |

### Tips de Dimensiones

- **Leonardo.ai**: Múltiplos de 8 (512, 768, 1024, 1920)
- **Más grande ≠ mejor**: 1024×1024 es suficiente para web
- **Aspect ratio natural**: Evita distorsión (1:1, 3:4, 16:9)

---

## 7. ⚙️ Parámetros Técnicos Optimizados

### Guidance Scale (CFG Scale)

```javascript
// Creatividad vs Adherencia al prompt
{
  guidance_scale: 5,   // Más creativo, menos literal
  guidance_scale: 7,   // Balance (RECOMENDADO)
  guidance_scale: 10,  // Muy literal al prompt
  guidance_scale: 15   // Extremadamente literal (puede ser rígido)
}
```

**Recomendación**: 7-8 para flores

---

### Steps (Inference Steps)

```javascript
{
  steps: 20,  // Rápido, calidad decente
  steps: 30,  // Balance (RECOMENDADO)
  steps: 40,  // Alta calidad
  steps: 50+  // Rendimientos decrecientes, no vale la pena
}
```

**Recomendación**: 30 para producción, 20 para testing

---

## 8. 🎨 Prompts por Ocasión

### Rosas para San Valentín

```javascript
{
  prompt: `romantic red roses bouquet wrapped in elegant paper, 
    valentine's day gift, professional florist photography, 
    soft pink background, delicate ribbon, intimate mood, 
    love and romance theme, high quality product shot`,
  
  negative_prompt: `wilted, cheap, plastic, dead, dark, gloomy`,
  width: 1024,
  height: 1024,
  model: 'leonardo-diffusion'
}
```

### Arreglo de Cumpleaños

```javascript
{
  prompt: `cheerful colorful flower arrangement in vase, 
    birthday celebration bouquet, mixed flowers including roses 
    tulips and gerberas, vibrant happy colors, festive mood, 
    professional florist quality, white background`,
  
  negative_prompt: `sad, dull, wilted, cheap, messy`,
  width: 768,
  height: 1024
}
```

### Boda Elegante

```javascript
{
  prompt: `elegant white wedding bouquet, premium white roses and 
    lilies, bridal bouquet, sophisticated arrangement, luxury 
    wedding flowers, soft romantic lighting, pristine white, 
    high-end florist quality, delicate and refined`,
  
  negative_prompt: `colorful, cheap, casual, messy, artificial`,
  width: 768,
  height: 1024
}
```

### Condolencias

```javascript
{
  prompt: `serene white lilies arrangement, sympathy flowers, 
    peaceful elegant composition, respectful tribute, clean 
    white background, professional funeral florist quality, 
    dignified and calming mood`,
  
  negative_prompt: `colorful, cheerful, bright, happy, festive`,
  width: 1024,
  height: 1024
}
```

---

## 9. 🔄 Técnicas Avanzadas

### A) Iteración y Refinamiento

1. **Primera versión** (broad):
   ```
   "red roses bouquet, professional photo"
   ```

2. **Segunda versión** (añadir detalles):
   ```
   "dozen red roses bouquet, white background, studio lighting, professional"
   ```

3. **Versión final** (refinada):
   ```
   "professional product photography of dozen premium red roses in elegant 
   bouquet arrangement, isolated on pure white background, studio softbox 
   lighting, valentine's day style, commercial florist quality, 8k detail"
   ```

---

### B) Variaciones con Seeds

```javascript
// Para obtener variaciones consistentes
const baseConfig = {
  prompt: "beautiful pink roses arrangement...",
  width: 1024,
  height: 1024,
  steps: 30
};

// Leonardo maneja seeds automáticamente
// Para reproducir: usa el seed del metadata devuelto
```

---

### C) Combinar Estilos

```javascript
// Mezclar fotorealismo + artístico
{
  prompt: `photorealistic red roses with painterly bokeh background, 
    fine art meets commercial photography, dreamy yet detailed, 
    professional quality, artistic interpretation of natural beauty`,
  
  guidance_scale: 7.5  // Balance entre creatividad y realismo
}
```

---

## 10. 📋 Templates Listos para Usar

### Template 1: Producto E-commerce

```javascript
const ecommerceTemplate = (flowerType, color) => ({
  prompt: `professional product photography of ${color} ${flowerType}, 
    isolated on pure white background, centered composition, 
    natural vibrant colors, studio lighting, high detail, 
    commercial florist quality, clean aesthetic, sharp focus, 8k`,
  
  negative_prompt: `vase, pot, background elements, shadows, 
    blurry, low quality, watermark, artificial, plastic`,
  
  width: 1024,
  height: 1024,
  steps: 30,
  guidance_scale: 8,
  model: 'leonardo-diffusion'
});

// Uso:
ecommerceTemplate('roses', 'red')
ecommerceTemplate('tulips', 'yellow')
ecommerceTemplate('orchids', 'white')
```

---

### Template 2: Hero Background

```javascript
const heroTemplate = (mood, colors) => ({
  prompt: `dreamy blurred flower background, ${mood} atmosphere, 
    soft focus bokeh, ${colors} color palette, professional 
    photography, elegant aesthetic, high resolution background, 
    minimal composition, ethereal lighting`,
  
  negative_prompt: `sharp focus, busy, cluttered, text, people, 
    low quality, pixelated, artificial`,
  
  width: 1920,
  height: 1080,
  steps: 35,
  guidance_scale: 7,
  model: 'leonardo-creative'
});

// Uso:
heroTemplate('romantic', 'pastel pink and white')
heroTemplate('energetic', 'vibrant orange and yellow')
heroTemplate('serene', 'soft blue and purple')
```

---

### Template 3: Arreglo en Jarrón

```javascript
const arrangementTemplate = (flowers, occasion) => ({
  prompt: `elegant ${flowers} arrangement in clear glass vase, 
    ${occasion} bouquet, professional florist composition, 
    natural window lighting, refined aesthetic, premium quality, 
    detailed flowers and foliage, subtle background, 
    commercial photography style`,
  
  negative_prompt: `cheap vase, plastic, artificial, messy, 
    wilted, dead flowers, dark, gloomy, low quality`,
  
  width: 768,
  height: 1024,
  steps: 30,
  guidance_scale: 7.5,
  model: 'photoreal'
});

// Uso:
arrangementTemplate('mixed spring flowers', 'birthday')
arrangementTemplate('white roses and lilies', 'wedding')
```

---

## 11. 🧪 Experimentación Sistemática

### A) Matriz de Testing

Prueba combinaciones de:

| Variable | Opción 1 | Opción 2 | Opción 3 |
|----------|----------|----------|----------|
| **Lighting** | natural | studio | dramatic |
| **Background** | white | blurred | gradient |
| **Angle** | frontal | 45° | top-down |
| **Mood** | romantic | vibrant | elegant |

### B) A/B Testing

```javascript
// Versión A: Minimalista
const versionA = {
  prompt: "single red rose on white background, minimalist",
  steps: 25
};

// Versión B: Detallado
const versionB = {
  prompt: "single premium red rose, detailed petals with water droplets, \
    white background, studio lighting, professional macro photography",
  steps: 35
};

// Compara resultados y métricas (tiempo, calidad, conversión)
```

---

## 12. 💡 Tips Pro

### DO's ✅

1. **Sé específico**: "dozen red roses" > "flowers"
2. **Usa referencias profesionales**: "like professional florist catalog"
3. **Incluye detalles técnicos**: "8k", "studio lighting", "sharp focus"
4. **Estructura lógica**: Sujeto → Estilo → Calidad → Técnica
5. **Negative prompts**: Siempre incluye lo que NO quieres
6. **Itera**: Primera versión → Analizar → Mejorar → Repetir
7. **Guarda buenos prompts**: Crea biblioteca de templates

### DON'Ts ❌

1. **No seas vago**: "nice flowers" es muy genérico
2. **No sobrecargues**: >200 palabras es contraproducente
3. **No repitas palabras**: "beautiful beautiful red red roses"
4. **No uses términos contradictorios**: "realistic cartoon"
5. **No ignores aspect ratio**: Distorsiona las flores
6. **No uses siempre max steps**: 50+ steps no siempre = mejor
7. **No olvides negative prompt**: Critical para evitar defectos

---

## 13. 🎯 Checklist de Calidad

Antes de generar producción, verifica:

- [ ] Prompt tiene 4 componentes: Sujeto + Estilo + Calidad + Técnica
- [ ] Negative prompt incluye defectos comunes
- [ ] Dimensiones apropiadas para el uso (1024×1024 para producto)
- [ ] Steps entre 25-35 (balance velocidad/calidad)
- [ ] Guidance scale entre 7-8.5
- [ ] Modelo correcto seleccionado (leonardo-diffusion para general)
- [ ] Background especificado (white, blurred, etc)
- [ ] Lighting mencionado (studio, natural, etc)

---

## 14. 📊 Métricas de Éxito

### Evalúa tus imágenes:

**Técnica** (1-10):
- Nitidez y enfoque
- Iluminación
- Composición
- Colores

**Comercial** (1-10):
- Profesionalismo
- Atractivo visual
- Claridad del producto
- Conversión potencial

**Objetivo**: >8/10 en ambas categorías

---

## 15. 🚀 Workflow Recomendado

```bash
# 1. Testing rápido (Leonardo - rápido)
curl -X POST localhost:3000/api/ai-images/generate \
  -d '{"prompt":"test prompt","width":512,"height":512,"steps":20}'

# 2. Refinamiento (ajustar prompt basado en resultado)

# 3. Producción final (alta calidad)
curl -X POST localhost:3000/api/ai-images/generate \
  -d '{"prompt":"final prompt","width":1024,"height":1024,"steps":30}'

# 4. Batch generation para variaciones
# Ver scripts/generate-batch.sh
```

---

## 🎓 Recursos Adicionales

- **Lexica.art**: Explora prompts de la comunidad
- **PromptHero**: Biblioteca de prompts optimizados
- **Leonardo Community**: Ve qué funciona para otros

---

**Última actualización**: 28 Octubre 2024  
**Versión**: 1.0 - Prompt Engineering Guide
