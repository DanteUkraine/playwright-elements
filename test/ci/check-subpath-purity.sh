#!/bin/bash
# Subpath Purity Check
# 
# This script checks that:
# 1. The standalone @playwright-elements/testids package is truly dependency-free
#    (loads exactly 2 modules — builder + strippable, both zero-dep).
# 2. The framework's testIds/builder subpath (a re-export) loads no Playwright
#    or lodash modules — only the re-export shim and the standalone package.

set -e

# Change to project root
cd "$(dirname "$0")/../.."

echo "=========================================="
echo "Subpath Purity Check"
echo "=========================================="
echo ""

# Build the standalone testids package if not already built
if [ ! -f packages/testids/lib/builder.js ]; then
  echo "Building @playwright-elements/testids..."
  npm run build --workspace @playwright-elements/testids > /dev/null 2>&1
fi

echo "1. Testing packages/testids/lib/builder.js (standalone package)..."

MODULES_LOADED=$(node -e "
  const before = Object.keys(require.cache).length;
  require('./packages/testids/lib/builder');
  const after = Object.keys(require.cache).length;
  console.log(after - before);
")

echo "  Modules loaded: ${MODULES_LOADED}"

if [ "$MODULES_LOADED" -ne 2 ]; then
  echo ""
  echo "FAIL: testids standalone package loaded ${MODULES_LOADED} modules (expected 2)"
  echo "This indicates the package has dependencies"
  
  echo ""
  echo "Modules in require.cache:"
  node -e "
    const before = new Set(require.cache);
    require('./packages/testids/lib/builder');
    const after = new Set(require.cache);
    const diff = [...after].filter(m => !before.has(m));
    diff.forEach(m => console.log('  -', m));
  " 2>/dev/null || true
  
  exit 1
fi

echo ""
echo "  PASS: standalone package is pure (2 modules: builder + strippable)"
echo ""

# Verify the standalone package doesn't load playwright or lodash
echo "2. Checking standalone package for playwright/lodash dependencies..."

node -e "
  const before = new Set(Object.keys(require.cache));
  require('./packages/testids/lib/builder');
  const after = new Set(Object.keys(require.cache));
  const loaded = [...after].filter(m => !before.has(m));
  const bad = loaded.filter(m => {
    const n = m.replace(/\\\\/g, '/');
    return n.includes('node_modules/playwright-core') || 
           n.includes('node_modules/@playwright/test') ||
           n.includes('node_modules/lodash');
  });
  if (bad.length > 0) {
    console.error('FAIL: standalone package loaded playwright/lodash:');
    bad.forEach(m => console.error('  -', m));
    process.exit(1);
  }
  console.log('  PASS: no playwright or lodash modules loaded');
" > /dev/null 2>&1 || {
  echo "  FAIL: standalone package loaded playwright or lodash"
  exit 1
}

echo ""
echo "3. Testing lib/testIds/builder.js (framework re-export subpath)..."

# The re-export loads: itself + the standalone package = 2 modules
# None of them should be Playwright or lodash
node -e "
  const before = new Set(Object.keys(require.cache));
  require('./lib/testIds/builder');
  const after = new Set(Object.keys(require.cache));
  const loaded = [...after].filter(m => !before.has(m));
  
  const bad = loaded.filter(m => {
    const n = m.replace(/\\\\/g, '/');
    return n.includes('node_modules/playwright-core') || 
           n.includes('node_modules/@playwright/test') ||
           n.includes('node_modules/lodash');
  });
  
  if (bad.length > 0) {
    console.error('FAIL: framework re-export loaded playwright/lodash:');
    bad.forEach(m => console.error('  -', m));
    process.exit(1);
  }
  
  console.log('  Modules loaded: ' + loaded.length);
  console.log('  PASS: no playwright or lodash modules loaded via re-export');
"

echo ""
echo "=========================================="
echo "SUCCESS: all purity checks passed"
echo "=========================================="
exit 0
