#!/bin/bash
# REGA PDF Compressor - macOS Build Script

echo "============================================================"
echo "REGA PDF Compressor - macOS App Builder"
echo "============================================================"

# Check if Ghostscript is installed
if ! command -v gs &> /dev/null; then
    echo "Ghostscript is not installed. Installing via Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo "Homebrew is required to install Ghostscript. Please install Homebrew (https://brew.sh) and run this script again."
        exit 1
    fi
    brew install ghostscript
fi

echo "Installing Python requirements..."
python3 -m pip install -r requirements.txt
python3 -m pip install pyinstaller dmgbuild

echo "Building macOS .app bundle..."
python3 -m PyInstaller --noconfirm --windowed --name "PDFCompressor" \
    --add-data "static:static" \
    --add-data "templates:templates" \
    launcher.py

echo "Build complete! You can find the PDFCompressor.app in the 'dist' folder."

read -p "Do you want to create a DMG installer? (y/n): " create_dmg
if [ "$create_dmg" = "y" ]; then
    echo "Creating DMG..."
    hdiutil create -volname "PDF Compressor" -srcfolder "dist/PDFCompressor.app" -ov -format UDZO "dist/PDFCompressor.dmg"
    echo "DMG created at dist/PDFCompressor.dmg"
fi

echo "Done!"
