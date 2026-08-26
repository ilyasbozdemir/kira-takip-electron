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
import { Switch } from "@/components/ui/switch";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRecipient?: string;
  defaultSubject?: string;
  defaultBody?: string;
  theme?: "dark" | "light";
}

const SMTP_STORAGE_KEY = "venue-keeper-smtp-settings";

export function MailDialog({
  open,
  onOpenChange,
  defaultRecipient = "",
  defaultSubject = "Venue Keeper - Salon Kiralama ve Evrak Bildirimi",
  defaultBody = "",
  theme = "dark",
}: MailDialogProps) {
  // SMTP Configuration State
  const [host, setHost] = useState("smtp.gmail.com");
  const [port, setPort] = useState("587");
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [senderName, setSenderName] = useState("Belediye Düğün Salonu İşletmesi");

  // Mail Content State
  const [to, setTo] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [activeTab, setActiveTab] = useState<"send" | "settings">("send");
  const [sending, setSending] = useState(false);

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
        setSenderName(parsed.senderName || "Belediye Düğün Salonu İşletmesi");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={theme === "dark"
          ? "sm:max-w-[550px] bg-slate-900 border-slate-800 text-slate-100"
          : "sm:max-w-[550px] bg-white border-slate-200 text-slate-900 shadow-2xl"}
      >
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-xl font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
            <Mail className="h-5 w-5 text-indigo-500" /> E-posta Gönder & SMTP Ayarları
          </DialogTitle>
          <DialogDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Rezervasyon dökümünü, evrak bilgisini veya raporu e-posta ile iletin.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className={`flex border-b mb-4 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("send")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "send"
                ? "border-indigo-500 text-indigo-500 font-semibold"
                : theme === "dark" ? "border-transparent text-slate-400 hover:text-slate-200" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            E-posta Gönder
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-indigo-500 text-indigo-500 font-semibold"
                : theme === "dark" ? "border-transparent text-slate-400 hover:text-slate-200" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            SMTP Sunucu Ayarları
          </button>
        </div>

        {activeTab === "send" ? (
          <div className="space-y-4 py-2">
            <div>
              <Label className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>Alıcı E-posta</Label>
              <Input
                placeholder="ornek@musteri.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Konu</Label>
              <Input
                placeholder="Konu başlığı..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Mesaj İçeriği</Label>
              <Textarea
                rows={5}
                placeholder="Mesajınızı buraya yazın..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">SMTP Sunucu (Host)</Label>
                <Input
                  placeholder="smtp.gmail.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Port</Label>
                <Input
                  placeholder="587"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">E-posta (User)</Label>
                <Input
                  placeholder="belediye@gmail.com"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Şifre / Uygulama Şifresi</Label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Gönderen Adı</Label>
              <Input
                placeholder="Belediye Düğün Salonu İşletmesi"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label className="text-slate-300 cursor-pointer">SSL / TLS Güvenli Bağlantı</Label>
              <Switch checked={secure} onCheckedChange={setSecure} />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={saveSettings}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 mt-2"
            >
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" /> SMTP Ayarlarını Kaydet
            </Button>
          </div>
        )}

        <DialogFooter className="mt-4 flex justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-200">
            Kapat
          </Button>
          {activeTab === "send" && (
            <Button
              onClick={handleSendEmail}
              disabled={sending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> E-posta Gönder
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
