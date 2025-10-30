#!/bin/bash

# Quick coverage summary for all microservices
# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════╗"
echo "║     COVERAGE SUMMARY - ALL SERVICES                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

SERVICES=("user-service" "auth-service" "product-service" "cart-service" "order-service")
TOTAL_TESTS=0
TOTAL_PASSED=0

for service in "${SERVICES[@]}"; do
  SERVICE_PATH="microservices/$service"
  
  if [ -d "$SERVICE_PATH" ]; then
    echo -e "${BLUE}┌─ $service ${NC}"
    
    # Run tests and capture output
    cd "$SERVICE_PATH"
    TEST_OUTPUT=$(npm test -- --coverage --silent 2>&1)
    
    # Extract test count
    TEST_COUNT=$(echo "$TEST_OUTPUT" | grep -oP 'Tests:\s+\K\d+(?= passed)' || echo "0")
    TOTAL_TESTS=$((TOTAL_TESTS + TEST_COUNT))
    TOTAL_PASSED=$((TOTAL_PASSED + TEST_COUNT))
    
    # Extract coverage line
    COVERAGE=$(echo "$TEST_OUTPUT" | grep "All files" | head -1)
    
    if [ -n "$COVERAGE" ]; then
      echo "$COVERAGE"
    fi
    
    echo -e "   Tests: ${GREEN}$TEST_COUNT passed${NC}"
    echo ""
    cd ../..
  fi
done

echo "╔════════════════════════════════════════════════════════╗"
echo -e "║  ${GREEN}TOTAL: $TOTAL_PASSED tests passing across all services${NC}  ║"
echo "╚════════════════════════════════════════════════════════╝"
