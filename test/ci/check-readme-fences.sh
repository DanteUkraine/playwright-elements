#!/bin/bash
# Finding #17: Verify README fences are properly paired
# 
# This script checks that all code fences in the README are properly paired.
# In 1.19.0-rc1, a missing closing fence caused the entire Test IDs section
# to render with inverted formatting (headings as code, examples as prose).

set -e

# Change to project root
cd "$(dirname "$0")/../.."

echo "=========================================="
echo "README Fence Pairing Check - Finding #17"
echo "=========================================="
echo ""

# First, check that the number of opening and closing fences match
# Opening fences have language tags: ```ts, ```tsx, ```javascript, etc.
OPENING_FENCES=$(grep -c '^```ts$\|^```tsx$\|^```javascript$\|^```json$\|^```html$\|^```bash$' README.md || true)
# Closing fences are bare: ```
CLOSING_FENCES=$(grep -c '^```$' README.md || true)

echo "Opening fences (language-tagged): ${OPENING_FENCES}"
echo "Closing fences (bare): ${CLOSING_FENCES}"
echo ""

if [ "$OPENING_FENCES" -ne "$CLOSING_FENCES" ]; then
  echo "❌ FAILED: Fence count mismatch"
  echo "Opening: ${OPENING_FENCES}, Closing: ${CLOSING_FENCES}"
  exit 1
fi

echo "✅ Fence counts match"
echo ""

# Now check for the specific bug: language-tagged fences appearing where closing fences should be
# This uses the awk script from the findings report
echo "Checking fence pairing integrity..."

# Use a simpler approach - create a temporary awk script file
AWK_SCRIPT_FILE=$(mktemp)
cat > "$AWK_SCRIPT_FILE" <<'AWKEOF'
BEGIN {
  inside = 0;
  bad = 0;
}
/^```/ {
  lang = substr($0, 4);
  if (!inside) {
    inside = 1;
    openline = NR;
    current_lang = lang;
  } else {
    if (lang != "") {
      printf "line %d: fence tagged \"%s\" closes the block opened at line %d — that block was never closed\n", NR, lang, openline;
      bad = 1;
    }
    inside = 0;
  }
}
END {
  if (inside) {
    printf "unclosed fence at EOF (opened line %d)\n", openline;
    bad = 1;
  }
  exit bad;
}
AWKEOF

# Run the awk check
AWK_RESULT=$(awk -f "$AWK_SCRIPT_FILE" README.md 2>&1 || true)
rm "$AWK_SCRIPT_FILE"

if [ -n "$AWK_RESULT" ]; then
  echo "❌ FAILED: README fence pairing is incorrect"
  echo ""
  echo "$AWK_RESULT"
  exit 1
fi

echo "✅ All fences are properly paired"
echo ""

# Additional check: verify specific lines mentioned in the findings
# Line 79 should have a closing fence after login.test.ts
# Line 137 should not have an orphaned bare fence

echo "Checking specific lines from the findings..."

# Check line 79 (login.test.ts opening fence)
LINE_79=$(sed -n '79p' README.md)
if [ -z "$LINE_79" ]; then
  echo "⚠️  Line 79 not found (file may have changed)"
else
  echo "  Line 79: $LINE_79"
fi

# Check if there's a closing fence after the login.test.ts example
# The opening fence should be at line 79, closing should be after line 89
LINES_AFTER_79=$(sed -n '80,95p' README.md)
if echo "$LINES_AFTER_79" | grep -q '^\`\`\`$'; then
  echo "✅ Closing fence found after login.test.ts"
else
  echo "⚠️  No closing fence found after login.test.ts"
fi

# Check for orphaned bare fence at line 137
LINE_137=$(sed -n '137p' README.md)
if [ "$LINE_137" = "\`\`\`" ]; then
  echo "❌ FAILED: Orphaned bare fence at line 137"
  exit 1
else
  echo "✅ No orphaned bare fence at line 137"
fi

echo ""
echo "=========================================="
echo "✅ SUCCESS: README fences are correct"
echo "=========================================="
exit 0
