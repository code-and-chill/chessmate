#!/bin/bash
# Validate Bruno API Collections across all services

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Validating Bruno API Collections Standard Implementation${NC}\n"

# Services with HTTP APIs
SERVICES=(
    "account-api"
    "live-game-api"
    "matchmaking-api"
    "rating-api"
    "bot-orchestrator-api"
    "chess-knowledge-api"
    "engine-cluster-api"
)

total_checks=0
passed_checks=0
failed_checks=0

# Check function
check() {
    local description=$1
    local condition=$2
    
    total_checks=$((total_checks + 1))
    
    if eval "$condition"; then
        echo -e "${GREEN}✓${NC} $description"
        passed_checks=$((passed_checks + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        failed_checks=$((failed_checks + 1))
        return 1
    fi
}

# Validate each service
for service in "${SERVICES[@]}"; do
    echo -e "\n${BLUE}📦 Validating $service${NC}"
    
    # 1. Bruno directory exists
    check "  bruno/ directory exists" "[ -d '$service/bruno' ]"
    
    # 2. Environment files exist
    check "  environments/local.env exists" "[ -f '$service/bruno/environments/local.env' ]"
    check "  environments/staging.env exists" "[ -f '$service/bruno/environments/staging.env' ]"
    check "  environments/production.env exists" "[ -f '$service/bruno/environments/production.env' ]"
    
    # 3. Collections directory exists
    check "  collections/ directory exists" "[ -d '$service/bruno/collections' ]"
    
    # 4. Collection metadata exists
    check "  collections/$service.bru exists" "[ -f '$service/bruno/collections/$service.bru' ]"
    
    # 5. Health check endpoint exists
    check "  collections/health.bru exists" "[ -f '$service/bruno/collections/health.bru' ]"
    
    # 6. Tests directory exists
    check "  tests/ directory exists" "[ -d '$service/bruno/tests' ]"
    
    # 7. At least one additional endpoint exists
    collection_count=$(find "$service/bruno/collections" -name "*.bru" -type f | wc -l)
    check "  has at least 2 collections (found $collection_count)" "[ $collection_count -ge 2 ]"
    
    # 8. service.yaml includes bruno commands
    if [ -f "$service/service.yaml" ]; then
        check "  service.yaml has bruno command" "grep -q 'bruno:' '$service/service.yaml'"
        check "  service.yaml has bruno-test command" "grep -q 'bruno-test:' '$service/service.yaml'"
    else
        echo -e "${YELLOW}  ⚠ service.yaml not found${NC}"
    fi
done

# Check global documentation
echo -e "\n${BLUE}📚 Validating Documentation${NC}"
check "  AGENTS.md includes Bruno section" "grep -q '## Bruno API Collections Standard' AGENTS.md"
check "  docs/standards/bruno-api-testing.md exists" "[ -f 'docs/standards/bruno-api-testing.md' ]"
check "  docs/dx-service-spec.md includes bruno commands" "grep -q 'bruno:' docs/dx-service-spec.md"

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Validation Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total checks:  $total_checks"
echo -e "${GREEN}Passed:        $passed_checks${NC}"
if [ $failed_checks -gt 0 ]; then
    echo -e "${RED}Failed:        $failed_checks${NC}"
else
    echo -e "Failed:        $failed_checks"
fi

percentage=$((passed_checks * 100 / total_checks))
echo -e "Success rate:  ${percentage}%"

if [ $failed_checks -eq 0 ]; then
    echo -e "\n${GREEN}✅ All Bruno API Collections validation checks passed!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some validation checks failed. Review the output above.${NC}"
    exit 1
fi
