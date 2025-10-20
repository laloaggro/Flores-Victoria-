#!/bin/bash

# Script para instalar todas las dependencias compartidas en los microservicios

echo "=== Instalando dependencias compartidas ==="

# Directorio base del proyecto
BASE_DIR="/home/impala/Documentos/Proyectos/flores-victoria"

# Instalar dependencias en los componentes compartidos
echo "Instalando dependencias en shared/tracing..."
cd $BASE_DIR/shared/tracing && npm install

echo "Instalando dependencias en shared/logging..."
cd $BASE_DIR/shared/logging && npm install

echo "Instalando dependencias en shared/metrics..."
cd $BASE_DIR/shared/metrics && npm install

echo "Instalando dependencias en shared/audit..."
cd $BASE_DIR/shared/audit && npm install

# Instalar dependencias en los microservicios
echo "Instalando dependencias en auth-service..."
cd $BASE_DIR/microservices/auth-service && npm install

echo "Instalando dependencias en product-service..."
cd $BASE_DIR/microservices/product-service && npm install

echo "Instalando dependencias en user-service..."
cd $BASE_DIR/microservices/user-service && npm install

echo "Instalando dependencias en order-service..."
cd $BASE_DIR/microservices/order-service && npm install

echo "Instalando dependencias en cart-service..."
cd $BASE_DIR/microservices/cart-service && npm install

echo "Instalando dependencias en wishlist-service..."
cd $BASE_DIR/microservices/wishlist-service && npm install

echo "Instalando dependencias en review-service..."
cd $BASE_DIR/microservices/review-service && npm install

echo "Instalando dependencias en contact-service..."
cd $BASE_DIR/microservices/contact-service && npm install

echo "Instalando dependencias en api-gateway..."
cd $BASE_DIR/microservices/api-gateway && npm install

echo "Instalando dependencias en frontend..."
cd $BASE_DIR/frontend && npm install

echo "Instalando dependencias en admin-panel..."
cd $BASE_DIR/admin-panel && npm install

echo "=== Todas las dependencias han sido instaladas ==="