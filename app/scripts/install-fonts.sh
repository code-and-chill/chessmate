#!/bin/bash
# Font Upgrade Installation Script
# app/scripts/install-fonts.sh

set -e

echo "🎨 ChessMate Font Upgrade Installer"
echo "===================================="
echo ""

# Check if we're in the app directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from app/ directory"
  exit 1
fi

echo "📦 Installing premium Google Fonts..."
echo ""

# Install Outfit (Display & Titles)
echo "→ Installing Outfit (geometric sans-serif)..."
npx expo install @expo-google-fonts/outfit

# Install Inter (Body & UI) - may already be installed
echo "→ Installing Inter (body text)..."
npx expo install @expo-google-fonts/inter

# Install JetBrains Mono (Code & Notation) - may already be installed
echo "→ Installing JetBrains Mono (monospace)..."
npx expo install @expo-google-fonts/jetbrains-mono

echo ""
echo "✅ Fonts installed successfully!"
echo ""
echo "📝 Next Steps:"
echo "1. Update App.tsx to load fonts (see docs/FONT_UPGRADE_GUIDE.md)"
echo "2. Run: npx expo start --clear"
echo "3. Verify fonts load in console"
echo ""
echo "📖 Full guide: app/docs/FONT_UPGRADE_GUIDE.md"
