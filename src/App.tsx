import React, { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

import {
  hoursBetween,
  money,
  type NavSection,
  toKey,
  type Reservation,
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

import { DashboardScreen } from "@/screens/dashboard.screen";
import { CalendarScreen } from "@/screens/calendar.screen";
import { VenuesScreen } from "@/screens/venues.screen";
import { EventsScreen } from "@/screens/events.screen";
import { PersonnelScreen } from "@/screens/personnel.screen";
import { ReportsScreen } from "@/screens/reports.screen";
import { SettingsScreen } from "@/screens/settings.screen";

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
    fetchRecentFiles,
  } = useWorkspaceStore();

  const { activeTabId, setActiveTab } = useTabStore();

  // Launcher Modal State
  const [showLauncherModal, setShowLauncherModal] = useState(false);

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
    "grid"
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

  // Selected Reservation & Delete Targets
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedPrintReservation, setSelectedPrintReservation] = useState<Reservation | null>(null);
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
  const [mailPreset, setMailPreset] = useState({
    recipient: "",
    subject: "",
    body: "",
  });

  const handleQuickMail = (r: Reservation) => {
    const v = store.venues.find((x) => x.id === r.venueId);
    const h = store.venues.flatMap((x) => x.halls).find((x) => x.id === r.hallId);
    const subject = `Etkinlik Rezervasyon Teyidi - ${r.customer} (${r.date})`;
    const body =
      `Sayın ${r.customer},\n\n` +
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
    const h = store.venues.flatMap((x) => x.halls).find((x) => x.id === r.hallId);
    const text = `Sn. ${r.customer}, ${r.date} tarihindeki ${v?.name} - ${h?.name} ${r.eventType} salon kiralamanız kaydedilmiştir. Saat: ${r.start}-${r.end}. Toplam: ${money(
      r.price
    )}. Bilgi için: 0532 000 0000`;
    navigator.clipboard.writeText(text);
    toast.success("Özet mesaj metni panoya kopyalandı!");
  };

  // Google Drive & Draft Settings State
  const [gdriveToken, setGdriveToken] = useState(() => localStorage.getItem("gdrive_token") || "");
  const [gdriveFolderId, setGdriveFolderId] = useState(() => localStorage.getItem("gdrive_folder_id") || "");
  const [draftInstitutionName, setDraftInstitutionName] = useState(institutionName);
  const [draftInstitutionLogo, setDraftInstitutionLogo] = useState(institutionLogo);
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
      toast.success("Logo seçildi. Değişiklikleri Kaydet butonuna basarak onaylayın.");
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
  } = useReservationForm(store, defaultTariffBasis, selectedDay);

  const {
    newVenueName,
    setNewVenueName,
    newVenueDistrict,
    setNewVenueDistrict,
    newVenueAddress,
    setNewVenueAddress,
    newVenueMapUrl,
    setNewVenueMapUrl,
    newVenueCategory,
    setNewVenueCategory,
    newVenueManagerName,
    setNewVenueManagerName,
    newVenueManagerTitle,
    setNewVenueManagerTitle,
    newVenueManagerPhone,
    setNewVenueManagerPhone,
    newVenueColor,
    setNewVenueColor,
    handleCreateVenue,
  } = useVenueForm();

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
    newHallColor,
    setNewHallColor,
    handleCreateHall,
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
      const matchesSearch =
        !searchTerm ||
        r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone.includes(searchTerm) ||
        (r.eventType || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = eventTypeFilter === "all" || r.eventType === eventTypeFilter;
      const matchesVenue = calendarVenueFilter === "all" || r.venueId === calendarVenueFilter;
      return matchesSearch && matchesType && matchesVenue;
    });
  }, [store.reservations, searchTerm, eventTypeFilter, calendarVenueFilter]);

  // Monthly Financial Statistics
  const monthStats = useMemo(() => {
    const curYear = cursor.getFullYear();
    const curMonth = String(cursor.getMonth() + 1).padStart(2, "0");
    const prefix = `${curYear}-${curMonth}`;

    const monthRes = store.reservations.filter((r) => r.date.startsWith(prefix));
    const totalCount = monthRes.length;
    const totalRev = monthRes.reduce((acc, r) => acc + (r.price || 0), 0);
    const totalPaid = monthRes.reduce((acc, r) => acc + (r.paid || 0), 0);
    const totalHours = monthRes.reduce((acc, r) => acc + hoursBetween(r.start, r.end), 0);
    const remaining = totalRev - totalPaid;

    return { totalCount, totalRev, totalPaid, totalHours, remaining };
  }, [store.reservations, cursor]);

  // Delete Action Handlers
  const promptDelete = (
    type: "venue" | "hall" | "reservation",
    id: string,
    title: string,
    venueId?: string
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

  const updateReservationStatus = async (id: string, status: "confirmed" | "option") => {
    await sqliteStore.updateReservationStatus(id, status);
  };

  const updateReservationDetails = async (id: string, details: Partial<Reservation>) => {
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
        theme === "dark" ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900 light"
      }`}
    >
      <Toaster position="top-right" richColors />

      {/* Extracted Header Bar */}
      <AppHeader
        theme={theme}
        setTheme={setTheme}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Extracted Sidebar Navigation */}
        <AppSidebar
          theme={theme}
          sidebarCollapsed={sidebarCollapsed}
          fileName={fileName || ""}
          onOpenLauncher={() => setShowLauncherModal(true)}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setSidebarOpen={setSidebarOpen}
          store={store}
          institutionName={institutionName}
          institutionLogo={institutionLogo}
        />

        {/* Main Content View Screens */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
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
                onPromptDeleteReservation={(id, title) => promptDelete("reservation", id, title)}
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
                onPromptDelete={(type, id, title) => promptDelete(type, id, title)}
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

            {activeSection === "reports" && <ReportsScreen theme={theme} monthStats={monthStats} />}

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
          <Footer currentFilePath={currentFilePath} institutionName={institutionName} theme={theme} />
        </div>
      </div>

      {/* Extracted Application Dialog Modals & Drawers */}
      <AppModals
        theme={theme}
        store={store}
        selectedDay={selectedDay}
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
        venueModalOpen={venueModalOpen}
        setVenueModalOpen={setVenueModalOpen}
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
        handleCreateVenue={handleCreateVenue}
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
        newHallColor={newHallColor}
        setNewHallColor={setNewHallColor}
        handleCreateHall={handleCreateHall}
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
        showLauncherModal={showLauncherModal}
        setShowLauncherModal={setShowLauncherModal}
        currentFilePath={currentFilePath || ""}
        recentFiles={recentFiles}
        openFile={openFile}
        createFile={createFile}
        fetchRecentFiles={fetchRecentFiles}
      />
    </div>
  );
}

export default App;
