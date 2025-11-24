# 🚀 Quick Reference - Flores Victoria

Guía rápida de comandos más usados. Para documentación completa, ver [`docs/`](./docs/).

## 🎯 Inicio Rápido

```bash
# Menú interactivo (RECOMENDADO)
npm run menu

# Iniciar todo el stack
npm start

# Detener todo
npm stop

# Ver estado de servicios
npm run check:services
```

## 📦 Scripts Principales

### Docker & Servicios

```bash
npm run dev:up              # Iniciar en modo desarrollo
npm run dev:down            # Detener servicios
npm run dev:ps              # Ver estado
npm run dev:logs            # Ver logs de todos
npm run dev:logs:gateway    # Logs del API Gateway
npm run dev:logs:auth       # Logs del Auth Service
npm run dev:logs:products   # Logs del Product Service
```

### Admin Panel

```bash
npm run admin:start         # Iniciar admin panel
npm run admin:stop          # Detener admin panel
npm run admin:restart       # Reiniciar admin panel
npm run admin:logs          # Ver logs
npm run admin:status        # Ver estado detallado
```

### Chrome Debugging

```bash
npm run chrome:debug:admin      # Debug admin panel
npm run chrome:debug:frontend   # Debug frontend
```

### Testing

```bash
npm run test:watch          # Watch mode (RECOMENDADO)
npm run test:unit           # Tests unitarios
npm run test:integration    # Tests de integración
npm run test:coverage       # Ver cobertura
npm run test:e2e            # Tests E2E
npm run test:all            # Todos los tests
```

### Linting & Formatting

```bash
npm run lint                # Verificar errores
npm run lint:fix            # Auto-fix errores
npm run format              # Formatear código
npm run format:check        # Solo verificar formato
```

### Bases de Datos

```bash
npm run db:up               # Iniciar solo DBs
npm run db:down             # Detener DBs
npm run db:logs             # Ver logs
npm run db:seed             # Cargar datos de prueba
npm run backup:db           # Backup de bases de datos
```

### Diagnóstico & Mantenimiento

```bash
npm run diagnostics         # Diagnóstico avanzado
npm run check:critical      # Verificar servicios críticos
npm run fix:auto            # Auto-fix problemas comunes
npm run clean:logs          # Limpiar logs antiguos
npm run clean:backups       # Limpiar backups antiguos
npm run dashboard           # Dashboard interactivo
```

### Documentación

```bash
npm run docs:organize       # Organizar documentación
npm run docs:serve          # Servir docs en :8080
```

### Optimización

```bash
npm run optimize:images     # Optimizar imágenes
npm run sitemap:generate    # Generar sitemap
npm run audit:lighthouse    # Lighthouse audit
```

## 🏗️ Arquitectura

```
flores-victoria/
├── admin-panel/          # Panel de administración (puerto 3010)
├── frontend/             # Frontend público (puerto 5173)
├── backend/              # Microservicios
│   ├── api-gateway/     # Gateway principal (puerto 3000)
│   ├── auth-service/    # Autenticación (puerto 3001)
│   └── product-service/ # Productos (puerto 3009)
├── scripts/             # Scripts de automatización
├── docs/                # Documentación organizada
│   ├── architecture/    # Arquitectura del sistema
│   ├── development/     # Guías de desarrollo
│   ├── validation/      # Documentos de validación
│   ├── guides/          # Guías y tutoriales
│   └── admin-panel/     # Docs del admin panel
├── k8s/                 # Kubernetes manifests
└── .vscode/             # Configuración de VS Code
    ├── flores-victoria.code-snippets  # 18 snippets
    ├── BREAKPOINTS_GUIDE.md           # Guía de debugging
    └── TESTING_GUIDE.md               # Guía de testing
```

## 🔧 Puertos Utilizados

| Servicio        | Puerto | URL                   |
| --------------- | ------ | --------------------- |
| API Gateway     | 3000   | http://localhost:3000 |
| Auth Service    | 3001   | http://localhost:3001 |
| Product Service | 3009   | http://localhost:3009 |
| Admin Panel     | 3010   | http://localhost:3010 |
| Frontend        | 5173   | http://localhost:5173 |
| Grafana         | 3000   | http://localhost:3000 |
| Elasticsearch   | 9200   | http://localhost:9200 |
| Kibana          | 5601   | http://localhost:5601 |
| MongoDB         | 27017  | -                     |
| Redis           | 6379   | -                     |

## 🎨 Snippets Disponibles

En VS Code, escribe estos prefixes y presiona Tab:

### HTML/Admin

- `admin-page` → Template completo de página admin
- `card-component` → Card con estilo Flores Victoria
- `table-component` → Tabla responsive
- `btn-primary` → Botón primario
- `alert-component` → Alertas (4 tipos)

### JavaScript

- `fetch-get` → GET request con manejo de errores
- `fetch-post` → POST request completo
- `api-client` → Cliente API CRUD
- `debounce` → Función debounce
- `storage-helper` → localStorage helper
- `event-listener` → Event listener completo

### Node.js

- `express-route` → Express route handler
- `mongoose-schema` → Mongoose schema

## ⌨️ Atajos de Teclado

### Multi-Cursor

- `Ctrl+D` → Seleccionar siguiente ocurrencia
- `Ctrl+Shift+L` → Seleccionar todas las ocurrencias
- `Ctrl+Alt+Down/Up` → Agregar cursor arriba/abajo

### Edición

- `Alt+Up/Down` → Mover línea
- `Ctrl+Shift+D` → Duplicar línea
- `Ctrl+Shift+K` → Eliminar línea
- `Shift+Alt+F` → Formatear documento

### Navegación

- `Ctrl+P` → Quick open archivo
- `F12` → Ir a definición
- `Shift+F12` → Ver referencias
- `F2` → Renombrar símbolo

### Debugging

- `F9` → Toggle breakpoint
- `F5` → Start/Continue debugging
- `F10` → Step over
- `F11` → Step into

## 🐛 Debugging Avanzado

### Breakpoints Condicionales

1. `F9` para agregar breakpoint
2. Click derecho → "Edit Breakpoint"
3. Agregar condición: `user.role === 'admin'`

### Logpoints

1. Click derecho en línea → "Add Logpoint"
2. Escribir: `"User: {user.name}, Role: {user.role}"`
3. No modifica código, imprime en consola

Ver guía completa: `.vscode/BREAKPOINTS_GUIDE.md`

## 🧪 Testing

### Watch Mode (Recomendado para desarrollo)

```bash
npm run test:watch

# En watch mode:
# a - Ejecutar todos los tests
# f - Solo tests fallidos
# p - Filtrar por archivo
# t - Filtrar por nombre de test
# q - Salir
```

### Debugging de Tests

1. Abrir archivo de test
2. `F9` para agregar breakpoint
3. `F5` → Seleccionar "Jest: Current File"

Ver guía completa: `.vscode/TESTING_GUIDE.md`

## 📚 Documentación Completa

```bash
# Ver índice de documentación
cat docs/README.md

# Abrir documentos
code docs/development/DEVELOPMENT_GUIDE.md
code docs/architecture/ARCHITECTURE.md
code docs/validation/VALIDATION_CHECKLIST.md
```

## 🔥 Workflow Recomendado

### Terminal 1: Testing Watch Mode

```bash
npm run test:watch
```

### Terminal 2: Servicios

```bash
npm start
```

### Terminal 3: Chrome Debugging

```bash
npm run chrome:debug:admin
```

### VS Code

- Usa snippets para código rápido
- `Ctrl+D` para multi-cursor
- `F9` + breakpoints condicionales
- `F5` para attach debugger

## 🆘 Solución de Problemas

### Servicios no inician

```bash
npm run diagnostics         # Diagnóstico completo
npm run fix:auto           # Auto-fix problemas
npm run check:critical     # Verificar servicios críticos
```

### Errores de puertos

```bash
# Ver qué está usando los puertos
npm run check:services

# Detener todo y limpiar
npm run dev:clean
```

### Performance issues

```bash
# Ver uso de recursos
docker stats

# Limpiar logs y backups
npm run clean:logs
npm run clean:backups
```

## 🎯 Pre-Commit Hooks

Configurado con **Husky + lint-staged**. Automáticamente antes de cada commit:

1. ✅ ESLint auto-fix
2. ✅ Prettier format
3. ✅ Tests ejecutados

Si falla algún check, el commit es bloqueado.

## 🚀 Deploy

### Kubernetes

```bash
# Desplegar en Kubernetes
kubectl apply -f k8s/

# Ver estado
kubectl get pods
kubectl get services
```

### Docker Compose (Producción)

```bash
npm run prod:up
npm run prod:down
```

## 📊 Métricas y Monitoring

- **Grafana**: http://localhost:3000
- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200

Acceder desde Admin Panel: http://localhost:3010

## 💡 Tips Productivos

1. **Usa el menú interactivo**: `npm run menu`
2. **Watch mode para tests**: Feedback instantáneo
3. **Snippets**: 80% menos typing
4. **Multi-cursor**: `Ctrl+D` es tu amigo
5. **Logpoints**: Debug sin modificar código
6. **Pre-commit hooks**: Calidad garantizada

## 🔗 Links Útiles

- [Documentación completa](./docs/)
- [Guía de desarrollo](./docs/development/DEVELOPMENT_GUIDE.md)
- [Arquitectura](./docs/architecture/ARCHITECTURE.md)
- [Guía de breakpoints](./.vscode/BREAKPOINTS_GUIDE.md)
- [Guía de testing](./.vscode/TESTING_GUIDE.md)
- [Mejoras implementadas](./docs/guides/MEJORAS_IMPLEMENTADAS.md)

## 📝 Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) para historial de cambios.

## 📄 Licencia

UNLICENSED - Proyecto privado

---

**Última actualización**: 2025-10-22

Para más información, ejecuta `npm run menu` o consulta la [documentación completa](./docs/).
