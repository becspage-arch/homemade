#!/usr/bin/env bash
# Upload tutorials 31-60 (Batch 2 — linked, specialty, decreases, Tunisian, broomstick, hairpin, Irish, structural)
set -euo pipefail

INPUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATUS="${1:-PUBLISHED}"

FILES=(
  31-linked-dc.json
  32-waistcoat-stitch.json
  33-crocodile-stitch.json
  34-star-stitch.json
  35-spider-stitch.json
  36-dc2tog-decrease.json
  37-invisible-decrease.json
  38-surface-slip-stitch.json
  39-tunisian-simple.json
  40-tunisian-knit.json
  41-tunisian-purl.json
  42-tunisian-full.json
  43-tunisian-extended.json
  44-tunisian-honeycomb.json
  45-broomstick-loop.json
  46-broomstick-cluster.json
  47-hairpin-basic.json
  48-hairpin-braid-join.json
  49-irish-crochet-motif.json
  50-row-end-increase.json
  51-working-into-chain-space.json
  52-magic-ring.json
  53-joining-round.json
  54-turning-chains.json
  55-colour-change.json
  56-foundation-chain.json
  57-reading-stitch-tops.json
  58-dropped-stitch-fix.json
  59-weaving-in-ends.json
  60-tension-swatching.json
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
echo "=== Batch 003 results: $PASS uploaded, $FAIL failed, $SKIPPED skipped ==="
