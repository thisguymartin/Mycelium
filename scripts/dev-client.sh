#!/bin/bash

# SwarmTech - Development Script (Client Only)
# Runs only the client application

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║         SwarmTech Client (Dev Mode)           ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if dependencies are installed
if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Client dependencies not installed. Installing...${NC}"
    cd client && npm install && cd ..
fi

# Check if common is built
if [ ! -d "common/dist" ]; then
    echo -e "${YELLOW}⚠️  Common package not built. Building...${NC}"
    cd common && npm install && npm run build && cd ..
fi

# Create .env if it doesn't exist
if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠️  Client .env not found. Creating from .env.example...${NC}"
    cp client/.env.example client/.env
fi

echo -e "${GREEN}✓ Starting client on http://localhost:5173${NC}"
echo ""

cd client && npm run dev
