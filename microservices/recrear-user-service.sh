#!/bin/bash

# Script para recrear user-service con configuración correcta
# Ejecutar DESPUÉS de eliminar el servicio anterior desde el Dashboard

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║              🚀 RECREAR USER-SERVICE CON CONFIGURACIÓN CORRECTA           ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "user-service" ]; then
    echo "❌ Error: No se encuentra el directorio user-service"
    echo "   Ejecuta este script desde: /microservices/"
    exit 1
fi

echo "📍 Directorio correcto verificado"
echo ""

# Verificar que el Dockerfile existe
if [ ! -f "user-service/Dockerfile" ]; then
    echo "❌ Error: No se encuentra user-service/Dockerfile"
    exit 1
fi

echo "✅ Dockerfile encontrado: user-service/Dockerfile"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PASO 1: Crear nuevo servicio user-service en Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Creando servicio en Railway..."
echo ""

# Intentar crear el servicio (esto puede fallar si ya existe)
railway service create user-service 2>&1 | tee /tmp/railway-create-output.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Servicio user-service creado exitosamente"
else
    echo ""
    echo "⚠️  Nota: El servicio puede ya existir o hubo un error"
    echo "   Revisa el mensaje anterior"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PASO 2: Configurar variables de entorno"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si JWT_SECRET existe, si no, avisar
JWT_SECRET=${JWT_SECRET:-"CAMBIAME_POR_UN_SECRETO_SEGURO_DE_32_CARACTERES"}

echo "Configurando variables de entorno..."
echo ""

railway variables --service user-service --set NODE_ENV=production
railway variables --service user-service --set PORT=3003
railway variables --service user-service --set LOG_LEVEL=info
railway variables --service user-service --set JWT_SECRET="$JWT_SECRET"
railway variables --service user-service --set DATABASE_URL='${{Postgres.DATABASE_URL}}'

echo ""
echo "✅ Variables de entorno configuradas"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PASO 3: CONFIGURACIÓN MANUAL REQUERIDA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANTE: El CLI NO puede configurar Root Directory"
echo ""
echo "Debes ir al Dashboard de Railway AHORA y configurar:"
echo ""
echo "   1. Ve a: https://railway.app/"
echo "   2. Proyecto: Arreglos Victoria → production"
echo "   3. Servicio: user-service"
echo "   4. Settings → Source"
echo "   5. Configura:"
echo ""
echo "      Root Directory:    /microservices"
echo "      Dockerfile Path:   user-service/Dockerfile"
echo ""
echo "   6. Guarda los cambios"
echo "   7. El despliegue iniciará automáticamente"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Verificar variables configuradas:"
echo ""
railway variables --service user-service 2>&1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 PRÓXIMO PASO:"
echo "   1. Configurar Root Directory en Dashboard (5 minutos)"
echo "   2. Esperar que el despliegue complete (2-3 minutos)"
echo "   3. Ejecutar: ./verificar-despliegue.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
