# Nixpacks configuration for order-service
[phases.setup]
nixPkgs = ['nodejs']

[phases.install]
cmds = [
  'cd /app/microservices/shared && npm install --production',
  'cd /app/microservices/order-service && npm ci',
  'cd /app/microservices/order-service && mkdir -p node_modules/@flores-victoria',
  'cd /app/microservices/order-service && cp -r ../shared node_modules/@flores-victoria/'
]

[start]
cmd = 'cd /app/microservices/order-service && node src/server.js'
