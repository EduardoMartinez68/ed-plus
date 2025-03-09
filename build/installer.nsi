!define productName "PLUS Punto de Venta"
!define COMPANY_NAME "{ED} Software Developer"
!define PRODUCT_VERSION "1.0.0"
!define INSTALL_DIR "$PROGRAMFILES\${productName}"
!define MUI_ICON "build/icon.ico"

!include "MUI2.nsh"

Name "${productName}"
Outfile "dist/${productName}-Installer.exe"
InstallDir "${INSTALL_DIR}"
ShowInstDetails show

Section "Instalar Aplicación"
    SetOutPath "${INSTALL_DIR}"
    File /r "dist\win-unpacked\*"

    ; Crear acceso directo en escritorio
    CreateShortcut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe"

    ; Registrar en "Agregar o quitar programas"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
        "DisplayName" "${PRODUCT_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
        "UninstallString" '"$INSTDIR\Uninstall.exe"'
SectionEnd

Section "Instalar PostgreSQL"
    ; Verifica si PostgreSQL ya está instalado
    ${If} ${RunningX64}
        ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\PostgreSQL 17" "UninstallString"
        ${If} $0 == ""
            SetOutPath "$INSTDIR"
            File "build/installers/postgresql-17.2-3-windows-x64.exe"
            ExecWait '"$INSTDIR\postgresql-17.2-3-windows-x64.exe" --mode unattended --superpassword postgres'
        ${Else}
            DetailPrint "PostgreSQL ya está instalado."
        ${EndIf}
    ${Else}
        DetailPrint "Sistema no compatible con PostgreSQL de 64 bits."
    ${EndIf}
SectionEnd

Section "Instalar Git"
    ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Git" "UninstallString"
    ${If} $0 == ""
        SetOutPath "$INSTDIR"
        File "build/installers/Git-2.48.1-64-bit.exe"
        ExecWait '"$INSTDIR\Git-2.48.1-64-bit.exe" /SILENT'
    ${Else}
        DetailPrint "Git ya está instalado."
    ${EndIf}
SectionEnd

Section "Desinstalar"
    ; Eliminar archivos
    Delete "$INSTDIR\${PRODUCT_NAME}-Installer.exe"
    Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
    RMDir /r "$INSTDIR"

    ; Eliminar registros
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
SectionEnd

Section -Post
    WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd
