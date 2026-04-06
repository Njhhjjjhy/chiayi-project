#!/bin/bash
# Download all PBR texture packs from ambientCG (CC0 public domain)
# Run: chmod +x download-textures.sh && ./download-textures.sh

set -e
TEXDIR="public/textures"
mkdir -p "$TEXDIR"

TEXTURES=(
  "Ground052"
  "Ground037"
  "Ground026"
  "WoodFloor008"
  "Fabric030"
  "Fabric048"
  "Plywood001"
  "Concrete015"
  "Moss002"
  "Bark007"
)

for TEX in "${TEXTURES[@]}"; do
  DIR="$TEXDIR/$TEX"
  if [ -d "$DIR" ] && [ "$(ls -A "$DIR" 2>/dev/null)" ]; then
    echo "✓ $TEX already exists, skipping"
    continue
  fi
  mkdir -p "$DIR"
  URL="https://ambientcg.com/get?file=${TEX}_2K-JPG.zip"
  ZIP="$DIR/${TEX}.zip"
  echo "↓ Downloading $TEX..."
  curl -L -o "$ZIP" "$URL" 2>/dev/null
  echo "  Unzipping..."
  unzip -o -q "$ZIP" -d "$DIR"
  rm "$ZIP"
  echo "✓ $TEX ready"
done

echo ""
echo "All textures downloaded to $TEXDIR/"
