#!/bin/bash

echo "Creando archivo de prueba..."
cat > test-input.json <<EOF
{
  "name": "Usuario de Prueba",
  "email": "test@ejemplo.com",
  "phone": "123456789",
  "message": "Este es un mensaje de prueba para verificar la funcionalidad de contacto."
}
EOF

echo "Ejecutando script de contacto con datos de prueba..."
cat test-input.json | php contact-enhanced.php

echo "Limpiando archivo de prueba..."
rm test-input.json

echo "Prueba completada."