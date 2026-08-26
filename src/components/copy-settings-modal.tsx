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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, MessageSquare, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CopySettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEMPLATE_KEY = "venue-keeper-copy-template";

const DEFAULT_TEMPLATE = `Sayın {CUSTOMER},
{VENUE} - {HALL} için {DATE} tarihinde ({START} - {END}) saatleri arasında gerçekleştirdiğiniz düğün/etkinlik rezervasyonunuz tamamlanmıştır.

Toplam Ücret: {PRICE}
Ödenen Tutar: {PAID}
Kalan Bakiye: {REMAINING}

İyi günler dileriz.`;

export function CopySettingsModal({ open, onOpenChange }: CopySettingsModalProps) {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TEMPLATE_KEY);
      if (saved) setTemplate(saved);
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem(TEMPLATE_KEY, template);
    toast.success("Kopyalama & Şablon ayarları başarıyla kaydedildi.");
    onOpenChange(false);
  };

  const handleReset = () => {
    setTemplate(DEFAULT_TEMPLATE);
    localStorage.setItem(TEMPLATE_KEY, DEFAULT_TEMPLATE);
    toast.info("Şablon varsayılan değerlere sıfırlandı.");
  };

  const handleTestCopy = () => {
    const sample = template
      .replace(/{CUSTOMER}/g, "Ahmet Yılmaz")
      .replace(/{VENUE}/g, "Şehir Düğün Sarayı")
      .replace(/{HALL}/g, "Lale Salonu")
      .replace(/{DATE}/g, "2026-09-15")
      .replace(/{START}/g, "19:00")
      .replace(/{END}/g, "23:00")
      .replace(/{PRICE}/g, "10.000 TL")
      .replace(/{PAID}/g, "5.000 TL")
      .replace(/{REMAINING}/g, "5.000 TL");

    navigator.clipboard.writeText(sample);
    setCopied(true);
    toast.success("Örnek WhatsApp/SMS metni panoya kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent classNames={{ content: "sm:max-w-[550px] bg-slate-900 border-slate-800 text-slate-100" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-100">
            <MessageSquare className="h-5 w-5 text-indigo-400" /> Kopyalama & Mesaj Şablonu Ayarları
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Rezervasyonlarda WhatsApp veya SMS ile bilgi gönderirken kullanılacak hızlı kopyalama şablonunu düzenleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label className="text-slate-300">Mesaj Şablonu Metni</Label>
            <Textarea
              rows={8}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs mt-1"
            />
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Kullanılabilir Değişkenler:</p>
            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-indigo-300">
              <span>{`{CUSTOMER}`} : Müşteri Adı</span>
              <span>{`{VENUE}`} : Mekan/Tesis Adı</span>
              <span>{`{HALL}`} : Salon Adı</span>
              <span>{`{DATE}`} : Tarih (YYYY-MM-DD)</span>
              <span>{`{START}`} : Başlangıç Saati</span>
              <span>{`{END}`} : Bitiş Saati</span>
              <span>{`{PRICE}`} : Toplam Fiyat</span>
              <span>{`{PAID}`} : Ödenen Tutar</span>
              <span>{`{REMAINING}`} : Kalan Bakiye</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Sıfırla
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestCopy}
              className="border-slate-800 text-indigo-400 hover:bg-slate-800"
            >
              {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              Örnek Kopyala
            </Button>
          </div>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
            Ayarları Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
