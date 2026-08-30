import React, { useEffect, useState } from "react";
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
  CheckCircle2,
  Database,
  FolderOpen,
  HardDrive,
  LogOut,
  Mail,
  Save,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

export interface ExitBackupResult {
  success: boolean;
  localBackup?: boolean;
  emailSent?: boolean;
  error?: string;
}

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
  }) => Promise<ExitBackupResult>;
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
  const [statusStep, setStatusStep] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (open) {
      setIsProcessing(false);
      setStatusStep("idle");
      setStatusMessage("");
      // Load saved backup email and smtp settings
      const smtpRaw = localStorage.getItem("venue-keeper-smtp-settings");
      if (smtpRaw) {
        try {
          const parsed = JSON.parse(smtpRaw);
          if (parsed.backupEmail) {
            setBackupEmail(parsed.backupEmail);
            setSendEmail(true);
          } else if (parsed.user) {
            setBackupEmail(parsed.user);
            setSendEmail(true);
          }
        } catch {}
      }
    }
  }, [open]);

  const handleBackupAndExit = async () => {
    if (sendEmail) {
      if (!backupEmail || !backupEmail.trim()) {
        toast.error(
          "Lütfen geçerli bir yedek e-posta adresi girin veya e-posta seçeneğini kapatın.",
        );
        return;
      }
      const smtpRaw = localStorage.getItem("venue-keeper-smtp-settings");
      const smtp = smtpRaw ? JSON.parse(smtpRaw) : null;
      if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
        toast.error(
          "SMTP sunucu ayarlarınız eksik! Lütfen önce Ayarlar → E-posta sekmesinden SMTP bilgilerinizi kaydedin.",
        );
        return;
      }
    }

    setIsProcessing(true);
    setStatusStep("processing");
    setStatusMessage(
      sendEmail
        ? "Yerel yedek alınıyor ve e-posta sunucusuna bağlanılıyor..."
        : "Yerel .vke yedeği alınıyor..."
    );

    try {
      if (backupEmail) {
        try {
          const smtpRaw = localStorage.getItem("venue-keeper-smtp-settings");
          const parsed = smtpRaw ? JSON.parse(smtpRaw) : {};
          parsed.backupEmail = backupEmail.trim();
          localStorage.setItem(
            "venue-keeper-smtp-settings",
            JSON.stringify(parsed),
          );
        } catch {}
      }

      const result = await onConfirmExit({
        backupLocal,
        sendEmail,
        backupEmail,
      });

      if (result.success) {
        setStatusStep("success");
        setStatusMessage(
          sendEmail && result.emailSent
            ? "✅ Yerel yedek alındı ve e-posta başarıyla iletildi! Kapatılıyor..."
            : "✅ Yerel .vke yedeği başarıyla alındı! Kapatılıyor..."
        );
        toast.success(
          sendEmail && result.emailSent
            ? "Yedek e-posta ile iletildi!"
            : "Yerel yedek alındı."
        );
        setTimeout(() => {
          (window.electronAPI as any)?.closeWindow?.();
        }, 800);
      } else {
        setStatusStep("error");
        setStatusMessage(result.error || "Yedekleme veya e-posta gönderimi başarısız oldu.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setStatusStep("error");
      setStatusMessage(err?.message || "Bilinmeyen bir hata oluştu.");
      setIsProcessing(false);
    }
  };

  const displayDbName = fileName ||
    (currentFilePath
      ? currentFilePath.split(/[\\/]/).pop()
      : "isletme-takip.vke");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`w-[95vw] sm:max-w-130 p-0 overflow-hidden rounded-2xl border shadow-2xl ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 pb-4 border-b ${
            isDark
              ? "border-slate-800/80 bg-slate-950/40"
              : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span>Uygulamadan Çıkış & Veritabanı Yedeği</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 pl-8">
              Kira ve etkinlik verilerinizin güvenliği için çıkış yaparken yerel
              yedek alabilir veya e-posta ile arşivleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 min-w-0">
          {/* Active Database Info Card */}
          <div
            className={`p-3 rounded-xl border text-xs min-w-0 ${
              isDark
                ? "bg-slate-950/80 border-slate-800"
                : "bg-slate-50 border-slate-200/90"
            }`}
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
                <Database className="h-3.5 w-3.5 text-indigo-500" />
                Aktif Veritabanı:
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate text-right">
                {displayDbName}
              </span>
            </div>
            {currentFilePath && (
              <div
                title={currentFilePath}
                className="mt-1 text-[11px] text-slate-400 truncate font-mono block w-full"
              >
                {currentFilePath}
              </div>
            )}
          </div>

          {/* Backup Option 1: Local Backup */}
          <div
            onClick={() => setBackupLocal(!backupLocal)}
            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              backupLocal
                ? isDark
                  ? "bg-indigo-950/30 border-indigo-500/40 shadow-xs"
                  : "bg-indigo-50/70 border-indigo-300 shadow-xs"
                : isDark
                ? "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Checkbox
              checked={backupLocal}
              onCheckedChange={(c) => setBackupLocal(!!c)}
              className="mt-0.5 shrink-0"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="font-bold text-xs flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Yerel .vke Yedeği Al (Önerilen)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Uygulama yedek klasöründe son 7 yedeği döngüsel ve güvenli
                olarak saklar.
              </p>
            </div>
          </div>

          {/* Backup Option 2: Email Backup */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
              sendEmail
                ? isDark
                  ? "bg-emerald-950/30 border-emerald-500/40 shadow-xs"
                  : "bg-emerald-50/70 border-emerald-300 shadow-xs"
                : isDark
                ? "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div
              onClick={() => setSendEmail(!sendEmail)}
              className="flex items-start gap-3 cursor-pointer"
            >
              <Checkbox
                checked={sendEmail}
                onCheckedChange={(c) => setSendEmail(!!c)}
                className="mt-0.5 shrink-0"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Yedeği E-Posta ile Gönder (.vke Eki)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tanımlı SMTP üzerinden veritabanı yedeğini e-posta adresinize
                  gönderir.
                </p>
              </div>
            </div>

            {sendEmail && (
              <div className="pl-7 pt-1">
                <Label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Alıcı Yedek E-Postası:
                </Label>
                <Input
                  type="email"
                  placeholder="yedek@kurum.bel.tr"
                  value={backupEmail}
                  onChange={(e) => setBackupEmail(e.target.value)}
                  className={`h-8 text-xs font-mono ${
                    isDark
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Live Status & Diagnostic Result Banner */}
          {statusStep !== "idle" && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs animate-in fade-in duration-200 ${
                statusStep === "processing"
                  ? isDark
                    ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-300"
                    : "bg-indigo-50 border-indigo-200 text-indigo-800"
                  : statusStep === "success"
                  ? isDark
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : isDark
                  ? "bg-rose-950/40 border-rose-500/40 text-rose-300"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {statusStep === "processing" && (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent inline-block" />
              )}
              {statusStep === "success" && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              )}
              {statusStep === "error" && (
                <X className="h-4 w-4 shrink-0 text-rose-500" />
              )}
              <span className="font-semibold leading-tight">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          className={`p-4 px-5 border-t flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 ${
            isDark
              ? "border-slate-800/80 bg-slate-950/40"
              : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="text-xs h-9 font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          >
            İptal (Uygulamada Kal)
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onDirectExit}
              disabled={isProcessing}
              className={`text-xs h-9 font-bold ${
                isDark
                  ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5 text-slate-400" />{" "}
              Yedek Almadan Çık
            </Button>

            <Button
              type="button"
              onClick={handleBackupAndExit}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-bold px-4 shadow-sm"
            >
              {isProcessing
                ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
                    Yedekleniyor...
                  </span>
                )
                : (
                  <span className="flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Yedekle ve Kapat
                  </span>
                )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
