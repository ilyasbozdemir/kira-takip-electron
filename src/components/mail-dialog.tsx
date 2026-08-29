import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Calendar, Download, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRecipient?: string;
  defaultSubject?: string;
  defaultBody?: string;
  theme?: "dark" | "light";
  reservationData?: {
    id?: string;
    customer?: string;
    phone?: string;
    date?: string;
    start?: string;
    end?: string;
    venueName?: string;
    hallName?: string;
    eventType?: string;
  };
}

const SMTP_STORAGE_KEY = "venue-keeper-smtp-settings";

function generateSingleReservationICS(resData: any) {
  const dateStr = (resData?.date || new Date().toISOString().split("T")[0]).replace(/-/g, "");
  const startStr = (resData?.start || "09:00").replace(":", "") + "00";
  const endStr = (resData?.end || "17:00").replace(":", "") + "00";
  const dtStart = `${dateStr}T${startStr}`;
  const dtEnd = `${dateStr}T${endStr}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VenueKeeper App Pro//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:VenueKeeper Salon Tahsisi",
    "BEGIN:VEVENT",
    `UID:${resData?.id || Math.random().toString(36).slice(2)}@venuekeeper.pro`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${resData?.eventType || "Salon Tahsisi"}: ${resData?.customer || "Müşteri Tahsis Kaydı"}`,
    `LOCATION:${resData?.venueName || "Tesis"} - ${resData?.hallName || "Salon"}`,
    `DESCRIPTION:Müşteri: ${resData?.customer || "-"} | Tel: ${resData?.phone || "-"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function MailDialog({
  open,
  onOpenChange,
  defaultRecipient = "",
  defaultSubject = "Venue Keeper - Salon Kiralama ve Evrak Bildirimi",
  defaultBody = "",
  theme = "dark",
  reservationData,
}: MailDialogProps) {
  // SMTP Configuration State (Auto-synced from Settings)
  const [smtpConfig, setSmtpConfig] = useState<{
    host: string;
    port: string;
    secure: boolean;
    user: string;
    pass: string;
    senderName: string;
  }>({
    host: "smtp.gmail.com",
    port: "587",
    secure: false,
    user: "",
    pass: "",
    senderName: "Mekan & Tesis Yönetimi",
  });

  // Mail Content State
  const [to, setTo] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [activeTab, setActiveTab] = useState<"send" | "ics">("send");
  const [sending, setSending] = useState(false);
  const [copiedIcs, setCopiedIcs] = useState(false);
  const [previewMode, setPreviewMode] = useState<"visual" | "code">("visual");

  const loadSmtpSettings = () => {
    try {
      const saved = localStorage.getItem(SMTP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSmtpConfig({
          host: parsed.host || "smtp.gmail.com",
          port: parsed.port || "587",
          secure: parsed.secure ?? false,
          user: parsed.user || "",
          pass: parsed.pass || "",
          senderName: parsed.senderName || "Mekan & Tesis Yönetimi",
        });
      }
    } catch {}
  };

  useEffect(() => {
    if (open) {
      loadSmtpSettings();
    }
  }, [open]);

  useEffect(() => {
    if (defaultRecipient) setTo(defaultRecipient);
    if (defaultSubject) setSubject(defaultSubject);
    if (defaultBody) setBody(defaultBody);
  }, [defaultRecipient, defaultSubject, defaultBody]);

  const handleDownloadICS = () => {
    try {
      const icsContent = generateSingleReservationICS(reservationData);
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `etkinlik-${reservationData?.id || "tahsisi"}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("iCal (.ics) takvim daveti dosyası indirildi!");
    } catch (err: any) {
      toast.error(`ICS indirme hatası: ${err.message || err}`);
    }
  };

  const handleCopyICSContent = () => {
    const icsContent = generateSingleReservationICS(reservationData);
    navigator.clipboard.writeText(icsContent);
    setCopiedIcs(true);
    toast.success("iCal (.ics) takvim kodu panoya kopyalandı!");
    setTimeout(() => setCopiedIcs(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!to.trim()) {
      toast.error("Lütfen bir alıcı e-posta adresi girin.");
      return;
    }
    if (!smtpConfig.user.trim() || !smtpConfig.pass.trim()) {
      toast.error("E-posta göndermek için lütfen önce Ayarlar > E-posta sekmesinden SMTP kullanıcı adı ve şifrenizi tanımlayın.");
      return;
    }

    setSending(true);

    try {
      if (window.electronAPI?.sendEmail) {
        const res = await window.electronAPI.sendEmail({
          smtpConfig: {
            host: smtpConfig.host,
            port: Number(smtpConfig.port) || 587,
            secure: smtpConfig.secure,
            user: smtpConfig.user,
            pass: smtpConfig.pass,
            senderName: smtpConfig.senderName,
          },
          mailData: {
            to,
            subject,
            text: body,
            html: body.includes("<html") ? body : body.replace(/\n/g, "<br>"),
          },
        });

        if (res.success) {
          toast.success("E-posta başarıyla alıcıya gönderildi!");
          onOpenChange(false);
        } else {
          toast.error(`Mail Hatası: ${res.error}`);
        }
      } else {
        toast.info("E-posta gönderme özelliği masaüstü Electron ortamında aktiftir.");
      }
    } catch (err: any) {
      toast.error(`Hata: ${err.message || "Mail gönderilemedi"}`);
    } finally {
      setSending(false);
    }
  };

  const currentIcsPreview = generateSingleReservationICS(reservationData);
  const isSmtpConfigured = Boolean(smtpConfig.user && smtpConfig.pass);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          theme === "dark"
            ? "sm:max-w-[580px] bg-slate-900 border-slate-800 text-slate-100"
            : "sm:max-w-[580px] bg-white border-slate-200 text-slate-900 shadow-2xl"
        }
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={`flex items-center gap-2 text-xl font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
              <Mail className="h-5 w-5 text-indigo-500" /> E-posta & Takvim İletimi
            </DialogTitle>
            {isSmtpConfigured ? (
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                ✓ SMTP: {smtpConfig.user}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px] font-bold">
                ⚠️ SMTP Ayarı Yapılmadı
              </Badge>
            )}
          </div>
          <DialogDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Rezervasyon dökümünü e-posta olarak gönderin veya .ics takvim dosyasını indirin.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className={`flex border-b mb-4 gap-1 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("send")}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "send"
                ? "border-indigo-500 text-indigo-500"
                : theme === "dark"
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            ✉️ E-posta Gönder
          </button>
          <button
            onClick={() => setActiveTab("ics")}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "ics"
                ? "border-emerald-500 text-emerald-500"
                : theme === "dark"
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> 📅 .ics Takvim Daveti
          </button>
        </div>

        {!isSmtpConfigured && activeTab === "send" && (
          <div className="p-3 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-between">
            <span>⚠️ E-posta göndermek için henüz SMTP sunucu ayarları tanımlanmamış.</span>
          </div>
        )}

        {activeTab === "send" ? (
          <div className="space-y-3.5 py-1">
            <div className="flex items-center justify-between">
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Alıcı E-posta *</Label>
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewMode("visual")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    previewMode === "visual"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  👁️ Canlı Önizleme
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("code")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    previewMode === "code"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ✏️ Metin / Kodu Düzenle
                </button>
              </div>
            </div>

            <Input
              placeholder="ornek@musteri.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={`text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />

            <div>
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Konu</Label>
              <Input
                placeholder="Konu başlığı..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>

            <div>
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>E-posta Mesaj İçeriği</Label>
              {previewMode === "visual" && body.includes("<html") ? (
                <div className="w-full h-56 mt-1 rounded-xl border border-slate-800 bg-white overflow-hidden shadow-inner">
                  <iframe
                    title="E-posta Canlı Önizleme"
                    srcDoc={body}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <Textarea
                  rows={6}
                  placeholder="Mesajınızı buraya yazın..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: .ics TAKVİM TESTİ */
          <div className="space-y-3.5 py-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Calendar className="h-4 w-4" /> Görsel Takvim Daveti & Kart Önizleme
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewMode("visual")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    previewMode === "visual"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🎨 Görsel Kart
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("code")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    previewMode === "code"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  💻 RFC 5545 Kodu
                </button>
              </div>
            </div>

            {previewMode === "visual" ? (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 text-slate-100 shadow-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-base shrink-0 shadow-md">
                      📅
                    </div>
                    <div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold mb-1">
                        CONFIRMED • KESİNLEŞMİŞ TAKVİM KAYDI
                      </Badge>
                      <h3 className="text-sm font-extrabold text-slate-100 leading-snug">
                        {reservationData?.eventType || "Salon Tahsis Etkinliği"}: {reservationData?.customer || "Müşteri Tahsis Kaydı"}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs border-t border-slate-800">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-semibold">Tarih & Zaman</span>
                    <span className="font-bold text-slate-200">
                      📅 {reservationData?.date || "2026-08-29"}
                    </span>
                    <div className="text-[11px] font-mono text-emerald-400 font-medium mt-0.5">
                      ⏰ {reservationData?.start || "09:00"} - {reservationData?.end || "17:00"}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-semibold">Mekan & Konum</span>
                    <span className="font-bold text-slate-200 truncate block">
                      🏛️ {reservationData?.venueName || "Tesis"}
                    </span>
                    <div className="text-[11px] text-indigo-400 font-medium truncate mt-0.5">
                      📍 {reservationData?.hallName || "Salon"}
                    </div>
                  </div>
                </div>

                {reservationData?.phone && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <span>👤 Müşteri İletişim:</span>
                    <span className="font-mono text-slate-200 font-bold">{reservationData.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  readOnly
                  rows={7}
                  value={currentIcsPreview}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleCopyICSContent}
                className="text-xs h-9 flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
              >
                {copiedIcs ? <Check className="h-4 w-4 mr-1 text-emerald-400" /> : <Copy className="h-4 w-4 mr-1" />}
                {copiedIcs ? "Kopyalandı" : "Kodu Kopyala"}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className={theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}
          >
            Kapat
          </Button>

          {activeTab === "send" ? (
            <Button
              onClick={handleSendEmail}
              disabled={sending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-2"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Gönderiliyor..." : "E-posta Gönder"}
            </Button>
          ) : (
            <Button
              onClick={handleDownloadICS}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5"
            >
              <Download className="h-4 w-4" /> .ics Dosyasını İndir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
