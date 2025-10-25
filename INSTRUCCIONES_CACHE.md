# Instrucciones para Limpiar Cache del Navegador

## Problema
El navegador está mostrando una versión antigua (verde) de http://localhost:5175/index.html en lugar de la versión actualizada (rosa "Susurro de Rosas") porque tiene cacheados los archivos CSS viejos.

## Solución

### Opción 1: Hard Refresh (Más Rápido)
1. **Chrome/Edge/Brave**: Presiona `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
2. **Firefox**: Presiona `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
3. **Safari**: Presiona `Cmd+Option+E` para vaciar cache, luego `Cmd+R` para recargar

### Opción 2: Limpiar Cache Completa del Navegador

#### Chrome/Edge/Brave
1. Presiona `Ctrl+Shift+Delete` (Windows/Linux) o `Cmd+Shift+Delete` (Mac)
2. Selecciona **"Archivos e imágenes en caché"**
3. En "Intervalo de tiempo" selecciona **"Desde siempre"** o **"Última hora"**
4. Haz clic en **"Borrar datos"**

#### Firefox
1. Presiona `Ctrl+Shift+Delete` (Windows/Linux) o `Cmd+Shift+Delete` (Mac)
2. Selecciona **"Caché"**
3. En "Intervalo de tiempo" selecciona **"Todo"**
4. Haz clic en **"Limpiar ahora"**

#### Safari
1. Presiona `Cmd+Option+E` para vaciar la cache
2. O ve a **Preferencias > Avanzado** y activa "Mostrar menú Desarrollo"
3. Luego **Desarrollo > Vaciar cachés**

### Opción 3: Modo Incógnito/Privado
1. Abre una **ventana de incógnito/privada**:
   - Chrome/Edge: `Ctrl+Shift+N` (Windows/Linux) o `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
   - Safari: `Cmd+Shift+N`
2. Navega a http://localhost:5175/index.html
3. Si se ve rosa (correcto), confirma que era un problema de cache

### Opción 4: Desactivar Service Worker (Si aplica)
1. Abre **DevTools** (`F12` o `Ctrl+Shift+I`)
2. Ve a la pestaña **"Application"** (Chrome/Edge) o **"Almacenamiento"** (Firefox)
3. En el menú lateral, haz clic en **"Service Workers"**
4. Haz clic en **"Unregister"** o **"Cancelar registro"** para sw.js
5. Recarga la página con `Ctrl+Shift+R`

## Verificación
Después de limpiar la cache, http://localhost:5175/index.html debería verse **idéntico** a http://localhost:5173/index.html:
- ✅ Fondo rosa claro (#F8E6E6) en el hero
- ✅ Botones con gradiente rosa
- ✅ Paleta "Susurro de Rosas"

## Nota Técnica
He agregado parámetros `?v=20250124` a todos los enlaces CSS/JS en index.html para forzar que el navegador descargue las versiones frescas. Esto debería resolver el problema automáticamente al recargar.

---
**Última actualización**: 2025-01-24
