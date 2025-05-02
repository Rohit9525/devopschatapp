
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json* ./

RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

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


EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]