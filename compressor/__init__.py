"""
PDF Compressor Module
Provides 3-stage compression pipeline and ZIP management
"""

from .compress import compress_pdf, get_compression_stats
from .zip_manager import create_zip_archive

__all__ = ['compress_pdf', 'get_compression_stats', 'create_zip_archive']

# Made with Bob
