# Build version: 1.4.0 - Admin Dashboard Service with ioredis for token revocation
FROM node:22-alpine

WORKDIR /app/admin-dashboard-service

# Install dependencies directly (avoid file: reference issues)
RUN npm init -y && \
    npm install --no-audit --no-fund \
    express@^4.18.2 \
    cors@^2.8.5 \
    helmet@^7.1.0 \
    axios@^1.6.2 \
    bcryptjs@^2.4.3 \
    dotenv@^16.3.1 \
    jsonwebtoken@^9.0.2 \
    ioredis@^5.3.2

# Create shared stub before copying source
RUN mkdir -p ../shared && printf 'const metricsMiddleware = (name) => (req, res, next) => next();\nconst metricsEndpoint = (name) => (req, res) => res.send("# metrics");\nmodule.exports = { metricsMiddleware, metricsEndpoint };' > ../shared/metrics-simple.js

# Copy source code
COPY src/ ./src/
COPY dashboard.html ./

EXPOSE 3012

# Use server.simple.js to avoid @flores-victoria/shared dependency issues
CMD ["node", "src/server.simple.js"]
