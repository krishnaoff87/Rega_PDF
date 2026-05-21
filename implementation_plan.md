# PDF Compressor Implementation Plan

## Project Overview
Build **fully portable** Windows PDF compressor - single EXE with zero setup required for end users.

## Architecture Summary

**Tech Stack:**
- Backend: Python 3.11+ (embedded), Flask, Ghostscript (bundled), PikePDF, PyMuPDF
- Frontend: HTML5, TailwindCSS, Vanilla JS
- Packaging: PyInstaller → Single portable EXE (~130MB)

**Portable Requirements:**
- Bundle Python runtime in EXE
- Bundle Ghostscript binaries
- Bundle all Python dependencies
- No installation needed
- No admin rights required
- Run from any location (USB, Desktop, etc.)

**Key Features:**
- Batch PDF compression (3 quality levels)
- Auto ZIP for multiple files
- Glassmorphism Apple-style UI
- Auto browser launch
- Portable EXE (no manual setup)

---

## Implementation Steps

### 1. Project Structure Setup
Create folder hierarchy:
```
pdf-compressor/
├── app.py
├── launcher.py
├── requirements.txt
├── build_exe.py
├── README.md
├── compressor/
│   ├── __init__.py
│   ├── compress.py
│   └── zip_manager.py
├── static/
│   ├── style.css
│   ├── script.js
│   └── uploads/
├── templates/
│   └── index.html
├── ghostscript/
│   ├── gswin64c.exe
│   └── *.dll
├── output/
└── build/
```

### 2. Backend Development

**Core Files:**
- `app.py` - Flask server with `/compress` endpoint
- `compressor/compress.py` - 3-stage compression (Ghostscript → PikePDF → PyMuPDF)
- `compressor/zip_manager.py` - Multi-file ZIP creation

**Compression Pipeline:**
1. Ghostscript: Quality-based compression (/ebook, /printer, /screen)
2. PikePDF: Stream optimization + object deduplication
3. PyMuPDF: Garbage collection + deflate

### 3. Frontend Development

**Files:**
- `templates/index.html` - Upload form + compression level selector
- `static/style.css` - Glassmorphism styling (backdrop-filter, rgba)
- `static/script.js` - Async upload + auto-download

**UI Features:**
- File input for PDFs
- Radio buttons for compression levels
- Loading indicator
- Auto-download (single PDF or ZIP)

### 4. Launcher System

**launcher.py:**
- Start Flask server
- Auto-open browser after 1.5s delay
- Threading for parallel execution

### 5. Portable EXE Packaging

**build_exe.py - Enhanced for Full Portability:**
- PyInstaller with `--onefile` mode
- Bundle Python runtime (embedded)
- Bundle Ghostscript binaries (`gswin64c.exe` + DLLs)
- Bundle all templates + static files
- Bundle all Python packages
- Set proper paths for bundled Ghostscript
- Generate single portable EXE (~130MB)
- Output: `dist/PDFCompressor.exe`

**PyInstaller Configuration:**
```python
PyInstaller.__main__.run([
    'launcher.py',
    '--onefile',
    '--windowed',
    '--add-data=templates;templates',
    '--add-data=static;static',
    '--add-binary=ghostscript/gswin64c.exe;ghostscript',
    '--add-binary=ghostscript/*.dll;ghostscript',
    '--hidden-import=pikepdf',
    '--hidden-import=fitz',
    '--name=PDFCompressor',
    '--icon=icon.ico'
])
```

**Ghostscript Path Handling:**
- Detect if running from PyInstaller bundle
- Use bundled Ghostscript from temp extraction folder
- Fallback to system Ghostscript if bundle missing

### 6. Testing Strategy

**Local Testing:**
```bash
pip install -r requirements.txt
python launcher.py
```

**Test Cases:**
- Single PDF compression (all quality levels)
- Batch PDF compression (2-10 files)
- ZIP download for multiple files
- Large file handling (>50MB)
- Multi-page PDF preservation

**Portable Testing:**
- Copy EXE to clean Windows machine
- Run without Python installed
- Test from USB drive
- Test from Desktop
- Verify no admin rights needed

---

## Critical Dependencies (All Bundled)

**Python Packages (embedded in EXE):**
- flask
- pikepdf
- pymupdf
- pyinstaller

**Bundled Binaries:**
- Python 3.11 runtime
- Ghostscript (gswin64c.exe + required DLLs)
- All Python package dependencies

**No External Requirements:**
- User needs NOTHING pre-installed
- Works on clean Windows 10/11
- No admin rights needed

---

## Expected Performance

**Text PDFs:** 30-80% reduction
**Scanned PDFs:** 10-50% reduction
**Pre-optimized PDFs:** Minimal reduction

---

## Build Process

**Development:**
```bash
pip install -r requirements.txt
python launcher.py
```

**Production EXE:**
```bash
# Download Ghostscript portable
# Extract to ghostscript/ folder
python build_exe.py
# Output: dist/PDFCompressor.exe (~130MB)
```

**Distribution:**
- Single file: `PDFCompressor.exe`
- User double-clicks to run
- Browser opens automatically
- No setup, no install, no dependencies

---

## Next Action

Switch to Code mode to implement portable EXE architecture.