#!/bin/bash

# Script para generar secretos de forma segura para el proyecto Flores Victoria

set -e  # Salir inmediatamente si un comando falla

echo "Generando secretos para el proyecto Flores Victoria..."

# Crear directorio para secretos si no existe
SECRETS_DIR="./docker/secrets"
mkdir -p "$SECRETS_DIR"

# Generar secretos si no existen
echo "Generando secretos..."

# MongoDB root password
if [ ! -f "$SECRETS_DIR/mongo_root_password.txt" ]; then
    openssl rand -base64 32 > "$SECRETS_DIR/mongo_root_password.txt"
    echo "✓ Secreto para MongoDB generado"
else
    echo "✓ Secreto para MongoDB ya existe"
fi

# PostgreSQL password
if [ ! -f "$SECRETS_DIR/postgres_password.txt" ]; then
    openssl rand -base64 32 > "$SECRETS_DIR/postgres_password.txt"
    echo "✓ Secreto para PostgreSQL generado"
else
    echo "✓ Secreto para PostgreSQL ya existe"
fi

# RabbitMQ password
if [ ! -f "$SECRETS_DIR/rabbitmq_password.txt" ]; then
    openssl rand -base64 32 > "$SECRETS_DIR/rabbitmq_password.txt"
    echo "✓ Secreto para RabbitMQ generado"
else
    echo "✓ Secreto para RabbitMQ ya existe"
fi

# JWT secret
if [ ! -f "$SECRETS_DIR/jwt_secret.txt" ]; then
    openssl rand -base64 64 > "$SECRETS_DIR/jwt_secret.txt"
    echo "✓ Secreto para JWT generado"
else
    echo "✓ Secreto para JWT ya existe"
fi

# Email password (dejar vacío por defecto, debe ser configurado manualmente)
if [ ! -f "$SECRETS_DIR/email_password.txt" ]; then
    echo "" > "$SECRETS_DIR/email_password.txt"
    echo "✓ Secreto para email creado (debe ser configurado manualmente)"
else
    echo "✓ Secreto para email ya existe"
fi

# Asegurar permisos correctos
chmod 600 "$SECRETS_DIR"/*.txt

echo ""
echo "Secretos generados en: $SECRETS_DIR"
echo "IMPORTANTE: Revisa y actualiza los secretos según tus necesidades, especialmente email_password.txt"
echo "Los secretos deben mantenerse seguros y no ser commiteados al repositorio."