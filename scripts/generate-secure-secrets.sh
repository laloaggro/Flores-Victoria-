#!/bin/bash

# Script para generar secretos seguros y aleatorios para el proyecto Flores Victoria

echo "Generando secretos seguros..."

# Crear directorio de secretos si no existe
mkdir -p docker/secrets

# Generar secreto para JWT
echo "Generando secreto JWT..."
openssl rand -base64 32 > docker/secrets/jwt_secret.txt

# Generar contraseña para MongoDB
echo "Generando contraseña para MongoDB..."
openssl rand -base64 24 > docker/secrets/mongo_root_password.txt

# Generar contraseña para PostgreSQL
echo "Generando contraseña para PostgreSQL..."
openssl rand -base64 24 > docker/secrets/postgres_password.txt

# Generar contraseña para RabbitMQ
echo "Generando contraseña para RabbitMQ..."
openssl rand -base64 24 > docker/secrets/rabbitmq_password.txt

# Generar contraseña para email
echo "Generando contraseña para email..."
openssl rand -base64 24 > docker/secrets/email_password.txt

echo "Secretos generados en docker/secrets/"
echo "IMPORTANTE: Estos secretos son para desarrollo. En producción, usar secretos gestionados por plataforma."