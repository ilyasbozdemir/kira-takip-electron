import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ShieldAlert,
  Save,
  Mail,
  HardDrive,
  CheckCircle2,
  LogOut,
  FolderOpen,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ExitBackupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: "dark" | "light";
  fileName?: string;
  currentFilePath?: string | null;
  onConfirmExit: (options: {
    backupLocal: boolean;
    sendEmail: boolean;
    backupEmail: string;
  }) => Promise<void>;
  onDirectExit: () => void;
}

export function ExitBackupModal({
  open,
  onOpenChange,
  theme = "dark",
  fileName = "Veritabanı (.vke)",
  currentFilePath,
  onConfirmExit,
  onDirectExit,
}: ExitBackupModalProps): React.JSX.Element {
  const isDark = theme === "dark";

  const [backupLocal, setBackupLocal] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [backupEmail, setBackupEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      // Load saved backup email and smtp settings
      const smtpRaw = localStorage.getItem("venue-keeper-smtp-settings");
      if (smtpRaw) {
        try {
          const parsed = JSON.parse(smtpRaw);
          if (parsed.backupEmail) {
            setBackupEmail(parsed.backupEmail);
            setSendEmail(true);
          }
        } catch {}
      }
    }
  }, [open]);

  const handleBackupAndExit = async () => {
    if (sendEmail && !backupEmail) {
      toast.error("Lütfen geçerli bir yedek e-posta adresi girin veya e-posta seçeneğini kapatın.");
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirmExit({
        backupLocal,
        sendEmail,
        backupEmail,
      });
    } catch (err: any) {
      toast.error(`Yedekleme hatası: ${err?.message || err}`);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-lg p-6 rounded-2xl ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-2xl"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="text-base font-black flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-500" />
            <span>Uygulamadan Çıkış & Veritabanı Yedeği</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Kira & etkinlik verilerinizin güvenliği için çıkış yaparken yerel yedek alabilir ve e-posta ile arşivleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Active File Info Box */}
          <div
            className={`p-3 rounded-xl border text-xs ${
              isDark
                ? "bg-slate-950/80 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500">📁 Aktif Veritabanı:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-xs">
                {fileName}
              </span>
            </div>
            {currentFilePath && (
              <div className="mt-1 text-[11px] text-slate-400 truncate font-mono">
                {currentFilePath}
              </div>
            )}
          </div>

          {/* Backup Options */}
          <div className="space-y-3">
            {/* Local Backup Checkbox */}
            <div
              onClick={() => setBackupLocal(!backupLocal)}
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                backupLocal
                  ? isDark
                    ? "bg-indigo-950/30 border-indigo-500/40"
                    : "bg-indigo-50/70 border-indigo-300"
                  : isDark
                  ? "bg-slate-950/40 border-slate-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <Checkbox
                checked={backupLocal}
                onCheckedChange={(c) => setBackupLocal(!!c)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Yerel .vke Yedeği Al (Önerilen)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Uygulama yedek klasöründe son 7 yedeği döngüsel olarak saklar.
                </p>
              </div>
            </div>

            {/* Email Backup Checkbox & Input */}
            <div
              className={`p-3 rounded-xl border space-y-2.5 transition-colors ${
                sendEmail
                  ? isDark
                    ? "bg-emerald-950/30 border-emerald-500/40"
                    : "bg-emerald-50/70 border-emerald-300"
                  : isDark
                  ? "bg-slate-950/40 border-slate-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div
                onClick={() => setSendEmail(!sendEmail)}
                className="flex items-start gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={sendEmail}
                  onCheckedChange={(c) => setSendEmail(!!c)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Yedeği E-Posta ile Gönder (.vke Eki)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    SMTP üzerinden veritabanı dosyasını e-posta adresinize gönderir.
                  </p>
                </div>
              </div>

              {sendEmail && (
                <div className="pl-6 pt-1">
                  <Label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Alıcı Yedek E-Postası:
                  </Label>
                  <Input
                    type="email"
                    placeholder="yedek@belediye.bel.tr"
                    value={backupEmail}
                    onChange={(e) => setBackupEmail(e.target.value)}
                    className={`h-8 text-xs ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-slate-100"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-200 dark:border-slate-800 flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="text-xs h-9 font-semibold text-slate-500 hover:text-slate-200 order-3 sm:order-1"
          >
            İptal (Uygulamada Kal)
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onDirectExit}
            disabled={isProcessing}
            className={`text-xs h-9 font-bold order-2 ${
              isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> Yedek Almadan Çık
          </Button>

          <Button
            type="button"
            onClick={handleBackupAndExit}
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-black px-4 shadow-sm order-1 sm:order-3"
          >
            {isProcessing ? (
              <span>Yedekleniyor ve Kapatılıyor...</span>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" /> Yedekle ve Kapat
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
