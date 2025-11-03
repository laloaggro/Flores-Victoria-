# 📊 Configuración de Google Analytics 4 + Web Vitals

Guía completa para configurar Google Analytics 4 con tracking de Core Web Vitals en Flores Victoria.

---

## 📋 Índice

1. [Crear Propiedad GA4](#1-crear-propiedad-ga4)
2. [Obtener Measurement ID](#2-obtener-measurement-id)
3. [Implementar Código de Tracking](#3-implementar-código-de-tracking)
4. [Configurar Eventos de Core Web Vitals](#4-configurar-eventos-de-core-web-vitals)
5. [Verificar Instalación](#5-verificar-instalación)
6. [Dashboards y Reportes](#6-dashboards-y-reportes)

---

## 1. Crear Propiedad GA4

### Paso 1: Acceder a Google Analytics

1. Ve a: **https://analytics.google.com/**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Administrar"** (ícono de engranaje ⚙️ en la esquina inferior izquierda)

### Paso 2: Crear Nueva Propiedad

1. En la columna **"Propiedad"**, haz clic en **"Crear propiedad"**
2. Completa los datos:
   - **Nombre de la propiedad**: `Flores Victoria - Producción`
   - **Zona horaria**: `(GMT-03:00) Santiago`
   - **Moneda**: `Peso chileno (CLP)`
3. Haz clic en **"Siguiente"**

### Paso 3: Información del Negocio

1. **Categoría del sector**: `Comercio minorista` o `Flores y regalos`
2. **Tamaño de la empresa**: Selecciona el apropiado
3. **Objetivos comerciales**:
   - ✅ Generar clientes potenciales
   - ✅ Aumentar las ventas online
4. Haz clic en **"Crear"**
5. Acepta los **Términos de Servicio**

---

## 2. Obtener Measurement ID

### Paso 1: Configurar Flujo de Datos

1. Selecciona **"Web"** como plataforma
2. Completa:
   - **URL del sitio web**: `https://sparkly-naiad-b19f4d.netlify.app/`
   - **Nombre del flujo**: `Sitio Web Principal`
   - ✅ **Habilitar "Medición mejorada"** (analítica automática de clics, desplazamiento, etc.)
3. Haz clic en **"Crear flujo"**

### Paso 2: Copiar Measurement ID

1. Verás tu **Measurement ID**: `G-XXXXXXXXXX`
2. **COPIA este ID** - lo necesitarás en el siguiente paso
3. Encontrarás también el **código de etiqueta global (gtag.js)**

---

## 3. Implementar Código de Tracking

### Opción A: Implementación Manual (Recomendada)

Agrega el siguiente código en `frontend/index.html` **ANTES del cierre de `</head>`**:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX', {
    send_page_view: true,
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });
</script>
```

**⚠️ IMPORTANTE**: Reemplaza `G-XXXXXXXXXX` con tu Measurement ID real.

### Opción B: Google Tag Manager (Avanzado)

Si prefieres usar GTM para gestionar múltiples tags:

1. Crea cuenta en https://tagmanager.google.com/
2. Crea un contenedor para tu sitio
3. Instala el código de GTM en `<head>` y `<body>`
4. Agrega tag de GA4 desde GTM

---

## 4. Configurar Eventos de Core Web Vitals

### Paso 1: Incluir Script de Web Vitals

El archivo `frontend/public/web-vitals.js` ya está creado. Agrégalo a `index.html` **ANTES del
cierre de `</body>`**:

```html
<!-- Web Vitals Tracking -->
<script src="/web-vitals.js" defer></script>
</body>
</html>
```

### Paso 2: Métricas que se Reportarán

El script automáticamente enviará a GA4:

| Métrica  | Nombre                   | Descripción                              | Umbral Bueno |
| -------- | ------------------------ | ---------------------------------------- | ------------ |
| **LCP**  | Largest Contentful Paint | Tiempo hasta elemento más grande visible | < 2.5s       |
| **FID**  | First Input Delay        | Tiempo hasta primera interacción         | < 100ms      |
| **CLS**  | Cumulative Layout Shift  | Estabilidad visual (layout shifts)       | < 0.1        |
| **FCP**  | First Contentful Paint   | Tiempo hasta primer contenido pintado    | < 1.8s       |
| **TTFB** | Time to First Byte       | Tiempo de respuesta del servidor         | < 800ms      |

### Paso 3: Clasificación de Métricas

Cada métrica se clasifica automáticamente:

- 🟢 **good**: Dentro del umbral recomendado
- 🟡 **needs-improvement**: Necesita optimización
- 🔴 **poor**: Requiere atención urgente

---

## 5. Verificar Instalación

### Método 1: Google Analytics DebugView (Recomendado)

1. Ve a **GA4 → Configurar → DebugView**
2. Abre tu sitio en Chrome con extensión **Google Analytics Debugger**:
   - Instalar:
     https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna
3. Navega por tu sitio
4. Verás eventos en tiempo real en DebugView

### Método 2: Chrome DevTools

```javascript
// Abrir consola del navegador (F12)
// Verificar que gtag está cargado:
gtag('event', 'test', {
  event_category: 'Test',
  event_label: 'Manual Test',
});
// Deberías ver el evento enviado en Network tab
```

### Método 3: Realtime Report

1. Ve a **GA4 → Informes → Tiempo real**
2. Abre tu sitio en otra pestaña
3. Deberías ver tu visita en el reporte de tiempo real (puede tomar 10-30 segundos)

### Checklist de Verificación

✅ Measurement ID correcto en el código  
✅ Script gtag.js carga sin errores (DevTools Network)  
✅ No hay errores de CORS o CSP  
✅ Eventos aparecen en DebugView o Realtime  
✅ Web Vitals se reportan (ver consola del navegador)

---

## 6. Dashboards y Reportes

### Crear Dashboard de Web Vitals

1. Ve a **GA4 → Explorar → Crear exploración en blanco**
2. Configura:
   - **Nombre**: `Core Web Vitals - Flores Victoria`
   - **Dimensiones**:
     - `Nombre del evento`
     - `Etiqueta del evento` (metric_rating)
   - **Métricas**:
     - `Recuento de eventos`
     - `Valor del evento`
3. **Filtros**:
   - Nombre del evento contiene: `LCP`, `FID`, `CLS`, `FCP`, `TTFB`

### Métricas Recomendadas a Monitorear

#### 1. **Rendimiento (Performance)**

- Tiempo de carga promedio (LCP)
- Interactividad (FID)
- Estabilidad visual (CLS)

#### 2. **Audiencia**

- Usuarios activos diarios/mensuales
- Nuevos vs recurrentes
- Dispositivos (móvil vs escritorio)
- Ubicación geográfica (Chile principalmente)

#### 3. **Adquisición**

- Fuentes de tráfico (orgánico, directo, redes sociales)
- Páginas de aterrizaje
- Términos de búsqueda (si está configurado Search Console)

#### 4. **Comportamiento**

- Páginas más vistas
- Flujo de navegación
- Eventos personalizados (clics en productos, agregar al carrito)

#### 5. **Conversiones** (si configuras e-commerce)

- Productos más vendidos
- Tasa de conversión
- Valor promedio del pedido
- Embudos de compra

---

## 📈 Eventos Personalizados Adicionales (Opcional)

### Tracking de E-commerce Básico

Agrega estos eventos para rastrear acciones de usuarios:

```javascript
// Cuando un usuario ve un producto
gtag('event', 'view_item', {
  currency: 'CLP',
  value: 25990,
  items: [{
    item_id: 'ROSE-001',
    item_name: 'Ramo de Rosas Rojas',
    item_category: 'Ramos',
    price: 25990,
    quantity: 1
  }]
});

// Cuando agregan al carrito
gtag('event', 'add_to_cart', {
  currency: 'CLP',
  value: 25990,
  items: [...]
});

// Cuando compran
gtag('event', 'purchase', {
  transaction_id: 'ORDER-12345',
  currency: 'CLP',
  value: 45990,
  shipping: 5000,
  items: [...]
});
```

---

## 🔔 Configurar Alertas

### Alertas Recomendadas

1. **Caída de Tráfico**
   - Si el tráfico cae más del 30% en 24h
   - Notificación por email

2. **Aumento de Errores**
   - Si eventos de error superan 5% del total
   - Alerta inmediata

3. **Core Web Vitals Degradadas**
   - Si LCP > 4s en más del 25% de sesiones
   - Revisión semanal

### Configurar en GA4

1. Ve a **Administrar → Alertas personalizadas**
2. Haz clic en **"Nueva alerta"**
3. Configura condiciones y notificaciones por email

---

## 🎯 Objetivos de Medición

### Objetivos Iniciales (Primeras 4 Semanas)

- ✅ Recopilar al menos **1,000 sesiones** de usuarios reales
- ✅ **LCP promedio < 2.5s** en el 75% de visitas
- ✅ **CLS < 0.1** en el 75% de visitas
- ✅ Identificar las **3 páginas más populares**
- ✅ Determinar principales fuentes de tráfico

### Objetivos a Mediano Plazo (3 Meses)

- Aumentar usuarios mensuales en **20%**
- Reducir tasa de rebote bajo **50%**
- Mejorar tiempo de sesión promedio a **> 2 minutos**
- Configurar embudos de conversión completos

---

## 🔗 Recursos Adicionales

- **GA4 Documentación Oficial**: https://support.google.com/analytics/answer/9304153
- **Web Vitals de Google**: https://web.dev/vitals/
- **GA4 Academy (Curso Gratis)**: https://analytics.google.com/analytics/academy/
- **Chrome User Experience Report**:
  https://developers.google.com/web/tools/chrome-user-experience-report

---

## ❓ Troubleshooting

### Problema: No veo datos en GA4

**Soluciones**:

1. Espera 24-48 horas (GA4 puede tardar en procesar datos)
2. Verifica Measurement ID correcto
3. Revisa bloqueadores de anuncios (desactívalos para testing)
4. Usa modo incógnito para testing

### Problema: Web Vitals no se reportan

**Soluciones**:

1. Verifica que `gtag` está definido antes de cargar `web-vitals.js`
2. Abre consola y busca mensajes de error
3. Confirma que el navegador soporta PerformanceObserver

### Problema: Eventos duplicados

**Soluciones**:

1. Verifica que solo tienes **un** código de GA4 en tu sitio
2. Revisa si hay conflicto con Google Tag Manager
3. Limpia caché del navegador

---

## 📝 Checklist Final

Antes de considerar la implementación completa:

- [ ] Measurement ID configurado en `index.html`
- [ ] Script `gtag.js` carga correctamente
- [ ] Script `web-vitals.js` incluido antes de `</body>`
- [ ] Eventos de Web Vitals aparecen en consola del navegador
- [ ] Datos visibles en GA4 Realtime (después de 10-30 seg)
- [ ] DebugView muestra eventos correctamente
- [ ] Alertas configuradas para métricas críticas
- [ ] Dashboard de Web Vitals creado

---

**✅ Implementación Completada**: Una vez verificado todo, tendrás visibilidad completa del
rendimiento y comportamiento de usuarios en Flores Victoria.

**Próximo Paso**: Configurar [Uptime Monitoring](./UPTIME_MONITORING_SETUP.md) para alertas de
disponibilidad.
