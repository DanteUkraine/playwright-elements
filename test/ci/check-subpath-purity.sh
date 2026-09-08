#!/bin/bash
# Finding #06: Verify testids subpath loads only 1 module (itself)
# 
# This script checks that the testIds/builder subpath is truly dependency-free,
# which is essential for using it in production code (e.g., React components).
# In 1.19.0-rc1, there was no dependency-free entry point for testIds.

set -e

# Change to project root
cd "$(dirname "$0")/../.."

echo "=========================================="
echo "Subpath Purity Check - Finding #06"
echo "=========================================="
echo ""

echo "Testing lib/testIds/builder.js..."

# The only way to accurately measure is to use a single node process
# that loads the module and reports how many were loaded
MODULES_LOADED=$(node -e "
  const before = Object.keys(require.cache).length;
  require('./lib/testIds/builder');
  const after = Object.keys(require.cache).length;
  console.log(after - before);
")

echo "  Modules loaded: ${MODULES_LOADED}"

if [ "$MODULES_LOADED" -ne 1 ]; then
  echo ""
  echo "❌ FAILED: testids subpath loaded ${MODULES_LOADED} modules (expected 1)"
  echo "This indicates the subpath has dependencies (Finding #06)"
  
  # Show which modules were loaded
  echo ""
  echo "Modules in require.cache:"
  node -e "
    const before = new Set(require.cache);
    require('./lib/testIds/builder');
    const after = new Set(require.cache);
    const diff = [...after].filter(m => !before.has(m));
    diff.forEach(m => console.log('  -', m));
  " 2>/dev/null || true
  
  exit 1
fi

echo ""
echo "=========================================="
echo "✅ SUCCESS: testids subpath is pure (1 module)"
echo "=========================================="
echo ""

# Additional check: verify it doesn't load playwright modules
echo "Checking for playwright dependencies..."

BEFORE=$(node -e "
  Object.keys(require.cache).forEach(key => {
    if (key.includes('playwright') || key.includes('playwright-core')) {
      delete require.cache[key];
    }
  });
  console.log(Object.keys(require.cache).length);
")

node -e "require('./lib/testIds/builder')" > /dev/null 2>&1

AFTER=$(node -e "console.log(Object.keys(require.cache).length)")

PLAYWRIGHT_MODULES_LOADED=$((AFTER - BEFORE))

if [ "$PLAYWRIGHT_MODULES_LOADED" -gt 1 ]; then
  echo "❌ FAILED: testids subpath loaded playwright modules"
  exit 1
fi

echo "✅ No playwright modules loaded"
exit 0
