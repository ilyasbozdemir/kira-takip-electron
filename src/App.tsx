import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Hall,
  hoursBetween,
  money,
  type Reservation,
  timeSlots,
  toKey,
  toMin,
  trDays,
  trMonths,
  type Venue,
} from "@/lib/rental-store";
import { useSQLiteStore } from "@/lib/db-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";
import { MailDialog } from "@/components/mail-dialog";
import { UpdateBanner } from "@/components/update-banner";
import { CopySettingsModal } from "@/components/copy-settings-modal";
import { LauncherModal, RecentFileItem } from "@/components/launcher-modal";
import { OfficialPrintModal } from "@/components/official-print-modal";
import { WelcomeStartScreen } from "@/components/welcome-start-screen";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  Building2,
  Calendar as CalendarIcon,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Database,
  DollarSign,
  FilePlus,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Grid as GridIcon,
  Layers,
  LayoutDashboard,
  ListFilter,
  Mail,
  MapPin,
  Menu as MenuIcon,
  MessageSquare,
  Minus,
  Moon,
  Music,
  PartyPopper,
  Phone,
  Plus,
  Printer,
  Scale,
  Search,
  Settings,
  Sparkles,
  Square,
  Sun,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

type NavSection =
  | "dashboard"
  | "calendar"
  | "venues"
  | "events"
  | "reports"
  | "settings";

type HallInfo = Hall & {
  venueId: string;
  venueName: string;
};

const DEFAULT_EVENT_TYPES = [
  "Düğün & Nişan",
  "Konferans & Kongre",
  "Balo & Gala",
  "İftar & Toplu Yemek",
  "Konser & Sahne",
  "Toplantı & Seminer",
  "Lansman & Sergi",
  "Özel Etkinlik",
];

export default function App() {
  const {
    store,
    ready,
    currentFilePath,
    addVenue,
    removeVenue,
    addHall,
    removeHall,
    addReservation,
    removeReservation,
    updatePaid,
  } = useSQLiteStore();

  const today = new Date();
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>(toKey(today));
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("venuekeeper-theme") as "dark" | "light") ||
      "dark";
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("venuekeeper-sidebar-collapsed") === "true";
  });

  const toggleSidebarCollapsed = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("venuekeeper-sidebar-collapsed", String(next));
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("venuekeeper-theme", nextTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Calendar View & Filter States
  const [calendarViewMode, setCalendarViewMode] = useState<"grid" | "timeline">(
    "grid",
  );
  const [calendarVenueFilter, setCalendarVenueFilter] = useState<string>("all");

  // Dynamic Event Types State
  const [eventTypes, setEventTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("venuekeeper-event-types");
      return saved ? JSON.parse(saved) : DEFAULT_EVENT_TYPES;
    } catch {
      return DEFAULT_EVENT_TYPES;
    }
  });
  const [newEventTypeInput, setNewEventTypeInput] = useState("");

  const allEventTypes = useMemo(() => {
    const dbTypes = store.reservations.map((r) => r.eventType).filter((
      x,
    ): x is string => Boolean(x));
    const set = new Set([...eventTypes, ...dbTypes]);
    return Array.from(set).sort((a, b) =>
      (a || "").localeCompare(b || "", "tr")
    );
  }, [eventTypes, store.reservations]);

  const customerSuggestions = useMemo(() => {
    const list = store.reservations.map((r) => r.customer).filter(Boolean);
    return Array.from(new Set(list));
  }, [store.reservations]);

  const phoneSuggestions = useMemo(() => {
    const list = store.reservations.map((r) => r.phone).filter(Boolean);
    return Array.from(new Set(list));
  }, [store.reservations]);

  const handleAddCustomEventType = (typeName?: string) => {
    const val = (typeName || newEventTypeInput).trim();
    if (!val) return;
    if (!eventTypes.includes(val)) {
      const updated = [...eventTypes, val];
      setEventTypes(updated);
      localStorage.setItem("venuekeeper-event-types", JSON.stringify(updated));
      toast.success(`Yeni etkinlik türü eklendi: "${val}"`);
    }
    setNewEventTypeInput("");
  };

  const handleRemoveEventType = (val: string) => {
    const updated = eventTypes.filter((t) => t !== val);
    setEventTypes(updated);
    localStorage.setItem("venuekeeper-event-types", JSON.stringify(updated));
    toast.info(`Etkinlik türü silindi: "${val}"`);
  };

  const handleResetEventTypes = () => {
    setEventTypes(DEFAULT_EVENT_TYPES);
    localStorage.setItem(
      "venuekeeper-event-types",
      JSON.stringify(DEFAULT_EVENT_TYPES),
    );
    toast.success("Etkinlik türleri varsayılan listeye sıfırlandı.");
  };

  const getEventTypeColor = (type?: string) => {
    const isDark = theme === "dark";
    if (!type) {
      return isDark
        ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
        : "bg-indigo-50 text-indigo-700 border-indigo-300";
    }
    switch (type) {
      case "Düğün & Nişan":
        return isDark
          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
          : "bg-rose-50 text-rose-700 border-rose-300";
      case "Konferans & Kongre":
      case "Toplantı & Seminer":
        return isDark
          ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
          : "bg-sky-50 text-sky-700 border-sky-300";
      case "Konser & Sahne":
        return isDark
          ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
          : "bg-purple-50 text-purple-700 border-purple-300";
      case "Balo & Gala":
      case "Lansman & Sergi":
        return isDark
          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
          : "bg-amber-50 text-amber-800 border-amber-300";
      case "İftar & Toplu Yemek":
        return isDark
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : "bg-emerald-50 text-emerald-700 border-emerald-300";
      default: {
        const hash = type.split("").reduce(
          (acc, char) => acc + char.charCodeAt(0),
          0,
        );
        const darkColors = [
          "bg-pink-500/15 text-pink-400 border-pink-500/30",
          "bg-teal-500/15 text-teal-400 border-teal-500/30",
          "bg-violet-500/15 text-violet-400 border-violet-500/30",
          "bg-orange-500/15 text-orange-400 border-orange-500/30",
          "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
        ];
        const lightColors = [
          "bg-pink-50 text-pink-700 border-pink-300",
          "bg-teal-50 text-teal-700 border-teal-300",
          "bg-violet-50 text-violet-700 border-violet-300",
          "bg-orange-50 text-orange-800 border-orange-300",
          "bg-cyan-50 text-cyan-700 border-cyan-300",
        ];
        return isDark
          ? darkColors[hash % darkColors.length]
          : lightColors[hash % lightColors.length];
      }
    }
  };

  // Dialog States
  const [resModalOpen, setResModalOpen] = useState(false);
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedPrintReservation, setSelectedPrintReservation] = useState<
    Reservation | null
  >(null);

  const handlePrintOfficialDoc = (res: Reservation) => {
    setSelectedPrintReservation(res);
    setPrintModalOpen(true);
  };

  // Recent Database Files History State
  const [recentFiles, setRecentFiles] = useState<RecentFileItem[]>(() => {
    try {
      const saved = localStorage.getItem("venuekeeper-recent-files");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentFile = useCallback((filePath: string) => {
    if (!filePath) return;
    const fileName = filePath.split(/[\\/]/).pop() || filePath;
    const nowStr = new Date().toLocaleDateString("tr-TR") + " " +
      new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    setRecentFiles((prev) => {
      const filtered = prev.filter((item) => item.path !== filePath);
      const updated = [
        { path: filePath, name: fileName, lastOpened: nowStr },
        ...filtered,
      ].slice(0, 10);
      localStorage.setItem("venuekeeper-recent-files", JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    if (currentFilePath) {
      addRecentFile(currentFilePath);
    }
  }, [currentFilePath, addRecentFile]);

  const handleOpenRecent = async (filePath: string) => {
    if (window.electronAPI?.db?.switchDatabase) {
      const res = await window.electronAPI.db.switchDatabase(filePath);
      if (res?.success) {
        addRecentFile(filePath);
        toast.success(
          `Çalışma dosyasına geçiş yapıldı: ${filePath.split(/[\\/]/).pop()}`,
        );
      } else {
        toast.error(res?.error || "Dosya açılamadı!");
      }
    } else {
      addRecentFile(filePath);
      toast.success(`Dosyaya geçiş yapıldı: ${filePath.split(/[\\/]/).pop()}`);
    }
  };

  const handleClearRecent = () => {
    setRecentFiles([]);
    localStorage.removeItem("venuekeeper-recent-files");
    toast.info("Son açılan dosya geçmişi temizlendi.");
  };

  // Mail preset state
  const [mailPreset, setMailPreset] = useState<
    { recipient?: string; subject?: string; body?: string }
  >({});

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    {
      type: "venue" | "hall" | "reservation";
      id: string;
      title: string;
      venueId?: string;
    } | null
  >(null);

  const promptDelete = (
    type: "venue" | "hall" | "reservation",
    id: string,
    title: string,
    venueId?: string,
  ) => {
    setDeleteTarget({ type, id, title, venueId });
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, venueId } = deleteTarget;
    setDeleteConfirmOpen(false);

    if (type === "venue") {
      const res = await removeVenue(id);
      if (res?.success) {
        toast.success("Mekan silindi.");
      } else {
        toast.error(res?.error || "Mekan silinemedi!");
      }
    } else if (type === "hall") {
      const res = await removeHall(venueId!, id);
      if (res?.success) {
        toast.success("Salon silindi.");
      } else {
        toast.error(res?.error || "Salon silinemedi!");
      }
    } else if (type === "reservation") {
      await removeReservation(id);
      toast.success("Etkinlik rezervasyonu silindi.");
    }

    setDeleteTarget(null);
  };

  // New Event/Reservation Form State
  const [defaultTariffBasis, setDefaultTariffBasis] = useState<string>(() => {
    return (
      localStorage.getItem("venuekeeper-default-tariff-basis") ||
      "Belediye Encümeni Kararı: 15/01/2026 - Karar No: 42 (2464 Sayılı Kanun Md. 97)"
    );
  });

  // Institution & Base64 Logo State
  const [institutionName, setInstitutionName] = useState<string>(() => {
    return (
      localStorage.getItem("venuekeeper-institution-name") ||
      "VenueKeeper"
    );
  });
  const [institutionLogo, setInstitutionLogo] = useState<string>(() => {
    return localStorage.getItem("venuekeeper-institution-logo") || "";
  });

  // Draft States for Settings Forms
  const [draftInstitutionName, setDraftInstitutionName] = useState(
    institutionName,
  );
  const [draftInstitutionLogo, setDraftInstitutionLogo] = useState(
    institutionLogo,
  );
  const [draftTariffBasis, setDraftTariffBasis] = useState(defaultTariffBasis);

  const decisionSuggestions = useMemo(() => {
    const list = store.reservations.map((r) => r.decisionInfo).filter((
      x,
    ): x is string => Boolean(x));
    return Array.from(new Set([defaultTariffBasis, ...list]));
  }, [store.reservations, defaultTariffBasis]);

  useEffect(() => {
    setDraftInstitutionName(institutionName);
    setDraftInstitutionLogo(institutionLogo);
    setDraftTariffBasis(defaultTariffBasis);
  }, [institutionName, institutionLogo, defaultTariffBasis]);

  useEffect(() => {
    if (window.electronAPI?.db?.getSetting) {
      window.electronAPI.db.getSetting("company_name").then((val) => {
        if (val) {
          setInstitutionName(val);
          setDraftInstitutionName(val);
        }
      });
      window.electronAPI.db.getSetting("company_logo").then((val) => {
        if (val) {
          setInstitutionLogo(val);
          setDraftInstitutionLogo(val);
        }
      });
    }
  }, [currentFilePath]);

  const handleSaveInstitutionSettings = async () => {
    setInstitutionName(draftInstitutionName);
    setInstitutionLogo(draftInstitutionLogo);
    localStorage.setItem("venuekeeper-institution-name", draftInstitutionName);
    localStorage.setItem("venuekeeper-institution-logo", draftInstitutionLogo);
    if (window.electronAPI?.db?.setSetting) {
      await window.electronAPI.db.setSetting(
        "company_name",
        draftInstitutionName,
      );
      await window.electronAPI.db.setSetting(
        "company_logo",
        draftInstitutionLogo,
      );
    }
    toast.success("Kurumsal kimlik ve logo bilgileri veritabanına kaydedildi!");
  };

  const handleCancelInstitutionSettings = () => {
    setDraftInstitutionName(institutionName);
    setDraftInstitutionLogo(institutionLogo);
    toast.info("Değişiklikler iptal edildi.");
  };

  const handleSaveTariffSettings = () => {
    setDefaultTariffBasis(draftTariffBasis);
    localStorage.setItem("venuekeeper-default-tariff-basis", draftTariffBasis);
    toast.success("Resmi tarife ve karar dayanağı kaydedildi!");
  };

  const handleCancelTariffSettings = () => {
    setDraftTariffBasis(defaultTariffBasis);
    toast.info("Değişiklikler iptal edildi.");
  };

  const handleDraftLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo dosyası 2MB'tan küçük olmalıdır.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Str = event.target?.result as string;
        if (base64Str) {
          setDraftInstitutionLogo(base64Str);
          toast.info(
            "Logo önizlemeye yüklendi. Kaydet butonuna basarak onaylayabilirsiniz.",
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveDraftLogo = () => {
    setDraftInstitutionLogo("");
    toast.info("Logo önizlemeden kaldırıldı.");
  };
  const [resVenueId, setResVenueId] = useState("");
  const [resHallId, setResHallId] = useState("");
  const [resStart, setResStart] = useState("13:00");
  const [resEnd, setResEnd] = useState("17:00");
  const [resCustomer, setResCustomer] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resEventType, setResEventType] = useState("Düğün & Nişan");
  const [resPrice, setResPrice] = useState<number | "">("");
  const [resPaid, setResPaid] = useState<number | "">(0);
  const [resNote, setResNote] = useState("");
  const [resDecisionInfo, setResDecisionInfo] = useState(defaultTariffBasis);

  // New Venue Form State
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueDistrict, setNewVenueDistrict] = useState("");
  const [newVenueCategory, setNewVenueCategory] = useState("Kongre & Balo");

  // New Hall Form State
  const [targetVenueId, setTargetVenueId] = useState("");
  const [newHallName, setNewHallName] = useState("");
  const [newHallFloor, setNewHallFloor] = useState("");
  const [newHallCapacity, setNewHallCapacity] = useState(300);
  const [newHallHourlyPrice, setNewHallHourlyPrice] = useState(1500);

  const handleOpenFileDialog = async () => {
    if (window.electronAPI?.openFileDialog) {
      const res = await window.electronAPI.openFileDialog();
      if (res?.filePath) {
        toast.success(
          `Veritabanı dosyası açıldı: ${res.filePath.split(/[\\/]/).pop()}`,
        );
      }
    } else {
      toast.info(
        "Dosya açma özelliği masaüstü Electron uygulamasında kullanılabilir.",
      );
    }
  };

  const handleCreateNewDatabase = async () => {
    if (window.electronAPI?.saveFileDialog) {
      const path = await window.electronAPI.saveFileDialog({
        defaultName: "yeni-mekan-veritabani.vke",
      });
      if (path) {
        toast.success(
          `Yeni boş veritabanı projesi oluşturuldu: ${
            path.split(/[\\/]/).pop()
          }`,
        );
      }
    } else {
      toast.info(
        "Yeni dosya oluşturma özelliği masaüstü Electron uygulamasında kullanılabilir.",
      );
    }
  };

  const halls: HallInfo[] = useMemo(
    () =>
      store.venues.flatMap((v) =>
        v.halls.map((h) => ({ ...h, venueId: v.id, venueName: v.name }))
      ),
    [store.venues],
  );
  const hallById = (id: string) => halls.find((h) => h.id === id);

  const filteredReservations = useMemo(() => {
    return store.reservations.filter((r) => {
      const matchVenue = venueFilter === "all" || r.venueId === venueFilter;
      const matchType = eventTypeFilter === "all" ||
        r.eventType === eventTypeFilter;
      const matchSearch = !searchQuery.trim() ||
        r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery) ||
        r.date.includes(searchQuery);
      return matchVenue && matchType && matchSearch;
    });
  }, [store.reservations, venueFilter, eventTypeFilter, searchQuery]);

  const byDate = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of filteredReservations) {
      map.set(r.date, [...(map.get(r.date) ?? []), r]);
    }
    for (const [, list] of map) {
      list.sort((a, b) => toMin(a.start) - toMin(b.start));
    }
    return map;
  }, [filteredReservations]);

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const days: (Date | null)[] = Array.from({ length: offset }, () => null);
    const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
      .getDate();
    for (let i = 1; i <= total; i++) {
      days.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [cursor]);

  const monthStats = useMemo(() => {
    const prefix = `${cursor.getFullYear()}-${
      String(cursor.getMonth() + 1).padStart(2, "0")
    }`;
    const list = filteredReservations.filter((r) => r.date.startsWith(prefix));
    const totalCount = list.length;
    const totalRev = list.reduce((acc, curr) => acc + curr.price, 0);
    const totalPaid = list.reduce((acc, curr) => acc + curr.paid, 0);
    const totalHours = list.reduce(
      (acc, curr) => acc + hoursBetween(curr.start, curr.end),
      0,
    );
    return {
      totalCount,
      totalRev,
      totalPaid,
      totalHours,
      remaining: totalRev - totalPaid,
    };
  }, [filteredReservations, cursor]);

  useEffect(() => {
    if (resHallId && resStart && resEnd) {
      const h = hallById(resHallId);
      if (h) {
        const hrs = hoursBetween(resStart, resEnd);
        setResPrice(hrs * h.hourlyPrice);
      }
    }
  }, [resHallId, resStart, resEnd, halls]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !resVenueId || !resHallId || !resCustomer || !resPhone || resPrice === ""
    ) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    const res = await addReservation({
      venueId: resVenueId,
      hallId: resHallId,
      date: selectedDay,
      start: resStart,
      end: resEnd,
      customer: resCustomer,
      phone: resPhone,
      eventType: resEventType,
      price: Number(resPrice),
      paid: Number(resPaid) || 0,
      note: resNote,
      decisionInfo: resDecisionInfo,
    });

    if (res.success) {
      toast.success("Etkinlik rezervasyonu SQLite veritabanına kaydedildi.");
      setResModalOpen(false);
      setResCustomer("");
      setResPhone("");
      setResNote("");
    } else {
      toast.error(res.error || "Çakışma Hatası!");
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName || !newVenueDistrict) {
      toast.error("Mekan adı ve konumu zorunludur.");
      return;
    }
    await addVenue(newVenueName, newVenueDistrict, newVenueCategory);
    toast.success("Yeni mekan tanımlandı.");
    setNewVenueName("");
    setNewVenueDistrict("");
    setVenueModalOpen(false);
  };

  const handleCreateHall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVenueId || !newHallName) {
      toast.error("Mekan seçimi ve salon adı zorunludur.");
      return;
    }
    await addHall(targetVenueId, {
      name: newHallName,
      floor: newHallFloor || "Zemin Kat",
      capacity: Number(newHallCapacity) || 100,
      hourlyPrice: Number(newHallHourlyPrice) || 1000,
    });
    toast.success("Salon eklendi.");
    setNewHallName("");
    setHallModalOpen(false);
  };

  const handleCopySMS = (res: Reservation) => {
    const h = hallById(res.hallId);
    const v = store.venues.find((x) => x.id === res.venueId);
    let template = localStorage.getItem("venue-keeper-copy-template") || "";
    if (!template) {
      template =
        `Sayın {CUSTOMER},\n{VENUE} - {HALL} için {DATE} tarihinde ({START} - {END}) rezervasyonunuz alınmıştır.\nEtkinlik: {EVENT_TYPE}\nToplam: {PRICE}\nÖdenen: {PAID}\nKalan: {REMAINING}`;
    }

    const msg = template
      .replace(/{CUSTOMER}/g, res.customer)
      .replace(/{VENUE}/g, v?.name || "")
      .replace(/{HALL}/g, h?.name || "")
      .replace(/{DATE}/g, res.date)
      .replace(/{START}/g, res.start)
      .replace(/{END}/g, res.end)
      .replace(/{EVENT_TYPE}/g, res.eventType || "Etkinlik")
      .replace(/{PRICE}/g, money(res.price))
      .replace(/{PAID}/g, money(res.paid))
      .replace(/{REMAINING}/g, money(res.price - res.paid));

    navigator.clipboard.writeText(msg);
    toast.success("WhatsApp / SMS bildirim metni kopyalandı!");
  };

  const handleQuickMail = (res: Reservation) => {
    const h = hallById(res.hallId);
    const v = store.venues.find((x) => x.id === res.venueId);
    setMailPreset({
      recipient: "",
      subject: `${v?.name} - ${res.eventType} Etkinlik Bilgilendirmesi`,
      body:
        `Sayın ${res.customer},\n\n${v?.name} bünyesindeki ${h?.name} salonunda ${res.date} tarihinde (${res.start} - ${res.end}) saatleri arasında düzenlenecek ${res.eventType} etkinliğinize ilişkin kayıt bilgileriniz aşağıdadır:\n\nToplam Ücret: ${
          money(res.price)
        }\nÖdenen Tutar: ${money(res.paid)}\nKalan Bakiye: ${
          money(res.price - res.paid)
        }\n\nBizi tercih ettiğiniz için teşekkür ederiz.`,
    });
    setMailModalOpen(true);
  };

  if (!currentFilePath) {
    return (
      <div
        className={`min-h-screen flex flex-col font-sans ${
          theme === "dark"
            ? "bg-slate-950 text-slate-100"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <Toaster position="top-right" theme={theme} richColors />
        <WelcomeStartScreen
          recentFiles={recentFiles}
          onOpenRecent={handleOpenRecent}
          onCreateNew={handleCreateNewDatabase}
          onOpenDialog={handleOpenFileDialog}
          onClearRecent={handleClearRecent}
          theme={theme}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === "dark"
          ? "bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white"
          : "bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white"
      }`}
    >
      <Toaster position="top-right" theme={theme} richColors />
      <UpdateBanner />

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Unified Header & Frameless Window Bar */}
        <header
          className={`h-12 px-4 select-none flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-40 border-b transition-colors ${
            theme === "dark"
              ? "bg-slate-950/95 border-slate-800/90 text-slate-100"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-sm"
          }`}
          style={{ WebkitAppRegion: "drag" } as any}
        >
          <div
            className="flex items-center gap-3"
            style={{ WebkitAppRegion: "no-drag" } as any}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className={`md:hidden p-1.5 rounded-lg ${
                theme === "dark"
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            {currentFilePath && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border max-w-[200px] truncate hidden md:inline-block ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-indigo-400"
                    : "bg-slate-100 border-slate-300 text-indigo-700 font-semibold"
                }`}
                title={currentFilePath}
              >
                📁 {currentFilePath.split(/[\\/]/).pop()}
              </span>
            )}
          </div>

          {/* Search Input */}
          <div
            className="flex-1 max-w-md mx-2 hidden sm:block"
            style={{ WebkitAppRegion: "no-drag" } as any}
          >
            <div className="relative">
              <Search
                className={`h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                  theme === "dark" ? "text-slate-500" : "text-slate-400"
                }`}
              />
              <Input
                placeholder="Müşteri adı, telefon veya tarih ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-8 text-xs h-8 rounded-lg ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                    : "bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          </div>

          {/* Actions & Native Window Controls */}
          <div
            className="flex items-center gap-2"
            style={{ WebkitAppRegion: "no-drag" } as any}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={toggleTheme}
              className={`h-7.5 w-7.5 p-0 rounded-full border ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title={theme === "dark" ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
            >
              {theme === "dark"
                ? <Sun className="h-3.5 w-3.5" />
                : <Moon className="h-3.5 w-3.5" />}
            </Button>

            <Button
              size="sm"
              onClick={() => {
                if (store.venues.length === 0) {
                  toast.error("Önce mekan/tesis eklemelisiniz.");
                  setActiveSection("venues");
                  return;
                }
                const firstV = store.venues[0];
                setResVenueId(firstV.id);
                if (firstV.halls.length > 0) setResHallId(firstV.halls[0].id);
                setResModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-7.5 font-semibold px-3 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Yeni Etkinlik
            </Button>

            {/* Native Window Controls */}
            <div
              className={`flex items-center ml-1.5 border-l pl-1.5 ${
                theme === "dark" ? "border-slate-800" : "border-slate-300"
              }`}
            >
              <button
                onClick={() => window.electronAPI?.windowControls?.minimize()}
                className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
                  theme === "dark"
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                title="Simge Durumuna Küçült"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => window.electronAPI?.windowControls?.maximize()}
                className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
                  theme === "dark"
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                title="Tam Ekran"
              >
                <Square className="h-3 w-3" />
              </button>
              <button
                onClick={() => window.electronAPI?.windowControls?.close()}
                className="h-7 w-7 flex items-center justify-center rounded hover:bg-rose-600 hover:text-white transition-colors"
                title="Kapat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body & Sidebar Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar Navigation */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 flex flex-col transform transition-all duration-200 ease-in-out md:relative md:translate-x-0 ${
              sidebarCollapsed ? "w-16" : "w-64"
            } ${
              theme === "dark"
                ? "bg-slate-900/95 border-r border-slate-800/90 text-slate-100"
                : "bg-white/95 border-r border-slate-200 text-slate-900 shadow-sm"
            } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            {/* Brand Header */}
            <div
              className={`p-3.5 border-b flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              } ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}
            >
              {!sidebarCollapsed
                ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 border border-indigo-500/30 flex items-center justify-center bg-slate-900 shrink-0">
                      <img
                        src="/app-logo.png"
                        alt="VenueKeeper Logo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <h1
                        className={`text-sm font-bold flex items-center gap-1.5 ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        VenueKeeper{" "}
                        <Badge className="bg-indigo-600 text-white text-[9px] uppercase font-mono px-1 py-0 shrink-0">
                          PRO
                        </Badge>
                      </h1>
                      <p
                        className={`text-[10px] truncate ${
                          theme === "dark" ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Mekan & Etkinlik
                      </p>
                    </div>
                  </div>
                )
                : (
                  <div
                    className="h-9 w-9 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 border border-indigo-500/30 flex items-center justify-center bg-slate-900 shrink-0"
                    title="VenueKeeper APP PRO"
                  >
                    <img
                      src="/app-logo.jpg"
                      alt="VenueKeeper Logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleSidebarCollapsed}
                  className={`hidden md:flex p-1.5 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  title={sidebarCollapsed
                    ? "Menüyü Genişlet"
                    : "Menüyü Daralt (İkon Modu)"}
                >
                  {sidebarCollapsed
                    ? <ChevronRight className="h-4 w-4" />
                    : <ChevronLeft className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`md:hidden p-1 rounded-lg ${
                    theme === "dark"
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {[
                {
                  id: "dashboard",
                  label: "Gösterge Paneli",
                  icon: LayoutDashboard,
                },
                {
                  id: "calendar",
                  label: "Takvim & Etkinlikler",
                  icon: CalendarIcon,
                },
                {
                  id: "venues",
                  label: `Mekanlar & Salonlar (${store.venues.length})`,
                  icon: Building2,
                },
                {
                  id: "events",
                  label: `Etkinlik Listesi (${store.reservations.length})`,
                  icon: Layers,
                },
                { id: "reports", label: "Finans & Raporlar", icon: BarChart3 },
                { id: "settings", label: "Ayarlar & İletişim", icon: Settings },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as NavSection);
                      setSidebarOpen(false);
                    }}
                    title={item.label}
                    className={`w-full flex items-center ${
                      sidebarCollapsed
                        ? "justify-center px-2 py-3"
                        : "gap-3 px-3.5 py-2.5"
                    } rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                        : theme === "dark"
                        ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <IconComp
                      className={sidebarCollapsed
                        ? "h-5 w-5 shrink-0"
                        : "h-4 w-4 shrink-0"}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Section Body */}
            <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
              {/* ==================================================================== */}
              {/* 1. DASHBOARD SECTION                                                 */}
              {/* ==================================================================== */}
              {activeSection === "dashboard" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2
                        className={`text-xl font-bold ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        Etkinlik & Mekan Gösterge Paneli
                      </h2>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Aylık genel doluluk, gelir dökümü ve yaklaşan
                        rezervasyonlar.
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card
                      className={theme === "dark"
                        ? "bg-slate-900/80 border-slate-800"
                        : "bg-white border-slate-200 shadow-sm"}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            Toplam Kayıtlı Mekan
                          </p>
                          <p
                            className={`text-2xl font-bold mt-1 ${
                              theme === "dark"
                                ? "text-slate-100"
                                : "text-slate-900"
                            }`}
                          >
                            {store.venues.length}
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                          <Building2 className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={theme === "dark"
                        ? "bg-slate-900/80 border-slate-800"
                        : "bg-white border-slate-200 shadow-sm"}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            Bu Ayki Etkinlikler
                          </p>
                          <p
                            className={`text-2xl font-bold mt-1 ${
                              theme === "dark"
                                ? "text-slate-100"
                                : "text-slate-900"
                            }`}
                          >
                            {monthStats.totalCount}
                          </p>
                        </div>
                        <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={theme === "dark"
                        ? "bg-slate-900/80 border-slate-800"
                        : "bg-white border-slate-200 shadow-sm"}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            Aylık Toplam Ciro
                          </p>
                          <p className="text-2xl font-bold text-emerald-500 mt-1">
                            {money(monthStats.totalRev)}
                          </p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                          <DollarSign className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={theme === "dark"
                        ? "bg-slate-900/80 border-slate-800"
                        : "bg-white border-slate-200 shadow-sm"}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            Tahsil Edilmeyi Bekleyen
                          </p>
                          <p className="text-2xl font-bold text-amber-500 mt-1">
                            {money(monthStats.remaining)}
                          </p>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                          <Clock className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Upcoming Events Card */}
                  <Card
                    className={theme === "dark"
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-white border-slate-200 shadow-sm"}
                  >
                    <CardHeader
                      className={`pb-3 border-b flex flex-row items-center justify-between ${
                        theme === "dark"
                          ? "border-slate-800"
                          : "border-slate-200"
                      }`}
                    >
                      <div>
                        <CardTitle
                          className={`text-base font-bold ${
                            theme === "dark"
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          Yaklaşan Etkinlikler
                        </CardTitle>
                        <CardDescription
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          SQLite veritabanından alınan aktif kayıtlar.
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveSection("calendar")}
                        className="text-indigo-500 hover:text-indigo-600 text-xs font-semibold"
                      >
                        Takvimde Gör
                      </Button>
                    </CardHeader>

                    <CardContent className="p-4 space-y-3">
                      {store.reservations.length === 0
                        ? (
                          <p
                            className={`text-xs py-6 text-center ${
                              theme === "dark"
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            Henüz etkinlik kaydı bulunmuyor.
                          </p>
                        )
                        : (
                          store.reservations.slice(0, 5).map((r) => {
                            const h = hallById(r.hallId);
                            const v = store.venues.find((x) =>
                              x.id === r.venueId
                            );

                            return (
                              <div
                                key={r.id}
                                className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                                  theme === "dark"
                                    ? "bg-slate-950 border-slate-800 text-slate-200"
                                    : "bg-slate-50 border-slate-200 text-slate-800"
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-bold ${
                                        theme === "dark"
                                          ? "text-slate-100"
                                          : "text-slate-900"
                                      }`}
                                    >
                                      {r.customer}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="border-indigo-500/30 text-indigo-500 text-[10px]"
                                    >
                                      {r.eventType || "Etkinlik"}
                                    </Badge>
                                  </div>
                                  <p
                                    className={`text-[11px] ${
                                      theme === "dark"
                                        ? "text-slate-400"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {v?.name} •{" "}
                                    <span
                                      className={`font-semibold ${
                                        theme === "dark"
                                          ? "text-slate-300"
                                          : "text-slate-800"
                                      }`}
                                    >
                                      {h?.name}
                                    </span>
                                  </p>
                                </div>

                                <div
                                  className={`flex items-center gap-4 ${
                                    theme === "dark"
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }`}
                                >
                                  <div className="text-right font-mono">
                                    <div>{r.date}</div>
                                    <div
                                      className={`text-[11px] ${
                                        theme === "dark"
                                          ? "text-slate-400"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      {r.start} - {r.end}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-emerald-500">
                                      {money(r.price)}
                                    </div>
                                    <div
                                      className={`text-[11px] ${
                                        theme === "dark"
                                          ? "text-slate-400"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      {r.price - r.paid > 0
                                        ? `Kalan: ${money(r.price - r.paid)}`
                                        : "Ödendi"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ==================================================================== */}
              {/* 2. CALENDAR SECTION                                                  */}
              {/* ==================================================================== */}
              {activeSection === "calendar" && (
                <div className="space-y-4">
                  {/* Calendar Toolbar */}
                  <div
                    className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
                      theme === "dark"
                        ? "bg-slate-900/80 border-slate-800"
                        : "bg-white border-slate-200 shadow-sm"
                    }`}
                  >
                    {/* Left: Month Navigator */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${
                          theme === "dark"
                            ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                            : "border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() =>
                          setCursor(
                            new Date(
                              cursor.getFullYear(),
                              cursor.getMonth() - 1,
                              1,
                            ),
                          )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2
                        className={`text-base font-bold min-w-[150px] text-center ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        {trMonths[cursor.getMonth()]} {cursor.getFullYear()}
                      </h2>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${
                          theme === "dark"
                            ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                            : "border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() =>
                          setCursor(
                            new Date(
                              cursor.getFullYear(),
                              cursor.getMonth() + 1,
                              1,
                            ),
                          )}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCursor(
                            new Date(today.getFullYear(), today.getMonth(), 1),
                          );
                          setSelectedDay(toKey(today));
                        }}
                        className="text-indigo-500 hover:text-indigo-600 text-xs font-semibold ml-1"
                      >
                        Bugüne Git
                      </Button>
                    </div>

                    {/* Center: View Mode Tabs */}
                    <div
                      className={`flex items-center p-1 rounded-lg border text-xs ${
                        theme === "dark"
                          ? "bg-slate-950 border-slate-800"
                          : "bg-slate-100 border-slate-200"
                      }`}
                    >
                      <button
                        onClick={() => setCalendarViewMode("grid")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
                          calendarViewMode === "grid"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : theme === "dark"
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <GridIcon className="h-3.5 w-3.5" /> Aylık Izgara
                      </button>
                      <button
                        onClick={() => setCalendarViewMode("timeline")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
                          calendarViewMode === "timeline"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : theme === "dark"
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <CalendarDays className="h-3.5 w-3.5" /> Zaman Çizelgesi
                      </button>
                    </div>

                    {/* Right: Venue Filter & Add Button */}
                    <div className="flex items-center gap-2">
                      <Select
                        value={calendarVenueFilter}
                        onValueChange={setCalendarVenueFilter}
                      >
                        <SelectTrigger
                          className={`w-[170px] text-xs h-8 ${
                            theme === "dark"
                              ? "bg-slate-950 border-slate-800 text-slate-200"
                              : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        >
                          <SelectValue placeholder="Mekan Filtrele" />
                        </SelectTrigger>
                        <SelectContent
                          className={theme === "dark"
                            ? "bg-slate-900 border-slate-800 text-slate-200"
                            : "bg-white border-slate-200 text-slate-900"}
                        >
                          <SelectItem value="all">Tüm Mekanlar</SelectItem>
                          {store.venues.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        onClick={() => {
                          if (store.venues.length === 0) {
                            toast.error("Önce bir mekan ekleyin.");
                            return;
                          }
                          const firstV = store.venues[0];
                          setResVenueId(firstV.id);
                          if (firstV.halls.length > 0) {
                            setResHallId(firstV.halls[0].id);
                          }
                          setResModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold px-3"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Etkinlik Ekle
                      </Button>
                    </div>
                  </div>

                  {/* Main Calendar Grid & Day Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Calendar Grid or Timeline */}
                    <Card
                      className={`lg:col-span-8 ${
                        theme === "dark"
                          ? "bg-slate-900/80 border-slate-800"
                          : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <CardContent className="p-4">
                        {calendarViewMode === "grid"
                          ? (
                            <>
                              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 mb-2">
                                {trDays.map((d) => (
                                  <div
                                    key={d}
                                    className="py-1.5 uppercase font-mono text-[11px]"
                                  >
                                    {d}
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-7 gap-1.5">
                                {grid.map((cell, idx) => {
                                  if (!cell) {
                                    return (
                                      <div
                                        key={`empty-${idx}`}
                                        className={`h-22 md:h-26 rounded-xl ${
                                          theme === "dark"
                                            ? "bg-slate-950/30 border border-slate-900/50"
                                            : "bg-slate-100/40 border border-slate-200/50"
                                        }`}
                                      />
                                    );
                                  }
                                  const k = toKey(cell);
                                  const isToday = k === toKey(today);
                                  const isSelected = k === selectedDay;
                                  const rawDayRes = byDate.get(k) ?? [];
                                  const dayResList = rawDayRes.filter(
                                    (r) =>
                                      calendarVenueFilter === "all" ||
                                      r.venueId === calendarVenueFilter,
                                  );

                                  return (
                                    <button
                                      key={k}
                                      onClick={() => setSelectedDay(k)}
                                      className={`h-22 md:h-26 p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between overflow-hidden group ${
                                        isSelected
                                          ? "border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/50 shadow-md"
                                          : isToday
                                          ? theme === "dark"
                                            ? "border-amber-500/60 bg-amber-950/20"
                                            : "border-amber-500 bg-amber-50"
                                          : theme === "dark"
                                          ? "border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/50 hover:border-slate-700"
                                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span
                                          className={`text-xs font-bold ${
                                            isToday
                                              ? "bg-amber-500 text-slate-950 h-5 px-1.5 rounded-full flex items-center justify-center font-mono text-[11px]"
                                              : theme === "dark"
                                              ? "text-slate-300"
                                              : "text-slate-800"
                                          }`}
                                        >
                                          {cell.getDate()}
                                        </span>
                                        {dayResList.length > 0 && (
                                          <Badge className="bg-indigo-600 text-white text-[10px] px-1 py-0 h-4">
                                            {dayResList.length} Kayıt
                                          </Badge>
                                        )}
                                      </div>

                                      <div className="space-y-1 mt-1 overflow-y-auto no-scrollbar flex-1 w-full">
                                        {dayResList.slice(0, 2).map((r) => {
                                          const h = hallById(r.hallId);
                                          const colorClass = getEventTypeColor(
                                            r.eventType,
                                          );
                                          return (
                                            <div
                                              key={r.id}
                                              className={`text-[10px] leading-tight p-1 rounded border truncate font-medium ${colorClass}`}
                                              title={`${r.customer} (${r.start} - ${h?.name})`}
                                            >
                                              <span className="font-mono font-bold mr-1">
                                                {r.start}
                                              </span>
                                              {r.customer}
                                            </div>
                                          );
                                        })}
                                        {dayResList.length > 2 && (
                                          <div
                                            className={`text-[9px] font-semibold text-center py-0.5 ${
                                              theme === "dark"
                                                ? "text-slate-400"
                                                : "text-slate-600"
                                            }`}
                                          >
                                            +{dayResList.length - 2} daha
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )
                          : (
                            /* Timeline View */
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                              <h3
                                className={`text-xs font-bold uppercase tracking-wider ${
                                  theme === "dark"
                                    ? "text-slate-400"
                                    : "text-slate-600"
                                }`}
                              >
                                {trMonths[cursor.getMonth()]}{" "}
                                {cursor.getFullYear()} Tüm Etkinlik Çizelgesi
                              </h3>
                              {filteredReservations.length === 0
                                ? (
                                  <p className="text-xs text-slate-500 py-12 text-center">
                                    Bu ay için henüz etkinlik kaydı yok.
                                  </p>
                                )
                                : (
                                  filteredReservations.map((r) => {
                                    const h = hallById(r.hallId);
                                    const v = store.venues.find((x) =>
                                      x.id === r.venueId
                                    );
                                    const colorClass = getEventTypeColor(
                                      r.eventType,
                                    );

                                    return (
                                      <div
                                        key={r.id}
                                        onClick={() => setSelectedDay(r.date)}
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                                          r.date === selectedDay
                                            ? "border-indigo-500 bg-indigo-950/20"
                                            : theme === "dark"
                                            ? "bg-slate-950 border-slate-800 hover:bg-slate-800/40"
                                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="text-center font-mono shrink-0 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                                            <span className="text-xs font-bold text-indigo-500 block">
                                              {r.date}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                              {r.start} - {r.end}
                                            </span>
                                          </div>
                                          <div>
                                            <p
                                              className={`text-xs font-bold ${
                                                theme === "dark"
                                                  ? "text-slate-100"
                                                  : "text-slate-900"
                                              }`}
                                            >
                                              {r.customer}
                                            </p>
                                            <p
                                              className={`text-[11px] ${
                                                theme === "dark"
                                                  ? "text-slate-400"
                                                  : "text-slate-600"
                                              }`}
                                            >
                                              {v?.name} •{" "}
                                              <span className="font-semibold text-indigo-500">
                                                {h?.name}
                                              </span>
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                          <Badge
                                            variant="outline"
                                            className={`text-[10px] ${colorClass}`}
                                          >
                                            {r.eventType || "Etkinlik"}
                                          </Badge>
                                          <span className="font-bold text-emerald-500 text-xs">
                                            {money(r.price)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                            </div>
                          )}
                      </CardContent>
                    </Card>

                    {/* Right Column: Selected Day Details */}
                    <Card
                      className={`lg:col-span-4 flex flex-col ${
                        theme === "dark"
                          ? "bg-slate-900/80 border-slate-800"
                          : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <CardHeader
                        className={`pb-3 border-b flex flex-row items-center justify-between ${
                          theme === "dark"
                            ? "border-slate-800"
                            : "border-slate-200"
                        }`}
                      >
                        <div>
                          <CardTitle
                            className={`text-sm font-bold flex items-center gap-2 ${
                              theme === "dark"
                                ? "text-slate-100"
                                : "text-slate-900"
                            }`}
                          >
                            <CalendarIcon className="h-4 w-4 text-indigo-500" />
                            {" "}
                            {selectedDay}
                          </CardTitle>
                          <CardDescription
                            className={`text-[11px] mt-0.5 ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            {(byDate.get(selectedDay) ?? []).length}{" "}
                            Kayıtlı Etkinlik
                          </CardDescription>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => {
                            if (store.venues.length === 0) {
                              toast.error("Önce mekan ekleyin.");
                              return;
                            }
                            const firstV = store.venues[0];
                            setResVenueId(firstV.id);
                            if (firstV.halls.length > 0) {
                              setResHallId(firstV.halls[0].id);
                            }
                            setResModalOpen(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] h-7 px-2.5 font-semibold"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Yeni Kayıt
                        </Button>
                      </CardHeader>

                      <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[550px]">
                        {(byDate.get(selectedDay) ?? []).length === 0
                          ? (
                            <div
                              className={`text-center py-12 space-y-2 ${
                                theme === "dark"
                                  ? "text-slate-500"
                                  : "text-slate-400"
                              }`}
                            >
                              <CalendarIcon className="h-8 w-8 mx-auto opacity-30 text-indigo-500" />
                              <p className="text-xs">
                                Bu tarih için henüz bir etkinlik tanımı
                                bulunmuyor.
                              </p>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (store.venues.length === 0) {
                                    toast.error("Önce bir mekan ekleyin.");
                                    return;
                                  }
                                  const firstV = store.venues[0];
                                  setResVenueId(firstV.id);
                                  if (firstV.halls.length > 0) {
                                    setResHallId(firstV.halls[0].id);
                                  }
                                  setResModalOpen(true);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-3.5 font-semibold shadow-xs"
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />{" "}
                                Etkinlik Oluştur
                              </Button>
                            </div>
                          )
                          : (
                            (byDate.get(selectedDay) ?? []).map((r) => {
                              const h = hallById(r.hallId);
                              const v = store.venues.find((x) =>
                                x.id === r.venueId
                              );
                              const rem = r.price - r.paid;
                              const colorClass = getEventTypeColor(r.eventType);

                              return (
                                <div
                                  key={r.id}
                                  className={`p-4 rounded-xl border space-y-3 ${
                                    theme === "dark"
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200 shadow-2xs"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4
                                        className={`text-sm font-bold ${
                                          theme === "dark"
                                            ? "text-slate-100"
                                            : "text-slate-900"
                                        }`}
                                      >
                                        {r.customer}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] ${colorClass}`}
                                        >
                                          {r.eventType || "Etkinlik"}
                                        </Badge>
                                        <span
                                          className={`text-[11px] font-mono ${
                                            theme === "dark"
                                              ? "text-slate-400"
                                              : "text-slate-500"
                                          }`}
                                        >
                                          📞 {r.phone}
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        promptDelete(
                                          "reservation",
                                          r.id,
                                          `${r.customer} (${r.date})`,
                                        )}
                                      className="h-7 w-7 text-slate-500 hover:text-rose-500"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>

                                  <div
                                    className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                                      theme === "dark"
                                        ? "bg-slate-900/80 border-slate-800"
                                        : "bg-white border-slate-200"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span
                                        className={`font-medium ${
                                          theme === "dark"
                                            ? "text-slate-300"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {v?.name}
                                      </span>
                                      <span className="text-indigo-500 font-semibold">
                                        {h?.name}
                                      </span>
                                    </div>
                                    <div
                                      className={`text-[11px] flex justify-between items-center border-t pt-1 ${
                                        theme === "dark"
                                          ? "border-slate-800 text-slate-400"
                                          : "border-slate-100 text-slate-600"
                                      }`}
                                    >
                                      <span>Saat Aralığı:</span>
                                      <span className="font-mono font-semibold text-emerald-500">
                                        {r.start} - {r.end}{" "}
                                        ({hoursBetween(r.start, r.end)} Saat)
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] pt-0.5">
                                      <span
                                        className={theme === "dark"
                                          ? "text-slate-400"
                                          : "text-slate-600"}
                                      >
                                        Finansal Durum:
                                      </span>
                                      <span className="font-bold text-emerald-500">
                                        {money(r.price)}
                                      </span>
                                    </div>
                                    {rem > 0 && (
                                      <div className="flex justify-between items-center text-[10px] text-amber-500 font-semibold">
                                        <span>Kalan Bakiye:</span>
                                        <span>{money(rem)}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handlePrintOfficialDoc(r)}
                                      className={`flex-1 text-xs h-7.5 px-2 font-medium ${
                                        theme === "dark"
                                          ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                                          : "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                                      }`}
                                      title="Resmi Tahsis Belgesi & Rapor Yazdır"
                                    >
                                      <Printer className="h-3 w-3 mr-1 text-emerald-500" />
                                      Resmi Belge
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCopySMS(r)}
                                      className={`flex-1 text-xs h-7.5 px-2 ${
                                        theme === "dark"
                                          ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                                          : "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                                      }`}
                                    >
                                      <Copy className="h-3 w-3 mr-1 text-amber-500" />
                                      {" "}
                                      WhatsApp
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuickMail(r)}
                                      className={`flex-1 text-xs h-7.5 px-2 ${
                                        theme === "dark"
                                          ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                                          : "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                                      }`}
                                    >
                                      <Mail className="h-3 w-3 mr-1 text-sky-500" />
                                      {" "}
                                      E-posta
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ==================================================================== */}
              {/* 3. VENUES SECTION                                                    */}
              {/* ==================================================================== */}
              {activeSection === "venues" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`text-lg font-bold ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        Mekanlar, Tesisler & Salonlar
                      </h3>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Mekan ekleyin, kat bazlı salon ve saatlik kira
                        tarifelerini düzenleyin.
                      </p>
                    </div>
                    <Button
                      onClick={() => setVenueModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Yeni Mekan Ekle
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {store.venues.map((v) => (
                      <Card
                        key={v.id}
                        className={theme === "dark"
                          ? "bg-slate-900/80 border-slate-800"
                          : "bg-white border-slate-200 shadow-sm"}
                      >
                        <CardHeader
                          className={`flex flex-row items-center justify-between pb-3 border-b ${
                            theme === "dark"
                              ? "border-slate-800"
                              : "border-slate-200"
                          }`}
                        >
                          <div>
                            <CardTitle
                              className={`text-base font-bold flex items-center gap-2 ${
                                theme === "dark"
                                  ? "text-slate-100"
                                  : "text-slate-900"
                              }`}
                            >
                              <Building2 className="h-4 w-4 text-indigo-500" />
                              {" "}
                              {v.name}
                            </CardTitle>
                            <CardDescription
                              className={`text-xs mt-0.5 ${
                                theme === "dark"
                                  ? "text-slate-400"
                                  : "text-slate-600"
                              }`}
                            >
                              Konum: {v.district} • Kategori:{" "}
                              {v.category || "Genel"}
                            </CardDescription>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => promptDelete("venue", v.id, v.name)}
                            className="h-8 w-8 text-slate-500 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>

                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold uppercase tracking-wider ${
                                theme === "dark"
                                  ? "text-slate-300"
                                  : "text-slate-700"
                              }`}
                            >
                              Salonlar ({v.halls.length})
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setTargetVenueId(v.id);
                                setHallModalOpen(true);
                              }}
                              className={`text-xs h-7 text-indigo-500 ${
                                theme === "dark"
                                  ? "border-slate-800"
                                  : "border-slate-300"
                              }`}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Salon Ekle
                            </Button>
                          </div>

                          {v.halls.length === 0
                            ? (
                              <p
                                className={`text-xs py-4 text-center ${
                                  theme === "dark"
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                }`}
                              >
                                Bu mekanda salon bulunmuyor.
                              </p>
                            )
                            : (
                              <div className="space-y-2">
                                {v.halls.map((h) => (
                                  <div
                                    key={h.id}
                                    className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                                      theme === "dark"
                                        ? "bg-slate-950 border-slate-800 text-slate-200"
                                        : "bg-slate-50 border-slate-200 text-slate-800"
                                    }`}
                                  >
                                    <div>
                                      <p
                                        className={`font-bold ${
                                          theme === "dark"
                                            ? "text-slate-200"
                                            : "text-slate-900"
                                        }`}
                                      >
                                        {h.name}
                                      </p>
                                      <p
                                        className={`text-[11px] ${
                                          theme === "dark"
                                            ? "text-slate-400"
                                            : "text-slate-600"
                                        }`}
                                      >
                                        {h.floor} • Kapasite: {h.capacity} Kişi
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-emerald-500">
                                        {money(h.hourlyPrice)} / Saat
                                      </span>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                          promptDelete(
                                            "hall",
                                            h.id,
                                            h.name,
                                            v.id,
                                          )}
                                        className="h-6 w-6 text-slate-500 hover:text-rose-500"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================================================================== */}
              {/* 4. EVENTS LIST SECTION                                               */}
              {/* ==================================================================== */}
              {activeSection === "events" && (
                <Card
                  className={theme === "dark"
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-white border-slate-200 shadow-sm"}
                >
                  <CardHeader
                    className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
                      theme === "dark" ? "border-slate-800" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <CardTitle
                        className={`text-base font-bold ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        Etkinlik & Rezervasyon Listesi
                      </CardTitle>
                      <CardDescription
                        className={`text-xs ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Filtreleme ve arama ile tüm etkinlik kayıtları.
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={eventTypeFilter}
                        onValueChange={setEventTypeFilter}
                      >
                        <SelectTrigger
                          className={`w-[180px] text-xs ${
                            theme === "dark"
                              ? "bg-slate-950 border-slate-800 text-slate-200"
                              : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        >
                          <SelectValue placeholder="Etkinlik Türü" />
                        </SelectTrigger>
                        <SelectContent
                          className={theme === "dark"
                            ? "bg-slate-900 border-slate-800 text-slate-200"
                            : "bg-white border-slate-200 text-slate-900"}
                        >
                          <SelectItem value="all">
                            Tüm Etkinlik Türleri
                          </SelectItem>
                          {allEventTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 overflow-x-auto">
                    <table
                      className={`w-full text-left text-xs ${
                        theme === "dark" ? "text-slate-300" : "text-slate-800"
                      }`}
                    >
                      <thead
                        className={`uppercase font-mono text-[11px] border-b ${
                          theme === "dark"
                            ? "bg-slate-950 text-slate-400 border-slate-800"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <tr>
                          <th className="p-3.5">Müşteri / Etkinlik</th>
                          <th className="p-3.5">Tarih & Saat</th>
                          <th className="p-3.5">Mekan / Salon</th>
                          <th className="p-3.5">Tür</th>
                          <th className="p-3.5 text-right">Toplam</th>
                          <th className="p-3.5 text-right">Ödenen</th>
                          <th className="p-3.5 text-center">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y ${
                          theme === "dark"
                            ? "divide-slate-800/60"
                            : "divide-slate-200"
                        }`}
                      >
                        {filteredReservations.map((r) => {
                          const h = hallById(r.hallId);
                          const v = store.venues.find((x) =>
                            x.id === r.venueId
                          );

                          return (
                            <tr
                              key={r.id}
                              className={`transition-colors ${
                                theme === "dark"
                                  ? "hover:bg-slate-800/30"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <td className="p-3.5">
                                <span
                                  className={`font-bold block ${
                                    theme === "dark"
                                      ? "text-slate-200"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {r.customer}
                                </span>
                                <span
                                  className={`text-[11px] ${
                                    theme === "dark"
                                      ? "text-slate-400"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {r.phone}
                                </span>
                              </td>
                              <td className="p-3.5 font-mono">
                                <div>{r.date}</div>
                                <div
                                  className={`text-[11px] ${
                                    theme === "dark"
                                      ? "text-slate-400"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {r.start} - {r.end}
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span>{v?.name}</span>
                                <span className="text-indigo-500 block font-semibold">
                                  {h?.name}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <Badge
                                  variant="outline"
                                  className="border-indigo-500/30 text-indigo-500 text-[10px]"
                                >
                                  {r.eventType || "Etkinlik"}
                                </Badge>
                              </td>
                              <td
                                className={`p-3.5 text-right font-bold ${
                                  theme === "dark"
                                    ? "text-slate-200"
                                    : "text-slate-900"
                                }`}
                              >
                                {money(r.price)}
                              </td>
                              <td className="p-3.5 text-right font-bold text-emerald-500">
                                {money(r.paid)}
                              </td>
                              <td className="p-3.5 text-center">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    promptDelete(
                                      "reservation",
                                      r.id,
                                      `${r.customer} (${r.date})`,
                                    )}
                                  className="h-7 w-7 text-slate-500 hover:text-rose-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {/* ==================================================================== */}
              {/* 5. REPORTS SECTION                                                   */}
              {/* ==================================================================== */}
              {activeSection === "reports" && (
                <Card
                  className={theme === "dark"
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-white border-slate-200 shadow-sm"}
                >
                  <CardHeader
                    className={`flex flex-row items-center justify-between pb-4 border-b ${
                      theme === "dark" ? "border-slate-800" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <CardTitle
                        className={`text-base font-bold ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        Mali Raporlar & Döküm
                      </CardTitle>
                      <CardDescription
                        className={`text-xs ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Tüm mekanların gelir, tahsilat ve alacak durumları.
                      </CardDescription>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info("Excel raporu indirildi.")}
                        className={`text-xs h-8 text-emerald-500 ${
                          theme === "dark"
                            ? "border-slate-800"
                            : "border-slate-300"
                        }`}
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />{" "}
                        Excel Raporu
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div
                        className={`p-4 rounded-xl border ${
                          theme === "dark"
                            ? "bg-slate-950 border-slate-800"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <p
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          Toplam Tahakkuk
                        </p>
                        <p
                          className={`text-xl font-bold mt-1 ${
                            theme === "dark"
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          {money(monthStats.totalRev)}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-xl border ${
                          theme === "dark"
                            ? "bg-slate-950 border-slate-800"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <p
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          Toplam Tahsilat
                        </p>
                        <p className="text-xl font-bold text-emerald-500 mt-1">
                          {money(monthStats.totalPaid)}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-xl border ${
                          theme === "dark"
                            ? "bg-slate-950 border-slate-800"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <p
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          Kalan Alacak
                        </p>
                        <p className="text-xl font-bold text-amber-500 mt-1">
                          {money(monthStats.remaining)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ==================================================================== */}
              {/* 6. SETTINGS SECTION                                                  */}
              {/* ==================================================================== */}
              {activeSection === "settings" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    className={theme === "dark"
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-white border-slate-200 shadow-sm"}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`text-base font-bold flex items-center gap-2 ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        <Mail className="h-5 w-5 text-indigo-500" />{" "}
                        E-posta & SMTP Entegrasyonu
                      </CardTitle>
                      <CardDescription
                        className={`text-xs ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Müşterilere rezervasyon dökümü ve bildirim e-postası
                        göndermek için SMTP sunucusu.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => setMailModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-xs w-full"
                      >
                        SMTP Ayarlarını Düzenle & Mail Gönder
                      </Button>
                    </CardContent>
                  </Card>

                  <Card
                    className={theme === "dark"
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-white border-slate-200 shadow-sm"}
                  >
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle
                          className={`text-base font-bold flex items-center gap-2 ${
                            theme === "dark"
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          <PartyPopper className="h-5 w-5 text-indigo-500" />
                          {" "}
                          Etkinlik Kategori & Tür Yönetimi
                        </CardTitle>
                        <CardDescription
                          className={`text-xs mt-0.5 ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          Sistemdeki tüm etkinlik türlerini ekleyin veya silin.
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetEventTypes}
                        className={`text-xs h-7 px-2.5 font-medium border ${
                          theme === "dark"
                            ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                            : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Öntanımlı türleri geri yükle"
                      >
                        Varsayılana Sıfırla
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Yeni özel etkinlik türü (örn: Doğum Günü)"
                          value={newEventTypeInput}
                          onChange={(e) => setNewEventTypeInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddCustomEventType()}
                          className={`text-xs ${
                            theme === "dark"
                              ? "bg-slate-950 border-slate-800 text-slate-100"
                              : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                        <Button
                          onClick={() => handleAddCustomEventType()}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0 font-medium"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Ekle
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1 max-h-48 overflow-y-auto">
                        {allEventTypes.map((t) => {
                          const colorClass = getEventTypeColor(t);
                          return (
                            <span
                              key={t}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${colorClass}`}
                            >
                              {t}
                              <button
                                onClick={() => handleRemoveEventType(t)}
                                className="hover:text-rose-500 ml-1 text-xs font-bold transition-colors"
                                title={`"${t}" türünü sil`}
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Institutional Identity & Base64 Logo Card with Save & Cancel */}
                  <Card
                    className={theme === "dark"
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-white border-slate-200 shadow-sm"}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`text-base font-bold flex items-center gap-2 ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        <User className="h-5 w-5 text-indigo-500" />{" "}
                        Kurumsal Kimlik & Logo Yönetimi (Base64)
                      </CardTitle>
                      <CardDescription
                        className={`text-xs ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Resmi evrak, döküm ve raporlarda kullanılacak kurum adı
                        ve logosu.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label
                          className={`text-xs font-medium ${
                            theme === "dark"
                              ? "text-slate-300"
                              : "text-slate-700"
                          }`}
                        >
                          Kurum / İşletme Resmi Adı
                        </Label>
                        <Input
                          placeholder="örn: Ankara İl Milli Eğitim Müdürlüğü"
                          value={draftInstitutionName}
                          onChange={(e) =>
                            setDraftInstitutionName(e.target.value)}
                          className={`text-xs mt-1 ${
                            theme === "dark"
                              ? "bg-slate-950 border-slate-800 text-slate-100"
                              : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>

                      <div>
                        <Label
                          className={`text-xs font-medium block mb-1.5 ${
                            theme === "dark"
                              ? "text-slate-300"
                              : "text-slate-700"
                          }`}
                        >
                          Kurum Logosu (Base64)
                        </Label>
                        <div className="flex items-center gap-3">
                          {draftInstitutionLogo
                            ? (
                              <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                                <img
                                  src={draftInstitutionLogo}
                                  alt="Kurum Logosu"
                                  className="h-full w-full object-contain p-1"
                                />
                              </div>
                            )
                            : (
                              <div className="h-14 w-14 rounded-lg border border-dashed border-slate-400 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                                Logo Yok
                              </div>
                            )}
                          <div className="space-y-1.5 flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              id="logo-upload-input"
                              onChange={handleDraftLogoUpload}
                              className="hidden"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  document.getElementById("logo-upload-input")
                                    ?.click()}
                                variant="outline"
                                className={`text-xs h-8 px-3 border font-medium ${
                                  theme === "dark"
                                    ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
                                    : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                                }`}
                              >
                                Logo Yükle
                              </Button>
                              {draftInstitutionLogo && (
                                <Button
                                  onClick={handleRemoveDraftLogo}
                                  variant="ghost"
                                  className="text-xs h-8 text-rose-500 hover:text-rose-600"
                                >
                                  Kaldır
                                </Button>
                              )}
                            </div>
                            <p
                              className={`text-[10px] ${
                                theme === "dark"
                                  ? "text-slate-500"
                                  : "text-slate-400"
                              }`}
                            >
                              PNG / JPG (Maks. 2MB). Dosya Base64 olarak
                              saklanır.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Kaydet & Vazgeç */}
                      <div
                        className={`flex items-center justify-end gap-2 pt-3 border-t ${
                          theme === "dark"
                            ? "border-slate-800/80"
                            : "border-slate-200"
                        }`}
                      >
                        <Button
                          variant="ghost"
                          onClick={handleCancelInstitutionSettings}
                          className={`text-xs h-8 px-3 font-semibold transition-colors ${
                            theme === "dark"
                              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          Vazgeç
                        </Button>
                        <Button
                          onClick={handleSaveInstitutionSettings}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />{" "}
                          Değişiklikleri Kaydet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Official Tariff & Council Decision Basis Card with Save & Cancel */}
                  <Card
                    className={theme === "dark"
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-white border-slate-200 shadow-sm"}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`text-base font-bold flex items-center gap-2 ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        <Scale className="h-5 w-5 text-amber-500" />{" "}
                        Resmi Tarife & Encümen Kararı Dayanağı
                      </CardTitle>
                      <CardDescription
                        className={`text-xs ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Belediye encümeni veya meclis kararı ücret tarifesi
                        dayanağı.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label
                          className={`text-xs font-medium ${
                            theme === "dark"
                              ? "text-slate-300"
                              : "text-slate-700"
                          }`}
                        >
                          Varsayılan Karar & Tarife Dayanağı
                        </Label>
                        <Input
                          placeholder="örn: Belediye Encümeni Kararı: 15/01/2026 - Karar No: 42 (2464 Sayılı Kanun Md. 97)"
                          value={draftTariffBasis}
                          onChange={(e) => setDraftTariffBasis(e.target.value)}
                          className={`text-xs mt-1 ${
                            theme === "dark"
                              ? "bg-slate-950 border-slate-800 text-slate-100"
                              : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>

                      {/* Action Buttons: Kaydet & Vazgeç */}
                      <div
                        className={`flex items-center justify-end gap-2 pt-3 border-t ${
                          theme === "dark"
                            ? "border-slate-800/80"
                            : "border-slate-200"
                        }`}
                      >
                        <Button
                          variant="ghost"
                          onClick={handleCancelTariffSettings}
                          className={`text-xs h-8 px-3 font-semibold transition-colors ${
                            theme === "dark"
                              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          Vazgeç
                        </Button>
                        <Button
                          onClick={handleSaveTariffSettings}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />{" "}
                          Değişiklikleri Kaydet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================================== */}
        {/* DIALOG MODALS                                                            */}
        {/* ======================================================================== */}

        {/* 1. New Reservation Dialog */}
        <Dialog open={resModalOpen} onOpenChange={setResModalOpen}>
          <DialogContent
            className={theme === "dark"
              ? "sm:max-w-[520px] bg-slate-900 border-slate-800 text-slate-100"
              : "sm:max-w-[520px] bg-white border-slate-200 text-slate-900 shadow-2xl"}
          >
            <DialogHeader>
              <DialogTitle
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Yeni Etkinlik & Salon Kiralama
              </DialogTitle>
              <DialogDescription
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Tarih:{" "}
                <strong className="text-indigo-500">{selectedDay}</strong>
              </DialogDescription>
            </DialogHeader>

            {/* Past Date Warning Banner */}
            {selectedDay < toKey(new Date()) && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  theme === "dark"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-amber-50 border-amber-300 text-amber-800"
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  Uyarı: <strong>{selectedDay}</strong>{" "}
                  geçmiş bir tarihtir! Etkinlik geçmiş tarihli olarak
                  kaydedilecektir.
                </span>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Mekan / Tesis
                  </Label>
                  <Select
                    value={resVenueId}
                    onValueChange={(v) => {
                      setResVenueId(v);
                      const found = store.venues.find((x) => x.id === v);
                      if (found && found.halls.length > 0) {
                        setResHallId(found.halls[0].id);
                      }
                    }}
                  >
                    <SelectTrigger
                      className={`mt-1 text-xs ${
                        theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    >
                      <SelectValue placeholder="Mekan seçin" />
                    </SelectTrigger>
                    <SelectContent
                      className={theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-white border-slate-200 text-slate-900"}
                    >
                      {store.venues.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Salon
                  </Label>
                  <Select value={resHallId} onValueChange={setResHallId}>
                    <SelectTrigger
                      className={`mt-1 text-xs ${
                        theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    >
                      <SelectValue placeholder="Salon seçin" />
                    </SelectTrigger>
                    <SelectContent
                      className={theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-white border-slate-200 text-slate-900"}
                    >
                      {(store.venues.find((x) => x.id === resVenueId)?.halls ??
                        []).map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name} ({money(h.hourlyPrice)}/s)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Etkinlik Türü
                  </Label>
                  <Select value={resEventType} onValueChange={setResEventType}>
                    <SelectTrigger
                      className={`mt-1 text-xs ${
                        theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-white border-slate-200 text-slate-900"}
                    >
                      {allEventTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Müşteri / Kurum Adı *
                  </Label>
                  <Input
                    required
                    list="customer-suggestions"
                    placeholder="örn: Yılmaz Ailesi / XYZ A.Ş."
                    value={resCustomer}
                    onChange={(e) => setResCustomer(e.target.value)}
                    className={`mt-1 text-xs ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                  <datalist id="customer-suggestions">
                    {customerSuggestions.map((c) => (
                      <option
                        key={c}
                        value={c}
                      />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Başlangıç Saati
                  </Label>
                  <Select value={resStart} onValueChange={setResStart}>
                    <SelectTrigger
                      className={`mt-1 text-xs ${
                        theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`max-h-48 ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-800 text-slate-200"
                          : "bg-white border-slate-200 text-slate-900"
                      }`}
                    >
                      {timeSlots.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Bitiş Saati
                  </Label>
                  <Select value={resEnd} onValueChange={setResEnd}>
                    <SelectTrigger
                      className={`mt-1 text-xs ${
                        theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`max-h-48 ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-800 text-slate-200"
                          : "bg-white border-slate-200 text-slate-900"
                      }`}
                    >
                      {timeSlots.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Telefon No *
                  </Label>
                  <Input
                    required
                    list="phone-suggestions"
                    placeholder="05xx xxx xx xx"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className={`mt-1 text-xs ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                  <datalist id="phone-suggestions">
                    {phoneSuggestions.map((p) => <option key={p} value={p} />)}
                  </datalist>
                </div>

                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Hesaplanan Toplam Ücret (TL)
                  </Label>
                  <Input
                    type="number"
                    value={resPrice}
                    onChange={(e) =>
                      setResPrice(e.target.value ? Number(e.target.value) : "")}
                    className={`mt-1 text-xs font-bold ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <Label
                  className={`text-xs font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Alınan Peşinat (TL)
                </Label>
                <Input
                  type="number"
                  value={resPaid}
                  onChange={(e) =>
                    setResPaid(e.target.value ? Number(e.target.value) : "")}
                  className={`mt-1 text-xs font-bold ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-emerald-400"
                      : "bg-slate-50 border-slate-300 text-emerald-600"
                  }`}
                />
              </div>

              <div>
                <Label
                  className={`text-xs font-medium flex items-center gap-1.5 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <Scale className="h-3.5 w-3.5 text-amber-500" />{" "}
                  Resmi Tarife & Encümen Kararı Dayanağı
                </Label>
                <Input
                  list="decision-suggestions"
                  placeholder="örn: Belediye Encümeni Kararı: 15/01/2026 - No: 42 (2464 Sayılı Kanun Md. 97)"
                  value={resDecisionInfo}
                  onChange={(e) => setResDecisionInfo(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <datalist id="decision-suggestions">
                  {decisionSuggestions.map((d) => <option key={d} value={d} />)}
                </datalist>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setResModalOpen(false)}
                  className="text-xs"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                >
                  Etkinliği Kaydet (SQLite)
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 2. New Venue Dialog */}
        <Dialog open={venueModalOpen} onOpenChange={setVenueModalOpen}>
          <DialogContent
            className={theme === "dark"
              ? "sm:max-w-[420px] bg-slate-900 border-slate-800 text-slate-100"
              : "sm:max-w-[420px] bg-white border-slate-200 text-slate-900 shadow-2xl"}
          >
            <DialogHeader>
              <DialogTitle
                className={`text-base font-bold ${
                  theme === "dark" ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Yeni Mekan / Tesis Tanımla
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateVenue} className="space-y-4 py-2">
              <div>
                <Label
                  className={`text-xs font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Mekan / İşletme Adı
                </Label>
                <Input
                  required
                  placeholder="örn: Grand Plaza Kongre & Balo Merkezi"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <Label
                  className={`text-xs font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Konum / İlçe
                </Label>
                <Input
                  required
                  placeholder="örn: Kadıköy / Çankaya"
                  value={newVenueDistrict}
                  onChange={(e) => setNewVenueDistrict(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <Label
                  className={`text-xs font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Mekan Kategorisi
                </Label>
                <Select
                  value={newVenueCategory}
                  onValueChange={setNewVenueCategory}
                >
                  <SelectTrigger
                    className={`mt-1 text-xs ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-200"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"}
                  >
                    <SelectItem value="Kongre & Balo">
                      Kongre & Balo Merkezi
                    </SelectItem>
                    <SelectItem value="Kültür Merkezi">
                      Kültür Merkezi
                    </SelectItem>
                    <SelectItem value="Otel & Balo">
                      Otel Balo Salonu
                    </SelectItem>
                    <SelectItem value="Düğün & Davet">
                      Düğün & Davet Alanı
                    </SelectItem>
                    <SelectItem value="Performans Sahnesi">
                      Performans Sahnesi & Amfi
                    </SelectItem>
                    <SelectItem value="Toplantı Alanı">
                      Toplantı & Seminer Alanı
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                >
                  Mekan Kaydet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 3. New Hall Dialog */}
        <Dialog open={hallModalOpen} onOpenChange={setHallModalOpen}>
          <DialogContent
            className={theme === "dark"
              ? "sm:max-w-[400px] bg-slate-900 border-slate-800 text-slate-100"
              : "sm:max-w-[400px] bg-white border-slate-200 text-slate-900 shadow-2xl"}
          >
            <DialogHeader>
              <DialogTitle
                className={`text-base font-bold ${
                  theme === "dark" ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Mekana Salon / Alan Ekle
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateHall} className="space-y-4 py-2">
              <div>
                <Label
                  className={`text-xs font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Salon Adı
                </Label>
                <Input
                  required
                  placeholder="örn: Safir Balo Salonu"
                  value={newHallName}
                  onChange={(e) => setNewHallName(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <Label
                  className={`text-xs font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Kat / Blok Bilgisi
                </Label>
                <Input
                  placeholder="örn: Zemin Kat / A Blok"
                  value={newHallFloor}
                  onChange={(e) => setNewHallFloor(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Kapasite (Kişi)
                  </Label>
                  <Input
                    type="number"
                    value={newHallCapacity}
                    onChange={(e) => setNewHallCapacity(Number(e.target.value))}
                    className={`mt-1 text-xs ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <Label
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Saatlik Kira (TL)
                  </Label>
                  <Input
                    type="number"
                    value={newHallHourlyPrice}
                    onChange={(e) =>
                      setNewHallHourlyPrice(Number(e.target.value))}
                    className={`mt-1 text-xs font-semibold ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                >
                  Salon Kaydet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 4. Mail Dialog */}
        <MailDialog
          open={mailModalOpen}
          onOpenChange={setMailModalOpen}
          defaultRecipient={mailPreset.recipient}
          defaultSubject={mailPreset.subject}
          defaultBody={mailPreset.body}
          theme={theme}
        />

        {/* 5. Copy Settings Modal */}
        <CopySettingsModal
          open={copyModalOpen}
          onOpenChange={setCopyModalOpen}
        />

        {/* 6. Delete Confirmation Safeguard Alert Dialog */}
        <AlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
        >
          <AlertDialogContent
            className={theme === "dark"
              ? "bg-slate-900 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-900"}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-rose-500 text-base font-bold">
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                Silme İşlemini Onaylayın
              </AlertDialogTitle>
              <AlertDialogDescription
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                <strong>"{deleteTarget?.title}"</strong>{" "}
                kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz
                ve bağımlı kayıtlar kontrol edilecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-2">
              <AlertDialogCancel
                className={`text-xs h-9 ${
                  theme === "dark"
                    ? "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                    : ""
                }`}
              >
                Vazgeç
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleExecuteDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 font-medium"
              >
                Evet, Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 8. Official Document Print Modal */}
        <OfficialPrintModal
          open={printModalOpen}
          onOpenChange={setPrintModalOpen}
          reservation={selectedPrintReservation}
          venue={store.venues.find((v) =>
            v.id === selectedPrintReservation?.venueId
          )}
          hall={hallById(selectedPrintReservation?.hallId || "")}
          institutionName={institutionName}
          institutionLogo={institutionLogo}
          defaultTariffBasis={defaultTariffBasis}
          theme={theme}
        />
      </div>
    </div>
  );
}
