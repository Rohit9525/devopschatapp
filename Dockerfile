
FROM node:20-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and lock file
# Check for package-lock.json first, then yarn.lock, then pnpm-lock.yaml
COPY package.json ./
COPY package-lock.json* ./

# Install project dependencies
# Use --frozen-lockfile if package-lock.json exists
# RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

RUN npm ci --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application for production
# Ensure VITE_ environment variables are available during build if needed
# For now, assuming no build-time env vars are strictly required from .env
RUN npm run build

# ---- Stage 2: Production ----
# Use a lightweight Nginx image to serve the static files
FROM nginx:stable-alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default Nginx welcome page
RUN rm /etc/nginx/conf.d/default.conf

# Create a default Nginx config for single-page applications
# This ensures that routing within the React app works correctly
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    # Optional: Add cache control headers for assets
    location ~* \.(?:css|js|jpg|jpeg|gif|png|svg|ico|webp|woff|woff2|ttf|eot)$ { \
    expires 1y; \
    add_header Cache-Control "public"; \
    } \
    }' > /etc/nginx/conf.d/app.conf

# Expose port 80
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]