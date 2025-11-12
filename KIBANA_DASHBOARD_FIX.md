# 🔧 Reparación de Dashboard - Flores Victoria

## 🐛 Problema Encontrado

Las visualizaciones del dashboard mostraban el error:

```
No se pudo encontrar la vista de datos: flores-victoria-logs-*
```

## 🔍 Causa Raíz

Las visualizaciones creadas inicialmente usaban el formato antiguo de Kibana donde el index pattern
se especificaba directamente en `searchSourceJSON`, pero **no incluían una referencia** al data view
en el objeto `references[]`.

En Kibana 8.x, las visualizaciones necesitan:

1. El `searchSourceJSON` con la query
2. Una **referencia explícita** al data view en el array `references`

## ✅ Solución Implementada

### 1. Script de Reparación: `fix-visualizations.sh`

Este script:

- ✅ Elimina visualizaciones antiguas sin referencias
- ✅ Crea 8 nuevas visualizaciones con referencias correctas al data view
- ✅ Usa el ID correcto del data view: `8870237b-ffe5-4b39-8f7f-5d95d100ad39`
- ✅ Mantiene los colores personalizados de Flores Victoria
- ✅ Guarda los nuevos IDs en archivos temporales

**Estructura correcta implementada:**

```json
{
  "attributes": {
    "title": "⚡ Total de Requests",
    "visState": "{...configuración...}",
    "kibanaSavedObjectMeta": {
      "searchSourceJSON": "{\"query\":{...},\"filter\":[]}"
    }
  },
  "references": [
    {
      "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
      "type": "index-pattern",
      "id": "8870237b-ffe5-4b39-8f7f-5d95d100ad39"  ← CLAVE!
    }
  ]
}
```

### 2. Script de Recreación: `recreate-dashboard.sh`

Este script:

- ✅ Lee los IDs de las nuevas visualizaciones
- ✅ Elimina el dashboard antiguo
- ✅ Crea nuevo dashboard con referencias a las visualizaciones reparadas
- ✅ Mantiene el layout y configuración (auto-refresh 30s, rango 24h)

## 📊 Visualizaciones Reparadas

| #   | Visualización            | Nuevo ID                               | Estado |
| --- | ------------------------ | -------------------------------------- | ------ |
| 1   | ⚡ Total de Requests     | `29cf4aa0-bdd5-11f0-b865-c1fad42913f7` | ✅     |
| 2   | 🚨 Errores Totales       | `2a6a2b10-bdd5-11f0-b865-c1fad42913f7` | ✅     |
| 3   | ⏱️ Tiempo de Respuesta   | `2b03d300-bdd5-11f0-b865-c1fad42913f7` | ✅     |
| 4   | 🌸 Requests por Servicio | `2ba2ab10-bdd5-11f0-b865-c1fad42913f7` | ✅     |
| 5   | 🌹 Timeline de Actividad | `2c4071b0-bdd5-11f0-b865-c1fad42913f7` | ✅     |
| 6   | 💐 Errores vs Éxitos     | `2cdc6390-bdd5-11f0-b865-c1fad42913f7` | ✅     |
| 7   | 🎯 Top 10 Endpoints      | `2d7659a0-bdd5-11f0-b865-c1fad42913f7` | ✅     |
| 8   | 📈 Logs por Hora         | `2e142040-bdd5-11f0-b865-c1fad42913f7` | ✅     |

## 🎨 Dashboard Recreado

- **ID:** `5013bd40-bdd5-11f0-b865-c1fad42913f7`
- **Título:** 🌺 Flores Victoria - Analytics Dashboard
- **Paneles:** 8 visualizaciones en 3 filas
- **Auto-refresh:** 30 segundos
- **Rango temporal:** Últimas 24 horas

## 🌐 Acceso

**Dashboard principal:** http://localhost:5601/app/dashboards

**Dashboard directo:**
http://localhost:5601/app/dashboards#/view/5013bd40-bdd5-11f0-b865-c1fad42913f7

## 🔧 Comandos Ejecutados

```bash
# 1. Reparar visualizaciones
chmod +x fix-visualizations.sh
./fix-visualizations.sh

# 2. Recrear dashboard
chmod +x recreate-dashboard.sh
./recreate-dashboard.sh
```

## ✅ Verificación

```bash
# Verificar que el dashboard existe
curl -s "http://localhost:5601/api/saved_objects/dashboard/5013bd40-bdd5-11f0-b865-c1fad42913f7" \
  -H "kbn-xsrf: true" | jq '.attributes.title'

# Resultado esperado:
# "🌺 Flores Victoria - Analytics Dashboard"
```

## 🎯 Resultado Final

✅ Todas las visualizaciones funcionan correctamente  
✅ Dashboard muestra datos sin errores  
✅ Colores de Flores Victoria aplicados  
✅ Auto-refresh operativo  
✅ Referencias correctas al data view

## 📝 Lección Aprendida

**Siempre incluir referencias explícitas al data view:**

Cuando crees visualizaciones via API en Kibana 8.x, asegúrate de incluir:

```json
"references": [
  {
    "name": "kibanaSavedObjectMeta.searchSourceJSON.index",
    "type": "index-pattern",
    "id": "<DATA_VIEW_ID>"
  }
]
```

Sin esto, las visualizaciones no podrán encontrar el data view aunque esté especificado en
`searchSourceJSON`.

---

**Fecha de reparación:** 9 de Noviembre de 2025  
**Estado:** ✅ RESUELTO  
**Tiempo de resolución:** ~5 minutos
