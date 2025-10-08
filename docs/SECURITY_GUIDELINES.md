# Directrices de Seguridad para Flores Victoria

## Introducción

Este documento establece las directrices y mejores prácticas de seguridad para el proyecto Flores Victoria. El objetivo es garantizar la protección de los datos de los usuarios y la integridad del sistema.

## Análisis de Vulnerabilidades de Imágenes Docker

### Escaneo de Vulnerabilidades

Para escanear las imágenes Docker en busca de vulnerabilidades, se pueden utilizar herramientas como:

1. **Trivy** (recomendado):
   ```bash
   # Instalar Trivy
   sudo apt-get install trivy
   
   # Escanear una imagen específica
   trivy image flores-victoria/product-service:latest
   
   # Escanear todas las imágenes del proyecto
   docker-compose images | awk '{print $2":"$3}' | tail -n +2 | xargs -I {} trivy image {}
   ```

2. **Clair**:
   ```bash
   # Usar Clair como escáner
   docker run -d --name clair -p 6060:6060 quay.io/coreos/clair:v4.0.0-rc.20
   ```

### Configuración de Escaneo Automático

Agregar al workflow de CI/CD para escaneo automático:

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  scan-images:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        
      - name: Build images
        run: docker-compose build
        
      - name: Scan images for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'flores-victoria/product-service:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v1
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
```

## Políticas de Seguridad de Red

### Configuración de Docker Networks

Actualizar el archivo [docker-compose.yml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/docker-compose.yml) para aislar servicios:

```yaml
# Fragmento de ejemplo para docker-compose.yml
networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  backend:
    driver: bridge
    internal: true  # Sin acceso a Internet
    ipam:
      config:
        - subnet: 172.21.0.0/16
  database:
    driver: bridge
    internal: true  # Sin acceso a Internet
    ipam:
      config:
        - subnet: 172.22.0.0/16

services:
  frontend:
    networks:
      - frontend
      
  api-gateway:
    networks:
      - frontend
      - backend
      
  product-service:
    networks:
      - backend
      - database
      
  mongodb:
    networks:
      - database
```

### Reglas de Firewall con iptables

Configurar reglas de firewall para contenedores:

```bash
# Crear cadena personalizada para Docker
iptables -N DOCKER-SECURITY

# Permitir solo tráfico necesario
iptables -A DOCKER-SECURITY -p tcp --dport 3000 -j ACCEPT  # API Gateway
iptables -A DOCKER-SECURITY -p tcp --dport 5173 -j ACCEPT  # Frontend
iptables -A DOCKER-SECURITY -j DROP

# Aplicar reglas a la interfaz docker0
iptables -I FORWARD -i docker0 -j DOCKER-SECURITY
```

## Autenticación Mutua TLS

### Generar Certificados

```bash
# Crear directorio para certificados
mkdir -p ./certs/tls

# Generar CA
openssl genrsa -out ./certs/tls/ca.key 4096
openssl req -new -x509 -days 365 -key ./certs/tls/ca.key -out ./certs/tls/ca.crt

# Generar certificado para un servicio (ejemplo: product-service)
openssl genrsa -out ./certs/tls/product-service.key 2048
openssl req -new -key ./certs/tls/product-service.key -out ./certs/tls/product-service.csr
openssl x509 -req -days 365 -in ./certs/tls/product-service.csr -CA ./certs/tls/ca.crt -CAkey ./certs/tls/ca.key -CAcreateserial -out ./certs/tls/product-service.crt
```

### Configuración en Docker Compose

```yaml
# Fragmento de ejemplo para habilitar TLS en un servicio
services:
  product-service:
    environment:
      - NODE_TLS_REJECT_UNAUTHORIZED=1
    volumes:
      - ./certs/tls:/etc/ssl/certs:ro
    networks:
      - backend
```

## Endurecimiento de Bases de Datos

### MongoDB

1. Habilitar autenticación:
   ```yaml
   # En docker-compose.yml
   environment:
     MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
     MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
   ```

2. Configurar opciones de seguridad en [mongo-init.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/microservices/shared/db/mongo-init.js):
   ```javascript
   // Desactivar scripting peligroso
   db.adminCommand({setParameter: 1, javascriptEnabled: false});
   
   // Habilitar auditoría
   db.adminCommand({setParameter: 1, auditAuthorizationSuccess: true});
   ```

### PostgreSQL

1. Configurar [postgresql.conf](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/microservices/shared/db/postgresql.conf) para seguridad:
   ```
   # Deshabilitar conexiones sin SSL
   ssl = on
   ssl_cert_file = '/etc/ssl/certs/server.crt'
   ssl_key_file = '/etc/ssl/private/server.key'
   
   # Configuración de autenticación
   password_encryption = scram-sha-256
   
   # Registro de conexiones
   log_connections = on
   log_disconnections = on
   ```

2. Configurar [pg_hba.conf](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/microservices/shared/db/pg_hba.conf):
   ```
   # Requerir SSL y SCRAM-SHA-256
   hostssl all all all scram-sha-256
   ```

## Escaneo de Código Fuente

### Utilizar herramientas como SonarQube

```bash
# Ejecutar análisis de código localmente
sonar-scanner \
  -Dsonar.projectKey=flores-victoria \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<token>
```

## Control de Acceso y Gestión de Identidades

### Implementar RBAC (Role-Based Access Control)

En el servicio de autenticación, crear roles específicos:

```javascript
// Ejemplo de definición de roles
const roles = {
  admin: {
    permissions: ['read', 'write', 'delete', 'manage_users']
  },
  user: {
    permissions: ['read', 'write_own']
  },
  guest: {
    permissions: ['read_public']
  }
};
```

## Rotación de Claves y Secretos

### Script para rotación automática

```bash
#!/bin/bash
# scripts/rotate-secrets.sh

echo "Rotando secretos..."

# Rotar secretos de JWT
NEW_JWT_SECRET=$(openssl rand -base64 32)
echo $NEW_JWT_SECRET > ./docker/secrets/jwt_secret.txt

# Rotar secretos de bases de datos
NEW_DB_PASSWORD=$(openssl rand -base64 24)
echo $NEW_DB_PASSWORD > ./docker/secrets/db_password.txt

echo "Secretos rotados. Reiniciando servicios..."
docker-compose restart
```

## Monitoreo de Seguridad

### Configurar fail2ban para contenedores

```bash
# Instalar fail2ban
sudo apt-get install fail2ban

# Configurar jail.local
[DEFAULT]
bantime = 10m
findtime = 10m
maxretry = 5

[nginx-auth]
enabled = true
port = http,https
filter = nginx-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 20m
```

## Conclusión

La implementación de estas medidas de seguridad mejorará significativamente la postura de seguridad del proyecto Flores Victoria. Se recomienda:

1. Implementar el escaneo de vulnerabilidades como parte del proceso de CI/CD
2. Configurar redes Docker aisladas para diferentes tipos de servicios
3. Implementar autenticación mutua TLS para comunicación entre microservicios
4. Endurecer las configuraciones de bases de datos
5. Establecer procesos de rotación automática de secretos
6. Configurar monitoreo de seguridad y respuesta a incidentes

Estas mejoras deben implementarse gradualmente y probarse cuidadosamente para evitar interrupciones en el servicio.