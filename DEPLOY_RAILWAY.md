# Deploy en Railway (Flores Victoria)

Esta guía te explica cómo desplegar todo el ecosistema de Flores Victoria en Railway usando un solo archivo `docker-compose.yml`.

## Pasos rápidos

1. **Clona o sube el repositorio a GitHub**
   - Repo: https://github.com/laloaggro/Flores-Victoria-

2. **Conecta tu repo a Railway**
   - Ve a https://railway.app/
   - Crea un nuevo proyecto y elige "Deploy from GitHub repo"
   - Selecciona `Flores-Victoria-`

3. **Railway detecta automáticamente el `docker-compose.yml`**
   - No necesitas cambiar el archivo ni agregar scripts extra.
   - Todos los servicios (API Gateway, microservicios, frontend, admin-panel, bases de datos) se construirán y levantarán juntos.

4. **Configura variables de entorno en Railway**
   - Ve a la sección "Variables" del proyecto en Railway.
   - Agrega las variables necesarias (por ejemplo, contraseñas, URIs, claves API) que no deben estar en `.env` local.

5. **Haz push a la rama principal (`main`)**
   - Cada push dispara un build y deploy automático de todo el sistema.

6. **¡Listo!**
   - Railway se encarga del build, deploy y orquestación de todos los servicios.
   - Puedes ver logs, reiniciar servicios y gestionar variables desde el dashboard de Railway.

---

## Recomendaciones

## Variables de entorno requeridas en Railway

Configura estas variables en la sección "Variables" de tu proyecto Railway (no subas datos sensibles al repo):

| Variable                        | Servicio           | Propósito                                 |
|----------------------------------|--------------------|-------------------------------------------|
| PORT                            | api-gateway, admin-panel | Puerto de escucha del servicio           |
| NODE_ENV                        | Todos              | Entorno de ejecución (production)         |
| DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD | auth-service | Conexión a base de datos PostgreSQL      |
| JWT_SECRET                      | auth-service       | Secreto para JWT                          |
| MONGODB_URI                     | product-service    | Conexión a MongoDB                        |
| DISABLE_CACHE                   | product-service    | Desactiva caché (opcional)                |
| REDIS_HOST, REDIS_PORT          | Todos              | Conexión a Redis                          |
| ADMIN_PANEL_PORT                | admin-panel        | Puerto del panel de administración         |
| MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD | mongodb | Credenciales de MongoDB                 |
| RABBITMQ_URL, JAEGER_AGENT_HOST, JAEGER_AGENT_PORT, PROMETHEUS_SCRAPE | Opcional | Observabilidad y mensajería |

Puedes usar el archivo `.env.example` como referencia para copiar y pegar los nombres de variables.
- No subas archivos `.env` con datos sensibles al repo.
- Usa solo el `docker-compose.yml` de la raíz para producción.
- Si necesitas agregar servicios, solo edita el `docker-compose.yml` y haz push.
- Para restaurar la base de datos o backups, usa los volúmenes de Railway o scripts de inicialización.

---

¿Dudas? Consulta la documentación oficial de Railway o abre un issue en el repo.
