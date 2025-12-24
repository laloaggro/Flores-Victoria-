# Build version: 1.2.0 - Admin Dashboard Service with bcryptjs fix
FROM node:22-alpine

WORKDIR /app/admin-dashboard-service

# Install dependencies directly (avoid file: reference issues)
RUN npm init -y && \
    npm install --no-audit --no-fund \
    express@^4.18.2 \
    cors@^2.8.5 \
    axios@^1.6.2 \
    bcryptjs@^2.4.3 \
    dotenv@^16.3.1 \
    jsonwebtoken@^9.0.2

# Create shared stub before copying source
RUN mkdir -p ../shared && printf 'const metricsMiddleware = (name) => (req, res, next) => next();\nconst metricsEndpoint = (name) => (req, res) => res.send("# metrics");\nmodule.exports = { metricsMiddleware, metricsEndpoint };' > ../shared/metrics-simple.js

# Copy source code
COPY src/ ./src/
COPY dashboard.html ./

EXPOSE 3012

CMD ["node", "src/server.js"]
