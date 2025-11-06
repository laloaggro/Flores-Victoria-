#!/bin/bash

# ==========================================
# ORACLE CLOUD DEPLOYMENT SCRIPT
# Flores Victoria - Full Stack Deployment
# ==========================================

set -e

echo "🚀 Iniciando deployment en Oracle Cloud..."

# ==========================================
# 1. VERIFICAR REQUISITOS
# ==========================================
echo ""
echo "📋 Verificando requisitos..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "Ejecuta: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    echo "Ejecuta: sudo apt install docker-compose-plugin"
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"

# ==========================================
# 2. VERIFICAR ARCHIVO .env
# ==========================================
echo ""
echo "🔑 Verificando variables de entorno..."

if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "Creando desde .env.oracle.example..."
    cp .env.oracle.example .env
    echo ""
    echo "⚠️  IMPORTANTE: Edita .env y cambia las contraseñas de producción"
    echo "   nano .env"
    echo ""
    read -p "¿Has configurado las contraseñas en .env? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configura .env antes de continuar"
        exit 1
    fi
else
    echo "✅ Archivo .env encontrado"
fi

# Verificar que no tenga valores por defecto
if grep -q "CHANGE_THIS" .env; then
    echo "⚠️  ADVERTENCIA: .env contiene valores por defecto (CHANGE_THIS)"
    echo "   Es CRÍTICO cambiarlos en producción"
    read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ==========================================
# 3. BUILD DEL FRONTEND
# ==========================================
echo ""
echo "🏗️  Compilando frontend..."

cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "🔨 Generando build de producción..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: No se generó la carpeta dist"
    exit 1
fi

echo "✅ Frontend compilado correctamente"
cd ..

# ==========================================
# 4. DETENER CONTENEDORES ANTERIORES
# ==========================================
echo ""
echo "🛑 Deteniendo contenedores anteriores..."

docker-compose -f docker-compose.oracle.yml down || true

# ==========================================
# 5. LIMPIAR IMÁGENES VIEJAS (opcional)
# ==========================================
echo ""
read -p "¿Limpiar imágenes Docker viejas? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Limpiando imágenes viejas..."
    docker system prune -af --volumes || true
fi

# ==========================================
# 6. BUILD DE IMÁGENES
# ==========================================
echo ""
echo "🐳 Construyendo imágenes Docker..."

docker-compose -f docker-compose.oracle.yml build --no-cache

# ==========================================
# 7. INICIAR SERVICIOS
# ==========================================
echo ""
echo "🚀 Iniciando servicios..."

docker-compose -f docker-compose.oracle.yml up -d

# ==========================================
# 8. ESPERAR QUE LOS SERVICIOS ESTÉN LISTOS
# ==========================================
echo ""
echo "⏳ Esperando que los servicios estén listos..."

# Esperar PostgreSQL
echo "   Esperando PostgreSQL..."
for i in {1..30}; do
    if docker-compose -f docker-compose.oracle.yml exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo "   ✅ PostgreSQL listo"
        break
    fi
    sleep 2
done

# Esperar Redis
echo "   Esperando Redis..."
for i in {1..15}; do
    if docker-compose -f docker-compose.oracle.yml exec -T redis redis-cli -a "${REDIS_PASSWORD:-floresredis2025}" ping &> /dev/null; then
        echo "   ✅ Redis listo"
        break
    fi
    sleep 2
done

# Esperar API Gateway
echo "   Esperando API Gateway..."
sleep 10

# ==========================================
# 9. VERIFICAR ESTADO
# ==========================================
echo ""
echo "🔍 Estado de los servicios:"
docker-compose -f docker-compose.oracle.yml ps

# ==========================================
# 10. HEALTH CHECKS
# ==========================================
echo ""
echo "🏥 Verificando health checks..."

# Verificar Nginx
if curl -sf http://localhost/health > /dev/null; then
    echo "✅ Nginx: OK"
else
    echo "⚠️  Nginx: No responde"
fi

# Verificar API Gateway
if curl -sf http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ API Gateway: OK"
else
    echo "⚠️  API Gateway: No responde (puede tardar unos segundos más)"
fi

# ==========================================
# 11. MOSTRAR LOGS
# ==========================================
echo ""
echo "📋 Últimos logs:"
docker-compose -f docker-compose.oracle.yml logs --tail=20

# ==========================================
# 12. INFORMACIÓN FINAL
# ==========================================
echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETADO"
echo "=========================================="
echo ""
echo "📍 URLs de acceso:"
echo "   Frontend:    http://$(curl -s ifconfig.me)"
echo "   API Gateway: http://$(curl -s ifconfig.me)/api"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs:      docker-compose -f docker-compose.oracle.yml logs -f"
echo "   Ver logs API:  docker-compose -f docker-compose.oracle.yml logs -f api-gateway"
echo "   Reiniciar:     docker-compose -f docker-compose.oracle.yml restart"
echo "   Detener:       docker-compose -f docker-compose.oracle.yml down"
echo "   Estado:        docker-compose -f docker-compose.oracle.yml ps"
echo ""
echo "📊 Uso de recursos:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""
echo "🎉 ¡Flores Victoria está en producción!"
echo ""
