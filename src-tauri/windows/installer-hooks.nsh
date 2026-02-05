!macro NSIS_HOOK_POSTINSTALL
  WriteRegStr HKCU "Software\Classes\MDStudio.md" "" "MD Studio Markdown"
  WriteRegStr HKCU "Software\Classes\MDStudio.md\DefaultIcon" "" "$INSTDIR\MD Studio.exe,0"
  WriteRegStr HKCU "Software\Classes\MDStudio.md\shell\open\command" "" '"$INSTDIR\MD Studio.exe" "%1"'

  WriteRegStr HKCU "Software\Classes\.md" "" "MDStudio.md"
  WriteRegStr HKCU "Software\Classes\.md\OpenWithProgids" "MDStudio.md" ""

  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.md\shell\Open with MD Studio" "" "Open with MD Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.md\shell\Open with MD Studio\command" "" '"$INSTDIR\MD Studio.exe" "%1"'
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  DeleteRegKey HKCU "Software\Classes\MDStudio.md"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.md\shell\Open with MD Studio"
  DeleteRegValue HKCU "Software\Classes\.md\OpenWithProgids" "MDStudio.md"

  ReadRegStr $0 HKCU "Software\Classes\.md" ""
  StrCmp $0 "MDStudio.md" 0 +2
    DeleteRegValue HKCU "Software\Classes\.md" ""
!macroend
