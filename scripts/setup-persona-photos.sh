#!/usr/bin/env bash
# =============================================================================
# Generic photo setup for real-client persona imports
#
# Copies usable photos from a source directory into the persona image structure.
# Handles real-world filename messiness: normalizes case, strips special chars,
# deduplicates collisions, and filters out rejected variants and screenshots.
#
# Usage:
#   ./scripts/setup-persona-photos.sh <source-dir> <persona-name>
#
# Example:
#   ./scripts/setup-persona-photos.sh ~/Photos/client-export my-client
#   # → copies to test-assets/personas/my-client/images/
#
# This script handles the file-level copying only. After running it, use a
# generate-persona.js script to build persona.json from the copied images.
# See scripts/lib/filename-utils.js for title-cleaning utilities.
# =============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ $# -lt 2 ]; then
  echo "Usage: $0 <source-dir> <persona-name>"
  echo "  source-dir   Directory containing raw photos"
  echo "  persona-name Persona slug (e.g., 'my-client')"
  exit 1
fi

SRC="$1"
PERSONA="$2"
DEST="$PROJECT_DIR/test-assets/personas/$PERSONA/images"
COUNTFILE=$(mktemp)
echo 0 > "$COUNTFILE"

if [ ! -d "$SRC" ]; then
  echo "ERROR: source directory not found at $SRC"
  exit 1
fi

echo "=== Persona Photo Setup: $PERSONA ==="
echo "Source: $SRC"
echo "Destination: $DEST"
echo ""

inc() { echo $(( $(cat "$COUNTFILE") + 1 )) > "$COUNTFILE"; }

# Copy a single file with normalized naming and collision dedup.
# Lowercases, converts spaces/parens/underscores to dashes, collapses
# repeated dashes, and appends -2, -3, etc. on name collisions.
copy_one() {
  local src="$1"
  local dest_dir="$DEST/$2"
  local dest_name="${3:-}"
  mkdir -p "$dest_dir"

  if [ -z "$dest_name" ]; then
    dest_name=$(basename "$src" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[()_]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  fi

  # Handle collisions
  if [ -f "$dest_dir/$dest_name" ]; then
    local base="${dest_name%.*}"
    local ext="${dest_name##*.}"
    local i=2
    while [ -f "$dest_dir/${base}-${i}.${ext}" ]; do i=$((i+1)); done
    dest_name="${base}-${i}.${ext}"
  fi

  cp "$src" "$dest_dir/$dest_name"
  inc
}

# Copy all usable images from a source directory (non-recursive).
# Filters to image file types and skips:
#   - "nf" variants (photography convention for "not for use" / rejected)
#   - Screenshots
copy_dir() {
  local src_dir="$1"
  local dest_rel="$2"

  if [ ! -d "$src_dir" ]; then
    echo "  SKIP (not found): $src_dir"
    return
  fi

  local before=$(cat "$COUNTFILE")
  for file in "$src_dir"/*; do
    [ -f "$file" ] || continue
    local bn=$(basename "$file")
    local ext="${bn##*.}"
    local ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    # Only image files
    case "$ext_lower" in
      jpg|jpeg|png|gif|webp) ;;
      *) continue ;;
    esac

    # Skip "not for use" variants (photography convention)
    [[ "$bn" == *" nf"* ]] && continue
    [[ "$bn" == *"_nf"* ]] && continue
    [[ "$bn" == *"-nf."* ]] && continue

    # Skip screenshots
    [[ "$bn" == Screenshot* ]] && continue

    copy_one "$file" "$dest_rel"
  done
  local after=$(cat "$COUNTFILE")
  local copied=$((after - before))
  [ $copied -gt 0 ] && echo "  $dest_rel: $copied files"
}

# ==============================
# Your mapping goes here.
# Use copy_dir and copy_one to map source directories to persona structure.
# Example:
#   copy_dir "$SRC/Theater/Gatsby"  "categories/theater/gatsby"
#   copy_one "$SRC/headshot.jpg"    "profile" "headshot.jpg"
# ==============================

echo "NOTE: This is a template. Edit the mapping section above for your"
echo "specific source directory structure, then re-run."

# ==============================
TOTAL=$(cat "$COUNTFILE")
rm -f "$COUNTFILE"
echo ""
echo "=== COMPLETE ==="
echo "Total files copied: $TOTAL"