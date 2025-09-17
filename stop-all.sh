#!/bin/bash

# Script para detener todos los servicios del proyecto Flores Victoria

echo "Deteniendo servicios de Flores Victoria..."

# Función para detener procesos
stop_processes() {
  echo "Deteniendo procesos..."
  pkill -f "python3 -m http.server.*5173" > /dev/null 2>&1
  pkill -f "node.*backend/server.js" > /dev/null 2>&1
  pkill -f "node.*admin-panel/server.js" > /dev/null 2>&1
  
  echo "Esperando a que los procesos se detengan..."
  sleep 2
  
  echo "Procesos detenidos."
}

# Ejecutar la función
stop_processes

echo "Todos los servicios han sido detenidos."