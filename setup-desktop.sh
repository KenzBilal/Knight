#!/bin/bash
# Knight Desktop App — Setup Script
# Run this once to install Knight into your system app launcher

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$SCRIPT_DIR/admin-app"
ICON_SRC="$SCRIPT_DIR/admin-app/electron/icon.png"
ICONS_SRC="$SCRIPT_DIR/admin-app/electron/icons"
DESKTOP_FILE="$SCRIPT_DIR/admin-app/assets/knight.desktop"

echo "=== Knight Desktop Setup ==="

# 1. Generate icons if missing
if [ ! -f "$ICON_SRC" ]; then
  echo "[1/4] Generating icons..."
  node "$APP_DIR/scripts/generate-icon.cjs"
else
  echo "[1/4] Icons already exist"
fi

# 2. Generate sounds if missing
if [ ! -f "$APP_DIR/assets/sounds/notification.wav" ]; then
  echo "[2/4] Generating sounds..."
  node "$APP_DIR/scripts/generate-sounds.cjs"
else
  echo "[2/4] Sounds already exist"
fi

# 3. Install icons
echo "[3/4] Installing icons..."
for size in 16 32 48 64 128 256 512; do
  mkdir -p ~/.local/share/icons/hicolor/${size}x${size}/apps
  cp "$ICONS_SRC/icon-${size}x${size}.png" ~/.local/share/icons/hicolor/${size}x${size}/apps/knight.png
done
gtk-update-icon-cache -f -t ~/.local/share/icons/hicolor 2>/dev/null || true
echo "  Installed to ~/.local/share/icons/hicolor/"

# 4. Install .desktop file
echo "[4/4] Installing desktop entry..."
mkdir -p ~/.local/share/applications

# Find the correct electron binary
ELECTRON_BIN=""
if [ -f "$APP_DIR/node_modules/.bin/electron" ]; then
  ELECTRON_BIN="$APP_DIR/node_modules/.bin/electron"
elif command -v electron &>/dev/null; then
  ELECTRON_BIN="electron"
else
  ELECTRON_BIN="$APP_DIR/node_modules/electron/dist/electron"
fi

cat > ~/.local/share/applications/knight.desktop << EOF
[Desktop Entry]
Name=Knight
Comment=AI-Powered B2B Sales Agent Control Center
Exec=$ELECTRON_BIN $APP_DIR --ozone-platform-hint=auto
Icon=knight
Type=Application
Categories=Office;Business;Development;
Keywords=sales;crm;ai;automation;email;leads;b2b;agent;
StartupNotify=true
Terminal=false
StartupWMClass=knight
EOF

chmod +x ~/.local/share/applications/knight.desktop
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true
echo "  Installed to ~/.local/share/applications/knight.desktop"

echo ""
echo "=== Done! ==="
echo "Search for 'Knight' in your app launcher to open it."
echo ""
echo "To run in dev mode: cd admin-app && npm run dev"
echo "To build packages:  cd admin-app && npm run build:linux"
