"""
PDF Compressor Launcher
Starts Flask server in a native window using pywebview
"""

import sys
import webview
from app import app, cleanup_old_files


def main():
    """
    Main entry point
    Starts pywebview window which hosts the Flask app
    """
    print("=" * 60)
    print("PDF Compressor - Portable Edition (Native Window)")
    print("=" * 60)
    print("\nStarting application...")
    
    try:
        # Clean up old files
        cleanup_old_files()
        
        # Start webview window with Flask app
        window = webview.create_window(
            'PDF Compressor', 
            app,
            width=918,
            height=918,
            min_size=(800, 600)
        )
        webview.start()
        
    except KeyboardInterrupt:
        print("\n\nShutting down application...")
        print("Thank you for using PDF Compressor!")
        sys.exit(0)
    except Exception as e:
        print(f"\nError starting application: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

# Made with Bob
