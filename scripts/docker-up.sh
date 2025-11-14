#!/bin/bash

# SwarmTech - Docker Up Script
# Starts all services with Docker Compose

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║          SwarmTech Docker Startup             ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Server .env not found. Creating from .env.example...${NC}"
    cp server/.env.example server/.env
fi

if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠️  Client .env not found. Creating from .env.example...${NC}"
    cp client/.env.example client/.env
fi

echo -e "${BLUE}Starting Docker containers...${NC}"
echo ""

# Use docker compose (v2) or docker-compose (v1)
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║          Docker Containers Started! 🐳        ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Services are running at:"
echo -e "${GREEN}→ Client:${NC}     http://localhost:5173"
echo -e "${GREEN}→ Server:${NC}     http://localhost:8001"
echo -e "${GREEN}→ Health:${NC}     http://localhost:8001/health"
echo -e "${GREEN}→ Database:${NC}   localhost:5432"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
