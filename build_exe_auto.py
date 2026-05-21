"""
PyInstaller Build Script for Portable PDF Compressor - Auto Build
Creates single EXE with bundled Python runtime and Ghostscript
"""

import os
import sys
import shutil
import PyInstaller.__main__

def check_ghostscript():
    """Check if Ghostscript binaries are present"""
    gs_dir = 'ghostscript'
    gs_exe = os.path.join(gs_dir, 'gswin64c.exe')
    
    if not os.path.exists(gs_exe):
        print("\nERROR: Ghostscript binaries not found!")
        return False
    
    print(f"[OK] Found Ghostscript at: {gs_exe}")
    return True


def clean_build_dirs():
    """Clean previous build directories"""
    dirs_to_clean = ['build', '__pycache__']
    
    for dir_name in dirs_to_clean:
        if os.path.exists(dir_name):
            try:
                print(f"Cleaning {dir_name}/...")
                shutil.rmtree(dir_name)
            except Exception as e:
                print(f"Warning: Could not clean {dir_name}: {e}")
    
    # Clean .spec files
    for file in os.listdir('.'):
        if file.endswith('.spec'):
            try:
                print(f"Removing {file}...")
                os.remove(file)
            except Exception as e:
                print(f"Warning: Could not remove {file}: {e}")
    
    # Note: dist folder will be overwritten by PyInstaller with --noconfirm
    print("Note: dist folder will be overwritten by PyInstaller")


def build_exe():
    """Build portable EXE using PyInstaller"""
    print("\n" + "="*60)
    print("Building Portable PDF Compressor EXE (Auto Mode)")
    print("="*60 + "\n")
    
    # Check for Ghostscript
    if not check_ghostscript():
        sys.exit(1)
    
    # Clean previous builds
    clean_build_dirs()
    
    print("\nStarting PyInstaller build...\n")
    
    # PyInstaller arguments
    args = [
        'launcher.py',
        '--onefile',
        '--windowed',
        '--name=PDFCompressor',
        '--add-data=templates;templates',
        '--add-data=static;static',
        '--add-data=Logo.png;.',
        '--add-binary=ghostscript/gswin64c.exe;ghostscript',
        '--add-binary=ghostscript/*.dll;ghostscript',
        '--hidden-import=pikepdf',
        '--hidden-import=pikepdf._core',
        '--hidden-import=fitz',
        '--hidden-import=flask',
        '--hidden-import=werkzeug',
        '--hidden-import=jinja2',
        '--clean',
        '--noconfirm',
        '--log-level=INFO',
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
        print(f"\nPortable EXE created at: dist/PDFCompressor.exe")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print("\n" + "="*60)
        print("BUILD FAILED!")
        print("="*60)
        print(f"\nError: {e}")
        print("="*60 + "\n")
        return False


if __name__ == '__main__':
    success = build_exe()
    sys.exit(0 if success else 1)

# Made with Bob
