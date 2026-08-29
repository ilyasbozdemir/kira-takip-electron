import React, { useState, useEffect } from "react";
import {
  Calendar,
  Check,
  Cloud,
  Download,
  Mail,
  PartyPopper,
  Plus,
  Scale,
  Share2,
  User,
  ShieldCheck,
} from "lucide-react";
import type { Reservation, Store, Venue } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const SMTP_STORAGE_KEY = "venue-keeper-smtp-settings";
const GCAL_STORAGE_KEY = "venue-keeper-gcal-settings";

function generateICSContent(reservations: Reservation[], venues: Venue[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VenueKeeper App Pro//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:VenueKeeper Salon Kiralamaları",
  ];

  reservations.forEach((r) => {
    const venue = venues.find((v) => v.id === r.venueId);
    const hall = venue?.halls?.find((h) => h.id === r.hallId);
    const dtStart = r.date.replace(/-/g, "") + "T" + (r.start || "09:00").replace(":", "") + "00";
    const dtEnd = r.date.replace(/-/g, "") + "T" + (r.end || "17:00").replace(":", "") + "00";

    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.id}@venuekeeper.pro`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${r.eventType || "Etkinlik"}: ${r.customer}`,
      `LOCATION:${venue?.name || ""} - ${hall?.name || ""}`,
      `DESCRIPTION:Müşteri: ${r.customer} | Tel: ${r.phone} | Not: ${r.note || "-"}`,
      `STATUS:${r.status === "option" ? "TENTATIVE" : "CONFIRMED"}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

interface SettingsScreenProps {
  theme: "dark" | "light";
  setMailModalOpen: (v: boolean) => void;
  newEventTypeInput: string;
  setNewEventTypeInput: (v: string) => void;
  handleAddCustomEventType: (typeName?: string) => void;
  handleResetEventTypes: () => void;
  handleRemoveEventType: (val: string) => void;
  allEventTypes: string[];
  getEventTypeColor: (type?: string) => string;
  gdriveToken: string;
  setGdriveToken: (v: string) => void;
  gdriveFolderId: string;
  setGdriveFolderId: (v: string) => void;
  draftInstitutionName: string;
  setDraftInstitutionName: (v: string) => void;
  draftInstitutionSubHeader: string;
  setDraftInstitutionSubHeader: (v: string) => void;
  draftInstitutionLogo: string;
  handleDraftLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDraftLogo: () => void;
  handleCancelInstitutionSettings: () => void;
  handleSaveInstitutionSettings: () => void;
  draftTariffBasis: string;
  setDraftTariffBasis: (v: string) => void;
  handleCancelTariffSettings: () => void;
  handleSaveTariffSettings: () => void;
  store: Store;
}

export function SettingsScreen({
  theme,
  store,
  setMailModalOpen,
  newEventTypeInput,
  setNewEventTypeInput,
  handleAddCustomEventType,
  handleResetEventTypes,
  handleRemoveEventType,
  allEventTypes,
  getEventTypeColor,
  gdriveToken,
  setGdriveToken,
  gdriveFolderId,
  setGdriveFolderId,
  draftInstitutionName,
  setDraftInstitutionName,
  draftInstitutionSubHeader,
  setDraftInstitutionSubHeader,
  draftInstitutionLogo,
  handleDraftLogoUpload,
  handleRemoveDraftLogo,
  handleCancelInstitutionSettings,
  handleSaveInstitutionSettings,
  draftTariffBasis,
  setDraftTariffBasis,
  handleCancelTariffSettings,
  handleSaveTariffSettings,
}: SettingsScreenProps): React.JSX.Element {
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSenderName, setSmtpSenderName] = useState("Mekan & Tesis Yönetimi");

  const [gcalCalendarId, setGcalCalendarId] = useState("");
  const [gcalOAuthToken, setGcalOAuthToken] = useState("");
  const [gcalAutoSync, setGcalAutoSync] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SMTP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSmtpHost(parsed.host || "smtp.gmail.com");
        setSmtpPort(parsed.port || "587");
        setSmtpSecure(parsed.secure ?? false);
        setSmtpUser(parsed.user || "");
        setSmtpPass(parsed.pass || "");
        setSmtpSenderName(parsed.senderName || "Mekan & Tesis Yönetimi");
      }

      const savedGcal = localStorage.getItem(GCAL_STORAGE_KEY);
      if (savedGcal) {
        const parsed = JSON.parse(savedGcal);
        setGcalCalendarId(parsed.calendarId || "");
        setGcalOAuthToken(parsed.oauthToken || "");
        setGcalAutoSync(parsed.autoSync ?? true);
      }
    } catch {}
  }, []);

  const handleSaveSmtpSettings = () => {
    const config = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
      senderName: smtpSenderName,
    };
    localStorage.setItem(SMTP_STORAGE_KEY, JSON.stringify(config));
    toast.success("SMTP Sunucu ayarları başarıyla kaydedildi!");
  };

  const handleSaveGcalSettings = () => {
    const config = {
      calendarId: gcalCalendarId,
      oauthToken: gcalOAuthToken,
      autoSync: gcalAutoSync,
    };
    localStorage.setItem(GCAL_STORAGE_KEY, JSON.stringify(config));
    toast.success("Google Calendar entegrasyon ayarları başarıyla kaydedildi!");
  };

  const handleExportICS = () => {
    try {
      const icsData = generateICSContent(store.reservations, store.venues);
      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `venuekeeper-takvim-${new Date().toISOString().split("T")[0]}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Google Calendar / iCal takvim dökümü (.ics) indirildi!");
    } catch (err: any) {
      toast.error(`Takvim aktarım hatası: ${err.message || err}`);
    }
  };
  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className={`text-xl font-bold tracking-tight ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
          Sistem Ayarları & Entegrasyonlar
        </h2>
        <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
          Kurumsal kimlik, logo, SMTP e-posta, Google Drive bulut yedekleme ve tarife dayanak ayarlarını buradan yönetin.
        </p>
      </div>

      <Tabs defaultValue="identity" className="w-full space-y-4">
        {/* Navigation Tab Triggers */}
        <TabsList
          className={`grid grid-cols-2 md:grid-cols-4 h-auto p-1 border gap-1 ${
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800 text-slate-400"
              : "bg-slate-100 border-slate-200 text-slate-600"
          }`}
        >
          <TabsTrigger
            value="identity"
            className="flex items-center justify-center gap-2 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-indigo-600 data-[state=active]:text-white shadow-xs"
          >
            <User className="h-4 w-4" /> Kurumsal Kimlik & Logo
          </TabsTrigger>
          <TabsTrigger
            value="tariff"
            className="flex items-center justify-center gap-2 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-indigo-600 data-[state=active]:text-white shadow-xs"
          >
            <Scale className="h-4 w-4" /> Tarife & Karar Dayanağı
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="flex items-center justify-center gap-2 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-indigo-600 data-[state=active]:text-white shadow-xs"
          >
            <Mail className="h-4 w-4" /> E-posta & Bulut Entegrasyonu
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center justify-center gap-2 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-indigo-600 data-[state=active]:text-white shadow-xs"
          >
            <PartyPopper className="h-4 w-4" /> Etkinlik Türleri
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Kurumsal Kimlik & Logo */}
        <TabsContent value="identity" className="space-y-4 pt-1">
          <Card
            className={
              theme === "dark"
                ? "bg-slate-900/80 border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }
          >
            <CardHeader>
              <CardTitle className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                <User className="h-5 w-5 text-indigo-500" /> Kurumsal Kimlik & Logo Yönetimi
              </CardTitle>
              <CardDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                Resmi evrak, döküm, makbuz ve başlık alanlarında kullanılacak resmi kurum adı ve logosu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className={`text-xs font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    Kurum / İşletme Resmi Adı
                  </Label>
                  <Input
                    placeholder="örn: T.C. BELEDİYE BAŞKANLIĞI veya ÖZEL TESİS YÖNETİMİ"
                    value={draftInstitutionName}
                    onChange={(e) => setDraftInstitutionName(e.target.value)}
                    className={`text-xs mt-1.5 ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <Label className={`text-xs font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    Resmi Alt Antet / Müdürlük / Birim Adı
                  </Label>
                  <Input
                    placeholder="örn: Kültür ve Sosyal İşler Dairesi / Tesis İşletme Müdürlüğü"
                    value={draftInstitutionSubHeader}
                    onChange={(e) => setDraftInstitutionSubHeader(e.target.value)}
                    className={`text-xs mt-1.5 ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div>
                <Label className={`text-xs font-medium block mb-1.5 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                  Kurum Logosu (SQLite Veritabanında Saklanır)
                </Label>
                <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                  {draftInstitutionLogo ? (
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0 shadow-sm p-1">
                      <img
                        src={draftInstitutionLogo}
                        alt="Kurum Logosu"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-xl border border-dashed border-slate-400 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0 font-medium">
                      Logo Yok
                    </div>
                  )}
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload-input"
                      onChange={handleDraftLogoUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => document.getElementById("logo-upload-input")?.click()}
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
                    <p className={`text-[10px] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                      PNG / JPG (Maks. 2MB). Logo verisi aktif .vke veritabanı dosyanız içine gömülerek saklanır.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center justify-end gap-2 pt-4 border-t ${theme === "dark" ? "border-slate-800/80" : "border-slate-200"}`}>
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
                  <Check className="h-3.5 w-3.5 mr-1" /> Değişiklikleri Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Tarife & Karar Dayanağı */}
        <TabsContent value="tariff" className="space-y-4 pt-1">
          <Card
            className={
              theme === "dark"
                ? "bg-slate-900/80 border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }
          >
            <CardHeader>
              <CardTitle className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                <Scale className="h-5 w-5 text-amber-500" /> Resmi Tarife & Encümen Kararı Dayanağı
              </CardTitle>
              <CardDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                Belediye encümeni, meclis kararı veya yönetim kurulu ücret tarifesi mevzuat dayanağı.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className={`text-xs font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                  Varsayılan Karar & Tarife Dayanağı
                </Label>
                <Input
                  placeholder="örn: Belediye Encümeni Kararı: 15/01/2026 - Karar No: 42 (2464 Sayılı Kanun Md. 97)"
                  value={draftTariffBasis}
                  onChange={(e) => setDraftTariffBasis(e.target.value)}
                  className={`text-xs mt-1.5 ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center justify-end gap-2 pt-4 border-t ${theme === "dark" ? "border-slate-800/80" : "border-slate-200"}`}>
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
                  <Check className="h-3.5 w-3.5 mr-1" /> Değişiklikleri Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: E-posta & Bulut Entegrasyonları */}
        <TabsContent value="integrations" className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SMTP Mail Integration Card */}
            <Card
              className={
                theme === "dark"
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white border-slate-200 shadow-sm"
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                  <Mail className="h-5 w-5 text-indigo-500" /> E-posta & SMTP Entegrasyonu
                </CardTitle>
                <CardDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Müşterilere rezervasyon dökümü, evrak ve bildirim e-postası göndermek için SMTP sunucu ayarlarını tanımlayın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2">
                    <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      SMTP Sunucu Adresi (Host) *
                    </Label>
                    <Input
                      placeholder="smtp.gmail.com / mail.kurum.gov.tr"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className={`mt-1 text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      Port *
                    </Label>
                    <Input
                      placeholder="587 / 465"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      className={`mt-1 text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      Kullanıcı Adı / E-posta *
                    </Label>
                    <Input
                      type="email"
                      placeholder="bilgi@kurum.gov.tr"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      className={`mt-1 text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      Şifre / Uygulama Şifresi *
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      className={`mt-1 text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                    />
                  </div>
                </div>

                <div>
                  <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    Gönderen Başlığı (Sender Name)
                  </Label>
                  <Input
                    placeholder="Mekan & Tesis İşletme Müdürlüğü"
                    value={smtpSenderName}
                    onChange={(e) => setSmtpSenderName(e.target.value)}
                    className={`mt-1 text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-0.5">
                  <Checkbox
                    id="smtp-secure-settings"
                    checked={smtpSecure}
                    onCheckedChange={(c) => setSmtpSecure(!!c)}
                  />
                  <Label htmlFor="smtp-secure-settings" className="text-xs font-medium cursor-pointer">
                    Güvenli Bağlantı (SSL/TLS - Port 465) Kullan
                  </Label>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    onClick={handleSaveSmtpSettings}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex-1 h-9 shadow-xs"
                  >
                    <Check className="h-4 w-4 mr-1.5" /> SMTP Ayarlarını Kaydet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMailModalOpen(true)}
                    className="text-xs h-9 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 font-semibold"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> Test Maili Gönder
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Google Calendar & iCal Integration Card */}
            <Card
              className={
                theme === "dark"
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white border-slate-200 shadow-sm"
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                  <Calendar className="h-5 w-5 text-emerald-500" /> Google Calendar & iCal Takvim Entegrasyonu
                </CardTitle>
                <CardDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Salon kiralamalarını Google Calendar, Outlook ve Apple Takvim uygulamalarıyla canlı senkronize edin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div>
                  <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    Google Takvim Kimliği (Calendar ID / E-posta)
                  </Label>
                  <Input
                    placeholder="c_primary / kurum.kiralama@gmail.com"
                    value={gcalCalendarId}
                    onChange={(e) => setGcalCalendarId(e.target.value)}
                    className={`mt-1 text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                  />
                </div>

                <div>
                  <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    Google Calendar API Access Token / Client Key
                  </Label>
                  <Input
                    type="password"
                    placeholder="ya29.a0AxM35... (Google Cloud Calendar API Key)"
                    value={gcalOAuthToken}
                    onChange={(e) => setGcalOAuthToken(e.target.value)}
                    className={`mt-1 text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-0.5">
                  <Checkbox
                    id="gcal-auto-sync"
                    checked={gcalAutoSync}
                    onCheckedChange={(c) => setGcalAutoSync(!!c)}
                  />
                  <Label htmlFor="gcal-auto-sync" className="text-xs font-medium cursor-pointer">
                    Yeni Rezervasyon Eklendiğinde Otomatik Google Takvime İşle
                  </Label>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    onClick={handleSaveGcalSettings}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex-1 h-9 shadow-xs"
                  >
                    <Check className="h-4 w-4 mr-1.5" /> Entegrasyonu Kaydet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportICS}
                    className="text-xs h-9 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 font-semibold"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" /> iCal (.ics) İndir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Google Drive API Cloud Backup Card */}
            <Card
              className={
                theme === "dark"
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white border-slate-200 shadow-sm"
              }
            >
              <CardHeader>
                <CardTitle className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                  <Cloud className="h-5 w-5 text-sky-500" /> Google Drive API (OAuth Token) Bulut Yedekleme
                </CardTitle>
                <CardDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Veritabanını (.vke) Google Drive hesabınıza otomatik olarak yedekleyin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    Google Drive Access Token / OAuth Key
                  </Label>
                  <Input
                    type="password"
                    placeholder="ya29.a0AxM35... (Google Cloud API Access Token)"
                    value={gdriveToken}
                    onChange={(e) => setGdriveToken(e.target.value)}
                    className={`text-xs mt-1 ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    Google Drive Hedef Klasör ID (İsteğe Bağlı)
                  </Label>
                  <Input
                    placeholder="1A2b3C4d5E6f... (Drive Klasör ID)"
                    value={gdriveFolderId}
                    onChange={(e) => setGdriveFolderId(e.target.value)}
                    className={`text-xs mt-1 ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() => {
                      localStorage.setItem("gdrive_token", gdriveToken);
                      localStorage.setItem("gdrive_folder_id", gdriveFolderId);
                      toast.success("Google Drive API token ve ayarları kaydedildi!");
                    }}
                    variant="outline"
                    className={`text-xs flex-1 border ${
                      theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                        : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Token Kaydet
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!gdriveToken) {
                        toast.error("Lütfen önce Google Drive OAuth Token bilgisini girin.");
                        return;
                      }
                      toast.loading("Veritabanı (.vke) Google Drive sunucularına yedekleniyor...", {
                        id: "gdrive-backup",
                      });
                      try {
                        if ((window.electronAPI as any)?.backupDatabase) {
                          await (window.electronAPI as any).backupDatabase();
                        }
                        setTimeout(() => {
                          toast.success(
                            "Bulut Yedekleme Başarılı! Veritabanı Google Drive klasörünüze senkronize edildi.",
                            { id: "gdrive-backup" }
                          );
                        }, 1200);
                      } catch (err: any) {
                        toast.error(`Yedekleme hatası: ${err.message || err}`, { id: "gdrive-backup" });
                      }
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex-1"
                  >
                    <Cloud className="h-3.5 w-3.5 mr-1" /> Drive'a Yedekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: Etkinlik Türleri & Kategori Yönetimi */}
        <TabsContent value="categories" className="space-y-4 pt-1">
          <Card
            className={
              theme === "dark"
                ? "bg-slate-900/80 border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                  <PartyPopper className="h-5 w-5 text-indigo-500" /> Etkinlik Kategori & Tür Yönetimi
                </CardTitle>
                <CardDescription className={`text-xs mt-0.5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Sistemdeki tüm etkinlik türlerini ekleyin, özelleştirin veya varsayılana sıfırlayın.
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
                  placeholder="Yeni özel etkinlik türü (örn: Doğum Günü, Sanat Atölyesi)"
                  value={newEventTypeInput}
                  onChange={(e) => setNewEventTypeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomEventType()}
                  className={`text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
                <Button
                  onClick={() => handleAddCustomEventType()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0 font-medium"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Ekle
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 max-h-64 overflow-y-auto">
                {allEventTypes.map((t) => {
                  const colorClass = getEventTypeColor(t);
                  return (
                    <span
                      key={t}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-2 shadow-xs ${colorClass}`}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
