#!/bin/bash

# SwarmTech - Development Script (All Services)
# Runs client, server, and database in development mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║       SwarmTech Development Environment       ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Running npm install...${NC}"
    npm install
fi

# Check if common is built
if [ ! -d "common/dist" ]; then
    echo -e "${YELLOW}⚠️  Common package not built. Building...${NC}"
    cd common && npm run build && cd ..
fi

# Create .env files if they don't exist
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Server .env not found. Creating from .env.example...${NC}"
    cp server/.env.example server/.env
fi

if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠️  Client .env not found. Creating from .env.example...${NC}"
    cp client/.env.example client/.env
fi

echo -e "${GREEN}✓ Environment setup complete${NC}"
echo ""
echo -e "${BLUE}Starting services...${NC}"
echo ""
echo -e "${GREEN}→ Client:${NC} http://localhost:5173"
echo -e "${GREEN}→ Server:${NC} http://localhost:8001"
echo -e "${GREEN}→ Health:${NC} http://localhost:8001/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Run all services with concurrently
npm run dev
