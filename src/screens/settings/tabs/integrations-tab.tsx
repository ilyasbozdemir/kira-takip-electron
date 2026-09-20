import React, { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  Cloud,
  Download,
  HardDrive,
  Mail,
  RefreshCw,
  Save,
  Shield,
  Upload,
  Wifi,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { Reservation, Store, Venue } from "@/lib/rental-store";
import { useChangeTracker } from "@/context/ChangeTrackingContext";

const SMTP_STORAGE_KEY = "venue-keeper-smtp-settings";

function generateICSContent(reservations: Reservation[], venues: Venue[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KİRAKONTROLUYGULAMASI//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:VenueKeeper Salon Kiralamaları",
  ];

  reservations.forEach((r) => {
    const venue = venues.find((v) => v.id === r.venueId);
    const hall = venue?.halls?.find((h) => h.id === r.hallId);
    const dtStart =
      r.date.replace(/-/g, "") +
      "T" +
      (r.start || "09:00").replace(":", "") +
      "00";
    const dtEnd =
      r.date.replace(/-/g, "") +
      "T" +
      (r.end || "17:00").replace(":", "") +
      "00";

    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.id}@venuekeeper.pro`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${r.eventType || "Etkinlik"}: ${r.customer}`,
      `LOCATION:${venue?.name || ""} - ${hall?.name || ""}`,
      `DESCRIPTION:Müşteri: ${r.customer} | Tel: ${r.phone} | Not: ${
        r.note || "-"
      }`,
      `STATUS:${r.status === "option" ? "TENTATIVE" : "CONFIRMED"}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

interface IntegrationsTabProps {
  theme: "dark" | "light";
  store: Store;
  accountingModuleEnabled?: boolean;
  setAccountingModuleEnabled?: (enabled: boolean) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  theme,
  store,
  accountingModuleEnabled = true,
  setAccountingModuleEnabled,
}) => {
  const isDark = theme === "dark";

  const {
    hasChanges,
    changeCount,
    lastSavedAt,
    closePreferenceMode,
    setClosePreferenceMode,
    closePreferenceActions,
    setClosePreferenceActions,
    skipEmailIfNoChanges,
    setSkipEmailIfNoChanges,
  } = useChangeTracker();

  const [activeProvider, setActiveProvider] = useState<"gdrive" | "smtp" | "modules">("gdrive");
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSenderName, setSmtpSenderName] = useState("Mekan & Tesis Yönetimi");
  const [smtpBackupEmail, setSmtpBackupEmail] = useState("");

  // Auto-Email Dispatch Settings
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(false);
  const [autoEmailAttachIcs, setAutoEmailAttachIcs] = useState(true);
  const [autoEmailTarget, setAutoEmailTarget] = useState<"customer" | "backup" | "both">("both");

  // Google Drive state
  const [gdriveToken, setGdriveToken] = useState(() => localStorage.getItem("gdrive_token") || "");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SMTP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.host) setSmtpHost(parsed.host);
        if (parsed.port) setSmtpPort(parsed.port);
        if (parsed.secure !== undefined) setSmtpSecure(parsed.secure);
        if (parsed.user) setSmtpUser(parsed.user);
        if (parsed.pass) setSmtpPass(parsed.pass);
        if (parsed.senderName) setSmtpSenderName(parsed.senderName);
        if (parsed.backupEmail) setSmtpBackupEmail(parsed.backupEmail);
      }

      const autoSaved = localStorage.getItem("venue-keeper-auto-email-settings");
      if (autoSaved) {
        const parsed = JSON.parse(autoSaved);
        if (parsed.enabled !== undefined) setAutoEmailEnabled(parsed.enabled);
        if (parsed.attachIcs !== undefined) setAutoEmailAttachIcs(parsed.attachIcs);
        if (parsed.target) setAutoEmailTarget(parsed.target);
      }
    } catch (e) {
      console.error("Failed to load settings from storage:", e);
    }
  }, []);

  const handleSaveSmtp = () => {
    const config = {
      host: smtpHost.trim(),
      port: smtpPort.trim(),
      secure: smtpSecure,
      user: smtpUser.trim(),
      pass: smtpPass.trim(),
      senderName: smtpSenderName.trim(),
      backupEmail: smtpBackupEmail.trim(),
    };
    localStorage.setItem(SMTP_STORAGE_KEY, JSON.stringify(config));

    const autoConfig = {
      enabled: autoEmailEnabled,
      attachIcs: autoEmailAttachIcs,
      target: autoEmailTarget,
    };
    localStorage.setItem("venue-keeper-auto-email-settings", JSON.stringify(autoConfig));

    toast.success("SMTP ve otomatik bildirim ayarları kaydedildi!");
  };

  const handleExportICS = () => {
    if (!store?.reservations || store.reservations.length === 0) {
      toast.error("Dışa aktarılacak takvim kaydı bulunamadı.");
      return;
    }
    const icsData = generateICSContent(store.reservations, store.venues);
    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Salon_Etkinlik_Takvimi_${new Date().toISOString().split("T")[0]}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Tüm etkinlikler Outlook / Google Takvim (.ics) formatında indirildi!");
  };

  const handleSaveCloseSettings = (mode: "ask" | "auto", newActions?: string[]) => {
    setClosePreferenceMode(mode);
    if (newActions !== undefined) {
      setClosePreferenceActions(newActions);
    }
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2200);
  };

  const openGdriveModal = () => {
    window.dispatchEvent(new CustomEvent("open-gdrive-modal"));
  };

  return (
    <div className="space-y-6 pt-1">
      {/* Top Header & Provider Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Bulut Entegrasyonu, Yedekleme ve Bildirimler
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Yerel çalışma veritabanınızı (.vke) Google Drive veya e-posta ile senkronize edin, kapatma tercihlerini yönetin.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl gap-1 border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveProvider("gdrive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeProvider === "gdrive"
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            ☁️ Google Drive & Kapatma
          </button>
          <button
            type="button"
            onClick={() => setActiveProvider("smtp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeProvider === "smtp"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            ✉️ E-Posta & SMTP
          </button>
          <button
            type="button"
            onClick={() => setActiveProvider("modules")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeProvider === "modules"
                ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            💼 Modüller & Takvim
          </button>
        </div>
      </div>

      {activeProvider === "gdrive" && (
        <div className="space-y-6">
          {/* Google Drive Hero Card */}
          <div className="bg-linear-to-br from-teal-500/10 via-emerald-500/10 to-indigo-500/10 dark:from-teal-950/40 dark:via-emerald-950/40 dark:to-indigo-950/40 rounded-2xl p-6 border border-teal-200/60 dark:border-teal-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-teal-500" />
                  Google Drive Bulut Depolama & Eşitleme Yöneticisi
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  Çalışma (.vke) dosyalarınızı doğrudan kişisel Google Drive hesabınıza yedekleyin, mevcut yedeklerinizi listeleyin ve istediğiniz dosyayı seçip bilgisayarınıza indirin.
                </p>
              </div>
              <Button
                onClick={openGdriveModal}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <Cloud size={16} /> Google Drive Bulut Yöneticisini Aç
              </Button>
            </div>
          </div>

          {/* Quick Actions Grid for Google Drive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Upload size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Buluta Yükleme (Export)
                  </h4>
                  <p className="text-xs text-slate-500">Aktif .vke dosyanızı Google Drive'a gönderir</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Çalışma alanınızdaki tüm salonları, rezervasyonları, kasa kayıtlarını paketleyerek Google Drive hesabınıza zaman damgalı yeni bir yedek olarak kaydeder.
              </p>
              <Button
                onClick={openGdriveModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer"
              >
                Dosyayı Buluta Yükle
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Download size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Buluttan İndirme (Import)
                  </h4>
                  <p className="text-xs text-slate-500">Drive'daki .vke yedeklerini listeler & geri yükler</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Google Drive hesabınızdaki geçmiş çalışma dosyalarını çekerek seçtiğiniz yedeği indirir ve doğrudan aktif çalışma veritabanı yapar.
              </p>
              <Button
                onClick={openGdriveModal}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer"
              >
                Bulut Yedeklerini Listele & İndir
              </Button>
            </div>
          </div>

          {/* Dosya Kapatma & Otomatik Yedekleme Tercihleri (Global) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <span>💾 Dosya Kapatma & Otomatik Yedekleme Davranışı (Global)</span>
                  {isSavedNotice && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">
                      Tercih Kaydedildi ✓
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Çalışma dosyanızı (.vke) her kapattığınızda veya uygulamadan çıktığınızda uygulanacak varsayılan davranışı belirleyin.
                </p>
              </div>

              {/* Change status badge in settings */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                    hasChanges
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {hasChanges
                    ? `Değişiklik Var (${changeCount} işlem)`
                    : "Tüm Veriler Kayıtlı & Güncel"}
                </span>
              </div>
            </div>

            {/* Ana Mod Seçimi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSaveCloseSettings("ask")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  closePreferenceMode === "ask"
                    ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">❓</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Her Kapatışta Onay Penceresi Aç
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    ÖNERİLEN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Dosyayı kapatırken Google Drive, E-posta veya Yerel yedek seçeneklerinden istediklerinizi seçmeniz için pencere açar.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSaveCloseSettings("auto")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  closePreferenceMode === "auto"
                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Otomatik Olarak Belirlenen Yedekleri Al ve Kapat
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    OTOMATİK
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Onay sormadan, aşağıda seçtiğiniz yedekleme yöntemlerini arka planda sırayla çalıştırır ve kapatır.
                </p>
              </button>
            </div>

            {/* Otomatik Mod Seçenekleri (Multi-checkbox) */}
            {closePreferenceMode === "auto" && (
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Otomatik Kapatma Sırasında Çalıştırılacak Yedekler:
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {closePreferenceActions.length === 0
                      ? "Yedekleme yapılmayacak"
                      : `${closePreferenceActions.length} yöntem aktif`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "gdrive",
                      icon: "☁️",
                      title: "Google Drive Bulutuna Yedekle",
                      desc: "Kişisel Google Drive hesabınıza .vke yedeğini yükler.",
                      configured: Boolean(gdriveToken),
                    },
                    {
                      id: "email",
                      icon: "✉️",
                      title: "E-Posta ile Yedek Gönder",
                      desc: "Kayıtlı yedek e-posta adresine ek dosya olarak postalar.",
                      configured: Boolean(smtpHost && smtpUser),
                    },
                    {
                      id: "backup",
                      icon: "💾",
                      title: "Bilgisayara Yerel Yedek Kaydet (.vke)",
                      desc: "Uygulama yedek klasörüne son 7 yedeği döngüsel yazar.",
                      configured: true,
                    },
                  ].map((item) => {
                    const isChecked = closePreferenceActions.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          const newActions = isChecked
                            ? closePreferenceActions.filter((x) => x !== item.id)
                            : [...closePreferenceActions, item.id];
                          handleSaveCloseSettings("auto", newActions);
                        }}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                          isChecked
                            ? "border-indigo-500/70 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs ring-1 ring-indigo-500/30"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 opacity-75"
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                              isChecked
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-3" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{item.icon}</span>
                            <h5 className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate">
                              {item.title}
                            </h5>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Change Tracking Protection Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Değişiklik Olmadığında E-Posta Gönderimini Engelle (Önerilen)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Son yedekleme/açılıştan bu yana veritabanında hiçbir işlem yapılmadıysa gereksiz yere e-posta atılmasını önler, kota ve ağ trafiğinizi korur.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={skipEmailIfNoChanges}
                  onChange={(e) => {
                    setSkipEmailIfNoChanges(e.target.checked);
                    setIsSavedNotice(true);
                    setTimeout(() => setIsSavedNotice(false), 2000);
                  }}
                  className="sr-only peer cursor-pointer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeProvider === "smtp" && (
        <div className="space-y-6">
          {/* SMTP Email Server Settings Card */}
          <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    <Mail className="h-5 w-5 text-indigo-500" /> Kurumsal SMTP E-posta Gönderim Sunucusu
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Müşterilere rezervasyon onayları, tahsis belgeleri ve hatırlatmaları göndermek için SMTP ayarlarını yapılandırın.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">SMTP Sunucu Adresi (Host)</Label>
                  <Input
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com veya mail.kurum.bel.tr"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Port Numarası</Label>
                  <Input
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587 veya 465"
                    className="mt-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Gönderici E-posta Adresi (Kullanıcı Adı)</Label>
                  <Input
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="iletisim@kurum.bel.tr"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">SMTP Parolası / Uygulama Şifresi</Label>
                  <Input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="mt-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Gönderen Başlığı / Unvanı</Label>
                  <Input
                    value={smtpSenderName}
                    onChange={(e) => setSmtpSenderName(e.target.value)}
                    placeholder="Örn: T.C. Belediye Başkanlığı - Tesisler Birimi"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Yedek / Bilgi E-posta Adresi (İsteğe Bağlı)</Label>
                  <Input
                    value={smtpBackupEmail}
                    onChange={(e) => setSmtpBackupEmail(e.target.value)}
                    placeholder="Örn: mudurluk@kurum.bel.tr"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="smtpSecure"
                  checked={smtpSecure}
                  onCheckedChange={(checked) => setSmtpSecure(!!checked)}
                />
                <label
                  htmlFor="smtpSecure"
                  className={`text-xs font-medium cursor-pointer ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  SSL / TLS Güvenli Bağlantı Kullan (Port 465 için önerilir)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveSmtp}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-xs"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> SMTP Ayarlarını Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Automatic Email & Calendar Dispatch Toggle Card */}
          <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
            <CardHeader>
              <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                <Mail className="h-5 w-5 text-emerald-500" /> Otomatik E-posta & Takvim Davetiyesi Bildirimi
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Yeni bir etkinlik/salon tahsisi kaydedildiğinde arka planda otomatik e-posta gönderilsin mi? (Varsayılan: Kapalı)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  autoEmailEnabled
                    ? isDark
                      ? "bg-emerald-950/30 border-emerald-800/60"
                      : "bg-emerald-50 border-emerald-200"
                    : isDark
                    ? "bg-slate-950/40 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Checkbox
                  id="autoEmailEnabled"
                  checked={autoEmailEnabled}
                  onCheckedChange={(checked) => setAutoEmailEnabled(!!checked)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="autoEmailEnabled"
                    className={`text-xs font-bold cursor-pointer block ${
                      autoEmailEnabled
                        ? isDark ? "text-emerald-300" : "text-emerald-800"
                        : isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    ⚡ Yeni Etkinlik Kaydedildiğinde Otomatik E-posta Gönder
                  </label>
                  <p className="text-[11px] text-slate-400">
                    {autoEmailEnabled
                      ? "Aktif: Yeni etkinlik oluşturulduğunda geçerli e-posta adresi varsa anında takvim davetiyesi (.ics) ile birlikte e-posta iletilecektir."
                      : "Kapalı (Önerilen): Otomatik mail atılmaz. Etkinlik listesinden dilediğiniz zaman 'E-posta' butonuyla manuel gönderebilirsiniz."}
                  </p>
                </div>
              </div>

              {autoEmailEnabled && (
                <div className="space-y-3 pt-1 pl-1 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoEmailAttachIcs"
                      checked={autoEmailAttachIcs}
                      onCheckedChange={(checked) => setAutoEmailAttachIcs(!!checked)}
                    />
                    <label
                      htmlFor="autoEmailAttachIcs"
                      className={`text-xs font-medium cursor-pointer ${isDark ? "text-slate-300" : "text-slate-700"}`}
                    >
                      📅 E-postaya .ics Takvim Davetiye Dosyasını Ekle (Google / Outlook / Apple Takvim uyumlu)
                    </label>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold block mb-1.5">Otomatik Gönderim Hedefi</Label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="autoEmailTarget"
                          checked={autoEmailTarget === "customer"}
                          onChange={() => setAutoEmailTarget("customer")}
                          className="accent-indigo-600"
                        />
                        Sadece Müşteriye
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="autoEmailTarget"
                          checked={autoEmailTarget === "both"}
                          onChange={() => setAutoEmailTarget("both")}
                          className="accent-indigo-600"
                        />
                        Müşteri & Yedek Adres (Her İkisi)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="autoEmailTarget"
                          checked={autoEmailTarget === "backup"}
                          onChange={() => setAutoEmailTarget("backup")}
                          className="accent-indigo-600"
                        />
                        Sadece Yedek E-posta Adresine
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveSmtp}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 font-semibold shadow-xs"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Bildirim Tercihlerini Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeProvider === "modules" && (
        <div className="space-y-6">
          {/* Optional Modules: Accounting & Cashflow Module */}
          <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
            <CardHeader>
              <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                <span className="text-lg">💼</span> İsteğe Bağlı Modüller & Muhasebe / Kasa Yapılandırması
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                İşletmenizin ihtiyacına göre gelir/gider, personel maaşı, fatura ve kasa nakit akışı modülünü açıp kapatabilirsiniz.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  accountingModuleEnabled
                    ? isDark
                      ? "bg-slate-950/60 border-slate-800"
                      : "bg-slate-50 border-slate-200"
                    : isDark
                    ? "bg-slate-950/30 border-slate-800/60"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                <Checkbox
                  id="accountingModuleToggle"
                  checked={accountingModuleEnabled}
                  onCheckedChange={(checked) => {
                    if (setAccountingModuleEnabled) {
                      setAccountingModuleEnabled(!!checked);
                      toast.success(
                        checked
                          ? "Muhasebe & Kasa Modülü etkinleştirildi. Sol menüye eklendi."
                          : "Muhasebe & Kasa Modülü gizlendi."
                      );
                    }
                  }}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="accountingModuleToggle"
                    className="text-xs font-bold cursor-pointer block text-slate-900 dark:text-slate-100"
                  >
                    📊 Muhasebe, Kasa & Gelir-Gider Modülünü Etkinleştir
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {accountingModuleEnabled
                      ? "Aktif: Sol menüde 'Muhasebe & Kasa' sekmesi görüntülenir. Kira tahsilatları, personel maaşları, elektrik/su faturaları, sarf malzeme harcamaları ve nakit akışı raporlanabilir."
                      : "Devre Dışı: Muhasebe menüsü gizlenir. Sistem sadece salon tahsis ve rezervasyon takvimine odaklanır."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar & ICS Export Card */}
          <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
            <CardHeader>
              <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                <Calendar className="h-5 w-5 text-sky-500" /> Takvim Dışa Aktarma (.ics / Google & Outlook)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Tüm salon kiralamalarını evrensel iCalendar (.ics) formatında dışa aktararak cep telefonunuzla veya kurumsal takviminizle senkronize edin.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-400 leading-relaxed">
                İndirilen <code className="text-indigo-400 font-mono">.ics</code> dosyasını Google Takvim, Apple Takvim veya Microsoft Outlook uygulamalarına tek tıkla içe aktarabilirsiniz.
              </p>

              <Button
                size="sm"
                onClick={handleExportICS}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-8 font-semibold shadow-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1" /> Tüm Takvimi (.ics) İndir
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
