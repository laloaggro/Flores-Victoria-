# Resumen de Comandos Importantes

## Construcción de imágenes Docker

### Auth-Service
```bash
# Construcción de la imagen
cd /home/impala/Documentos/Proyectos/flores-victoria && docker build -t localhost:5000/auth-service:latest -f microservices/auth-service/Dockerfile .

# Subida al registro local
cd /home/impala/Documentos/Proyectos/flores-victoria && docker push localhost:5000/auth-service:latest
```

### Product-Service
```bash
# Construcción de la imagen desde el directorio del servicio
cd /home/impala/Documentos/Proyectos/flores-victoria/microservices/product-service && docker build -t localhost:5000/product-service:latest .

# Subida al registro local
cd /home/impala/Documentos/Proyectos/flores-victoria/microservices/product-service && docker push localhost:5000/product-service:latest
```

### Order-Service
```bash
# Construcción de la imagen desde el directorio raíz
cd /home/impala/Documentos/Proyectos/flores-victoria && docker build -t localhost:5000/order-service:latest -f microservices/order-service/Dockerfile .

# Subida al registro local
cd /home/impala/Documentos/Proyectos/flores-victoria && docker push localhost:5000/order-service:latest
```

## Comandos de Git

### Verificación de estado
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria && git status
```

### Agregar cambios
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria && git add .
```

### Commit de cambios
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria && git commit -m "Actualizar documentación y corregir microservicios - Mejoras en Dockerfiles y registro detallado de cambios"
```

## Comandos de Docker Swarm

### Despliegue del stack
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria && docker stack deploy -c docker-compose.prod.yml flores-victoria
```

### Verificación de servicios
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria && docker service ls
```

### Verificación de logs
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria && docker service logs flores-victoria_auth-service
```

## Otros comandos útiles

### Verificación de estructura de directorios
```bash
# Para verificar la estructura de un microservicio
cd /home/impala/Documentos/Proyectos/flores-victoria && ls -la microservices/auth-service/

# Para verificar la estructura de los módulos compartidos
cd /home/impala/Documentos/Proyectos/flores-victoria && ls -la shared/
```

### Pruebas de conectividad
```bash
# Probar endpoint de health check
curl -v http://localhost:3001/health
```