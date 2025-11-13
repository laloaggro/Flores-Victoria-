# 🧹 Instrucciones para Limpiar Caché del Navegador

## Problema
Después de realizar cambios en el código frontend, el navegador puede mostrar errores porque tiene archivos antiguos en caché (Service Worker, scripts, CSS).

## Solución Rápida

### 1️⃣ Reiniciar el Servidor Vite
```bash
# Detener el servidor actual (Ctrl+C en la terminal)
# Luego iniciar nuevamente:
cd frontend
npm run dev
```

### 2️⃣ Limpiar Caché del Navegador (Chrome/Edge)

**Opción A: Hard Refresh (Recarga Forzada)**
- Windows/Linux: `Ctrl + Shift + R` o `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Opción B: Limpiar desde DevTools**
1. Abrir DevTools: `F12` o `Ctrl + Shift + I`
2. Click derecho en el botón de recarga (⟳)
3. Seleccionar **"Vaciar caché y volver a cargar de manera forzada"**

**Opción C: Desregistrar Service Worker manualmente**
1. Abrir DevTools: `F12`
2. Ir a pestaña **Application** (o Aplicación)
3. En el menú lateral: **Service Workers**
4. Click en **"Unregister"** (Desregistrar) al lado de cada Service Worker
5. Recargar la página: `Ctrl + Shift + R`

### 3️⃣ Limpiar Caché del Navegador (Firefox)
- Windows/Linux: `Ctrl + Shift + Delete`
- Mac: `Cmd + Shift + Delete`
- Seleccionar: **Caché** y **Datos de sitios web** (últimas 24 horas)
- Click en **"Limpiar ahora"**

### 4️⃣ Modo Incógnito/Privado (Testing Rápido)
Abrir en modo incógnito para probar sin caché:
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`

## 🔧 Verificación Post-Limpieza

Después de limpiar, verificar que ya no aparezcan estos errores:

✅ **Debe desaparecer:**
- `Uncaught SyntaxError: Unexpected token 'export'`
- `[SW] ❌ Error: Failed to fetch`
- `WebSocket connection failed` (si el servidor está corriendo)

✅ **Debe aparecer:**
- `✅ Service Worker registrado`
- `✅ Core bundle cargado`
- `ℹ️ Lazy load observer no disponible` (es normal, no es un error)
- `[vite] connected` (conexión WebSocket exitosa)

## 📝 Cambios Recientes Aplicados

1. **lazy-load.js**: Eliminado `export default`, ahora usa `window.LazyLoader`
2. **Service Worker v2.1.0**: Manejo inteligente de errores para recursos opcionales
3. **vite.config.js**: Configuración explícita de HMR con WebSocket
4. **common-bundle.js**: Error handling graceful para archivos opcionales

## 🚀 Workflow Recomendado para Desarrollo

```bash
# 1. Hacer cambios en código
# 2. Si cambias archivos que usa el Service Worker:
cd frontend
npm run dev  # Reiniciar servidor

# 3. En el navegador:
# - Abrir DevTools (F12)
# - Application > Service Workers > Unregister
# - Hard Refresh (Ctrl + Shift + R)

# 4. Verificar consola limpia sin errores
```

## 🎯 Problemas Comunes

### "WebSocket connection failed" persiste
- **Causa**: Servidor Vite no está corriendo
- **Solución**: `cd frontend && npm run dev`

### "Unexpected token 'export'" persiste
- **Causa**: Navegador tiene versión antigua de `lazy-load.js`
- **Solución**: Hard Refresh (`Ctrl + Shift + R`)

### "[SW] ❌ Error: Failed to fetch" persiste
- **Causa**: Service Worker v2.0.0 antiguo en caché
- **Solución**: Unregister Service Worker en DevTools > Application

### "Header mount point #header-root not found"
- **Causa**: Página no tiene el elemento `<div id="header-root">`
- **Solución**: Normal si la página usa header estático, ignorar este warning

## ✅ Estado Esperado Final

```
[vite] connected.
✅ Flores Victoria - App loaded
✅ Core bundle cargado
ℹ️ Lazy load observer no disponible (usando lazy-load.js estándar)
✅ Components loader inicializado
✅ Sistema de code splitting activo
✅ Service Worker registrado: http://localhost:5173/
📊 Performance metrics...
```

---
**Fecha de última actualización**: 11 de noviembre de 2025
**Versión Service Worker**: v2.1.0
