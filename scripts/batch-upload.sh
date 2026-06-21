#!/bin/bash
set -e
BATCH_DIR="/c/Users/Rebecca/Projects/code/cooking-sprint-3/docs/batch-001"
DB_DIR="/c/Users/Rebecca/Projects/code/cooking-sprint-3/packages/db"
export PATH="$PATH:$HOME/AppData/Roaming/npm"

UPLOADED=0
SKIPPED=0
FAILED=0

for f in "$BATCH_DIR"/*.json; do
  name=$(basename "$f")
  echo "=== Uploading: $name ==="
  result=$(cd "$DB_DIR" && pnpm exec tsx scripts/upload-tutorial.ts "$f" --status PUBLISHED 2>&1 | tail -5)
  echo "$result"
  if echo "$result" | grep -qiE "(success|published|created|already exists|duplicate|skip)"; then
    UPLOADED=$((UPLOADED+1))
  elif echo "$result" | grep -qiE "error|fail|throw"; then
    echo "UPLOAD FAILED: $name"
    FAILED=$((FAILED+1))
  else
    UPLOADED=$((UPLOADED+1))
  fi
  echo ""
done

echo "=== DONE: $UPLOADED uploaded, $SKIPPED skipped, $FAILED failed ==="
