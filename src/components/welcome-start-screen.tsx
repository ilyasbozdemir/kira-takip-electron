import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  FilePlus,
  Clock,
  Trash2,
  Database,
  HardDrive,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { RecentFileItem } from "./launcher-modal";

interface WelcomeStartScreenProps {
  recentFiles: RecentFileItem[];
  onOpenRecent: (filePath: string) => void;
  onCreateNew: () => void;
  onOpenDialog: () => void;
  onClearRecent: () => void;
  theme: "dark" | "light";
}

export const WelcomeStartScreen: React.FC<WelcomeStartScreenProps> = ({
  recentFiles,
  onOpenRecent,
  onCreateNew,
  onOpenDialog,
  onClearRecent,
  theme,
}) => {
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-200 select-none ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      <div className="max-w-2xl w-full space-y-6">

        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center overflow-hidden">
            <img src="/app-logo.png" alt="VenueKeeper Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
              VenueKeeper <Badge className="bg-indigo-600 text-white text-xs px-2 py-0.5">PRO v2.4</Badge>
            </h1>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Mekan, Salon & Rezervasyon Yönetim Sistemi — Yerel SQLite Veritabanı & DTM Paket Motoru
            </p>
          </div>
        </div>

        {/* Primary Workspace Selector Card */}
        <div className={`p-8 rounded-2xl border shadow-xl space-y-6 ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="border-b pb-4 flex items-center justify-between border-slate-800/40">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-500" />
                Hangi Çalışma Dosyasını Açmak İstersiniz?
              </h2>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Devam etmek için mevcut bir çalışma dosyasını (.vke) seçin veya yeni bir proje veritabanı oluşturun.
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px] font-mono">
              v2.0 WAL Active
            </Badge>
          </div>

          {/* Large Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={onOpenDialog}
              className="h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-start px-5 gap-3 transition-all transform hover:-translate-y-0.5"
            >
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-left truncate">
                <span className="block font-extrabold text-sm">Var Olan Dosyayı Aç</span>
                <span className="block text-[11px] font-mono font-normal opacity-90 truncate">Göz At (.vke / .sqlite)</span>
              </div>
            </Button>

            <Button
              onClick={onCreateNew}
              variant="outline"
              className={`h-16 font-bold text-sm rounded-xl border flex items-center justify-start px-5 gap-3 transition-all transform hover:-translate-y-0.5 ${
                isDark
                  ? "border-slate-800 bg-slate-950 text-slate-100 hover:bg-slate-800"
                  : "border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100"
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <FilePlus className="h-6 w-6" />
              </div>
              <div className="text-left truncate">
                <span className="block font-extrabold text-sm">Yeni Proje Oluştur</span>
                <span className="block text-[11px] font-mono font-normal text-slate-400 truncate">Yeni Veritabanı (.vke)</span>
              </div>
            </Button>
          </div>

          {/* Recent Files List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <Clock className="h-4 w-4 text-indigo-400" /> Son Açılan Çalışma Dosyaları ({recentFiles.length})
              </span>
              {recentFiles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearRecent}
                  className="h-6 px-2 text-[11px] text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Temizle
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {recentFiles.length === 0 ? (
                <div className={`p-6 rounded-xl border text-center text-xs ${
                  isDark ? "border-slate-800/80 bg-slate-950/50 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-400"
                }`}>
                  Henüz son açılan dosya geçmişiniz bulunmuyor. Yukarıdan proje seçin veya oluşturun.
                </div>
              ) : (
                recentFiles.map((item) => (
                  <div
                    key={item.path}
                    onClick={() => onOpenRecent(item.path)}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isDark
                        ? "border-slate-800 bg-slate-950/90 hover:bg-slate-800/80 text-slate-200 hover:border-indigo-500/50"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 shadow-2xs hover:border-indigo-400"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg shrink-0 ${isDark ? "bg-slate-900 text-indigo-400" : "bg-white text-indigo-600 border border-slate-200"}`}>
                        <HardDrive className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className={`font-bold truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          📁 {item.name}
                        </p>
                        <p className={`text-[10px] font-mono truncate ${isDark ? "text-slate-400" : "text-slate-500"}`} title={item.path}>
                          {item.path}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {item.lastOpened}
                      </span>
                      <ChevronRight className={`h-4 w-4 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className={`text-center text-[11px] p-3 rounded-xl border ${
          isDark ? "bg-slate-900/40 border-slate-800/60 text-slate-400" : "bg-white border-slate-200 text-slate-600"
        }`}>
          💡 Tüm çalışma dosyalarınız paket içerisinde <strong>SQLite veritabanı</strong> (<code className="font-mono text-indigo-400">database.sqlite</code>) ve versiyon bilgilerini (<code className="font-mono text-emerald-400">meta.json</code>) otomatik barındırır.
        </div>

      </div>
    </div>
  );
};
