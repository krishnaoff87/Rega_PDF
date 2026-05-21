# PDF Compressor - Portable Edition

A fully portable Windows PDF compressor with a beautiful glassmorphism UI. Compress PDFs using a 3-stage optimization pipeline with **zero installation required**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **🚀 Fully Portable** - Single EXE, no installation needed
- **🎨 Beautiful UI** - Modern glassmorphism design with TailwindCSS
- **⚡ 3-Stage Compression** - Ghostscript → PikePDF → PyMuPDF
- **📦 Batch Processing** - Compress multiple PDFs at once
- **🗜️ Auto ZIP** - Automatically creates ZIP for multiple files
- **🎯 Quality Levels** - Screen (72 DPI), eBook (150 DPI), Printer (300 DPI)
- **🔒 Privacy First** - All processing happens locally, no cloud uploads
- **🌐 Auto Browser** - Automatically opens in your default browser

## 📋 Requirements

### For End Users (Portable EXE)
- **Windows 10/11** (64-bit)
- **No Python installation required**
- **No dependencies required**
- **No admin rights needed**

### For Development
- Python 3.11+
- pip (Python package manager)
- Ghostscript portable binaries

## 🚀 Quick Start (End Users)

1. **Download** `PDFCompressor.exe`
2. **Double-click** to run
3. **Browser opens automatically** at `http://127.0.0.1:5000`
4. **Upload PDFs** and compress!

That's it! No installation, no setup, no hassle.

## 💻 Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd pdf-compressor
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Download Ghostscript Portable
1. Download from: https://ghostscript.com/releases/gsdnld.html
2. Extract `gswin64c.exe` and all DLLs to `ghostscript/` folder

### 4. Run Development Server
```bash
python launcher.py
```

Browser will open automatically at `http://127.0.0.1:5000`

## 🏗️ Building Portable EXE

### Prerequisites
- All development dependencies installed
- Ghostscript binaries in `ghostscript/` folder
- ~500MB free disk space for build

### Build Process
```bash
python build_exe.py
```

The script will:
1. ✅ Verify Ghostscript binaries
2. 🧹 Clean previous builds
3. 📦 Bundle Python runtime
4. 📦 Bundle Ghostscript binaries
5. 📦 Bundle all dependencies
6. 🎯 Create single EXE (~130MB)

**Output:** `dist/PDFCompressor.exe`

### Build Configuration
The build script (`build_exe.py`) uses PyInstaller with:
- `--onefile` - Single executable
- `--windowed` - No console window
- Bundled Python 3.11 runtime
- Bundled Ghostscript binaries
- All templates and static files
- All Python dependencies

## 📁 Project Structure

```
pdf-compressor/
├── app.py                      # Flask backend
├── launcher.py                 # Auto-browser launcher
├── build_exe.py                # PyInstaller build script
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── compressor/                 # Compression module
│   ├── __init__.py
│   ├── compress.py             # 3-stage compression pipeline
│   └── zip_manager.py          # ZIP archive creation
│
├── templates/                  # HTML templates
│   └── index.html              # Main UI
│
├── static/                     # Frontend assets
│   ├── style.css               # Glassmorphism styles
│   ├── script.js               # Frontend logic
│   └── uploads/                # Temporary uploads
│
├── ghostscript/                # Ghostscript binaries (not in repo)
│   ├── gswin64c.exe
│   └── *.dll
│
├── output/                     # Compressed PDFs output
├── build/                      # PyInstaller build cache
└── dist/                       # Final EXE output
```

## 🔧 How It Works

### 3-Stage Compression Pipeline

**Stage 1: Ghostscript**
- Quality-based compression
- Image downsampling
- Font compression
- Duplicate image detection

**Stage 2: PikePDF**
- Stream optimization
- Object deduplication
- Remove unused resources
- Recompress streams

**Stage 3: PyMuPDF**
- Garbage collection
- Deflate compression
- Metadata cleaning
- Final optimization

### Quality Levels

| Level | DPI | Use Case | Size |
|-------|-----|----------|------|
| **Screen** | 72 | Web viewing, email | Smallest |
| **eBook** | 150 | Digital reading (default) | Balanced |
| **Printer** | 300 | High-quality printing | Larger |

### Portable Architecture

The EXE uses PyInstaller's `sys._MEIPASS` to detect bundled resources:

```python
if getattr(sys, 'frozen', False):
    # Running from EXE - use bundled Ghostscript
    bundle_dir = sys._MEIPASS
    gs_path = os.path.join(bundle_dir, 'ghostscript', 'gswin64c.exe')
```

This ensures Ghostscript is found whether running from:
- Development environment
- Portable EXE
- Any directory location

## 📊 Expected Performance

| PDF Type | Compression | Example |
|----------|-------------|---------|
| **Text PDFs** | 30-80% | 10MB → 2-7MB |
| **Scanned PDFs** | 10-50% | 50MB → 25-45MB |
| **Pre-optimized** | 0-10% | Already compressed |

*Results vary based on content and quality level*

## 🎨 UI Features

- **Drag & Drop** - Drop PDFs directly onto upload area
- **Multi-file** - Select and compress multiple PDFs
- **Real-time Preview** - See selected files before compression
- **Progress Indicator** - Visual feedback during compression
- **Auto Download** - Compressed files download automatically
- **Responsive Design** - Works on all screen sizes

## 🔒 Privacy & Security

- ✅ **100% Local Processing** - No cloud uploads
- ✅ **No Data Collection** - No analytics or tracking
- ✅ **Temporary Files** - Auto-cleanup after 1 hour
- ✅ **No Internet Required** - Works completely offline

## 🐛 Troubleshooting

### EXE won't start
- Ensure Windows 10/11 64-bit
- Check antivirus isn't blocking
- Run from a location with write permissions

### Compression fails
- Verify PDF isn't password-protected
- Check file isn't corrupted
- Ensure sufficient disk space

### Browser doesn't open
- Manually navigate to `http://127.0.0.1:5000`
- Check firewall settings
- Ensure port 5000 isn't in use

### Build fails
- Verify all dependencies installed
- Check Ghostscript binaries present
- Ensure sufficient disk space (~500MB)

## 📝 Development Notes

### Adding Features
1. Modify backend in `app.py`
2. Update UI in `templates/index.html`
3. Add styles in `static/style.css`
4. Add logic in `static/script.js`
5. Rebuild EXE with `build_exe.py`

### Testing
```bash
# Development testing
python launcher.py

# EXE testing
dist/PDFCompressor.exe
```

### Debugging
- Check console output for errors
- Review Flask logs
- Test Ghostscript path detection
- Verify file permissions

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Ghostscript** - PDF processing engine
- **PikePDF** - PDF manipulation library
- **PyMuPDF** - PDF optimization library
- **Flask** - Web framework
- **TailwindCSS** - UI styling
- **PyInstaller** - EXE packaging

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check troubleshooting section
- Review documentation

---

**Made with ❤️ for portable PDF compression**

*No installation. No dependencies. Just compress.*