# PDF Compressor - Installer Build Guide

## Overview

This guide explains how to build a professional Windows installer for the PDF Compressor application with logo branding, desktop shortcuts, and Start Menu integration.

---

## Prerequisites

### 1. Inno Setup 6
Download and install from: https://jrsoftware.org/isdl.php

**Installation Path (default):**
```
C:\Program Files (x86)\Inno Setup 6\
```

### 2. Python Dependencies
```bash
pip install -r requirements.txt
pip install Pillow  # For icon creation
```

### 3. Ghostscript Binaries
Ensure Ghostscript is in the `ghostscript/` folder (already done if you followed main setup).

---

## Build Process

### Step 1: Create Installer Assets

Run the asset creation script to generate icons and branding images:

```bash
python create_installer_assets.py
```

**This creates:**
- `icon.ico` - Application icon (16x16, 32x32, 48x48, 256x256)
- `logo_installer.bmp` - Installer wizard sidebar (164x314 px)
- `logo_small.bmp` - Installer wizard header (55x58 px)

**Color Palette Extracted:**
- Primary: `#02070a` (Deep dark from logo)
- Accent: Dark slate gradient for UI elements
- Maintains glassmorphism effect with good contrast

### Step 2: Build the Executable

Build the portable EXE with the new icon:

```bash
python build_exe.py
```

**Output:** `dist/PDFCompressor/PDFCompressor.exe` (~130MB)

**What's included:**
- Python 3.11 runtime
- Ghostscript binaries
- All dependencies
- Web interface (HTML/CSS/JS)
- Logo.png and icon.ico

### Step 3: Build the Installer

Run the installer build script:

```bash
build_installer.bat
```

**Output:** `installer_output/PDFCompressor_Setup_v1.0.0.exe`

**Installer Features:**
- Professional wizard interface with logo branding
- Desktop shortcut creation (optional, checked by default)
- Start Menu entry
- Uninstaller registration
- Launch option after installation
- ~130MB installer size

---

## File Structure

```
pdf-compressor/
├── Logo.png                    # Original logo
├── icon.ico                    # App icon (created)
├── logo_installer.bmp          # Installer sidebar (created)
├── logo_small.bmp              # Installer header (created)
├── installer.iss               # Inno Setup script
├── build_installer.bat         # Installer build script
├── create_installer_assets.py  # Asset creation script
├── build_exe.py                # EXE build script (updated)
├── dist/
│   └── PDFCompressor/
│       └── PDFCompressor.exe   # Built executable
└── installer_output/
    └── PDFCompressor_Setup_v1.0.0.exe  # Final installer
```

---

## Installer Configuration

### Key Settings (installer.iss)

```ini
[Setup]
AppName=PDF Compressor
AppVersion=1.0.0
DefaultDirName={autopf}\PDF Compressor
SetupIconFile=icon.ico
WizardImageFile=logo_installer.bmp
WizardSmallImageFile=logo_small.bmp
```

### Installation Locations

**Default Install Path:**
```
C:\Program Files\PDF Compressor\
```

**Desktop Shortcut:**
```
%USERPROFILE%\Desktop\PDF Compressor.lnk
```

**Start Menu:**
```
%APPDATA%\Microsoft\Windows\Start Menu\Programs\PDF Compressor\
```

---

## UI Color Updates

The CSS has been updated to match the logo's dark color palette:

**Color Scheme:**
- Primary Dark: `#0f172a` (slate-900)
- Secondary Dark: `#1e293b` (slate-800)
- Accent: `#334155` (slate-700)
- Maintains glassmorphism with `backdrop-filter: blur()`

**Updated Elements:**
- Active quality cards: Dark gradient background
- Scrollbar: Dark slate gradient
- Hover states: Subtle dark blue accents
- All changes maintain WCAG AA contrast ratios

---

## Testing the Installer

### 1. Test Installation
```bash
# Run the installer
installer_output\PDFCompressor_Setup_v1.0.0.exe
```

### 2. Verify Installation
- [ ] Desktop shortcut created with correct icon
- [ ] Start Menu entry exists
- [ ] Application launches successfully
- [ ] Browser opens automatically
- [ ] PDF compression works
- [ ] Uninstaller appears in Windows Settings

### 3. Test Uninstallation
- [ ] Uninstall from Start Menu or Windows Settings
- [ ] All files removed
- [ ] Desktop shortcut removed
- [ ] Start Menu entry removed

---

## Distribution

### For End Users

**System Requirements:**
- Windows 10/11 (64-bit)
- ~200MB free disk space
- No additional software needed

**Installation Steps:**
1. Download `PDFCompressor_Setup_v1.0.0.exe`
2. Run the installer (may require admin rights)
3. Follow the wizard
4. Launch from desktop or Start Menu

### For Developers

**To modify the installer:**
1. Edit `installer.iss` for configuration changes
2. Update `logo_installer.bmp` or `logo_small.bmp` for branding
3. Rebuild with `build_installer.bat`

**To update the application:**
1. Make code changes
2. Rebuild EXE: `python build_exe.py`
3. Rebuild installer: `build_installer.bat`
4. Increment version in `installer.iss`

---

## Troubleshooting

### Inno Setup Not Found
**Error:** `Inno Setup not found at: C:\Program Files (x86)\Inno Setup 6\ISCC.exe`

**Solution:**
1. Install Inno Setup 6 from https://jrsoftware.org/isdl.php
2. Or update `INNO_PATH` in `build_installer.bat` to match your installation

### Missing Assets
**Error:** `icon.ico not found!`

**Solution:**
```bash
python create_installer_assets.py
```

### EXE Not Built
**Error:** `dist\PDFCompressor folder not found!`

**Solution:**
```bash
python build_exe.py
```

### Installer Build Fails
**Check:**
1. All asset files exist (icon.ico, logo_installer.bmp, logo_small.bmp)
2. dist/PDFCompressor/ folder exists with EXE
3. Inno Setup is properly installed
4. No syntax errors in installer.iss

---

## Advanced Customization

### Change App Version
Edit `installer.iss`:
```ini
#define MyAppVersion "1.0.0"  ; Change this
```

### Add License Agreement
1. Create `LICENSE.txt`
2. Add to `installer.iss`:
```ini
[Setup]
LicenseFile=LICENSE.txt
```

### Custom Installation Directory
Edit `installer.iss`:
```ini
[Setup]
DefaultDirName={autopf}\YourAppName
```

### Additional Shortcuts
Add to `[Icons]` section in `installer.iss`:
```ini
Name: "{group}\Documentation"; Filename: "{app}\README.md"
```

---

## Build Checklist

- [x] Logo.png analyzed for colors
- [x] icon.ico created (multi-size)
- [x] logo_installer.bmp created (164x314)
- [x] logo_small.bmp created (55x58)
- [x] CSS updated with logo colors
- [x] build_exe.py updated to use icon.ico
- [x] installer.iss created
- [x] build_installer.bat created
- [ ] EXE built successfully
- [ ] Installer built successfully
- [ ] Installation tested
- [ ] Uninstallation tested

---

## Support

For issues or questions:
1. Check this README
2. Review `installer_plan.md` for design decisions
3. Check Inno Setup documentation: https://jrsoftware.org/ishelp/

---

**Made with Bob** 🤖