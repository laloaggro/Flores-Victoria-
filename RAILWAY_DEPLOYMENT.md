# Despliegue en Railway.app

Este documento describe cómo desplegar Flores Victoria en Railway.app.

## Requisitos previos

1. Cuenta en Railway.app (gratis con $5 USD/mes de créditos)
2. Repositorio en GitHub con el código
3. Git configurado localmente

## Paso 1: Preparar el repositorio

Asegúrate de que todos los cambios estén confirmados:

```bash
git add .
git commit -m "Preparar despliegue para Railway"
git push origin main
```

## Paso 2: Crear proyecto en Railway

1. Ve a [Railway.app](https://railway.app)
2. Haz clic en "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza a Railway para acceder a tu GitHub
5. Selecciona el repositorio `Flores-Victoria-`

## Paso 3: Configurar variables de entorno

Railway detectará automáticamente el `docker-compose.railway.yml`. Configura estas variables en cada
servicio:

### Variables globales (para todos los servicios)

```env
NODE_ENV=production
JWT_SECRET=<generar con: openssl rand -base64 48>
POSTGRES_USER=flores_user
POSTGRES_PASSWORD=<generar con: openssl rand -base64 32>
POSTGRES_DB=flores_db
MONGO_ROOT_USER=flores_admin
MONGO_ROOT_PASSWORD=<generar con: openssl rand -base64 32>
MONGO_DB=flores_products
REDIS_PASSWORD=<generar con: openssl rand -base64 32>
```

### Variables específicas de api-gateway

```env
PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001
USER_SERVICE_URL=http://user-service:3003
PRODUCT_SERVICE_URL=http://product-service:3009
ORDER_SERVICE_URL=http://order-service:3004
CART_SERVICE_URL=http://cart-service:3005
```

## Paso 4: Desplegar

Railway iniciará automáticamente el despliegue:

1. Detecta `docker-compose.railway.yml`
2. Construye todas las imágenes
3. Despliega todos los servicios
4. Asigna URLs públicas

## Paso 5: Verificar el despliegue

Revisa los logs de cada servicio:

```bash
# Instalar Railway CLI (opcional)
npm install -g @railway/cli

# Login
railway login

# Ver logs
railway logs
```

Verifica los healthchecks:

- API Gateway: `https://<api-gateway-url>/health`
- Auth Service: `https://<auth-service-url>/api/auth/health`
- Product Service: `https://<product-service-url>/api/products/health`

## Paso 6: Configurar el frontend

Actualiza las URLs del API en el frontend para apuntar a la URL del api-gateway en Railway.

## Opciones alternativas de bases de datos

### Usar bases de datos administradas de Railway (RECOMENDADO)

Railway ofrece plugins de bases de datos administradas que son más confiables:

1. En el proyecto de Railway, haz clic en "New"
2. Selecciona "Database"
3. Elige PostgreSQL o MongoDB
4. Railway creará la base de datos y proporcionará variables de entorno automáticamente

**Ventajas:**

- Backups automáticos
- Mejor rendimiento
- Incluidos en los créditos gratuitos
- Sin configuración manual

### Usar bases de datos en contenedor (configuración actual)

El `docker-compose.railway.yml` incluye PostgreSQL, MongoDB y Redis en contenedores. Esto funciona
pero es menos confiable para producción.

## Monitoreo de costos

Railway proporciona $5 USD/mes gratis. Monitorea el uso:

1. Ve a "Settings" en tu proyecto
2. Revisa "Usage" para ver el consumo
3. Configura alertas de uso

**Estimación de costos:**

- ~$0.20-0.50 USD/día para desarrollo activo
- ~$5-10 USD/mes para producción ligera

## Solución de problemas

### Los servicios no se pueden conectar

Verifica que las URLs de servicio usen los nombres de contenedor:

- ✅ `http://postgres:5432`
- ❌ `http://localhost:5432`

### Error de memoria

Railway asigna recursos automáticamente. Si un servicio falla por memoria:

1. Ve a configuración del servicio
2. Ajusta los límites de recursos
3. Considera usar el plan Hobby ($5/mes por proyecto) para más recursos

### Builds fallidos

Revisa los logs de build en Railway. Problemas comunes:

- **Falta de dependencias**: Asegúrate que el Dockerfile tenga todas las instalaciones
- **Contexto de build incorrecto**: Verifica que `context: .` apunte a la raíz del repo
- **Módulo shared no encontrado**: Los Dockerfiles ya tienen el fix aplicado

## Ventajas de Railway vs Oracle Cloud

| Característica | Railway                         | Oracle Cloud              |
| -------------- | ------------------------------- | ------------------------- |
| RAM disponible | Escalable automáticamente       | 1GB fijo (Free Tier)      |
| Configuración  | Automática desde docker-compose | Manual                    |
| SSL/HTTPS      | Automático                      | Manual con Let's Encrypt  |
| Despliegue     | Git push → auto-deploy          | Manual rebuild + restart  |
| Monitoreo      | Dashboard integrado             | Prometheus/Grafana manual |
| Bases de datos | Administradas incluidas         | Contenedores manuales     |

## Comandos útiles de Railway CLI

```bash
# Conectar a un proyecto
railway link

# Ver variables de entorno
railway variables

# Ejecutar comando en Railway
railway run <comando>

# Abrir dashboard
railway open

# Ver estado de servicios
railway status
```

## Próximos pasos

1. ✅ Configurar dominio personalizado (opcional)
2. ✅ Habilitar backups automáticos (si usas DBs administradas)
3. ✅ Configurar monitoreo de uptime
4. ✅ Implementar CI/CD con GitHub Actions (despliegue automático en push)
5. ✅ Configurar staging y production environments

## Soporte

- Documentación: https://docs.railway.app
- Discord: https://discord.gg/railway
- GitHub: https://github.com/railwayapp/railway

---

**Nota**: Este despliegue reemplaza la configuración de Oracle Cloud debido a limitaciones de
memoria (1GB insuficiente para microservicios).
