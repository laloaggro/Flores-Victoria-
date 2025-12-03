#!/bin/sh
# Script para iniciar nginx con el puerto de Railway
PORT=${PORT:-80}
echo "Starting nginx on port $PORT"

# Reemplazar el puerto en la configuración
sed -i "s/listen 80/listen $PORT/g" /etc/nginx/conf.d/default.conf
sed -i "s/listen \[::\]:80/listen [::]:$PORT/g" /etc/nginx/conf.d/default.conf

# Iniciar nginx
exec nginx -g 'daemon off;'
