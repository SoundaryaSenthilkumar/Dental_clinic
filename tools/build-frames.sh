#!/usr/bin/env bash
# Rebuilds the web-optimised hero frame sequence from the original 4K ZIP.
# Originals are never modified. Output names are frame_001.jpg ... frame_218.jpg in source order.
#
# Usage:  ./tools/build-frames.sh /path/to/dental_clinic_frames_4k.zip
# Needs:  unzip, ImageMagick (convert)
set -euo pipefail

ZIP="${1:?Usage: $0 /path/to/dental_clinic_frames_4k.zip}"
EXPECTED="${EXPECTED_FRAMES:-218}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_LG="$ROOT/frontend/public/assets/frames"      # 1920x1080 (desktop)
OUT_SM="$ROOT/frontend/public/assets/frames-sm"   # 1280x720  (mobile / small tablets)
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

command -v convert >/dev/null || { echo "ImageMagick (convert) is required."; exit 1; }
command -v unzip >/dev/null || { echo "unzip is required."; exit 1; }

unzip -q "$ZIP" -d "$TMP/src"
mkdir -p "$OUT_LG" "$OUT_SM"

# Natural sort so ezgif-frame-2 comes before ezgif-frame-10 (names are zero-padded anyway).
mapfile -t FILES < <(find "$TMP/src" -type f -iname '*.jpg' | sort -V)
if [ "${#FILES[@]}" -ne "$EXPECTED" ]; then
  echo "Expected $EXPECTED frames but found ${#FILES[@]}. Aborting."
  exit 1
fi

i=0
for f in "${FILES[@]}"; do
  i=$((i + 1))
  n=$(printf "%03d" "$i")
  convert "$f" -resize 1920x1080! -strip -interlace Plane -quality 78 "$OUT_LG/frame_$n.jpg"
  convert "$f" -resize 1280x720!  -strip -interlace Plane -quality 78 "$OUT_SM/frame_$n.jpg"
  echo "frame_$n <- $(basename "$f")"
done

echo "Done: $i frames written to $OUT_LG and $OUT_SM"
echo "Next: regenerate frontend/src/data/frameManifest.json with tools/generate-manifest.py"
