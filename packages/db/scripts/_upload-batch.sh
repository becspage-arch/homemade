#!/bin/bash
# Batch upload all JSON files in a directory with --status PUBLISHED
# Usage: ./_upload-batch.sh <dir>
DIR="$1"
if [ -z "$DIR" ]; then echo "Usage: _upload-batch.sh <dir>"; exit 1; fi
PASS=0; FAIL=0; FAILED_FILES=""
for fp in "$DIR"/*.json; do
  fn=$(basename "$fp")
  result=$(pnpm --filter "@homemade/db" exec tsx scripts/upload-tutorial.ts "$fp" --status PUBLISHED 2>&1 | grep -v "Warning\|SECURITY\|sslmode\|behavior\|want the\|want libpq\|See https\|Use .node\|injected env\|tip:")
  if echo "$result" | grep -qiE "CREATED|UPDATED|already published"; then
    echo "OK   $fn"
    PASS=$((PASS+1))
  else
    echo "FAIL $fn: $(echo "$result" | tail -5)"
    FAIL=$((FAIL+1))
    FAILED_FILES="$FAILED_FILES $fn"
  fi
done
echo ""
echo "Upload results: $PASS passed, $FAIL failed"
if [ -n "$FAILED_FILES" ]; then echo "Failed:$FAILED_FILES"; fi
