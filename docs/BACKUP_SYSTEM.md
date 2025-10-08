# Sistema de Backup para Flores Victoria

## Introducción

Este documento describe el sistema de backup implementado para las bases de datos del proyecto Flores Victoria. El sistema incluye scripts automatizados para realizar backups regulares y limpiar backups antiguos.

## Componentes del Sistema

### 1. Scripts de Backup

- `backup-databases.sh`: Realiza backup de MongoDB y PostgreSQL
- `cleanup-backups.sh`: Limpia backups antiguos según política de retención

### 2. Directorios de Backup

- `./backups/mongodb/`: Almacena backups de MongoDB
- `./backups/postgresql/`: Almacena backups de PostgreSQL

## Requisitos

1. **Herramientas necesarias**:
   - `mongodump` (MongoDB Database Tools)
   - `pg_dump` (PostgreSQL Client Tools)
   - `find`, `rm` (utilidades estándar de Unix/Linux)

2. **Variables de entorno**:
   - Variables definidas en el archivo `.env`

## Uso de los Scripts

### Realizar Backup

```bash
# Ejecutar backup con valores por defecto
./scripts/backup-databases.sh

# El script creará backups en:
# ./backups/mongodb/backup_YYYYMMDD_HHMMSS/
# ./backups/postgresql/backup_YYYYMMDD_HHMMSS.sql
```

### Limpiar Backups Antiguos

```bash
# Limpiar backups con retención por defecto (7 días)
./scripts/cleanup-backups.sh

# Limpiar backups con retención personalizada (ej. 30 días)
./scripts/cleanup-backups.sh 30
```

## Automatización

### Configuración con Cron

Para automatizar los backups, se puede configurar una tarea cron:

```bash
# Editar crontab
crontab -e

# Agregar entrada para backup diario a las 2 AM
0 2 * * * cd /ruta/al/proyecto/Flores-Victoria- && ./scripts/backup-databases.sh

# Agregar entrada para limpieza semanal los domingos a las 3 AM
0 3 * * 0 cd /ruta/al/proyecto/Flores-Victoria- && ./scripts/cleanup-backups.sh 7
```

### Ejemplo de Configuración Completa

```bash
# Backup diario a las 2 AM
0 2 * * * cd /home/user/projects/Flores-Victoria- && ./scripts/backup-databases.sh >> ./logs/backup.log 2>&1

# Limpieza semanal los domingos a las 3 AM
0 3 * * 0 cd /home/user/projects/Flores-Victoria- && ./scripts/cleanup-backups.sh 7 >> ./logs/cleanup.log 2>&1
```

## Políticas de Retención

### Por Defecto
- Retención: 7 días
- Frecuencia de backup: Diaria
- Espacio estimado: Variable según tamaño de las bases de datos

### Recomendada para Producción
- Retención: 30 días para backups diarios
- Retención: 90 días para backups semanales
- Retención: 365 días para backups mensuales

### Personalización
Se puede modificar la política de retención ajustando el parámetro del script `cleanup-backups.sh`.

## Restauración de Backups

### MongoDB

```bash
# Restaurar backup de MongoDB
mongorestore --host localhost --port 27018 \
  --username $MONGO_INITDB_ROOT_USERNAME \
  --password $MONGO_INITDB_ROOT_PASSWORD \
  ./backups/mongodb/backup_YYYYMMDD_HHMMSS/
```

### PostgreSQL

```bash
# Restaurar backup de PostgreSQL
psql -h localhost -p 5433 \
  -U $POSTGRES_USER \
  -d $POSTGRES_DB \
  -f ./backups/postgresql/backup_YYYYMMDD_HHMMSS.sql
```

## Monitoreo y Alertas

### Verificación de Backups

```bash
# Listar backups recientes
ls -la ./backups/mongodb/
ls -la ./backups/postgresql/

# Verificar tamaño de los backups
du -sh ./backups/mongodb/*
du -sh ./backups/postgresql/*
```

### Registro de Actividades

Los scripts generan salida que puede ser redirigida a archivos de log:

```bash
# Registrar salida en archivos de log
./scripts/backup-databases.sh >> ./logs/backup.log 2>&1
./scripts/cleanup-backups.sh >> ./logs/cleanup.log 2>&1
```

## Seguridad

### Consideraciones

1. **Almacenamiento seguro**: Los backups deben almacenarse en ubicaciones seguras
2. **Cifrado**: Considerar el cifrado de backups sensibles
3. **Acceso restringido**: Limitar el acceso a los archivos de backup
4. **Pruebas periódicas**: Realizar pruebas de restauración periódicamente

### Mejores Prácticas

1. No almacenar backups en el mismo servidor que las bases de datos
2. Utilizar almacenamiento redundante para los backups
3. Implementar control de versiones para los scripts de backup
4. Documentar y probar los procedimientos de restauración

## Resolución de Problemas

### Problemas Comunes

1. **Herramientas no encontradas**:
   - Verificar que MongoDB Database Tools y PostgreSQL Client Tools estén instalados
   - Verificar que las herramientas estén en el PATH

2. **Permisos denegados**:
   - Verificar permisos de los directorios de backup
   - Verificar permisos de los archivos de backup

3. **Conexión a bases de datos**:
   - Verificar que las bases de datos estén accesibles
   - Verificar las credenciales en el archivo .env

### Verificación del Sistema

```bash
# Verificar que las herramientas necesarias estén instaladas
mongodump --version
pg_dump --version

# Verificar variables de entorno
echo $MONGO_INITDB_ROOT_USERNAME
echo $POSTGRES_USER

# Verificar conectividad a las bases de datos
mongo --host localhost --port 27018 --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD
psql -h localhost -p 5433 -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT version();"
```

## Conclusión

El sistema de backup implementado proporciona una solución automatizada y mantenible para proteger los datos del proyecto Flores Victoria. Se recomienda:

1. Configurar backups automatizados según las necesidades del negocio
2. Establecer políticas de retención adecuadas
3. Probar regularmente los procedimientos de restauración
4. Monitorear y mantener el sistema de backup