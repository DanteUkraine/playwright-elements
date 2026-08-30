#!/bin/bash

# Script to check for vacuous assertions in test files
# Usage: ./scripts/check-vacuous-assertions.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Checking for vacuous assertions in test files..."
echo ""

# Find all test files
TEST_FILES=$(find . -type f \( -name "*.test.ts" -o -name "*.spec.ts" -o -name "*.spec.playwright.ts" \) ! -path "./node_modules/*" ! -path "./lib/*")

ISSUES_FOUND=0

for file in $TEST_FILES; do
    # Check for toBeTruthy
    TBT_COUNT=$(grep -n "\.toBeTruthy()" "$file" | wc -l)
    if [ "$TBT_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ $file${NC}"
        grep -n "\.toBeTruthy()" "$file" | sed "s/^/  /"
        ISSUES_FOUND=$((ISSUES_FOUND + TBT_COUNT))
    fi
    
    # Check for toBeFalsy
    TBF_COUNT=$(grep -n "\.toBeFalsy()" "$file" | wc -l)
    if [ "$TBF_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ $file${NC}"
        grep -n "\.toBeFalsy()" "$file" | sed "s/^/  /"
        ISSUES_FOUND=$((ISSUES_FOUND + TBF_COUNT))
    fi
done

if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo -e "${GREEN}✅ No vacuous assertions found!${NC}"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Found $ISSUES_FOUND vacuous assertion(s)${NC}"
    echo ""
    echo "Fix them by replacing:"
    echo "  - toBeTruthy() → toBe(true) with specific behavior checks"
    echo "  - toBeFalsy() → toBe(false) with specific behavior checks"
    echo ""
    echo "See TEST_GUIDELINES.md for details"
    exit 1
fi
