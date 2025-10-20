FROM node:18

WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Copiar módulos compartidos
COPY ../shared /shared

# Instalar dependencias (production) - usar npm install para evitar bloqueo por package-lock desactualizado
RUN npm install --only=production

EXPOSE 3003

CMD ["node", "src/server.js"]