#!/usr/bin/env bash
# Upload all 50 needlework foundations tutorials in order.
# Run from the repo root:
#   bash packages/db/scripts/upload-needlework-foundations.sh
set -e

DIR="packages/db/scripts/needlework-foundations"
UPLOAD="pnpm --filter @homemade/db exec tsx scripts/upload-tutorial.ts"

FILES=(
  "$DIR/threading-a-needle.json"
  "$DIR/parking-the-needle.json"
  "$DIR/using-a-needle-threader.json"
  "$DIR/anchoring-without-a-knot.json"
  "$DIR/doubled-vs-single-thread.json"
  "$DIR/working-with-metallic-thread.json"
  "$DIR/tying-off-cleanly.json"
  "$DIR/slip-knotting-thread.json"
  "$DIR/mounting-fabric-in-a-wooden-hoop.json"
  "$DIR/mounting-fabric-in-a-q-snap.json"
  "$DIR/tensioning-fabric-in-a-frame.json"
  "$DIR/releasing-hoop-tension.json"
  "$DIR/slate-frame-setup.json"
  "$DIR/scroll-frame-setup.json"
  "$DIR/choosing-aida.json"
  "$DIR/choosing-evenweave.json"
  "$DIR/choosing-linen.json"
  "$DIR/fabric-counts-explained.json"
  "$DIR/preparing-fabric-edges.json"
  "$DIR/pre-washing-fabric.json"
  "$DIR/choosing-quilters-cotton.json"
  "$DIR/working-with-weighted-fabric.json"
  "$DIR/running-stitch.json"
  "$DIR/back-stitch-foundations.json"
  "$DIR/straight-stitch.json"
  "$DIR/slip-stitch-needlework.json"
  "$DIR/removing-stitches.json"
  "$DIR/knot-stitch.json"
  "$DIR/padded-straight-stitch.json"
  "$DIR/sealing-stitch.json"
  "$DIR/half-knot-stitch.json"
  "$DIR/anchored-straight-stitch.json"
  "$DIR/water-soluble-pen-transfer.json"
  "$DIR/carbon-paper-transfer.json"
  "$DIR/prick-and-pounce-transfer.json"
  "$DIR/light-box-transfer.json"
  "$DIR/heat-erasable-pen-transfer.json"
  "$DIR/iron-on-transfer.json"
  "$DIR/freezer-paper-template.json"
  "$DIR/working-without-a-transfer.json"
  "$DIR/choosing-scissors.json"
  "$DIR/using-a-thimble.json"
  "$DIR/working-with-magnification.json"
  "$DIR/posture-and-wrist-health.json"
  "$DIR/lighting-for-needlework.json"
  "$DIR/organising-thread-and-tools.json"
  "$DIR/washing-finished-embroidery.json"
  "$DIR/blocking-embroidery.json"
  "$DIR/framing-embroidery.json"
  "$DIR/removing-transfer-marks.json"
)

PASS=0
FAIL=0
FAILS=()

for f in "${FILES[@]}"; do
  echo ">>> Uploading $f"
  if $UPLOAD "$f" --status PUBLISHED; then
    PASS=$((PASS + 1))
    echo "    OK"
  else
    FAIL=$((FAIL + 1))
    FAILS+=("$f")
    echo "    FAIL: $f"
  fi
done

echo ""
echo "============================="
echo "Done: $PASS passed, $FAIL failed"
if [ ${#FAILS[@]} -gt 0 ]; then
  echo "Failed files:"
  for f in "${FAILS[@]}"; do echo "  $f"; done
fi
