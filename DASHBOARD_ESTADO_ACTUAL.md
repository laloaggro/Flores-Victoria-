# 🌺 Dashboard Flores Victoria - Estado Actual

## 📊 Dashboard Principal

**Título:** 🌺 Flores Victoria - Analytics Dashboard  
**ID:** `5013bd40-bdd5-11f0-b865-c1fad42913f7`  
**URL:** http://localhost:5601/app/dashboards#/view/5013bd40-bdd5-11f0-b865-c1fad42913f7  
**Estado:** ✅ Completamente funcional  
**Última actualización:** 10 de Noviembre de 2025, 01:33 UTC

---

## 🎨 Configuración Actual

### Layout del Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│              🌺 Flores Victoria - Analytics Dashboard            │
│                     Últimas 24 horas • Auto-refresh: 30s         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FILA 1: Métricas KPI (4 paneles de 12×8 cada uno)             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │      ⚡     │     🚨      │     ⏱️      │     🌸      │     │
│  │             │             │             │             │     │
│  │   TOTAL     │   ERRORES   │   TIEMPO    │  REQUESTS   │     │
│  │  REQUESTS   │   TOTALES   │  RESPUESTA  │     POR     │     │
│  │             │             │             │  SERVICIO   │     │
│  │   [número]  │  [número]   │   [ms]      │  (Donut)    │     │
│  │             │             │             │             │     │
│  │  Rosa claro │  Rojo       │  Verde/     │  Gradiente  │     │
│  │  (#fce4ec)  │ (#f44336)   │  Amarillo/  │  rosa/      │     │
│  │             │             │  Rojo       │  magenta    │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
│                                                                  │
│  FILA 2: Análisis Temporal (2 paneles de 24×12)                │
│  ┌──────────────────────────┬──────────────────────────┐       │
│  │          🌹              │           💐             │       │
│  │   TIMELINE ACTIVIDAD     │   ERRORES VS ÉXITOS      │       │
│  │   (Area Chart)           │   (Bar Chart)            │       │
│  │                          │                          │       │
│  │   • Apilado por servicio │   • Barras apiladas     │       │
│  │   • Gradiente rosa       │   • Verde: INFO         │       │
│  │   • Últimas 24h          │   • Naranja: WARN       │       │
│  │   • Auto-intervalo       │   • Rojo: ERROR         │       │
│  │                          │                          │       │
│  └──────────────────────────┴──────────────────────────┘       │
│                                                                  │
│  FILA 3: Detalles y Patrones (2 paneles de 24×12)             │
│  ┌──────────────────────────┬──────────────────────────┐       │
│  │          🎯              │           📈             │       │
│  │   TOP 10 ENDPOINTS       │    LOGS POR HORA         │       │
│  │   (Horizontal Bar)       │    (Line Chart)          │       │
│  │                          │                          │       │
│  │   • Más solicitados      │   • Patrón horario      │       │
│  │   • Rosa frambuesa       │   • Línea rosa gruesa   │       │
│  │   • Ordenado DESC        │   • Últimas 24 horas    │       │
│  │   • Top 10               │   • Puntos por hora     │       │
│  │                          │                          │       │
│  └──────────────────────────┴──────────────────────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📈 Visualizaciones Activas (8 totales)

### Fila 1 - KPIs

#### 1. ⚡ Total de Requests

- **ID:** `29cf4aa0-bdd5-11f0-b865-c1fad42913f7`
- **Tipo:** Métrica numérica
- **Posición:** x:0, y:0, w:12, h:8
- **Color:** Fondo rosa claro (#fce4ec)
- **Fuente:** 60px
- **Query:** Count de todos los logs
- **Estado:** ✅ Activo

#### 2. 🚨 Errores Totales

- **ID:** `2a6a2b10-bdd5-11f0-b865-c1fad42913f7`
- **Tipo:** Métrica numérica
- **Posición:** x:12, y:0, w:12, h:8
- **Color:** Fondo rojo (#f44336) con texto blanco
- **Fuente:** 60px
- **Query:** Count WHERE level:error
- **Estado:** ✅ Activo (Alerta visual)

#### 3. ⏱️ Tiempo de Respuesta Promedio

- **ID:** `2b03d300-bdd5-11f0-b865-c1fad42913f7`
- **Tipo:** Métrica con rangos
- **Posición:** x:24, y:0, w:12, h:8
- **Colores dinámicos:**
  - Verde: 0-100ms (excelente)
  - Amarillo: 100-500ms (aceptable)
  - Rojo: >500ms (lento)
- **Fuente:** 48px + subtexto "milliseconds"
- **Query:** AVG(duration)
- **Estado:** ✅ Activo

#### 4. 🌸 Requests por Servicio

- **ID:** `2ba2ab10-bdd5-11f0-b865-c1fad42913f7`
- **Tipo:** Donut chart
- **Posición:** x:36, y:0, w:12, h:8
- **Paleta personalizada (6 colores):**
  - Rosa frambuesa: #c2185b
  - Rosa brillante: #e91e63
  - Púrpura real: #7b1fa2
  - Púrpura medio: #9c27b0
  - Rosa ballet: #f8bbd0
  - Magenta profundo: #880e4f
- **Query:** Terms aggregation en service.keyword (top 10)
- **Estado:** ✅ Activo

---

### Fila 2 - Análisis Temporal

#### 5. 🌹 Timeline de Actividad

- **ID:** `2c4071b0-bdd5-11f0-b865-c1fad42913f7`
- **Tipo:** Area chart apilado
- **Posición:** x:0, y:8, w:24, h:12
- **Paleta:** Gradiente rosa continuo (5 colores)
- **Agregaciones:**
  - Eje X: @timestamp (date_histogram, auto)
  - Series: service.keyword (top 5)
- **Características:**
  - Apilado para ver volumen total
  - Gradiente suave entre servicios
  - Interpolación lineal
- **Estado:** ✅ Activo

#### 6. 💐 Errores vs Éxitos

- **ID:** `2cdc6390-bdd5-11f0-b865-c1fad42913f7`
- **Tipo:** Bar chart apilado
- **Posición:** x:24, y:8, w:24, h:12
- **Paleta semántica (5 colores):**
  - Verde: #4caf50 (INFO/SUCCESS)
  - Naranja: #ff9800 (WARN)
  - Rojo: #f44336 (ERROR)
  - Rosa: #c2185b (DEBUG)
  - Púrpura: #7b1fa2 (OTROS)
- **Query:** Terms aggregation en level.keyword (top 5)
- **Estado:** ✅ Activo

---

### Fila 3 - Detalles

#### 7. 🎯 Top 10 Endpoints

- **ID:** `2d7659a0-bdd5-11f0-b865-c1fad42913f7`
- **Tipo:** Horizontal bar chart
- **Posición:** x:0, y:20, w:24, h:12
- **Color:** Rosa frambuesa (#c2185b)
- **Query:** Terms aggregation en url.keyword (top 10, DESC)
- **Características:**
  - Horizontal para URLs largas
  - Sin leyenda (color único)
  - Ordenado por tráfico
- **Estado:** ✅ Activo

#### 8. 📈 Logs por Hora

- **ID:** `2e142040-bdd5-11f0-b865-c1fad42913f7`
- **Tipo:** Line chart
- **Posición:** x:24, y:20, w:24, h:12
- **Color:** Rosa frambuesa (#c2185b)
- **Query:** Date histogram con intervalo 1h
- **Características:**
  - Línea gruesa (3px)
  - Puntos en cada hora
  - Útil para detectar patrones
- **Estado:** ✅ Activo

---

## ⚙️ Configuración del Dashboard

### Temporal

- **Rango:** Últimas 24 horas (now-24h to now)
- **Time restore:** Habilitado (se guarda con el dashboard)
- **Selector:** Disponible para cambiar rango

### Auto-refresh

- **Intervalo:** 30 segundos
- **Estado:** Activo (pause: false)
- **Pausable:** Sí (desde UI)

### Interactividad

- **useMargins:** true (márgenes entre paneles)
- **syncColors:** false (cada viz usa su paleta)
- **syncCursor:** true (sincroniza cursor entre gráficos)
- **syncTooltips:** false
- **hidePanelTitles:** false (títulos visibles)

### Data View

- **ID:** `8870237b-ffe5-4b39-8f7f-5d95d100ad39`
- **Pattern:** `flores-victoria-logs-*`
- **Time field:** `@timestamp`
- **Nombre:** Flores Victoria Logs

---

## 🎨 Paleta de Colores Aplicada

### Colores Primarios (del sitio web)

```css
--primary-pink: #c2185b /* Rosa Frambuesa */ --primary-light: #e91e63 /* Rosa Brillante */
  --primary-dark: #880e4f /* Magenta Profundo */;
```

### Colores Secundarios

```css
--secondary-purple: #7b1fa2 /* Púrpura Real */ --secondary-light: #9c27b0 /* Púrpura Medio */;
```

### Acentos

```css
--accent-pink: #f8bbd0 /* Rosa Ballet */ --accent-light: #fce4ec /* Rosa Muy Claro */;
```

### Funcionales

```css
--success: #4caf50 /* Verde */ --error: #f44336 /* Rojo */ --warning: #ff9800 /* Naranja */;
```

---

## 📊 Estadísticas del Dashboard

| Métrica                  | Valor |
| ------------------------ | ----- |
| Total de paneles         | 8     |
| Total de visualizaciones | 8     |
| Referencias al data view | 8     |
| Filas en layout          | 3     |
| Ancho total (grid units) | 48    |
| Alto total (grid units)  | 32    |
| Colores personalizados   | 10    |
| Auto-refresh             | 30s   |
| Rango temporal           | 24h   |

---

## ✅ Estado de Salud

| Componente      | Estado         | Detalles                       |
| --------------- | -------------- | ------------------------------ |
| Dashboard       | ✅ Activo      | ID válido, accesible           |
| Data View       | ✅ Conectado   | 8/8 visualizaciones conectadas |
| Visualizaciones | ✅ Funcionales | Sin errores de referencia      |
| Auto-refresh    | ✅ Operativo   | Actualiza cada 30s             |
| Colores         | ✅ Aplicados   | Paleta Flores Victoria         |
| Layout          | ✅ Optimizado  | 3 filas responsive             |

---

## 🔗 Enlaces Rápidos

### Dashboard

- **Principal:** http://localhost:5601/app/dashboards
- **Directo:** http://localhost:5601/app/dashboards#/view/5013bd40-bdd5-11f0-b865-c1fad42913f7

### Kibana

- **Discover:** http://localhost:5601/app/discover
- **Visualize:** http://localhost:5601/app/visualize
- **Stack Management:** http://localhost:5601/app/management

### Admin Panel

- **ELK Manager:** http://localhost:3010/elk.html
- **Panel Principal:** http://localhost:3010

---

## 🎯 Casos de Uso

### 1. Monitoreo en Tiempo Real

✅ Ver métricas KPI al instante  
✅ Detectar picos de tráfico  
✅ Alertas visuales de errores

### 2. Análisis de Performance

✅ Tiempo de respuesta promedio  
✅ Endpoints lentos  
✅ Patrones horarios de carga

### 3. Troubleshooting

✅ Timeline para identificar incidentes  
✅ Distribución de errores por nivel  
✅ Servicios más afectados

### 4. Reporting

✅ Exportar visualizaciones como PNG  
✅ Datos históricos de 24h  
✅ Tendencias por servicio

---

## 📝 Notas Importantes

1. **Referencias al Data View:** Todas las visualizaciones tienen referencias correctas al data view
   `8870237b-ffe5-4b39-8f7f-5d95d100ad39`

2. **Versión de Kibana:** 8.11.0 (visualizaciones compatibles)

3. **Migración:** Dashboard migrado a versión 8.9.0

4. **Backup:** IDs de visualizaciones guardados en `/tmp/viz_*.id`

5. **Colores:** Paleta personalizada mantiene identidad visual de Flores Victoria

---

**Estado:** ✅ **COMPLETAMENTE FUNCIONAL**  
**Última verificación:** 10 de Noviembre de 2025, 01:33 UTC  
**Próxima acción sugerida:** Integrar logger.js en código de microservicios para generar logs reales
