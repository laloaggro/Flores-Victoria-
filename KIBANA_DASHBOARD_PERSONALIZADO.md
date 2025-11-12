# 🌺 Dashboard Personalizado de Kibana - Flores Victoria

## 📅 Fecha: 9 de Noviembre de 2025

---

## 🎨 PERSONALIZACIÓN COMPLETADA

Se han creado **dashboards y visualizaciones personalizadas** de Kibana utilizando la paleta de
colores oficial del sitio web de Flores Victoria (Jardín Romántico).

---

## 🌸 PALETA DE COLORES APLICADA

### Colores Principales

- **Rosa Frambuesa** (`#c2185b`) - Color primario, botones, CTAs
- **Rosa Brillante** (`#e91e63`) - Estados hover, highlights
- **Magenta Profundo** (`#880e4f`) - Headers, énfasis

### Colores Secundarios

- **Púrpura Real** (`#7b1fa2`) - Acentos premium, badges VIP
- **Púrpura Medio** (`#9c27b0`) - Tags, elementos secundarios

### Acentos

- **Rosa Ballet** (`#f8bbd0`) - Fondos suaves
- **Rosa Muy Claro** (`#fce4ec`) - Backgrounds delicados

### Colores Funcionales

- **Verde Éxito** (`#4caf50`) - Operaciones exitosas
- **Rojo Error** (`#f44336`) - Errores y alertas
- **Naranja Advertencia** (`#ff9800`) - Warnings

---

## 📊 VISUALIZACIONES CREADAS

### 1. 🌸 Requests por Servicio (Donut Chart)

**Tipo:** Gráfico de dona  
**Colores:** Gradiente rosa/magenta/púrpura  
**Propósito:** Mostrar la distribución de requests entre microservicios  
**Características:**

- Paleta personalizada de 6 colores de la marca
- Muestra valores y porcentajes
- Leyenda a la derecha
- Vista tipo donut (con hueco central)

**Campos utilizados:**

- Agregación: Count
- Segmento: `service.keyword` (top 10)

---

### 2. 💐 Errores vs Éxitos (Bar Chart)

**Tipo:** Gráfico de barras apiladas  
**Colores:** Verde (éxito), Naranja (warning), Rojo (error), Rosa/Púrpura  
**Propósito:** Comparar niveles de log por severidad  
**Características:**

- Barras apiladas para ver distribución total
- Código de colores semántico
- Leyenda a la derecha
- Eje Y con contador

**Campos utilizados:**

- Agregación: Count
- Segmento: `level.keyword` (top 5: info, warn, error, debug)

---

### 3. 🌹 Timeline de Actividad (Area Chart)

**Tipo:** Gráfico de área apilada  
**Colores:** Gradiente rosa continuo  
**Propósito:** Ver evolución temporal de la actividad  
**Características:**

- Gradiente suave entre servicios
- Apilado para ver volumen total
- Auto-intervalo temporal
- Últimas 24 horas por defecto
- Agrupa por servicio (top 5)

**Campos utilizados:**

- Agregación: Count
- Eje X: `@timestamp` (date_histogram, auto)
- Agrupación: `service.keyword` (top 5)

---

### 4. 🎯 Top 10 Endpoints Más Usados (Horizontal Bar)

**Tipo:** Barras horizontales  
**Colores:** Rosa frambuesa (`#c2185b`)  
**Propósito:** Identificar endpoints con más tráfico  
**Características:**

- Ordenado por cantidad de requests (desc)
- Fácil lectura de URLs largas
- Sin leyenda (color único)
- Top 10 endpoints

**Campos utilizados:**

- Agregación: Count
- Segmento: `url.keyword` (top 10)

---

### 5. ⚡ Total de Requests (Metric)

**Tipo:** Métrica numérica grande  
**Colores:** Fondo rosa claro (`#fce4ec`)  
**Propósito:** KPI principal - total de requests  
**Características:**

- Fuente grande (60px)
- Fondo color rosa suave
- Etiqueta personalizada: "Total Requests"
- Actualización en tiempo real

**Campos utilizados:**

- Agregación: Count (sin filtros)

---

### 6. 🚨 Errores Totales (Metric)

**Tipo:** Métrica numérica grande  
**Colores:** Fondo rojo (`#f44336`), texto blanco  
**Propósito:** KPI de errores - visibilidad inmediata  
**Características:**

- Fondo rojo intenso para alertar
- Texto blanco para contraste
- Fuente grande (60px)
- Solo cuenta logs de nivel ERROR

**Campos utilizados:**

- Agregación: Count
- Filtro: `level:error`

---

### 7. ⏱️ Tiempo de Respuesta Promedio (Metric)

**Tipo:** Métrica con rangos de color  
**Colores:** Verde (0-100ms), Amarillo (100-500ms), Rojo (>500ms)  
**Propósito:** Performance monitoring  
**Características:**

- Fondo cambia según performance
- 0-100ms: Verde (excelente)
- 100-500ms: Transición (aceptable)
- > 500ms: Rojo (lento)
- Subtexto: "milliseconds"
- Fuente 48px

**Campos utilizados:**

- Agregación: Average de campo `duration`

---

### 8. 📈 Logs por Hora (Line Chart)

**Tipo:** Gráfico de líneas  
**Colores:** Rosa frambuesa (`#c2185b`)  
**Propósito:** Ver patrones horarios de tráfico  
**Características:**

- Línea gruesa (3px)
- Puntos en cada hora
- Interpolación lineal
- Agrupa por hora (últimas 24h)
- Útil para detectar picos de tráfico

**Campos utilizados:**

- Agregación: Count
- Eje X: `@timestamp` (date_histogram, intervalo 1h)

---

## 🎨 DASHBOARD PRINCIPAL

### 🌺 Flores Victoria - Analytics Dashboard

**Configuración:**

- **Rango temporal:** Últimas 24 horas (configurable)
- **Auto-refresh:** 30 segundos
- **Layout:** 3 filas, responsive
- **Total de paneles:** 8 visualizaciones

### Layout del Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                  FILA 1 - KPIs (Altura: 8)              │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│    ⚡    │    🚨    │   ⏱️     │         🌸             │
│  Total   │  Errores │ Response │      Requests         │
│ Requests │ Totales  │   Time   │   por Servicio        │
│          │          │          │      (Donut)          │
│ (12w×8h) │(12w×8h)  │(12w×8h)  │     (12w×8h)          │
└──────────┴──────────┴──────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            FILA 2 - Análisis Temporal (Altura: 12)      │
├─────────────────────────┬───────────────────────────────┤
│         🌹              │            💐                 │
│  Timeline de Actividad  │     Errores vs Éxitos         │
│    (Area Chart)         │      (Bar Chart)              │
│                         │                               │
│      (24w×12h)          │        (24w×12h)              │
└─────────────────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              FILA 3 - Detalles (Altura: 12)             │
├─────────────────────────┬───────────────────────────────┤
│         🎯              │            📈                 │
│  Top 10 Endpoints       │      Logs por Hora            │
│  (Horizontal Bar)       │      (Line Chart)             │
│                         │                               │
│      (24w×12h)          │        (24w×12h)              │
└─────────────────────────┴───────────────────────────────┘
```

**Dimensiones:**

- Ancho total: 48 unidades (Kibana grid)
- Altura total: 32 unidades
- Márgenes: Habilitados
- Sincronización: Cursor y tiempo

---

## 🚀 SCRIPTS CREADOS

### 1. `configure-kibana-custom.sh`

**Propósito:** Crear todas las visualizaciones con colores personalizados  
**Líneas:** 350+  
**Funcionalidades:**

- Espera a que Kibana esté disponible
- Crea 8 visualizaciones vía API
- Usa paleta de colores de Flores Victoria
- Muestra progreso con emojis
- Validación de éxito

**Uso:**

```bash
chmod +x configure-kibana-custom.sh
./configure-kibana-custom.sh
```

### 2. `create-dashboard.sh`

**Propósito:** Crear dashboard profesional con todas las visualizaciones  
**Líneas:** 150+  
**Funcionalidades:**

- Obtiene IDs de visualizaciones automáticamente
- Crea dashboard con layout optimizado
- Configura auto-refresh y rango temporal
- Referencias correctas entre objetos

**Uso:**

```bash
chmod +x create-dashboard.sh
./create-dashboard.sh
```

---

## 📋 IDS DE OBJETOS CREADOS

### Visualizaciones

| Visualización            | ID                                     | Tipo           |
| ------------------------ | -------------------------------------- | -------------- |
| 🌸 Requests por Servicio | `f5547f30-bdd3-11f0-b865-c1fad42913f7` | pie (donut)    |
| 💐 Errores vs Éxitos     | `f5ff3e20-bdd3-11f0-b865-c1fad42913f7` | histogram      |
| 🌹 Timeline de Actividad | `f68bedc0-bdd3-11f0-b865-c1fad42913f7` | area           |
| 🎯 Top 10 Endpoints      | `f724f970-bdd3-11f0-b865-c1fad42913f7` | horizontal_bar |
| ⚡ Total de Requests     | `f7bf3da0-bdd3-11f0-b865-c1fad42913f7` | metric         |
| 🚨 Errores Totales       | `f85d7970-bdd3-11f0-b865-c1fad42913f7` | metric         |
| ⏱️ Tiempo de Respuesta   | `f8f7bda0-bdd3-11f0-b865-c1fad42913f7` | metric         |
| 📈 Logs por Hora         | `f9933a50-bdd3-11f0-b865-c1fad42913f7` | line           |

### Dashboard

| Dashboard                      | ID                                     |
| ------------------------------ | -------------------------------------- |
| 🌺 Flores Victoria - Analytics | `239b1d90-bdd4-11f0-b865-c1fad42913f7` |

---

## 🌐 URLS DE ACCESO

### Kibana

- **Principal:** http://localhost:5601
- **Dashboards:** http://localhost:5601/app/dashboards
- **Dashboard específico:**
  http://localhost:5601/app/dashboards#/view/239b1d90-bdd4-11f0-b865-c1fad42913f7
- **Discover:** http://localhost:5601/app/discover
- **Visualizations:** http://localhost:5601/app/visualize

### Admin Panel

- **ELK Manager:** http://localhost:3010/elk.html
- **Main Panel:** http://localhost:3010

---

## 🎯 CARACTERÍSTICAS DEL DASHBOARD

### ✨ Funcionalidades

1. **Auto-refresh**
   - Intervalo: 30 segundos
   - Configurable desde UI
   - Pausable con botón

2. **Rango Temporal**
   - Por defecto: Últimas 24 horas
   - Quick selectors: 15m, 30m, 1h, 24h, 7d, 30d
   - Selector de fechas personalizado
   - Se guarda con el dashboard (timeRestore: true)

3. **Interactividad**
   - Click en segmentos para filtrar
   - Zoom en gráficos temporales
   - Sincronización de cursor entre gráficos
   - Tooltips informativos

4. **Responsive**
   - Layout adaptativo
   - Funciona en monitores grandes
   - Tablets: vista adaptada
   - Móvil: paneles apilados

5. **Personalización**
   - Modo edit para reordenar paneles
   - Redimensionar visualizaciones
   - Agregar/quitar paneles
   - Duplicar dashboard

---

## 🔧 PERSONALIZACIÓN ADICIONAL

### Cambiar Colores de una Visualización

1. Ir a **Visualize Library**
2. Buscar la visualización (ej: "🌸 Requests por Servicio")
3. Click en **Edit**
4. En panel derecho, buscar **"Color palette"** o **"Palette"**
5. Cambiar colores manualmente o elegir otra paleta
6. **Save**

### Agregar Nueva Visualización al Dashboard

1. Abrir dashboard en modo **Edit**
2. Click en **"Add from library"** (parte superior)
3. Seleccionar visualización
4. Arrastrar y posicionar
5. Redimensionar según necesidad
6. **Save** dashboard

### Cambiar Rango Temporal

**Opción 1: Temporal (solo sesión)**

- Usar selector de tiempo en esquina superior derecha
- Cambios no se guardan

**Opción 2: Permanente**

1. Cambiar rango con selector
2. Click en **Save**
3. Marcar **"Store time with dashboard"**
4. Guardar

### Crear Alertas

1. Ir a **Stack Management** → **Rules and Connectors**
2. Click **Create rule**
3. Seleccionar **"Elasticsearch query"**
4. Configurar:
   - Index: `flores-victoria-logs-*`
   - Query: `level:error`
   - Threshold: count > 10
   - Time window: 5 minutes
5. Agregar acción (Email, Slack, Webhook)
6. **Save**

---

## 📖 GUÍA DE USO

### Para Desarrolladores

1. **Ver logs en tiempo real:**
   - Ir a **Discover**
   - Index pattern: `flores-victoria-logs-*`
   - Agregar filtros por servicio: `service.keyword : "auth-service"`
   - Ver logs stream

2. **Buscar errores específicos:**

   ```
   level:error AND service:"product-service"
   ```

3. **Ver performance de un endpoint:**

   ```
   url:"/api/products" AND duration > 1000
   ```

4. **Filtrar por rango de tiempo:**
   - Usar selector temporal
   - O query: `@timestamp >= now-1h`

### Para Operations

1. **Monitoreo diario:**
   - Abrir dashboard **🌺 Flores Victoria - Analytics**
   - Verificar métricas KPI (fila 1)
   - Revisar errores (🚨 panel)
   - Si errores > umbral → investigar

2. **Análisis de incidentes:**
   - Ir a Timeline (🌹)
   - Identificar hora del incidente
   - Hacer zoom en ese periodo
   - Revisar logs en Discover

3. **Optimización de performance:**
   - Revisar ⏱️ Response Time
   - Si >500ms promedio → revisar endpoints lentos
   - Ir a 🎯 Top Endpoints
   - Identificar endpoints problemáticos

### Para Management

1. **Dashboard ejecutivo:**
   - Ver métricas generales sin detalle técnico
   - ⚡ Total Requests → Tráfico del día
   - 🚨 Errores → Estabilidad del sistema
   - 🌸 Donut → Distribución de carga

2. **Reportes:**
   - Exportar visualizaciones como PNG
   - Click en panel → Share → PNG
   - O exportar CSV desde Discover

---

## 🎨 EJEMPLOS DE QUERIES ÚTILES

### Buscar logs por servicio

```
service.keyword : "auth-service"
```

### Errores de las últimas 4 horas

```
level:error AND @timestamp >= now-4h
```

### Requests lentos (>2 segundos)

```
duration > 2000
```

### Logs que contienen "login"

```
message: *login*
```

### Combinar filtros

```
service:"product-service" AND level:error AND @timestamp >= now-1h
```

### Excluir healthchecks

```
NOT url:"/health"
```

---

## 🔥 TIPS Y MEJORES PRÁCTICAS

### Performance

1. **Limitar rango temporal:**
   - No usar rangos mayores a 7 días sin necesidad
   - Para análisis histórico, usar Discover con filtros

2. **Usar auto-refresh prudentemente:**
   - 30s es bueno para monitoring activo
   - Para análisis tranquilo, pausar refresh

3. **Indices Lifecycle:**
   - Configurar ILM para rotar índices antiguos
   - Mantener solo últimos 30 días en "hot"

### Organización

1. **Tags en dashboards:**
   - Usar tags: `production`, `monitoring`, `flores-victoria`
   - Facilita búsqueda

2. **Naming convention:**
   - Usar emojis para identificación visual rápida
   - Prefijo con nombre del proyecto

3. **Spaces:**
   - Considerar crear Space "Flores Victoria"
   - Aísla dashboards y visualizaciones

### Alerting

1. **Alertas recomendadas:**
   - Error rate > 1% en 5 minutos
   - Response time promedio > 1s en 5 minutos
   - Servicio sin logs en 2 minutos (caído)
   - Disco de Elasticsearch > 80%

2. **Canales de notificación:**
   - Slack para equipo dev
   - Email para stakeholders
   - PagerDuty para on-call

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [x] Kibana accesible en puerto 5601
- [x] Index pattern `flores-victoria-logs-*` creado
- [x] 8 visualizaciones creadas con colores personalizados
- [x] Dashboard principal creado con layout optimizado
- [x] Auto-refresh configurado (30s)
- [x] Rango temporal configurado (24h)
- [x] Referencias entre objetos correctas
- [x] Scripts de automatización funcionando

---

## 🎓 PRÓXIMOS PASOS RECOMENDADOS

### 1. Integrar Logger en Código

```javascript
// En cada microservicio
const logger = require('./logger');

// Reemplazar console.log
logger.info('User login successful', { userId, ip });
logger.error('Payment failed', { orderId, error });
logger.logRequest(req, res, duration);
```

### 2. Crear Dashboards Adicionales

**Dashboard de Negocio:**

- Pedidos por hora
- Revenue tracking
- Productos más vendidos
- Conversión de usuarios

**Dashboard de Performance:**

- P50, P95, P99 latency
- Throughput por servicio
- CPU/Memory usage (si disponible)
- Database query times

**Dashboard de Seguridad:**

- Failed login attempts
- Unusual activity patterns
- API rate limiting hits
- Security events

### 3. Configurar Alertas Críticas

Ver sección "Crear Alertas" arriba.

### 4. Capacitación del Equipo

- Session de 30min mostrando dashboards
- Guía de queries comunes
- Troubleshooting workflow
- Handbook de respuesta a incidentes

---

## 📞 SOPORTE

**Documentación relacionada:**

- IMPLEMENTACION_FINAL_v3.0.md
- ELK_INTEGRATION_GUIDE.md
- ADMIN_PANEL_COMPLETADO_v3.0.md

**Recursos externos:**

- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Kibana Query Language (KQL)](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)
- [Visualize Library](https://www.elastic.co/guide/en/kibana/current/dashboard.html)

---

## 🌺 RESUMEN

Se han creado **dashboards profesionales de Kibana** personalizados con la identidad visual de
**Flores Victoria**:

- ✅ **8 visualizaciones** con paleta de colores rosa/magenta/púrpura
- ✅ **1 dashboard principal** con layout optimizado
- ✅ **2 scripts de automatización** para reproducir configuración
- ✅ **Auto-refresh** y **rango temporal** configurados
- ✅ **Documentación completa** de uso y personalización

**El sistema está listo para monitoreo de producción** 🚀

---

**Última actualización:** 9 de Noviembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ **COMPLETADO**
