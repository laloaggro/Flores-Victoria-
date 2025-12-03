# Railway Dockerfile - Optimized for fast deployment
FROM nginx:alpine

RUN apk add --no-cache curl

# Copy startup script
COPY start-nginx.sh /start-nginx.sh
RUN chmod +x /start-nginx.sh

# Copy nginx config first
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ALL frontend files to nginx root
COPY . /usr/share/nginx/html/

# Move public/* to root (merge public content with root)
RUN if [ -d /usr/share/nginx/html/public ]; then \
    cp -r /usr/share/nginx/html/public/* /usr/share/nginx/html/ && \
    rm -rf /usr/share/nginx/html/public; \
    fi

# Cleanup unnecessary files AFTER moving public
RUN cd /usr/share/nginx/html && \
    rm -rf node_modules __tests__ tests *.md Dockerfile* *.sh package*.json *.toml *.py vite.config.js dist/ nginx.conf start-nginx.sh

# Test nginx config
RUN nginx -t

EXPOSE 80
CMD ["/start-nginx.sh"]
