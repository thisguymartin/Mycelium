FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY client/package.json ./
COPY common/package.json ./common/

# Install dependencies
RUN npm install

# Copy source code
COPY client/ ./
COPY common/ ./common/

# Build application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
