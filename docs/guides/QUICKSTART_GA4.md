# 🚀 Quick Start: Activar Google Analytics 4

**Estado Actual**: ✅ Código GA4 ya integrado en `frontend/index.html`  
**Pendiente**: Obtener Measurement ID y reemplazar placeholders

---

## 📝 Paso 1: Crear Propiedad GA4 (5 min)

1. Ve a: **https://analytics.google.com/**
2. Haz clic en **"Administrar"** (⚙️ esquina inferior izquierda)
3. En columna "Propiedad" → **"Crear propiedad"**
4. Completa:
   - **Nombre**: `Flores Victoria - Producción`
   - **Zona horaria**: `(GMT-03:00) Santiago`
   - **Moneda**: `Peso chileno (CLP)`
5. Haz clic en **"Siguiente"** → **"Crear"**
6. Selecciona **"Web"** como plataforma
7. Completa:
   - **URL**: `https://sparkly-naiad-b19f4d.netlify.app/`
   - **Nombre del flujo**: `Sitio Web Principal`
   - ✅ Habilitar **"Medición mejorada"**
8. Haz clic en **"Crear flujo"**

---

## 🔑 Paso 2: Copiar Measurement ID (1 min)

Verás tu **Measurement ID** en formato: `G-XXXXXXXXXX`

**Ejemplo**: `G-12ABC34DEF`

**COPIA este ID** - lo necesitas para el siguiente paso.

---

## ⚙️ Paso 3: Actualizar index.html (2 min)

Abre `frontend/index.html` y busca **dos ocurrencias** de `G-XXXXXXXXXX`:

### Línea ~42: Script async

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**Reemplaza** `G-XXXXXXXXXX` con tu ID real (ej: `G-12ABC34DEF`)

### Línea ~47: gtag config

```html
gtag('config', 'G-XXXXXXXXXX', {
```

**Reemplaza** `G-XXXXXXXXXX` con tu ID real (ej: `G-12ABC34DEF`)

---

## 💾 Paso 4: Commit y Push (2 min)

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
git add frontend/index.html
git commit -m "feat: activar Google Analytics 4 con Measurement ID"
git push origin main
```

Netlify redeployará automáticamente en ~2-3 minutos.

---

## ✅ Paso 5: Verificar Instalación (5 min)

### Método 1: DebugView (Recomendado)

1. Instala extensión:
   [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. Ve a **GA4 → Configurar → DebugView**
3. Abre tu sitio en otra pestaña (con extensión activada)
4. Deberías ver eventos en tiempo real en DebugView

### Método 2: Realtime Report

1. Ve a **GA4 → Informes → Tiempo real**
2. Abre tu sitio en otra pestaña
3. Deberías ver tu visita en ~10-30 segundos

### Método 3: Browser Console

1. Abre tu sitio
2. F12 → Console
3. Escribe: `gtag`
4. Debe retornar: `ƒ gtag(){dataLayer.push(arguments)}`
5. Busca mensajes: `"📊 Web Vital: LCP ..."`

---

## 🎯 Qué Esperar

Una vez activado, GA4 automáticamente rastreará:

✅ **Page Views** - Vistas de páginas  
✅ **Sessions** - Sesiones de usuarios  
✅ **Engagement** - Tiempo en sitio, bounces  
✅ **LCP** - Largest Contentful Paint  
✅ **FID** - First Input Delay  
✅ **CLS** - Cumulative Layout Shift  
✅ **FCP** - First Contentful Paint  
✅ **TTFB** - Time to First Byte

### Métricas en Consola del Navegador

Verás mensajes como:

```
✅ Web Vitals tracking inicializado
📊 Web Vital: LCP 890 good
📊 Web Vital: FID 45 good
📊 Web Vital: CLS 0.012 good
📊 Web Vital: FCP 650 good
📊 Web Vital: TTFB 320 good
```

---

## 🔧 Troubleshooting

### Problema: No veo datos en GA4

**Soluciones**:

1. Espera 24-48 horas (GA4 puede tardar en procesar)
2. Verifica que reemplazaste **ambas** ocurrencias de `G-XXXXXXXXXX`
3. Desactiva bloqueadores de anuncios
4. Prueba en modo incógnito

### Problema: "gtag is not defined"

**Solución**: Limpia caché del navegador (Ctrl+Shift+Del)

### Problema: Web Vitals no aparecen en consola

**Solución**: Espera ~5-10 segundos después de cargar la página

---

## 📚 Documentación Completa

Para configuración avanzada (eventos personalizados, alertas, dashboards):  
Ver: `GOOGLE_ANALYTICS_SETUP.md`

---

**✅ Una vez completado**: Marca tarea "Configurar Google Analytics 4" como completada

**Siguiente paso**: Ejecutar Lighthouse audit en producción
