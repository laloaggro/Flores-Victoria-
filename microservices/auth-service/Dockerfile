FROM node:18

# Instalar curl para health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package.json y package-lock.json si existe
COPY package*.json ./

# Copiar los módulos compartidos
COPY ../shared /shared

# Instalar dependencias incluyendo los módulos compartidos
RUN npm install --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Crear directorio de logs si no existe
RUN mkdir -p logs

EXPOSE 3001

CMD ["npm", "start"]