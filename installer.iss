; PDF Compressor Installer Script
; Created with Inno Setup 6.x
; Professional Windows installer with logo branding

#define MyAppName "REGA PDF Compressor"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Bob's Software"
#define MyAppURL "https://github.com/yourusername/pdf-compressor"
#define MyAppExeName "PDFCompressor.exe"

[Setup]
; Basic Information
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Installation Directories
DefaultDirName={autopf}\REGApdfcompressor
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Output Configuration
OutputDir=installer_output
OutputBaseFilename=PDFCompressor_Setup_v{#MyAppVersion}
Compression=lzma2/max
SolidCompression=yes

; Branding - Using created assets
SetupIconFile=icon.ico
WizardImageFile=logo_installer.bmp
WizardSmallImageFile=logo_small.bmp

; Visual Style
WizardStyle=modern
WizardResizable=no
DisableWelcomePage=no

; Privileges
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog

; Architecture
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

; Uninstall
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Main Application (folder contents)
Source: "dist\PDFCompressor\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Logo for application
Source: "Logo.png"; DestDir: "{app}"; Flags: ignoreversion
; Icon file
Source: "icon.ico"; DestDir: "{app}"; Flags: ignoreversion
; README
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme

[Icons]
; Start Menu
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\icon.ico"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
; Desktop Icon (optional, based on task selection)
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\icon.ico"

[Run]
; Option to launch application after installation
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
// Custom welcome message
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

// Custom finish message
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Any post-installation tasks can be added here
  end;
end;