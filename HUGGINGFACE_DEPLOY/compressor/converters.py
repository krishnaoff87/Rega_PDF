import os
import fitz  # PyMuPDF
from PIL import Image
from pdf2docx import Converter
import pdfplumber
import pandas as pd

def pdf_to_images(pdf_path, output_dir, img_format="png"):
    """Convert PDF pages to high-quality images"""
    doc = fitz.open(pdf_path)
    image_paths = []
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=300)
        img_path = os.path.join(output_dir, f"{base_name}_page_{page_num+1}.{img_format}")
        pix.save(img_path)
        image_paths.append(img_path)
    doc.close()
    return image_paths

def images_to_pdf(image_paths, output_pdf_path, password=None):
    """Combine multiple images into a single PDF"""
    doc = fitz.open()
    for img_path in image_paths:
        img = fitz.open(img_path)
        rect = img[0].rect
        pdfbytes = img.convert_to_pdf()
        img.close()
        imgPDF = fitz.open("pdf", pdfbytes)
        page = doc.new_page(width=rect.width, height=rect.height)
        page.show_pdf_page(rect, imgPDF, 0)
    
    if password:
        doc.save(output_pdf_path, encryption=fitz.PDF_ENCRYPT_AES_256, user_pw=password, owner_pw=password)
    else:
        doc.save(output_pdf_path)
    doc.close()
    return output_pdf_path

def merge_pdfs(pdf_paths, output_pdf_path):
    """Merge multiple PDFs into a single PDF"""
    doc = fitz.open()
    for pdf_path in pdf_paths:
        doc.insert_pdf(fitz.open(pdf_path))
    doc.save(output_pdf_path)
    doc.close()
    return output_pdf_path

def pdf_to_word(pdf_path, output_docx_path):
    """Convert PDF to Word Document using pdf2docx"""
    cv = Converter(pdf_path)
    cv.convert(output_docx_path, start=0, end=None)
    cv.close()
    return output_docx_path

def pdf_to_excel(pdf_path, output_xlsx_path):
    """Extract tables from PDF and save as Excel sheets using pdfplumber"""
    with pdfplumber.open(pdf_path) as pdf:
        all_tables = []
        for page in pdf.pages:
            tables = page.extract_tables()
            if not tables:
                # Fallback for borderless tables or flattened PDFs
                tables = page.extract_tables({"vertical_strategy": "text", "horizontal_strategy": "text"})
                
            for table in tables:
                if table:
                    # Filter out purely None rows
                    table = [row for row in table if any(cell is not None for cell in row)]
                    if len(table) > 1:
                        df = pd.DataFrame(table[1:], columns=table[0])
                        all_tables.append(df)
                    elif len(table) == 1:
                        df = pd.DataFrame(table)
                        all_tables.append(df)
                    
    if not all_tables:
        raise ValueError("No tables could be found or extracted from this PDF.")
        
    with pd.ExcelWriter(output_xlsx_path, engine='openpyxl') as writer:
        for i, df in enumerate(all_tables):
            # Clean up column names if they are None
            if df.columns.isnull().any():
                df.columns = [f"Column_{j}" if pd.isna(col) else col for j, col in enumerate(df.columns)]
            df.to_excel(writer, sheet_name=f"Table_{i+1}", index=False)
            
    return output_xlsx_path
