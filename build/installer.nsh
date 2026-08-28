!macro customInstall
  ; --- .vke Uzantısı (İşletme & Salon Kiralama Takip Çalışma Dosyası) ---
  WriteRegStr HKCU "Software\Classes\.vke" "" "IsletmeTakipAppPro.Document"
  WriteRegStr HKCU "Software\Classes\.vke" "Content Type" "application/x-vke"
  WriteRegStr HKCU "Software\Classes\.vke\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.vke\ShellNew" "ItemName" "Yeni İşletme & Salon Kiralama Takip Dosyası"
  WriteRegStr HKCU "Software\Classes\.vke\ShellNew" "IconPath" '"$INSTDIR\${PRODUCT_FILENAME}.exe",0'

  ; --- ProgID Tanımı ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\IsletmeTakipAppPro.Document" "" "İşletme & Salon Kiralama Takip Çalışma Dosyası"
  WriteRegStr HKCU "Software\Classes\IsletmeTakipAppPro.Document\DefaultIcon" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe",0'
  WriteRegStr HKCU "Software\Classes\IsletmeTakipAppPro.Document\shell\open\command" "" '"$INSTDIR\${PRODUCT_FILENAME}.exe" "%1"'

  ; --- Windows Explorer kabuk önbelleğini yenile ---
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\.vke"
  DeleteRegKey HKCU "Software\Classes\IsletmeTakipAppPro.Document"
  DeleteRegKey HKCU "Software\Classes\VenueKeeperAppPro.Document"
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
