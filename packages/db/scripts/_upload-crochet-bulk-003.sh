#!/usr/bin/env bash
# Bulk upload the crochet Motifs batch-003 sub-session 1 (40 patterns, files 01-40).
set -euo pipefail

INPUT_DIR="${1:-../../docs/crochet-bulk-003-motifs-part1}"
STATUS="${2:-PUBLISHED}"

cd "$(dirname "$0")/.."

FAILED=()
SUCCEEDED=()

for f in "$INPUT_DIR"/*.json; do
  base=$(basename "$f")
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
echo "Crochet Motifs bulk-003 sub-session 1 upload — done."
echo "Succeeded: ${#SUCCEEDED[@]}"
echo "Failed:    ${#FAILED[@]}"
if [ ${#FAILED[@]} -gt 0 ]; then
  printf '   - %s\n' "${FAILED[@]}"
fi
