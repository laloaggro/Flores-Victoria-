# Configuración de Variables de Entorno

Este directorio contiene la configuración de variables de entorno para los microservicios.

## Archivo `.env`

El archivo `.env` contiene las variables de entorno usadas por los servicios en desarrollo. Este archivo **NO** debe ser versionado en Git por razones de seguridad.

### Configuración Inicial

Para configurar tu entorno local:

```bash
# Copiar la plantilla
cp .env.example .env

# Editar con tus valores locales
nano .env  # o tu editor preferido
```

### Variables Importantes

- `JWT_SECRET`: Cambia el valor por defecto en desarrollo y usa uno fuerte en producción
- `MONGO_URI`: URI de conexión a MongoDB
- `REDIS_URL`: URL de Redis (opcional según servicios activos)
- `RABBITMQ_URL`: URL de RabbitMQ (opcional según servicios activos)

### Uso en Docker Compose

El archivo `docker-compose.dev-simple.yml` usa `env_file: ./microservices/.env` para cargar automáticamente estas variables en los contenedores.

### Seguridad

⚠️ **NUNCA** comitees archivos `.env` con secretos reales. El `.gitignore` está configurado para bloquearlos, pero siempre verifica antes de hacer push.

Para producción, usa sistemas de gestión de secretos como:
- Kubernetes Secrets
- AWS Secrets Manager
- HashiCorp Vault
- Docker Secrets
