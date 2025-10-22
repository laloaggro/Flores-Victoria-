# Admin Site - Flores Victoria

## 🎯 Descripción
Sitio separado de administración con dashboards y herramientas para gestión del sistema.

## 🚀 Características

### ✅ Seguridad
- Login con autenticación JWT
- Verificación de rol de administrador
- Protección en todas las páginas

### 📊 Dashboards Incluidos
1. **Dashboard de Monitoreo** - Servicios, contenedores, métricas en tiempo real
2. **MCP Dashboard** - Monitor del servidor MCP, eventos y auditorías
3. **Panel de Control** - Gestión de productos, pedidos y configuración
4. **Herramientas de Testing** - Scripts de validación y reportes

### 🔗 Enlaces Rápidos
- Acceso directo a todos los servicios
- Health checks de APIs
- Sitio principal

## 📦 Estructura

```
admin-site/
├── index.html              # Página principal con menú
├── css/
│   └── admin.css          # Estilos globales
├── js/
│   ├── auth.js            # Autenticación y verificación
│   └── main.js            # Funcionalidad principal
├── pages/
│   ├── login.html         # Página de login
│   ├── monitoring-dashboard.html  # Dashboard principal
│   ├── mcp-dashboard.html         # Dashboard MCP
│   ├── testing.html       # Herramientas de testing
│   ├── system-status.html # Estado del sistema
│   └── logs.html          # Logs y analíticas
└── start-server.sh        # Script de inicio
```

## 🎮 Uso

### Iniciar el servidor
```bash
cd admin-site
./start-server.sh
```

## Uso rápido de la Consola de Administración

Arranca el ecosistema con `scripts/start-all-with-admin.sh` y abre `http://localhost:9000/pages/admin-console.html`.

Acciones clave en 60 segundos:

1) Login (página de login) → establece cookie HttpOnly y activa pestañas protegidas.
2) Status: botón "Actualizar estado" para ver compose y health agregados.
3) Servicios:
	- Preset "Start básico": levanta api-gateway, auth-service y product-service.
	- "Restart Gateway": útil si observas 429 o alta latencia.
	- "Reiniciar MCP": reinicia el servidor MCP en 5050.
4) Pipelines:
	- "Smoke ahora": validación rápida end-to-end.
5) Logs:
	- Pull bajo demanda (100-300 líneas) o "Live (SSE)" para stream en tiempo real.

Atajos útiles:

- Lista dinámica de servicios desde docker-compose.
- Rate limit dedicado para endpoints críticos de `/admin/*`.
- Fallback automático a `docker-compose` si no hay `docker compose` v2.

Validación rápida por terminal (opcional):

```
scripts/validate-admin-console.sh
```

Este script intenta: comprobar el admin-site, hacer login en el Gateway, setear cookie, consultar `/admin/status`, listar servicios, ver logs de gateway y lanzar el pipeline smoke.
El servidor se iniciará en **http://localhost:9000**

### Credenciales de acceso
- **Email:** admin@flores.local
- **Password:** admin123
- **Rol requerido:** admin

### Atajos de teclado
- **H** - Ir a página principal
- **D** - Abrir Dashboard de monitoreo
- **M** - Abrir MCP Dashboard

## 🔒 Seguridad

### Autenticación
- JWT token almacenado en localStorage
- Verificación en cada página
- Redirección automática si no está autenticado

### Autorización
- Solo usuarios con rol `admin` pueden acceder
- Verificación del rol en backend
- Cierre de sesión seguro

## 🌐 URLs del Sistema

| Servicio | Puerto | URL |
|----------|--------|-----|
| Admin Site | 9000 | http://localhost:9000 |
| Frontend | 5173 | http://localhost:5173 |
| API Gateway | 3000 | http://localhost:3000 |
| MCP Server | 5050 | http://localhost:5050 |
| Admin Panel | 3010 | http://localhost:3010 |

## 📝 Notas

- El admin-site es **completamente independiente** del sitio principal
- Usa el mismo sistema de autenticación (API Gateway)
- Los dashboards se actualizan automáticamente
- Requiere que los servicios estén corriendo

## 🛠️ Desarrollo

Para agregar nuevas páginas:
1. Crear HTML en `pages/`
2. Agregar enlace en `index.html`
3. Incluir `auth.js` para protección
4. Actualizar este README
