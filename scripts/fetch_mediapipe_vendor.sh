#!/usr/bin/env bash
set -euo pipefail

OUTDIR="$(dirname "$0")/../vendor"
mkdir -p "$OUTDIR"

echo "Attempting to fetch MediaPipe Tasks vendor files into $OUTDIR"

# Candidate URLs for the ESM bundle and wasm. These may need adjusting if upstream layout changes.
declare -a JS_URLS=(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22"
  "https://unpkg.com/@mediapipe/tasks-vision@0.10.22"
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision"
)

for u in "${JS_URLS[@]}"; do
  echo "Trying $u"
  if curl -fsSL "$u" -o "$OUTDIR/tasks-vision.js"; then
    echo "Downloaded tasks-vision.js from $u"
    break
  else
    echo "Failed to download from $u"
    rm -f "$OUTDIR/tasks-vision.js" || true
  fi
done

echo "Attempting to download wasm files (if available) into $OUTDIR/wasm"
mkdir -p "$OUTDIR/wasm"

# Try common wasm directory under jsdelivr for the package name
WASM_BASES=(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm/"
  "https://unpkg.com/@mediapipe/tasks-vision@0.10.22/wasm/"
)

for base in "${WASM_BASES[@]}"; do
  echo "Probing $base"
  # Try to download a small known file name pattern (index.js or .wasm list varies)
  if curl -fsSL "${base}" -o /dev/null; then
    echo "Found wasm directory at $base — attempting to mirror (best-effort)"
    # Try to download common wasm names (this list may need update)
    for name in "mediapipe.tasks_vision.wasm" "tasks_vision.wasm" "mediapipe.tasks-vision.wasm"; do
      if curl -fsSL "${base}${name}" -o "$OUTDIR/wasm/${name}"; then
        echo "Downloaded $name"
      fi
    done
    break
  fi
done

echo "Attempting to download model asset (hand_landmarker.task) from Google Storage"
MODEL_URL="https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
if curl -fsSL "$MODEL_URL" -o "$OUTDIR/hand_landmarker.task"; then
  echo "Downloaded model asset"
else
  echo "Model asset download failed from $MODEL_URL — you may need to fetch it manually and place it at $OUTDIR/hand_landmarker.task"
fi

echo "Done. Inspect $OUTDIR and commit the files if they are correct."
