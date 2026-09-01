import React, { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

import {
  hoursBetween,
  money,
  type NavSection,
  type Reservation,
  toKey,
} from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { useSettingsStore } from "@/store/settingsStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useTabStore } from "@/store/tabStore";

import { useEventTypes } from "@/hooks/useEventTypes";
import { useReservationForm } from "@/hooks/useReservationForm";
import { useVenueForm } from "@/hooks/useVenueForm";
import { useHallForm } from "@/hooks/useHallForm";
import { usePersonnelForm } from "@/hooks/usePersonnelForm";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppModals } from "@/components/layout/app-modals";
import { Footer } from "@/components/footer";
import { WelcomeStartScreen } from "@/components/welcome-start-screen";
import { UpdateBanner } from "@/components/update-banner";

import { DashboardScreen } from "@/screens/dashboard.screen";
import { CalendarScreen } from "@/screens/calendar.screen";
import { VenuesScreen } from "@/screens/venues.screen";
import { EventsScreen } from "@/screens/events.screen";
import { PersonnelScreen } from "@/screens/personnel.screen";
import { ReportsScreen } from "@/screens/reports.screen";
import { SettingsScreen } from "@/screens/settings.screen";
import { CustomersScreen } from "@/screens/customers.screen";
import { AccountingScreen } from "@/screens/accounting";
import { HelpScreen } from "@/screens/help.screen";
import { generateEmailHTMLTemplate, generateBackupEmailContent } from "@/lib/email-template";
import { ExitBackupModal } from "@/components/modals/exit-backup-modal";
import { SplashScreen } from "@/components/splash-screen";
import { ReservationDateConfirmModal } from "@/components/modals/reservation-date-confirm-modal";
import { PastRecordSecurityModal } from "@/components/modals/past-record-security-modal";
import { AdvancedExportModal } from "@/components/modals/advanced-export-modal";

export function App(): React.JSX.Element {
  // Startup Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

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
    appName,
    institutionName,
    institutionSubHeader,
    institutionLogo,
    institutionPhone,
    institutionEmail,
    institutionWebsite,
    institutionKepAddress,
    institutionAddress,
    defaultCity,
    defaultDistrict,
    defaultTariffBasis,
    accountingModuleEnabled,
    workingYear,
    securityPin,
    authorizedPersonnelName,
    authorizedPersonnelTitle,
    setAppName,
    setInstitutionName,
    setInstitutionSubHeader,
    setInstitutionLogo,
    setInstitutionPhone,
    setInstitutionEmail,
    setInstitutionWebsite,
    setInstitutionKepAddress,
    setInstitutionAddress,
    setDefaultCity,
    setDefaultDistrict,
    setDefaultTariffBasis,
    setAccountingModuleEnabled,
    setWorkingYear,
    setSecurityPin,
    setAuthorizedPersonnelName,
    setAuthorizedPersonnelTitle,
    saveSettingsBulk,
    reloadSettings,
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
    removeRecentFile,
    fetchRecentFiles,
  } = useWorkspaceStore();

  const { activeTabId, setActiveTab } = useTabStore();

  // Launcher Modal State
  const [showLauncherModal, setShowLauncherModal] = useState(false);

  // Export & Security Modals State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [pastRecordSecurityOpen, setPastRecordSecurityOpen] = useState(false);
  const [pastRecordTarget, setPastRecordTarget] = useState<{
    id: string;
    title: string;
    date: string;
  } | null>(null);

  // SQLite Store State
  const [store, setStore] = useState(sqliteStore.getSnapshot());

  useEffect(() => {
    if (isStartingFile) return;
    sqliteStore.loadFromDb().then(() => setStore(sqliteStore.getSnapshot()));
    const unsubscribe = sqliteStore.subscribe(() =>
      setStore(sqliteStore.getSnapshot())
    );
    return () => {
      unsubscribe();
    };
  }, [activeDosyaId, isStartingFile]);

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

  // Modals Visibility State
  const [resModalOpen, setResModalOpen] = useState(false);
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [personnelModalOpen, setPersonnelModalOpen] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [customerHistoryOpen, setCustomerHistoryOpen] = useState(false);
  const [customerHistoryName, setCustomerHistoryName] = useState("");
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  // Kapanırken yedek alınıyor durumu
  const [isClosing, setIsClosing] = useState(false);

  /**
   * Kullanıcı çıkış butonuna bastığında onay modalı açılır.
   */
  const handleAppClose = () => {
    setExitModalOpen(true);
  };

  const handleExecuteExit = async (options: {
    backupLocal: boolean;
    sendEmail: boolean;
    backupEmail: string;
  }): Promise<{ success: boolean; localBackup?: boolean; emailSent?: boolean; error?: string }> => {
    setIsClosing(true);
    try {
      const smtpRaw = localStorage.getItem("venue-keeper-smtp-settings");
      const smtpSettings = smtpRaw ? JSON.parse(smtpRaw) : {};
      if (options.backupEmail) {
        smtpSettings.backupEmail = options.backupEmail;
      }

      const { subject, html, text } = generateBackupEmailContent({
        dbFileName:
          fileName ||
          (currentFilePath ? currentFilePath.split(/[\\/]/).pop() : "venuekeeper-default.vke") ||
          "veritabani.vke",
        institutionName,
        appName,
        senderName: smtpSettings.senderName,
      });

      const res = await (window.electronAPI as any)?.quitWithBackup?.({
        backupLocal: options.backupLocal,
        sendEmail: options.sendEmail,
        backupEmail: options.backupEmail,
        smtpSettings,
        mailSubject: subject,
        mailHtml: html,
        mailText: text,
      });

      if (options.sendEmail && res && !res.emailSent) {
        return {
          success: false,
          localBackup: res.localBackup,
          emailSent: false,
          error: res.emailError || "E-posta sunucusu yanıt vermedi.",
        };
      }

      return {
        success: true,
        localBackup: res?.localBackup ?? true,
        emailSent: res?.emailSent ?? false,
      };
    } catch (err: any) {
      console.error("[EXIT] Hata:", err);
      return {
        success: false,
        error: err?.message || "Bilinmeyen bir hata oluştu.",
      };
    } finally {
      setIsClosing(false);
    }
  };

  const handleDirectExit = () => {
    setExitModalOpen(false);
    (window.electronAPI as any)?.closeWindow?.();
  };

  const handleOpenCustomerHistory = (custName: string) => {
    setCustomerHistoryName(custName);
    setCustomerHistoryOpen(true);
  };

  // Selected Reservation & Delete Targets
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

  // Drawer Form States
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

  // Mail Preset State
  const [mailPreset, setMailPreset] = useState<{
    recipient: string;
    recipientType?: "customer" | "staff";
    subject: string;
    body: string;
    reservationData?: any;
  }>({
    recipient: "",
    recipientType: "customer",
    subject: "",
    body: "",
  });

  const handleQuickMail = (r: Reservation) => {
    if (r.customerMailSentAt || r.mailSentAt) {
      const prevTime = r.customerMailSentAt || r.mailSentAt;
      const proceed = window.confirm(
        `⚠️ DİKKAT: Bu müşteriye/vatandaşa daha önce (${prevTime}) e-posta gönderilmiştir.\n\nYeniden e-posta göndermek istediğinizden emin misiniz?`,
      );
      if (!proceed) return;
    }
    const v = store.venues.find((x) => x.id === r.venueId);
    const h = store.venues.flatMap((x) => x.halls).find((x) =>
      x.id === r.hallId
    );
    const subject = `Etkinlik Rezervasyon Teyidi - ${r.customer} (${r.date})`;
    const htmlBody = generateEmailHTMLTemplate({
      customer: r.customer,
      venueName: v?.name || "Tesis",
      hallName: h?.name || "Salon",
      venueAddress: v?.address,
      venueMapUrl: v?.mapUrl,
      venueDistrict: v?.district,
      date: r.date,
      start: r.start,
      end: r.end,
      eventType: r.eventType || "Genel",
      price: r.price,
      paid: r.paid,
      institutionName: institutionName || "T.C. KURUM / BELEDİYE BAŞKANLIĞI",
      institutionSubHeader: institutionSubHeader ||
        "Emlak & Tahsilat İşleri Tesis Yönetimi",
      institutionLogo,
    });

    setMailPreset({
      recipient: r.email || (r.customer.includes("@") ? r.customer : ""),
      recipientType: "customer",
      subject,
      body: htmlBody,
      reservationData: {
        id: r.id,
        customer: r.customer,
        phone: r.phone,
        date: r.date,
        start: r.start,
        end: r.end,
        venueName: v?.name || "Tesis",
        hallName: h?.name || "Salon",
        venueAddress: v?.address,
        venueMapUrl: v?.mapUrl,
        venueDistrict: v?.district,
        eventType: r.eventType || "Genel",
      },
    });
    setMailModalOpen(true);
  };

  const handleQuickStaffMail = (
    r: Reservation,
    staffEmail?: string,
    staffName?: string,
  ) => {
    if (r.staffMailSentAt) {
      const proceed = window.confirm(
        `⚠️ DİKKAT: Bu mekan görevlisine daha önce (${r.staffMailSentAt}) görev bildirimi gönderilmiştir.\n\nYeniden e-posta göndermek istediğinizden emin misiniz?`,
      );
      if (!proceed) return;
    }
    const v = store.venues.find((x) => x.id === r.venueId);
    const h = store.venues.flatMap((x) => x.halls).find((x) =>
      x.id === r.hallId
    );
    setMailPreset({
      recipient: staffEmail || "gorevli@tesis.bel.tr",
      recipientType: "staff",
      subject: `[VARDİYA GÖREV BİLDİRİMİ] ${r.date} - ${v?.name} (${h?.name})`,
      body: `Sayın ${
        staffName || "Tesis Sorumlusu / Görevlisi"
      },\n\nSorumlusu olduğunuz tesiste aşağıdaki kiralama/etkinlik görevi tanımlanmıştır:\n\n- Tarih / Saat: ${r.date} | ${r.start} - ${r.end}\n- Mekan / Salon: ${v?.name} - ${h?.name}\n- Mekan Adresi: ${
        v?.address || "Belirtilmedi"
      }\n- Etkinlik Türü: ${
        r.eventType || "Genel"
      }\n- Müşteri Adı: ${r.customer}\n- İletişim Tel: ${r.phone}\n\nLütfen salon iklimlendirme, temizlik ve ses/ışık teknik ekipman kontrollerini zamanında gerçekleştiriniz.\n\nİyi çalışmalar dileriz.`,
      reservationData: {
        id: r.id,
        customer: r.customer,
        phone: r.phone,
        date: r.date,
        start: r.start,
        end: r.end,
        venueName: v?.name || "Tesis",
        hallName: h?.name || "Salon",
        venueAddress: v?.address,
        venueMapUrl: v?.mapUrl,
        venueDistrict: v?.district,
        eventType: r.eventType || "Genel",
      },
    });
    setMailModalOpen(true);
  };

  const handleCopySMS = (r: Reservation) => {
    const v = store.venues.find((x) => x.id === r.venueId);
    const h = store.venues.flatMap((x) => x.halls).find((x) =>
      x.id === r.hallId
    );
    const text =
      `Sn. ${r.customer}, ${r.date} tarihindeki ${v?.name} - ${h?.name} ${r.eventType} salon kiralamanız kaydedilmiştir. Saat: ${r.start}-${r.end}. Toplam: ${
        money(
          r.price,
        )
      }. Bilgi için: 0532 000 0000`;
    navigator.clipboard.writeText(text);
    toast.success("Özet mesaj metni panoya kopyalandı!");
  };

  // Google Drive & Draft Settings State
  const [gdriveToken, setGdriveToken] = useState(() =>
    localStorage.getItem("gdrive_token") || ""
  );
  const [gdriveFolderId, setGdriveFolderId] = useState(() =>
    localStorage.getItem("gdrive_folder_id") || ""
  );
  const [draftAppName, setDraftAppName] = useState(
    appName || "VenueKeeper Tesis & Salon İşletim Otomasyonu",
  );
  const [draftInstitutionName, setDraftInstitutionName] = useState(
    institutionName,
  );
  const [draftInstitutionSubHeader, setDraftInstitutionSubHeader] = useState(
    institutionSubHeader,
  );
  const [draftInstitutionLogo, setDraftInstitutionLogo] = useState(
    institutionLogo,
  );
  const [draftInstitutionPhone, setDraftInstitutionPhone] = useState(
    institutionPhone,
  );
  const [draftInstitutionEmail, setDraftInstitutionEmail] = useState(
    institutionEmail,
  );
  const [draftInstitutionWebsite, setDraftInstitutionWebsite] = useState(
    institutionWebsite,
  );
  const [draftInstitutionKepAddress, setDraftInstitutionKepAddress] = useState(
    institutionKepAddress,
  );
  const [draftInstitutionAddress, setDraftInstitutionAddress] = useState(
    institutionAddress,
  );
  const [draftDefaultCity, setDraftDefaultCity] = useState(defaultCity || "Ankara");
  const [draftDefaultDistrict, setDraftDefaultDistrict] = useState(defaultDistrict || "Çankaya");
  const [draftWorkingYear, setDraftWorkingYear] = useState(workingYear || "2026");
  const [draftSecurityPin, setDraftSecurityPin] = useState(securityPin || "");
  const [draftAuthorizedPersonnelName, setDraftAuthorizedPersonnelName] = useState(authorizedPersonnelName || "");
  const [draftAuthorizedPersonnelTitle, setDraftAuthorizedPersonnelTitle] = useState(authorizedPersonnelTitle || "Tesis & İşletme Müdürü");
  const [draftTariffBasis, setDraftTariffBasis] = useState(defaultTariffBasis);

  useEffect(() => {
    setDraftAppName(appName || "VenueKeeper Tesis & Salon İşletim Otomasyonu");
    setDraftInstitutionName(institutionName);
    setDraftInstitutionSubHeader(institutionSubHeader);
    setDraftInstitutionLogo(institutionLogo);
    setDraftInstitutionPhone(institutionPhone);
    setDraftInstitutionEmail(institutionEmail);
    setDraftInstitutionWebsite(institutionWebsite);
    setDraftInstitutionKepAddress(institutionKepAddress);
    setDraftInstitutionAddress(institutionAddress);
    setDraftDefaultCity(defaultCity || "Ankara");
    setDraftDefaultDistrict(defaultDistrict || "Çankaya");
    setDraftWorkingYear(workingYear || "2026");
    setDraftSecurityPin(securityPin || "");
    setDraftAuthorizedPersonnelName(authorizedPersonnelName || "");
    setDraftAuthorizedPersonnelTitle(authorizedPersonnelTitle || "Tesis & İşletme Müdürü");
  }, [
    appName,
    institutionName,
    institutionSubHeader,
    institutionLogo,
    institutionPhone,
    institutionEmail,
    institutionWebsite,
    institutionKepAddress,
    institutionAddress,
    defaultCity,
    defaultDistrict,
    workingYear,
    securityPin,
    authorizedPersonnelName,
    authorizedPersonnelTitle,
  ]);

  useEffect(() => {
    setDraftTariffBasis(defaultTariffBasis);
  }, [defaultTariffBasis]);

  const handleSaveInstitutionSettings = async () => {
    await saveSettingsBulk({
      appName: draftAppName,
      institutionName: draftInstitutionName,
      institutionSubHeader: draftInstitutionSubHeader,
      institutionLogo: draftInstitutionLogo,
      institutionPhone: draftInstitutionPhone,
      institutionEmail: draftInstitutionEmail,
      institutionWebsite: draftInstitutionWebsite,
      institutionKepAddress: draftInstitutionKepAddress,
      institutionAddress: draftInstitutionAddress,
      defaultCity: draftDefaultCity,
      defaultDistrict: draftDefaultDistrict,
      workingYear: draftWorkingYear,
      securityPin: draftSecurityPin,
      authorizedPersonnelName: draftAuthorizedPersonnelName,
      authorizedPersonnelTitle: draftAuthorizedPersonnelTitle,
    });
    toast.success(
      "Kurumsal kimlik, logo, çalışma yılı, yetkili personel ve güvenlik şifresi kaydedildi.",
    );
  };

  const handleCancelInstitutionSettings = () => {
    setDraftAppName(appName || "VenueKeeper Tesis & Salon İşletim Otomasyonu");
    setDraftInstitutionName(institutionName);
    setDraftInstitutionSubHeader(institutionSubHeader);
    setDraftInstitutionLogo(institutionLogo);
    setDraftInstitutionPhone(institutionPhone);
    setDraftInstitutionEmail(institutionEmail);
    setDraftInstitutionWebsite(institutionWebsite);
    setDraftInstitutionKepAddress(institutionKepAddress);
    setDraftInstitutionAddress(institutionAddress);
    setDraftDefaultCity(defaultCity || "Ankara");
    setDraftDefaultDistrict(defaultDistrict || "Çankaya");
    setDraftWorkingYear(workingYear || "2026");
    setDraftSecurityPin(securityPin || "");
    setDraftAuthorizedPersonnelName(authorizedPersonnelName || "");
    setDraftAuthorizedPersonnelTitle(authorizedPersonnelTitle || "Tesis & İşletme Müdürü");
    toast.info("Değişiklikler iptal edildi.");
  };

  const handleSaveTariffSettings = async () => {
    await saveSettingsBulk({
      defaultTariffBasis: draftTariffBasis,
    });
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

  // Custom Form Hooks
  const {
    mergedEventTypes,
    newEventTypeInput,
    setNewEventTypeInput,
    handleAddCustomEventType,
    handleRemoveEventType,
    handleResetEventTypes,
    getEventTypeColor,
  } = useEventTypes();

  const {
    resVenueId,
    setResVenueId,
    resHallId,
    setResHallId,
    resEventType,
    setResEventType,
    resCustomer,
    setResCustomer,
    resPhone,
    setResPhone,
    resEmail,
    setResEmail,
    pricingMode,
    setPricingMode,
    timeSlotSession,
    setTimeSlotSession,
    handleTimeSlotChange,
    resStart,
    setResStart,
    resEnd,
    setResEnd,
    guestCount,
    setGuestCount,
    resPrice,
    setResPrice,
    resPaid,
    setResPaid,
    resStatus,
    setResStatus,
    resReceiptNo,
    setResReceiptNo,
    resPaymentMethod,
    setResPaymentMethod,
    resDecisionInfo,
    setResDecisionInfo,
    resNote,
    setResNote,
    customerSuggestions,
    phoneSuggestions,
    decisionSuggestions,
    handleCreateReservation,
    isConfirmDateModalOpen,
    setIsConfirmDateModalOpen,
    executeConfirmedCreateReservation,
    resetReservationForm,
  } = useReservationForm(store, defaultTariffBasis, selectedDay);

  const {
    newVenueName,
    setNewVenueName,
    newVenueCity,
    setNewVenueCity,
    newVenueDistrict,
    setNewVenueDistrict,
    newVenueAddress,
    setNewVenueAddress,
    newVenueMapUrl,
    setNewVenueMapUrl,
    newVenueCategory,
    setNewVenueCategory,
    newVenueManagerPersonnelId,
    setNewVenueManagerPersonnelId,
    newVenueManagerName,
    setNewVenueManagerName,
    newVenueManagerTitle,
    setNewVenueManagerTitle,
    newVenueManagerPhone,
    setNewVenueManagerPhone,
    newVenueColor,
    setNewVenueColor,
    handleCreateVenue,
    resetVenueForm,
  } = useVenueForm(defaultCity, defaultDistrict);

  const {
    targetVenueId,
    setTargetVenueId,
    newHallName,
    setNewHallName,
    newHallFloor,
    setNewHallFloor,
    newHallCapacity,
    setNewHallCapacity,
    newHallHourlyPrice,
    setNewHallHourlyPrice,
    newHallPricingType,
    setNewHallPricingType,
    newHallColor,
    setNewHallColor,
    handleCreateHall,
    resetHallForm,
  } = useHallForm();

  const {
    personnelName,
    setPersonnelName,
    personnelTitle,
    setPersonnelTitle,
    personnelPhone,
    setPersonnelPhone,
    personnelEmail,
    setPersonnelEmail,
    personnelNotes,
    setPersonnelNotes,
    handleCreatePersonnel,
    removePersonnel,
    resetPersonnelForm,
  } = usePersonnelForm();

  // Hall lookup helper
  const hallById = (id: string) => {
    for (const v of store.venues) {
      const h = v.halls.find((x) => x.id === id);
      if (h) return h;
    }
    return undefined;
  };

  // Calendar Grid Construction
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

  // Delete Action Handlers
  const promptDelete = (
    type: "venue" | "hall" | "reservation",
    id: string,
    title: string,
    venueId?: string,
  ) => {
    if (type === "reservation") {
      const res = store.reservations.find((r) => r.id === id);
      if (res && res.date < toKey(new Date())) {
        // Open Past Record Security Modal with Admin PIN verification
        setPastRecordTarget({
          id: res.id,
          title: res.customer,
          date: res.date,
        });
        setPastRecordSecurityOpen(true);
        return;
      }
    }
    setDeleteTarget({ type, id, title, venueId });
    setDeleteConfirmOpen(true);
  };

  const handleExecutePastRecordDelete = async () => {
    if (!pastRecordTarget) return;
    try {
      await sqliteStore.deleteReservation(pastRecordTarget.id);
      toast.success(`"${pastRecordTarget.title}" geçmiş etkinlik kaydı yetkili onayı ile silindi.`);
      if (selectedReservation?.id === pastRecordTarget.id) {
        setSelectedReservation(null);
      }
    } catch (err: any) {
      toast.error(`Kayıt silme hatası: ${err.message || err}`);
    } finally {
      setPastRecordTarget(null);
      setPastRecordSecurityOpen(false);
    }
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
        onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        recentFiles={recentFiles}
        onOpenRecent={(p) => openFile(p)}
        onRemoveRecent={(p) => removeRecentFile(p)}
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
      className={`h-screen max-h-screen overflow-hidden flex flex-col font-sans transition-colors ${
        theme === "dark"
          ? "bg-slate-950 text-slate-100 dark"
          : "bg-slate-50 text-slate-900 light"
      }`}
    >
      <Toaster position="top-right" richColors />

      {/* Kapatılıyor overlay'i */}
      {isClosing && (
        <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm gap-3">
          <svg
            className="animate-spin h-10 w-10 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-slate-300 text-sm font-medium">
            Yedek alınıyor, lütfen bekleyin…
          </p>
        </div>
      )}

      {/* Extracted Header Bar */}
      <AppHeader
        theme={theme}
        setTheme={setTheme}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        store={store}
        onNavigateToSection={(sec) => setActiveSection(sec)}
        onSelectReservation={(r) => setSelectedReservation(r)}
        appName={appName}
        institutionName={institutionName}
        institutionSubHeader={institutionSubHeader}
        institutionLogo={institutionLogo}
        fileName={fileName}
        currentFilePath={currentFilePath}
        onOpenFile={() => openFile()}
        onCreateFile={() => createFile()}
        onSaveAsFile={saveFileAs}
        onOpenBackupFolder={() => (window.electronAPI as any)?.openBackupFolder?.()}
        onShowLauncher={() => setShowLauncherModal(true)}
        onClose={handleAppClose}
        onOpenTrashModal={() => setTrashModalOpen(true)}
        onOpenNewReservation={() => {
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
      />

      {/* Startup Animated Developer Splash Screen */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          appName={appName}
          institutionName={institutionName}
        />
      )}

      {/* Auto-Updater Banner Notification */}
      <UpdateBanner />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Extracted Sidebar Navigation */}
        <AppSidebar
          theme={theme}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          fileName={fileName || ""}
          onOpenLauncher={() => setShowLauncherModal(true)}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setSidebarOpen={setSidebarOpen}
          store={store}
          institutionName={institutionName}
          institutionLogo={institutionLogo}
          accountingModuleEnabled={accountingModuleEnabled}
        />

        {/* Main Content View Screens & Docked Footer */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {/* Scrollable Viewport Container */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
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
                  workingYear={workingYear}
                  setWorkingYear={setWorkingYear}
                  onOpenExportModal={() => setExportModalOpen(true)}
                  onNavigateToCustomer={(custName) => {
                    setSearchTerm(custName);
                    setActiveSection("customers");
                  }}
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
                  onOpenNewReservationModal={(vId, hId) => {
                    if (vId) setResVenueId(vId);
                    if (hId) setResHallId(hId);
                    setResModalOpen(true);
                  }}
                  onNavigateToCalendar={(vId) => {
                    if (vId) setCalendarVenueFilter(vId);
                    setActiveSection("calendar");
                  }}
                  defaultCity={defaultCity}
                  defaultDistrict={defaultDistrict}
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
                  onPrintOfficialDoc={(r) => {
                    setSelectedPrintReservation(r);
                    setPrintModalOpen(true);
                  }}
                  onQuickMail={handleQuickMail}
                  onQuickStaffMail={handleQuickStaffMail}
                  onNavigateToCustomer={(custName) => {
                    setSearchTerm(custName);
                    setActiveSection("customers");
                  }}
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

              {activeSection === "customers" && (
                <CustomersScreen
                  theme={theme}
                  store={store}
                  onAddCustomer={async (c) => {
                    await sqliteStore.addCustomer(c);
                  }}
                  onUpdateCustomer={async (c) => {
                    await sqliteStore.updateCustomer(c);
                  }}
                  onRemoveCustomer={async (id) => {
                    await sqliteStore.deleteCustomer(id);
                  }}
                  onOpenMailModal={() => {
                    setMailModalOpen(true);
                  }}
                />
              )}

              {activeSection === "accounting" && (
                <AccountingScreen
                  theme={theme}
                  store={store}
                  institutionName={institutionName}
                  onAddTransaction={async (t) => {
                    await sqliteStore.addTransaction(t);
                  }}
                  onUpdateTransaction={async (t) => {
                    await sqliteStore.updateTransaction(t);
                  }}
                  onDeleteTransaction={async (id) => {
                    await sqliteStore.deleteTransaction(id);
                  }}
                  onSelectReservation={(r) => {
                    setSelectedReservation(r);
                  }}
                />
              )}

              {activeSection === "reports" && (
                <ReportsScreen
                  theme={theme}
                  monthStats={monthStats}
                  store={store}
                />
              )}

              {activeSection === "settings" && (
                <SettingsScreen
                  theme={theme}
                  store={store}
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
                  draftAppName={draftAppName}
                  setDraftAppName={setDraftAppName}
                  draftInstitutionName={draftInstitutionName}
                  setDraftInstitutionName={setDraftInstitutionName}
                  draftInstitutionSubHeader={draftInstitutionSubHeader}
                  setDraftInstitutionSubHeader={setDraftInstitutionSubHeader}
                  draftInstitutionLogo={draftInstitutionLogo}
                  handleDraftLogoUpload={handleDraftLogoUpload}
                  handleRemoveDraftLogo={handleRemoveDraftLogo}
                  draftInstitutionPhone={draftInstitutionPhone}
                  setDraftInstitutionPhone={setDraftInstitutionPhone}
                  draftInstitutionEmail={draftInstitutionEmail}
                  setDraftInstitutionEmail={setDraftInstitutionEmail}
                  draftInstitutionWebsite={draftInstitutionWebsite}
                  setDraftInstitutionWebsite={setDraftInstitutionWebsite}
                  draftInstitutionKepAddress={draftInstitutionKepAddress}
                  setDraftInstitutionKepAddress={setDraftInstitutionKepAddress}
                  draftInstitutionAddress={draftInstitutionAddress}
                  setDraftInstitutionAddress={setDraftInstitutionAddress}
                  draftDefaultCity={draftDefaultCity}
                  setDraftDefaultCity={setDraftDefaultCity}
                  draftDefaultDistrict={draftDefaultDistrict}
                  setDraftDefaultDistrict={setDraftDefaultDistrict}
                  draftWorkingYear={draftWorkingYear}
                  setDraftWorkingYear={setDraftWorkingYear}
                  draftSecurityPin={draftSecurityPin}
                  setDraftSecurityPin={setDraftSecurityPin}
                  draftAuthorizedPersonnelName={draftAuthorizedPersonnelName}
                  setDraftAuthorizedPersonnelName={setDraftAuthorizedPersonnelName}
                  draftAuthorizedPersonnelTitle={draftAuthorizedPersonnelTitle}
                  setDraftAuthorizedPersonnelTitle={setDraftAuthorizedPersonnelTitle}
                  handleCancelInstitutionSettings={handleCancelInstitutionSettings}
                  handleSaveInstitutionSettings={handleSaveInstitutionSettings}
                  draftTariffBasis={draftTariffBasis}
                  setDraftTariffBasis={setDraftTariffBasis}
                  handleCancelTariffSettings={handleCancelTariffSettings}
                  handleSaveTariffSettings={handleSaveTariffSettings}
                  accountingModuleEnabled={accountingModuleEnabled}
                  setAccountingModuleEnabled={setAccountingModuleEnabled}
                />
              )}

              {activeSection === "help" && <HelpScreen theme={theme} />}
            </div>
          </div>

          {/* Global Application Footer (Permanently Docked at the Bottom) */}
          <Footer
            currentFilePath={currentFilePath}
            fileName={fileName}
            institutionName={institutionName}
            theme={theme}
            onOpenLauncher={() => setShowLauncherModal(true)}
            onOpenFile={() => openFile()}
          />
        </main>
      </div>

      {/* Extracted Application Dialog Modals & Drawers */}
      <AppModals
        theme={theme}
        store={store}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        resModalOpen={resModalOpen}
        setResModalOpen={setResModalOpen}
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
        timeSlotSession={timeSlotSession}
        handleTimeSlotChange={handleTimeSlotChange}
        resStart={resStart}
        setResStart={setResStart}
        resEnd={resEnd}
        setResEnd={setResEnd}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
        resPhone={resPhone}
        setResPhone={setResPhone}
        resEmail={resEmail}
        setResEmail={setResEmail}
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
        mergedEventTypes={mergedEventTypes}
        customerSuggestions={customerSuggestions}
        phoneSuggestions={phoneSuggestions}
        decisionSuggestions={decisionSuggestions}
        handleCreateReservation={handleCreateReservation}
        resetReservationForm={resetReservationForm}
        venueModalOpen={venueModalOpen}
        setVenueModalOpen={setVenueModalOpen}
        newVenueName={newVenueName}
        setNewVenueName={setNewVenueName}
        newVenueCity={newVenueCity}
        setNewVenueCity={setNewVenueCity}
        newVenueDistrict={newVenueDistrict}
        setNewVenueDistrict={setNewVenueDistrict}
        newVenueAddress={newVenueAddress}
        setNewVenueAddress={setNewVenueAddress}
        newVenueMapUrl={newVenueMapUrl}
        setNewVenueMapUrl={setNewVenueMapUrl}
        newVenueCategory={newVenueCategory}
        setNewVenueCategory={setNewVenueCategory}
        newVenueManagerPersonnelId={newVenueManagerPersonnelId}
        setNewVenueManagerPersonnelId={setNewVenueManagerPersonnelId}
        newVenueManagerName={newVenueManagerName}
        setNewVenueManagerName={setNewVenueManagerName}
        newVenueManagerTitle={newVenueManagerTitle}
        setNewVenueManagerTitle={setNewVenueManagerTitle}
        newVenueManagerPhone={newVenueManagerPhone}
        setNewVenueManagerPhone={setNewVenueManagerPhone}
        newVenueColor={newVenueColor}
        setNewVenueColor={setNewVenueColor}
        handleCreateVenue={handleCreateVenue}
        resetVenueForm={resetVenueForm}
        hallModalOpen={hallModalOpen}
        setHallModalOpen={setHallModalOpen}
        newHallName={newHallName}
        setNewHallName={setNewHallName}
        newHallFloor={newHallFloor}
        setNewHallFloor={setNewHallFloor}
        newHallCapacity={newHallCapacity}
        setNewHallCapacity={setNewHallCapacity}
        newHallHourlyPrice={newHallHourlyPrice}
        setNewHallHourlyPrice={setNewHallHourlyPrice}
        newHallPricingType={newHallPricingType}
        setNewHallPricingType={setNewHallPricingType}
        newHallColor={newHallColor}
        setNewHallColor={setNewHallColor}
        handleCreateHall={handleCreateHall}
        resetHallForm={resetHallForm}
        personnelModalOpen={personnelModalOpen}
        setPersonnelModalOpen={setPersonnelModalOpen}
        personnelName={personnelName}
        setPersonnelName={setPersonnelName}
        personnelTitle={personnelTitle}
        setPersonnelTitle={setPersonnelTitle}
        personnelPhone={personnelPhone}
        setPersonnelPhone={setPersonnelPhone}
        personnelEmail={personnelEmail}
        setPersonnelEmail={setPersonnelEmail}
        handleCreatePersonnel={handleCreatePersonnel}
        removePersonnel={removePersonnel}
        resetPersonnelForm={resetPersonnelForm}
        mailModalOpen={mailModalOpen}
        setMailModalOpen={setMailModalOpen}
        mailPreset={mailPreset}
        copyModalOpen={copyModalOpen}
        setCopyModalOpen={setCopyModalOpen}
        deleteConfirmOpen={deleteConfirmOpen}
        setDeleteConfirmOpen={setDeleteConfirmOpen}
        deleteTarget={deleteTarget}
        handleExecuteDelete={handleExecuteDelete}
        printModalOpen={printModalOpen}
        setPrintModalOpen={setPrintModalOpen}
        selectedPrintReservation={selectedPrintReservation}
        setSelectedPrintReservation={setSelectedPrintReservation}
        institutionName={institutionName}
        institutionSubHeader={institutionSubHeader}
        institutionLogo={institutionLogo}
        defaultTariffBasis={defaultTariffBasis}
        hallById={hallById}
        selectedReservation={selectedReservation}
        setSelectedReservation={setSelectedReservation}
        editReceiptNo={editReceiptNo}
        setEditReceiptNo={setEditReceiptNo}
        editPaymentMethod={editPaymentMethod}
        setEditPaymentMethod={setEditPaymentMethod}
        editPaidAmount={editPaidAmount}
        setEditPaidAmount={setEditPaidAmount}
        updateReservationStatus={updateReservationStatus}
        updateReservationDetails={updateReservationDetails}
        handleCopySMS={handleCopySMS}
        handleQuickMail={handleQuickMail}
        promptDelete={promptDelete}
        onNavigateToCustomer={handleOpenCustomerHistory}
        customerHistoryOpen={customerHistoryOpen}
        setCustomerHistoryOpen={setCustomerHistoryOpen}
        customerHistoryName={customerHistoryName}
        showLauncherModal={showLauncherModal}
        setShowLauncherModal={setShowLauncherModal}
        currentFilePath={currentFilePath || ""}
        recentFiles={recentFiles}
        openFile={openFile}
        createFile={createFile}
        fetchRecentFiles={fetchRecentFiles}
        trashModalOpen={trashModalOpen}
        setTrashModalOpen={setTrashModalOpen}
        onReservationRestored={() => sqliteStore.loadFromDb()}
      />

      {/* Date & Time Confirmation Modal before saving reservation */}
      <ReservationDateConfirmModal
        open={isConfirmDateModalOpen}
        onOpenChange={setIsConfirmDateModalOpen}
        theme={theme}
        date={selectedDay}
        start={resStart}
        end={resEnd}
        timeSlotSession={timeSlotSession}
        venueName={store.venues.find((v) => v.id === resVenueId)?.name || "Tesis"}
        hallName={store.venues.flatMap((v) => v.halls).find((h) => h.id === resHallId)?.name || "Salon"}
        customer={resCustomer}
        phone={resPhone}
        eventType={resEventType}
        price={Number(resPrice) || 0}
        paid={Number(resPaid) || 0}
        onConfirm={executeConfirmedCreateReservation}
      />

      {/* Past Record Deletion Security PIN Modal */}
      {pastRecordTarget && (
        <PastRecordSecurityModal
          open={pastRecordSecurityOpen}
          onOpenChange={setPastRecordSecurityOpen}
          theme={theme}
          recordTitle={pastRecordTarget.title}
          recordDate={pastRecordTarget.date}
          authorizedPersonnelName={authorizedPersonnelName}
          authorizedPersonnelTitle={authorizedPersonnelTitle}
          savedSecurityPin={securityPin}
          onSuccess={handleExecutePastRecordDelete}
        />
      )}

      {/* Advanced Excel & Official PDF Export Modal */}
      <AdvancedExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        theme={theme}
        reservations={store.reservations}
        venues={store.venues}
        workingYear={workingYear}
        institutionName={institutionName}
        institutionSubHeader={institutionSubHeader}
        institutionLogo={institutionLogo}
      />

      <ExitBackupModal
        open={exitModalOpen}
        onOpenChange={setExitModalOpen}
        theme={theme}
        fileName={fileName}
        currentFilePath={currentFilePath}
        onConfirmExit={handleExecuteExit}
        onDirectExit={handleDirectExit}
      />
    </div>
  );
}

export default App;
