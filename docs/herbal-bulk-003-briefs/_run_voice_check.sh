#!/usr/bin/env bash
# Run voice-check on all herbal-bulk-003 briefs
BRIEFS_DIR="C:/Users/Rebecca/Projects/code/homemade/docs/herbal-bulk-003-briefs"
PASS=()
FAIL=()

for f in "$BRIEFS_DIR"/*.json; do
  [[ "$f" == *"_run_voice_check"* ]] && continue
  slug=$(basename "$f" .json)
  result=$(cd "C:/Users/Rebecca/Projects/code/homemade" && PATH="$PATH:$HOME/AppData/Roaming/npm" pnpm --filter @homemade/db exec tsx scripts/voice-check.ts "$f" 2>&1 | grep -v "Warning:\|SSL\|sslmode\|libpq\|See https\|If you want\|injected env\|node_modules\|pnpm_RECURSIVE")
  exitcode=$?
  if echo "$result" | grep -q "^PASS\|^voice-check: 0 error"; then
    PASS+=("$slug")
    echo "PASS: $slug"
  elif [ $exitcode -eq 0 ] && ! echo "$result" | grep -qi "error"; then
    PASS+=("$slug")
    echo "PASS: $slug"
  else
    FAIL+=("$slug")
    echo "FAIL: $slug"
    echo "$result" | grep -v "^$"
    echo "---"
  fi
done

echo ""
echo "TOTAL: PASS=${#PASS[@]} FAIL=${#FAIL[@]}"
