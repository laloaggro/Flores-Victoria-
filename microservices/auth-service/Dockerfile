# Build version: 3.0.3 - FORCE REBUILD - Auth Service Ultra Simplified
FROM node:18-alpine

WORKDIR /app

# Copy everything
COPY . .

# Setup package.json and install (no cache)
RUN cp package-simple.json package.json && \
    rm -f package-lock.json npm-shrinkwrap.json && \
    npm cache clean --force && \
    npm install --no-package-lock

CMD ["node", "src/server.simple.js"]
