#!/bin/bash
# Bootstrap script for downloading and configuring CIRE
# Downloads the latest CIRE_LLVM binary from GitHub releases and configures c.local.properties

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TOOLS_DIR="$REPO_ROOT/tools/cire"
CONFIG_FILE="$REPO_ROOT/etc/config/c.local.properties"
BINARY_NAME="CIRE_LLVM"

echo "CIRE Bootstrap Script"
echo "====================="
echo ""

# Check for required commands
if ! command -v curl &> /dev/null; then
    echo "Error: curl is required but not installed."
    echo "Please install curl and try again."
    exit 1
fi

# Create tools directory
echo "Creating tools directory at $TOOLS_DIR..."
mkdir -p "$TOOLS_DIR"

# Fetch latest release info from GitHub
echo "Fetching latest CIRE release information..."
RELEASE_JSON=$(curl -sS https://api.github.com/repos/caydenlund/CIRE/releases/latest)

# Extract version tag
VERSION=$(echo "$RELEASE_JSON" | grep -o '"tag_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Extract download URL for CIRE_LLVM
# We need to find the asset block for CIRE_LLVM and extract its browser_download_url
# The JSON structure has assets as an array, each with "name" and "browser_download_url"
DOWNLOAD_URL=$(echo "$RELEASE_JSON" | grep -A 3 "\"name\"[[:space:]]*:[[:space:]]*\"$BINARY_NAME\"" | grep "browser_download_url" | head -1 | sed 's/.*"browser_download_url"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

if [ -z "$DOWNLOAD_URL" ]; then
    echo "Error: Could not find $BINARY_NAME in latest release."
    echo "Please check https://github.com/caydenlund/CIRE/releases for available binaries."
    exit 1
fi

echo "Found CIRE $VERSION"
echo "Download URL: $DOWNLOAD_URL"
echo ""

# Download the binary
BINARY_PATH="$TOOLS_DIR/$BINARY_NAME"
echo "Downloading $BINARY_NAME to $BINARY_PATH..."
curl -L -o "$BINARY_PATH" "$DOWNLOAD_URL"

# Make it executable
echo "Making binary executable..."
chmod +x "$BINARY_PATH"

# Verify the binary
if [ ! -x "$BINARY_PATH" ]; then
    echo "Error: Failed to download or make binary executable."
    exit 1
fi

echo "Binary downloaded successfully!"
echo ""

# Update or create c.local.properties
echo "Configuring $CONFIG_FILE..."

# Create config file if it doesn't exist
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating new configuration file..."
    cat > "$CONFIG_FILE" << EOF
# Local configuration for CIRE Explorer
# This file is not committed to the repository

EOF
fi

# Check if tools.cire.exe already exists
if grep -q "^tools.cire.exe=" "$CONFIG_FILE"; then
    echo "Updating existing tools.cire.exe setting..."
    sed "s|^tools.cire.exe=.*|tools.cire.exe=$BINARY_PATH|" "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
    mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
else
    echo "Adding tools.cire.exe setting..."
    echo "tools.cire.exe=$BINARY_PATH" >> "$CONFIG_FILE"
fi

echo ""
echo "Bootstrap complete!"
echo "===================="
echo ""
echo "CIRE has been downloaded to: $BINARY_PATH"
echo "Configuration updated in: $CONFIG_FILE"
echo ""
echo "You can now run 'npm start' to start CIRE Explorer."
