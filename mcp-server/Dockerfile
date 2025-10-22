FROM node:18-alpine

# Instalar curl para health checks
RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 5050
CMD ["node", "server.js"]
