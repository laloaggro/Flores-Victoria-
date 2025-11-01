# 🎨 Leonardo.ai - Generación de Imágenes GRATIS

## ✅ Ventajas de Leonardo.ai

- **150 créditos DIARIOS gratis** (se resetean cada 24h)
- Cada imagen cuesta ~8-10 créditos
- **~15 imágenes por día GRATIS**
- Calidad profesional con modelo Leonardo Kino XL
- API simple y confiable

## 📋 Cómo obtener tu API Key

### Paso 1: Crear cuenta
1. Ve a https://app.leonardo.ai/
2. Regístrate con Google/Email (GRATIS)
3. Confirma tu email

### Paso 2: Obtener API Key
1. Click en tu avatar (esquina superior derecha)
2. Settings → API Access
3. Click "Create API Key"
4. Copia tu key (empieza con algo como `a1b2c3d4...`)

### Paso 3: Usar el generador
```bash
# Configurar API key
export LEONARDO_API_KEY="tu_key_aqui"

# Generar imágenes
node generate-leonardo.js
```

## 📊 Plan de Generación

Con 27 imágenes pendientes:
- **Día 1**: 15 imágenes ✅
- **Día 2**: 12 imágenes ✅
- **Total**: 2 días

El script usa cache, así que puedes ejecutarlo múltiples veces sin problemas.

## 💡 Ventajas vs otros servicios

| Servicio | Créditos | Costo | Resultado |
|----------|----------|-------|-----------|
| HuggingFace | Mensuales | GRATIS | ✅ 29/56 completadas |
| Replicate | Ninguno | $5-10 | ❌ Requiere pago |
| **Leonardo.ai** | **150/día** | **GRATIS** | **🎯 MEJOR OPCIÓN** |

## 🚀 Características del generador

- ✅ Prompts únicos por producto
- ✅ Doble marca de agua (logo.svg)
- ✅ Cache para no regenerar
- ✅ 10 imágenes por batch
- ✅ Delays automáticos
- ✅ Manejo de errores
- ✅ Progreso detallado

## 📁 Estructura de salida

```
frontend/images/products/
├── generated-hf/          # 29 imágenes (HuggingFace)
├── generated-leonardo/    # 27 imágenes nuevas (Leonardo)
└── watermarked/          # 56 imágenes originales con marca
```

## ⚠️ Notas importantes

1. **Los créditos se resetean cada 24h** - si llegas al límite, espera al día siguiente
2. **El script guarda progreso** - puedes detenerlo y continuar después
3. **Calidad profesional** - Leonardo Kino XL es uno de los mejores modelos
4. **100% gratis** - no necesitas tarjeta de crédito

## 🎯 Siguiente paso

Una vez tengas tu API key, ejecuta:

```bash
export LEONARDO_API_KEY="tu_key_aqui"
node generate-leonardo.js
```

¡Listo! En 2 días tendrás las 56 imágenes únicas con marca de agua 🎉
