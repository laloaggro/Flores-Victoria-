#!/bin/bash
# Script para crear todas las tablas PostgreSQL en Railway

DATABASE_URL="postgresql://postgres:GnpChUscOAzadwBbRWTgGueejprKeVUf@hopper.proxy.rlwy.net:51619/railway"

echo "🗄️  Creando tablas en PostgreSQL..."
echo ""

# auth-service
echo "📋 Creando tablas para auth-service..."
psql "$DATABASE_URL" -f microservices/auth-service/db/schema.sql
echo "✅ auth-service OK"
echo ""

# user-service
echo "📋 Creando tablas para user-service..."
psql "$DATABASE_URL" -f microservices/user-service/db/schema.sql
echo "✅ user-service OK"
echo ""

# order-service
echo "📋 Creando tablas para order-service..."
psql "$DATABASE_URL" -f microservices/order-service/db/schema.sql
echo "✅ order-service OK"
echo ""

# Verificar tablas creadas
echo "📊 Tablas existentes:"
psql "$DATABASE_URL" -c "\dt"
echo ""

echo "✅ Todas las tablas han sido creadas!"
