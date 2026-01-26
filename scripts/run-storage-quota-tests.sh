#!/bin/bash

###############################################################################
# Automated Storage Quota Testing Script
#
# This script runs comprehensive tests on the storage quota fixes
# Usage: ./scripts/run-storage-quota-tests.sh [test-type]
#
# Test types:
#   unit         - Run unit tests only (mocked, safe)
#   integration  - Run integration tests (requires test database)
#   all          - Run both unit and integration tests
#   watch        - Run tests in watch mode for development
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test type (default: unit)
TEST_TYPE="${1:-unit}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Storage Quota Bug Fixes - Automated Testing         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Function to check if vitest is installed
check_vitest() {
  if ! npm list vitest &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vitest not found. Installing test dependencies...${NC}"
    npm install --save-dev vitest @vitest/ui happy-dom
  fi
}

# Function to run unit tests
run_unit_tests() {
  print_header "Running Unit Tests (Mocked)"
  echo -e "${GREEN}✓${NC} Safe to run - uses mocked data"
  echo -e "${GREEN}✓${NC} Tests all 5 critical bug fixes"
  echo ""

  npx vitest run src/utils/__tests__/audioUploadService.test.ts \
    --reporter=verbose \
    --reporter=html \
    --outputFile=test-results/unit-tests.html

  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Unit tests passed!${NC}"
    echo -e "${BLUE}📊 Test report: test-results/unit-tests.html${NC}"
  else
    echo ""
    echo -e "${RED}❌ Unit tests failed!${NC}"
    exit 1
  fi
}

# Function to run integration tests
run_integration_tests() {
  print_header "Running Integration Tests (Real Database)"

  # Check if test user ID is set
  if [ -z "$SUPABASE_TEST_USER_ID" ]; then
    echo -e "${RED}❌ SUPABASE_TEST_USER_ID environment variable not set${NC}"
    echo ""
    echo "To run integration tests, you need a test user ID:"
    echo ""
    echo -e "${YELLOW}  export SUPABASE_TEST_USER_ID='user_xxx'${NC}"
    echo ""
    echo "Make sure to use a TEST/STAGING environment, NOT production!"
    exit 1
  fi

  echo -e "${YELLOW}⚠️  IMPORTANT: These tests modify real database data${NC}"
  echo -e "${YELLOW}⚠️  Test User ID: $SUPABASE_TEST_USER_ID${NC}"
  echo ""
  echo -e "Press ${GREEN}ENTER${NC} to continue or ${RED}Ctrl+C${NC} to cancel..."
  read

  npx vitest run tests/integration/storage-quota-integration.test.ts \
    --reporter=verbose \
    --reporter=html \
    --outputFile=test-results/integration-tests.html

  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Integration tests passed!${NC}"
    echo -e "${BLUE}📊 Test report: test-results/integration-tests.html${NC}"
  else
    echo ""
    echo -e "${RED}❌ Integration tests failed!${NC}"
    exit 1
  fi
}

# Function to run all tests
run_all_tests() {
  run_unit_tests
  run_integration_tests
}

# Function to run tests in watch mode
run_watch_mode() {
  print_header "Running Tests in Watch Mode"
  echo -e "${GREEN}✓${NC} Tests will re-run on file changes"
  echo ""

  npx vitest watch src/utils/__tests__/audioUploadService.test.ts
}

# Function to generate test coverage report
generate_coverage() {
  print_header "Generating Test Coverage Report"

  npx vitest run src/utils/__tests__/audioUploadService.test.ts \
    --coverage \
    --reporter=html \
    --outputFile=test-results/coverage.html

  echo ""
  echo -e "${GREEN}✅ Coverage report generated!${NC}"
  echo -e "${BLUE}📊 Coverage report: test-results/coverage.html${NC}"
}

# Main script logic
check_vitest

case "$TEST_TYPE" in
  unit)
    run_unit_tests
    ;;
  integration)
    run_integration_tests
    ;;
  all)
    run_all_tests
    ;;
  watch)
    run_watch_mode
    ;;
  coverage)
    generate_coverage
    ;;
  *)
    echo -e "${RED}❌ Invalid test type: $TEST_TYPE${NC}"
    echo ""
    echo "Usage: $0 [test-type]"
    echo ""
    echo "Test types:"
    echo "  unit         - Run unit tests only (mocked, safe)"
    echo "  integration  - Run integration tests (requires test database)"
    echo "  all          - Run both unit and integration tests"
    echo "  watch        - Run tests in watch mode for development"
    echo "  coverage     - Generate test coverage report"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✅ Testing complete!${NC}"
echo ""
