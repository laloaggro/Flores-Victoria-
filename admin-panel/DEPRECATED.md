# ⚠️ DEPRECATED - Admin Panel Legacy

> **Este directorio está DEPRECATED. Use `microservices/admin-dashboard-service/` en su lugar.**

## Migración Completada

Todo el contenido de este panel ha sido migrado al microservicio unificado:

- **Nuevo servicio**: `microservices/admin-dashboard-service/`
- **URL Railway**: https://admin-dashboard-service-production.up.railway.app/
- **Puerto local**: 3021

## ¿Por qué se deprecó?

1. **Unificación**: Todo el panel de administración ahora está consolidado en un solo microservicio
2. **Mantenibilidad**: Un solo lugar para mantener código del admin
3. **Arquitectura**: Sigue el patrón de microservicios del proyecto

## ¿Qué hacer?

### Para desarrollo local:
```bash
cd microservices/admin-dashboard-service
npm install
PORT=3021 npm start
```

### Para Railway:
El servicio `admin-dashboard-service` ya está desplegado y funcional.

## Contenido Migrado

| Archivo Original | Destino |
|-----------------|---------|
| `public/*` | `microservices/admin-dashboard-service/public/` |
| `server.js` | `microservices/admin-dashboard-service/src/server.js` (integrado) |
| `backup-manager.js` | `microservices/admin-dashboard-service/src/services/backup-manager.js` |
| `swagger.js` | `microservices/admin-dashboard-service/src/config/swagger.js` |

## Eliminación

Este directorio puede ser eliminado de forma segura una vez verificada la migración completa.

```bash
# Cuando esté seguro de que todo funciona:
rm -rf admin-panel/
```

---

**Fecha de deprecación**: 2026-01-07  
**Migrado a**: `microservices/admin-dashboard-service/`
