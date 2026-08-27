!macro customInstall
  ; --- .vke Uzantısı (VenueKeeper Enterprise Document) ---
  WriteRegStr HKCU "Software\Classes\.vke" "" "VenueKeeperAppPro.Document"
  WriteRegStr HKCU "Software\Classes\.vke" "Content Type" "application/x-vke"
  WriteRegStr HKCU "Software\Classes\.vke\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.vke\ShellNew" "ItemName" "VenueKeeper Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\.vke\ShellNew" "IconPath" '"$INSTDIR\VenueKeeper App Pro.exe",0'

  ; --- ProgID Tanımı ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\VenueKeeperAppPro.Document" "" "VenueKeeper App Pro Çalışma Dosyası"
  WriteRegStr HKCU "Software\Classes\VenueKeeperAppPro.Document\DefaultIcon" "" '"$INSTDIR\VenueKeeper App Pro.exe",0'
  WriteRegStr HKCU "Software\Classes\VenueKeeperAppPro.Document\shell\open\command" "" '"$INSTDIR\VenueKeeper App Pro.exe" "%1"'

  ; --- Windows Explorer kabuk önbelleğini yenile ---
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\.vke"
  DeleteRegKey HKCU "Software\Classes\VenueKeeperAppPro.Document"
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
