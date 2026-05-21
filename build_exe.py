"""
PyInstaller Build Script for Portable PDF Compressor
Creates single EXE with bundled Python runtime and Ghostscript
"""

import os
import sys
import shutil
import PyInstaller.__main__

def check_ghostscript():
    """
    Check if Ghostscript binaries are present in ghostscript/ folder
    """
    gs_dir = 'ghostscript'
    gs_exe = os.path.join(gs_dir, 'gswin64c.exe')
    
    if not os.path.exists(gs_exe):
        print("\n" + "="*60)
        print("ERROR: Ghostscript binaries not found!")
        print("="*60)
        print("\nPlease download Ghostscript portable and extract to:")
        print(f"  {os.path.abspath(gs_dir)}/")
        print("\nRequired files:")
        print("  - gswin64c.exe")
        print("  - gsdll64.dll")
        print("  - All other required DLLs")
        print("\nDownload from: https://ghostscript.com/releases/gsdnld.html")
        print("="*60 + "\n")
        return False
    
    print(f"[OK] Found Ghostscript at: {gs_exe}")
    return True


def clean_build_dirs():
    """
    Clean previous build directories
    """
    dirs_to_clean = ['build', 'dist', '__pycache__']
    
    for dir_name in dirs_to_clean:
        if os.path.exists(dir_name):
            print(f"Cleaning {dir_name}/...")
            shutil.rmtree(dir_name)
    
    # Clean .spec files
    for file in os.listdir('.'):
        if file.endswith('.spec'):
            print(f"Removing {file}...")
            os.remove(file)


def build_exe():
    """
    Build portable EXE using PyInstaller
    """
    print("\n" + "="*60)
    print("Building Portable PDF Compressor EXE")
    print("="*60 + "\n")
    
    # Check for Ghostscript
    if not check_ghostscript():
        sys.exit(1)
    
    # Clean previous builds
    clean_build_dirs()
    
    print("\nStarting PyInstaller build...\n")
    
    # PyInstaller arguments
    args = [
        'launcher.py',                          # Entry point
        '--onedir',                             # Folder based
        '--windowed',                           # No console window
        '--name=PDFCompressor',                 # EXE name
        
        # Add data files
        '--add-data=templates;templates',       # HTML templates
        '--add-data=static;static',             # CSS, JS, etc.
        '--add-data=Logo.png;.',                # Logo file
        
        # Add Ghostscript binaries
        '--add-binary=ghostscript/gswin64c.exe;ghostscript',
        '--add-binary=ghostscript/*.dll;ghostscript',
        
        # Hidden imports (packages not auto-detected)
        '--hidden-import=pikepdf',
        '--hidden-import=pikepdf._core',
        '--hidden-import=fitz',
        '--hidden-import=flask',
        '--hidden-import=werkzeug',
        '--hidden-import=jinja2',
        
        # Optimization
        '--clean',                              # Clean cache
        '--noconfirm',                          # Overwrite without asking
        
        # Additional options
        '--log-level=INFO',                     # Build log level
    ]
    
    # Add icon if exists
    if os.path.exists('icon.ico'):
        args.append('--icon=icon.ico')
    
    try:
        # Run PyInstaller
        PyInstaller.__main__.run(args)
        
        print("\n" + "="*60)
        print("BUILD SUCCESSFUL!")
        print("="*60)
        print(f"\nPortable App created at: dist/PDFCompressor/PDFCompressor.exe")
        print(f"Folder size: ~130MB (includes Python + Ghostscript)")
        print("\nDistribution:")
        print("  1. Copy PDFCompressor folder to any Windows machine")
        print("  2. Double-click to run (no installation needed)")
        print("  3. Browser opens automatically")
        print("\nNo dependencies required on target machine!")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print("\n" + "="*60)
        print("BUILD FAILED!")
        print("="*60)
        print(f"\nError: {e}")
        print("\nPlease check:")
        print("  1. All dependencies installed (pip install -r requirements.txt)")
        print("  2. Ghostscript binaries in ghostscript/ folder")
        print("  3. Sufficient disk space (~500MB for build)")
        print("="*60 + "\n")
        return False


def verify_build():
    """
    Verify the built EXE exists and check size
    """
    exe_path = os.path.join('dist', 'PDFCompressor', 'PDFCompressor.exe')
    
    if not os.path.exists(exe_path):
        print("\nWARNING: EXE not found at expected location!")
        return False
    
    size_mb = os.path.getsize(exe_path) / (1024 * 1024)
    print(f"\nEXE Size: {size_mb:.2f} MB")
    
    if size_mb < 50:
        print("WARNING: EXE size seems too small. Ghostscript may not be bundled.")
        return False
    
    return True


def main():
    """
    Main build process
    """
    print("\n" + "="*60)
    print("PDF Compressor - Portable EXE Builder")
    print("="*60)
    print("\nThis will create a fully portable Windows EXE that includes:")
    print("  - Python 3.11 runtime")
    print("  - Ghostscript binaries")
    print("  - All Python dependencies")
    print("  - Web interface (HTML/CSS/JS)")
    print("\nTarget size: ~130MB")
    print("="*60 + "\n")
    
    # Confirm build
    response = input("Continue with build? (y/n): ").strip().lower()
    if response != 'y':
        print("Build cancelled.")
        sys.exit(0)
    
    # Build
    success = build_exe()
    
    if success:
        # Verify
        verify_build()
        
        print("\nNext steps:")
        print("  1. Test the EXE: dist/PDFCompressor.exe")
        print("  2. Copy to clean Windows machine for testing")
        print("  3. Distribute to users")
        print("\nEnjoy your portable PDF compressor! :)\n")
    else:
        sys.exit(1)


if __name__ == '__main__':
    main()

# Made with Bob
