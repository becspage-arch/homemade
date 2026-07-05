#!/usr/bin/env bash
# Loom render container entrypoint.
#
# Contract (all via env, set by `ecs run-task` overrides — see
# scripts/loom-fargate-render.ts):
#   LOOM_S3_BUCKET   scratch bucket for the scene-in / png-out transfer
#   LOOM_SCENE_KEY   S3 key of the scene.json to render
#   LOOM_OUT_KEY     S3 key to write the rendered PNG to
#   LOOM_SAMPLES     Cycles samples (default 200 — matches renderHero's default)
#
# Optional grade env forwarded from the caller for parity with the local run
# (loom_render.py reads them itself; defaults are the production look):
#   LOOM_VIEW LOOM_SAT LOOM_EXP LOOM_AMBIENT
#
# It fetches the scene, runs the IDENTICAL Blender pipeline headless on CPU,
# and uploads the PNG. Nothing here changes the render — it only moves bytes.
set -euo pipefail

: "${LOOM_S3_BUCKET:?LOOM_S3_BUCKET is required}"
: "${LOOM_SCENE_KEY:?LOOM_SCENE_KEY is required}"
: "${LOOM_OUT_KEY:?LOOM_OUT_KEY is required}"
SAMPLES="${LOOM_SAMPLES:-200}"

WORK="$(mktemp -d)"
SCENE="$WORK/scene.json"
OUT="$WORK/out.png"

echo "[loom-render] fetch s3://$LOOM_S3_BUCKET/$LOOM_SCENE_KEY"
aws s3 cp "s3://$LOOM_S3_BUCKET/$LOOM_SCENE_KEY" "$SCENE"

echo "[loom-render] blender base render ($SAMPLES samples, headless CPU Cycles)"
blender --background --factory-startup --python /opt/loom/loom_render.py -- \
  "$SCENE" "$OUT" "$SAMPLES"

if [ ! -f "$OUT" ]; then
  echo "[loom-render] ERROR: Blender produced no output PNG" >&2
  exit 1
fi

echo "[loom-render] upload s3://$LOOM_S3_BUCKET/$LOOM_OUT_KEY"
aws s3 cp "$OUT" "s3://$LOOM_S3_BUCKET/$LOOM_OUT_KEY" --content-type image/png

echo "[loom-render] done"
