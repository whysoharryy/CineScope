# ==============================================================================
# Stage 1: Build React Production Artifacts
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy application source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# ==============================================================================
# Stage 2: Production NGINX Web Server
# ==============================================================================
FROM nginx:1.27-alpine

# Set labels for metadata and student mini-project presentation
LABEL maintainer="CineScope DevOps Team"
LABEL version="1.0"
LABEL description="CineScope - High Performance React SPA on NGINX"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built production assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX server block configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Container healthcheck using wget against /healthz
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/healthz || exit 1

# Start NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
