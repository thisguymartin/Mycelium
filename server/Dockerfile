FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY server/package.json ./
COPY common/package.json ./common/

# Install dependencies
RUN npm install

# Copy source code
COPY server/ ./
COPY common/ ./common/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY server/package.json ./
RUN npm install --production

# Copy built application
COPY --from=base /app/dist ./dist

EXPOSE 8001

CMD ["node", "dist/index.js"]
