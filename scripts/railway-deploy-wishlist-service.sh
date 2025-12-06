#!/bin/bash

# Script para deployar Wishlist Service en Railway

set -e

SERVICE_NAME="wishlist-service"
PORT=3005
SERVICE_PATH="wishlist-service"

echo "=========================================="
echo "Deploying: $SERVICE_NAME"
echo "=========================================="

railway service create "$SERVICE_NAME" 2>/dev/null || echo "Service already exists"
railway service "$SERVICE_NAME"

echo "Setting environment variables..."

railway variables set PORT="$PORT"
railway variables set NODE_ENV="production"
railway variables set SERVICE_NAME="$SERVICE_NAME"
railway variables set RAILWAY_HEALTHCHECK_PATH="/health"
railway variables set RAILWAY_HEALTHCHECK_TIMEOUT="300"
railway variables set START_COMMAND="cd microservices/$SERVICE_PATH && node src/server.js"

echo ""
echo "✅ $SERVICE_NAME configured!"
echo ""
echo "⚠️  MANUAL STEPS in Railway Dashboard:"
echo "1. Root Directory: LEAVE EMPTY"
echo "2. Custom Build Command:"
echo "   cd microservices/shared && npm install --production && cd ../$SERVICE_PATH && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/"
echo "3. Set DATABASE_URL (MongoDB)"
echo "4. Set REDIS_URL"
echo ""
echo "To deploy: railway up"
