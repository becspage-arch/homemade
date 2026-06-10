#!/usr/bin/env bash
# K-6 batch upload — voice-check then upload every file in the three k6 dirs.
# Idempotent: upload script updates on slug collision, so safe to re-run.
# Run from the worktree root:
#   bash packages/db/scripts/k6-batch-upload.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$PATH:$HOME/AppData/Roaming/npm"

DIRS=(
  "$SCRIPT_DIR/k6-techniques"
  "$SCRIPT_DIR/k6-scarf-cowl"
  "$SCRIPT_DIR/k6-hat"
)

PASS=0
FAIL=0

for DIR in "${DIRS[@]}"; do
  if [ ! -d "$DIR" ]; then
    echo "SKIP (dir missing): $DIR"
    continue
  fi

  for FILE in "$DIR"/*.json; do
    [ -f "$FILE" ] || continue
    SLUG=$(basename "$FILE" .json)
    echo ""
    echo "=== $SLUG ==="

    # Voice-check — capture output; only skip on actual errors (non-zero exit AND contains error text)
    VC_OUT=$(pnpm --filter "@homemade/db" exec tsx scripts/voice-check.ts "$FILE" 2>&1)
    VC_EXIT=$?
    echo "$VC_OUT"

    # Allow warnings (exit 1 with "0 errors") but block real errors
    if [ $VC_EXIT -ne 0 ] && ! echo "$VC_OUT" | grep -q "0 errors"; then
      echo "VOICE-CHECK FAILED (errors): $SLUG — skipping upload"
      FAIL=$((FAIL+1))
      continue
    fi

    # Upload
    UPLOAD_OUT=$(pnpm --filter "@homemade/db" exec tsx scripts/upload-tutorial.ts "$FILE" --status PUBLISHED 2>&1)
    UPLOAD_EXIT=$?
    echo "$UPLOAD_OUT"

    if [ $UPLOAD_EXIT -eq 0 ]; then
      echo "UPLOADED: $SLUG"
      PASS=$((PASS+1))
    else
      echo "UPLOAD FAILED: $SLUG"
      FAIL=$((FAIL+1))
    fi
  done
done

echo ""
echo "=== DONE: $PASS uploaded, $FAIL failed ==="
