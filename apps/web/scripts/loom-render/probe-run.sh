#!/usr/bin/env bash
# Probe runner — proves a CANDIDATE render-script change on real Fargate BEFORE
# it is merged. The production entrypoint only ever runs the scripts baked into
# the image, and the image is only rebuilt on a push to main, so a Blender-side
# change is otherwise unprovable until after the merge. (That gap is exactly how
# a white-ground fix shipped, rebuilt and re-rendered while doing nothing —
# STITCH_ENGINE §8e-2 Part C.)
#
# This script is NOT part of the image. It is uploaded to the scratch bucket and
# run by a throwaway task definition (`homemade-loom-render-probe`) whose only
# difference from the production one is entryPoint ["/bin/bash","-c"] — same
# image, same roles, same log group, production task def untouched. It pulls the
# candidate script + a scene from S3, renders a RAMP of one `view` value, and
# uploads a PNG per step to measure locally.
#
# Env (all via `ecs run-task --overrides`):
#   LOOM_S3_BUCKET  scratch bucket
#   PROBE_PREFIX    key prefix holding render.py, <scene>.json and this script
#   PROBE_SCENE     scene basename under that prefix
#   PROBE_RES       view.resY override (small = fast ramp; production value for the proof)
#   PROBE_SAMPLES   Cycles samples
#   PROBE_KS        space-separated values swept through view.groundWhite
#
# See loom-render/README.md, "Proving a render-script change before the merge".
set -uo pipefail
B="$LOOM_S3_BUCKET"; P="$PROBE_PREFIX"; SCENE="$PROBE_SCENE"
RES="${PROBE_RES:-420}"; SAMP="${PROBE_SAMPLES:-24}"; KS="${PROBE_KS:-1 4 8 12 16}"
cd /tmp
aws s3 cp "s3://$B/$P/render.py" render.py --quiet
aws s3 cp "s3://$B/$P/$SCENE.json" scene.json --quiet
echo "[probe] scene=$SCENE res=$RES samples=$SAMP ks=$KS"
for k in $KS; do
  python3 - "$k" "$RES" <<'PY'
import json, sys
k = float(sys.argv[1]); res = int(sys.argv[2])
d = json.load(open('scene.json'))
d['view']['groundWhite'] = k
d['view']['resY'] = res
json.dump(d, open('v.json', 'w'))
PY
  echo "[probe] === k=$k ==="
  if ! blender --background --factory-startup --python render.py -- v.json "out_$k.png" "$SAMP" > "log_$k.txt" 2>&1; then
    echo "[probe] BLENDER FAILED k=$k"; tail -40 "log_$k.txt"; continue
  fi
  grep -v "^Fra:" "log_$k.txt" | tail -8
  aws s3 cp "out_$k.png" "s3://$B/$P/$SCENE.k$k.png" --quiet
  echo "[probe] uploaded $SCENE.k$k.png"
done
echo "[probe] all done"
