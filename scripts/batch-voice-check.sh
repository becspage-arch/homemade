#!/bin/bash
set -e
BATCH_DIR="/c/Users/Rebecca/Projects/code/cooking-sprint-3/docs/batch-001"
DB_DIR="/c/Users/Rebecca/Projects/code/cooking-sprint-3/packages/db"
export PATH="$PATH:$HOME/AppData/Roaming/npm"

ERRORS=0
for f in "$BATCH_DIR"/*.json; do
  name=$(basename "$f")
  echo "--- $name ---"
  result=$(cd "$DB_DIR" && pnpm exec tsx scripts/voice-check.ts "$f" 2>&1 | tail -3)
  echo "$result"
  if echo "$result" | grep -qE "[1-9][0-9]* error"; then
    echo "FAIL: $name has errors"
    ERRORS=$((ERRORS+1))
  fi
done

echo ""
echo "Total files with errors: $ERRORS"
