#!/bin/bash

echo "=========================================="
echo "ChessMate Docker Setup Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

echo -e "${YELLOW}Checking Dockerfiles...${NC}"
for service in account-api live-game-api matchmaking-api chess-app; do
    if [ -f "$service/Dockerfile" ]; then
        echo -e "${GREEN}✓${NC} $service/Dockerfile exists"
        # Verify FROM statement
        if grep -q "^FROM" "$service/Dockerfile"; then
            echo -e "${GREEN}  ✓${NC} Valid FROM statement"
        else
            echo -e "${RED}  ✗${NC} No FROM statement"
            ((ISSUES++))
        fi
    else
        echo -e "${RED}✗${NC} $service/Dockerfile missing"
        ((ISSUES++))
    fi
done

echo ""
echo -e "${YELLOW}Checking .dockerignore files...${NC}"
for service in account-api live-game-api matchmaking-api chess-app; do
    if [ -f "$service/.dockerignore" ]; then
        echo -e "${GREEN}✓${NC} $service/.dockerignore exists"
    else
        echo -e "${RED}✗${NC} $service/.dockerignore missing"
        ((ISSUES++))
    fi
done

echo ""
echo -e "${YELLOW}Checking docker-compose.yml...${NC}"
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml exists"
    if grep -q "services:" "docker-compose.yml"; then
        echo -e "${GREEN}  ✓${NC} Valid docker-compose structure"
    else
        echo -e "${RED}  ✗${NC} Invalid docker-compose structure"
        ((ISSUES++))
    fi
else
    echo -e "${RED}✗${NC} docker-compose.yml missing"
    ((ISSUES++))
fi

echo ""
echo -e "${YELLOW}Checking documentation...${NC}"
for doc in DOCKER.md docs/standards/dockerfile.md docs/standards/docker-implementation.md; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc exists"
    else
        echo -e "${RED}✗${NC} $doc missing"
        ((ISSUES++))
    fi
done

echo ""
echo -e "${YELLOW}Verifying multi-stage builds...${NC}"
for service in account-api live-game-api matchmaking-api; do
    if grep -q "as builder" "$service/Dockerfile"; then
        echo -e "${GREEN}✓${NC} $service/Dockerfile has multi-stage build"
    else
        echo -e "${RED}✗${NC} $service/Dockerfile missing multi-stage build"
        ((ISSUES++))
    fi
done

if grep -q "as builder" chess-app/Dockerfile; then
    echo -e "${GREEN}✓${NC} chess-app/Dockerfile has multi-stage build"
else
    echo -e "${RED}✗${NC} chess-app/Dockerfile missing multi-stage build"
    ((ISSUES++))
fi

echo ""
echo -e "${YELLOW}Checking security features...${NC}"
for service in account-api live-game-api matchmaking-api; do
    if grep -q "USER appuser" "$service/Dockerfile"; then
        echo -e "${GREEN}✓${NC} $service runs as non-root user"
    else
        echo -e "${YELLOW}⚠${NC} $service may not specify non-root user"
    fi
done

if grep -q "USER appuser" chess-app/Dockerfile; then
    echo -e "${GREEN}✓${NC} chess-app runs as non-root user"
else
    echo -e "${YELLOW}⚠${NC} chess-app may not specify non-root user"
fi

echo ""
echo -e "${YELLOW}Checking health checks...${NC}"
for service in account-api live-game-api matchmaking-api chess-app; do
    if grep -q "HEALTHCHECK" "$service/Dockerfile"; then
        echo -e "${GREEN}✓${NC} $service has health check"
    else
        echo -e "${RED}✗${NC} $service missing health check"
        ((ISSUES++))
    fi
done

echo ""
echo "=========================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "Docker setup is complete and ready for use."
else
    echo -e "${RED}✗ Found $ISSUES issue(s)${NC}"
    echo "Please review the errors above."
fi
echo "=========================================="
