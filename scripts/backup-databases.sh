#!/bin/bash

# Script para realizar copias de seguridad de las bases de datos del sistema Flores Victoria

echo "=== Copia de seguridad de bases de datos - Flores Victoria ==="
echo "$(date)"
echo

# Variables de entorno
NAMESPACE="flores-victoria"
BACKUP_DIR="/home/impala/Documentos/Proyectos/flores-victoria/backups"
KUBECTL="kubectl"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Función para respaldar PostgreSQL
backup_postgres() {
    echo "Realizando copia de seguridad de PostgreSQL..."
    
    # Obtener las credenciales desde los secrets de Kubernetes
    PG_USER=$($KUBECTL get secret postgres-secret -n $NAMESPACE -o jsonpath='{.data.postgres-user}' | base64 --decode)
    PG_DB=$($KUBECTL get secret postgres-secret -n $NAMESPACE -o jsonpath='{.data.postgres-db}' | base64 --decode)
    PG_PASSWORD=$($KUBECTL get secret postgres-secret -n $NAMESPACE -o jsonpath='{.data.postgres-password}' | base64 --decode)
    
    # Nombre del archivo de backup
    BACKUP_FILE="$BACKUP_DIR/postgres-$(date +%Y%m%d-%H%M%S).sql"
    
    # Realizar el backup
    $KUBECTL exec -n $NAMESPACE postgres-0 -- pg_dump -U "$PG_USER" -d "$PG_DB" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Copia de seguridad de PostgreSQL completada: $BACKUP_FILE"
        
        # Comprimir el archivo
        gzip "$BACKUP_FILE"
        echo "  ✅ Archivo comprimido: $BACKUP_FILE.gz"
    else
        echo "  ❌ Error al realizar la copia de seguridad de PostgreSQL"
        return 1
    fi
}

# Función para respaldar MongoDB
backup_mongodb() {
    echo "Realizando copia de seguridad de MongoDB..."
    
    # Nombre del archivo de backup
    BACKUP_FILE="mongodb-$(date +%Y%m%d-%H%M%S).archive"
    LOCAL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
    
    # Realizar el backup dentro del pod y luego copiarlo localmente
    $KUBECTL exec -n $NAMESPACE mongodb-0 -- mongodump --archive="/tmp/$BACKUP_FILE" --uri="mongodb://root:rootpassword@localhost:27017"
    
    if [ $? -eq 0 ]; then
        # Copiar el archivo de backup desde el pod al sistema local
        $KUBECTL cp $NAMESPACE/mongodb-0:/tmp/$BACKUP_FILE $LOCAL_BACKUP_PATH
        
        if [ $? -eq 0 ]; then
            echo "  ✅ Copia de seguridad de MongoDB completada: $LOCAL_BACKUP_PATH"
            
            # Comprimir el archivo
            gzip "$LOCAL_BACKUP_PATH"
            echo "  ✅ Archivo comprimido: $LOCAL_BACKUP_PATH.gz"
            
            # Eliminar el archivo temporal del pod
            $KUBECTL exec -n $NAMESPACE mongodb-0 -- rm "/tmp/$BACKUP_FILE"
        else
            echo "  ❌ Error al copiar el archivo de backup de MongoDB desde el pod"
            return 1
        fi
    else
        echo "  ❌ Error al realizar la copia de seguridad de MongoDB"
        return 1
    fi
}

# Función para limpiar backups antiguos (más de 7 días)
cleanup_old_backups() {
    echo "Limpiando backups antiguos..."
    
    find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Limpieza de backups antiguos completada"
    else
        echo "  ❌ Error al limpiar backups antiguos"
        return 1
    fi
}

# Ejecutar las funciones de backup
backup_postgres
POSTGRES_RESULT=$?

backup_mongodb
MONGODB_RESULT=$?

cleanup_old_backups
CLEANUP_RESULT=$?

echo
echo "=== Resumen de copias de seguridad ==="
if [ $POSTGRES_RESULT -eq 0 ]; then
    echo "✅ PostgreSQL: Completado"
else
    echo "❌ PostgreSQL: Error"
fi

if [ $MONGODB_RESULT -eq 0 ]; then
    echo "✅ MongoDB: Completado"
else
    echo "❌ MongoDB: Error"
fi

if [ $CLEANUP_RESULT -eq 0 ]; then
    echo "✅ Limpieza: Completado"
else
    echo "❌ Limpieza: Error"
fi

if [ $POSTGRES_RESULT -eq 0 ] && [ $MONGODB_RESULT -eq 0 ] && [ $CLEANUP_RESULT -eq 0 ]; then
    echo
    echo "✅ Todas las operaciones completadas exitosamente"
    exit 0
else
    echo
    echo "❌ Algunas operaciones fallaron"
    exit 1
fi