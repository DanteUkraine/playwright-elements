#!/bin/bash
# Entry Point Stability Check
# 
# This script checks that every published entry point in the package can be loaded
# as the FIRST module in a fresh process, which is how they would be used by consumers.
# Previously, 4 of 9 entry points would crash when loaded first due to circular dependencies.

set -e

# Change to project root
cd "$(dirname "$0")/../.."

echo "=========================================="
echo "Entry Point Stability Check"
echo "=========================================="
echo ""

# List of all published entry points from the package
# These are the same entry points that were crashing in 1.19.0-rc1
ENTRY_POINTS=(
  "index.js"
  "web.element.js"
  "browser.js"
  "test.support.js"
  "testIds/builder.js"
  "testIds/selectors.js"
  "testIds/index.js"
  "page.object.builder.js"
  "playwright.test.fixtures.js"
)

PASSED=0
FAILED=0

for entry in "${ENTRY_POINTS[@]}"; do
  echo "Testing lib/${entry}..."
  
  # Use node -e to load the module in a fresh process
  # This simulates what happens when a consumer loads the module first
  if node -e "require('./lib/${entry}')" > /dev/null 2>&1; then
    echo "  ✅ PASS: lib/${entry}"
    PASSED=$((PASSED + 1))
  else
    echo "  ❌ FAIL: lib/${entry}"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "=========================================="
echo "Results: ${PASSED} passed, ${FAILED} failed"
echo "=========================================="

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "❌ FAILED: Some entry points crashed"
  echo "This indicates a circular dependency issue"
  exit 1
fi

echo ""
echo "✅ SUCCESS: All entry points load without crashes"
exit 0
