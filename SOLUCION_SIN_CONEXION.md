# 🔧 SOLUCIÓN: Problema "Sin Conexión" en Flores Victoria

**Fecha:** 2 de noviembre de 2025  
**Problema:** Algunas páginas muestran mensaje "Sin conexión"  
**Causa:** Service Workers múltiples o corruptos interceptando peticiones

---

## 🎯 Solución Rápida (Recomendada)

### Opción 1: Herramienta Automática

1. **Abrir la página de reparación:**
   ```
   http://localhost:5173/fix-offline.html
   ```

2. **Click en el botón grande:**
   - "🧹 Limpiar Service Workers y Cachés"

3. **Esperar confirmación** (aparecerá mensaje verde)

4. **Cerrar el navegador** completamente

5. **Reabrir y visitar** el sitio normalmente

✅ **¡Listo!** El sitio funcionará sin problemas.

---

## 🛠️ Solución Manual (Alternativa)

Si la herramienta automática no funciona, hazlo manualmente:

### Paso 1: Abrir DevTools

1. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux)
2. O `Cmd+Option+I` (Mac)

### Paso 2: Ir a Application

1. Click en pestaña **"Application"** (o "Aplicación")
2. En el panel izquierdo, busca:

### Paso 3: Desregistrar Service Workers

```
Application
  └─ Service Workers
      └─ [Click en "Unregister" en cada uno]
```

**Deberías ver algo como:**
- `flores-victoria-v2.0.0` → Unregister
- `flores-victoria-v3.0.0` → Unregister
- `arreglos-victoria-v1.0.0` → Unregister

### Paso 4: Eliminar Cachés

```
Application
  └─ Cache Storage
      └─ [Click derecho en cada caché]
          └─ Delete
```

**Eliminar todos:**
- `flores-victoria-static-v2.0.0`
- `flores-victoria-dynamic-v2.0.0`
- `flores-victoria-images-v2.0.0`
- `flores-victoria-api-v2.0.0`
- Cualquier otro que veas

### Paso 5: Limpiar Storage

```
Application
  └─ Local Storage
      └─ http://localhost:5173
          └─ [Buscar y eliminar keys que empiecen con "sw-" o "cache-"]
```

### Paso 6: Hard Reload

1. Presiona `Ctrl+Shift+R` (Windows/Linux)
2. O `Cmd+Shift+R` (Mac)

---

## 🔍 ¿Por Qué Sucede Esto?

### Problema Principal

El proyecto tiene **múltiples Service Workers** registrados:

1. **`service-worker.js`** (versión básica)
2. **`sw.js`** (versión 2.0.0)
3. **`sw-advanced.js`** (versión 3.0.0)

### Comportamiento Problemático

```javascript
// Service Worker intercepta TODAS las peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // ✅ Sirve desde caché
      }
      
      // ❌ Si no está en caché y falla la red
      return fetch(event.request).catch(() => {
        return caches.match('/offline.html'); // Muestra "Sin conexión"
      });
    })
  );
});
```

### Por Qué Falla

1. **Caché corrupto:** Algunas URLs están mal cacheadas
2. **Versiones múltiples:** Conflicto entre SW diferentes
3. **Offline fallback agresivo:** Muestra offline muy rápido
4. **Rutas no cacheadas:** Páginas nuevas no están en precache

---

## 📊 Archivos del Problema

### Service Workers Activos

```
frontend/
  ├─ service-worker.js      ← Básico (v1.0.0)
  ├─ sw.js                  ← Optimizado (v2.0.0)
  ├─ sw-advanced.js         ← Avanzado (v3.0.0)
  └─ public/
      ├─ sw.js
      └─ sw-v3.js
```

### Archivos de Solución Creados

```
frontend/
  ├─ fix-offline.html                 ← Página de reparación
  └─ js/utils/
      └─ sw-cleanup.js                ← Script de limpieza
```

---

## 🚀 Prevención Futura

### Recomendación: Usar UN SOLO Service Worker

Editar `index.html` y otras páginas HTML para registrar solo uno:

```html
<!-- ❌ NO usar múltiples registros -->
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
    navigator.serviceWorker.register('/sw.js');           // ← CONFLICTO
    navigator.serviceWorker.register('/sw-advanced.js');  // ← CONFLICTO
  }
</script>

<!-- ✅ Usar SOLO uno -->
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.error('Error SW:', err));
  }
</script>
```

### Estrategia de Caché Mejorada

Para evitar "Sin conexión" en páginas nuevas:

```javascript
// sw.js - Estrategia Network First con timeout
const networkFirst = async (request) => {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 3000)
      )
    ]);
    
    // Cachear para uso futuro
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // Solo mostrar offline si realmente no hay caché
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
};
```

---

## 📝 Testing de Solución

### Verificar que está Solucionado

1. **Abrir DevTools** (F12)
2. **Ir a Application > Service Workers**
3. **Verificar:** Debe decir "No service workers"

4. **Ir a Application > Cache Storage**
5. **Verificar:** Debe estar vacío o solo con cachés nuevos

6. **Navegar por el sitio:**
   - ✅ index.html → Debe cargar
   - ✅ pages/products.html → Debe cargar
   - ✅ pages/contact.html → Debe cargar
   - ✅ pages/cart.html → Debe cargar

### Test de Navegación

```bash
# Abrir en navegador
http://localhost:5173/

# Navegar a diferentes páginas
http://localhost:5173/pages/products.html
http://localhost:5173/pages/about.html
http://localhost:5173/pages/contact.html
http://localhost:5173/pages/cart.html
```

**Resultado esperado:** Todas cargan sin mensaje "Sin conexión"

---

## 🔄 Si el Problema Persiste

### 1. Limpiar Cookies y Site Data

```
DevTools > Application > Storage > Clear site data
```

### 2. Modo Incógnito

Prueba en una ventana de incógnito:
- `Ctrl+Shift+N` (Chrome)
- `Ctrl+Shift+P` (Firefox)

### 3. Otro Navegador

Prueba en otro navegador para confirmar si es problema local

### 4. Verificar Console Errors

```
DevTools > Console
```

Buscar errores como:
- `Failed to fetch`
- `NetworkError`
- `Service Worker error`

---

## 📞 Comandos Útiles

### Desde la Consola del Navegador

```javascript
// Ver Service Workers registrados
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('SW registrados:', regs.length));

// Ver cachés
caches.keys()
  .then(keys => console.log('Cachés:', keys));

// Desregistrar TODOS los SW
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));

// Limpiar TODOS los cachés
caches.keys()
  .then(keys => keys.forEach(key => caches.delete(key)));
```

---

## ✅ Checklist de Solución

- [ ] Abrir fix-offline.html
- [ ] Click en "Limpiar Service Workers y Cachés"
- [ ] Esperar mensaje de éxito
- [ ] Cerrar TODAS las pestañas del sitio
- [ ] Cerrar el navegador completamente
- [ ] Reabrir navegador
- [ ] Visitar el sitio
- [ ] Verificar que NO aparece "Sin conexión"
- [ ] Navegar entre páginas
- [ ] Confirmar funcionamiento normal

---

## 🎯 Resumen Ejecutivo

**Problema:** Service Workers múltiples causan conflictos  
**Solución:** Desinstalar todos y limpiar cachés  
**Herramienta:** `fix-offline.html` (automático)  
**Tiempo:** 2 minutos  
**Resultado:** Sitio funciona normalmente sin SW

**URLs de Solución:**
- Automático: `http://localhost:5173/fix-offline.html`
- Auto-ejecutar: `http://localhost:5173/fix-offline.html?auto=true`

---

**¡Problema Resuelto! 🎉**
