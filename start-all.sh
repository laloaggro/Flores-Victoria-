#!/bin/bash

# Script para iniciar todos los servicios del proyecto Flores Victoria

echo "Iniciando servicios de Flores Victoria..."

# Función para detener procesos existentes
stop_existing_processes() {
  echo "Deteniendo procesos existentes..."
  pkill -f "python3 -m http.server.*5173" > /dev/null 2>&1
  pkill -f "node.*backend/server.js" > /dev/null 2>&1
  pkill -f "node.*admin-panel/server.js" > /dev/null 2>&1
}

# Función para iniciar el frontend
start_frontend() {
  echo "Iniciando frontend en el puerto 5173..."
  cd frontend && python3 -m http.server 5173 > /tmp/frontend.log 2>&1 &
  cd ..
}

# Función para iniciar el backend
start_backend() {
  echo "Iniciando backend en el puerto 5000..."
  cd backend && node server.js > /tmp/backend.log 2>&1 &
  cd ..
}

# Función para iniciar el panel de administración
start_admin_panel() {
  echo "Iniciando panel de administración en el puerto 3001..."
  cd admin-panel && node server.js > /tmp/admin-panel.log 2>&1 &
  cd ..
}

# Función para verificar el estado de los servicios
check_status() {
  echo "Verificando estado de los servicios..."
  sleep 3
  netstat -tulpn | grep -E "(5173|3001|5000)" | grep -v grep
}

# Ejecutar todas las funciones
stop_existing_processes
start_frontend
start_backend
start_admin_panel
check_status

echo ""
echo "Servicios iniciados:"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:5000"
echo "Panel de administración: http://localhost:3001"