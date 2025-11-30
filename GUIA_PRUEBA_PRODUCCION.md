# 🧪 Guía de Prueba - Flores Victoria en Producción

## URLs de la Aplicación

- **API Gateway**: https://api-gateway-production-949b.up.railway.app
- **Frontend**: [Obtener de Railway Dashboard]
- **Railway Dashboard**: https://railway.app

## Credenciales de Prueba

```
Email: admin@floresvictoria.com
Password: Admin123!
```

⚠️ **IMPORTANTE**: Cambiar estas credenciales en producción real.

## Checklist de Pruebas

### 1. Frontend Básico
- [ ] El frontend carga sin errores
- [ ] Los estilos se aplican correctamente
- [ ] Las imágenes cargan

### 2. Autenticación
- [ ] Página de login se muestra
- [ ] Login con credenciales admin funciona
- [ ] Token JWT se guarda correctamente
- [ ] Logout funciona

### 3. Catálogo de Productos
- [ ] Lista de productos se carga
- [ ] Se muestran los 5 productos de prueba:
  - Ramo de Rosas Rojas ($25,000)
  - Arreglo Primaveral ($35,000)
  - Rosas Blancas ($28,000)
  - Bouquet Mixto ($32,000)
  - Orquídea Phalaenopsis ($45,000)
- [ ] Filtros funcionan (si existen)
- [ ] Vista detalle de producto funciona

### 4. Carrito de Compras
- [ ] Añadir producto al carrito funciona
- [ ] Actualizar cantidad funciona
- [ ] Eliminar producto del carrito funciona
- [ ] Total se calcula correctamente

### 5. Proceso de Compra
- [ ] Formulario de checkout se muestra
- [ ] Validación de campos funciona
- [ ] Crear orden funciona
- [ ] Confirmación de orden se muestra

### 6. Área de Admin (si admin@floresvictoria.com)
- [ ] Dashboard admin se carga
- [ ] Lista de pedidos funciona
- [ ] Gestión de productos funciona
- [ ] Mensajes de contacto se muestran

### 7. Formulario de Contacto
- [ ] Formulario se muestra
- [ ] Validación funciona
- [ ] Enviar mensaje funciona
- [ ] Confirmación se muestra

## Pruebas de API Directas

### Verificar API Gateway
```bash
curl https://api-gateway-production-949b.up.railway.app/
```
Esperado: `{"status":"success","message":"API Gateway - Arreglos Victoria"}`

### Login
```bash
curl -X POST https://api-gateway-production-949b.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@floresvictoria.com",
    "password": "Admin123!"
  }'
```

### Listar Productos (requiere token)
```bash
curl https://api-gateway-production-949b.up.railway.app/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Problemas Comunes y Soluciones

### Frontend no carga
- Verificar que VITE_API_URL está configurada en Railway
- Verificar que el servicio frontend está "Active" en Railway
- Revisar logs del frontend en Railway

### API devuelve 404
- Verificar que los servicios backend están activos
- Verificar las rutas en el API Gateway
- Revisar logs del API Gateway

### Login no funciona
- Verificar que AUTH-SERVICE está activo
- Verificar PostgreSQL está conectado
- Verificar que el usuario admin existe en la base de datos

### Productos no cargan
- Verificar que PRODUCT-SERVICE está activo
- Verificar MongoDB está conectado
- Verificar que hay productos en la base de datos

## Comandos Útiles

### Ver estado de servicios
```bash
./scripts/railway-health-report.sh
```

### Ver logs de un servicio
```bash
railway logs --service NOMBRE-SERVICIO
```

### Verificar base de datos PostgreSQL
```bash
railway connect Postgres
```

## Siguientes Pasos Después de Pruebas

1. **Configurar Dominio Personalizado**
   - Railway → Frontend → Settings → Domains
   - Añadir dominio personalizado (ej: www.floresvictoria.com)

2. **Seguridad**
   - Cambiar contraseña del admin
   - Revisar permisos de usuario
   - Configurar CORS apropiadamente

3. **Monitoreo**
   - Configurar alertas en Railway
   - Revisar métricas de uso
   - Configurar logs centralizados

4. **Optimización**
   - Configurar CDN para assets estáticos
   - Optimizar imágenes de productos
   - Configurar caché

## Soporte

Para más información:
- Documentación del proyecto: Ver README.md
- Railway Docs: https://docs.railway.app
