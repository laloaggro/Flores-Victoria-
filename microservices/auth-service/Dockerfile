FROM node:16-alpine

WORKDIR /app

# Copiar los módulos compartidos
COPY shared/tracing ./shared/tracing
COPY shared/metrics ./shared/metrics

# Instalar todas las dependencias incluyendo las de los módulos compartidos
RUN cd ./shared/tracing && npm install
RUN cd ./shared/metrics && npm install

# Copiar el package.json del servicio
COPY microservices/auth-service/package.json ./

# Instalar todas las dependencias
RUN npm install

# Instalar prom-client explícitamente
RUN npm install prom-client

# Crear los directorios para los módulos compartidos en node_modules
RUN mkdir -p ./node_modules/@flores-victoria

# Copiar los módulos compartidos a node_modules
RUN cp -r ./shared/tracing ./node_modules/@flores-victoria/
RUN cp -r ./shared/metrics ./node_modules/@flores-victoria/

# Copiar el código fuente
COPY microservices/auth-service/src ./src

# Crear base de datos
RUN touch /app/database.sqlite

EXPOSE 3000

CMD ["npm", "start"]