# 🔍 Análisis de Recursos No Utilizados - Flores Victoria

**Fecha**: 22 de octubre de 2025  
**Versión del Proyecto**: 2.0.1  
**Estado General del Sistema**: 100% Validado (85/85 checks)

---

## 📊 Resumen Ejecutivo

Se ha identificado **infraestructura documentada pero NO implementada** en el sistema actual. Estos
recursos están referenciados en documentación, tienen configuraciones listas, pero **NO están
corriendo en producción**.

### ⚠️ Recursos Identificados Sin Uso

| Recurso        | Estado       | Impacto | Acción Recomendada  |
| -------------- | ------------ | ------- | ------------------- |
| **ELK Stack**  | ❌ No activo | Alto    | Activar o remover   |
| **Prometheus** | ❌ No activo | Alto    | Activar o remover   |
| **Grafana**    | ❌ No activo | Alto    | Activar o remover   |
| **Storybook**  | ⚠️ Parcial   | Medio   | Completar o remover |

---

## 1. 📝 ELK Stack (Elasticsearch + Logstash + Kibana)

### Estado Actual: ❌ NO ACTIVO

#### Evidencia

```bash
# Verificación de servicios
curl http://localhost:9200  # Elasticsearch → Connection refused
curl http://localhost:5601  # Kibana → Connection refused
curl http://localhost:9600  # Logstash → Connection refused

# Contenedores
docker ps -a | grep -E "(elastic|kibana|logstash)"
# Resultado: No hay contenedores de ELK corriendo
```

#### Infraestructura Preparada

**Archivos de configuración existentes:**

- ✅ `logging/filebeat/filebeat.yml` - Configuración de Filebeat
- ✅ `logging/logstash/config/` - Pipeline de Logstash
- ✅ `logging/logstash/pipeline/` - Configuraciones de pipeline

**Integración en Admin Panel:**

- ✅ `admin-panel/public/elk-stack.html` - Página HTML completa (470 líneas)
- ✅ Navegación en menú principal del admin panel
- ✅ Sistema de pestañas para Elasticsearch, Kibana, Logstash
- ✅ Indicadores de estado y verificación de disponibilidad

**Documentación:**

- ✅ `CONSOLIDACION_ADMIN_PANEL.md` - Menciona ELK Stack como integrado
- ✅ URLs y puertos documentados:
  - Elasticsearch: 9200
  - Kibana: 5601
  - Logstash: 9600

#### Problema Identificado

**NO existe docker-compose para ELK Stack** en el proyecto. Hay:

- ✅ `docker-compose.yml` (principal, sin ELK)
- ✅ `docker-compose.dev.yml` (desarrollo, sin ELK)
- ✅ `docker-compose.prod.yml` (producción, sin ELK)
- ❌ **NO hay** `docker-compose.elk.yml` o similar

**Conclusión:** La infraestructura está documentada y tiene UI preparada, pero **nunca se
implementó** el docker-compose para levantar los servicios.

#### Impacto

**Negativo:**

- ❌ Página de admin panel `/elk-stack.html` muestra error de conexión
- ❌ Falsa expectativa de tener logging centralizado
- ❌ Documentación inconsistente con realidad
- ❌ Recursos de desarrollo invertidos sin uso

**Positivo:**

- ✅ Sistema funciona correctamente sin ELK Stack
- ✅ Logs actuales con Winston funcionan bien
- ✅ No hay dependencia crítica del sistema

#### Recomendaciones

**Opción A - IMPLEMENTAR (Esfuerzo: Alto, Valor: Alto)**

```bash
# Crear docker-compose.elk.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: flores-victoria-elasticsearch
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    networks:
      - app-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: flores-victoria-kibana
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    networks:
      - app-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: flores-victoria-logstash
    ports:
      - "9600:9600"
    volumes:
      - ./logging/logstash/config:/usr/share/logstash/config
      - ./logging/logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch
    networks:
      - app-network

# Comando para levantar
docker-compose -f docker-compose.elk.yml up -d
```

**Opción B - REMOVER (Esfuerzo: Bajo, Valor: Limpieza)**

```bash
# Archivos a eliminar/actualizar:
- admin-panel/public/elk-stack.html (eliminar)
- admin-panel/public/index.html (remover enlace a ELK)
- logging/filebeat/ (eliminar o archivar)
- logging/logstash/ (eliminar o archivar)
- CONSOLIDACION_ADMIN_PANEL.md (actualizar documentación)
```

**Opción C - POSPONER (Recomendada)**

- Mantener código pero agregar banner de "Próximamente"
- Actualizar documentación indicando "No implementado aún"
- Crear issue en GitHub para implementación futura

---

## 2. 📊 Prometheus + Grafana (Monitoreo)

### Estado Actual: ❌ NO ACTIVO

#### Evidencia

```bash
# Verificación de servicios
curl http://localhost:9090  # Prometheus → Connection refused
curl http://localhost:3000  # Grafana → Connection refused (nota: conflicto con API Gateway)

# Contenedores
docker ps -a | grep -E "(prometheus|grafana)"
# Resultado: No hay contenedores de monitoreo corriendo
```

#### Infraestructura Preparada

**Docker Compose existente:**

- ✅ `monitoring/docker-compose.monitoring.yml` - Configuración COMPLETA
- ✅ `monitoring/prometheus/prometheus.yml` - Configuración de Prometheus
- ✅ `monitoring/grafana/` - Directorio para dashboards
- ✅ `monitoring/grafana-dashboard.json` - Dashboard predefinido

**Configuración en docker-compose.monitoring.yml:**

```yaml
services:
  prometheus:
    image: prom/prometheus:v2.37.0
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana-enterprise
    ports:
      - '3009:3000' # Nota: Puerto 3009 en host
    depends_on:
      - prometheus
```

**Integración en Admin Panel:**

- ✅ `admin-panel/public/grafana.html` - Página HTML completa
- ✅ Enlace en menú de navegación del admin
- ✅ Iframe embebido apuntando a puerto 3000

**Problema de Configuración:**

- ⚠️ Grafana configurado para **puerto 3009** en host (conflicto con Product Service)
- ⚠️ Admin panel apunta a **puerto 3000** (conflicto con API Gateway)
- ⚠️ Red `app-network` no definida en docker-compose.monitoring.yml

#### Problema Identificado

**El docker-compose.monitoring.yml EXISTE pero:**

1. ❌ **Nunca se levanta** con el sistema principal
2. ❌ **Conflicto de puerto**: Grafana (3009) vs Product Service (3009)
3. ❌ **Conflicto de puerto**: Admin UI espera Grafana en 3000, pero ahí está API Gateway
4. ❌ **Red separada**: No está conectado a `app-network` del sistema principal

**Comandos ausentes:**

```bash
# NO existe en scripts:
- start-all.sh → No levanta monitoring
- start-all-with-admin.sh → No levanta monitoring
- package.json scripts → No tiene comando para monitoring
```

#### Impacto

**Negativo:**

- ❌ Página `/grafana.html` en admin panel no funciona
- ❌ No hay métricas visuales de sistema en tiempo real
- ❌ Prometheus no está recolectando métricas
- ❌ Falsa expectativa de monitoreo enterprise
- ❌ Badge en README "Performance - Production Ready" parcialmente engañoso

**Positivo:**

- ✅ Sistema funciona sin monitoreo visual
- ✅ Health endpoints (`/health`) funcionan independientemente
- ✅ Logs con Winston son suficientes para debugging

#### Recomendaciones

**Opción A - IMPLEMENTAR (Esfuerzo: Medio, Valor: Alto)**

**Paso 1: Corregir conflictos de puerto**

```yaml
# monitoring/docker-compose.monitoring.yml
grafana:
  ports:
    - '3011:3000' # Cambiar de 3009 a 3011 (puerto libre)
```

**Paso 2: Conectar a red principal**

```yaml
# monitoring/docker-compose.monitoring.yml
networks:
  app-network:
    external: true # Usar red del docker-compose.yml principal
```

**Paso 3: Actualizar admin panel**

```javascript
// admin-panel/public/grafana.html
const grafanaUrl = 'http://localhost:3011'; // Cambiar de 3000 a 3011
```

**Paso 4: Agregar a scripts de inicio**

```bash
# start-all.sh (línea 50-52)
echo "📊 Levantando Prometheus + Grafana..."
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# stop-all.sh
docker-compose -f monitoring/docker-compose.monitoring.yml down
```

**Paso 5: Agregar comando npm**

```json
// package.json
"scripts": {
  "monitoring:up": "docker-compose -f monitoring/docker-compose.monitoring.yml up -d",
  "monitoring:down": "docker-compose -f monitoring/docker-compose.monitoring.yml down",
  "monitoring:logs": "docker-compose -f monitoring/docker-compose.monitoring.yml logs -f"
}
```

**Opción B - REMOVER (Esfuerzo: Bajo)**

```bash
# Archivos a eliminar:
- monitoring/ (todo el directorio)
- admin-panel/public/grafana.html
- Actualizar admin-panel/public/index.html (remover enlace)
- Actualizar README.md (remover referencias a Grafana)
```

**Opción C - ACTIVAR SELECTIVAMENTE (Recomendada - Esfuerzo: Bajo)**

```bash
# Activar solo cuando se necesite (desarrollo/troubleshooting)
npm run monitoring:up

# Acceder a Grafana manualmente
# http://localhost:3011

# Desactivar cuando no se use
npm run monitoring:down
```

**Justificación Opción C:**

- Monitoring no es crítico para funcionamiento del e-commerce
- Consume recursos (RAM, CPU) innecesariamente en desarrollo
- Útil solo para troubleshooting de performance
- Mejor activar on-demand que tenerlo siempre corriendo

---

## 3. 📚 Storybook (Documentación de Componentes)

### Estado Actual: ⚠️ PARCIALMENTE UTILIZADO

#### Evidencia

```bash
# Archivos de Storybook existentes
ls stories/
# Salida:
- Button.js
- Button.stories.js
- button.css
- Form.js
- form.css
- Configure.mdx
- assets/

# Dependencias instaladas
grep storybook package.json
# Salida: ✅ @storybook/* instalados
#         ✅ storybook: "^9.1.13"

# Scripts disponibles
npm run storybook  # ✅ Funciona
npm run build-storybook  # ✅ Funciona
```

#### Infraestructura Preparada

**Storybook ESTÁ configurado e instalado:**

- ✅ `.storybook/` - Configuración completa
- ✅ `stories/` - 2 componentes con stories
- ✅ `package.json` - Scripts y dependencias
- ✅ Badge en README: "Storybook 9.1.13"

**Componentes documentados:**

1. ✅ Button - Con variantes (primary, secondary, sizes)
2. ✅ Form - Componente de formulario
3. ⚠️ Configure.mdx - Configuración de Storybook

#### Problema Identificado

**Storybook FUNCIONA pero está SUB-UTILIZADO:**

1. ❌ **Solo 2 componentes** documentados de ~20+ componentes del proyecto
2. ❌ **Componentes principales SIN stories:**
   - `frontend/public/js/components/product/Products.js` - NO documentado
   - `frontend/public/js/components/cart/Cart.js` - NO documentado
   - `frontend/public/js/components/auth/Login.js` - NO documentado
   - `frontend/public/js/components/checkout/Checkout.js` - NO documentado
   - Headers, Footers, Navigation - NO documentados

3. ⚠️ **README dice "16+ historias"** pero solo hay 2-3 historias reales

4. ❌ **No está en flujo de desarrollo:**
   - No se actualiza cuando se crean componentes
   - Desarrolladores no lo usan como referencia
   - No está en CI/CD pipeline

#### Comparación: Prometido vs. Realidad

| Métrica               | README             | Realidad      |
| --------------------- | ------------------ | ------------- |
| Componentes Storybook | "3"                | 2             |
| Historias Storybook   | "16+"              | 3-4           |
| Estado                | "✅ 16+ historias" | ⚠️ Muy básico |

#### Impacto

**Negativo:**

- ❌ Documentación de componentes incompleta
- ❌ Nuevos desarrolladores no tienen referencia visual
- ❌ No se aprovecha herramienta instalada
- ❌ README exagera métricas ("16+ historias")
- ❌ Dependencias pesadas instaladas sin uso completo

**Positivo:**

- ✅ Infraestructura lista para expandir
- ✅ Funciona correctamente lo poco que hay
- ✅ Buena base para agregar más componentes

#### Recomendaciones

**Opción A - COMPLETAR (Esfuerzo: Alto, Valor: Alto)**

**Prioridad Alta - Documentar componentes principales:**

```javascript
// stories/Products.stories.js
export default {
  title: 'Components/Products',
  component: 'products-component',
};

export const Default = () => `
  <products-component></products-component>
`;

export const WithFilters = () => `
  <products-component category="rosas"></products-component>
`;
```

**Componentes a documentar (10-15 componentes):**

1. Products Component (con filtros y búsqueda)
2. Cart Component
3. Login/Register Forms
4. Checkout Component
5. Product Card
6. Navigation Header
7. Footer
8. Search Bar
9. Filter Controls
10. Order Summary

**Agregar a CI/CD:**

```yaml
# .github/workflows/ci.yml
- name: Build Storybook
  run: npm run build-storybook

- name: Deploy Storybook
  run: npm run chromatic # Si se usa Chromatic
```

**Opción B - SIMPLIFICAR (Esfuerzo: Bajo, Valor: Medio)**

```json
// package.json - Actualizar README
"Componentes Storybook": "2 (básico)",
"Historias Storybook": "3",
"Estado": "⚠️ En desarrollo"
```

**Opción C - REMOVER (Esfuerzo: Medio, Valor: Negativo)**

```bash
# NO RECOMENDADO - Storybook es valioso
npm uninstall @storybook/* storybook eslint-plugin-storybook
rm -rf .storybook/ stories/
# Libera: ~150MB de node_modules
```

**Recomendación: Opción A (Completar)**

**Razones:**

- Storybook es estándar industry para documentación de componentes
- Ya tienes infraestructura funcionando
- Ayuda enormemente a nuevos desarrolladores
- Permite visual regression testing con Percy/Chromatic
- Bajo costo mantener vs alto valor a largo plazo

**Plan de Acción (2-3 días de trabajo):**

1. **Día 1**: Documentar 5 componentes principales (Products, Cart, Login, Header, Footer)
2. **Día 2**: Documentar 5 componentes secundarios (Cards, Buttons, Forms, Search, Filters)
3. **Día 3**: Integrar con CI/CD, actualizar README con métricas reales

---

## 4. 🎭 Percy Visual Testing

### Estado Actual: ⚠️ CONFIGURADO PERO NO ACTIVO

#### Evidencia

```json
// package.json
"scripts": {
  "test:visual": "percy exec -- playwright test tests/visual"
}

// Badge en README
[![Percy](https://img.shields.io/badge/Percy-Visual%20Testing-9e66bf)](https://percy.io)
```

**Problema:** No hay tests en `tests/visual/` y no está conectado a Percy.io

#### Recomendación

**Opción A - IMPLEMENTAR (si tienes cuenta Percy.io)**

```bash
# Crear tests visuales
mkdir -p tests/visual
# Configurar PERCY_TOKEN en .env
# Ejecutar: npm run test:visual
```

**Opción B - REMOVER BADGE (si no se usa)**

```markdown
# README.md - Remover línea

- [![Percy](https://img.shields.io/badge/Percy-Visual%20Testing-9e66bf)](https://percy.io)
```

---

## 📊 Resumen de Recursos

### Tabla de Estado y Acciones

| Recurso        | Instalado | Configurado | Corriendo | Documentado  | Acción Recomendada       |
| -------------- | --------- | ----------- | --------- | ------------ | ------------------------ |
| **ELK Stack**  | ❌ No     | ✅ Parcial  | ❌ No     | ✅ Sí        | Implementar o remover UI |
| **Prometheus** | ❌ No     | ✅ Sí       | ❌ No     | ✅ Sí        | Activar on-demand        |
| **Grafana**    | ❌ No     | ✅ Sí       | ❌ No     | ✅ Sí        | Activar on-demand        |
| **Storybook**  | ✅ Sí     | ✅ Sí       | ⚠️ Poco   | ⚠️ Exagerado | Completar stories        |
| **Percy**      | ✅ Sí     | ⚠️ Parcial  | ❌ No     | ✅ Badge     | Implementar o remover    |

### Estimación de Recursos

**Uso de Disco:**

- Storybook dependencies: ~150 MB
- Monitoring configs: ~5 MB
- ELK configs: ~2 MB
- **Total**: ~157 MB de archivos sin uso completo

**Uso de RAM (si se activara todo):**

- Elasticsearch: ~1-2 GB
- Kibana: ~500 MB
- Logstash: ~500 MB
- Prometheus: ~200 MB
- Grafana: ~100 MB
- **Total**: ~2.3-3.3 GB adicionales

---

## 🎯 Plan de Acción Recomendado

### Prioridad 1 - CORTO PLAZO (Esta semana)

1. **Actualizar README.md** con métricas reales

   ```markdown
   - Storybook: "2 componentes, 3 historias (en expansión)"
   - Remover "16+ historias" hasta completar
   ```

2. **Agregar banners "Próximamente" en Admin Panel**

   ```html
   <!-- elk-stack.html -->
   <div class="alert alert-warning">
     ⚠️ ELK Stack pendiente de implementación.
     <a href="https://github.com/laloaggro/Flores-Victoria-/issues/XX"> Ver issue #XX </a>
   </div>
   ```

3. **Documentar estado real en docs/**
   - Crear `docs/RECURSOS_NO_UTILIZADOS.md` (este documento)
   - Actualizar `QUICK_REFERENCE.md` con servicios realmente activos

### Prioridad 2 - MEDIANO PLAZO (Próximas 2 semanas)

4. **Completar Storybook** (2-3 días)
   - Documentar 10 componentes principales
   - Actualizar README con métricas reales

5. **Implementar Prometheus + Grafana** (1 día)
   - Corregir conflictos de puerto
   - Conectar a red principal
   - Agregar scripts npm
   - Activar on-demand

### Prioridad 3 - LARGO PLAZO (Próximo mes)

6. **Decidir sobre ELK Stack**
   - Opción A: Implementar docker-compose.elk.yml (2-3 días)
   - Opción B: Remover UI y documentación (2 horas)
   - Opción C: Mantener como "roadmap" para v3.0

---

## 📝 Checklist de Limpieza

### Opción Conservadora (Mantener todo, clarificar estado)

- [ ] Actualizar README con métricas reales
- [ ] Agregar banners "Próximamente" en admin panel
- [ ] Crear issues en GitHub para cada recurso pendiente
- [ ] Documentar este análisis en repositorio
- [ ] Crear milestone "Monitoreo Completo" para v2.1

### Opción Agresiva (Remover lo no usado)

- [ ] Eliminar `logging/` completo
- [ ] Eliminar `admin-panel/public/elk-stack.html`
- [ ] Remover enlaces a ELK en navegación
- [ ] Considerar remover Storybook si no se usará
- [ ] Actualizar docker-compose.monitoring.yml o eliminarlo

### Opción Recomendada (Balance)

- [x] ✅ Documentar estado real (este documento)
- [ ] Actualizar README con métricas honestas
- [ ] Implementar Prometheus/Grafana on-demand (scripts npm)
- [ ] Completar Storybook con 10 componentes (2-3 días)
- [ ] Decidir sobre ELK Stack (implementar en v2.1 o remover)
- [ ] Remover badge de Percy si no se implementa

---

## 🔗 Referencias

**Documentación relacionada:**

- `CONSOLIDACION_ADMIN_PANEL.md` - Menciona ELK y Grafana como integrados
- `README.md` - Badges y métricas de Storybook
- `monitoring/docker-compose.monitoring.yml` - Configuración Prometheus/Grafana
- `logging/` - Configuraciones ELK preparadas pero sin uso

**Comandos útiles:**

```bash
# Ver servicios activos
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Ver tamaño de node_modules relacionados
du -sh node_modules/@storybook node_modules/storybook

# Levantar Storybook
npm run storybook  # http://localhost:6006

# Verificar puertos en uso
netstat -tuln | grep -E "(9090|9200|5601|6006|3011)"
```

---

## 💡 Conclusiones

1. **Tienes más infraestructura documentada que implementada**
   - Esto es común en proyectos ambiciosos
   - No es necesariamente malo si está en roadmap

2. **Priorizar por valor de negocio:**
   - ✅ **Alta prioridad**: Storybook (ayuda a desarrollo)
   - ⚠️ **Media prioridad**: Prometheus/Grafana (útil pero no crítico)
   - ❌ **Baja prioridad**: ELK Stack (overkill para escala actual)

3. **Ser honesto en documentación:**
   - README actual promete "16+ historias Storybook" pero hay 3
   - Mejor ser conservador y sorprender positivamente
   - Actualizar badges/métricas con datos reales

4. **Plan incremental:**
   - v2.1: Completar Storybook + Prometheus/Grafana on-demand
   - v2.2: Implementar ELK Stack si escala lo justifica
   - v3.0: Full observability enterprise

---

**Preparado por:** Sistema de Validación Flores Victoria  
**Última actualización:** 22 de octubre de 2025  
**Próxima revisión:** 22 de noviembre de 2025
