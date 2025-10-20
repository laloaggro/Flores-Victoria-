FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Copiar carpeta shared (asumiendo que el build context incluye la carpeta parent 'microservices')
# y dejarla en /app/../../shared equivalente. Para evitar rutas complejas, se copia a /app/shared
COPY ../shared ./shared

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3002

CMD ["npm", "start"]