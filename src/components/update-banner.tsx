import { useState, useEffect } from "react";
import { Download, RefreshCw, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export function UpdateBanner() {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "not-available" | "downloading" | "downloaded" | "error">("idle");
  const [version, setVersion] = useState<string>("");
  const [percent, setPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
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
        toast.success("Güncelleme indirildi! Uygulama yeniden başlatılarak otomatik güncellenecek.");
      } else if (data.status === "error") {
        setErrorMessage(data.error || "Güncelleme kontrolü başarısız.");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
              Güncelleme hazır! Değişikliklerin uygulanması için yeniden başlatın.
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
          <Button
            size="sm"
            onClick={handleRestart}
            className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs font-medium"
          >
            Yeniden Başlat & Güncelle
          </Button>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
