#!/bin/bash

# SwarmTech - Docker Down Script
# Stops all Docker services

set -e

RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║         SwarmTech Docker Shutdown             ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}Stopping Docker containers...${NC}"
echo ""

# Use docker compose (v2) or docker-compose (v1)
if docker compose version &> /dev/null; then
    docker compose down
else
    docker-compose down
fi

echo ""
echo -e "${RED}✓ All containers stopped${NC}"
echo ""
