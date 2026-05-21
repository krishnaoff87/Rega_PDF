"""
Create installer assets from Logo.png
- Analyze color palette
- Create icon.ico with multiple sizes
- Create logo_installer.bmp (164x314 px)
- Create logo_small.bmp (55x58 px)
"""

import sys
import io
from PIL import Image
import os
from collections import Counter

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def analyze_logo_colors(logo_path):
    """Extract dominant colors from logo"""
    print("Analyzing Logo.png for color palette...")
    
    img = Image.open(logo_path)
    img = img.convert('RGB')
    
    # Get all pixels
    pixels = list(img.getdata())
    
    # Count color frequencies
    color_counts = Counter(pixels)
    
    # Get top 10 most common colors
    most_common = color_counts.most_common(10)
    
    print("\nTop 10 colors in Logo.png:")
    for i, (color, count) in enumerate(most_common, 1):
        hex_color = '#{:02x}{:02x}{:02x}'.format(*color)
        print(f"{i}. RGB{color} = {hex_color} ({count} pixels)")
    
    # Filter out near-white and near-black colors for better palette
    filtered_colors = []
    for color, count in most_common:
        r, g, b = color
        # Skip if too close to white or black
        if not ((r > 240 and g > 240 and b > 240) or (r < 15 and g < 15 and b < 15)):
            filtered_colors.append((color, count))
    
    if filtered_colors:
        primary_color = filtered_colors[0][0]
        print(f"\nPrimary color (excluding white/black): RGB{primary_color} = #{primary_color[0]:02x}{primary_color[1]:02x}{primary_color[2]:02x}")
    else:
        primary_color = most_common[0][0]
        print(f"\nPrimary color: RGB{primary_color} = #{primary_color[0]:02x}{primary_color[1]:02x}{primary_color[2]:02x}")
    
    return most_common, primary_color

def create_icon_ico(logo_path, output_path):
    """Create icon.ico with multiple sizes"""
    print(f"\nCreating {output_path}...")
    
    img = Image.open(logo_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Create multiple sizes
    sizes = [(16, 16), (32, 32), (48, 48), (256, 256)]
    icon_images = []
    
    for size in sizes:
        resized = img.resize(size, Image.Resampling.LANCZOS)
        icon_images.append(resized)
    
    # Save as ICO
    icon_images[0].save(output_path, format='ICO', sizes=[(s[0], s[1]) for s in sizes], append_images=icon_images[1:])
    print(f"✓ Created {output_path} with sizes: {sizes}")

def create_installer_bmp(logo_path, output_path, target_size):
    """Create BMP for installer wizard"""
    print(f"\nCreating {output_path} ({target_size[0]}x{target_size[1]} px)...")
    
    img = Image.open(logo_path)
    
    # Convert to RGB (BMP doesn't support transparency well in Inno Setup)
    if img.mode == 'RGBA':
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
        img = background
    else:
        img = img.convert('RGB')
    
    # Calculate scaling to fit within target size while maintaining aspect ratio
    img_ratio = img.width / img.height
    target_ratio = target_size[0] / target_size[1]
    
    if img_ratio > target_ratio:
        # Image is wider, fit to width
        new_width = target_size[0]
        new_height = int(new_width / img_ratio)
    else:
        # Image is taller, fit to height
        new_height = target_size[1]
        new_width = int(new_height * img_ratio)
    
    # Resize logo
    resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Create canvas with white background
    canvas = Image.new('RGB', target_size, (255, 255, 255))
    
    # Center the logo
    x = (target_size[0] - new_width) // 2
    y = (target_size[1] - new_height) // 2
    canvas.paste(resized, (x, y))
    
    # Save as BMP
    canvas.save(output_path, format='BMP')
    print(f"✓ Created {output_path}")

def main():
    logo_path = 'Logo.png'
    
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found!")
        return
    
    print("=" * 60)
    print("PDF Compressor Installer Asset Creator")
    print("=" * 60)
    
    # 1. Analyze colors
    colors, primary = analyze_logo_colors(logo_path)
    
    # 2. Create icon.ico
    create_icon_ico(logo_path, 'icon.ico')
    
    # 3. Create logo_installer.bmp (164x314 px - Inno Setup wizard sidebar)
    create_installer_bmp(logo_path, 'logo_installer.bmp', (164, 314))
    
    # 4. Create logo_small.bmp (55x58 px - Inno Setup wizard header)
    create_installer_bmp(logo_path, 'logo_small.bmp', (55, 58))
    
    print("\n" + "=" * 60)
    print("✓ All installer assets created successfully!")
    print("=" * 60)
    print("\nFiles created:")
    print("  - icon.ico (16x16, 32x32, 48x48, 256x256)")
    print("  - logo_installer.bmp (164x314 px)")
    print("  - logo_small.bmp (55x58 px)")
    print("\nNext steps:")
    print("  1. Update static/style.css with extracted colors")
    print("  2. Update build_exe.py to use icon.ico")
    print("  3. Create installer.iss")
    print("  4. Create build_installer.bat")

if __name__ == '__main__':
    main()

# Made with Bob
