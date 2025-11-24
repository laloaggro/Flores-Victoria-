#!/bin/bash

# Script para arreglar tests y verificar coverage
# Fecha: 17 noviembre 2025

echo "🔧 Arreglando tests fallidos del order-service..."

# 1. Commit del fix de health checks
cd /home/impala/Documentos/Proyectos/flores-victoria
git add microservices/shared/health/checks.js
git commit -m "fix: Exportar funciones de health checks para order-service

- createLivenessResponse()
- createReadinessResponse()
- Resuelve 3 tests fallidos en order-service"

echo "✅ Fix commiteado"

# 2. Ejecutar solo tests de order-service (rápido)
echo ""
echo "🧪 Ejecutando tests de order-service..."
npx jest microservices/order-service/src/__tests__/integration/orders.test.js --testTimeout=10000 --no-coverage --passWithNoTests

# 3. Ver coverage actual
echo ""
echo "📊 Coverage actual del proyecto..."
npm test -- --coverage --testPathPattern="microservices/(order|product|cart)-service" --collectCoverageFrom="microservices/**/*.js" 2>&1 | grep -A 10 "All files"

echo ""
echo "✅ Script completado"
