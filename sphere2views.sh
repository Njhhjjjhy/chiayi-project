#!/usr/bin/env bash
# sphere2views.sh
# Convert equirectangular 360° videos into flat rectilinear perspective views
# using ffmpeg's v360 filter. Samples six directions (front/right/back/left/up/down)
# at a fixed interval, so the space can be inspected as ordinary 2D images.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_DIR="$SCRIPT_DIR/public/research-trip-20260418"
OUT_DIR="$INPUT_DIR/frames_views"

SIZE=1024
FOV=110
INTERVAL=10

VIDEOS=(
  "research-trip-3d-videos-1.mp4"
  "research-trip-3d-videos-2.mp4"
  "research-trip-3d-videos-3.mp4"
)

# name  yaw   pitch
VIEWS=(
  "front 0    0"
  "right 90   0"
  "back  180  0"
  "left  -90  0"
  "up    0    90"
  "down  0   -90"
)

mkdir -p "$OUT_DIR"

for video in "${VIDEOS[@]}"; do
  input="$INPUT_DIR/$video"
  if [ ! -f "$input" ]; then
    echo "skip: $input not found"
    continue
  fi

  base="${video%.mp4}"
  duration=$(ffprobe -v error -show_entries format=duration -of default=nokey=1:noprint_wrappers=1 "$input")
  duration_int=${duration%.*}

  t=0
  while [ "$t" -le "$duration_int" ]; do
    for v in "${VIEWS[@]}"; do
      # shellcheck disable=SC2086
      set -- $v
      name=$1; yaw=$2; pitch=$3
      out="$OUT_DIR/${base}_t$(printf '%03d' "$t")s_${name}.jpg"
      echo "-> $(basename "$out")"
      ffmpeg -y -ss "$t" -i "$input" -frames:v 1 \
        -vf "v360=e:rectilinear:h_fov=${FOV}:v_fov=${FOV}:yaw=${yaw}:pitch=${pitch}:w=${SIZE}:h=${SIZE}" \
        -q:v 3 "$out" -hide_banner -loglevel error
    done
    t=$((t + INTERVAL))
  done
done

echo "done. output -> $OUT_DIR"
