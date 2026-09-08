import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
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
  CalendarDays,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface HolidaysScreenProps {
  theme: "dark" | "light";
  onOpenCalendar?: () => void;
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

export function HolidaysScreen({
  theme,
  onOpenCalendar,
}: HolidaysScreenProps): React.JSX.Element {
  const isDark = theme === "dark";
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [holidays, setHolidays] = useState<HolidayInfo[]>([]);
  const [disabledKeys, setDisabledKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarFilter, setCalendarFilter] = useState<"all" | "miladi" | "hicri" | "custom">("all");
  const [isLoadingWeb, setIsLoadingWeb] = useState(false);
  const [isLoadingGoogleICS, setIsLoadingGoogleICS] = useState(false);

  // ICS Import Drawer
  const [isIcsImportOpen, setIsIcsImportOpen] = useState(false);
  const [icsCustomUrl, setIcsCustomUrl] = useState(GOOGLE_CALENDAR_TR_ICS_URL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hijri Converter Tool
  const [converterDate, setConverterDate] = useState<string>(
    `${selectedYear}-03-20`
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
  };

  useEffect(() => {
    refreshList();
  }, [selectedYear]);

  // Google Calendar ICS Live Fetch & Sync
  const handleFetchGoogleICS = async () => {
    setIsLoadingGoogleICS(true);
    toast.loading(`Google Takvim (iCal ICS) resmi tatil verileri alınıyor...`, {
      id: "screen-fetch-google-ics",
    });
    try {
      const fetched = await fetchGoogleCalendarICS(selectedYear);
      if (fetched.length > 0) {
        toast.success(
          `📅 Google Takvim ICS üzerinden ${selectedYear} yılına ait ${fetched.length} tatil teyit edildi ve güncellendi!`,
          { id: "screen-fetch-google-ics" }
        );
        refreshList();
      } else {
        toast.info(
          `Google Takvim verisi alındı, yerel Diyanet & Resmi Gazete şablonu aktif.`,
          { id: "screen-fetch-google-ics" }
        );
        refreshList();
      }
    } catch (err) {
      toast.error("Google ICS verisi alınırken hata oluştu. Varsayılan veri korunuyor.", {
        id: "screen-fetch-google-ics",
      });
    } finally {
      setIsLoadingGoogleICS(false);
    }
  };

  // Online Fetch from takvim.com
  const handleFetchOnline = async () => {
    setIsLoadingWeb(true);
    toast.loading(`${selectedYear} yılı resmi tatilleri takvim.com'dan alınıyor...`, {
      id: "screen-fetch-holidays",
    });
    try {
      const fetched = await fetchOnlineHolidays(selectedYear);
      if (fetched.length > 0) {
        toast.success(
          `🌐 ${selectedYear} yılı için ${fetched.length} adet resmi tatil takvim.com üzerinden çekildi!`,
          { id: "screen-fetch-holidays" }
        );
        refreshList();
      } else {
        toast.info(
          `${selectedYear} yılı için standart resmi takvim verileri kullanıma hazır.`,
          { id: "screen-fetch-holidays" }
        );
        refreshList();
      }
    } catch (err) {
      toast.error("Veri çekilirken bir hata oluştu. Varsayılan veriler kullanılıyor.", {
        id: "screen-fetch-holidays",
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
      toast.loading("ICS takvim bağlantısı sorgulanıyor...", { id: "screen-import-url" });
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
          id: "screen-import-url",
        });
        setIsIcsImportOpen(false);
        refreshList();
      } else {
        toast.warning("URL içeriğinde bu yıla ait kayıt bulunamadı.", {
          id: "screen-import-url",
        });
      }
    } catch (err) {
      toast.error("Bağlantıdan ICS okunamadı (CORS veya geçersiz URL).", {
        id: "screen-import-url",
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
  const offDayCount = holidays.filter((h) => h.isOffDay && !disabledKeys.includes(h.date)).length;

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

  const openGoogleSearchVerification = () => {
    const queryUrl = `https://www.google.com/search?q=${selectedYear}+dini+bayramlar+ve+resmi+tatiller+diyanet`;
    if ((window as any).electronAPI?.openExternalLink) {
      (window as any).electronAPI.openExternalLink(queryUrl);
    } else {
      window.open(queryUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in-50 duration-200">
      {/* Top Header Card */}
      <div
        className={`p-6 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl select-none">🇹🇷</span>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>Resmi Tatiller & Takvim Yönetimi</span>
              <Badge className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-2.5 py-0.5">
                {selectedYear} Yılı
              </Badge>
            </h1>
          </div>
          <p
            className={`text-xs max-w-3xl leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Miladi ulusal bayramlar, Hicri dini bayramlar (Diyanet & Google ICS teyitli) ve kurumsal özel izinleri yönetin.
            Salon ve mekan rezervasyonlarında tatil günleri ve arifeler takvimde otomatik vurgulanır.
          </p>

          {/* Diyanet & Verification Advisory */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                isDark
                  ? "bg-amber-950/30 border-amber-800/40 text-amber-300"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <span className="text-base">💡</span>
              <span className="text-[11px] font-medium">
                <strong>Önemli Hatırlatma:</strong> Dini bayramlar Kameri (Ay) takvimine göre belirlendiğinden, resmi kurum planlamalarında Diyanet İşleri veya Google Takvim üzerinden güncel tarihleri teyit etmeniz önerilir.
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={openGoogleSearchVerification}
                className="h-6 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-900/40 px-2 underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>🔍 Google'da Teyit Et</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </span>
          </div>
        </div>

        {/* Year Selector & Quick Switcher */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setSelectedYear((y) => y - 1);
                setConverterDate(`${selectedYear - 1}-03-20`);
              }}
              className="h-8 w-8 text-slate-400 hover:text-slate-100"
              title="Önceki Yıl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select
              value={String(selectedYear)}
              onValueChange={(val) => {
                setSelectedYear(Number(val));
                setConverterDate(`${val}-03-20`);
              }}
            >
              <SelectTrigger
                className={`w-32 text-sm h-8 font-black font-mono border-none shadow-none focus:ring-0 ${
                  isDark ? "bg-transparent text-slate-100" : "bg-transparent text-slate-900"
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
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setSelectedYear((y) => y + 1);
                setConverterDate(`${selectedYear + 1}-03-20`);
              }}
              className="h-8 w-8 text-slate-400 hover:text-slate-100"
              title="Sonraki Yıl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {onOpenCalendar && (
            <Button
              variant="outline"
              onClick={onOpenCalendar}
              className="h-10 text-xs font-bold gap-2 cursor-pointer"
            >
              <CalendarDays className="h-4 w-4 text-indigo-500" />
              <span>Takvim Görünümüne Dön</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Holidays */}
        <div
          onClick={() => setCalendarFilter("all")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            calendarFilter === "all"
              ? "ring-2 ring-indigo-500 shadow-md"
              : "hover:border-slate-400 dark:hover:border-slate-700"
          } ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Toplam Kayıt</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black mt-2 text-indigo-400">
            {holidays.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {offDayCount} gün resmi tatil
          </div>
        </div>

        {/* Miladi Holidays */}
        <div
          onClick={() => setCalendarFilter("miladi")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            calendarFilter === "miladi"
              ? "ring-2 ring-rose-500 shadow-md"
              : "hover:border-slate-400 dark:hover:border-slate-700"
          } ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Miladi Ulusal</span>
            <Sun className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black mt-2 text-rose-500">
            {miladiCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Cumhuriyet, Zafer, Gençlik vb.
          </div>
        </div>

        {/* Hijri Holidays */}
        <div
          onClick={() => setCalendarFilter("hicri")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            calendarFilter === "hicri"
              ? "ring-2 ring-emerald-500 shadow-md"
              : "hover:border-slate-400 dark:hover:border-slate-700"
          } ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Hicri Dini</span>
            <Moon className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black mt-2 text-emerald-500">
            {hicriCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Ramazan & Kurban Bayramları
          </div>
        </div>

        {/* Custom Holidays */}
        <div
          onClick={() => setCalendarFilter("custom")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            calendarFilter === "custom"
              ? "ring-2 ring-purple-500 shadow-md"
              : "hover:border-slate-400 dark:hover:border-slate-700"
          } ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Özel & Kurumsal</span>
            <Tag className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black mt-2 text-purple-400">
            {customCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Özel izinler ve eklenen günler
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
          isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Tatil, Hicri gün veya tarih ara (Örn: Ramazan, 29 Ekim, Şevval)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 h-9 text-xs ${
                isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-300"
              }`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          {/* Google ICS Fetch */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleFetchGoogleICS}
            disabled={isLoadingGoogleICS}
            className={`h-9 text-xs font-bold gap-1.5 cursor-pointer ${
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
            className={`h-9 text-xs font-bold gap-1.5 cursor-pointer ${
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
            className={`h-9 text-xs font-bold gap-1.5 cursor-pointer ${
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
            className={`h-9 text-xs font-bold gap-1.5 cursor-pointer ${
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
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-bold px-4 shadow-sm gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Tatil Ekle</span>
          </Button>
        </div>
      </div>

      {/* .ICS Custom Import Drawer */}
      {isIcsImportOpen && (
        <div
          className={`p-5 rounded-2xl border space-y-4 animate-in fade-in-50 ${
            isDark ? "bg-slate-950/90 border-purple-500/40" : "bg-purple-50/70 border-purple-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-purple-400 flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>iCalendar (.ICS) Takvim İçe Aktarma & Doğrulama</span>
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsIcsImportOpen(false)}
              className="h-7 w-7 p-0 text-slate-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <div
              className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center gap-3 ${
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
              <Upload className="h-8 w-8 text-purple-400" />
              <div className="text-xs space-y-1">
                <span className="font-bold block text-sm">Yerel .ics Dosyası Yükle</span>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Google Takvim, Outlook veya Apple Takvim'den dışa aktarılan .ics dosyasını seçin.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs font-bold px-4 border-purple-500/40 text-purple-400 cursor-pointer"
              >
                Dosya Seç (.ics)
              </Button>
            </div>

            {/* URL Import */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-300 bg-white"
              }`}
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  iCal (.ics) Web Bağlantısı
                </label>
                <Input
                  value={icsCustomUrl}
                  onChange={(e) => setIcsCustomUrl(e.target.value)}
                  placeholder="https://.../basic.ics"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-emerald-400 font-semibold">
                  ✓ Google Calendar Resmi Akışı Hazır
                </span>
                <Button
                  size="sm"
                  onClick={handleImportFromUrl}
                  className="h-8 text-xs font-bold px-4 bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                >
                  URL'den Çek & Eşitle
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hijri / Miladi Converter & Live Tool Card */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
          isDark
            ? "bg-slate-900/70 border-slate-800 text-slate-300"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
            <Moon className="h-4 w-4" />
            <span>Miladi ↔ Hicri Dönüştürücü:</span>
          </span>
          <input
            type="date"
            value={converterDate}
            onChange={(e) => setConverterDate(e.target.value)}
            className={`h-7 text-xs px-2 rounded-lg font-mono font-bold ${
              isDark ? "bg-slate-950 border border-slate-700 text-white" : "bg-white border text-black"
            }`}
          />
          <span className="text-slate-400 font-bold">➔</span>
          <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            {convertedInfo.formattedDisplay}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="h-4 w-4" /> Diyanet & Resmi Gazete Algoritması
          </span>
          <span>•</span>
          <span>Umm al-Qura Takvim Sistemi</span>
        </div>
      </div>

      {/* Holiday Add / Edit Form Modal */}
      {isFormOpen && (
        <div
          className={`p-6 rounded-2xl border space-y-4 animate-in fade-in-50 ${
            isDark ? "bg-slate-950/90 border-indigo-500/40" : "bg-indigo-50/70 border-indigo-200"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-slate-800">
            <h4 className="text-sm font-black text-indigo-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {editingDate ? "Tatil / Özel Günü Düzenle" : "Yeni Tatil / Özel Gün Ekle"}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              className="h-7 w-7 p-0 text-slate-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Tarih (YYYY-MM-DD) *
                </label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="h-9 text-xs font-mono font-bold"
                />
                {formDate && (
                  <span className="text-[11px] text-emerald-400 block mt-1 font-mono">
                    {getHijriDateString(formDate).formattedDisplay}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Tatil Adı / Başlık *
                </label>
                <Input
                  placeholder="Örn: 29 Ekim Cumhuriyet Bayramı veya Ramazan Bayramı 1. Gün"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="h-9 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Kısa Etiket (Hücrede Görünür)
                </label>
                <Input
                  placeholder="Örn: 29 Ekim"
                  value={formShortTitle}
                  onChange={(e) => setFormShortTitle(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
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
                  <SelectTrigger className="h-9 text-xs">
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
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Takvim Sistemi
                </label>
                <Select
                  value={formCalendarType}
                  onValueChange={(val: CalendarSystemType) => setFormCalendarType(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
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
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Simge / Emoji
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="h-9 w-14 text-center text-sm"
                  />
                  <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {EMOJI_OPTIONS.slice(0, 5).map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setFormIcon(em)}
                        className="px-1.5 py-1 rounded hover:bg-slate-800 text-sm cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsOffDay}
                    onChange={(e) => setFormIsOffDay(e.target.checked)}
                    className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                  />
                  <span>Resmi Tatil (Kapalı)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="h-9 text-xs"
              >
                İptal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-bold px-5 cursor-pointer"
              >
                Kaydet
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Holidays List Cards & Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400">
            {selectedYear} Yılı Tatil Listesi ({filteredHolidays.length} Kayıt)
          </h3>
          <span className="text-xs text-slate-500">
            Kapatılan tatiller takvim hücrelerinde pasif görünür.
          </span>
        </div>

        {filteredHolidays.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border text-xs text-slate-500 ${
              isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            Bu filtre veya yıl için tatil kaydı bulunamadı. "Google iCal (ICS) Eşitle" veya "Yeni Tatil Ekle" butonlarını kullanabilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredHolidays.map((h) => {
              const isDisabled = disabledKeys.includes(h.date);
              const isCustom = h.isCustom || getCustomHolidaysFromStorage().some((c) => c.date === h.date);
              const calType = h.calendarType || (h.type === "religious" ? "hicri" : "miladi");
              const hijriDisplay = h.hijriDetail || (calType === "hicri" ? getHijriDateString(h.date).formattedDisplay : null);

              return (
                <div
                  key={h.date}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    isDisabled
                      ? "opacity-50 border-slate-800 bg-slate-950/30"
                      : isDark
                      ? "bg-slate-900/80 border-slate-800/80 hover:border-slate-700"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`h-12 w-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 ${
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
                            <CheckCircle2 className="h-3.5 w-3.5 inline" />
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

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleDisabled(h.date)}
                      className={`text-xs h-8 px-2.5 font-semibold cursor-pointer ${
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
                      className="text-xs h-8 px-2.5 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      title="Düzenle"
                    >
                      Düzenle
                    </Button>

                    {isCustom && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCustom(h.date)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Özel tatili sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
