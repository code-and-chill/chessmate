#!/bin/bash

# AGENTS.md Compliance Checker
# This script validates that all documentation follows AGENTS.md conventions

set -e

REPO_ROOT="/workspaces/chessmate"
VIOLATIONS=0
WARNINGS=0

echo "=========================================="
echo "AGENTS.md Documentation Compliance Check"
echo "=========================================="
echo ""

# Check 1: Root-level docs only contain canonical files
echo "✓ Check 1: Root-level documentation structure"
ROOT_DOCS=$(find "$REPO_ROOT" -maxdepth 1 -name "*.md" | grep -v node_modules | sort)
ALLOWED_ROOT=("AGENTS.md" "ARCHITECTURE.md" "SYSTEM_GUIDE.md" "DOCUMENTATION_REFERENCE.md" "ENFORCEMENT_SUMMARY.md")

for doc in $ROOT_DOCS; do
  BASENAME=$(basename "$doc")
  if [[ ! " ${ALLOWED_ROOT[@]} " =~ " ${BASENAME} " ]]; then
    echo "  ✗ Non-canonical root file: $BASENAME"
    ((VIOLATIONS++))
  fi
done

# Check 2: Cross-service docs only in /docs
echo "✓ Check 2: Cross-service documentation location"
CROSS_SERVICE_OUTSIDE_DOCS=$(find "$REPO_ROOT" -name "*.md" -not -path "*/node_modules/*" -not -path "*/services/*" -not -maxdepth 1 | grep -v "/docs/" | grep -v "^$REPO_ROOT/[^/]*\.md$")
if [ -n "$CROSS_SERVICE_OUTSIDE_DOCS" ]; then
  while IFS= read -r file; do
    echo "  ✗ Cross-service doc outside /docs: $file"
    ((VIOLATIONS++))
  done <<< "$CROSS_SERVICE_OUTSIDE_DOCS"
fi

# Check 3: Service docs only in services/<service>/docs
echo "✓ Check 3: Service documentation location"
for service in account-api live-game-api matchmaking-api chess-app; do
  SERVICE_ROOT="$REPO_ROOT/services/$service" 2>/dev/null || SERVICE_ROOT="$REPO_ROOT/$service"
  if [ -d "$SERVICE_ROOT" ]; then
    # Find .md files at service root (should only be README.md)
    ROOT_DOCS=$(find "$SERVICE_ROOT" -maxdepth 1 -name "*.md" -not -name "README.md" 2>/dev/null | wc -l)
    if [ "$ROOT_DOCS" -gt 0 ]; then
      echo "  ⚠ $service: Found .md files at root (should be in docs/)"
      ((WARNINGS++))
    fi
  fi
done

# Check 4: All docs have front-matter
echo "✓ Check 4: YAML front-matter on all docs"
MISSING_FRONTMATTER=$(find "$REPO_ROOT" -name "*.md" -not -path "*/node_modules/*" -exec sh -c 'head -1 "$1" | grep -q "^---" || echo "$1"' _ {} \; | grep -v "^$" | wc -l)
if [ "$MISSING_FRONTMATTER" -gt 0 ]; then
  echo "  ✗ $MISSING_FRONTMATTER files missing front-matter"
  ((VIOLATIONS++))
fi

# Check 5: Canonical naming only
echo "✓ Check 5: Canonical file naming"
NON_CANONICAL=$(find "$REPO_ROOT/docs" "$REPO_ROOT/services" -name "*.md" -not -path "*/node_modules/*" \
  \( -name "*GETTING_STARTED*" -o -name "*COMPLETION*" -o -name "*SCAFFOLD*" -o -name "*PLAYSCREEN*" -o -name "*THEMING*" -o -name "*PROJECT*" -o -name "*IMPLEMENTATION*" -o -name "*FORMAT*" -o -name "*QUICKREF*" \) 2>/dev/null | wc -l)
if [ "$NON_CANONICAL" -gt 0 ]; then
  echo "  ⚠ $NON_CANONICAL files with non-canonical names (should be archived)"
  ((WARNINGS++))
fi

# Check 6: /docs structure
echo "✓ Check 6: /docs directory structure"
REQUIRED_DIRS=("standards" "architecture" "operations" "business" "decisions" "archive")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$REPO_ROOT/docs/$dir" ]; then
    echo "  ✗ Missing required directory: /docs/$dir"
    ((VIOLATIONS++))
  fi
done

# Check 7: Service docs structure
echo "✓ Check 7: Service documentation structure"
REQUIRED_SERVICE_DOCS=("overview.md" "architecture.md" "api.md" "domain.md" "operations.md")
for service in account-api live-game-api matchmaking-api chess-app; do
  SERVICE_DOCS="$REPO_ROOT/$service/docs" 2>/dev/null || SERVICE_DOCS="$REPO_ROOT/services/$service/docs"
  if [ -d "$SERVICE_DOCS" ]; then
    for doc in "${REQUIRED_SERVICE_DOCS[@]}"; do
      if [ ! -f "$SERVICE_DOCS/$doc" ]; then
        echo "  ⚠ $service: Missing $doc"
        ((WARNINGS++))
      fi
    done
  fi
done

# Summary
echo ""
echo "=========================================="
echo "COMPLIANCE SUMMARY"
echo "=========================================="
echo "Violations: $VIOLATIONS"
echo "Warnings:   $WARNINGS"
echo ""

if [ "$VIOLATIONS" -eq 0 ]; then
  echo "✅ REPOSITORY IS COMPLIANT WITH AGENTS.md"
else
  echo "❌ VIOLATIONS FOUND - Please fix before proceeding"
  exit 1
fi

if [ "$WARNINGS" -gt 0 ]; then
  echo "⚠️  $WARNINGS warnings - review non-canonical files for archival"
fi
