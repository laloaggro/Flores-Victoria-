# Directrices de Seguridad del Proyecto Flores Victoria

## 1. Gestión de Secretos

### 1.1 Archivos de Secretos

Los secretos sensibles como contraseñas, tokens y claves de API **NO DEBEN** almacenarse
directamente en el repositorio de código fuente. En su lugar, se deben utilizar las siguientes
prácticas:

#### Docker Secrets

- Utilizar el sistema de secretos de Docker Swarm
- Los secretos se montan en `/run/secrets/` dentro de los contenedores
- Los archivos de ejemplo se encuentran en `docker/secrets/examples/`

#### Kubernetes Secrets

- Utilizar secretos de Kubernetes o herramientas externas como HashiCorp Vault
- Los secretos del repositorio son solo ejemplos codificados en base64
- En producción, utilizar secretos gestionados por el proveedor de nube

### 1.2 Variables de Entorno

Para desarrollo local:

- Utilizar archivos `.env` que se encuentran en `.gitignore`
- Cada microservicio puede tener su propio `.env` en su directorio

### 1.3 Generación de Secretos

Utilizar el script `scripts/generate-secrets.sh` para crear archivos de ejemplo:

```bash
./scripts/generate-secrets.sh
```

Luego reemplazar los valores de ejemplo con secretos reales y seguros.

## 2. Análisis de Vulnerabilidades de Imágenes Docker

### 2.1 Escaneo de Vulnerabilidades

Para escanear las imágenes Docker en busca de vulnerabilidades, se pueden utilizar herramientas
como:

1. **Trivy** (recomendado):

   ```bash
   # Instalar Trivy
   sudo apt-get install trivy

   # Escanear una imagen específica
   trivy image flores-victoria/product-service:latest

   # Escanear todas las imágenes del proyecto
   docker-compose images | awk '{print $2":"$3}' | tail -n +2 | xargs -I {} trivy image {}
   ```

2. **Script de escaneo automatizado**:
   ```bash
   # Utilizar el script proporcionado en el proyecto
   ./scripts/scan-vulnerabilities.sh
   ```

### 2.2 Configuración de Escaneo Automático

Agregar al workflow de CI/CD para escaneo automático:

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

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

## 3. Políticas de Seguridad de Red

### 3.1 Configuración de Docker Networks

Actualizar el archivo
[docker-compose.yml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/docker-compose.yml)
para aislar servicios:

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
    internal: true # Sin acceso a Internet
    ipam:
      config:
        - subnet: 172.21.0.0/16
  database:
    driver: bridge
    internal: true # Sin acceso a Internet
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

### 3.2 Reglas de Firewall con iptables

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

## 4. Autenticación Mutua TLS

### 4.1 Generar Certificados

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

### 4.2 Configuración en Docker Compose

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

## 5. Auditoría y Registro de Eventos

### 5.1 Sistema de Auditoría

El sistema de auditoría registra todas las operaciones importantes en el sistema para facilitar el
seguimiento de cambios, cumplir con regulaciones y mejorar la capacidad de depuración.

#### Componentes:

1. **Servicio de Auditoría**: Microservicio dedicado a registrar y almacenar eventos de auditoría
2. **Middleware de Auditoría**: Componente reutilizable para registrar eventos en otros
   microservicios
3. **Almacenamiento**: Base de datos MongoDB para almacenar eventos de auditoría

#### Tipos de Eventos Registrados:

- Creación, lectura, actualización y eliminación de recursos
- Acciones de autenticación y autorización
- Errores críticos del sistema
- Acceso a datos sensibles

#### Implementación:

Los microservicios utilizan el middleware de auditoría para registrar automáticamente eventos
importantes. El middleware captura información como:

- Servicio que realiza la acción
- Tipo de acción realizada
- ID del usuario (si aplica)
- ID del recurso afectado
- Detalles adicionales específicos de la acción
- Dirección IP y agente de usuario

## 6. Escaneo de Código Fuente

### 6.1 Utilizar herramientas como SonarQube

```bash
# Ejecutar análisis de código localmente
sonar-scanner \
  -Dsonar.projectKey=flores-victoria \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<token>
```

## 7. Control de Acceso y Gestión de Identidades

### 7.1 Implementar RBAC (Role-Based Access Control)

En el servicio de autenticación, crear roles específicos:

```javascript
// Ejemplo de definición de roles
const roles = {
  admin: {
    permissions: ['read', 'write', 'delete', 'manage_users'],
  },
  user: {
    permissions: ['read', 'write_own'],
  },
  guest: {
    permissions: ['read_public'],
  },
};
```

## 8. Rotación de Claves y Secretos

### 8.1 Script para rotación automática

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

## 9. Monitoreo de Seguridad

### 9.1 Configurar fail2ban para contenedores

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

## 10. Conclusión

La implementación de estas medidas de seguridad mejorará significativamente la postura de seguridad
del proyecto Flores Victoria. Se recomienda:

1. Implementar el escaneo de vulnerabilidades como parte del proceso de CI/CD
2. Configurar redes Docker aisladas para diferentes tipos de servicios
3. Implementar autenticación mutua TLS para comunicación entre microservicios
4. Endurecer las configuraciones de bases de datos
5. Establecer procesos de rotación automática de secretos
6. Configurar monitoreo de seguridad y respuesta a incidentes

Estas mejoras deben implementarse gradualmente y probarse cuidadosamente para evitar interrupciones
en el servicio.
