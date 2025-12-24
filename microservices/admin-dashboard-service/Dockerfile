# Build version: 1.1.0 - Admin Dashboard Service with bcryptjs
FROM node:22-alpine

WORKDIR /app/admin-dashboard-service

# Copy package files
COPY package.json ./

# Install dependencies including bcryptjs
RUN npm install --omit=dev --no-audit --no-fund

# Copy source code
COPY src/ ./src/
COPY dashboard.html ./

# Create shared stub if needed
RUN mkdir -p ../shared && printf 'const metricsMiddleware = (name) => (req, res, next) => next();\nconst metricsEndpoint = (name) => (req, res) => res.send("# metrics");\nmodule.exports = { metricsMiddleware, metricsEndpoint };' > ../shared/metrics-simple.js

EXPOSE 3012

CMD ["node", "src/server.js"]
