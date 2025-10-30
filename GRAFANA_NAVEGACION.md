# 🎯 Guía Visual: Cómo Ver Métricas en Grafana

## Paso 1: Acceder a Grafana

1. **Abre tu navegador** (Chrome, Firefox, etc.)
2. **Ve a:** http://localhost:3000
3. **Verás la pantalla de login**

## Paso 2: Login

- **Usuario:** `admin`
- **Password:** `admin123`
- Haz clic en **"Log in"**
- Si te pide cambiar la contraseña, puedes hacer clic en **"Skip"**

## Paso 3: Encontrar el Menú Explore

### Opción A - Menú Principal (Recomendado)

1. **En la esquina superior izquierda**, busca las **tres líneas horizontales (≡)** o el ícono de **menú hamburguesa**
   
2. Haz clic en ese ícono y verás el menú principal

3. En el menú verás opciones como:
   - Home
   - **Explore** ← ¡Esta es la que necesitas!
   - Dashboards
   - Alerting
   - Connections
   - Administration

4. **Haz clic en "Explore"**

### Opción B - Barra Lateral Izquierda

Si ves una barra lateral en el lado izquierdo con íconos:

1. Busca el ícono de **brújula** 🧭 o **lupa** 🔍
2. Ese es el botón de **"Explore"**
3. Haz clic ahí

### Opción C - URL Directa

Simplemente abre en tu navegador:

**http://localhost:3000/explore**

## Paso 4: Configurar la Query

Una vez en **Explore**:

1. **Verás un editor de queries** en la parte superior
   
2. **Asegúrate que "Prometheus" está seleccionado** como datasource (aparece arriba a la izquierda)

3. **En el campo de texto grande** (donde dice "Enter a PromQL query"), pega esta query:

   ```promql
   rate(http_requests_total[5m])
   ```

4. **Presiona el botón azul "Run query"** o presiona `Shift + Enter`

5. **¡Verás un gráfico con las métricas!**

## Paso 5: Queries Útiles para Empezar

Prueba estas queries (copia y pega una a la vez):

### 1. Ver requests totales por servicio
```promql
sum(http_requests_total) by (service)
```

### 2. Ver tasa de requests por segundo
```promql
rate(http_requests_total[5m])
```

### 3. Ver solo cart-service
```promql
rate(http_requests_total{service="cart-service"}[5m])
```

### 4. Ver errores 5xx
```promql
rate(http_requests_total{status_code=~"5.."}[5m])
```

### 5. Ver requests activos
```promql
http_requests_in_progress
```

## Paso 6: Si No Ves Datos

**Genera tráfico a los servicios:**

Abre una terminal y ejecuta:

```bash
# Generar 50 requests a cart-service
for i in {1..50}; do curl -s http://localhost:3001/health > /dev/null; echo -n "."; done

# Generar 50 requests a product-service  
for i in {1..50}; do curl -s http://localhost:3002/health > /dev/null; echo -n "."; done

# Generar 50 requests a order-service
for i in {1..50}; do curl -s http://localhost:3005/health > /dev/null; echo -n "."; done
```

Luego **refresca la query en Grafana** (botón "Run query")

## Paso 7: Cambiar Visualización

En Explore, puedes cambiar cómo se muestran los datos:

- **Parte superior derecha:** Busca botones para cambiar entre:
  - **Graph** (gráfico de líneas) 📈
  - **Table** (tabla) 📊
  - **Stats** (estadísticas)

## Paso 8: Crear un Dashboard (Opcional)

Si quieres guardar estas visualizaciones:

1. **En Explore**, después de crear una query
2. **Haz clic en "Add to dashboard"** (arriba a la derecha)
3. O mejor aún, **importa el dashboard pre-configurado:**

### Importar Dashboard Pre-configurado:

1. **Menú (≡)** → **Dashboards**
2. **Clic en "New"** → **"Import"**
3. **Clic en "Upload JSON file"**
4. **Selecciona:** `/home/impala/Documentos/Proyectos/flores-victoria/monitoring/dashboards/microservices-overview.json`
5. **Clic en "Import"**
6. **¡Listo!** Verás 8 paneles con métricas

## 🆘 Troubleshooting

### No veo el menú (≡)

- **Actualiza la página** (F5)
- **Asegúrate de estar logueado** (usuario: admin, password: admin123)
- **Prueba con otro navegador**
- **Intenta hacer la ventana más grande** (el menú puede estar oculto en pantallas pequeñas)

### No veo datos en las gráficas

1. **Verifica que los servicios están corriendo:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   curl http://localhost:3005/health
   ```

2. **Verifica que Prometheus está recolectando:**
   - Abre: http://localhost:9090/targets
   - Los servicios deben estar "UP"

3. **Genera tráfico** (comandos arriba)

4. **Cambia el rango de tiempo:**
   - Arriba a la derecha verás algo como "Last 1 hour"
   - Cambia a "Last 5 minutes" o "Last 15 minutes"

### "No data" en Prometheus datasource

1. **Ve a configuración de datasources:**
   - Menú (≡) → **Connections** → **Data sources**
   - Busca "Prometheus"
   - Verifica que la URL sea: `http://prometheus:9090`
   - Haz clic en **"Save & test"**

## 📸 Referencias Visuales

### Ubicación del Menú en Grafana:

```
┌─────────────────────────────────────────────┐
│ ≡  [Grafana Logo]    🔍 Search   [Usuario] │ ← Menú aquí (≡)
├─────────────────────────────────────────────┤
│                                             │
│  ← Aquí aparece el contenido                │
│                                             │
└─────────────────────────────────────────────┘
```

### Explore se ve así:

```
┌─────────────────────────────────────────────┐
│ Explore                                     │
├─────────────────────────────────────────────┤
│ Datasource: [Prometheus ▼]                 │
│                                             │
│ [Metric]  [Builder]  [Code]                │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Enter a PromQL query...                 │ │
│ └─────────────────────────────────────────┘ │
│                                [Run query]  │
├─────────────────────────────────────────────┤
│                                             │
│     📈 Gráfico aparece aquí                 │
│                                             │
└─────────────────────────────────────────────┘
```

## ✅ Checklist Rápido

- [ ] Grafana abierto en http://localhost:3000
- [ ] Login exitoso (admin/admin123)
- [ ] Menú encontrado (≡ en esquina superior izquierda)
- [ ] "Explore" clickeado
- [ ] Prometheus seleccionado como datasource
- [ ] Query pegada en el editor
- [ ] "Run query" presionado
- [ ] ¡Métricas visibles! 🎉

## 🚀 Queries Avanzadas

Una vez que domines lo básico, prueba estas:

```promql
# Tiempo de respuesta promedio (percentil 95)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Tasa de éxito (%)
sum(rate(http_requests_total{status_code=~"2.."}[5m])) 
/ 
sum(rate(http_requests_total[5m])) 
* 100

# Top 5 rutas más llamadas
topk(5, sum(rate(http_requests_total[5m])) by (route))

# Errores de validación
sum(validation_errors_total) by (service)
```

---

**¿Aún tienes problemas?**

Ejecuta esto en tu terminal para verificar que todo está corriendo:

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria
./quick-status.sh
```

**¡Listo! Ahora deberías poder ver tus métricas en Grafana sin problemas! 🎉**
