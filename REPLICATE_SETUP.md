# 🚀 Cómo usar el Generador con Replicate

## Paso 1: Obtener API Token de Replicate

1. **Ve a:** https://replicate.com/account/api-tokens
2. **Crea una cuenta** (puedes usar GitHub para login rápido)
3. **Copia tu API token** (empieza con `r8_...`)

## Paso 2: Configurar el Token

Exporta la variable de entorno en tu terminal:

```bash
export REPLICATE_API_TOKEN="r8_tu_token_aqui"
```

O agrégalo a tu archivo `.env`:

```bash
echo "REPLICATE_API_TOKEN=r8_tu_token_aqui" >> .env
```

## Paso 3: Ejecutar el Generador

```bash
chmod +x generate-replicate.js
node generate-replicate.js
```

## 💰 Pricing de Replicate

- **Créditos gratuitos mensuales** (suficientes para ~100-200 imágenes)
- **Precio por imagen:** ~$0.003 USD (muy barato)
- **Sin límites estrictos** como HuggingFace
- **Facturación transparente:** Solo pagas lo que usas

## ✨ Ventajas

- ✅ **Más flexible** que HuggingFace
- ✅ **Mejor calidad** con FLUX Schnell
- ✅ **Más rápido** (4-8 segundos por imagen)
- ✅ **Sin rate limits** agresivos
- ✅ **Créditos gratuitos** cada mes

## 📊 Progreso Actual

- **Con HuggingFace:** 29 productos generados
- **Pendientes:** 27 productos
- **Con Replicate:** Podrás completar los 27 restantes

## 🔄 Proceso

El script genera **5 imágenes a la vez** para evitar problemas. 

Después de cada lote, ejecuta de nuevo:
```bash
node generate-replicate.js
```

El script automáticamente:
- ✅ Salta productos ya generados (usa cache)
- ✅ Aplica marca de agua dual
- ✅ Guarda en `frontend/images/products/generated-replicate/`

## 🎯 Resultado Final

Cuando completes los 27 productos pendientes, tendrás:
- 29 imágenes de HuggingFace
- 27 imágenes de Replicate
- **56 productos con imágenes únicas** generadas con IA ✨
