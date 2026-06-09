#!/usr/bin/env bash
# Bulk upload the crochet Foundations batch-002 (files 25-57).
set -euo pipefail

INPUT_DIR="${1:-../../docs/crochet-bulk-001-foundations}"
STATUS="${2:-PUBLISHED}"
START="${3:-25}"
END="${4:-57}"

cd "$(dirname "$0")/.."

FAILED=()
SUCCEEDED=()

for f in "$INPUT_DIR"/*.json; do
  # Only process files in the 25-57 range
  base=$(basename "$f")
  num="${base%%-*}"
  if ! [[ "$num" =~ ^[0-9]+$ ]]; then continue; fi
  if [ "$num" -lt "$START" ] || [ "$num" -gt "$END" ]; then continue; fi

  echo
  echo "=== Uploading: $base ==="
  if pnpm exec tsx scripts/upload-tutorial.ts "$f" --status "$STATUS" --skip-voice-check; then
    SUCCEEDED+=("$base")
  else
    FAILED+=("$base")
  fi
done

echo
echo "==============================================="
echo "Crochet Foundations bulk-002 upload — done."
echo "Succeeded: ${#SUCCEEDED[@]}"
echo "Failed:    ${#FAILED[@]}"
if [ ${#FAILED[@]} -gt 0 ]; then
  printf '   - %s\n' "${FAILED[@]}"
fi
