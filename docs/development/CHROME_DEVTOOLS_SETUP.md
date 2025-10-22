# 🔧 Configuración Óptima Chrome DevTools en VS Code

## 📋 Índice
1. [Atajos de Teclado](#atajos-de-teclado)
2. [Configuración de VS Code](#configuración-de-vs-code)
3. [Configuración de Launch.json](#configuración-de-launchjson)
4. [Workflow Recomendado](#workflow-recomendado)
5. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)

---

## ⌨️ Atajos de Teclado

Ya configurados en tu `keybindings.json`:

| Atajo | Comando | Descripción |
|-------|---------|-------------|
| `Ctrl+Shift+R` | Sync & Reload | **Ver cambios inmediatamente** 🔥 |
| `F12` | Open DevTools | Abrir panel de DevTools |
| `Ctrl+Shift+D` | Attach to Chrome | Conectar a Chrome |
| `Ctrl+R` | Reload Page | Recarga rápida |
| `Ctrl+Shift+J` | Show Console | Ver consola |
| `Ctrl+Shift+I` | Toggle DevTools | Alternar panel |

---

## ⚙️ Configuración de VS Code (settings.json)

Agrega estas configuraciones a tu `settings.json` para ver errores inmediatamente:

```json
{
    // ========================================
    // CHROME DEVTOOLS - CONFIGURACIÓN ÓPTIMA
    // ========================================
    
    // Auto-attach a Chrome cuando se inicie
    "chrome.autoAttach": true,
    
    // Auto-reload en cambios de archivos
    "chrome.autoReload": true,
    
    // Mostrar consola de Chrome en VS Code
    "chrome.showConsoleInTerminal": true,
    
    // Puerto para DevTools (por defecto 9222)
    "chrome.port": 9222,
    
    // Iniciar Chrome con depuración remota
    "chrome.remoteDebugging": true,
    
    // URL por defecto para abrir
    "chrome.url": "http://localhost:3010",
    
    // ========================================
    // DETECCIÓN DE ERRORES EN TIEMPO REAL
    // ========================================
    
    // ESLint - Detectar errores JavaScript
    "eslint.enable": true,
    "eslint.autoFixOnSave": true,
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "html"
    ],
    
    // HTML/CSS Validation
    "html.validate.scripts": true,
    "html.validate.styles": true,
    "css.validate": true,
    
    // TypeScript/JavaScript validation
    "javascript.validate.enable": true,
    "typescript.validate.enable": true,
    
    // Mostrar errores en línea
    "problems.decorations.enabled": true,
    
    // Auto-save para ver cambios inmediatamente
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 500,
    
    // ========================================
    // LIVE SERVER / HOT RELOAD
    // ========================================
    
    // Live Server settings
    "liveServer.settings.donotShowInfoMsg": false,
    "liveServer.settings.donotVerifyTags": false,
    "liveServer.settings.CustomBrowser": "chrome",
    "liveServer.settings.AdvanceCustomBrowserCmdLine": "google-chrome --remote-debugging-port=9222",
    
    // ========================================
    // CONSOLA Y OUTPUT
    // ========================================
    
    // Mostrar output automáticamente
    "debug.showInStatusBar": "always",
    "debug.inlineValues": true,
    "debug.console.fontSize": 14,
    "debug.console.lineHeight": 20,
    
    // ========================================
    // FORMATEO AUTOMÁTICO
    // ========================================
    
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true,
    
    // ========================================
    // ERROR LENS (Extensión Recomendada)
    // ========================================
    
    "errorLens.enabled": true,
    "errorLens.enabledDiagnosticLevels": [
        "error",
        "warning",
        "info"
    ],
    "errorLens.fontSize": "14px",
    "errorLens.messageBackgroundMode": "line"
}
```

---

## 🚀 Configuración de Launch.json

Crea o actualiza `.vscode/launch.json` en tu proyecto:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Chrome - Admin Panel",
            "type": "chrome",
            "request": "launch",
            "url": "http://localhost:3010",
            "webRoot": "${workspaceFolder}/admin-panel/public",
            "sourceMaps": true,
            "trace": true,
            "userDataDir": "${workspaceFolder}/.vscode/chrome-debug",
            "runtimeArgs": [
                "--remote-debugging-port=9222",
                "--disable-web-security",
                "--auto-open-devtools-for-tabs"
            ]
        },
        {
            "name": "Launch Chrome - Frontend",
            "type": "chrome",
            "request": "launch",
            "url": "http://localhost:5173",
            "webRoot": "${workspaceFolder}/frontend",
            "sourceMaps": true,
            "trace": true,
            "userDataDir": "${workspaceFolder}/.vscode/chrome-debug-frontend",
            "runtimeArgs": [
                "--remote-debugging-port=9223",
                "--auto-open-devtools-for-tabs"
            ]
        },
        {
            "name": "Attach to Chrome",
            "type": "chrome",
            "request": "attach",
            "port": 9222,
            "webRoot": "${workspaceFolder}",
            "trace": true
        }
    ]
}
```

---

## 📊 Workflow Recomendado para Ver Errores Inmediatamente

### **Opción 1: Desarrollo Rápido (Recomendada) 🔥**

1. **Iniciar servicios**:
   ```bash
   cd /home/impala/Documentos/Proyectos/flores-victoria
   docker compose -f docker-compose.dev-simple.yml up -d
   ```

2. **Abrir Chrome con debugging**:
   ```bash
   google-chrome --remote-debugging-port=9222 http://localhost:3010
   ```

3. **En VS Code**:
   - Presiona `F5` → Selecciona "Attach to Chrome"
   - O usa `Ctrl+Shift+D` → "Attach to Chrome"

4. **Editar archivos**:
   - Modifica HTML/CSS/JS
   - Presiona `Ctrl+Shift+R` para ver cambios **INMEDIATAMENTE**
   - Los errores aparecen en la consola de VS Code

### **Opción 2: Con Live Reload Automático**

1. **Instalar extensión Live Server**:
   ```bash
   code --install-extension ritwickdey.LiveServer
   ```

2. **Click derecho en HTML** → "Open with Live Server"

3. **Los cambios se recargan automáticamente**

### **Opción 3: Con Browser Sync (Mejor para desarrollo)**

1. **Instalar Browser Sync**:
   ```bash
   npm install -g browser-sync
   ```

2. **Iniciar con proxy**:
   ```bash
   browser-sync start --proxy "localhost:3010" --files "admin-panel/public/**/*"
   ```

3. **Acceder a**: http://localhost:3000 (con hot reload)

---

## 🎯 Extensiones Recomendadas

Instala estas extensiones para ver errores inmediatamente:

```bash
# Error Lens (Ver errores en línea)
code --install-extension usernamehw.errorlens

# ESLint (Detectar errores JS)
code --install-extension dbaeumer.vscode-eslint

# HTML CSS Support
code --install-extension ecmel.vscode-html-css

# Live Server
code --install-extension ritwickdey.LiveServer

# Console Ninja (Ver console.log en VS Code)
code --install-extension WallabyJs.console-ninja

# JavaScript Debugger
code --install-extension ms-vscode.js-debug

# Better Comments
code --install-extension aaron-bond.better-comments
```

### Instalar todas de una vez:
```bash
code --install-extension usernamehw.errorlens \
     --install-extension dbaeumer.vscode-eslint \
     --install-extension ecmel.vscode-html-css \
     --install-extension ritwickdey.LiveServer \
     --install-extension WallabyJs.console-ninja \
     --install-extension ms-vscode.js-debug
```

---

## 🐛 Ver Errores en Tiempo Real

### **Panel de Problemas de VS Code**
- `Ctrl+Shift+M` → Abre panel de problemas
- Muestra todos los errores de HTML, CSS, JS

### **Console Ninja (Recomendado)**
- Ver `console.log()` directamente en VS Code
- No necesitas abrir DevTools
- Muestra valores de variables en línea

### **Error Lens**
- Muestra errores directamente en el código
- Resalta líneas con problemas
- Tooltips informativos

---

## 🔴 Errores Comunes y Soluciones

### **1. Chrome no se conecta**
```bash
# Matar procesos de Chrome
pkill chrome

# Iniciar con debugging
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug http://localhost:3010
```

### **2. No se ven cambios al recargar**
```bash
# Limpiar caché de Docker
docker compose -f docker-compose.dev-simple.yml down -v
docker compose -f docker-compose.dev-simple.yml up -d --build

# O forzar recarga en Chrome
Ctrl+Shift+Delete → Limpiar caché
```

### **3. Puerto 9222 ocupado**
```bash
# Ver qué usa el puerto
lsof -i :9222

# Usar puerto alternativo
google-chrome --remote-debugging-port=9223 http://localhost:3010
```

### **4. Los errores no aparecen**
- Verifica que `chrome.showConsoleInTerminal: true` esté en settings.json
- Abre panel de Debug Console: `Ctrl+Shift+Y`
- Verifica panel de Problemas: `Ctrl+Shift+M`

---

## 🎨 Scripts Útiles

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "dev": "docker compose -f docker-compose.dev-simple.yml up -d",
    "dev:watch": "browser-sync start --proxy 'localhost:3010' --files 'admin-panel/public/**/*'",
    "dev:chrome": "google-chrome --remote-debugging-port=9222 http://localhost:3010",
    "stop": "docker compose -f docker-compose.dev-simple.yml down",
    "clean": "docker compose -f docker-compose.dev-simple.yml down -v && docker system prune -f",
    "logs": "docker compose -f docker-compose.dev-simple.yml logs -f admin-panel"
  }
}
```

---

## 📱 Vista Rápida de Errores

### **En VS Code Terminal**:
```bash
# Ver logs del contenedor en tiempo real
docker compose -f docker-compose.dev-simple.yml logs -f admin-panel

# Ver solo errores
docker compose -f docker-compose.dev-simple.yml logs admin-panel 2>&1 | grep -i error
```

### **En Chrome DevTools**:
- `Ctrl+Shift+J` → Console
- `Ctrl+Shift+I` → DevTools completo
- `Ctrl+Shift+C` → Inspect element

---

## 🎯 Resumen de Comandos Rápidos

```bash
# Iniciar todo
docker compose -f docker-compose.dev-simple.yml up -d

# Abrir Chrome con debugging
google-chrome --remote-debugging-port=9222 http://localhost:3010

# En VS Code:
Ctrl+Shift+R    # Sync & Reload (ver cambios AHORA)
F12             # Abrir DevTools
Ctrl+Shift+M    # Panel de Problemas
Ctrl+Shift+Y    # Debug Console
Ctrl+`          # Terminal

# Ver logs en tiempo real
docker logs -f flores-victoria-admin-panel-1
```

---

## ✅ Checklist de Configuración

- [ ] Atajos de teclado configurados en `keybindings.json`
- [ ] Settings.json actualizado con configuración óptima
- [ ] Launch.json creado en `.vscode/`
- [ ] Extensiones instaladas (Error Lens, Console Ninja, etc.)
- [ ] Chrome iniciado con `--remote-debugging-port=9222`
- [ ] VS Code conectado a Chrome (F5 → Attach)
- [ ] Auto-save habilitado (500ms delay)
- [ ] Panel de Problemas abierto (`Ctrl+Shift+M`)
- [ ] Debug Console visible (`Ctrl+Shift+Y`)

---

## 🚀 Siguiente Nivel

### **Hot Module Replacement (HMR)**
Para recargas ultra-rápidas sin perder el estado:

```bash
# Vite (para frontend moderno)
npm create vite@latest

# O Webpack Dev Server
npm install --save-dev webpack-dev-server
```

### **Source Maps**
Ya configurado en launch.json para mapear código minificado a original

### **Browser Sync Multi-dispositivo**
Prueba en móvil, tablet y desktop simultáneamente:
```bash
browser-sync start --proxy "localhost:3010" --files "**/*" --no-notify
```

---

## 📝 Notas Finales

- **Ctrl+Shift+R es tu mejor amigo**: Sync & Reload instantáneo
- **Error Lens**: Muestra errores en línea (instálalo YA)
- **Console Ninja**: Ver console.log sin abrir DevTools
- **Auto-save activo**: Cambios guardados cada 500ms
- **Debug Console**: Ver todos los errores en VS Code

---

**¡Listo para desarrollo productivo!** 🎉

Con esta configuración verás errores **INMEDIATAMENTE** sin salir de VS Code.
