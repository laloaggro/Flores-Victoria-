# 🚀 Guía Rápida - Panel Administrativo v4.0

## Acceso

```bash
# Desarrollo
http://localhost:3021

# Producción
https://admin.floresvictoria.cl
```

## 🎨 Cambiar Tema

1. Click en el selector (esquina superior derecha)
2. Seleccionar uno de 8 temas:
   - **Light**: Tema claro profesional (default)
   - **Dark**: Modo oscuro con alto contraste
   - **Ocean**: Azules y verdes oceánicos
   - **Forest**: Verdes naturales
   - **Retro**: Colores vintage cálidos
   - **NeoGlass**: Efecto glassmorphism
   - **CyberNight**: Neón cyber con brillos
   - **Minimal Pro**: Minimalista extremo

✨ El tema se guarda automáticamente y persiste al recargar.

## 🧭 Seleccionar Entorno (Dev/Test/Prod)

- En la parte superior derecha verás el selector "Entorno".
- Opciones: **Desarrollo**, **Testing**, **Producción**.
- La selección afecta etiquetas en Logs y un badge visible en los títulos.
- Configuración editable en `admin-panel/public/config/env-config.json`.

Ejemplo de mapeos por defecto:

```
dev:
  adminPanel: http://localhost:3021
  apiGateway: http://localhost:4000
  orderService: http://localhost:4004
test:
  apiGateway: http://test.api.local
  orderService: http://test.api.local/orders
prod:
  adminPanel: https://admin.floresvictoria.cl
  apiGateway: https://api.floresvictoria.cl
  orderService: https://api.floresvictoria.cl/orders
```

## 📱 Navegación

### Sidebar (Izquierda)

#### Principal

- 🏠 **Dashboard**: Vista general con acceso a todas las secciones

#### Operación

- 🔧 **Centro de Control**: Acciones rápidas, tareas y estado de servicios
- 📊 **Analytics**: KPIs y métricas en tiempo real
- 🧾 **Logs**: Stream de logs del sistema
- 🖥️ **Monitoreo**: Salud de servicios y métricas del sistema

#### Soporte

- 📚 **Documentación**: Guías y recursos
- 💾 **Backups**: Gestión de respaldos
- 📋 **Changelog**: Historial de cambios

### Navegación por URL

Puedes acceder directamente con hash:

```
http://localhost:3021#dashboard
http://localhost:3021#control-center
http://localhost:3021#analytics
http://localhost:3021#logs
http://localhost:3021#monitoring
http://localhost:3021#documentation
http://localhost:3021#backup
http://localhost:3021#changelog
```

## 📊 Dashboard

### Hero Stats

- **Estado**: Estado general del sistema
- **Servicios**: Número de servicios activos
- **Eventos**: Eventos procesados

### Tarjetas de Acceso

- Click en cualquier tarjeta para ir a la sección correspondiente

## 🔧 Centro de Control

### Acciones Rápidas

- **Reiniciar servicios**: Reinicia todos los servicios
- **Desplegar actualización**: Deploys la última versión

### Mini Métricas (se actualizan cada 5s)

- **Tareas hoy**: Total de tareas del día
- **Pendientes**: Tareas pendientes
- **Éxitos**: Tareas completadas exitosamente

### Estado de Servicios

- 🟢 **Online**: Servicio funcionando correctamente
- 🟡 **Warning**: Servicio con advertencias
- 🔴 **Offline**: Servicio no disponible

Servicios monitoreados:

- API Gateway
- Auth Service
- AI Service
- Payment Service

## 📊 Analytics

### KPIs en Tiempo Real (actualización cada 5s)

- **Usuarios activos**: Usuarios conectados actualmente
- **Órdenes**: Total de órdenes procesadas
- **Conversión**: Tasa de conversión en %
- **Latency**: Latencia promedio en ms

## 🧾 Logs

### Stream en Vivo

- Nuevo log cada 8-15 segundos
- Máximo 20 entradas visibles
- Scroll automático

### Niveles de Log

- 🟢 **INFO** (verde): Operaciones normales
- 🟡 **WARN** (naranja): Advertencias
- 🔴 **ERROR** (rojo): Errores críticos

### Servicios Monitoreados

- API Gateway
- Auth Service
- Payment Service
- Order Service
- AI Service
- Cache Service
- Notification Service
- Database
- External API
- Background Worker

### Acciones

- **🔎 Buscar logs**: Filtrar por servicio, nivel o texto
- **↓ Exportar**: Descargar logs en formato CSV/JSON

## 🖥️ Monitoreo

### Salud de Servicios

Cada servicio muestra:

- Estado (online/warning/offline)
- Uptime percentage
- Memory usage o Latency

### Métricas del Sistema (actualización cada 5s)

- **CPU**: Uso de CPU en %
- **RAM**: Uso de memoria en %
- **Disco**: Uso de disco en %
- **Red**: Transferencia de red en GB

## 📚 Documentación

### Guías Rápidas

Enlaces directos a:

- Arquitectura del sistema
- Configuración de servicios
- API Reference
- Deployment Guide

### Recursos

- Link a documentación completa

## 💾 Backups

### Backups Recientes

Lista de últimos respaldos con:

- Nombre del archivo
- Fecha y hora
- Tamaño

### Gestión

- **+ Nuevo backup**: Crear respaldo manual
- **Ver todos**: Ver lista completa de backups

## 📋 Changelog

### Historial de Versiones

Visualiza todos los cambios del sistema organizados por versión.

### Estructura

Cada versión muestra:

- **Badge de versión**: Color según tipo (major/minor/patch)
- **Fecha de release**: Cuándo se publicó
- **Categorías de cambios**:
  - ✨ **Nuevas Características**: Features implementados
  - 🔧 **Mejoras**: Optimizaciones y mejoras
  - 📚 **Documentación**: Nuevas guías y docs
  - 🐛 **Correcciones**: Bugs solucionados

### Versiones Disponibles

- **v4.0.0**: Panel unificado, 8 temas, métricas dinámicas (actual)
- **v3.0.0**: PWA, servicio IA, WebAssembly
- **v2.0.0**: Microservicios, Docker, CI/CD

### Timeline Visual

- **Major releases** (x.0.0): Badge azul con gradiente
- **Minor releases** (x.x.0): Badge verde
- **Patches** (x.x.x): Badge gris

## ⌨️ Atajos de Teclado

| Tecla             | Acción                        |
| ----------------- | ----------------------------- |
| `Tab`             | Navegar entre elementos       |
| `Enter` / `Space` | Activar elemento seleccionado |
| `Esc`             | Cerrar modales (futuro)       |

## 📱 Responsive

### Mobile (< 768px)

- Sidebar oculto por defecto
- Hamburger menu para abrir/cerrar
- Tarjetas en 1 columna

### Tablet (768px - 1024px)

- Sidebar visible
- Tarjetas en 1-2 columnas

### Desktop (> 1024px)

- Layout completo
- Tarjetas en grid adaptable

## 🔧 Troubleshooting

### El tema no persiste

1. Verificar que localStorage esté habilitado
2. Limpiar caché del navegador
3. Volver a seleccionar el tema

### Las métricas no se actualizan

1. Abrir consola del navegador (F12)
2. Verificar que no haya errores JavaScript
3. Recargar la página

### Los logs no aparecen

1. Verificar conexión a internet
2. Revisar consola por errores
3. Esperar 8-15 segundos para el primer log

### Navegación no funciona

1. Verificar que JavaScript esté habilitado
2. Limpiar caché y cookies
3. Probar con hash directo en URL

## 🆘 Soporte

- **Email**: admin@floresvictoria.cl
- **GitHub Issues**: https://github.com/laloaggro/Flores-Victoria-/issues
- **Documentación**: http://localhost:3021#documentation

---

**Flores Victoria v4.0** - Panel Administrativo Enterprise  
Última actualización: 25 Octubre 2025
