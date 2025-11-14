#!/bin/bash

# SwarmTech - Install Script
# Installs all dependencies for client, server, and common

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║       SwarmTech Dependency Installation       ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js 20+ recommended. Current: $(node -v)${NC}"
else
    echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"
fi

echo ""

# Install root dependencies
echo -e "${BLUE}[1/4] Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"

echo ""

# Install common dependencies
echo -e "${BLUE}[2/4] Installing common package dependencies...${NC}"
cd common
npm install
echo -e "${GREEN}✓ Common dependencies installed${NC}"
cd ..

echo ""

# Install server dependencies
echo -e "${BLUE}[3/4] Installing server dependencies...${NC}"
cd server
npm install
echo -e "${GREEN}✓ Server dependencies installed${NC}"
cd ..

echo ""

# Install client dependencies
echo -e "${BLUE}[4/4] Installing client dependencies...${NC}"
cd client
npm install
echo -e "${GREEN}✓ Client dependencies installed${NC}"
cd ..

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║        All dependencies installed! 🎉         ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example files:"
echo "     • cp server/.env.example server/.env"
echo "     • cp client/.env.example client/.env"
echo ""
echo "  2. Start development:"
echo "     • npm run dev           (all services)"
echo "     • npm run dev:client    (client only)"
echo "     • npm run dev:server    (server only)"
echo ""
echo "  3. Or use Docker:"
echo "     • docker-compose up"
echo ""
