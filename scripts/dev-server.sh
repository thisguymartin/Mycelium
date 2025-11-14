#!/bin/bash

# SwarmTech - Development Script (Server Only)
# Runs only the signaling server

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║         SwarmTech Server (Dev Mode)           ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Server dependencies not installed. Installing...${NC}"
    cd server && npm install && cd ..
fi

# Check if common is built
if [ ! -d "common/dist" ]; then
    echo -e "${YELLOW}⚠️  Common package not built. Building...${NC}"
    cd common && npm install && npm run build && cd ..
fi

# Create .env if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Server .env not found. Creating from .env.example...${NC}"
    cp server/.env.example server/.env
fi

echo -e "${GREEN}✓ Starting server on http://localhost:8001${NC}"
echo -e "${GREEN}✓ Health check: http://localhost:8001/health${NC}"
echo ""

cd server && npm run dev
