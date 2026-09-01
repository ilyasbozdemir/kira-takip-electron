import { useState, useEffect } from "react";
import { Download, RefreshCw, AlertCircle, CheckCircle, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export function UpdateBanner() {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "not-available" | "downloading" | "downloaded" | "error">("idle");
  const [version, setVersion] = useState<string>("");
  const [percent, setPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (!window.electronAPI?.onUpdaterStatus) return;

    const unsubscribe = window.electronAPI.onUpdaterStatus((data) => {
      setStatus(data.status);

      if (data.status === "available") {
        setVersion(data.version || "");
        toast.info(`Yeni bir sürüm mevcut (v${data.version})! Arka planda indiriliyor...`);
      } else if (data.status === "downloading") {
        setPercent(Math.round(data.percent || 0));
      } else if (data.status === "downloaded") {
        setCountdown(10);
        toast.success("⚡ Güncelleme indirildi! 10 saniye içinde otomatik kurulup yeniden başlatılacak.");
      } else if (data.status === "error") {
        setErrorMessage(data.error || "Güncelleme kontrolü başarısız.");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Countdown effect to automatically trigger installation
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (window.electronAPI?.quitAndInstall) {
        window.electronAPI.quitAndInstall();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleDownload = async () => {
    if (window.electronAPI?.downloadUpdate) {
      await window.electronAPI.downloadUpdate();
    }
  };

  const handleRestart = () => {
    if (window.electronAPI?.quitAndInstall) {
      window.electronAPI.quitAndInstall();
    }
  };

  const handlePostpone = () => {
    setCountdown(null);
    setDismissed(true);
    toast.info("Güncelleme ertelendi. Uygulama kapatıldığında otomatik kurulacaktır.");
  };

  if (dismissed || status === "idle" || status === "not-available") {
    return null;
  }

  return (
    <div className="bg-slate-900/90 border-b border-indigo-500/30 px-4 py-2.5 flex items-center justify-between backdrop-blur-md text-sm">
      <div className="flex items-center gap-3">
        {status === "checking" && (
          <>
            <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
            <span className="text-slate-300">Güncellemeler kontrol ediliyor...</span>
          </>
        )}

        {status === "available" && (
          <>
            <Download className="h-4 w-4 text-indigo-400 animate-bounce" />
            <span className="text-slate-200">
              Yeni sürüm mevcut: <strong className="text-indigo-400">v{version}</strong>
            </span>
          </>
        )}

        {status === "downloading" && (
          <div className="flex items-center gap-3 w-72">
            <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
            <div className="w-full">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Güncelleme indiriliyor...</span>
                <span>%{percent}</span>
              </div>
              <Progress value={percent} className="h-1.5 bg-slate-800" />
            </div>
          </div>
        )}

        {status === "downloaded" && (
          <>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-300 font-medium">
              ⚡ Güncelleme hazır! {countdown !== null ? `${countdown}s içinde otomatik kurulacak.` : "Değişikliklerin uygulanması için yeniden başlatın."}
            </span>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span className="text-rose-300">{errorMessage}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {status === "available" && (
          <Button
            size="sm"
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-xs font-medium"
          >
            İndir
          </Button>
        )}

        {status === "downloaded" && (
          <>
            <Button
              size="sm"
              onClick={handleRestart}
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs font-medium gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" /> Hemen Yeniden Başlat & Kur
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePostpone}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 h-8 text-xs font-medium"
            >
              Ertele
            </Button>
          </>
        )}

        <button
          onClick={handlePostpone}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
