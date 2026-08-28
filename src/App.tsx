import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  Calendar as CalendarIcon,
  Database,
  Download,
  FilePlus2,
  FolderOpen,
  HelpCircle,
  KeyRound,
  Layers,
  LayoutDashboard,
  Menu,
  Minus,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Square,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";

import {
  allEventTypes,
  hoursBetween,
  money,
  type NavSection,
  type PricingMode,
  type Reservation,
  timeSlots,
  toKey,
  type Venue,
} from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { useSettingsStore } from "@/store/settingsStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useTabStore } from "@/store/tabStore";

import { Footer } from "@/components/footer";
import { MailDialog } from "@/components/mail-dialog";
import { CopySettingsModal } from "@/components/copy-settings-modal";
import { OfficialPrintModal } from "@/components/official-print-modal";
import { LauncherModal } from "@/components/launcher-modal";
import { WelcomeStartScreen } from "@/components/welcome-start-screen";

import { DashboardScreen } from "@/screens/dashboard.screen";
import { CalendarScreen } from "@/screens/calendar.screen";
import { VenuesScreen } from "@/screens/venues.screen";
import { EventsScreen } from "@/screens/events.screen";
import { PersonnelScreen } from "@/screens/personnel.screen";
import { ReportsScreen } from "@/screens/reports.screen";
import { SettingsScreen } from "@/screens/settings.screen";

import { NewReservationModal } from "@/components/modals/new-reservation-modal";
import { NewVenueModal } from "@/components/modals/new-venue-modal";
import { NewHallModal } from "@/components/modals/new-hall-modal";
import { PersonnelModal } from "@/components/modals/personnel-modal";
import { ReservationDrawer } from "@/components/modals/reservation-drawer";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function App(): React.JSX.Element {
  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sidebar Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Store & Settings Hooks
  const {
    institutionName,
    institutionLogo,
    defaultTariffBasis,
    setInstitutionName,
    setInstitutionLogo,
    setDefaultTariffBasis,
  } = useSettingsStore();

  const {
    activeDosyaId,
    fileName,
    currentFilePath,
    isStartingFile,
    recentFiles,
    openFile,
    createFile,
    saveFileAs,
    closeFile,
    fetchRecentFiles,
  } = useWorkspaceStore();

  const { tabs, activeTabId, removeTab, setActiveTab } = useTabStore();

  // Launcher Modal State
  const [showLauncherModal, setShowLauncherModal] = useState(false);

  // Custom Event Types State
  const [customEventTypes, setCustomEventTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("custom_event_types");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const mergedEventTypes = useMemo(() => {
    const set = new Set([...allEventTypes, ...customEventTypes]);
    return Array.from(set);
  }, [customEventTypes]);

  const [newEventTypeInput, setNewEventTypeInput] = useState("");

  const handleAddCustomEventType = (typeName?: string) => {
    const val = (typeName || newEventTypeInput).trim();
    if (!val) return;
    if (mergedEventTypes.includes(val)) {
      toast.error(`"${val}" türü zaten mevcut.`);
      return;
    }
    const updated = [...customEventTypes, val];
    setCustomEventTypes(updated);
    localStorage.setItem("custom_event_types", JSON.stringify(updated));
    setNewEventTypeInput("");
    toast.success(`"${val}" türü eklendi.`);
  };

  const handleRemoveEventType = (val: string) => {
    const updated = customEventTypes.filter((t) => t !== val);
    setCustomEventTypes(updated);
    localStorage.setItem("custom_event_types", JSON.stringify(updated));
    toast.info(`"${val}" türü listeden kaldırıldı.`);
  };

  const handleResetEventTypes = () => {
    setCustomEventTypes([]);
    localStorage.removeItem("custom_event_types");
    toast.success("Etkinlik türleri varsayılan değerlere sıfırlandı.");
  };

  const getEventTypeColor = (type?: string): string => {
    switch (type) {
      case "Düğün & Davet":
        return "bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400";
      case "Nişan & Kına":
        return "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
      case "Sünnet Düğünü":
        return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
      case "Konser & Tiyatro":
        return "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400";
      case "Kongre & Seminer":
        return "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400";
      case "Toplantı & Lansman":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400";
      case "Sergi & Fuar":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
      case "Mezuniyet & Balo":
        return "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400";
      case "Spor & Turnuva":
        return "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400";
      case "İftar & Yemek":
        return "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400";
    }
  };

  // SQLite Store State
  const [store, setStore] = useState(sqliteStore.getSnapshot());

  useEffect(() => {
    sqliteStore.loadFromDb().then(() => setStore(sqliteStore.getSnapshot()));
    const unsubscribe = sqliteStore.subscribe(() =>
      setStore(sqliteStore.getSnapshot())
    );
    return () => {
      unsubscribe();
    };
  }, [activeDosyaId]);

  // Navigation Section State
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");

  // Calendar State
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() =>
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState(() => toKey(today));
  const [calendarViewMode, setCalendarViewMode] = useState<"grid" | "timeline">(
    "grid",
  );
  const [calendarVenueFilter, setCalendarVenueFilter] = useState("all");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  // Modals & Drawers Visibility State
  const [resModalOpen, setResModalOpen] = useState(false);
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [personnelModalOpen, setPersonnelModalOpen] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Selected Item Drawer & Delete Confirmation
  const [selectedReservation, setSelectedReservation] = useState<
    Reservation | null
  >(null);
  const [selectedPrintReservation, setSelectedPrintReservation] = useState<
    Reservation | null
  >(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    {
      type: "venue" | "hall" | "reservation";
      id: string;
      title: string;
      venueId?: string;
    } | null
  >(null);

  // Edit Drawer Form States
  const [editReceiptNo, setEditReceiptNo] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("Nakit");
  const [editPaidAmount, setEditPaidAmount] = useState<number | "">("");

  useEffect(() => {
    if (selectedReservation) {
      setEditReceiptNo(selectedReservation.receiptNo || "");
      setEditPaymentMethod(selectedReservation.paymentMethod || "Nakit");
      setEditPaidAmount(selectedReservation.paid || 0);
    }
  }, [selectedReservation]);

  // Mail Modal Preset State
  const [mailPreset, setMailPreset] = useState({
    recipient: "",
    subject: "",
    body: "",
  });

  const handleQuickMail = (r: Reservation) => {
    const v = store.venues.find((x) => x.id === r.venueId);
    const h = store.venues.flatMap((x) => x.halls).find((x) =>
      x.id === r.hallId
    );
    const subject = `Etkinlik Rezervasyon Teyidi - ${r.customer} (${r.date})`;
    const body = `Sayın ${r.customer},\n\n` +
      `Mekan: ${v?.name || "-"}\n` +
      `Salon: ${h?.name || "-"}\n` +
      `Tarih: ${r.date} (${r.start} - ${r.end})\n` +
      `Etkinlik Türü: ${r.eventType || "Genel"}\n` +
      `Toplam Ücret: ${money(r.price)}\n` +
      `Ödenen Peşinat: ${money(r.paid)}\n` +
      `Kalan Bakiye: ${money(r.price - r.paid)}\n\n` +
      `Detaylı bilgi için bizimle iletişime geçebilirsiniz.`;

    setMailPreset({ recipient: "", subject, body });
    setMailModalOpen(true);
  };

  const handleCopySMS = (r: Reservation) => {
    const v = store.venues.find((x) => x.id === r.venueId);
    const h = store.venues.flatMap((x) => x.halls).find((x) =>
      x.id === r.hallId
    );
    const text =
      `Sn. ${r.customer}, ${r.date} tarihindeki ${v?.name} - ${h?.name} ${r.eventType} salon kiralamanız kaydedilmiştir. Saat: ${r.start}-${r.end}. Toplam: ${
        money(r.price)
      }. Bilgi için: 0532 000 0000`;
    navigator.clipboard.writeText(text);
    toast.success("Özet mesaj metni panoya kopyalandı!");
  };

  // Google Drive Settings State
  const [gdriveToken, setGdriveToken] = useState(() =>
    localStorage.getItem("gdrive_token") || ""
  );
  const [gdriveFolderId, setGdriveFolderId] = useState(() =>
    localStorage.getItem("gdrive_folder_id") || ""
  );

  // Draft Settings State
  const [draftInstitutionName, setDraftInstitutionName] = useState(
    institutionName,
  );
  const [draftInstitutionLogo, setDraftInstitutionLogo] = useState(
    institutionLogo,
  );
  const [draftTariffBasis, setDraftTariffBasis] = useState(defaultTariffBasis);

  useEffect(() => {
    setDraftInstitutionName(institutionName);
    setDraftInstitutionLogo(institutionLogo);
  }, [institutionName, institutionLogo]);

  useEffect(() => {
    setDraftTariffBasis(defaultTariffBasis);
  }, [defaultTariffBasis]);

  const handleSaveInstitutionSettings = () => {
    setInstitutionName(draftInstitutionName);
    setInstitutionLogo(draftInstitutionLogo);
    toast.success("Kurumsal kimlik ve logo başarıyla kaydedildi.");
  };

  const handleCancelInstitutionSettings = () => {
    setDraftInstitutionName(institutionName);
    setDraftInstitutionLogo(institutionLogo);
    toast.info("Değişiklikler iptal edildi.");
  };

  const handleSaveTariffSettings = () => {
    setDefaultTariffBasis(draftTariffBasis);
    toast.success("Resmi tarife ve karar dayanağı kaydedildi.");
  };

  const handleCancelTariffSettings = () => {
    setDraftTariffBasis(defaultTariffBasis);
    toast.info("Değişiklikler iptal edildi.");
  };

  const handleDraftLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo dosyası 2MB'dan büyük olamaz.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraftInstitutionLogo(reader.result as string);
      toast.success(
        "Logo seçildi. Değişiklikleri Kaydet butonuna basarak onaylayın.",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDraftLogo = () => {
    setDraftInstitutionLogo("");
    toast.info("Logo kaldırıldı.");
  };

  // Personnel Form State
  const [personnelName, setPersonnelName] = useState("");
  const [personnelTitle, setPersonnelTitle] = useState("");
  const [personnelPhone, setPersonnelPhone] = useState("");
  const [personnelEmail, setPersonnelEmail] = useState("");
  const [personnelNotes, setPersonnelNotes] = useState("");

  const handleCreatePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personnelName.trim()) {
      toast.error("Lütfen personel adını girin.");
      return;
    }
    try {
      await sqliteStore.addPersonnel({
        name: personnelName.trim(),
        title: personnelTitle.trim() || undefined,
        phone: personnelPhone.trim() || undefined,
        email: personnelEmail.trim() || undefined,
        notes: personnelNotes.trim() || undefined,
      });
      setPersonnelName("");
      setPersonnelTitle("");
      setPersonnelPhone("");
      setPersonnelEmail("");
      setPersonnelNotes("");
      toast.success("Yeni personel başarıyla eklendi.");
    } catch (err: any) {
      toast.error(`Personel ekleme hatası: ${err.message || err}`);
    }
  };

  const removePersonnel = async (id: string) => {
    try {
      await sqliteStore.deletePersonnel(id);
      toast.success("Personel kaydı silindi.");
    } catch (err: any) {
      toast.error(`Silme hatası: ${err.message || err}`);
    }
  };

  // New Reservation Form State
  const [resVenueId, setResVenueId] = useState("");
  const [resHallId, setResHallId] = useState("");
  const [resEventType, setResEventType] = useState(
    allEventTypes[0] || "Düğün & Davet",
  );
  const [resCustomer, setResCustomer] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [pricingMode, setPricingMode] = useState<PricingMode>("hourly");
  const [resStart, setResStart] = useState("10:00");
  const [resEnd, setResEnd] = useState("14:00");
  const [resPrice, setResPrice] = useState<number | "">(0);
  const [resPaid, setResPaid] = useState<number | "">(0);
  const [resStatus, setResStatus] = useState("confirmed");
  const [resReceiptNo, setResReceiptNo] = useState("");
  const [resPaymentMethod, setResPaymentMethod] = useState("Nakit");
  const [resDecisionInfo, setResDecisionInfo] = useState("");
  const [resNote, setResNote] = useState("");

  // Default Decision Info initialization
  useEffect(() => {
    if (!resDecisionInfo && defaultTariffBasis) {
      setResDecisionInfo(defaultTariffBasis);
    }
  }, [defaultTariffBasis]);

  // Price Calculation Logic
  useEffect(() => {
    if (!resVenueId || !resHallId) return;
    const venue = store.venues.find((v) => v.id === resVenueId);
    const hall = venue?.halls.find((h) => h.id === resHallId);
    if (!hall) return;

    if (pricingMode === "hourly") {
      const hrs = hoursBetween(resStart, resEnd);
      setResPrice(hrs * hall.hourlyPrice);
    } else {
      if (resPrice === 0 || resPrice === "") {
        setResPrice(hall.hourlyPrice);
      }
    }
  }, [resVenueId, resHallId, resStart, resEnd, pricingMode]);

  // New Venue Form State
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueDistrict, setNewVenueDistrict] = useState("");
  const [newVenueAddress, setNewVenueAddress] = useState("");
  const [newVenueMapUrl, setNewVenueMapUrl] = useState("");
  const [newVenueCategory, setNewVenueCategory] = useState("Kongre & Balo");
  const [newVenueManagerName, setNewVenueManagerName] = useState("");
  const [newVenueManagerTitle, setNewVenueManagerTitle] = useState(
    "Tesis Sorumlusu",
  );
  const [newVenueManagerPhone, setNewVenueManagerPhone] = useState("");
  const [newVenueColor, setNewVenueColor] = useState("#6366f1");

  // New Hall Form State
  const [targetVenueId, setTargetVenueId] = useState("");
  const [newHallName, setNewHallName] = useState("");
  const [newHallFloor, setNewHallFloor] = useState("1. Kat");
  const [newHallCapacity, setNewHallCapacity] = useState(250);
  const [newHallHourlyPrice, setNewHallHourlyPrice] = useState(1500);
  const [newHallColor, setNewHallColor] = useState("#8b5cf6");

  // Helpers
  const hallById = (id: string) => {
    for (const v of store.venues) {
      const h = v.halls.find((x) => x.id === id);
      if (h) return h;
    }
    return undefined;
  };

  // Calendar Days Grid Construction
  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [cursor]);

  // Group Reservations by Date
  const byDate = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of store.reservations) {
      const list = map.get(r.date) ?? [];
      list.push(r);
      map.set(r.date, list);
    }
    return map;
  }, [store.reservations]);

  // Filtered Reservations
  const filteredReservations = useMemo(() => {
    return store.reservations.filter((r) => {
      const matchesSearch = !searchTerm ||
        r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone.includes(searchTerm) ||
        (r.eventType || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = eventTypeFilter === "all" ||
        r.eventType === eventTypeFilter;
      const matchesVenue = calendarVenueFilter === "all" ||
        r.venueId === calendarVenueFilter;
      return matchesSearch && matchesType && matchesVenue;
    });
  }, [store.reservations, searchTerm, eventTypeFilter, calendarVenueFilter]);

  // Monthly Financial Statistics
  const monthStats = useMemo(() => {
    const curYear = cursor.getFullYear();
    const curMonth = String(cursor.getMonth() + 1).padStart(2, "0");
    const prefix = `${curYear}-${curMonth}`;

    const monthRes = store.reservations.filter((r) =>
      r.date.startsWith(prefix)
    );
    const totalCount = monthRes.length;
    const totalRev = monthRes.reduce((acc, r) => acc + (r.price || 0), 0);
    const totalPaid = monthRes.reduce((acc, r) => acc + (r.paid || 0), 0);
    const totalHours = monthRes.reduce(
      (acc, r) => acc + hoursBetween(r.start, r.end),
      0,
    );
    const remaining = totalRev - totalPaid;

    return { totalCount, totalRev, totalPaid, totalHours, remaining };
  }, [store.reservations, cursor]);

  // Customer Suggestions
  const customerSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const r of store.reservations) {
      if (r.customer) set.add(r.customer);
    }
    return Array.from(set);
  }, [store.reservations]);

  const phoneSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const r of store.reservations) {
      if (r.phone) set.add(r.phone);
    }
    return Array.from(set);
  }, [store.reservations]);

  const decisionSuggestions = useMemo(() => {
    const set = new Set<string>();
    if (defaultTariffBasis) set.add(defaultTariffBasis);
    for (const r of store.reservations) {
      if (r.decisionInfo) set.add(r.decisionInfo);
    }
    return Array.from(set);
  }, [store.reservations, defaultTariffBasis]);

  // Form Handlers
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resVenueId || !resHallId || !resCustomer || !resPhone) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    try {
      await sqliteStore.addReservation({
        venueId: resVenueId,
        hallId: resHallId,
        eventType: resEventType,
        customer: resCustomer,
        phone: resPhone,
        date: selectedDay,
        start: resStart,
        end: resEnd,
        price: Number(resPrice) || 0,
        paid: Number(resPaid) || 0,
        status: resStatus,
        receiptNo: resReceiptNo.trim() || undefined,
        paymentMethod: resPaymentMethod || "Nakit",
        decisionInfo: resDecisionInfo.trim() || undefined,
        note: resNote.trim() || undefined,
      });

      setResCustomer("");
      setResPhone("");
      setResReceiptNo("");
      setResNote("");
      setResModalOpen(false);
      toast.success(
        "Etkinlik ve salon tahsis kaydı SQLite veritabanına eklendi!",
      );
    } catch (err: any) {
      toast.error(`Kayıt hatası: ${err.message || err}`);
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName || !newVenueDistrict) {
      toast.error("Lütfen mekan adı ve ilçe bilgisini girin.");
      return;
    }
    try {
      await sqliteStore.addVenue({
        name: newVenueName,
        district: newVenueDistrict,
        category: newVenueCategory,
        address: newVenueAddress.trim() || undefined,
        mapUrl: newVenueMapUrl.trim() || undefined,
        managerName: newVenueManagerName.trim() || undefined,
        managerTitle: newVenueManagerTitle.trim() || undefined,
        managerPhone: newVenueManagerPhone.trim() || undefined,
        color: newVenueColor,
      });
      setNewVenueName("");
      setNewVenueDistrict("");
      setNewVenueAddress("");
      setNewVenueMapUrl("");
      setNewVenueManagerName("");
      setNewVenueManagerPhone("");
      setVenueModalOpen(false);
      toast.success("Yeni mekan başarıyla tanımlandı!");
    } catch (err: any) {
      toast.error(`Mekan oluşturma hatası: ${err.message || err}`);
    }
  };

  const handleCreateHall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVenueId || !newHallName) {
      toast.error("Salon adı zorunludur.");
      return;
    }
    try {
      await sqliteStore.addHall({
        venueId: targetVenueId,
        name: newHallName,
        capacity: Number(newHallCapacity),
        hourlyPrice: Number(newHallHourlyPrice),
        floor: newHallFloor,
        color: newHallColor,
      });
      setNewHallName("");
      setHallModalOpen(false);
      toast.success("Salon mekana eklendi!");
    } catch (err: any) {
      toast.error(`Salon ekleme hatası: ${err.message || err}`);
    }
  };

  // Delete Action Handlers
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
    try {
      if (deleteTarget.type === "venue") {
        await sqliteStore.deleteVenue(deleteTarget.id);
        toast.success(`"${deleteTarget.title}" mekanı silindi.`);
      } else if (deleteTarget.type === "hall" && deleteTarget.venueId) {
        await sqliteStore.deleteHall(deleteTarget.venueId, deleteTarget.id);
        toast.success(`"${deleteTarget.title}" salonu silindi.`);
      } else if (deleteTarget.type === "reservation") {
        await sqliteStore.deleteReservation(deleteTarget.id);
        toast.success(`"${deleteTarget.title}" rezervasyonu silindi.`);
      }
    } catch (err: any) {
      toast.error(`Silme hatası: ${err.message || err}`);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  // Status & Details Updates
  const updateReservationStatus = async (
    id: string,
    status: "confirmed" | "option",
  ) => {
    await sqliteStore.updateReservationStatus(id, status);
  };

  const updateReservationDetails = async (
    id: string,
    details: Partial<Reservation>,
  ) => {
    await sqliteStore.updateReservationDetails(id, details);
  };

  if (isStartingFile) {
    return (
      <WelcomeStartScreen
        theme={theme}
        recentFiles={recentFiles}
        onOpenRecent={(p) => openFile(p)}
        onCreateNew={() => createFile()}
        onOpenDialog={() => openFile()}
        onClearRecent={() => {
          localStorage.removeItem("recent_vke_files");
          fetchRecentFiles();
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        theme === "dark"
          ? "bg-slate-950 text-slate-100 dark"
          : "bg-slate-50 text-slate-900 light"
      }`}
    >
      <Toaster position="top-right" richColors />

      {/* Header Bar (Electron Window Drag Region) */}
      <header
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        className={`sticky top-0 z-40 border-b flex items-center justify-between px-4 py-2.5 transition-colors select-none ${
          theme === "dark"
            ? "bg-slate-900/90 border-slate-800 backdrop-blur-md"
            : "bg-white/90 border-slate-200 backdrop-blur-md shadow-xs"
        }`}
      >
        {/* Left: Brand & Sidebar Toggle */}
        <div
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          className="flex items-center gap-3"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`h-8 w-8 ${
              theme === "dark"
                ? "text-slate-400 hover:text-slate-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title={sidebarCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
          >
            {sidebarCollapsed
              ? <PanelLeftOpen className="h-4 w-4" />
              : <PanelLeftClose className="h-4 w-4" />}
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
              VK
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                <span>VenueKeeper App Pro</span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-indigo-500/40 text-indigo-400 font-mono"
                >
                  v1.0.0-beta.17
                </Badge>
              </h1>
              <p
                className={`text-[10px] ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Kamu & Kurumsal Tesis, Mekan & Etkinlik Yönetim Sistemi
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Search */}
        <div
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          className="hidden md:flex items-center gap-2 max-w-xs w-full"
        >
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="search"
              placeholder="Müşteri, telefon veya etkinlik ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-8 h-8 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  : "bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>
        </div>

        {/* Right: Quick Action Buttons & Native Window Controls */}
        <div
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          className="flex items-center gap-2"
        >
          <Button
            size="sm"
            onClick={() => {
              if (store.venues.length === 0) {
                toast.error("Lütfen önce bir mekan ekleyin.");
                return;
              }
              const firstV = store.venues[0];
              setResVenueId(firstV.id);
              if (firstV.halls.length > 0) {
                setResHallId(firstV.halls[0].id);
              }
              setResModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8 px-3 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Etkinlik Ekle
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`h-8 w-8 ${
              theme === "dark"
                ? "text-slate-400 hover:text-slate-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title={theme === "dark" ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4 text-amber-400" />
              : <Moon className="h-4 w-4 text-slate-700" />}
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
              title="Tam Ekran / Pencere"
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? "w-16" : "w-64"
          } border-r flex flex-col shrink-0 transition-all duration-200 ${
            theme === "dark"
              ? "bg-slate-900/40 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          {/* Recent Database Dropdown / Switcher */}
          <div className="p-3 border-b border-slate-800/40">
            <div
              className={`flex items-center justify-between ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Aktif Veritabanı:
                  </span>
                  <span className="text-xs font-bold truncate block">
                    {fileName || "Varsayılan Veritabanı"}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLauncherModal(true)}
                className="h-7 w-7 text-indigo-400 hover:text-indigo-300"
                title="Veritabanı Değiştir / Dosya Aç"
              >
                <FolderOpen className="h-3.5 w-3.5" />
              </Button>
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
              {
                id: "personnel",
                label: `Personel Kadrosu (${store.personnel?.length || 0})`,
                icon: Users,
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

          {/* Sidebar Footer: Institution Logo & Active Personnel Profile */}
          <div
            className={`p-3 border-t shrink-0 ${
              theme === "dark"
                ? "border-slate-800 bg-slate-950/40"
                : "border-slate-200 bg-slate-50/80"
            }`}
          >
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              {/* Institution Logo / Avatar */}
              <div className="relative shrink-0" title={institutionName}>
                {institutionLogo
                  ? (
                    <img
                      src={institutionLogo}
                      alt="Kurum Logosu"
                      className="h-9 w-9 rounded-xl object-contain border border-slate-700/60 bg-slate-900 p-0.5 shadow-xs"
                    />
                  )
                  : (
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      VK
                    </div>
                  )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"
                  title="Sistem Çevrimiçi"
                />
              </div>

              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold truncate tracking-tight text-indigo-500">
                    {institutionName}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3 text-slate-400 shrink-0" />
                    <span
                      className={`text-[11px] font-semibold truncate ${
                        theme === "dark" ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {store.personnel && store.personnel.length > 0
                        ? store.personnel[0].name
                        : "Sistem Yetkilisi"}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] block truncate ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {store.personnel && store.personnel.length > 0
                      ? store.personnel[0].title || "Tesis & Salon Amiri"
                      : "Nöbetçi İşletme Personeli"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Section Body */}
          <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
            {activeSection === "dashboard" && (
              <DashboardScreen
                theme={theme}
                store={store}
                monthStats={monthStats}
                hallById={hallById}
                onNavigateToCalendar={() => setActiveSection("calendar")}
              />
            )}

            {activeSection === "calendar" && (
              <CalendarScreen
                theme={theme}
                cursor={cursor}
                setCursor={setCursor}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                calendarViewMode={calendarViewMode}
                setCalendarViewMode={setCalendarViewMode}
                calendarVenueFilter={calendarVenueFilter}
                setCalendarVenueFilter={setCalendarVenueFilter}
                store={store}
                grid={grid}
                byDate={byDate}
                filteredReservations={filteredReservations}
                hallById={hallById}
                getEventTypeColor={getEventTypeColor}
                today={today}
                onOpenNewReservationModal={() => {
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
                onSelectReservation={(r) => setSelectedReservation(r)}
                onPromptDeleteReservation={(id, title) =>
                  promptDelete("reservation", id, title)}
                onPrintOfficialDoc={(r) => {
                  setSelectedPrintReservation(r);
                  setPrintModalOpen(true);
                }}
                onCopySMS={handleCopySMS}
                onQuickMail={handleQuickMail}
              />
            )}

            {activeSection === "venues" && (
              <VenuesScreen
                theme={theme}
                store={store}
                onOpenVenueModal={() => setVenueModalOpen(true)}
                onOpenHallModal={(vId) => {
                  setTargetVenueId(vId);
                  setHallModalOpen(true);
                }}
                onPromptDelete={promptDelete}
              />
            )}

            {activeSection === "events" && (
              <EventsScreen
                theme={theme}
                eventTypeFilter={eventTypeFilter}
                setEventTypeFilter={setEventTypeFilter}
                allEventTypes={mergedEventTypes}
                filteredReservations={filteredReservations}
                store={store}
                hallById={hallById}
                onPromptDelete={(type, id, title) =>
                  promptDelete(type, id, title)}
              />
            )}

            {activeSection === "personnel" && (
              <PersonnelScreen
                theme={theme}
                store={store}
                personnelName={personnelName}
                setPersonnelName={setPersonnelName}
                personnelTitle={personnelTitle}
                setPersonnelTitle={setPersonnelTitle}
                personnelPhone={personnelPhone}
                setPersonnelPhone={setPersonnelPhone}
                personnelEmail={personnelEmail}
                setPersonnelEmail={setPersonnelEmail}
                personnelNotes={personnelNotes}
                setPersonnelNotes={setPersonnelNotes}
                handleCreatePersonnel={handleCreatePersonnel}
                removePersonnel={removePersonnel}
                onOpenPersonnelModal={() => setPersonnelModalOpen(true)}
              />
            )}

            {activeSection === "reports" && (
              <ReportsScreen
                theme={theme}
                monthStats={monthStats}
              />
            )}

            {activeSection === "settings" && (
              <SettingsScreen
                theme={theme}
                setMailModalOpen={setMailModalOpen}
                newEventTypeInput={newEventTypeInput}
                setNewEventTypeInput={setNewEventTypeInput}
                handleAddCustomEventType={handleAddCustomEventType}
                handleResetEventTypes={handleResetEventTypes}
                handleRemoveEventType={handleRemoveEventType}
                allEventTypes={mergedEventTypes}
                getEventTypeColor={getEventTypeColor}
                gdriveToken={gdriveToken}
                setGdriveToken={setGdriveToken}
                gdriveFolderId={gdriveFolderId}
                setGdriveFolderId={setGdriveFolderId}
                draftInstitutionName={draftInstitutionName}
                setDraftInstitutionName={setDraftInstitutionName}
                draftInstitutionLogo={draftInstitutionLogo}
                handleDraftLogoUpload={handleDraftLogoUpload}
                handleRemoveDraftLogo={handleRemoveDraftLogo}
                handleCancelInstitutionSettings={handleCancelInstitutionSettings}
                handleSaveInstitutionSettings={handleSaveInstitutionSettings}
                draftTariffBasis={draftTariffBasis}
                setDraftTariffBasis={setDraftTariffBasis}
                handleCancelTariffSettings={handleCancelTariffSettings}
                handleSaveTariffSettings={handleSaveTariffSettings}
              />
            )}
          </div>

          {/* Global Application Footer */}
          <Footer
            currentFilePath={currentFilePath}
            institutionName={institutionName}
            theme={theme}
          />
        </div>
      </div>

      {/* DIALOG MODALS */}
      <NewReservationModal
        open={resModalOpen}
        onOpenChange={setResModalOpen}
        theme={theme}
        selectedDay={selectedDay}
        resVenueId={resVenueId}
        setResVenueId={setResVenueId}
        resHallId={resHallId}
        setResHallId={setResHallId}
        resEventType={resEventType}
        setResEventType={setResEventType}
        resCustomer={resCustomer}
        setResCustomer={setResCustomer}
        pricingMode={pricingMode}
        setPricingMode={setPricingMode}
        resStart={resStart}
        setResStart={setResStart}
        resEnd={resEnd}
        setResEnd={setResEnd}
        resPhone={resPhone}
        setResPhone={setResPhone}
        resPrice={resPrice}
        setResPrice={setResPrice}
        resPaid={resPaid}
        setResPaid={setResPaid}
        resStatus={resStatus}
        setResStatus={setResStatus}
        resReceiptNo={resReceiptNo}
        setResReceiptNo={setResReceiptNo}
        resPaymentMethod={resPaymentMethod}
        setResPaymentMethod={setResPaymentMethod}
        resDecisionInfo={resDecisionInfo}
        setResDecisionInfo={setResDecisionInfo}
        resNote={resNote}
        setResNote={setResNote}
        store={store}
        allEventTypes={mergedEventTypes}
        customerSuggestions={customerSuggestions}
        phoneSuggestions={phoneSuggestions}
        decisionSuggestions={decisionSuggestions}
        timeSlots={timeSlots}
        handleCreateReservation={handleCreateReservation}
      />

      <NewVenueModal
        open={venueModalOpen}
        onOpenChange={setVenueModalOpen}
        theme={theme}
        newVenueName={newVenueName}
        setNewVenueName={setNewVenueName}
        newVenueDistrict={newVenueDistrict}
        setNewVenueDistrict={setNewVenueDistrict}
        newVenueAddress={newVenueAddress}
        setNewVenueAddress={setNewVenueAddress}
        newVenueMapUrl={newVenueMapUrl}
        setNewVenueMapUrl={setNewVenueMapUrl}
        newVenueCategory={newVenueCategory}
        setNewVenueCategory={setNewVenueCategory}
        newVenueManagerName={newVenueManagerName}
        setNewVenueManagerName={setNewVenueManagerName}
        newVenueManagerTitle={newVenueManagerTitle}
        setNewVenueManagerTitle={setNewVenueManagerTitle}
        newVenueManagerPhone={newVenueManagerPhone}
        setNewVenueManagerPhone={setNewVenueManagerPhone}
        newVenueColor={newVenueColor}
        setNewVenueColor={setNewVenueColor}
        store={store}
        handleCreateVenue={handleCreateVenue}
      />

      <NewHallModal
        open={hallModalOpen}
        onOpenChange={setHallModalOpen}
        theme={theme}
        newHallName={newHallName}
        setNewHallName={setNewHallName}
        newHallFloor={newHallFloor}
        setNewHallFloor={setNewHallFloor}
        newHallCapacity={newHallCapacity}
        setNewHallCapacity={setNewHallCapacity}
        newHallHourlyPrice={newHallHourlyPrice}
        setNewHallHourlyPrice={setNewHallHourlyPrice}
        newHallColor={newHallColor}
        setNewHallColor={setNewHallColor}
        handleCreateHall={handleCreateHall}
      />

      <PersonnelModal
        open={personnelModalOpen}
        onOpenChange={setPersonnelModalOpen}
        theme={theme}
        personnelName={personnelName}
        setPersonnelName={setPersonnelName}
        personnelTitle={personnelTitle}
        setPersonnelTitle={setPersonnelTitle}
        personnelPhone={personnelPhone}
        setPersonnelPhone={setPersonnelPhone}
        personnelEmail={personnelEmail}
        setPersonnelEmail={setPersonnelEmail}
        store={store}
        handleCreatePersonnel={handleCreatePersonnel}
        removePersonnel={removePersonnel}
      />

      <MailDialog
        open={mailModalOpen}
        onOpenChange={setMailModalOpen}
        defaultRecipient={mailPreset.recipient}
        defaultSubject={mailPreset.subject}
        defaultBody={mailPreset.body}
        theme={theme}
      />

      <CopySettingsModal
        open={copyModalOpen}
        onOpenChange={setCopyModalOpen}
        theme={theme}
      />

      <DeleteConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        theme={theme}
        deleteTarget={deleteTarget}
        onExecuteDelete={handleExecuteDelete}
      />

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

      <ReservationDrawer
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        theme={theme}
        store={store}
        hallById={hallById}
        editReceiptNo={editReceiptNo}
        setEditReceiptNo={setEditReceiptNo}
        editPaymentMethod={editPaymentMethod}
        setEditPaymentMethod={setEditPaymentMethod}
        editPaidAmount={editPaidAmount}
        setEditPaidAmount={setEditPaidAmount}
        updateReservationStatus={updateReservationStatus}
        updateReservationDetails={updateReservationDetails}
        setSelectedReservation={setSelectedReservation}
        onPrintDoc={(r) => {
          setSelectedPrintReservation(r);
          setPrintModalOpen(true);
        }}
        onCopySMS={handleCopySMS}
        onQuickMail={handleQuickMail}
        onPromptDelete={(type, id, title) => promptDelete(type, id, title)}
      />

      {showLauncherModal && (
        <LauncherModal
          open={showLauncherModal}
          onOpenChange={setShowLauncherModal}
          currentFilePath={currentFilePath || ""}
          recentFiles={recentFiles}
          onOpenRecent={(p) => openFile(p)}
          onCreateNew={() => createFile()}
          onOpenDialog={() => openFile()}
          onClearRecent={() => {
            localStorage.removeItem("recent_vke_files");
            fetchRecentFiles();
          }}
          theme={theme}
        />
      )}
    </div>
  );
}

export default App;
