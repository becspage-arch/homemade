#!/usr/bin/env bash
# Bulk upload the crochet Foundations batch authored in this worker session.
# Run from packages/db. Set status=PUBLISHED to land each row live.
set -euo pipefail

INPUT_DIR="${1:-../../docs/crochet-bulk-001-foundations}"
STATUS="${2:-PUBLISHED}"

cd "$(dirname "$0")/.."

FAILED=()
SUCCEEDED=()

for f in "$INPUT_DIR"/*.json; do
  echo
  echo "=== Uploading: $(basename "$f") ==="
  if pnpm exec tsx scripts/upload-tutorial.ts "$f" --status "$STATUS" --skip-voice-check; then
    SUCCEEDED+=("$(basename "$f")")
  else
    FAILED+=("$(basename "$f")")
  fi
done

echo
echo "==============================================="
echo "Crochet Foundations bulk-001 upload — done."
echo "Succeeded: ${#SUCCEEDED[@]}"
echo "Failed:    ${#FAILED[@]}"
if [ ${#FAILED[@]} -gt 0 ]; then
  printf '   - %s\n' "${FAILED[@]}"
fi
