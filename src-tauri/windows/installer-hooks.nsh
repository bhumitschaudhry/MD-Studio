!macro NSIS_HOOK_POSTINSTALL
  WriteRegStr HKCU "Software\Classes\MDStudio.md" "" "MD Studio Markdown"
  WriteRegStr HKCU "Software\Classes\MDStudio.md\DefaultIcon" "" "$INSTDIR\MD Studio.exe,0"
  WriteRegStr HKCU "Software\Classes\MDStudio.md\shell\open\command" "" '"$INSTDIR\MD Studio.exe" "%1"'

  WriteRegStr HKCU "Software\Classes\Applications\MD Studio.exe" "FriendlyAppName" "MD Studio"
  WriteRegStr HKCU "Software\Classes\Applications\MD Studio.exe\shell\open\command" "" '"$INSTDIR\MD Studio.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\Applications\MD Studio.exe\SupportedTypes" ".md" ""
  WriteRegStr HKCU "Software\Classes\Applications\MD Studio.exe\SupportedTypes" ".markdown" ""
  WriteRegStr HKCU "Software\Classes\Applications\MD Studio.exe\SupportedTypes" ".mdown" ""
  WriteRegStr HKCU "Software\Classes\Applications\MD Studio.exe\SupportedTypes" ".mkd" ""
  WriteRegStr HKCU "Software\Classes\Applications\MD Studio.exe\SupportedTypes" ".mkdn" ""

  WriteRegStr HKCU "Software\MDStudio\Capabilities" "ApplicationName" "MD Studio"
  WriteRegStr HKCU "Software\MDStudio\Capabilities" "ApplicationDescription" "Markdown editor"
  WriteRegStr HKCU "Software\MDStudio\Capabilities\FileAssociations" ".md" "MDStudio.md"
  WriteRegStr HKCU "Software\MDStudio\Capabilities\FileAssociations" ".markdown" "MDStudio.md"
  WriteRegStr HKCU "Software\MDStudio\Capabilities\FileAssociations" ".mdown" "MDStudio.md"
  WriteRegStr HKCU "Software\MDStudio\Capabilities\FileAssociations" ".mkd" "MDStudio.md"
  WriteRegStr HKCU "Software\MDStudio\Capabilities\FileAssociations" ".mkdn" "MDStudio.md"
  WriteRegStr HKCU "Software\RegisteredApplications" "MD Studio" "Software\MDStudio\Capabilities"

  MessageBox MB_YESNO|MB_ICONQUESTION "Associate Markdown files with MD Studio?" IDYES +2
  Goto assoc_done

  WriteRegStr HKCU "Software\Classes\.md" "" "MDStudio.md"
  WriteRegStr HKCU "Software\Classes\.markdown" "" "MDStudio.md"
  WriteRegStr HKCU "Software\Classes\.mdown" "" "MDStudio.md"
  WriteRegStr HKCU "Software\Classes\.mkd" "" "MDStudio.md"
  WriteRegStr HKCU "Software\Classes\.mkdn" "" "MDStudio.md"

  WriteRegStr HKCU "Software\Classes\.md\OpenWithProgids" "MDStudio.md" ""
  WriteRegStr HKCU "Software\Classes\.markdown\OpenWithProgids" "MDStudio.md" ""
  WriteRegStr HKCU "Software\Classes\.mdown\OpenWithProgids" "MDStudio.md" ""
  WriteRegStr HKCU "Software\Classes\.mkd\OpenWithProgids" "MDStudio.md" ""
  WriteRegStr HKCU "Software\Classes\.mkdn\OpenWithProgids" "MDStudio.md" ""

  WriteRegStr HKCU "Software\Classes\.md\OpenWithList\MD Studio.exe" "" ""
  WriteRegStr HKCU "Software\Classes\.markdown\OpenWithList\MD Studio.exe" "" ""
  WriteRegStr HKCU "Software\Classes\.mdown\OpenWithList\MD Studio.exe" "" ""
  WriteRegStr HKCU "Software\Classes\.mkd\OpenWithList\MD Studio.exe" "" ""
  WriteRegStr HKCU "Software\Classes\.mkdn\OpenWithList\MD Studio.exe" "" ""

  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.md\shell\Open with MD Studio" "" "Open with MD Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.md\shell\Open with MD Studio\command" "" '"$INSTDIR\MD Studio.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.markdown\shell\Open with MD Studio" "" "Open with MD Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.markdown\shell\Open with MD Studio\command" "" '"$INSTDIR\MD Studio.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mdown\shell\Open with MD Studio" "" "Open with MD Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mdown\shell\Open with MD Studio\command" "" '"$INSTDIR\MD Studio.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mkd\shell\Open with MD Studio" "" "Open with MD Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mkd\shell\Open with MD Studio\command" "" '"$INSTDIR\MD Studio.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mkdn\shell\Open with MD Studio" "" "Open with MD Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mkdn\shell\Open with MD Studio\command" "" '"$INSTDIR\MD Studio.exe" "%1"'

  assoc_done:
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  DeleteRegKey HKCU "Software\Classes\MDStudio.md"
  DeleteRegKey HKCU "Software\Classes\Applications\MD Studio.exe"
  DeleteRegKey HKCU "Software\MDStudio"
  DeleteRegValue HKCU "Software\RegisteredApplications" "MD Studio"

  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.md\shell\Open with MD Studio"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.markdown\shell\Open with MD Studio"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.mdown\shell\Open with MD Studio"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.mkd\shell\Open with MD Studio"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.mkdn\shell\Open with MD Studio"

  DeleteRegValue HKCU "Software\Classes\.md\OpenWithProgids" "MDStudio.md"
  DeleteRegValue HKCU "Software\Classes\.markdown\OpenWithProgids" "MDStudio.md"
  DeleteRegValue HKCU "Software\Classes\.mdown\OpenWithProgids" "MDStudio.md"
  DeleteRegValue HKCU "Software\Classes\.mkd\OpenWithProgids" "MDStudio.md"
  DeleteRegValue HKCU "Software\Classes\.mkdn\OpenWithProgids" "MDStudio.md"

  DeleteRegKey HKCU "Software\Classes\.md\OpenWithList\MD Studio.exe"
  DeleteRegKey HKCU "Software\Classes\.markdown\OpenWithList\MD Studio.exe"
  DeleteRegKey HKCU "Software\Classes\.mdown\OpenWithList\MD Studio.exe"
  DeleteRegKey HKCU "Software\Classes\.mkd\OpenWithList\MD Studio.exe"
  DeleteRegKey HKCU "Software\Classes\.mkdn\OpenWithList\MD Studio.exe"

  ReadRegStr $0 HKCU "Software\Classes\.md" ""
  StrCmp $0 "MDStudio.md" 0 +2
    DeleteRegValue HKCU "Software\Classes\.md" ""
  ReadRegStr $0 HKCU "Software\Classes\.markdown" ""
  StrCmp $0 "MDStudio.md" 0 +2
    DeleteRegValue HKCU "Software\Classes\.markdown" ""
  ReadRegStr $0 HKCU "Software\Classes\.mdown" ""
  StrCmp $0 "MDStudio.md" 0 +2
    DeleteRegValue HKCU "Software\Classes\.mdown" ""
  ReadRegStr $0 HKCU "Software\Classes\.mkd" ""
  StrCmp $0 "MDStudio.md" 0 +2
    DeleteRegValue HKCU "Software\Classes\.mkd" ""
  ReadRegStr $0 HKCU "Software\Classes\.mkdn" ""
  StrCmp $0 "MDStudio.md" 0 +2
    DeleteRegValue HKCU "Software\Classes\.mkdn" ""
!macroend
