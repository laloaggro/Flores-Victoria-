FROM node:16-alpine

WORKDIR /app

# Copiar el package.json del servicio
COPY microservices/auth-service/package.json ./

# Instalar todas las dependencias
RUN npm install

# Instalar prom-client explícitamente
RUN npm install prom-client

# Copiar los módulos compartidos
COPY shared/tracing ./node_modules/@flores-victoria/tracing
COPY shared/metrics ./node_modules/@flores-victoria/metrics

# Instalar todas las dependencias incluyendo las de los módulos compartidos
RUN cd ./node_modules/@flores-victoria/tracing && npm install
RUN cd ./node_modules/@flores-victoria/metrics && npm install

# Copiar el código fuente
COPY microservices/auth-service/src ./src

# Crear base de datos
RUN touch /app/database.sqlite

EXPOSE 3000

CMD ["npm", "start"]