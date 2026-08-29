import React, { useEffect, useRef, useState } from "react";
import {
  Bug,
  Building2,
  Database,
  ExternalLink,
  Info,
  Star,
  Wifi,
} from "lucide-react";
import packageJson from "../../package.json";

interface FooterProps {
  currentFilePath?: string | null;
  institutionName?: string;
  theme?: "light" | "dark";
}

export function Footer(
  { currentFilePath, institutionName, theme = "dark" }: FooterProps,
): React.JSX.Element {
  const [showAbout, setShowAbout] = useState(false);
  const [appVersion, setAppVersion] = useState(packageJson.version);
  const [localIp, setLocalIp] = useState<string | null>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI
        .getAppVersion()
        .then((v: string) => {
          if (v) setAppVersion(v);
        })
        .catch(console.error);
    }
    if (window.electronAPI?.getLocalIp) {
      window.electronAPI
        .getLocalIp()
        .then((ip: string) => {
          if (ip) setLocalIp(ip);
        })
        .catch(console.error);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        aboutRef.current && !aboutRef.current.contains(event.target as Node)
      ) {
        setShowAbout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openExternal = (url: string) => {
    if (window.electronAPI?.openExternalLink) {
      window.electronAPI.openExternalLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <footer
      className={`h-8 shrink-0 border-t px-4 flex items-center justify-between text-xs select-none z-40 transition-colors ${
        theme === "dark"
          ? "bg-slate-950 border-slate-800/80 text-slate-400"
          : "bg-slate-100 border-slate-200 text-slate-600"
      }`}
    >
      {/* Left Details */}
      <div className="flex items-center space-x-2">
        {currentFilePath && (
          <span
            title={currentFilePath}
            className="font-semibold truncate max-w-[200px] flex items-center gap-1.5 text-indigo-400"
          >
            <Database className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {currentFilePath.split(/[\\/]/).pop()}
            </span>
          </span>
        )}
        {institutionName && (
          <>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
            <span
              className="truncate max-w-[180px] font-medium flex items-center gap-1"
              title={institutionName}
            >
              <Building2 className="h-3 w-3 shrink-0 text-sky-400" />
              <span className="truncate">{institutionName}</span>
            </span>
          </>
        )}
        <span className="w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
        <span className="text-[11px] opacity-75">
          Son Senkronizasyon:{" "}
          <span className="font-mono font-semibold">
            {new Date().toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 relative" ref={aboutRef}>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold">
          v{appVersion}
        </span>

        <button
          type="button"
          onClick={() => setShowAbout(!showAbout)}
          className={`flex items-center space-x-1 transition-colors cursor-pointer px-2 py-0.5 rounded-md text-[11px] ${
            theme === "dark"
              ? "hover:bg-slate-800 text-slate-300"
              : "hover:bg-slate-200 text-slate-700"
          }`}
          title="Geliştirici & Destek Bilgileri"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Hakkında</span>
        </button>

        {showAbout && (
          <div
            className={`absolute bottom-full right-0 mb-2 w-96 border rounded-2xl shadow-2xl overflow-hidden transition-all origin-bottom-right z-50 text-left ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm text-indigo-400">
                  İşletmeTakipAppPro
                </h4>
                <p className="text-[10px] text-slate-400">
                  Sürüm {appVersion} • Profesyonel Kiralama & Takvim Sistemi
                </p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Kararlı Sürüm
              </span>
            </div>

            <div className="p-3 text-[11px] leading-relaxed space-y-2.5 border-b border-slate-200 dark:border-slate-800">
              <p className="text-slate-300">
                Bu uygulama, kamu kurumları ve özel işletmelerin salon, tesis ve
                mekan kiralama süreçlerini standartlaştırmak, resmi tarife ve
                tahsis evraklarını hatasız yönetmek amacıyla geliştirilmiş{" "}
                <strong>
                  yerel SQLite tabanlı kurumsal masaüstü sistemdir.
                </strong>
              </p>
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl">
                <p className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5 text-xs">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75">
                    </span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500">
                    </span>
                  </span>
                  İleri Seviye Kurumsal Çözümler
                </p>
                <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                  Merkezi ağ üzerinde ortak veri havuzu, bulut e-fatura / makbuz
                  entegrasyonu, rol bazlı yetkilendirme (RBAC) ve Google Drive
                  yedekleme çözümleri için geliştiriciyle iletişime
                  geçebilirsiniz.
                </p>
              </div>
            </div>

            <div className="p-1.5 flex flex-col gap-0.5 bg-slate-50/50 dark:bg-slate-950/40">
              <button
                type="button"
                onClick={() =>
                  openExternal(
                    "https://github.com/ilyasbozdemir/isletme-kira-takip-electron",
                  )}
                className="flex items-center gap-2 w-full p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all font-semibold cursor-pointer group"
              >
                <Star className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="flex-1 text-left text-[11px] font-bold text-slate-200">
                  Projeyi beğendin mi? GitHub'da Yıldızla! ⭐
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => openExternal("https://ilyasbozdemir.dev")}
                className="flex items-center gap-2 w-full p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="flex-1 text-left text-[11px] font-medium">
                  Geliştirici İle İletişime Geç
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  openExternal(
                    "https://github.com/ilyasbozdemir/isletme-kira-takip-electron/issues",
                  )}
                className="flex items-center gap-2 w-full p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="flex-1 text-left text-[11px] font-medium">
                  Hata Bildir / Destek Talebi
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
