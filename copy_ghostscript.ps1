# PowerShell Script to Copy Ghostscript from System Installation
# Copies required files from existing Ghostscript installation to project folder

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Copy Ghostscript from System Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Common Ghostscript installation paths
$possiblePaths = @(
    "C:\Program Files\gs\gs*\bin",
    "C:\Program Files (x86)\gs\gs*\bin",
    "$env:ProgramFiles\gs\gs*\bin",
    "${env:ProgramFiles(x86)}\gs\gs*\bin"
)

# Find Ghostscript installation
Write-Host "Searching for Ghostscript installation..." -ForegroundColor Yellow
$gsFound = $false
$gsBinPath = $null
$gsLibPath = $null

foreach ($path in $possiblePaths) {
    $resolved = Resolve-Path $path -ErrorAction SilentlyContinue
    if ($resolved) {
        $gsBinPath = $resolved.Path
        # Get parent directory and look for lib
        $gsRoot = Split-Path (Split-Path $gsBinPath -Parent) -Parent
        $gsLibPath = Join-Path $gsRoot "lib"
        
        if (Test-Path (Join-Path $gsBinPath "gswin64c.exe")) {
            Write-Host "[OK] Found Ghostscript at: $gsBinPath" -ForegroundColor Green
            $gsFound = $true
            break
        }
    }
}

if (-not $gsFound) {
    Write-Host "[X] Ghostscript not found in standard locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please provide the path to your Ghostscript bin directory:" -ForegroundColor Yellow
    Write-Host "Example: C:\Program Files\gs\gs10.02.1\bin" -ForegroundColor Gray
    Write-Host ""
    $customPath = Read-Host "Enter path (or press Enter to exit)"
    
    if ([string]::IsNullOrWhiteSpace($customPath)) {
        Write-Host "Cancelled." -ForegroundColor Red
        exit 1
    }
    
    if (Test-Path (Join-Path $customPath "gswin64c.exe")) {
        $gsBinPath = $customPath
        $gsRoot = Split-Path (Split-Path $gsBinPath -Parent) -Parent
        $gsLibPath = Join-Path $gsRoot "lib"
        $gsFound = $true
        Write-Host "[OK] Found Ghostscript at: $gsBinPath" -ForegroundColor Green
    } else {
        Write-Host "[X] gswin64c.exe not found at specified path" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Create target directory
$targetPath = ".\ghostscript"
Write-Host "Creating target directory..." -ForegroundColor Yellow
if (Test-Path $targetPath) {
    Write-Host "Cleaning existing directory..." -ForegroundColor Gray
    Remove-Item -Path $targetPath -Recurse -Force
}
New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
Write-Host "[OK] Created: $targetPath" -ForegroundColor Green
Write-Host ""

# Copy bin files
Write-Host "Copying Ghostscript binaries..." -ForegroundColor Yellow
try {
    Copy-Item -Path "$gsBinPath\*" -Destination $targetPath -Recurse -Force
    $fileCount = (Get-ChildItem -Path $targetPath -File).Count
    Write-Host "[OK] Copied $fileCount files from bin directory" -ForegroundColor Green
} catch {
    Write-Host "[X] Failed to copy bin files: $_" -ForegroundColor Red
    exit 1
}

# Copy lib folder if exists
if (Test-Path $gsLibPath) {
    Write-Host "Copying PostScript libraries..." -ForegroundColor Yellow
    try {
        Copy-Item -Path $gsLibPath -Destination "$targetPath\lib" -Recurse -Force
        $libCount = (Get-ChildItem -Path "$targetPath\lib" -Recurse -File).Count
        Write-Host "[OK] Copied $libCount library files" -ForegroundColor Green
    } catch {
        Write-Host "[X] Failed to copy lib files: $_" -ForegroundColor Red
    }
} else {
    Write-Host "[!] Warning: lib directory not found at $gsLibPath" -ForegroundColor Yellow
}

Write-Host ""

# Verify installation
Write-Host "Verifying copied files..." -ForegroundColor Yellow
$gsExe = Join-Path $targetPath "gswin64c.exe"
$gsDll = Join-Path $targetPath "gsdll64.dll"

$allGood = $true

if (Test-Path $gsExe) {
    $size = [math]::Round((Get-Item $gsExe).Length / 1KB, 0)
    Write-Host "[OK] gswin64c.exe ($size KB)" -ForegroundColor Green
} else {
    Write-Host "[X] gswin64c.exe NOT found" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path $gsDll) {
    $size = [math]::Round((Get-Item $gsDll).Length / 1KB, 0)
    Write-Host "[OK] gsdll64.dll ($size KB)" -ForegroundColor Green
} else {
    Write-Host "[X] gsdll64.dll NOT found" -ForegroundColor Red
    $allGood = $false
}

$dllCount = (Get-ChildItem -Path $targetPath -Filter "*.dll" -File).Count
Write-Host "[OK] Total DLL files: $dllCount" -ForegroundColor Green

if (Test-Path "$targetPath\lib") {
    $libCount = (Get-ChildItem -Path "$targetPath\lib" -Recurse -File).Count
    Write-Host "[OK] Library files: $libCount" -ForegroundColor Green
}

Write-Host ""

# Final status
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "SUCCESS! Ghostscript is ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next step: python build_exe.py" -ForegroundColor Cyan
} else {
    Write-Host "INCOMPLETE! Some files are missing" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please ensure gswin64c.exe and gsdll64.dll exist in:" -ForegroundColor Yellow
    Write-Host "$targetPath" -ForegroundColor Gray
}
Write-Host ""

# Made with Bob