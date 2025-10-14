FROM node:16-alpine

WORKDIR /app

# Copiar el package.json del servicio
COPY package.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar los módulos compartidos
COPY ../../shared/tracing ./shared/tracing
COPY ../../shared/metrics ./shared/metrics

# Instalar todas las dependencias incluyendo las de los módulos compartidos
RUN cd ./shared/tracing && npm install
RUN cd ./shared/metrics && npm install

# Copiar el código fuente
COPY src ./src

# Crear base de datos
RUN touch /app/database.sqlite

EXPOSE 3002

CMD ["node", "src/app.js"]