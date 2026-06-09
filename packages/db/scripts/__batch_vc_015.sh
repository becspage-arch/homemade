#!/usr/bin/env bash
# Voice-check all fibre-arts-bulk-015 briefs and report results
set -euo pipefail
BRIEFS_DIR="$(dirname "$0")/../../../docs/fibre-arts-bulk-015-briefs"
PASS=()
FAIL=()
WARN=()

for f in "$BRIEFS_DIR"/*.json; do
  slug=$(basename "$f" .json)
  # Skip already-published
  if [ "$slug" = "needle-felted-weasel" ]; then
    echo "SKIP:$slug (already published)"
    continue
  fi
  result=$(pnpm --filter @homemade/db exec tsx scripts/voice-check.ts "$f" 2>&1)
  code=$?
  if [ $code -eq 0 ]; then
    PASS+=("$slug")
    echo "PASS:$slug"
  elif [ $code -eq 1 ]; then
    WARN+=("$slug")
    echo "WARN:$slug"
    echo "$result" | grep -E "^\s*(warn|error|[0-9])" | head -5
  else
    FAIL+=("$slug")
    echo "FAIL:$slug"
    echo "$result" | grep -E "^\s*(warn|error|[0-9])" | head -10
  fi
done

echo ""
echo "=== SUMMARY ==="
echo "PASS: ${#PASS[@]}"
echo "WARN: ${#WARN[@]}"
echo "FAIL: ${#FAIL[@]}"
