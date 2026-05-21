# Quick Start: Build PDF Compressor Installer

## 🚀 Fast Track (3 Steps)

### Step 1: Create Assets (Already Done! ✓)
```bash
python create_installer_assets.py
```
**Created:**
- ✓ icon.ico
- ✓ logo_installer.bmp
- ✓ logo_small.bmp

### Step 2: Build EXE
```bash
python build_exe.py
```
**Output:** `dist/PDFCompressor/PDFCompressor.exe`

### Step 3: Build Installer
```bash
build_installer.bat
```
**Output:** `installer_output/PDFCompressor_Setup_v1.0.0.exe`

---

## 📋 Prerequisites Checklist

- [x] Python 3.11+ installed
- [x] All dependencies: `pip install -r requirements.txt`
- [x] Ghostscript binaries in `ghostscript/` folder
- [ ] **Inno Setup 6** installed from https://jrsoftware.org/isdl.php

---

## 🎨 What Was Done

### 1. Logo Analysis
**Extracted Colors from Logo.png:**
- Primary: `#02070a` (Deep dark)
- UI updated with sophisticated dark slate theme
- Glassmorphism effect maintained

### 2. Icon Files Created
- **icon.ico**: Multi-size (16x16, 32x32, 48x48, 256x256)
- **logo_installer.bmp**: Wizard sidebar (164x314 px)
- **logo_small.bmp**: Wizard header (55x58 px)

### 3. UI Color Updates
**static/style.css updated:**
- Active cards: Dark gradient (`#0f172a` → `#1e293b` → `#334155`)
- Scrollbar: Dark slate gradient
- Hover states: Subtle dark blue accents
- Maintains WCAG AA contrast ratios

### 4. Build Scripts
- **installer.iss**: Professional Inno Setup configuration
- **build_installer.bat**: One-click installer builder
- **build_exe.py**: Updated to include icon.ico and Logo.png

---

## 🎯 Installer Features

✓ Professional wizard with logo branding
✓ Desktop shortcut (optional, checked by default)
✓ Start Menu entry
✓ Uninstaller registration
✓ Launch option after installation
✓ ~130MB installer size

---

## 📦 Distribution

**For End Users:**
1. Download `PDFCompressor_Setup_v1.0.0.exe`
2. Run installer (may need admin rights)
3. Follow wizard
4. Launch from desktop or Start Menu

**System Requirements:**
- Windows 10/11 (64-bit)
- ~200MB free disk space
- No additional software needed

---

## 🔧 Troubleshooting

**"Inno Setup not found"**
→ Install from https://jrsoftware.org/isdl.php

**"dist\PDFCompressor folder not found"**
→ Run `python build_exe.py` first

**"icon.ico not found"**
→ Run `python create_installer_assets.py`

---

## 📚 Full Documentation

See `INSTALLER_README.md` for complete details.

---

**Made with Bob** 🤖