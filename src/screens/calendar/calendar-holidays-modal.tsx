import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileUp,
  Globe,
  HelpCircle,
  Info,
  Loader2,
  Moon,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  type HolidayInfo,
  type HolidayType,
  type CalendarSystemType,
  getHolidaysForYear,
  getCustomHolidaysFromStorage,
  saveCustomHolidaysToStorage,
  getDisabledHolidaysFromStorage,
  saveDisabledHolidaysToStorage,
  resetHolidaysToDefault,
  fetchOnlineHolidays,
  fetchGoogleCalendarICS,
  parseICSContent,
  getHijriDateString,
  GOOGLE_CALENDAR_TR_ICS_URL,
} from "@/lib/holidays";

interface CalendarHolidaysModalProps {
  theme: "dark" | "light";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialYear?: number;
  onHolidaysUpdated?: () => void;
}

const EMOJI_OPTIONS = [
  "🇹🇷",
  "🌙",
  "🍬",
  "🐑",
  "🎉",
  "👷",
  "🕊️",
  "🏛️",
  "🏖️",
  "📌",
  "⭐",
  "🏢",
  "🕌",
  "🕋",
];

export const CalendarHolidaysModal: React.FC<CalendarHolidaysModalProps> = ({
  theme,
  isOpen,
  onOpenChange,
  initialYear = new Date().getFullYear(),
  onHolidaysUpdated,
}) => {
  const isDark = theme === "dark";
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [holidays, setHolidays] = useState<HolidayInfo[]>([]);
  const [disabledKeys, setDisabledKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarFilter, setCalendarFilter] = useState<"all" | "miladi" | "hicri" | "custom">("all");
  const [isLoadingWeb, setIsLoadingWeb] = useState(false);
  const [isLoadingGoogleICS, setIsLoadingGoogleICS] = useState(false);

  // ICS Import Drawer / Modal
  const [isIcsImportOpen, setIsIcsImportOpen] = useState(false);
  const [icsCustomUrl, setIcsCustomUrl] = useState(GOOGLE_CALENDAR_TR_ICS_URL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hijri Converter Tool in Modal
  const [converterDate, setConverterDate] = useState<string>(
    `${initialYear}-03-20`
  );

  // Form State for Adding / Editing Custom Holiday
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [formDate, setFormDate] = useState<string>("");
  const [formTitle, setFormTitle] = useState("");
  const [formShortTitle, setFormShortTitle] = useState("");
  const [formType, setFormType] = useState<HolidayType>("national");
  const [formCalendarType, setFormCalendarType] = useState<CalendarSystemType>("miladi");
  const [formIcon, setFormIcon] = useState("🇹🇷");
  const [formIsOffDay, setFormIsOffDay] = useState(true);
  const [formIsHalfDay, setFormIsHalfDay] = useState(false);
  const [formDescription, setFormDescription] = useState("");

  const refreshList = () => {
    const list = getHolidaysForYear(selectedYear);
    setHolidays(list);
    setDisabledKeys(getDisabledHolidaysFromStorage());
    onHolidaysUpdated?.();
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen, selectedYear]);

  // Google Calendar ICS Live Fetch & Sync
  const handleFetchGoogleICS = async () => {
    setIsLoadingGoogleICS(true);
    toast.loading(`Google Takvim (iCal ICS) resmi tatil verileri alınıyor...`, {
      id: "fetch-google-ics",
    });
    try {
      const fetched = await fetchGoogleCalendarICS(selectedYear);
      if (fetched.length > 0) {
        toast.success(
          `📅 Google Takvim ICS üzerinden ${selectedYear} yılına ait ${fetched.length} tatil teyit edildi ve güncellendi!`,
          { id: "fetch-google-ics" }
        );
        refreshList();
      } else {
        toast.info(
          `Google Takvim verisi alındı, yerel Diyanet & Resmi Gazete şablonu aktif.`,
          { id: "fetch-google-ics" }
        );
        refreshList();
      }
    } catch (err) {
      toast.error("Google ICS verisi alınırken hata oluştu. Varsayılan veri korunuyor.", {
        id: "fetch-google-ics",
      });
    } finally {
      setIsLoadingGoogleICS(false);
    }
  };

  // Online Fetch from takvim.com
  const handleFetchOnline = async () => {
    setIsLoadingWeb(true);
    toast.loading(`${selectedYear} yılı resmi tatilleri takvim.com'dan alınıyor...`, {
      id: "fetch-holidays",
    });
    try {
      const fetched = await fetchOnlineHolidays(selectedYear);
      if (fetched.length > 0) {
        toast.success(
          `🌐 ${selectedYear} yılı için ${fetched.length} adet resmi tatil takvim.com üzerinden çekildi!`,
          { id: "fetch-holidays" }
        );
        refreshList();
      } else {
        toast.info(
          `${selectedYear} yılı için standart resmi takvim verileri kullanıma hazır.`,
          { id: "fetch-holidays" }
        );
        refreshList();
      }
    } catch (err) {
      toast.error("Veri çekilirken bir hata oluştu. Varsayılan veriler kullanılıyor.", {
        id: "fetch-holidays",
      });
    } finally {
      setIsLoadingWeb(false);
    }
  };

  // Import custom ICS from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseICSContent(text, selectedYear);
        if (parsed.length > 0) {
          const currentCustom = getCustomHolidaysFromStorage();
          const merged = [...currentCustom];

          for (const item of parsed) {
            const existingIdx = merged.findIndex((m) => m.date === item.date);
            if (existingIdx >= 0) {
              merged[existingIdx] = { ...item, isCustom: true };
            } else {
              merged.push({ ...item, isCustom: true });
            }
          }

          saveCustomHolidaysToStorage(merged);
          toast.success(
            `📁 .ics dosyasından ${parsed.length} adet tatil başarıyla içe aktarıldı!`
          );
          setIsIcsImportOpen(false);
          refreshList();
        } else {
          toast.warning("Dosyada geçerli VEVENT tatil kaydı bulunamadı.");
        }
      } catch (err) {
        toast.error(".ics dosyası okunurken hata oluştu.");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  // Import ICS from Custom URL
  const handleImportFromUrl = async () => {
    if (!icsCustomUrl.trim()) return;
    try {
      toast.loading("ICS takvim bağlantısı sorgulanıyor...", { id: "import-url" });
      const res = await fetch(icsCustomUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseICSContent(text, selectedYear);

      if (parsed.length > 0) {
        const currentCustom = getCustomHolidaysFromStorage();
        const merged = [...currentCustom];

        for (const item of parsed) {
          const existingIdx = merged.findIndex((m) => m.date === item.date);
          if (existingIdx >= 0) {
            merged[existingIdx] = { ...item, isCustom: true };
          } else {
            merged.push({ ...item, isCustom: true });
          }
        }

        saveCustomHolidaysToStorage(merged);
        toast.success(`🌐 ${parsed.length} adet tatil kaydı içe aktarıldı!`, {
          id: "import-url",
        });
        setIsIcsImportOpen(false);
        refreshList();
      } else {
        toast.warning("URL içeriğinde bu yıla ait kayıt bulunamadı.", {
          id: "import-url",
        });
      }
    } catch (err) {
      toast.error("Bağlantıdan ICS okunamadı (CORS veya geçersiz URL).", {
        id: "import-url",
      });
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        `${selectedYear} yılına ait tüm tatil özelleştirmeleri sıfırlanıp resmi Diyanet & Miladi varsayılan şablonuna dönülecektir. Onaylıyor musunuz?`
      )
    ) {
      resetHolidaysToDefault(selectedYear);
      toast.success(`${selectedYear} yılı tatilleri varsayılan ayarlara döndürüldü.`);
      refreshList();
    }
  };

  // Toggle Enable / Disable
  const handleToggleDisabled = (dateStr: string) => {
    const current = getDisabledHolidaysFromStorage();
    let next: string[];
    if (current.includes(dateStr)) {
      next = current.filter((d) => d !== dateStr);
      toast.success(`Tatil aktif hale getirildi.`);
    } else {
      next = [...current, dateStr];
      toast.info(`Tatil bu yıl için devre dışı bırakıldı.`);
    }
    saveDisabledHolidaysToStorage(next);
    refreshList();
  };

  // Open Form for New Holiday
  const handleOpenAddForm = () => {
    setEditingDate(null);
    setFormDate(`${selectedYear}-01-01`);
    setFormTitle("");
    setFormShortTitle("");
    setFormType("national");
    setFormCalendarType("miladi");
    setFormIcon("🇹🇷");
    setFormIsOffDay(true);
    setFormIsHalfDay(false);
    setFormDescription("");
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (h: HolidayInfo) => {
    setEditingDate(h.date);
    setFormDate(h.date);
    setFormTitle(h.title);
    setFormShortTitle(h.shortTitle || "");
    setFormType(h.type);
    setFormCalendarType(h.calendarType || (h.type === "religious" ? "hicri" : "miladi"));
    setFormIcon(h.icon || (h.type === "religious" ? "🌙" : "🇹🇷"));
    setFormIsOffDay(h.isOffDay);
    setFormIsHalfDay(!!h.isHalfDay);
    setFormDescription(h.description || "");
    setIsFormOpen(true);
  };

  // Save Custom Holiday
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formTitle.trim()) {
      toast.error("Lütfen geçerli bir tarih ve tatil başlığı girin.");
      return;
    }

    const hijriInfo = getHijriDateString(formDate);

    const customList = getCustomHolidaysFromStorage().filter(
      (h) => h.date !== (editingDate || formDate)
    );

    const newHoliday: HolidayInfo = {
      date: formDate,
      title: formTitle.trim(),
      shortTitle: formShortTitle.trim() || formTitle.trim(),
      type: formType,
      calendarType: formCalendarType,
      hijriDetail: formCalendarType === "hicri" ? hijriInfo.formattedDisplay : undefined,
      isOffDay: formIsOffDay,
      isHalfDay: formIsHalfDay,
      icon: formIcon,
      description: formDescription.trim(),
      isCustom: true,
      source: "user_custom",
      isVerified: true,
    };

    customList.push(newHoliday);
    saveCustomHolidaysToStorage(customList);
    toast.success(`"${newHoliday.title}" tatil kaydı başarıyla kaydedildi.`);
    setIsFormOpen(false);
    refreshList();
  };

  // Delete Custom Holiday
  const handleDeleteCustom = (dateStr: string) => {
    const customList = getCustomHolidaysFromStorage().filter(
      (h) => h.date !== dateStr
    );
    saveCustomHolidaysToStorage(customList);
    toast.info("Özel tatil kaydı silindi.");
    refreshList();
  };

  // Counts
  const miladiCount = holidays.filter((h) => (h.calendarType || (h.type === "religious" ? "hicri" : "miladi")) === "miladi").length;
  const hicriCount = holidays.filter((h) => (h.calendarType || (h.type === "religious" ? "hicri" : "miladi")) === "hicri").length;
  const customCount = holidays.filter((h) => h.isCustom || getCustomHolidaysFromStorage().some((c) => c.date === h.date)).length;

  const filteredHolidays = holidays.filter((h) => {
    const calType = h.calendarType || (h.type === "religious" ? "hicri" : "miladi");

    if (calendarFilter === "miladi" && calType !== "miladi") return false;
    if (calendarFilter === "hicri" && calType !== "hicri") return false;
    if (calendarFilter === "custom" && !h.isCustom && !getCustomHolidaysFromStorage().some((c) => c.date === h.date)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.title.toLowerCase().includes(q) ||
      h.date.includes(q) ||
      (h.shortTitle && h.shortTitle.toLowerCase().includes(q)) ||
      (h.hijriDetail && h.hijriDetail.toLowerCase().includes(q))
    );
  });

  const convertedInfo = getHijriDateString(converterDate);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-6 rounded-2xl ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-2xl"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-black flex items-center gap-2">
                <span className="text-xl">🇹🇷</span>
                <span>Resmi Tatiller, Dini Bayramlar & Takvim Yönetimi</span>
                <Badge className="bg-rose-600 text-white text-xs px-2 py-0.5 font-bold ml-1">
                  {selectedYear} Yılı ({filteredHolidays.length} Kayıt)
                </Badge>
              </DialogTitle>
              <DialogDescription
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-600 font-medium"
                }`}
              >
                Miladi ulusal bayramlar, Hicri dini bayramlar (Diyanet & Google ICS teyitli) ve kurumsal özel izinleri yönetin.
              </DialogDescription>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Dönem Yılı:</span>
              <Select
                value={String(selectedYear)}
                onValueChange={(val) => {
                  setSelectedYear(Number(val));
                  setConverterDate(`${val}-03-20`);
                }}
              >
                <SelectTrigger
                  className={`w-28 text-xs h-8 font-bold font-mono ${
                    isDark
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => 2024 + i).map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y} Yılı
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Actions & Verification Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Input
                placeholder="Tatil, Hicri veya tarih ara (Örn: Ramazan, 29 Ekim, Şevval)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-8 text-xs ${
                  isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-300"
                }`}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Google ICS Fetch */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleFetchGoogleICS}
                disabled={isLoadingGoogleICS}
                className={`h-8 text-xs font-semibold gap-1.5 cursor-pointer ${
                  isDark
                    ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30"
                    : "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                }`}
                title="Google Calendar resmi Türkiye tatilleri iCal (.ics) akışını çekip doğrula"
              >
                {isLoadingGoogleICS ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                )}
                <span>Google iCal (ICS) Eşitle</span>
              </Button>

              {/* takvim.com Fetch */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleFetchOnline}
                disabled={isLoadingWeb}
                className={`h-8 text-xs font-semibold gap-1.5 cursor-pointer ${
                  isDark
                    ? "border-sky-500/40 text-sky-400 hover:bg-sky-950/30"
                    : "border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100"
                }`}
                title="takvim.com üzerinden bu yılın güncel tatil verilerini çekip kaydet"
              >
                {isLoadingWeb ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-sky-500" />
                )}
                <span>takvim.com</span>
              </Button>

              {/* ICS File / URL Modal Trigger */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsIcsImportOpen(!isIcsImportOpen)}
                className={`h-8 text-xs font-semibold gap-1.5 cursor-pointer ${
                  isDark
                    ? "border-purple-500/40 text-purple-400 hover:bg-purple-950/30"
                    : "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100"
                }`}
                title=".ics Dosyası Yükle veya Özel iCal Takvim URL'si Gir"
              >
                <FileUp className="h-3.5 w-3.5 text-purple-500" />
                <span>.ICS İçe Aktar</span>
              </Button>

              {/* Reset to Defaults */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetDefaults}
                className={`h-8 text-xs font-semibold gap-1.5 cursor-pointer ${
                  isDark
                    ? "border-amber-500/40 text-amber-400 hover:bg-amber-950/30"
                    : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                }`}
                title="Bu yılın tatillerini resmi varsayılan şablona sıfırla"
              >
                <RefreshCcw className="h-3.5 w-3.5 text-amber-500" />
                <span>Varsayılana Dön</span>
              </Button>

              {/* Add New Custom Holiday */}
              <Button
                size="sm"
                onClick={handleOpenAddForm}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-bold px-3 shadow-xs gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Yeni Tatil Ekle</span>
              </Button>
            </div>
          </div>

          {/* Filter Pills: Miladi vs Hicri vs Özel */}
          <div className="flex items-center gap-1.5 pt-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setCalendarFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                calendarFilter === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              🌟 Tümü ({holidays.length})
            </button>

            <button
              type="button"
              onClick={() => setCalendarFilter("miladi")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                calendarFilter === "miladi"
                  ? "bg-rose-600 text-white shadow-xs"
                  : isDark
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sun className="h-3 w-3" />
              <span>🇹🇷 Miladi Ulusal Bayramlar ({miladiCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setCalendarFilter("hicri")}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                calendarFilter === "hicri"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : isDark
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Moon className="h-3 w-3" />
              <span>🌙 Hicri Dini Bayramlar & Günler ({hicriCount})</span>
            </button>

            {customCount > 0 && (
              <button
                type="button"
                onClick={() => setCalendarFilter("custom")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  calendarFilter === "custom"
                    ? "bg-purple-600 text-white shadow-xs"
                    : isDark
                    ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🏛️ Özel Kayıtlar ({customCount})
              </button>
            )}
          </div>
        </DialogHeader>

        {/* .ICS Custom Import Drawer */}
        {isIcsImportOpen && (
          <div
            className={`p-4 rounded-xl border mb-2 space-y-3 animate-in fade-in-50 ${
              isDark ? "bg-slate-950/90 border-purple-500/40" : "bg-purple-50/70 border-purple-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-purple-400 flex items-center gap-1.5">
                <FileUp className="h-3.5 w-3.5" />
                <span>iCalendar (.ICS) Takvim İçe Aktarma & Doğrulama</span>
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsIcsImportOpen(false)}
                className="h-6 w-6 p-0 text-slate-400"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* File Upload */}
              <div
                className={`p-3 rounded-lg border border-dashed flex flex-col items-center justify-center text-center gap-2 ${
                  isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-300 bg-white"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".ics,text/calendar"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-6 w-6 text-purple-400" />
                <div className="text-xs">
                  <span className="font-bold">Yerel .ics Dosyası Yükle</span>
                  <p className="text-[10px] text-slate-400">
                    Google Takvim, Outlook veya Apple Takvim'den dışa aktarılan .ics dosyasını seçin.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs font-bold px-3 border-purple-500/40 text-purple-400"
                >
                  Dosya Seç (.ics)
                </Button>
              </div>

              {/* URL Import */}
              <div
                className={`p-3 rounded-lg border flex flex-col justify-between gap-2 ${
                  isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-300 bg-white"
                }`}
              >
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    iCal (.ics) Web Bağlantısı
                  </label>
                  <Input
                    value={icsCustomUrl}
                    onChange={(e) => setIcsCustomUrl(e.target.value)}
                    placeholder="https://.../basic.ics"
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ✓ Google Calendar Resmi Akışı Hazır
                  </span>
                  <Button
                    size="sm"
                    onClick={handleImportFromUrl}
                    className="h-7 text-xs font-bold px-3 bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    URL'den Çek & Eşitle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Miladi ↔ Hicri Tarih Karşılık / Bilgi Çubuğu */}
        <div
          className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
            isDark
              ? "bg-slate-950/60 border-slate-800 text-slate-300"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[11px] flex items-center gap-1 text-emerald-400">
              <Moon className="h-3.5 w-3.5" />
              <span>Miladi ↔ Hicri Çevirici:</span>
            </span>
            <input
              type="date"
              value={converterDate}
              onChange={(e) => setConverterDate(e.target.value)}
              className={`h-6 text-xs px-1.5 rounded font-mono font-bold ${
                isDark ? "bg-slate-900 border border-slate-700 text-white" : "bg-white border text-black"
              }`}
            />
            <span className="text-slate-400">➔</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {convertedInfo.formattedDisplay}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Diyanet & Resmi Gazete Teyitli
            </span>
            <span>•</span>
            <span>Umm al-Qura Algoritması</span>
          </div>
        </div>

        {/* Holiday Add / Edit Inline Form Modal */}
        {isFormOpen && (
          <div
            className={`p-4 rounded-xl border mb-3 space-y-3 animate-in fade-in-50 ${
              isDark ? "bg-slate-950/80 border-indigo-500/40" : "bg-indigo-50/50 border-indigo-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {editingDate ? "Tatil / Özel Günü Düzenle" : "Yeni Tatil / Özel Gün Ekle"}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="h-6 w-6 p-0 text-slate-400"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Tarih (YYYY-MM-DD) *
                  </label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="h-8 text-xs font-mono font-bold"
                  />
                  {formDate && (
                    <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">
                      {getHijriDateString(formDate).formattedDisplay}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Tatil Adı / Başlık *
                  </label>
                  <Input
                    placeholder="Örn: 29 Ekim Cumhuriyet Bayramı veya Ramazan Bayramı 1. Gün"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="h-8 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Kısa Etiket (Hücrede Görünür)
                  </label>
                  <Input
                    placeholder="Örn: 29 Ekim"
                    value={formShortTitle}
                    onChange={(e) => setFormShortTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Tatil Türü
                  </label>
                  <Select
                    value={formType}
                    onValueChange={(val: HolidayType) => {
                      setFormType(val);
                      if (val === "religious") {
                        setFormCalendarType("hicri");
                        setFormIcon("🌙");
                      } else {
                        setFormCalendarType("miladi");
                        setFormIcon("🇹🇷");
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">🇹🇷 Resmi Ulusal Bayram</SelectItem>
                      <SelectItem value="religious">🌙 Dini Bayram</SelectItem>
                      <SelectItem value="custom">🏛️ Kurum / Belediye Özel İzni</SelectItem>
                      <SelectItem value="commemoration">🕊️ Anma / Özel Gün</SelectItem>
                      <SelectItem value="administrative">📋 İdari İzin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Takvim Sistemi
                  </label>
                  <Select
                    value={formCalendarType}
                    onValueChange={(val: CalendarSystemType) => setFormCalendarType(val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miladi">☀️ Miladi Takvim (Sabit)</SelectItem>
                      <SelectItem value="hicri">🌙 Hicri Takvim (Dini)</SelectItem>
                      <SelectItem value="custom">🏛️ Kurumsal / Özel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Simge / Emoji
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value)}
                      className="h-8 w-14 text-center text-sm"
                    />
                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                      {EMOJI_OPTIONS.slice(0, 5).map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setFormIcon(em)}
                          className="px-1 py-0.5 rounded hover:bg-slate-800 text-xs cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsOffDay}
                      onChange={(e) => setFormIsOffDay(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                    />
                    <span>Resmi Tatil (Kapalı)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsHalfDay}
                      onChange={(e) => setFormIsHalfDay(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                    />
                    <span>Yarım Gün (Arife)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                  className="h-8 text-xs"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-bold px-4"
                >
                  Kaydet
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Holidays List Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-125">
          {filteredHolidays.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Bu filtre veya yıl için tatil kaydı bulunamadı. "Google iCal (ICS) Eşitle" veya "Yeni Tatil Ekle" butonlarını kullanabilirsiniz.
            </div>
          ) : (
            filteredHolidays.map((h) => {
              const isDisabled = disabledKeys.includes(h.date);
              const isCustom = h.isCustom || getCustomHolidaysFromStorage().some((c) => c.date === h.date);
              const calType = h.calendarType || (h.type === "religious" ? "hicri" : "miladi");
              const hijriDisplay = h.hijriDetail || (calType === "hicri" ? getHijriDateString(h.date).formattedDisplay : null);

              return (
                <div
                  key={h.date}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isDisabled
                      ? "opacity-50 border-slate-800 bg-slate-950/30"
                      : isDark
                      ? "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                      : "bg-slate-50/80 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-11 w-11 rounded-xl border flex items-center justify-center text-xl shrink-0 ${
                        h.isOffDay
                          ? calType === "hicri"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                          : "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                      }`}
                    >
                      {h.icon || (calType === "hicri" ? "🌙" : "🇹🇷")}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-indigo-400">
                          {h.date}
                        </span>

                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {h.title}
                        </span>

                        {/* Miladi / Hicri Badge */}
                        {calType === "hicri" ? (
                          <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0 font-medium">
                            🌙 Hicri {hijriDisplay ? `(${hijriDisplay})` : "Takvim"}
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-600/20 text-rose-400 border border-rose-500/30 text-[10px] px-1.5 py-0 font-medium">
                            ☀️ Miladi Takvim
                          </Badge>
                        )}

                        {h.isHalfDay && (
                          <Badge
                            variant="outline"
                            className="border-amber-500/40 text-amber-400 text-[10px] px-1.5 py-0"
                          >
                            Yarım Gün
                          </Badge>
                        )}

                        {isCustom && (
                          <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[9px] px-1.5 py-0">
                            Özel Kayıt
                          </Badge>
                        )}

                        {h.isVerified && (
                          <span
                            className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5"
                            title="Diyanet & Resmi Gazete / Google ICS Teyitli"
                          >
                            <CheckCircle2 className="h-3 w-3 inline" />
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>
                          {h.type === "national"
                            ? "Ulusal Resmi Bayram"
                            : h.type === "religious"
                            ? "Dini Bayram"
                            : h.type === "commemoration"
                            ? "Anma Günü"
                            : "Kurum / İdari İzin"}
                        </span>
                        <span>•</span>
                        <span className={h.isOffDay ? "text-rose-400 font-semibold" : "text-slate-400"}>
                          {h.isOffDay ? "Resmi Tatil (Kapalı)" : "Normal Çalışma Günü"}
                        </span>
                        {h.description && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 truncate max-w-xs">{h.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleDisabled(h.date)}
                      className={`text-xs h-7 px-2 font-semibold cursor-pointer ${
                        isDisabled
                          ? "text-slate-400 hover:text-emerald-400"
                          : "text-emerald-400 hover:text-rose-400"
                      }`}
                      title={isDisabled ? "Bu tatili tekrar aktifleştir" : "Bu tatili bu yıl için kapat"}
                    >
                      {isDisabled ? "Etkinleştir" : "Kapat"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEditForm(h)}
                      className="text-xs h-7 px-2 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      title="Düzenle"
                    >
                      Düzenle
                    </Button>

                    {isCustom && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCustom(h.date)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Özel tatili sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
