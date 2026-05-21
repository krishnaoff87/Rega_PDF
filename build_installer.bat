@echo off
REM PDF Compressor Installer Build Script
REM Builds the Windows installer using Inno Setup

echo ============================================================
echo PDF Compressor Installer Builder
echo ============================================================
echo.

REM Check if Inno Setup is installed
set "INNO_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"

if not exist "%INNO_PATH%" (
    echo ERROR: Inno Setup not found at: %INNO_PATH%
    echo.
    echo Please install Inno Setup 6 from:
    echo https://jrsoftware.org/isdl.php
    echo.
    echo After installation, update INNO_PATH in this script if needed.
    pause
    exit /b 1
)

REM Check if dist folder exists
if not exist "dist\PDFCompressor.exe" (
    echo ERROR: dist\PDFCompressor.exe not found!
    echo.
    echo Please build the executable first using:
    echo   python build_exe.py
    echo.
    pause
    exit /b 1
)

REM Check if required assets exist
if not exist "icon.ico" (
    echo ERROR: icon.ico not found!
    echo Please run: python create_installer_assets.py
    pause
    exit /b 1
)

if not exist "logo_installer.bmp" (
    echo ERROR: logo_installer.bmp not found!
    echo Please run: python create_installer_assets.py
    pause
    exit /b 1
)

if not exist "logo_small.bmp" (
    echo ERROR: logo_small.bmp not found!
    echo Please run: python create_installer_assets.py
    pause
    exit /b 1
)

echo All prerequisites found!
echo.
echo Building installer...
echo.

REM Create output directory if it doesn't exist
if not exist "installer_output" mkdir installer_output

REM Compile the installer
"%INNO_PATH%" installer.iss

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo SUCCESS! Installer created successfully!
    echo ============================================================
    echo.
    echo Output location: installer_output\PDFCompressor_Setup_v1.0.0.exe
    echo.
    echo You can now distribute this installer to users.
    echo.
) else (
    echo.
    echo ============================================================
    echo ERROR: Installer build failed!
    echo ============================================================
    echo.
    echo Check the error messages above for details.
    echo.
)

pause

@REM Made with Bob
