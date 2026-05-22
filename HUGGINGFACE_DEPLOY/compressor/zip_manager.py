"""
ZIP Archive Manager
Creates ZIP archives for batch compressed PDFs
"""

import os
import zipfile
from pathlib import Path


def create_zip_archive(file_paths, output_path, archive_name='compressed_pdfs.zip'):
    """
    Create a ZIP archive containing multiple PDF files
    
    Args:
        file_paths: List of file paths to include in ZIP
        output_path: Directory where ZIP will be saved
        archive_name: Name of the ZIP file
    
    Returns:
        str: Path to created ZIP file
    """
    zip_path = os.path.join(output_path, archive_name)
    
    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in file_paths:
                if os.path.exists(file_path):
                    # Add file to ZIP with just the filename (no directory structure)
                    arcname = os.path.basename(file_path)
                    zipf.write(file_path, arcname=arcname)
        
        return zip_path
    except Exception as e:
        print(f"ZIP creation error: {e}")
        return None


def get_zip_size(zip_path):
    """
    Get size of ZIP file in bytes
    
    Args:
        zip_path: Path to ZIP file
    
    Returns:
        int: File size in bytes
    """
    if os.path.exists(zip_path):
        return os.path.getsize(zip_path)
    return 0


def validate_zip(zip_path):
    """
    Validate ZIP file integrity
    
    Args:
        zip_path: Path to ZIP file
    
    Returns:
        bool: True if ZIP is valid, False otherwise
    """
    try:
        with zipfile.ZipFile(zip_path, 'r') as zipf:
            # Test ZIP integrity
            bad_file = zipf.testzip()
            return bad_file is None
    except Exception:
        return False

# Made with Bob
