FROM node:18

WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Copiar módulos compartidos
COPY ../shared /shared

EXPOSE 3007

CMD ["node", "src/server.js"]