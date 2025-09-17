#!/bin/bash

# Script para desplegar la aplicación
echo "Deteniendo procesos existentes..."
pkill -f "python3 -m http.server.*5173" > /dev/null 2>&1
pkill -f "node.*backend/server.js" > /dev/null 2>&1
pkill -f "node.*admin-panel/server.js" > /dev/null 2>&1

echo "Limpiando directorio dist..."
rm -rf /home/laloaggro/Proyectos/flores-victoria/dist
mkdir -p /home/laloaggro/Proyectos/flores-victoria/dist

echo "Copiando archivos del frontend..."
cp -r /home/laloaggro/Proyectos/flores-victoria/frontend/* /home/laloaggro/Proyectos/flores-victoria/dist/

echo "Iniciando servidor frontend (puerto 5173)..."
cd /home/laloaggro/Proyectos/flores-victoria/dist && python3 -m http.server 5173 > /tmp/frontend.log 2>&1 &

echo "Iniciando servidor backend (puerto 5000)..."
cd /home/laloaggro/Proyectos/flores-victoria/backend && node server.js > /tmp/backend.log 2>&1 &

echo "Iniciando servidor de administración (puerto 3001)..."
cd /home/laloaggro/Proyectos/flores-victoria/admin-panel && node server.js > /tmp/server-admin.log 2>&1 &

echo "Esperando a que los servidores inicien..."
sleep 3

echo "Verificando estado de los servidores..."
netstat -tulpn | grep -E "(5173|3001|5000)" | grep -v grep

echo "Despliegue completado."
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:5000"
echo "Panel de administración: http://localhost:3001"