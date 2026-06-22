#!/bin/bash
# Upload all 40 batch-1 recipes
set -e

DB_URL=$(grep '^DATABASE_URL=' /c/Users/Rebecca/Projects/code/homemade/.env.credentials | cut -d= -f2-)
export DATABASE_URL="$DB_URL"
export PATH="$PATH:$HOME/AppData/Roaming/npm"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$SCRIPT_DIR/packages/db"
DOCS_DIR="$SCRIPT_DIR/docs/cooking-sprint-worker-0"

cd "$DB_DIR"

PASS=0
FAIL=0

for f in "$DOCS_DIR"/*.json; do
  slug=$(basename "$f" .json)
  echo "--- $slug ---"
  if pnpm exec tsx scripts/upload-tutorial.ts "$f" --status PUBLISHED 2>&1 | tee /tmp/upload_out.txt | grep -E "PUBLISHED|UPDATED|CREATED"; then
    PASS=$((PASS+1))
  else
    if grep -q "already exists\|duplicate" /tmp/upload_out.txt 2>/dev/null; then
      echo "  (already published, skipping)"
      PASS=$((PASS+1))
    else
      echo "  FAILED"
      cat /tmp/upload_out.txt | tail -5
      FAIL=$((FAIL+1))
    fi
  fi
done

echo ""
echo "Done. PASS=$PASS FAIL=$FAIL"
