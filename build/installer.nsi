!define PRODUCT_NAME "PLUS Punto de Venta"
!define COMPANY_NAME "{ED} Software Developer"
!define PRODUCT_VERSION "1.0.0"
!define INSTALL_DIR "$PROGRAMFILES\${PRODUCT_NAME}"
!define MUI_ICON "build/icon.ico"

!include "MUI2.nsh"

Name "${PRODUCT_NAME}"
Outfile "dist/${PRODUCT_NAME}-Installer.exe"
InstallDir "${INSTALL_DIR}"
ShowInstDetails show

Section "Instalar Aplicación"
    SetOutPath "${INSTALL_DIR}"
    File /r "dist\win-unpacked\*"
SectionEnd

Section "Instalar PostgreSQL"
    SetOutPath "$INSTDIR"
    File "build/installers/postgresql-17.2-3-windows-x64.exe"
    ExecWait '"$INSTDIR\postgresql-17.2-3-windows-x64.exe" --mode unattended --superpassword postgres'
SectionEnd

Section "Instalar Git"
    SetOutPath "$INSTDIR"
    File "build/installers/Git-2.48.1-64-bit.exe"
    ExecWait '"$INSTDIR\Git-2.48.1-64-bit.exe" /SILENT'
SectionEnd

Section "Desinstalar"
    Delete "$INSTDIR\${PRODUCT_NAME}-Installer.exe"
    Delete "$DESKTOP\${APPNAME}.lnk"
    RMDir /r "$INSTDIR"
SectionEnd

Section -Post
    WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd
