#!/bin/bash

# Test All Microservices - Flores Victoria
# Quick script to run tests for all microservices

echo "================================================"
echo "Testing All Flores Victoria Microservices"
echo "================================================"
echo ""

# Change to project root
cd "$(dirname "$0")/.." || exit 1

# Array of services to test
services=(
  "auth-service"
  "cart-service"
  "order-service"
  "product-service"
  "promotion-service"
  "user-service"
  "wishlist-service"
  "contact-service"
  "review-service"
  "api-gateway"
)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Summary variables
total_services=0
passed_services=0
failed_services=0
total_tests=0
passed_tests=0
failed_tests=0

for service in "${services[@]}"; do
  if [ -d "microservices/$service" ] && [ -f "microservices/$service/package.json" ]; then
    total_services=$((total_services + 1))
    echo ""
    echo "================================================"
    echo "Testing: $service"
    echo "================================================"
    
    cd "microservices/$service" || continue
    
    # Run tests and capture output
    test_output=$(npm test 2>&1)
    test_exit_code=$?
    
    # Display test results
    echo "$test_output" | grep -E "Test Suites:|Tests:|Time:"
    
    # Extract test counts
    if echo "$test_output" | grep -q "Test Suites:"; then
      # Parse test results
      suites_passed=$(echo "$test_output" | grep "Test Suites:" | grep -oP '\d+(?= passed)')
      tests_passed=$(echo "$test_output" | grep "Tests:" | grep -oP '\d+(?= passed)')
      
      if [ "$test_exit_code" -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed${NC}"
        passed_services=$((passed_services + 1))
      else
        echo -e "${YELLOW}⚠ Some tests failed${NC}"
        failed_services=$((failed_services + 1))
      fi
      
      # Accumulate test counts
      if [ -n "$tests_passed" ]; then
        total_tests=$((total_tests + tests_passed))
        passed_tests=$((passed_tests + tests_passed))
      fi
    else
      echo -e "${RED}✗ Test execution failed${NC}"
      failed_services=$((failed_services + 1))
    fi
    
    cd ../..
  fi
done

# Print summary
echo ""
echo "================================================"
echo "TEST SUMMARY"
echo "================================================"
echo ""
echo "Services tested: $total_services"
echo -e "${GREEN}Services with all tests passing: $passed_services${NC}"
echo -e "${YELLOW}Services with some failures: $failed_services${NC}"
echo ""
echo "Total tests run: $total_tests"
echo -e "${GREEN}Tests passed: $passed_tests${NC}"
echo ""

# Calculate pass rate
if [ $total_services -gt 0 ]; then
  pass_rate=$((passed_services * 100 / total_services))
  echo "Service pass rate: ${pass_rate}%"
fi

if [ $total_tests -gt 0 ]; then
  test_pass_rate=$((passed_tests * 100 / total_tests))
  echo "Test pass rate: ${test_pass_rate}%"
fi

echo ""
echo "================================================"

# Exit with appropriate code
if [ $failed_services -gt 0 ]; then
  exit 1
else
  exit 0
fi
