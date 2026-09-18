# =============================================================================
# Stage 1: Build the Angular application
# =============================================================================
FROM node:12-alpine AS build

WORKDIR /app

# Copy dependency files first (better Docker layer caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build for production
RUN npm run build -- --prod

# =============================================================================
# Stage 2: Serve with Nginx
# =============================================================================
FROM nginx:1.25-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from build stage
COPY --from=build /app/dist/wwwroot /usr/share/nginx/html

# Ensure config directory exists with correct permissions
RUN mkdir -p /usr/share/nginx/html/assets/config && \
    chown -R nginx:nginx /usr/share/nginx/html/assets/config

# Copy entrypoint script that generates runtime config
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/assets/config/app-config.json || exit 1

# Expose port 80
EXPOSE 80

# Use custom entrypoint that injects environment variables into app-config.json
ENTRYPOINT ["/docker-entrypoint.sh"]
