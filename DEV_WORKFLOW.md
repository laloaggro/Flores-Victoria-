# Guía de Desarrollo - Flores Victoria

## 🚀 Inicio Rápido

### Levantar el entorno de desarrollo

```bash
npm run dev:up
```

Esto levanta:
- **API Gateway** (puerto 3000) - Enrutador principal
- **Auth Service** (puerto 3001) - Autenticación y usuarios
- **Product Service** (puerto 3009) - Catálogo de productos
- **Frontend** (puerto 5173) - Aplicación web con Vite
- **Admin Panel** (puerto 3010) - Panel de administración

### URLs de Desarrollo

- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Admin Panel: http://localhost:3010

### Comandos Útiles

```bash
# Ver logs de todos los servicios
npm run dev:logs

# Ver logs de un servicio específico
npm run dev:logs:gateway
npm run dev:logs:auth
npm run dev:logs:products
npm run dev:logs:frontend

# Reiniciar un servicio específico
npm run dev:restart:gateway
npm run dev:restart:auth
npm run dev:restart:products
npm run dev:restart:frontend

# Ver estado de los servicios
npm run dev:ps

# Detener todo
npm run dev:down

# Limpiar contenedores, volúmenes y huérfanos
npm run dev:clean
```

## 🔧 Flujo de Trabajo

### 1. Desarrollo de Frontend

El frontend usa **Vite** con hot-reload automático:

```bash
# Los cambios en frontend/public/ se reflejan automáticamente
cd frontend/public
# Editar archivos HTML, JS, CSS...
```

**Estructura importante:**
- `frontend/public/` - Fuente activa (NO usar `frontend/assets/`)
- `frontend/public/js/components/` - Componentes reutilizables
- `frontend/public/js/config/api.js` - Configuración de endpoints
- `frontend/pages/` - Páginas HTML

### 2. Desarrollo de Microservicios

Los microservicios tienen volúmenes montados para hot-reload:

```bash
# Editar código en microservices/auth-service/src/
# Los cambios se detectan automáticamente con nodemon
```

Si necesitas reinstalar dependencias:

```bash
docker compose -f docker-compose.dev.yml down
npm run dev:stack  # Rebuild completo
```

### 3. Testing del Flujo de Autenticación

```bash
# 1. Abrir http://localhost:5173
# 2. Ir a /pages/login.html
# 3. Credenciales de prueba:
#    Usuario: admin@test.com
#    Password: admin123
# 4. Verificar que el menú muestre "Panel de administración"
```

**Login endpoint:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### 4. Testing de Productos

```bash
# Listar productos
curl http://localhost:3000/api/products

# Health check
curl http://localhost:3000/api/products/health
```

## 📝 Estructura del Proyecto

```
flores-victoria/
├── frontend/
│   ├── public/          ← FUENTE ACTIVA
│   │   ├── js/
│   │   │   ├── components/
│   │   │   │   ├── utils/
│   │   │   │   │   ├── utils.js      # Auth, tokens
│   │   │   │   │   └── userMenu.js   # Menú dinámico
│   │   │   └── config/
│   │   │       └── api.js             # Endpoints API
│   │   └── images/
│   └── pages/           # Páginas HTML
│
├── microservices/
│   ├── api-gateway/     # Puerto 3000
│   ├── auth-service/    # Puerto 3001
│   └── product-service/ # Puerto 3009
│
└── docker-compose.dev.yml  # Stack de desarrollo
```

## 🐛 Debugging

### Ver logs en tiempo real

```bash
# Todos los servicios
npm run dev:logs

# Solo gateway (útil para ver requests)
npm run dev:logs:gateway

# Solo auth (útil para debug de login)
npm run dev:logs:auth
```

### Problemas comunes

#### 1. "Cannot connect to API"
```bash
# Verificar que el gateway esté corriendo
curl http://localhost:3000/api/products/health

# Si falla, reiniciar gateway
npm run dev:restart:gateway
```

#### 2. "Menú no muestra usuario autenticado"
```bash
# Verificar localStorage en DevTools > Application > Local Storage
# Debe tener: token, authToken, user

# Verificar logs del auth-service
npm run dev:logs:auth
```

#### 3. "Frontend no carga"
```bash
# Reiniciar frontend
npm run dev:restart:frontend

# Ver logs
npm run dev:logs:frontend
```

## 🔄 Hot Reload

### Frontend
- ✅ **Automático** - Vite detecta cambios en `frontend/public/`
- ✅ Recarga instantánea del navegador

### Microservicios
- ✅ **Automático** - Nodemon detecta cambios en `src/`
- ⚠️ Si cambias `package.json`, ejecuta `npm run dev:stack` para rebuild

### Configuración de Docker
- ❌ **Manual** - Cambios en `docker-compose.dev.yml` requieren:
  ```bash
  npm run dev:down
  npm run dev:stack
  ```

## 📦 Dependencias

### Instalar/actualizar dependencias de un servicio

```bash
# Ejemplo: auth-service
cd microservices/auth-service
npm install nueva-libreria

# Rebuild el servicio
docker compose -f ../../docker-compose.dev.yml up --build -d auth-service
```

## 🎯 Próximos Pasos

- [ ] Implementar tests E2E con Playwright
- [ ] Agregar Storybook para componentes
- [ ] Configurar ESLint y Prettier
- [ ] Migrar a JWT real (actualmente tokens opacos)
- [ ] Implementar refresh tokens

## 📚 Referencias

- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Guía de Docker Compose
- [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - Arquitectura técnica
- [docs/USER_MENU_CORRECTION.md](./docs/USER_MENU_CORRECTION.md) - Correcciones del menú
