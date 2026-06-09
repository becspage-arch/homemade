#!/usr/bin/env bash
set -u
export PATH="$PATH:$HOME/AppData/Roaming/npm"
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT"

BRIEF_DIR="$REPO_ROOT/docs/fibre-arts-bulk-005-briefs"
RESULTS_FILE="$REPO_ROOT/docs/fibre-arts-bulk-005-upload-log.txt"
: > "$RESULTS_FILE"

SUCCESS=()
FAILED=()

for f in "$BRIEF_DIR"/*.json; do
  slug="$(basename "$f" .json)"
  echo "=== uploading $slug ==="
  echo "=== $slug ===" >> "$RESULTS_FILE"
  if pnpm --filter @homemade/db exec tsx scripts/upload-tutorial.ts "$f" --status PUBLISHED >> "$RESULTS_FILE" 2>&1; then
    SUCCESS+=("$slug")
    echo "  OK"
  else
    FAILED+=("$slug")
    echo "  FAILED"
  fi
done

echo ""
echo "=== summary ==="
echo "SUCCESS (${#SUCCESS[@]}):"
for s in "${SUCCESS[@]}"; do echo "  $s"; done
echo ""
echo "FAILED (${#FAILED[@]}):"
for f in "${FAILED[@]}"; do echo "  $f"; done
