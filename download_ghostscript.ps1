# PowerShell Script to Download and Extract Ghostscript for PDF Compressor
# This script downloads Ghostscript 10.02.1 (64-bit) and extracts required files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ghostscript Downloader for PDF Compressor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$gsVersion = "10.02.1"
$gsUrl = "https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10021/gs10021w64.exe"
$downloadPath = "$env:TEMP\gs_installer.exe"
$extractPath = "$env:TEMP\gs_extract"
$targetPath = ".\ghostscript"

# Create target directory
Write-Host "[1/5] Creating ghostscript directory..." -ForegroundColor Yellow
if (Test-Path $targetPath) {
    Write-Host "      Directory already exists, cleaning..." -ForegroundColor Gray
    Remove-Item -Path $targetPath -Recurse -Force
}
New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
Write-Host "      [OK] Created: $targetPath" -ForegroundColor Green
Write-Host ""

# Download Ghostscript installer
Write-Host "[2/5] Downloading Ghostscript $gsVersion (64-bit)..." -ForegroundColor Yellow
Write-Host "      URL: $gsUrl" -ForegroundColor Gray
try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $gsUrl -OutFile $downloadPath -UseBasicParsing
    $sizeMB = [math]::Round((Get-Item $downloadPath).Length / 1MB, 2)
    Write-Host "      [OK] Downloaded: $sizeMB MB" -ForegroundColor Green
} catch {
    Write-Host "      [X] Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually from:" -ForegroundColor Yellow
    Write-Host "https://ghostscript.com/releases/gsdnld.html" -ForegroundColor Cyan
    exit 1
}
Write-Host ""

# Extract installer (using 7-Zip if available, otherwise manual extraction needed)
Write-Host "[3/5] Extracting Ghostscript installer..." -ForegroundColor Yellow
if (Test-Path $extractPath) {
    Remove-Item -Path $extractPath -Recurse -Force
}
New-Item -ItemType Directory -Path $extractPath -Force | Out-Null

# Try to extract using built-in Windows methods
try {
    # Run installer in silent mode to extract
    Write-Host "      Running installer in extract mode..." -ForegroundColor Gray
    Start-Process -FilePath $downloadPath -ArgumentList "/S", "/D=$extractPath" -Wait -NoNewWindow
    
    # Wait a moment for extraction
    Start-Sleep -Seconds 2
    
    if (Test-Path "$extractPath\bin") {
        Write-Host "      [OK] Extracted successfully" -ForegroundColor Green
    } else {
        throw "Extraction failed - bin directory not found"
    }
} catch {
    Write-Host "      [X] Automatic extraction failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual extraction required:" -ForegroundColor Yellow
    Write-Host "1. Run the installer: $downloadPath" -ForegroundColor Cyan
    Write-Host "2. Install to: $extractPath" -ForegroundColor Cyan
    Write-Host "3. Press Enter when installation is complete..." -ForegroundColor Cyan
    Read-Host
}
Write-Host ""

# Copy required files
Write-Host "[4/5] Copying required files to ghostscript folder..." -ForegroundColor Yellow

# Find the bin directory (might be in a subdirectory)
$binPath = Get-ChildItem -Path $extractPath -Filter "bin" -Recurse -Directory | Select-Object -First 1
$libPath = Get-ChildItem -Path $extractPath -Filter "lib" -Recurse -Directory | Select-Object -First 1

if ($binPath) {
    Write-Host "      Found bin directory: $($binPath.FullName)" -ForegroundColor Gray
    
    # Copy all files from bin
    Copy-Item -Path "$($binPath.FullName)\*" -Destination $targetPath -Recurse -Force
    Write-Host "      [OK] Copied executables and DLLs" -ForegroundColor Green
} else {
    Write-Host "      [X] Could not find bin directory" -ForegroundColor Red
}

if ($libPath) {
    Write-Host "      Found lib directory: $($libPath.FullName)" -ForegroundColor Gray
    
    # Copy lib folder
    Copy-Item -Path $libPath.FullName -Destination "$targetPath\lib" -Recurse -Force
    Write-Host "      [OK] Copied PostScript libraries" -ForegroundColor Green
} else {
    Write-Host "      [X] Could not find lib directory" -ForegroundColor Red
}
Write-Host ""

# Verify installation
Write-Host "[5/5] Verifying installation..." -ForegroundColor Yellow
$gsExe = Join-Path $targetPath "gswin64c.exe"
$gsDll = Join-Path $targetPath "gsdll64.dll"

$allGood = $true

if (Test-Path $gsExe) {
    $size = (Get-Item $gsExe).Length / 1KB
    Write-Host "      [OK] gswin64c.exe found ($([math]::Round($size, 0)) KB)" -ForegroundColor Green
} else {
    Write-Host "      [X] gswin64c.exe NOT found" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path $gsDll) {
    $size = (Get-Item $gsDll).Length / 1KB
    Write-Host "      [OK] gsdll64.dll found ($([math]::Round($size, 0)) KB)" -ForegroundColor Green
} else {
    Write-Host "      [X] gsdll64.dll NOT found" -ForegroundColor Red
    $allGood = $false
}

$dllCount = (Get-ChildItem -Path $targetPath -Filter "*.dll" -File).Count
Write-Host "      [OK] Found $dllCount DLL files" -ForegroundColor Green

if (Test-Path "$targetPath\lib") {
    $libCount = (Get-ChildItem -Path "$targetPath\lib" -Recurse -File).Count
    Write-Host "      [OK] Found $libCount library files" -ForegroundColor Green
} else {
    Write-Host "      [X] lib directory NOT found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Cleanup
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
if (Test-Path $downloadPath) {
    Remove-Item -Path $downloadPath -Force
}
if (Test-Path $extractPath) {
    Remove-Item -Path $extractPath -Recurse -Force
}
Write-Host "[OK] Cleanup complete" -ForegroundColor Green
Write-Host ""

# Final status
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "SUCCESS! Ghostscript is ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now run: python build_exe.py" -ForegroundColor Cyan
} else {
    Write-Host "INCOMPLETE! Some files are missing" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please check the ghostscript folder and ensure:" -ForegroundColor Yellow
    Write-Host "  - gswin64c.exe exists" -ForegroundColor Gray
    Write-Host "  - gsdll64.dll exists" -ForegroundColor Gray
    Write-Host "  - lib/ folder exists with PostScript libraries" -ForegroundColor Gray
    Write-Host ""
    Write-Host "You may need to manually copy files from:" -ForegroundColor Yellow
    Write-Host "C:\Program Files\gs\gs$gsVersion\bin\" -ForegroundColor Cyan
}
Write-Host ""

# Made with Bob
