# 🔔 Configuración de Uptime Monitoring

Guía para configurar monitoreo de disponibilidad 24/7 para Flores Victoria.

---

## 📋 Índice

1. [Opciones de Servicios](#opciones-de-servicios)
2. [Configuración UptimeRobot (Recomendado)](#uptimerobot-gratis)
3. [Configuración Pingdom](#pingdom)
4. [Configuración StatusCake](#statuscake)
5. [Alertas y Notificaciones](#alertas-y-notificaciones)
6. [Métricas a Monitorear](#métricas-a-monitorear)

---

## Opciones de Servicios

### Comparativa Rápida

| Servicio        | Plan Gratis  | Intervalo | Monitores | Alertas           | Uptime Page |
| --------------- | ------------ | --------- | --------- | ----------------- | ----------- |
| **UptimeRobot** | ✅ Sí        | 5 min     | 50        | Email/SMS/Webhook | ✅ Sí       |
| **Pingdom**     | ❌ Trial 14d | 1 min     | 1         | Email             | ✅ Sí       |
| **StatusCake**  | ✅ Sí        | 5 min     | 10        | Email/SMS         | ✅ Sí       |
| **Uptime.com**  | ✅ Sí        | 1 min     | 1         | Email             | ✅ Sí       |
| **Freshping**   | ✅ Sí        | 1 min     | 50        | Email/Slack       | ✅ Sí       |

**Recomendación**: **UptimeRobot** (gratis, 50 monitores, fiable, fácil de usar)

---

## UptimeRobot (Gratis)

### Paso 1: Crear Cuenta

1. Ve a: **https://uptimerobot.com/**
2. Haz clic en **"Free Sign Up"**
3. Completa el formulario:
   - Email
   - Contraseña
4. **Verifica tu email**

### Paso 2: Crear Monitor HTTP(S)

1. Haz clic en **"Add New Monitor"**
2. Configura:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Flores Victoria - Sitio Principal`
   - **URL**: `https://sparkly-naiad-b19f4d.netlify.app/`
   - **Monitoring Interval**: `5 minutes` (gratis) o `1 minute` (Pro)
   - **Alert Contacts**: Tu email (verifica primero)
3. Haz clic en **"Create Monitor"**

### Paso 3: Monitores Adicionales Recomendados

Crea estos monitores para endpoints críticos:

#### Monitor 2: Robots.txt

- **URL**: `https://sparkly-naiad-b19f4d.netlify.app/robots.txt`
- **Expected Status**: `200`
- **Name**: `Flores Victoria - Robots.txt`

#### Monitor 3: Sitemap.xml

- **URL**: `https://sparkly-naiad-b19f4d.netlify.app/sitemap.xml`
- **Expected Status**: `200`
- **Name**: `Flores Victoria - Sitemap`

#### Monitor 4: Página de Productos

- **URL**: `https://sparkly-naiad-b19f4d.netlify.app/products`
- **Expected Status**: `200`
- **Name**: `Flores Victoria - Productos`

### Paso 4: Configurar Alertas

1. Ve a **"My Settings" → "Alert Contacts"**
2. Haz clic en **"Add Alert Contact"**
3. Configura múltiples canales:

#### Email (Gratis)

- **Type**: `Email`
- **Email**: Tu email principal
- **Alert When**: `Down`, `Up`
- **Threshold**: `1` (alerta desde el primer fallo)

#### Slack (Opcional - Gratis)

- **Type**: `Slack`
- **Webhook URL**: Obtener desde Slack Incoming Webhooks
- **Channel**: `#uptime-alerts`

#### Telegram (Opcional - Gratis)

- **Type**: `Telegram`
- **Chat ID**: Tu chat ID de Telegram
- **Bot Token**: Crear bot con @BotFather

### Paso 5: Crear Status Page Pública (Opcional)

1. Ve a **"Public Status Pages"**
2. Haz clic en **"Create Status Page"**
3. Configura:
   - **Friendly Name**: `Estado de Flores Victoria`
   - **Custom Subdomain**: `flores-victoria` (quedará: flores-victoria.uptimerobot.com)
   - **Monitors to Show**: Selecciona todos tus monitores
   - **Design**: Personaliza colores (rosa/morado para tu marca)
4. **URL Pública**: Comparte con clientes si lo deseas

---

## Pingdom

### Configuración (Trial 14 días, luego pago)

1. **Registro**: https://www.pingdom.com/
2. **Crear Check**:
   - Type: `Uptime Check`
   - URL: `https://sparkly-naiad-b19f4d.netlify.app/`
   - Check Interval: `1 minute`
   - Locations: Selecciona `South America` (más cercano a Chile)
3. **Alertas**:
   - Email inmediato al primer fallo
   - SMS (requiere plan pago)

### Ventajas de Pingdom

- ✅ Intervalo de 1 minuto (vs 5 en gratis)
- ✅ Page Speed monitoring incluido
- ✅ RUM (Real User Monitoring)
- ✅ Reportes detallados de performance

**Costo**: ~$10-15 USD/mes (después de trial)

---

## StatusCake

### Configuración (Gratis)

1. **Registro**: https://www.statuscake.com/
2. **Create Uptime Test**:
   - **Website URL**: `https://sparkly-naiad-b19f4d.netlify.app/`
   - **Test Name**: `Flores Victoria Main`
   - **Test Type**: `HTTP`
   - **Check Rate**: `5 minutes`
   - **Contact Groups**: Tu email
3. **Advanced Settings**:
   - **Enable SSL Alert**: ✅ (alerta si certificado expira)
   - **Follow Redirects**: ✅
   - **Expected Status Code**: `200`

### Ventajas de StatusCake

- ✅ 10 monitores gratis
- ✅ Monitoreo SSL incluido
- ✅ Locations globales
- ✅ API disponible

---

## Alertas y Notificaciones

### Configuración Óptima de Alertas

#### 1. **Email Principal (Crítico)**

- **Destino**: Tu email personal/trabajo
- **Trigger**: Down (sitio caído)
- **Threshold**: 1 fallo
- **Frecuencia**: Inmediata

#### 2. **Email Secundario (Backup)**

- **Destino**: Email alternativo
- **Trigger**: Down por > 5 minutos
- **Previene**: Perder alertas si email principal falla

#### 3. **SMS (Crítico - Opcional)**

- **Destino**: Tu número celular
- **Trigger**: Down por > 2 minutos
- **Costo**: Variable según servicio

#### 4. **Webhook (Integración)**

- **Destino**: Slack, Discord, Microsoft Teams
- **Trigger**: Down, Up, SSL expiring
- **Uso**: Notificar al equipo completo

### Ejemplo de Webhook para Slack

```bash
# Crear Incoming Webhook en Slack
# 1. Ve a: https://api.slack.com/apps
# 2. "Create New App" → "From scratch"
# 3. Activa "Incoming Webhooks"
# 4. "Add New Webhook to Workspace"
# 5. Selecciona canal (ej: #uptime-alerts)
# 6. Copia Webhook URL

# En UptimeRobot:
# Alert Contact → Webhook
# URL: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
# POST Value (JSON):
{
  "text": "*monitorFriendlyName* is *monitorAlertType*!\nReason: *alertDetails*"
}
```

---

## Métricas a Monitorear

### 1. **Uptime Percentage**

- **Objetivo**: **99.9%** (permite ~43 min downtime/mes)
- **Excelente**: 99.95%+
- **Aceptable**: 99.5%+
- **Problema**: < 99%

### 2. **Response Time**

- **Bueno**: < 500ms
- **Aceptable**: < 1000ms
- **Lento**: > 1500ms
- **Problema**: > 3000ms

### 3. **SSL Certificate Validity**

- **Alerta**: Si expira en < 30 días
- **Crítico**: Si expira en < 7 días
- **Netlify maneja renovación automática** (Let's Encrypt)

### 4. **HTTP Status Codes**

- **200 OK**: ✅ Esperado
- **301/302**: ⚠️ Redirección (verificar si es intencional)
- **404 Not Found**: ❌ Problema
- **500 Server Error**: 🔴 Crítico
- **502/503**: 🔴 Servicio caído

---

## Dashboard Recomendado

### Vista Consolidada (UptimeRobot)

```
┌─────────────────────────────────────────────────┐
│  Flores Victoria - Uptime Dashboard             │
├─────────────────────────────────────────────────┤
│  Monitor              Status    Uptime   Resp   │
├─────────────────────────────────────────────────┤
│  🟢 Sitio Principal    UP      99.98%   245ms   │
│  🟢 Robots.txt         UP      99.99%   102ms   │
│  🟢 Sitemap.xml        UP      99.97%   158ms   │
│  🟢 Productos          UP      99.95%   312ms   │
└─────────────────────────────────────────────────┘
```

---

## Acciones ante Caídas

### Procedimiento de Respuesta

#### Alerta: Sitio Caído

**1. Verificar Alerta** (1 min)

- ¿Es una sola location o múltiples?
- ¿Qué código HTTP retorna?

**2. Confirmar Problema** (2 min)

```bash
# Verificar desde terminal
curl -I https://sparkly-naiad-b19f4d.netlify.app/

# Verificar DNS
nslookup sparkly-naiad-b19f4d.netlify.app

# Verificar desde otro location
# Usar: https://www.isitdownrightnow.com/
```

**3. Revisar Netlify Status** (1 min)

- Ve a: https://www.netlifystatus.com/
- Confirma si hay incidents reportados

**4. Revisar Deploy Logs** (3 min)

- Netlify Dashboard → Deploys
- Revisar último deploy por errores

**5. Rollback si Necesario** (5 min)

```bash
# En Netlify UI:
# Deploys → Deploy anterior que funcionaba → "Publish deploy"
```

**6. Comunicar** (si > 10 min down)

- Publicar en redes sociales
- Avisar a clientes activos
- Actualizar status page

---

## Reportes Semanales

### Configurar Email Semanal (UptimeRobot Pro)

- **Día**: Lunes a las 9:00 AM
- **Contenido**:
  - Uptime % de cada monitor
  - Total downtime
  - Incidents reportados
  - Response time promedio

### KPIs a Revisar

**Semanalmente**:

- Uptime % (objetivo: 100%)
- Promedio response time (objetivo: < 500ms)
- Incidents count (objetivo: 0)

**Mensualmente**:

- Tendencia de performance
- Comparación mes anterior
- Identificar patrones (días/horas con más problemas)

---

## Integraciones Avanzadas

### Integrar con Google Analytics

Agregar evento personalizado cuando el sitio vuelve a estar UP:

```javascript
// En web-vitals.js o script separado
if (typeof gtag !== 'undefined') {
  // Detectar si el sitio estuvo caído previamente
  const wasDown = localStorage.getItem('site_was_down');

  if (wasDown === 'true') {
    gtag('event', 'site_back_online', {
      event_category: 'Uptime',
      event_label: 'Recovery',
      value: Date.now(),
    });

    localStorage.removeItem('site_was_down');
  }
}
```

### Integrar con Netlify Functions

Crear función serverless para enviar notificaciones personalizadas:

```javascript
// netlify/functions/uptime-webhook.js
exports.handler = async (event) => {
  const { monitorURL, monitorFriendlyName, alertType } = JSON.parse(event.body);

  // Enviar notificación personalizada
  // (Email, Slack, etc.)

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Notification sent' }),
  };
};
```

---

## Checklist de Implementación

- [ ] Cuenta creada en UptimeRobot (o alternativa)
- [ ] Monitor creado para sitio principal
- [ ] Monitores adicionales para páginas clave
- [ ] Email de alertas configurado y verificado
- [ ] Alert threshold configurado (1 fallo = alerta)
- [ ] Status page pública creada (opcional)
- [ ] Webhook a Slack/Discord configurado (opcional)
- [ ] Monitoreo SSL habilitado
- [ ] Reportes semanales configurados
- [ ] Procedimiento de respuesta documentado

---

## 🎯 Objetivos de Uptime

### Primer Mes

- ✅ 100% uptime (sin caídas)
- ✅ Response time promedio < 500ms
- ✅ 0 alerts de SSL

### Trimestral

- ✅ 99.99% uptime (< 5 min downtime total)
- ✅ Response time < 400ms
- ✅ Integración con sistema de alertas completo

---

## Recursos Adicionales

- **UptimeRobot Docs**: https://uptimerobot.com/api/
- **Netlify Status**: https://www.netlifystatus.com/
- **Downdetector**: https://downdetector.com/ (verificar status de servicios)

---

**✅ Siguiente Paso**: Una vez configurado, documenta tu procedimiento de respuesta ante incidents y
compártelo con tu equipo.
