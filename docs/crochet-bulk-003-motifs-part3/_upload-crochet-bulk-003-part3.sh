#!/usr/bin/env bash
# Upload motif patterns — sub-session 3 (Geometric + Advanced, 40 patterns)
set -euo pipefail

INPUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATUS="${1:-PUBLISHED}"

FILES=(
  01-mitred-square-basic.json
  02-mitred-square-two-colour.json
  03-mitred-square-striped.json
  04-log-cabin-square-basic.json
  05-log-cabin-square-four-colour.json
  06-log-cabin-square-textured.json
  07-pinwheel-motif-basic.json
  08-pinwheel-motif-lacy.json
  09-pinwheel-motif-dense.json
  10-block-four-round.json
  11-block-six-round.json
  12-block-eight-round.json
  13-block-twelve-round.json
  14-granny-rectangle.json
  15-granny-triangle.json
  16-star-motif-five-point.json
  17-star-motif-eight-point.json
  18-bavarian-crochet-square.json
  19-overlay-stitch-square.json
  20-corner-to-corner-diamond.json
  21-double-granny-square.json
  22-crossed-treble-square.json
  23-pineapple-centre-square.json
  24-vintage-wheel-square.json
  25-join-as-you-go-square.json
  26-five-petal-flower-round.json
  27-compass-rose-round.json
  28-vintage-fan-round.json
  29-kaleidoscope-round.json
  30-bullion-round.json
  31-ripple-round-motif.json
  32-mosaic-crochet-square.json
  33-tapestry-crochet-square.json
  34-filet-crochet-motif.json
  35-bruges-lace-tile.json
  36-tunisian-crochet-square.json
  37-interlocking-crochet-square.json
  38-snowflake-advanced.json
  39-granny-stripe-panel.json
  40-circular-base-motif.json
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
echo "=== Sub-session 3 results: $PASS uploaded, $FAIL failed, $SKIPPED skipped ==="
