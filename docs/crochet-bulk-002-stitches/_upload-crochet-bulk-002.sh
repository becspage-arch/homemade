#!/usr/bin/env bash
# Upload tutorials 01-30 (Batch 1 — basics, textured, edge, post, specialty)
set -euo pipefail

INPUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATUS="${1:-PUBLISHED}"

FILES=(
  01-slip-stitch-deep-dive.json
  02-chain-deep-dive.json
  03-double-crochet-deep-dive.json
  04-half-treble-deep-dive.json
  05-treble-deep-dive.json
  06-double-treble-deep-dive.json
  07-triple-treble.json
  08-bobble-stitch.json
  09-popcorn-stitch.json
  10-puff-stitch.json
  11-cluster-stitch.json
  12-shell-stitch.json
  13-v-stitch.json
  14-fan-stitch.json
  15-granny-cluster.json
  16-crossed-treble.json
  17-crossed-double-treble.json
  18-picot.json
  19-picot-chain.json
  20-third-loop-htr.json
  21-flo-dc.json
  22-blo-dc.json
  23-flo-htr.json
  24-blo-htr.json
  25-flo-tr.json
  26-blo-tr.json
  27-post-dc-stitches.json
  28-post-tr-stitches.json
  29-solomons-knot.json
  30-herringbone-htr.json
)

PASS=0
FAIL=0
SKIPPED=0

for filename in "${FILES[@]}"; do
  f="$INPUT_DIR/$filename"
  if [[ ! -f "$f" ]]; then
    echo "SKIP (not found): $filename"
    (( SKIPPED++ )) || true
    continue
  fi
  echo "Uploading: $filename"
  if pnpm exec tsx packages/db/scripts/upload-tutorial.ts "$f" --status "$STATUS" --skip-voice-check; then
    (( PASS++ )) || true
  else
    echo "FAILED: $filename"
    (( FAIL++ )) || true
  fi
done

echo ""
echo "=== Batch 002 results: $PASS uploaded, $FAIL failed, $SKIPPED skipped ==="
