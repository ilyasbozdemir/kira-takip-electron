import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Check,
  Code,
  Download,
  FileJson,
  Mail,
  Smartphone,
  Upload,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Reservation, Store, Venue } from "@/lib/rental-store";

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
      r.date.replace(/-/g, "") + "T" + (r.start || "09:00").replace(":", "") + "00";
    const dtEnd =
      r.date.replace(/-/g, "") + "T" + (r.end || "17:00").replace(":", "") + "00";

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
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

interface IntegrationsTabProps {
  theme: "dark" | "light";
  store: Store;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  theme,
  store,
}) => {
  const isDark = theme === "dark";

  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSenderName, setSmtpSenderName] = useState("Mekan & Tesis Yönetimi");
  const [smtpBackupEmail, setSmtpBackupEmail] = useState("");

  // Auto-Email Dispatch Settings (Default is DISABLED / FALSE)
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(false);
  const [autoEmailAttachIcs, setAutoEmailAttachIcs] = useState(true);
  const [autoEmailTarget, setAutoEmailTarget] = useState<"customer" | "backup" | "both">("both");

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
        const autoParsed = JSON.parse(autoSaved);
        setAutoEmailEnabled(autoParsed.mode === "instant" || autoParsed.enabled === true);
        if (autoParsed.attachIcs !== undefined) setAutoEmailAttachIcs(autoParsed.attachIcs);
        if (autoParsed.target) setAutoEmailTarget(autoParsed.target);
      } else {
        setAutoEmailEnabled(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveSmtp = () => {
    const config = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
      senderName: smtpSenderName,
      backupEmail: smtpBackupEmail,
    };
    localStorage.setItem(SMTP_STORAGE_KEY, JSON.stringify(config));

    const autoConfig = {
      mode: autoEmailEnabled ? "instant" : "manual",
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

  return (
    <div className="space-y-6 pt-1">
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

      {/* Automatic Email & Calendar Dispatch Toggle Card (Default: False) */}
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
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
            autoEmailEnabled
              ? isDark ? "bg-emerald-950/30 border-emerald-800/60" : "bg-emerald-50 border-emerald-200"
              : isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
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
  );
};
