#!/bin/bash

# Script para enviar alertas por correo electrónico cuando hay problemas en el sistema

# Configuración
EMAIL_TO="admin@arreglosvictoria.com"
EMAIL_FROM="system@arreglosvictoria.com"
SMTP_SERVER="localhost"
SMTP_PORT="25"

# Verificar si mail está disponible
if ! command -v mail &> /dev/null; then
    echo "Error: El comando 'mail' no está disponible en el sistema"
    echo "Instale el paquete de correo (por ejemplo: sudo apt-get install mailutils)"
    exit 1
fi

# Función para enviar correo
send_email() {
    local subject=$1
    local body=$2
    
    # Enviar el correo usando mail
    echo "$body" | mail -s "$subject" -a "From: $EMAIL_FROM" "$EMAIL_TO"
    
    if [ $? -eq 0 ]; then
        echo "✅ Alerta enviada por correo a $EMAIL_TO"
    else
        echo "❌ Error al enviar la alerta por correo"
        return 1
    fi
}

# Verificar si se proporcionó un mensaje
if [ $# -eq 0 ]; then
    echo "Uso: $0 \"mensaje de alerta\""
    exit 1
fi

# Enviar la alerta
send_email "Alerta del Sistema - Flores Victoria" "$1"