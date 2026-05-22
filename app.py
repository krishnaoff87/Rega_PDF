"""
Flask Backend for PDF Compressor
Handles file uploads, compression, and downloads
"""

import os
import sys
import tempfile
import shutil
from flask import Flask, render_template, request, send_file, jsonify
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime
from compressor import compress_pdf, create_zip_archive
import webview

# Initialize Flask app
app = Flask(__name__)

# Progress tracking
PROGRESS = {}

# Default download directory
DOWNLOAD_DIR = os.path.join(os.path.expanduser('~'), 'Downloads')

# Get writable directory for data (works in both dev and PyInstaller)
if getattr(sys, 'frozen', False):
    # Running as PyInstaller bundle
    # Use temp directory for uploads/output
    BASE_DATA_DIR = os.path.join(tempfile.gettempdir(), 'PDFCompressor')
else:
    # Running in normal Python
    BASE_DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DATA_DIR, 'uploads')
app.config['OUTPUT_FOLDER'] = os.path.join(BASE_DATA_DIR, 'output')
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)


def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def get_unique_filename(original_filename):
    """Generate unique filename to avoid conflicts"""
    name, ext = os.path.splitext(original_filename)
    unique_id = uuid.uuid4().hex[:8]
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"{name}_{timestamp}_{unique_id}{ext}"


@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route('/progress/<task_id>')
def get_progress(task_id):
    """Get progress for a compression task"""
    return jsonify({'progress': PROGRESS.get(task_id, 0)})

@app.route('/download/<filename>')
def download(filename):
    """Download a compressed file (old method)"""
    path = os.path.join(app.config['OUTPUT_FOLDER'], secure_filename(filename))
    if os.path.exists(path):
        return send_file(path, as_attachment=True)
    return "File not found", 404

@app.route('/save_to_downloads/<filename>')
def save_to_downloads(filename):
    """Save directly to the user's selected download folder"""
    global DOWNLOAD_DIR
    source_path = os.path.join(app.config['OUTPUT_FOLDER'], secure_filename(filename))
    if not os.path.exists(source_path):
        return jsonify({'error': 'File not found'}), 404
        
    try:
        dest_path = os.path.join(DOWNLOAD_DIR, secure_filename(filename))
        shutil.copy2(source_path, dest_path)
        
        # Automatically open the saved file
        if os.name == 'nt':
            os.startfile(dest_path)
        else:
            import subprocess
            subprocess.run(['open', dest_path])
            
        return jsonify({'success': True, 'path': dest_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/change_download_folder', methods=['POST'])
def change_download_folder():
    """Open native folder dialog to change download location"""
    global DOWNLOAD_DIR
    try:
        # Access the first pywebview window created
        if len(webview.windows) > 0:
            window = webview.windows[0]
            result = window.create_file_dialog(webview.FOLDER_DIALOG, directory=DOWNLOAD_DIR)
            if result and len(result) > 0:
                DOWNLOAD_DIR = result[0]
                return jsonify({'success': True, 'folder': DOWNLOAD_DIR})
        return jsonify({'success': False, 'error': 'No folder selected'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/clear_cache', methods=['POST'])
def clear_cache():
    """Clear uploads and output directories, check dependencies"""
    try:
        for folder in [app.config['UPLOAD_FOLDER'], app.config['OUTPUT_FOLDER']]:
            if os.path.exists(folder):
                for filename in os.listdir(folder):
                    filepath = os.path.join(folder, filename)
                    if os.path.isfile(filepath):
                        os.remove(filepath)
        
        # Simple dependency check: does ghostscript exist?
        from compressor.compress import get_ghostscript_path
        gs = get_ghostscript_path()
        if not os.path.exists(gs):
            return jsonify({'success': False, 'message': 'Cache cleared, but Ghostscript is MISSING!'})
            
        return jsonify({'success': True, 'message': 'Cache cleared successfully. All dependencies OK.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


@app.route('/compress', methods=['POST'])
def compress():
    """
    Handle PDF compression request
    Supports single or multiple file uploads
    Returns compressed PDF or ZIP archive
    """
    try:
        # Check if files were uploaded
        if 'files[]' not in request.files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        files = request.files.getlist('files[]')
        quality = request.form.get('quality', 'ebook')
        task_id = request.form.get('task_id', uuid.uuid4().hex)
        
        PROGRESS[task_id] = 0
        
        # Validate quality level
        if quality not in ['screen', 'ebook', 'printer']:
            quality = 'ebook'
        
        # Filter valid PDF files
        valid_files = [f for f in files if f and allowed_file(f.filename)]
        
        if not valid_files:
            return jsonify({'error': 'No valid PDF files uploaded'}), 400
        
        compressed_files = []
        compression_stats = []
        
        # Process each file
        total_files = len(valid_files)
        
        for idx, file in enumerate(valid_files):
            # Save uploaded file
            original_filename = secure_filename(file.filename)
            unique_filename = get_unique_filename(original_filename)
            upload_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(upload_path)
            
            # Generate output filename
            output_filename = f"compressed_{original_filename}"
            output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
            
            # Create progress callback
            def make_callback(file_idx, total):
                def callback(stage_percent):
                    base_progress = (file_idx / total) * 100
                    file_progress = (stage_percent / 100) * (100 / total)
                    PROGRESS[task_id] = min(99, int(base_progress + file_progress))
                return callback
            
            # Compress PDF
            result = compress_pdf(upload_path, output_path, quality, make_callback(idx, total_files))
            
            if result['success']:
                compressed_files.append({
                    'path': output_path,
                    'filename': output_filename,
                    'original_name': original_filename
                })
                compression_stats.append({
                    'filename': original_filename,
                    'original_size_mb': result['original_size_mb'],
                    'compressed_size_mb': result['compressed_size_mb'],
                    'reduction_percent': result['reduction_percent']
                })
            else:
                # Clean up uploaded file
                if os.path.exists(upload_path):
                    os.remove(upload_path)
                return jsonify({'error': f"Compression failed for {original_filename}: {result.get('error', 'Unknown error')}"}), 500
            
            # Clean up uploaded file
            if os.path.exists(upload_path):
                os.remove(upload_path)
        
        PROGRESS[task_id] = 100
        
        # Single file
        if len(compressed_files) == 1:
            file_info = compressed_files[0]
            return jsonify({
                'success': True,
                'is_multiple': False,
                'pdf_url': f"/download/{file_info['filename']}",
                'filename': file_info['original_name']
            })
        
        # Multiple files
        else:
            file_paths = [f['path'] for f in compressed_files]
            zip_filename = f"compressed_pdfs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
            zip_path = create_zip_archive(
                file_paths,
                app.config['OUTPUT_FOLDER'],
                zip_filename
            )
            
            if not zip_path:
                return jsonify({'error': 'Failed to create ZIP archive'}), 500
            
            pdf_urls = [{"url": f"/download/{f['filename']}", "name": f['original_name']} for f in compressed_files]
            
            return jsonify({
                'success': True,
                'is_multiple': True,
                'zip_url': f"/download/{zip_filename}",
                'pdf_urls': pdf_urls
            })
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'PDF Compressor is running'})



# --- CONVERSION ROUTES ---

from compressor.converters import pdf_to_images, images_to_pdf, merge_pdfs, pdf_to_word, pdf_to_excel

@app.route('/api/convert/pdf-to-img', methods=['POST'])
def convert_pdf_to_img():
    try:
        if 'files[]' not in request.files: return jsonify({'error': 'No file uploaded'}), 400
        files = request.files.getlist('files[]')
        img_format = request.form.get('format', 'png').lower()
        if img_format not in ['png', 'jpg', 'jpeg']: img_format = 'png'
        
        output_dir = os.path.join(app.config['OUTPUT_FOLDER'], f"img_{uuid.uuid4().hex}")
        os.makedirs(output_dir, exist_ok=True)
        
        all_image_paths = []
        for file in files:
            if not file.filename.lower().endswith('.pdf'): continue
            orig_name = secure_filename(file.filename)
            upload_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4().hex}_{orig_name}")
            file.save(upload_path)
            
            image_paths = pdf_to_images(upload_path, output_dir, img_format)
            all_image_paths.extend(image_paths)
            
        zip_filename = f"images_converted.zip"
        zip_path = create_zip_archive(all_image_paths, app.config['OUTPUT_FOLDER'], zip_filename)
        
        return jsonify({'success': True, 'zip_url': f"/download/{zip_filename}", 'filename': zip_filename, 'is_multiple': True, 'pdf_urls': []})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/img-to-pdf', methods=['POST'])
def convert_img_to_pdf():
    try:
        if 'files[]' not in request.files: return jsonify({'error': 'No files uploaded'}), 400
        files = request.files.getlist('files[]')
        password = request.form.get('password', '').strip()
        if not password: password = None
        
        image_paths = []
        for file in files:
            path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
            file.save(path)
            image_paths.append(path)
            
        output_filename = f"combined_{uuid.uuid4().hex}.pdf"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        images_to_pdf(image_paths, output_path, password)
        
        return jsonify({'success': True, 'pdf_url': f"/download/{output_filename}", 'filename': output_filename, 'is_multiple': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/merge', methods=['POST'])
def convert_merge():
    try:
        if 'files[]' not in request.files: return jsonify({'error': 'No files uploaded'}), 400
        files = request.files.getlist('files[]')
        
        pdf_paths = []
        for file in files:
            path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
            file.save(path)
            pdf_paths.append(path)
            
        output_filename = f"merged_{uuid.uuid4().hex}.pdf"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        merge_pdfs(pdf_paths, output_path)
        
        return jsonify({'success': True, 'pdf_url': f"/download/{output_filename}", 'filename': output_filename, 'is_multiple': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/pdf-to-word', methods=['POST'])
def convert_pdf_to_word():
    try:
        if 'files[]' not in request.files: return jsonify({'error': 'No file'}), 400
        file = request.files.getlist('files[]')[0]
        orig_name = secure_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], orig_name)
        file.save(upload_path)
        
        output_filename = f"{os.path.splitext(orig_name)[0]}.docx"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        pdf_to_word(upload_path, output_path)
        
        return jsonify({'success': True, 'pdf_url': f"/download/{output_filename}", 'filename': output_filename, 'is_multiple': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/pdf-to-excel', methods=['POST'])
def convert_pdf_to_excel():
    try:
        if 'files[]' not in request.files: return jsonify({'error': 'No file'}), 400
        file = request.files.getlist('files[]')[0]
        orig_name = secure_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], orig_name)
        file.save(upload_path)
        
        output_filename = f"{os.path.splitext(orig_name)[0]}.xlsx"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        pdf_to_excel(upload_path, output_path)
        
        return jsonify({'success': True, 'pdf_url': f"/download/{output_filename}", 'filename': output_filename, 'is_multiple': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def cleanup_old_files():

    """Clean up old files from upload and output directories"""
    import time
    max_age = 3600  # 1 hour
    current_time = time.time()
    
    for folder in [app.config['UPLOAD_FOLDER'], app.config['OUTPUT_FOLDER']]:
        if os.path.exists(folder):
            for filename in os.listdir(folder):
                filepath = os.path.join(folder, filename)
                if os.path.isfile(filepath):
                    file_age = current_time - os.path.getmtime(filepath)
                    if file_age > max_age:
                        try:
                            os.remove(filepath)
                        except Exception:
                            pass



import threading

@app.route('/api/shutdown', methods=['POST'])
def shutdown():
    def close_app():
        if len(webview.windows) > 0:
            webview.windows[0].destroy()
        os._exit(0)
    threading.Timer(0.5, close_app).start()
    return jsonify({'success': True})

if __name__ == '__main__':
    # Clean up old files on startup
    cleanup_old_files()
    
    # Run Flask app
    app.run(host='127.0.0.1', port=5000, debug=False)

# Made with Bob
