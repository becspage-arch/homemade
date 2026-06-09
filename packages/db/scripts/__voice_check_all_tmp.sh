#!/usr/bin/env bash
BRIEFS_DIR="$(dirname "$0")/../../../docs/herbal-bulk-003-briefs"
PASS=0
FAIL=0
ERRORS=()

for f in "$BRIEFS_DIR"/*.json; do
  slug=$(basename "$f" .json)
  result=$(PATH="$PATH:$HOME/AppData/Roaming/npm" pnpm --filter @homemade/db exec tsx scripts/voice-check.ts "$f" --json 2>&1)
  exitcode=$?
  if [ $exitcode -eq 0 ]; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    ERRORS+=("$slug")
    echo "FAIL: $slug"
    echo "$result" | tail -20
    echo "---"
  fi
done

echo ""
echo "SUMMARY: PASS=$PASS FAIL=$FAIL"
if [ ${#ERRORS[@]} -gt 0 ]; then
  echo "FAILED:"
  printf '  %s\n' "${ERRORS[@]}"
fi
