#!/bin/bash

# Script para reiniciar solo el frontend
echo "Deteniendo servidor frontend..."
pkill -f "python3 -m http.server.*5173" > /dev/null 2>&1

echo "Limpiando directorio dist..."
rm -rf /home/laloaggro/Proyectos/flores-victoria/dist
mkdir -p /home/laloaggro/Proyectos/flores-victoria/dist

echo "Copiando archivos del frontend..."
cp -r /home/laloaggro/Proyectos/flores-victoria/frontend/* /home/laloaggro/Proyectos/flores-victoria/dist/

echo "Iniciando servidor frontend (puerto 5173)..."
cd /home/laloaggro/Proyectos/flores-victoria/dist && python3 -m http.server 5173 > /tmp/frontend.log 2>&1 &

echo "Esperando a que el servidor inicie..."
sleep 1

echo "Verificando estado del servidor..."
netstat -tulpn | grep 5173 | grep -v grep

echo "Frontend reiniciado."
echo "Frontend: http://localhost:5173"