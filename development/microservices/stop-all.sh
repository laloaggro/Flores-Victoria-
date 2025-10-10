#!/bin/bash

# Script para detener todos los microservicios

echo "Deteniendo todos los microservicios..."

# Detener servicios con docker compose
docker compose down

echo "Todos los microservicios han sido detenidos."