import React, { useState } from "react";
import {
  Lock,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trDaysFull, trMonthsFull } from "@/lib/rental-store";

interface PastRecordSecurityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  recordTitle: string;
  recordDate: string;
  authorizedPersonnelName?: string;
  authorizedPersonnelTitle?: string;
  savedSecurityPin?: string;
  onSuccess: () => Promise<void> | void;
}

export const PastRecordSecurityModal: React.FC<PastRecordSecurityModalProps> = ({
  open,
  onOpenChange,
  theme,
  recordTitle,
  recordDate,
  authorizedPersonnelName,
  authorizedPersonnelTitle,
  savedSecurityPin = "",
  onSuccess,
}) => {
  const isDark = theme === "dark";
  const [pinInput, setPinInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedDate = (() => {
    if (!recordDate) return "Geçmiş Tarih";
    try {
      const [y, m, d] = recordDate.split("-").map(Number);
      const dObj = new Date(y, m - 1, d);
      const monthName = trMonthsFull[m - 1] || "";
      const dayName = trDaysFull[dObj.getDay()] || "";
      return `${d} ${monthName} ${y}, ${dayName}`;
    } catch {
      return recordDate;
    }
  })();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    // If security pin is configured in settings
    if (savedSecurityPin && savedSecurityPin.trim() !== "") {
      if (pinInput.trim() !== savedSecurityPin.trim()) {
        toast.error("Hatalı güvenlik şifresi! Geçmiş kayıt silme işlemi yetkilendirilmedi.");
        return;
      }
    } else {
      // If no security pin is set, require user to enter any non-empty confirmation or warn
      if (!pinInput.trim()) {
        toast.error("Lütfen onay için bir yetkili şifresi veya onay metni girin.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSuccess();
      toast.success("Geçmiş kayıt silme işlemi yetkili onayıyla tamamlandı.");
      setPinInput("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`İşlem hatası: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setPinInput("");
        onOpenChange(v);
      }}
    >
      <DialogContent
        className={`max-w-md p-0 overflow-hidden border ${
          isDark
            ? "bg-slate-900 border-rose-500/40 text-slate-100 shadow-2xl shadow-rose-950/50"
            : "bg-white border-rose-200 text-slate-900 shadow-2xl"
        }`}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-rose-600 via-rose-700 to-red-800 p-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
                🔒 Geçmiş Kayıt Güvenlik Onayı
              </DialogTitle>
              <DialogDescription className="text-xs text-rose-100">
                Resmi mali kayıt bütünlüğü için yetkili güvenlik doğrulaması gereklidir.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="p-4 space-y-3.5 text-xs">
          {/* Target Record Info Box */}
          <div
            className={`p-3 rounded-xl border space-y-1.5 ${
              isDark ? "bg-slate-950/60 border-slate-800" : "bg-rose-50/70 border-rose-200"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formattedDate}
              </span>
              <span className="font-mono text-[10px]">GEÇMİŞ KAYIT</span>
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
              {recordTitle || "Rezervasyon Kaydı"}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              ⚠️ Bu etkinlik geçmiş bir tarihe aittir. Geçmiş kayıtların silinmesi geriye dönük denetim ve kasa raporlarını etkileyebilir.
            </p>
          </div>

          {/* Authorized Personnel Badge */}
          {(authorizedPersonnelName || authorizedPersonnelTitle) && (
            <div
              className={`p-2 rounded-lg border flex items-center gap-2 ${
                isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <UserCheck className="h-4 w-4 text-indigo-500 shrink-0" />
              <div className="text-[11px] truncate">
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  {authorizedPersonnelName || "Sistem Yöneticisi"}
                </span>
                <span className="text-slate-500 block text-[10px]">
                  {authorizedPersonnelTitle || "Tesis & İşletme Yetkilisi"}
                </span>
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-amber-500" /> Yönetici Güvenlik Şifresi *
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-indigo-500 hover:text-indigo-400 font-medium flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPassword ? "Gizle" : "Göster"}
              </button>
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              required
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Ayarlarda tanımlı güvenlik şifresini girin..."
              className={`text-xs font-mono h-8.5 ${
                isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-300 text-slate-900"
              }`}
            />
            {!savedSecurityPin && (
              <p className="text-[10px] text-amber-500/90 font-medium">
                ℹ️ Ayarlar ekranında henüz özel güvenlik şifresi belirlenmemiştir. Onaylamak için şifre alanına herhangi bir giriş yapabilirsiniz.
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 flex flex-row items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs h-8"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !pinInput.trim()}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 font-bold shadow-xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Şifreyi Doğrula ve Sil
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
