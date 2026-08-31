import React, { useEffect, useState, useRef, useMemo } from "react";
import packageJson from "../../../package.json";
import {
  Building2,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  DollarSign,
  FileCode,
  FolderOpen,
  HardDrive,
  LogOut,
  MapPin,
  Minus,
  Moon,
  Plus,
  PlusCircle,
  Save,
  Search,
  Square,
  Sun,
  Trash2,
  User,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavSection, Reservation, Store, Venue } from "@/lib/rental-store";
import { money } from "@/lib/rental-store";

interface AppHeaderProps {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onOpenNewReservation: () => void;
  onOpenTrashModal?: () => void;
  onClose?: () => void;
  appName?: string;
  institutionName?: string;
  institutionSubHeader?: string;
  institutionLogo?: string;
  fileName?: string;
  currentFilePath?: string | null;
  onOpenFile?: () => void;
  onCreateFile?: () => void;
  onSaveAsFile?: () => void;
  onOpenBackupFolder?: () => void;
  onShowLauncher?: () => void;
  store?: Store;
  onNavigateToSection?: (section: NavSection) => void;
  onSelectReservation?: (reservation: Reservation) => void;
}

export function AppHeader({
  theme,
  setTheme,
  searchTerm,
  setSearchTerm,
  onOpenNewReservation,
  onOpenTrashModal,
  onClose,
  appName,
  institutionName,
  institutionSubHeader,
  institutionLogo,
  fileName,
  currentFilePath,
  onOpenFile,
  onCreateFile,
  onSaveAsFile,
  onOpenBackupFolder,
  onShowLauncher,
  store,
  onNavigateToSection,
  onSelectReservation,
}: AppHeaderProps): React.JSX.Element {
  const appVersion = packageJson.version;
  const isDark = theme === "dark";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Global search filtering across venues, reservations, customers, personnel
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || !store) {
      return { venues: [], reservations: [], customers: [], personnel: [], total: 0 };
    }

    // 1. Matched Venues & Halls
    const venues = store.venues.filter((v) => {
      return (
        v.name.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q) ||
        (v.category && v.category.toLowerCase().includes(q)) ||
        (v.address && v.address.toLowerCase().includes(q)) ||
        v.halls.some((h) => h.name.toLowerCase().includes(q))
      );
    });

    // 2. Matched Reservations
    const reservations = store.reservations.filter((r) => {
      return (
        (r.customer || "").toLowerCase().includes(q) ||
        (r.phone && r.phone.includes(q)) ||
        (r.eventType && r.eventType.toLowerCase().includes(q)) ||
        (r.date && r.date.includes(q)) ||
        (r.receiptNo && r.receiptNo.toLowerCase().includes(q)) ||
        (r.note && r.note.toLowerCase().includes(q))
      );
    });

    // 3. Matched Customers (from store.customers)
    const customers = (store.customers || []).filter((c) => {
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.taxNo && c.taxNo.includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q))
      );
    });

    // 4. Matched Personnel (from store.personnel)
    const personnel = (store.personnel || []).filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    });

    const total =
      venues.length + reservations.length + customers.length + personnel.length;

    return { venues, reservations, customers, personnel, total };
  }, [searchTerm, store]);

  const getVenueName = (vId: string) => {
    return store?.venues.find((v) => v.id === vId)?.name || "Mekan";
  };

  const getHallName = (vId: string, hId: string) => {
    const v = store?.venues.find((item) => item.id === vId);
    return v?.halls.find((h) => h.id === hId)?.name || "Salon";
  };

  return (
    <header
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className={`sticky top-0 z-40 border-b flex items-center justify-between px-4 py-2.5 transition-colors select-none shrink-0 ${
        theme === "dark"
          ? "bg-slate-900/90 border-slate-800 backdrop-blur-md"
          : "bg-white/90 border-slate-200 backdrop-blur-md shadow-xs"
      }`}
    >
      {/* Left: Dynamic Institution Name, Logo & Active .vke File Dropdown */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2.5">
          {institutionLogo ? (
            <img
              src={institutionLogo}
              alt="Kurum Logosu"
              className="h-8 w-8 rounded-lg object-contain bg-slate-900/60 p-0.5 border border-indigo-500/30 shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md shrink-0">
              VK
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="max-w-60 sm:max-w-90 md:max-w-120 lg:max-w-155 cursor-default"
                title={`${institutionName ? `${institutionName} • ` : ""}${institutionSubHeader ? `${institutionSubHeader} • ` : ""}${appName || "İşletme & Tesis Takip Otomasyonu"}`}
              >
                <h1 className="font-extrabold text-xs sm:text-sm tracking-tight truncate text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="truncate">
                    {institutionName || appName || "İşletme & Tesis Takip Otomasyonu"}
                  </span>
                </h1>
                {institutionSubHeader && (
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate -mt-0.5">
                    {institutionSubHeader}
                  </p>
                )}
              </div>

              {/* .vke File Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      theme === "dark"
                        ? "bg-indigo-950/50 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 hover:border-indigo-400"
                        : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs"
                    }`}
                    title={currentFilePath || "Aktif Veritabanı"}
                  >
                    <FileCode className="h-3 w-3 text-indigo-500" />
                    <span className="truncate max-w-35">
                      {fileName || "Veritabanı (.vke)"}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={`w-64 p-1.5 rounded-xl border shadow-xl ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Aktif Veri Dosyası (.vke)
                  </DropdownMenuLabel>
                  <div className="px-2 py-1 mb-1 text-[11px] font-mono bg-slate-950/40 rounded-md border border-slate-800/60 break-all">
                    {currentFilePath || "Bellek Üzerinde (Varsayılan)"}
                  </div>

                  <DropdownMenuSeparator
                    className={theme === "dark" ? "bg-slate-800" : "bg-slate-200"}
                  />

                  {onOpenFile && (
                    <DropdownMenuItem
                      onClick={onOpenFile}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                      <span>Farklı .vke Dosyası Aç...</span>
                    </DropdownMenuItem>
                  )}

                  {onCreateFile && (
                    <DropdownMenuItem
                      onClick={onCreateFile}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Yeni .vke Dosyası Oluştur...</span>
                    </DropdownMenuItem>
                  )}

                  {onSaveAsFile && (
                    <DropdownMenuItem
                      onClick={onSaveAsFile}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <Save className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Dosyayı Farklı Kaydet...</span>
                    </DropdownMenuItem>
                  )}

                  {onOpenBackupFolder && (
                    <DropdownMenuItem
                      onClick={onOpenBackupFolder}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <HardDrive className="h-3.5 w-3.5 text-sky-500" />
                      <span>Yedek Klasörünü Aç (Son 7 Yedek)</span>
                    </DropdownMenuItem>
                  )}

                  {onShowLauncher && (
                    <>
                      <DropdownMenuSeparator
                        className={theme === "dark" ? "bg-slate-800" : "bg-slate-200"}
                      />
                      <DropdownMenuItem
                        onClick={onShowLauncher}
                        className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2 text-rose-500 hover:text-rose-400"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Dosyayı Kapat / Başlangıç Ekranı</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Live Global Search Bar & Results Dropdown */}
      <div
        ref={searchContainerRef}
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="relative hidden md:flex items-center max-w-sm lg:max-w-md w-full mx-4"
      >
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="search"
            placeholder="Mekan, salon, müşteri, telefon veya etkinlik ara..."
            value={searchTerm}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            className={`pl-8 pr-7 text-xs h-8 rounded-lg ${
              isDark
                ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                : "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400"
            }`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Aramayı Temizle"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown Overlay */}
        {isSearchOpen && searchTerm.trim().length > 0 && (
          <div
            className={`absolute top-full left-0 right-0 mt-1.5 max-h-[75vh] overflow-y-auto rounded-2xl border shadow-2xl z-50 p-2 space-y-3 ${
              isDark
                ? "bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl"
                : "bg-white/95 border-slate-200 text-slate-900 backdrop-blur-xl"
            }`}
          >
            {/* Header & Result Summary */}
            <div className="flex items-center justify-between px-2 pt-1 pb-1 border-b border-slate-800/40">
              <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                <Search className="h-3 w-3" /> "{searchTerm}" Arama Sonuçları
              </span>
              <Badge variant="outline" className="text-[10px] font-bold">
                {searchResults.total} Kayıt Bulundu
              </Badge>
            </div>

            {searchResults.total === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <p className="text-xs font-semibold text-slate-300">
                  Eşleşen kayıt bulunamadı
                </p>
                <p className="text-[11px] text-slate-500">
                  Mekan adı, salon, müşteri ismi, telefon no veya etkinlik türü yazmayı deneyin.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. MEKANLAR & SALONLAR */}
                {searchResults.venues.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-indigo-400" /> Mekanlar & Salonlar ({searchResults.venues.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.venues.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => {
                            if (onNavigateToSection) onNavigateToSection("venues");
                            setIsSearchOpen(false);
                          }}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isDark
                              ? "bg-slate-950/60 border-slate-800/80 hover:border-indigo-500/50 hover:bg-indigo-950/20"
                              : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 shadow-2xs"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs truncate text-slate-100">
                                {v.name}
                              </span>
                              {v.category && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0">
                                  {v.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5 text-rose-500" /> {v.district}
                              </span>
                              <span>•</span>
                              <span>{v.halls.length} Salon ({v.halls.map((h) => h.name).join(", ")})</span>
                            </div>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-indigo-400 opacity-60 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. ETKİNLİKLER & REZERVASYONLAR */}
                {searchResults.reservations.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3 text-sky-400" /> Rezervasyonlar & Etkinlikler ({searchResults.reservations.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.reservations.slice(0, 8).map((r) => {
                        const vName = getVenueName(r.venueId);
                        const hName = getHallName(r.venueId, r.hallId);
                        return (
                          <div
                            key={r.id}
                            onClick={() => {
                              if (onSelectReservation) onSelectReservation(r);
                              if (onNavigateToSection) onNavigateToSection("events");
                              setIsSearchOpen(false);
                            }}
                            className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                              isDark
                                ? "bg-slate-950/60 border-slate-800/80 hover:border-sky-500/50 hover:bg-sky-950/20"
                                : "bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 shadow-2xs"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 bg-indigo-500/10 text-indigo-400">
                                  {r.date}
                                </Badge>
                                <span className="font-bold text-xs truncate text-slate-100">
                                  {r.customer}
                                </span>
                                <span className="text-[10px] text-sky-400 font-semibold">
                                  • {r.eventType}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>{vName} / {hName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" /> {r.start}-{r.end}
                                </span>
                                {r.phone && <span>• 📞 {r.phone}</span>}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-mono font-bold text-slate-200 block">
                                {money(r.price)}
                              </span>
                              <Badge
                                className={`text-[8px] px-1 py-0 ${
                                  r.status === "confirmed"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : r.status === "option"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-rose-500/20 text-rose-400"
                                }`}
                              >
                                {r.status === "confirmed" ? "Onaylı" : r.status === "option" ? "Opsiyon" : "İptal"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. MÜŞTERİLER (CRM) */}
                {searchResults.customers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 flex items-center gap-1">
                      <Users className="h-3 w-3 text-emerald-400" /> Müşteri Rehberi ({searchResults.customers.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.customers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            if (onNavigateToSection) onNavigateToSection("customers");
                            setIsSearchOpen(false);
                          }}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isDark
                              ? "bg-slate-950/60 border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-950/20"
                              : "bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-2xs"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-xs block text-slate-100">
                              {c.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {c.phone && <span>📞 {c.phone}</span>}
                              {c.email && <span>✉️ {c.email}</span>}
                              {c.company && <span>🏢 {c.company}</span>}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            Rehbere Git
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PERSONEL KADROSU */}
                {searchResults.personnel.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 flex items-center gap-1">
                      <User className="h-3 w-3 text-amber-400" /> Personel Kadrosu ({searchResults.personnel.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.personnel.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (onNavigateToSection) onNavigateToSection("personnel");
                            setIsSearchOpen(false);
                          }}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isDark
                              ? "bg-slate-950/60 border-slate-800/80 hover:border-amber-500/50 hover:bg-amber-950/20"
                              : "bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 shadow-2xs"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-100">{p.name}</span>
                              {p.title && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0">
                                  {p.title}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {p.phone && <span>📞 {p.phone}</span>}
                              {p.email && <span>✉️ {p.email}</span>}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            Personele Git
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Keyboard Shortcut Hint */}
            <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>💡 İlgili kayda tıklayarak detay sayfasına gidin</span>
              <span>ESC Kapat</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions, Theme Switcher & Electron Window Controls */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-2"
      >
        <Button
          onClick={onOpenNewReservation}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-sm flex items-center gap-1 px-3"
        >
          <Plus className="h-4 w-4" /> Etkinlik Ekle
        </Button>

        {onOpenTrashModal && (
          <Button
            size="icon"
            variant="outline"
            onClick={onOpenTrashModal}
            className={`h-8 w-8 rounded-lg ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 shadow-2xs"
            }`}
            title="Geri Dönüşüm Kutusu (Silinen Kayıtlar)"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          size="icon"
          variant="outline"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`h-8 w-8 rounded-lg ${
            theme === "dark"
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 shadow-2xs"
          }`}
          title={theme === "dark" ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-indigo-600" />
          )}
        </Button>

        {/* Electron Window Minimize / Maximize / Close Buttons */}
        <div className="flex items-center gap-1 pl-1 ml-1 border-l border-slate-700/40">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => (window.electronAPI as any)?.minimizeWindow?.()}
            className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Küçült"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => (window.electronAPI as any)?.maximizeWindow?.()}
            className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Ekranı Kapla"
          >
            <Square className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => (onClose ? onClose() : (window.electronAPI as any)?.closeWindow?.())}
            className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
            title="Kapat"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
