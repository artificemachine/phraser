#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v bun >/dev/null 2>&1; then
  echo "Error: bun is not installed. Install it from https://bun.sh" >&2
  exit 1
fi

echo "Building desktop app bundle..."

# Remove macOS extended attributes from bundled assets to avoid
# codesign failures like "resource fork, Finder information, or similar detritus not allowed".
if [ "$(uname -s)" = "Darwin" ] && command -v xattr >/dev/null 2>&1; then
  xattr -cr "$ROOT_DIR/src-tauri/icons" 2>/dev/null || true
  xattr -cr "$ROOT_DIR/src-tauri/resources" 2>/dev/null || true
fi

TAURI_CONFIG="src-tauri/tauri.local.unsigned.conf.json"
bun run tauri build --config "$TAURI_CONFIG" "$@"

APP_PATH="src-tauri/target/release/bundle/macos/phraser.app"
if [ -d "$APP_PATH" ]; then
  echo ""
  echo "App bundle created:"
  echo "$ROOT_DIR/$APP_PATH"
else
  echo ""
  echo "Build finished. Bundle path may vary by platform."
  echo "Check: $ROOT_DIR/src-tauri/target/release/bundle/"
fi
