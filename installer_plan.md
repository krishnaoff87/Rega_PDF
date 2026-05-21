# PDF Compressor Installer Plan

## Goal
Create professional Windows installer with:
- Logo branding throughout
- Desktop shortcut with icon
- Start Menu entry
- Proper installation wizard
- UI matching logo colors

---

## Installer Approach

### Option 1: Inno Setup (Recommended)
**Pros:**
- Free, professional Windows installers
- Custom branding support
- Desktop/Start Menu shortcuts
- Uninstaller included
- Small installer size
- Easy scripting

**Cons:**
- Requires Inno Setup installed to build

### Option 2: NSIS
**Pros:**
- Free, highly customizable
- Professional results

**Cons:**
- More complex scripting
- Steeper learning curve

**Decision:** Use Inno Setup for ease and professionalism

---

## Implementation Steps

### 1. Analyze Logo.png
- Extract color palette
- Identify primary/secondary colors
- Determine design style

### 2. Create Icon Files
- Convert Logo.png → icon.ico (for EXE)
- Multiple sizes: 16x16, 32x32, 48x48, 256x256

### 3. Update UI Colors
- Match glassmorphism theme to logo
- Update CSS color scheme
- Maintain accessibility

### 4. Create Inno Setup Script
**installer.iss:**
```
[Setup]
AppName=PDF Compressor
AppVersion=1.0
DefaultDirName={pf}\PDF Compressor
DefaultGroupName=PDF Compressor
OutputDir=installer_output
OutputBaseFilename=PDFCompressor_Setup
SetupIconFile=icon.ico
WizardImageFile=logo_installer.bmp
WizardSmallImageFile=logo_small.bmp

[Files]
Source: "dist\PDFCompressor.exe"; DestDir: "{app}"
Source: "Logo.png"; DestDir: "{app}"

[Icons]
Name: "{userdesktop}\PDF Compressor"; Filename: "{app}\PDFCompressor.exe"; IconFilename: "{app}\icon.ico"
Name: "{group}\PDF Compressor"; Filename: "{app}\PDFCompressor.exe"
Name: "{group}\Uninstall PDF Compressor"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\PDFCompressor.exe"; Description: "Launch PDF Compressor"; Flags: postinstall nowait skipifsilent
```

### 5. Prepare Installer Assets
- icon.ico (app icon)
- logo_installer.bmp (164x314 px, wizard sidebar)
- logo_small.bmp (55x58 px, wizard header)

### 6. Build Process
```bash
# 1. Build EXE
python build_exe.py

# 2. Compile installer
iscc installer.iss

# Output: installer_output/PDFCompressor_Setup.exe
```

---

## Installer Features

**Installation Steps:**
1. Welcome screen (with logo)
2. License agreement (optional)
3. Installation directory selection
4. Start Menu folder selection
5. Desktop shortcut option (checked by default)
6. Installation progress
7. Completion screen with "Launch" option

**Post-Install:**
- Desktop shortcut created
- Start Menu entry created
- Uninstaller registered in Windows
- App ready to launch

---

## UI Color Update Strategy

**After analyzing Logo.png:**
1. Extract dominant colors
2. Update CSS variables:
   - Primary color
   - Secondary color
   - Accent color
   - Background gradient
3. Maintain glassmorphism effect
4. Ensure text contrast (WCAG AA)

---

## File Structure After Changes

```
pdf-compressor/
├── Logo.png (existing)
├── icon.ico (new)
├── logo_installer.bmp (new)
├── logo_small.bmp (new)
├── installer.iss (new)
├── build_installer.bat (new)
├── installer_output/ (new)
│   └── PDFCompressor_Setup.exe
└── [existing files...]
```

---

## Next Actions

1. Read Logo.png to analyze colors
2. Create icon files from logo
3. Update UI CSS with logo colors
4. Create Inno Setup script
5. Build installer
6. Test installation flow