#!/bin/bash

# SwarmTech - Build Script (All Services)
# Builds client, server, and common packages

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║          SwarmTech Production Build           ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Build common first (needed by client and server)
echo -e "${BLUE}[1/3] Building common package...${NC}"
cd common
if npm run build; then
    echo -e "${GREEN}✓ Common package built successfully${NC}"
else
    echo -e "${RED}✗ Common package build failed${NC}"
    exit 1
fi
cd ..

# Build server
echo ""
echo -e "${BLUE}[2/3] Building server...${NC}"
cd server
if npm run build; then
    echo -e "${GREEN}✓ Server built successfully${NC}"
else
    echo -e "${RED}✗ Server build failed${NC}"
    exit 1
fi
cd ..

# Build client
echo ""
echo -e "${BLUE}[3/3] Building client...${NC}"
cd client
if npm run build; then
    echo -e "${GREEN}✓ Client built successfully${NC}"
else
    echo -e "${RED}✗ Client build failed${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║            Build Complete! 🎉                 ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Build artifacts:"
echo "  • common/dist/"
echo "  • server/dist/"
echo "  • client/dist/"
echo ""
