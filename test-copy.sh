#!/bin/bash

# Crear estructura de directorios para prueba
mkdir -p test-node-modules/@flores-victoria/tracing
mkdir -p test-node-modules/@flores-victoria/metrics

# Copiar archivos
cp -r shared/tracing/* test-node-modules/@flores-victoria/tracing/
cp -r shared/metrics/* test-node-modules/@flores-victoria/metrics/

# Verificar resultados
echo "Contenido de test-node-modules/@flores-victoria/tracing:"
ls -la test-node-modules/@flores-victoria/tracing/

echo "Contenido de test-node-modules/@flores-victoria/metrics:"
ls -la test-node-modules/@flores-victoria/metrics/

# Limpiar
rm -rf test-node-modules