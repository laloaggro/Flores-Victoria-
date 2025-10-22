FROM node:16-alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3008

CMD ["npm", "start"]