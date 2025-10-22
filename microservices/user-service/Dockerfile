FROM node:18

# Instalar curl para health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Copiar módulos compartidos
COPY ../shared /shared

# Instalar dependencias (production) - usar npm install para evitar bloqueo por package-lock desactualizado
RUN npm install --only=production

EXPOSE 3003

CMD ["node", "src/server.js"]