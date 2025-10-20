#!/bin/bash

echo "Corrigiendo rutas de dependencias en Dockerfiles..."

# Actualizar Dockerfile para auth-service
echo "Actualizando Dockerfile para auth-service..."
cat > ./microservices/auth-service/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Copiar la aplicación
COPY . .

# Copiar los módulos compartidos
COPY ../shared /shared

# Instalar dependencias principales
RUN npm ci --only=production

# Instalar dependencias en los módulos compartidos
RUN cd /shared/logging && npm install && \
    cd ../tracing && npm install && \
    cd ../metrics && npm install && \
    cd ../audit && npm install

# Crear enlaces simbólicos a los node_modules de los módulos compartidos
RUN mkdir -p node_modules/@flores-victoria && \
    ln -s /shared/logging node_modules/@flores-victoria/logging && \
    ln -s /shared/tracing node_modules/@flores-victoria/tracing && \
    ln -s /shared/metrics node_modules/@flores-victoria/metrics && \
    ln -s /shared/audit node_modules/@flores-victoria/audit

EXPOSE 3001

CMD ["node", "src/server.js"]
EOF

# Actualizar Dockerfile para product-service...
# (This will be identical to auth-service except for the EXPOSE and CMD lines)
cat > ./microservices/product-service/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Copiar la aplicación
COPY . .

# Copiar los módulos compartidos
COPY ../shared /shared

# Instalar dependencias principales
RUN npm ci --only=production

# Instalar dependencias en los módulos compartidos
RUN cd /shared/logging && npm install && \
    cd ../tracing && npm install && \
    cd ../metrics && npm install && \
    cd ../audit && npm install

# Crear enlaces simbólicos a los node_modules de los módulos compartidos
RUN mkdir -p node_modules/@flores-victoria && \
    ln -s /shared/logging node_modules/@flores-victoria/logging && \
    ln -s /shared/tracing node_modules/@flores-victoria/tracing && \
    ln -s /shared/metrics node_modules/@flores-victoria/metrics && \
    ln -s /shared/audit node_modules/@flores-victoria/audit

EXPOSE 3002

CMD ["node", "src/server.js"]
EOF

echo "Instalando dependencias en componentes compartidos..."

# Directorio base
cd ./shared/logging && npm install
cd ../metrics && npm install
cd ../tracing && npm install
cd ../../

# Copiar los módulos compartidos a cada microservicio
for service in ./microservices/auth-service ./microservices/product-service; do
  echo "Configurando dependencias para $service..."
  
  # Crear directorios compartidos si no existen
  mkdir -p $service/shared/logging
  mkdir -p $service/shared/metrics
  mkdir -p $service/shared/tracing
  
  # Copiar los módulos compartidos
  cp -r ./shared/logging/* $service/shared/logging/
  cp -r ./shared/metrics/* $service/shared/metrics/
  cp -r ./shared/tracing/* $service/shared/tracing/
  
  # Instalar dependencias en cada servicio
  cd $service && npm install
  cd ../..
done

echo "Dependencias compartidas copiadas y configuradas en los directorios de los servicios."

# Actualizar docker-compose.yml para montar volúmenes de dependencias compartidas
echo "Actualizando docker-compose.yml para montar volúmenes de dependencias compartidas..."

# Crear un nuevo archivo docker-compose.fixed.yml
cat > docker-compose.fixed.yml << 'EOF'
version: '3.8'

services:
  # Databases
  mongodb:
    image: mongo:5.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  postgres:
    image: postgres:14
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: example
      POSTGRES_DB: floresvictoria
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3-management-alpine
    restart: always
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  jaeger:
    image: jaegertracing/all-in-one:latest
    restart: always
    ports:
      - "6831:6831/udp"
      - "16686:16686"
    environment:
      - COLLECTOR_ZIPKIN_HTTP_PORT=9411

  # Microservices
  auth-service:
    build: 
      context: ./microservices/auth-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - JWT_SECRET=mysecretkey
      - DB_HOST=postgres
      - DB_USER=postgres
      - DB_PASSWORD=example
      - DB_NAME=floresvictoria
    depends_on:
      - postgres
      - redis
      - jaeger
    volumes:
      - ./microservices/auth-service:/app
      - ./shared:/app/shared
    restart: always

  product-service:
    build:
      context: ./microservices/product-service
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
      - DB_HOST=mongodb
      - DB_USER=root
      - DB_PASSWORD=example
      - DB_NAME=floresvictoria
    depends_on:
      - mongodb
      - redis
      - jaeger
    volumes:
      - ./microservices/product-service:/app
      - ./shared:/app/shared
    restart: always

  user-service:
    build: ./microservices/user-service
    ports:
      - "3003:3003"
    environment:
      - PORT=3003
      - DB_HOST=postgres
    depends_on:
      - postgres
    restart: always

  order-service:
    build: ./microservices/order-service
    ports:
      - "3004:3004"
    environment:
      - PORT=3004
      - DB_HOST=postgres
    depends_on:
      - postgres
      - rabbitmq
    restart: always

  cart-service:
    build: ./microservices/cart-service
    ports:
      - "3005:3005"
    environment:
      - PORT=3005
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    restart: always

  wishlist-service:
    build: ./microservices/wishlist-service
    ports:
      - "3006:3006"
    environment:
      - PORT=3006
      - DB_HOST=mongodb
    depends_on:
      - mongodb
    restart: always

  review-service:
    build: ./microservices/review-service
    ports:
      - "3007:3007"
    environment:
      - PORT=3007
      - DB_HOST=mongodb
    depends_on:
      - mongodb
    restart: always

  contact-service:
    build: ./microservices/contact-service
    ports:
      - "3008:3008"
    environment:
      - PORT=3008
      - DB_HOST=postgres
    depends_on:
      - postgres
    restart: always

  # API Gateway
  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
    depends_on:
      - auth-service
      - product-service
      - user-service
      - order-service
      - cart-service
      - wishlist-service
      - review-service
      - contact-service
    restart: always

  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - api-gateway
    restart: always

  # Admin Panel
  admin-panel:
    build: ./admin-panel
    ports:
      - "3009:3009"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - api-gateway
    restart: always

volumes:
  mongodb_data:
  postgres_data:
  redis_data:
  rabbitmq_data:
EOF

echo "Archivo docker-compose.fixed.yml creado con las correcciones."
echo "Para usar el archivo corregido, ejecute:"
echo "docker-compose -f docker-compose.fixed.yml up -d"