#!/bin/bash

# Script maestro para ejecutar todas las tareas de mantenimiento del sistema Flores Victoria

echo "=== Mantenimiento del sistema - Flores Victoria ==="
echo "$(date)"
echo

# Directorio base del proyecto
PROJECT_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
SCRIPTS_DIR="$PROJECT_DIR/scripts"

# Array de scripts a ejecutar
SCRIPTS=(
    "health-check.sh"
    "backup-databases.sh"
    "update-dependencies.sh"
    "cleanup-logs.sh"
)

# Función para ejecutar un script
run_script() {
    local script=$1
    local script_path="$SCRIPTS_DIR/$script"
    
    echo "Ejecutando $script..."
    
    if [ -f "$script_path" ] && [ -x "$script_path" ]; then
        "$script_path"
        local result=$?
        
        if [ $result -eq 0 ]; then
            echo "  ✅ $script completado exitosamente"
        else
            echo "  ❌ $script falló con código de error: $result"
            return $result
        fi
    else
        echo "  ❌ No se encontró el script $script o no tiene permisos de ejecución"
        return 1
    fi
}

# Ejecutar todos los scripts
ERROR_COUNT=0
for script in "${SCRIPTS[@]}"; do
    run_script "$script"
    if [ $? -ne 0 ]; then
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    echo
done

echo "=== Resumen de mantenimiento ==="
if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ Todas las tareas de mantenimiento completadas exitosamente"
    exit 0
else
    echo "❌ $ERROR_COUNT tarea(s) de mantenimiento fallaron"
    exit 1
fi