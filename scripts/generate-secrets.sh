#!/bin/bash

# Script para generar secretos de ejemplo para el proyecto Flores Victoria

echo "Generando secretos de ejemplo..."

# Crear directorio de secretos si no existe
mkdir -p docker/secrets

# Generar secretos de ejemplo
echo "# Ejemplo de JWT Secret" > docker/secrets/jwt_secret.txt
echo "# Reemplazar con una cadena segura generada aleatoriamente en producción" >> docker/secrets/jwt_secret.txt
echo "your-jwt-secret-here" >> docker/secrets/jwt_secret.txt

echo "# Ejemplo de contraseña de MongoDB" > docker/secrets/mongo_root_password.txt
echo "# Reemplazar con una contraseña segura en producción" >> docker/secrets/mongo_root_password.txt
echo "your-mongo-root-password" >> docker/secrets/mongo_root_password.txt

echo "# Ejemplo de contraseña de PostgreSQL" > docker/secrets/postgres_password.txt
echo "# Reemplazar con una contraseña segura en producción" >> docker/secrets/postgres_password.txt
echo "your-postgres-password" >> docker/secrets/postgres_password.txt

echo "# Ejemplo de contraseña de RabbitMQ" > docker/secrets/rabbitmq_password.txt
echo "# Reemplazar con una contraseña segura en producción" >> docker/secrets/rabbitmq_password.txt
echo "your-rabbitmq-password" >> docker/secrets/rabbitmq_password.txt

echo "# Ejemplo de contraseña de email" > docker/secrets/email_password.txt
echo "# Reemplazar con una contraseña segura en producción" >> docker/secrets/email_password.txt
echo "your-email-password" >> docker/secrets/email_password.txt

echo "Secretos de ejemplo generados en docker/secrets/"
echo "Para generar secretos seguros y aleatorios, usar: ./scripts/generate-secure-secrets.sh"
echo "IMPORTANTE: Reemplazar estos valores con secretos reales y seguros antes de usar en producción"