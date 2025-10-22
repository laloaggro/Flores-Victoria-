# 🚀 Entorno de Desarrollo - Guía Rápida

## ⚡ Inicio Ultra-Rápido (< 2 minutos)

### Primera Vez

```bash
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-
./scripts/setup.sh
```

### Uso Diario

```bash
./dev.sh start    # Iniciar
./dev.sh logs     # Ver logs
./dev.sh stop     # Detener
```

## 📋 Comandos Esenciales

### Script Principal: `./dev.sh`

| Comando            | Descripción                 |
| ------------------ | --------------------------- |
| `start`            | Inicia todos los servicios  |
| `stop`             | Detiene todos los servicios |
| `restart`          | Reinicia servicios          |
| `rebuild`          | Reconstruye e inicia        |
| `logs [servicio]`  | Muestra logs                |
| `status`           | Estado de servicios         |
| `test`             | Ejecuta pruebas             |
| `open`             | Abre en navegador           |
| `shell [servicio]` | Shell en contenedor         |
| `clean`            | Limpieza completa           |

### Scripts Adicionales

```bash
./scripts/health-check.sh    # Verifica todos los servicios
./scripts/dev-report.sh      # Reporte completo de desarrollo
./scripts/setup.sh           # Setup inicial del proyecto
./scripts/test-full.sh       # Tests completos
```

## 🌐 Servicios Disponibles

| Servicio        | URL                   | Puerto |
| --------------- | --------------------- | ------ |
| Frontend        | http://localhost:5173 | 5173   |
| Admin Panel     | http://localhost:3010 | 3010   |
| API Gateway     | http://localhost:3000 | 3000   |
| Auth Service    | http://localhost:3001 | 3001   |
| Product Service | http://localhost:3009 | 3009   |

## 🔧 VS Code Integration

### Debugging (F5)

- **Full Stack Debug**: Depura todos los servicios
- **API Gateway**: Solo gateway
- **Auth Service**: Solo autenticación
- **Frontend Chrome**: Frontend en Chrome

### Tasks (Ctrl+Shift+B)

- Iniciar/Detener servicios
- Ver logs
- Reconstruir
- Ejecutar tests

## 📁 Archivos de Configuración

```
.env.development          # Variables de entorno
.vscode/launch.json       # Configuración de debugging
.vscode/tasks.json        # Tareas de VS Code
vite.config.js            # Config de Vite con HMR
docker-compose.dev-simple.yml  # Docker Compose
```

## ⚡ Hot Module Replacement (HMR)

- **Activado** en frontend (Vite)
- **< 1 segundo** para reflejar cambios
- **Polling habilitado** para Docker
- **Overlay de errores** en navegador

## 🧪 Testing

```bash
# Todas las pruebas
./dev.sh test

# Servicio específico
docker compose exec api-gateway npm test

# Con coverage
docker compose exec api-gateway npm run test:coverage
```

## 🐛 Debugging Tips

```bash
# Ver logs en tiempo real
./dev.sh logs frontend

# Acceder a contenedor
./dev.sh shell api-gateway

# Inspeccionar red
docker network inspect flores-victoria_default

# Ver recursos
docker stats
```

## 🚨 Solución Rápida de Problemas

### Servicios no inician

```bash
./dev.sh clean
./dev.sh rebuild
```

### Puerto ocupado

```bash
lsof -ti:5173 | xargs kill -9
```

### HMR no funciona

```bash
./dev.sh rebuild
```

### Ver errores

```bash
./dev.sh logs [servicio]
./scripts/health-check.sh
```

## 📊 Health Check

```bash
./scripts/health-check.sh
```

Verifica:

- ✅ Frontend respondiendo
- ✅ Admin Panel activo
- ✅ API Gateway funcionando
- ✅ Auth Service disponible
- ✅ Product Service activo

## 🔄 Workflow Recomendado

### 1. Inicio del Día

```bash
./dev.sh start
./scripts/health-check.sh
```

### 2. Durante Desarrollo

- Edita código (HMR refleja cambios automáticamente)
- Revisa logs: `./dev.sh logs [servicio]`
- Debug con F5 en VS Code

### 3. Antes de Commit

```bash
./dev.sh test                # Ejecuta tests
./scripts/health-check.sh    # Verifica servicios
git add .
git commit -m "feat: ..."
```

### 4. Fin del Día

```bash
./dev.sh stop
```

## 📚 Documentación Completa

- **`DEVELOPMENT_GUIDE_COMPLETE.md`**: Guía exhaustiva de desarrollo
- **`DEV_IMPROVEMENTS_COMPLETED.md`**: Mejoras implementadas
- **`README.md`**: Documentación general del proyecto

## 💡 Tips de Productividad

1. **Usa `./dev.sh open`** para abrir todos los servicios en el navegador
2. **Configura alias**: `alias dev='./dev.sh'`
3. **Usa VS Code tasks** (Ctrl+Shift+B) para operaciones comunes
4. **Debugging con F5** en lugar de console.log
5. **Health check frecuente** para detectar problemas temprano

## 🎯 Próximos Pasos Sugeridos

1. Lee `DEVELOPMENT_GUIDE_COMPLETE.md` para guía detallada
2. Familiarízate con el script `dev.sh`
3. Configura debugging en VS Code
4. Ejecuta tests para conocer la suite
5. ¡Comienza a desarrollar! 🚀

---

**Creado**: 22 de octubre de 2025  
**Autor**: Mauricio Garay  
**Proyecto**: Flores Victoria
