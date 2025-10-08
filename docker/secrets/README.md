# Docker Secrets

Este directorio contiene los secretos utilizados por los servicios de Docker.

**IMPORTANTE**: Este directorio contiene archivos de ejemplo. Para usar el sistema, debe copiar los archivos del directorio `examples` y reemplazarlos con valores reales y seguros.

## Cómo usar los secretos

1. Copiar los archivos de ejemplo:
   ```bash
   cp examples/*.txt .
   ```

2. Editar cada archivo y reemplazar el contenido con valores seguros reales.

3. Para usar secretos en Docker Swarm:
   ```bash
   echo "$(cat mongo_root_password.txt)" | docker secret create mongo_root_password -
   echo "$(cat postgres_password.txt)" | docker secret create postgres_password -
   echo "$(cat rabbitmq_password.txt)" | docker secret create rabbitmq_password -
   echo "$(cat jwt_secret.txt)" | docker secret create jwt_secret -
   echo "$(cat email_password.txt)" | docker secret create email_password -
   ```

4. Referenciar secretos en docker-compose.yml:
   ```yaml
   services:
     mi_servicio:
       secrets:
         - mongo_root_password
         - postgres_password
         - rabbitmq_password
         - jwt_secret
         - email_password
   
   secrets:
     mongo_root_password:
       external: true
     postgres_password:
       external: true
     rabbitmq_password:
       external: true
     jwt_secret:
       external: true
     email_password:
       external: true
   ```

5. Los secretos estarán disponibles en `/run/secrets/nombre_secreto` dentro del contenedor.

## Secretos recomendados

- `mongo_root_password` - Contraseña del usuario root de MongoDB
- `postgres_password` - Contraseña del usuario de PostgreSQL
- `rabbitmq_password` - Contraseña del usuario de RabbitMQ
- `jwt_secret` - Secreto para JWT
- `email_password` - Contraseña para el servicio de correo

## Nota de seguridad

Nunca commitear secretos en el repositorio. Usar siempre variables de entorno o el sistema de secretos de Docker.

Los archivos de secretos reales se excluyen automáticamente del repositorio mediante el archivo .gitignore.