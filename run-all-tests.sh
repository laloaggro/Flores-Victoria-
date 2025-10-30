#!/bin/bash

# Script para ejecutar tests en todos los microservicios
# Uso: ./run-all-tests.sh [--verbose]

set -e

VERBOSE=false
if [[ "$1" == "--verbose" ]]; then
  VERBOSE=true
fi

SERVICES=("user-service" "auth-service" "product-service" "cart-service" "order-service")
TOTAL_TESTS=0
TOTAL_PASSING=0
FAILED_SERVICES=()

echo "╔════════════════════════════════════════════════════════╗"
echo "║     FLORES VICTORIA - TEST SUITE EXECUTION            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

for service in "${SERVICES[@]}"; do
  echo "┌──────────────────────────────────────────────────────┐"
  echo "│  Testing: $service"
  echo "└──────────────────────────────────────────────────────┘"
  
  cd "microservices/$service" || exit 1
  
  if [ "$VERBOSE" = true ]; then
    npm test
    TEST_EXIT_CODE=$?
  else
    OUTPUT=$(npm test 2>&1)
    TEST_EXIT_CODE=$?
    
    # Extraer estadísticas
    TESTS=$(echo "$OUTPUT" | grep -oP "Tests:.*" | head -1)
    SUITES=$(echo "$OUTPUT" | grep -oP "Test Suites:.*" | head -1)
    COVERAGE=$(echo "$OUTPUT" | grep -oP "All files\s+\|\s+[\d.]+" | awk '{print $4}')
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
      echo "✅ $TESTS"
      echo "✅ $SUITES"
      [ -n "$COVERAGE" ] && echo "📊 Coverage: ${COVERAGE}%"
    else
      echo "❌ Tests failed for $service"
      FAILED_SERVICES+=("$service")
    fi
  fi
  
  cd ../..
  echo ""
done

echo "╔════════════════════════════════════════════════════════╗"
echo "║                    FINAL SUMMARY                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
  echo "✅ All tests passed successfully!"
  echo "📊 Total services tested: ${#SERVICES[@]}"
  echo "🎉 SUCCESS: All microservices are working correctly"
  exit 0
else
  echo "❌ Some tests failed:"
  for failed in "${FAILED_SERVICES[@]}"; do
    echo "   - $failed"
  done
  echo ""
  echo "💡 Run with --verbose flag for detailed output"
  exit 1
fi
