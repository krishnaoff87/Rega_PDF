"""
3-Stage PDF Compression Pipeline
Stage 1: Ghostscript - Quality-based compression
Stage 2: PikePDF - Stream optimization + object deduplication
Stage 3: PyMuPDF - Garbage collection + deflate
"""

import os
import sys
import subprocess
import tempfile
from pathlib import Path
import pikepdf
import fitz  # PyMuPDF


def get_ghostscript_path():
    """
    Get Ghostscript executable path.
    Detects if running from PyInstaller bundle and uses bundled Ghostscript.
    Falls back to system Ghostscript if not bundled.
    """
    if os.name != 'nt':
        return 'gs'
        
    # Check if running from PyInstaller bundle
    if getattr(sys, 'frozen', False):
        # Running from PyInstaller bundle
        bundle_dir = sys._MEIPASS
        gs_path = os.path.join(bundle_dir, 'ghostscript', 'gswin64c.exe')
        if os.path.exists(gs_path):
            return gs_path
    
    # Check for bundled Ghostscript in development
    local_gs = os.path.join(os.path.dirname(__file__), '..', 'ghostscript', 'gswin64c.exe')
    if os.path.exists(local_gs):
        return os.path.abspath(local_gs)
    
    # Fallback to system Ghostscript
    return 'gswin64c.exe'


def stage1_ghostscript(input_path, output_path, quality='ebook'):
    """
    Stage 1: Ghostscript compression
    
    Quality levels:
    - screen: 72 DPI (smallest, lowest quality)
    - ebook: 150 DPI (balanced)
    - printer: 300 DPI (high quality, larger)
    """
    gs_path = get_ghostscript_path()
    
    quality_settings = {
        'screen': '/screen',
        'ebook': '/ebook',
        'printer': '/printer'
    }
    
    pdf_settings = quality_settings.get(quality, '/ebook')
    
    cmd = [
        gs_path,
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        f'-dPDFSETTINGS={pdf_settings}',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        '-dDetectDuplicateImages=true',
        '-dCompressFonts=true',
        '-r150',
        f'-sOutputFile={output_path}',
        input_path
    ]
    
    try:
        # Hide CLI window on Windows
        creationflags = getattr(subprocess, 'CREATE_NO_WINDOW', 0x08000000) if os.name == 'nt' else 0
        subprocess.run(cmd, check=True, capture_output=True, creationflags=creationflags)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Ghostscript error: {e.stderr.decode()}")
        return False
    except FileNotFoundError:
        print(f"Ghostscript not found at: {gs_path}")
        return False


def stage2_pikepdf(input_path, output_path):
    """
    Stage 2: PikePDF optimization
    - Stream compression
    - Object deduplication
    - Remove unused objects
    """
    try:
        with pikepdf.open(input_path) as pdf:
            # Remove unused objects
            pdf.remove_unreferenced_resources()
            
            # Save with compression
            pdf.save(
                output_path,
                compress_streams=True,
                stream_decode_level=pikepdf.StreamDecodeLevel.generalized,
                object_stream_mode=pikepdf.ObjectStreamMode.generate,
                recompress_flate=True
            )
        return True
    except Exception as e:
        print(f"PikePDF error: {e}")
        return False


def stage3_pymupdf(input_path, output_path):
    """
    Stage 3: PyMuPDF final optimization
    - Garbage collection
    - Deflate compression
    - Clean metadata
    """
    try:
        doc = fitz.open(input_path)
        
        # Garbage collection - remove unused objects
        doc.garbage = 4  # Maximum garbage collection
        
        # Save with deflate compression
        doc.save(
            output_path,
            garbage=4,
            deflate=True,
            clean=True,
            pretty=False
        )
        
        doc.close()
        return True
    except Exception as e:
        print(f"PyMuPDF error: {e}")
        return False


def compress_pdf(input_path, output_path, quality='ebook', progress_callback=None):
    """
    Execute 3-stage compression pipeline
    
    Args:
        input_path: Path to input PDF
        output_path: Path to save compressed PDF
        quality: Compression quality ('screen', 'ebook', 'printer')
    
    Returns:
        dict: Compression results with original_size, compressed_size, reduction_percent
    """
    try:
        # Get original file size
        original_size = os.path.getsize(input_path)
        
        # Create temporary files for intermediate stages
        with tempfile.TemporaryDirectory() as temp_dir:
            stage1_output = os.path.join(temp_dir, 'stage1.pdf')
            stage2_output = os.path.join(temp_dir, 'stage2.pdf')
            
            # Stage 1: Ghostscript
            print(f"Stage 1: Ghostscript compression ({quality})...")
            if not stage1_ghostscript(input_path, stage1_output, quality):
                raise Exception("Stage 1 (Ghostscript) failed")
            if progress_callback: progress_callback(33)
            
            # Stage 2: PikePDF
            print("Stage 2: PikePDF optimization...")
            if not stage2_pikepdf(stage1_output, stage2_output):
                raise Exception("Stage 2 (PikePDF) failed")
            if progress_callback: progress_callback(66)
            
            # Stage 3: PyMuPDF
            print("Stage 3: PyMuPDF final optimization...")
            if not stage3_pymupdf(stage2_output, output_path):
                raise Exception("Stage 3 (PyMuPDF) failed")
            if progress_callback: progress_callback(100)
        
        # Get compressed file size
        compressed_size = os.path.getsize(output_path)
        
        # Calculate reduction
        reduction = ((original_size - compressed_size) / original_size) * 100
        
        return {
            'success': True,
            'original_size': original_size,
            'compressed_size': compressed_size,
            'reduction_percent': round(reduction, 2),
            'original_size_mb': round(original_size / (1024 * 1024), 2),
            'compressed_size_mb': round(compressed_size / (1024 * 1024), 2)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def get_compression_stats(original_size, compressed_size):
    """
    Calculate compression statistics
    
    Args:
        original_size: Original file size in bytes
        compressed_size: Compressed file size in bytes
    
    Returns:
        dict: Statistics including sizes and reduction percentage
    """
    reduction = ((original_size - compressed_size) / original_size) * 100
    
    return {
        'original_size': original_size,
        'compressed_size': compressed_size,
        'reduction_percent': round(reduction, 2),
        'original_size_mb': round(original_size / (1024 * 1024), 2),
        'compressed_size_mb': round(compressed_size / (1024 * 1024), 2)
    }

# Made with Bob
