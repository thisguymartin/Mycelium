#!/bin/bash

# SwarmTech - Clean Script
# Removes all build artifacts and node_modules

set -e

RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║            SwarmTech Clean Script             ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}⚠️  This will remove all build artifacts and dependencies${NC}"
echo -e "${YELLOW}⚠️  Press Ctrl+C to cancel, or Enter to continue...${NC}"
read

echo ""
echo -e "${RED}Cleaning build artifacts...${NC}"

# Remove dist folders
if [ -d "common/dist" ]; then
    rm -rf common/dist
    echo "  ✓ Removed common/dist"
fi

if [ -d "server/dist" ]; then
    rm -rf server/dist
    echo "  ✓ Removed server/dist"
fi

if [ -d "client/dist" ]; then
    rm -rf client/dist
    echo "  ✓ Removed client/dist"
fi

echo ""
echo -e "${RED}Cleaning node_modules...${NC}"

# Remove node_modules
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "  ✓ Removed root node_modules"
fi

if [ -d "common/node_modules" ]; then
    rm -rf common/node_modules
    echo "  ✓ Removed common/node_modules"
fi

if [ -d "server/node_modules" ]; then
    rm -rf server/node_modules
    echo "  ✓ Removed server/node_modules"
fi

if [ -d "client/node_modules" ]; then
    rm -rf client/node_modules
    echo "  ✓ Removed client/node_modules"
fi

echo ""
echo -e "${RED}Cleaning lock files...${NC}"

# Remove lock files
if [ -f "package-lock.json" ]; then
    rm package-lock.json
    echo "  ✓ Removed root package-lock.json"
fi

if [ -f "common/package-lock.json" ]; then
    rm common/package-lock.json
    echo "  ✓ Removed common/package-lock.json"
fi

if [ -f "server/package-lock.json" ]; then
    rm server/package-lock.json
    echo "  ✓ Removed server/package-lock.json"
fi

if [ -f "client/package-lock.json" ]; then
    rm client/package-lock.json
    echo "  ✓ Removed client/package-lock.json"
fi

echo ""
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║              Clean Complete! 🧹               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "To reinstall dependencies, run:"
echo "  ./scripts/install.sh"
echo ""
