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
  // SMTP Configuration State
  const [host, setHost] = useState("smtp.gmail.com");
  const [port, setPort] = useState("587");
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [senderName, setSenderName] = useState("Mekan & Tesis Yönetimi");

  // Mail Content State
  const [to, setTo] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [activeTab, setActiveTab] = useState<"send" | "settings" | "ics">("send");
  const [sending, setSending] = useState(false);
  const [copiedIcs, setCopiedIcs] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SMTP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHost(parsed.host || "smtp.gmail.com");
        setPort(parsed.port || "587");
        setSecure(parsed.secure ?? false);
        setUser(parsed.user || "");
        setPass(parsed.pass || "");
        setSenderName(parsed.senderName || "Mekan & Tesis Yönetimi");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (defaultRecipient) setTo(defaultRecipient);
    if (defaultSubject) setSubject(defaultSubject);
    if (defaultBody) setBody(defaultBody);
  }, [defaultRecipient, defaultSubject, defaultBody]);

  const saveSettings = () => {
    const config = { host, port, secure, user, pass, senderName };
    localStorage.setItem(SMTP_STORAGE_KEY, JSON.stringify(config));
    toast.success("SMTP mail ayarları yerel olarak kaydedildi.");
  };

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
    if (!user.trim() || !pass.trim()) {
      toast.error("E-posta göndermek için SMTP ayarlarından kullanıcı adı ve şifrenizi girin.");
      setActiveTab("settings");
      return;
    }

    saveSettings();
    setSending(true);

    try {
      if (window.electronAPI?.sendEmail) {
        const res = await window.electronAPI.sendEmail({
          smtpConfig: {
            host,
            port: Number(port) || 587,
            secure,
            user,
            pass,
            senderName,
          },
          mailData: {
            to,
            subject,
            text: body,
            html: body.replace(/\n/g, "<br>"),
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
          <DialogTitle className={`flex items-center gap-2 text-xl font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
            <Mail className="h-5 w-5 text-indigo-500" /> E-posta Gönder & SMTP & .ics Ayarları
          </DialogTitle>
          <DialogDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Rezervasyon dökümünü iletin, SMTP ayarlarını yapılandırın ve .ics takvim dosyasını test edin.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className={`flex border-b mb-4 gap-1 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("send")}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "send"
                ? "border-indigo-500 text-indigo-500 font-bold"
                : theme === "dark"
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            E-posta Gönder
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-indigo-500 text-indigo-500 font-bold"
                : theme === "dark"
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            SMTP Sunucu Ayarları
          </button>
          <button
            onClick={() => setActiveTab("ics")}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "ics"
                ? "border-emerald-500 text-emerald-500 font-bold"
                : theme === "dark"
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> .ics Takvim Testi
          </button>
        </div>

        {activeTab === "send" ? (
          <div className="space-y-4 py-1">
            <div>
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Alıcı E-posta *</Label>
              <Input
                placeholder="ornek@musteri.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
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
              <div className="flex items-center justify-between">
                <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Mesaj İçeriği</Label>
                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="h-3 w-3" /> .ics Dosyasını İndir
                </button>
              </div>
              <Textarea
                rows={5}
                placeholder="Mesajınızı buraya yazın..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          </div>
        ) : activeTab === "settings" ? (
          <div className="space-y-3.5 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>SMTP Sunucu (Host)</Label>
                <Input
                  placeholder="smtp.gmail.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
              <div>
                <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Port</Label>
                <Input
                  placeholder="587"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>E-posta (User)</Label>
                <Input
                  placeholder="belediye@gmail.com"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
              <div>
                <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Şifre / Uygulama Şifresi</Label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>
            <div>
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Gönderen Adı</Label>
              <Input
                placeholder="Mekan & Tesis Yönetimi"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          </div>
        ) : (
          /* TAB 3: .ics TAKVİM TESTİ */
          <div className="space-y-3.5 py-1">
            <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Calendar className="h-4 w-4" /> iCal (.ics) Takvim Dosyası Önizleme & Testi
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Bu rezervasyon kaydı için üretilen RFC 5545 takvim daveti kodu aşağıdadır. Google Calendar veya Outlook uygulamasında test edebilirsiniz.
              </p>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300">Üretilen .ics Kod İçeriği</Label>
              <textarea
                readOnly
                rows={7}
                value={currentIcsPreview}
                className="w-full mt-1 p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleDownloadICS}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex-1 h-9"
              >
                <Download className="h-4 w-4 mr-1.5" /> .ics Dosyasını İndir
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyICSContent}
                className="text-xs h-9 border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
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
          ) : activeTab === "settings" ? (
            <Button
              onClick={() => {
                saveSettings();
                setActiveTab("send");
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              SMTP Ayarlarını Kaydet
            </Button>
          ) : (
            <Button
              onClick={handleDownloadICS}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5"
            >
              <Download className="h-4 w-4" /> .ics İndir & Test Et
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
