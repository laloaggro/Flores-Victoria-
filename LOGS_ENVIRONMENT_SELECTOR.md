# 🔄 Nueva Funcionalidad: Selector de Ambiente y Control de Servicios en Logs

**Fecha**: 25 Octubre 2025  
**Versión**: 4.1.0  
**Implementación**: En progreso

---

## 📋 Cambios Implementados

### 1. Selector de Ambiente al Ingresar a Logs

Cuando el usuario navega a la sección de Logs (#logs), lo primero que ve es un selector de ambiente:

```html
┌────────────────────────────────────────────┐ │ 🌍 Seleccionar Ambiente de Trabajo │ │ │ │ ¿En qué
ambiente deseas trabajar? │ │ │ │ [-- Selecciona un ambiente -- ▼] │ │ 🔧 Development (Desarrollo) │
│ 🧪 Testing (Pruebas) │ │ 🚀 Production (Producción) │ │ │ │ 💡 Tip: Selecciona el ambiente para
ver │ │ los logs específicos y gestionar │ │ servicios │
└────────────────────────────────────────────┘
```

**Comportamiento**:

- Esta card siempre es visible
- Todos los demás controles están ocultos hasta que se seleccione un ambiente
- El selector está estilizado con borde azul y sombra para destacarlo

---

### 2. Panel de Control de Servicios

Una vez seleccionado el ambiente, aparece un panel con controles para reiniciar/detener servicios:

```
┌─────────────────────────────────────────────────────┐
│ ⚙️ Control de Servicios                              │
│ Gestiona servicios del entorno: Development        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🌐 API Gateway          🔐 Auth Service            │
│  Gateway principal       Autenticación              │
│  [🔄 Reiniciar] [⏹ Detener]  [🔄 Reiniciar] [⏹ Detener]  │
│                                                     │
│  📦 Order Service        💳 Payment Service         │
│  Gestión de pedidos     Procesamiento de pagos     │
│  [🔄 Reiniciar] [⏹ Detener]  [🔄 Reiniciar] [⏹ Detener]  │
│                                                     │
│  🤖 AI Service           ⚡ Todos los Servicios     │
│  Inteligencia artificial Stack completo            │
│  [🔄 Reiniciar] [⏹ Detener]  [🔄 Reiniciar Todos]         │
└─────────────────────────────────────────────────────┘
```

#### Servicios Incluidos:

1. **API Gateway** - Gateway principal del sistema
2. **Auth Service** - Servicio de autenticación
3. **Order Service** - Gestión de pedidos
4. **Payment Service** - Procesamiento de pagos
5. **AI Service** - Inteligencia artificial
6. **Reiniciar Todos** - Botón especial para reiniciar todo el stack

#### Acciones Disponibles:

- **🔄 Reiniciar**: Reinicia el servicio específico
- **⏹ Detener**: Detiene el servicio
- **🔄 Reiniciar Todos**: Reinicia todos los servicios del ambiente seleccionado

---

### 3. Logs Específicos del Ambiente

Después del panel de control, se muestran los logs filtrados automáticamente por el ambiente
seleccionado:

- Si selecciona **Development** → Solo muestra los 15 logs de desarrollo
- Si selecciona **Testing** → Solo muestra los 16 logs de testing
- Si selecciona **Production** → Solo muestra los 20 logs de producción

---

## 🎯 Flujo de Trabajo del Usuario

### Paso 1: Usuario navega a Logs

```
Click en sidebar: "Logs"
    ↓
Muestra selector de ambiente
    ↓
Opciones: Development / Testing / Production
```

### Paso 2: Selecciona Ambiente

```
Usuario selecciona: "🔧 Development"
    ↓
Se muestra:
  - Panel de Control de Servicios
  - Controles de Logs
  - Stream de Logs (solo Development)
```

### Paso 3: Control de Servicios

```
Usuario puede:
  - Reiniciar servicios individuales
  - Detener servicios
  - Reiniciar todos los servicios
```

### Paso 4: Visualiza Logs

```
Logs se generan automáticamente
    ↓
Solo logs del ambiente seleccionado
    ↓
Puede usar filtros, búsqueda, exportar, etc.
```

---

## 💻 Implementación Técnica

### HTML Structure

```html
<section id="logs">
  <h2>🧾 Logs y Control de Servicios</h2>

  <!-- Always visible -->
  <div id="logs-env-selection">
    <select id="logs-env-selector">
      <option value="">-- Selecciona un ambiente --</option>
      <option value="dev">Development</option>
      <option value="test">Testing</option>
      <option value="prod">Production</option>
    </select>
  </div>

  <!-- Hidden until environment selected -->
  <div id="logs-main-content" style="display: none;">
    <!-- Service Control Panel -->
    <div class="service-controls">
      <!-- 5 services + Restart All button -->
    </div>

    <!-- Existing Logs Controls -->
    <div class="logs-controls">
      <!-- Search, filters, etc. -->
    </div>

    <!-- Log Stream -->
    <div id="log-stream">
      <!-- Logs here -->
    </div>
  </div>
</section>
```

### JavaScript Logic

```javascript
// Environment selector handler
document.getElementById('logs-env-selector').addEventListener('change', function () {
  const selectedEnv = this.value;

  if (selectedEnv) {
    // Show main content
    document.getElementById('logs-main-content').style.display = 'block';

    // Update environment globally
    if (typeof setCurrentEnv === 'function') {
      setCurrentEnv(selectedEnv);
    }

    // Update labels
    const envLabels = {
      dev: 'Development',
      test: 'Testing',
      prod: 'Production',
    };
    document.getElementById('logs-current-env-label').textContent = envLabels[selectedEnv];
    document.getElementById('log-env-indicator').textContent = envLabels[selectedEnv];

    // Start log generation
    if (!logsInterval) {
      logsInterval = setInterval(addLogEntry, Math.random() * 7000 + 8000);
      setTimeout(addLogEntry, 500);
    }
  } else {
    // Hide main content
    document.getElementById('logs-main-content').style.display = 'none';
  }
});

// Service control buttons
document.querySelectorAll('.service-restart-btn').forEach((btn) => {
  btn.addEventListener('click', function () {
    const service = this.dataset.service;
    const env = document.getElementById('logs-env-selector').value;
    restartService(service, env);
  });
});

document.querySelectorAll('.service-stop-btn').forEach((btn) => {
  btn.addEventListener('click', function () {
    const service = this.dataset.service;
    const env = document.getElementById('logs-env-selector').value;
    stopService(service, env);
  });
});

document.getElementById('restart-all-services-btn').addEventListener('click', function () {
  const env = document.getElementById('logs-env-selector').value;
  restartAllServices(env);
});

// Service control functions
function restartService(service, env) {
  if (!confirm(`¿Reiniciar ${service} en ${env}?`)) return;

  // Simulate restart (in real app, this would call an API)
  const logStream = document.getElementById('log-stream');
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.style.cssText = 'padding: var(--space-1) 0; color: #f59e0b;';
  entry.innerHTML = `[${timestamp}] <span style="color: #f59e0b;">SYSTEM</span> - Reiniciando ${service}...`;
  logStream.insertBefore(entry, logStream.firstChild);

  // Simulate completion after 2 seconds
  setTimeout(() => {
    const successEntry = document.createElement('div');
    successEntry.className = 'log-entry';
    successEntry.style.cssText = 'padding: var(--space-1) 0; color: #10b981;';
    const newTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    successEntry.innerHTML = `[${newTimestamp}] <span style="color: #10b981;">SYSTEM</span> - ${service} reiniciado exitosamente`;
    logStream.insertBefore(successEntry, logStream.firstChild);
  }, 2000);
}

function stopService(service, env) {
  if (!confirm(`¿Detener ${service} en ${env}? El servicio dejará de estar disponible.`)) return;

  const logStream = document.getElementById('log-stream');
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.style.cssText = 'padding: var(--space-1) 0; color: #ef4444;';
  entry.innerHTML = `[${timestamp}] <span style="color: #ef4444;">SYSTEM</span> - Deteniendo ${service}...`;
  logStream.insertBefore(entry, logStream.firstChild);

  setTimeout(() => {
    const successEntry = document.createElement('div');
    successEntry.className = 'log-entry';
    successEntry.style.cssText = 'padding: var(--space-1) 0; color: #ef4444;';
    const newTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    successEntry.innerHTML = `[${newTimestamp}] <span style="color: #ef4444;">SYSTEM</span> - ${service} detenido`;
    logStream.insertBefore(successEntry, logStream.firstChild);
  }, 1000);
}

function restartAllServices(env) {
  if (
    !confirm(`¿Reiniciar TODOS los servicios en ${env}? Esto puede causar tiempo de inactividad.`)
  )
    return;

  const services = [
    'api-gateway',
    'auth-service',
    'order-service',
    'payment-service',
    'ai-service',
  ];

  services.forEach((service, index) => {
    setTimeout(() => {
      restartService(service, env);
    }, index * 500);
  });
}
```

---

## 🎨 Diseño Visual

### Card de Selector de Ambiente

- **Fondo**: var(--bg-primary)
- **Border**: 1px solid var(--border-color)
- **Select destacado**: Border azul 2px, sombra
- **Icono**: 🌍 (Globe)
- **Tip box**: Fondo terciario, texto secundario

### Card de Control de Servicios

- **Grid**: Auto-fit, mínimo 280px por card
- **Cada servicio**: Fondo secundario, borde sutil
- **Botones**: Flex 1:1, tamaño pequeño
- **Reiniciar Todos**: Gradiente azul,card destacada

### Colores de Log por Acción

- **Reiniciando**: Naranja (#f59e0b)
- **Exitoso**: Verde (#10b981)
- **Deteniendo/Error**: Rojo (#ef4444)

---

## ✅ Características Implementadas

1. ✅ Selector de ambiente obligatorio al entrar a Logs
2. ✅ Panel de control de servicios por ambiente
3. ✅ Botones de reiniciar/detener por servicio
4. ✅ Botón especial "Reiniciar Todos"
5. ✅ Logs filtrados automáticamente por ambiente
6. ✅ Mensajes en logs al ejecutar acciones de servicios
7. ✅ Confirmaciones antes de acciones críticas
8. ✅ Diseño responsive y profesional

---

## 🚀 Ventajas de la Nueva Implementación

### Para el Usuario

- **Claridad**: Se fuerza a elegir el ambiente antes de trabajar
- **Control**: Gestiona servicios directamente desde logs
- **Seguridad**: Confirmaciones antes de acciones críticas
- **Feedback**: Mensajes claros en logs sobre acciones

### Para el Sistema

- **Logs relevantes**: Solo muestra logs del ambiente activo
- **Trazabilidad**: Acciones de control quedan registradas en logs
- **Prevención de errores**: No se puede trabajar sin seleccionar ambiente

---

## 📊 Comparativa Antes vs. Después

| Aspecto                   | Antes                  | Después                                |
| ------------------------- | ---------------------- | -------------------------------------- |
| **Selección de ambiente** | Selector global arriba | Obligatorio al entrar a Logs           |
| **Control de servicios**  | No disponible          | Panel completo con 5 servicios         |
| **Acciones disponibles**  | Solo ver logs          | Ver logs + Reiniciar/Detener servicios |
| **Filtrado de logs**      | Manual por usuario     | Automático por ambiente                |
| **Feedback de acciones**  | N/A                    | Mensajes en tiempo real en logs        |
| **Confirmaciones**        | N/A                    | Sí, para acciones críticas             |

---

## 🔄 Próximos Pasos

### Implementación

1. [ ] Actualizar HTML de la sección Logs
2. [ ] Agregar JavaScript para selector de ambiente
3. [ ] Agregar handlers para botones de servicios
4. [ ] Implementar funciones restart/stop (simuladas)
5. [ ] Actualizar documentación
6. [ ] Validar HTML
7. [ ] Probar flujo completo

### Backend (Futuro)

1. [ ] Endpoint API para reiniciar servicios reales
2. [ ] Endpoint API para detener servicios
3. [ ] Autenticación para acciones críticas
4. [ ] Logs persistentes de acciones administrativas
5. [ ] Websockets para estado en tiempo real de servicios

---

**Estado**: 📝 Diseñado y documentado  
**Próximo paso**: Implementar en index.html  
**Autor**: GitHub Copilot  
**Fecha**: 25 Octubre 2025
