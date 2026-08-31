import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  Code2,
  ExternalLink,
  Github,
  Globe,
  HardDrive,
  HeartHandshake,
  Layers,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SplashScreenProps {
  onFinish: () => void;
  institutionName?: string;
  appName?: string;
}

export function SplashScreen({
  onFinish,
  institutionName = "Kurumsal Tesis Yönetimi",
  appName = "VenueKeeper Tesis & Salon Otomasyonu",
}: SplashScreenProps): React.JSX.Element {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Yerel .vke SQLite veritabanı bağlanıyor...");
  const [isClosing, setIsClosing] = useState(false);

  const openLink = (url: string) => {
    if (window.electronAPI?.openExternalLink) {
      window.electronAPI.openExternalLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const handleFinish = () => {
    setIsClosing(true);
    setTimeout(() => {
      onFinish();
    }, 400);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 4;
        if (next >= 30 && next < 65) {
          setStatusText("Mekan, salon ve tarife parametreleri yükleniyor...");
        } else if (next >= 65 && next < 90) {
          setStatusText("Finansal veriler ve çevrimdışı önbellek doğrulanıyor...");
        } else if (next >= 90) {
          setStatusText("Sistem hazır. Hoş geldiniz!");
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            handleFinish();
          }, 350);
          return 100;
        }
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 text-slate-100 backdrop-blur-xl select-none transition-all duration-400 ${
        isClosing ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between overflow-hidden">
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500" />

        {/* Top App Header Banner */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 mb-1 text-white animate-bounce-subtle">
            <Building2 className="h-7 w-7" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {appName}
          </h1>

          <p className="text-xs text-indigo-400 font-semibold tracking-wide">
            {institutionName ? `🏛️ ${institutionName}` : "Kurumsal Tesis & Salon İşletim Otomasyonu"}
          </p>
        </div>

        {/* Developer & Architecture Showcase Box */}
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-linear-to-b from-indigo-950/40 via-slate-900 to-slate-950 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-300">
                Geliştirici & Sistem Mimarı
              </span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
              %100 Bağımsız & Güvenli
            </Badge>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>İlyas Bozdemir</span>
              <span className="text-xs font-mono font-normal text-indigo-400">
                (ilyasbozdemir.dev)
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bu uygulama; kamu kurumları, belediyeler ve özel işletmeler için <strong>yüksek performanslı, %100 çevrimdışı SQLite (.vke) veri bütünlüğü</strong> ile geliştirilmiştir.
            </p>
          </div>

          {/* Social & Contact Links */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => openLink("https://ilyasbozdemir.dev")}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 text-[11px] font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-indigo-400 group-hover:text-white" />
              ilyasbozdemir.dev
            </button>

            <button
              type="button"
              onClick={() => openLink("https://github.com/ilyas-bozdemir")}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Github className="h-3.5 w-3.5 text-slate-200" />
              GitHub
            </button>

            <button
              type="button"
              onClick={() => openLink("mailto:iletisim@ilyasbozdemir.dev")}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-emerald-400" />
              İletişim & Destek
            </button>
          </div>
        </div>

        {/* Feature Badges Bar */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-400">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-1">
            <HardDrive className="h-3.5 w-3.5 text-indigo-400" /> Yerel SQLite (.vke)
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Sayıştay & Teftiş
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-1">
            <Code2 className="h-3.5 w-3.5 text-purple-400" /> Modern TS & React
          </div>
        </div>

        {/* Bottom Loading Progress & Skip Button */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              {statusText}
            </span>
            <span className="font-mono font-bold text-indigo-400">%{progress}</span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-end pt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFinish}
              className="text-xs text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer h-7"
            >
              Doğrudan Başla ➔
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
