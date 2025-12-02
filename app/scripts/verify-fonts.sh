#!/bin/bash
# Font Installation Verification Script

echo "🔍 Verifying font installation..."
echo ""

cd "$(dirname "$0")/.." || exit 1

# Check if fonts are in package.json
echo "📦 Checking package.json..."
if grep -q "@expo-google-fonts/outfit" package.json; then
  echo "  ✅ Outfit installed"
else
  echo "  ❌ Outfit not found"
fi

if grep -q "@expo-google-fonts/inter" package.json; then
  echo "  ✅ Inter installed"
else
  echo "  ❌ Inter not found"
fi

if grep -q "@expo-google-fonts/jetbrains-mono" package.json; then
  echo "  ✅ JetBrains Mono installed"
else
  echo "  ❌ JetBrains Mono not found"
fi

echo ""
echo "📁 Checking files..."

if [ -f "config/fonts.ts" ]; then
  echo "  ✅ config/fonts.ts exists"
else
  echo "  ❌ config/fonts.ts missing"
fi

if [ -f "ui/tokens/typography.ts" ]; then
  echo "  ✅ ui/tokens/typography.ts exists"
else
  echo "  ❌ ui/tokens/typography.ts missing"
fi

if [ -f "features/demo/FontTestScreen.tsx" ]; then
  echo "  ✅ FontTestScreen.tsx exists"
else
  echo "  ❌ FontTestScreen.tsx missing"
fi

echo ""
echo "✨ Installation complete!"
echo ""
echo "🚀 Next step: Run 'npx expo start --clear' to test"
