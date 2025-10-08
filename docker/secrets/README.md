# Docker Secrets

Este directorio contiene los secretos utilizados por los servicios de Docker.

## Cómo usar los secretos

Para usar secretos en Docker Swarm:

1. Crear secretos:
   ```bash
   echo "valor_secreto" | docker secret create nombre_secreto -
   ```

2. Referenciar secretos en docker-compose.yml:
   ```yaml
   services:
     mi_servicio:
       secrets:
         - nombre_secreto
   
   secrets:
     nombre_secreto:
       external: true
   ```

3. Los secretos estarán disponibles en `/run/secrets/nombre_secreto` dentro del contenedor.

## Secretos recomendados

- `mongo_root_password` - Contraseña del usuario root de MongoDB
- `postgres_password` - Contraseña del usuario de PostgreSQL
- `rabbitmq_password` - Contraseña del usuario de RabbitMQ
- `jwt_secret` - Secreto para JWT
- `email_password` - Contraseña para el servicio de correo

## Nota de seguridad

Nunca commitear secretos en el repositorio. Usar siempre variables de entorno o el sistema de secretos de Docker.