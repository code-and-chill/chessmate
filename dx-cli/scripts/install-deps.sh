#!/bin/bash

# ChessMate DX-CLI Dependency Installation Script
# This script installs required system dependencies for development

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ChessMate Development Dependencies Installer  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Detect OS
OS_TYPE=$(uname)
echo -e "${YELLOW}Detected OS: ${OS_TYPE}${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install on macOS
install_macos() {
    echo -e "${BLUE}Installing dependencies for macOS...${NC}"
    
    if ! command_exists brew; then
        echo -e "${RED}Homebrew not found. Please install Homebrew first:${NC}"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    echo -e "${YELLOW}Installing Poetry...${NC}"
    if command_exists poetry; then
        echo -e "${GREEN}✓ Poetry already installed${NC}"
    else
        brew install poetry
        echo -e "${GREEN}✓ Poetry installed${NC}"
    fi
}

# Function to install on Linux
install_linux() {
    echo -e "${BLUE}Installing dependencies for Linux...${NC}"
    
    if ! command_exists python3; then
        echo -e "${RED}Python 3 not found. Please install Python 3 first.${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Installing Poetry...${NC}"
    if command_exists poetry; then
        echo -e "${GREEN}✓ Poetry already installed${NC}"
    else
        python3 -m pip install --user --break-system-packages poetry 2>/dev/null || python3 -m pip install --user poetry
        
        # Add poetry to PATH if not already there
        if [ -d "$HOME/.local/bin" ]; then
            if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
                echo -e "${YELLOW}Adding ~/.local/bin to PATH${NC}"
                export PATH="$HOME/.local/bin:$PATH"
            fi
        fi
        echo -e "${GREEN}✓ Poetry installed${NC}"
    fi
}

# Main installation logic
case "$OS_TYPE" in
    Darwin)
        install_macos
        ;;
    Linux)
        install_linux
        ;;
    *)
        echo -e "${RED}Unsupported OS: $OS_TYPE${NC}"
        exit 1
        ;;
esac

# Verify installation
echo ""
echo -e "${BLUE}Verifying installations...${NC}"

if command_exists poetry; then
    POETRY_VERSION=$(poetry --version)
    echo -e "${GREEN}✓ $POETRY_VERSION${NC}"
else
    echo -e "${RED}✗ Poetry not found in PATH${NC}"
    echo -e "${YELLOW}Try adding this to your shell profile:${NC}"
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ All dependencies installed successfully    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run: dx setup"
echo "  2. Run: dx doctor"
echo "  3. Start developing with: dx dev"
