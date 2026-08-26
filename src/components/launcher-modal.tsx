import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  FilePlus,
  Clock,
  Trash2,
  Database,
  CheckCircle2,
  HardDrive,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface RecentFileItem {
  path: string;
  name: string;
  lastOpened: string;
}

interface LauncherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilePath: string;
  recentFiles: RecentFileItem[];
  onOpenRecent: (filePath: string) => void;
  onCreateNew: () => void;
  onOpenDialog: () => void;
  onClearRecent: () => void;
  theme: "dark" | "light";
}

export const LauncherModal: React.FC<LauncherModalProps> = ({
  open,
  onOpenChange,
  currentFilePath,
  recentFiles,
  onOpenRecent,
  onCreateNew,
  onOpenDialog,
  onClearRecent,
  theme,
}) => {
  const isDark = theme === "dark";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[620px] border shadow-2xl p-6 ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <DialogHeader className="pb-3 border-b border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className={`text-lg font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                VenueKeeper Başlangıç & Veritabanı Yöneticisi
              </DialogTitle>
              <DialogDescription className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Son açılan çalışma dosyalarınız, veritabanı kütüphanesi ve dosya yükleme.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current Active File Banner */}
        {currentFilePath ? (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs mt-2 ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <span className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Aktif Bağlı Veritabanı
                </span>
                <span className={`font-mono text-[11px] truncate block ${isDark ? "text-slate-400" : "text-slate-500"}`} title={currentFilePath}>
                  {currentFilePath}
                </span>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px] shrink-0">Bağlı</Badge>
          </div>
        ) : (
          <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs mt-2 ${
            isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-300 text-amber-900"
          }`}>
            <HardDrive className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold block">Açık Çalışma Dosyası Bulunmuyor</span>
              <span className="text-[11px] opacity-90 block">
                Lütfen var olan bir çalışma dosyası (.vke) seçin veya yeni bir proje oluşturun.
              </span>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            onClick={() => {
              onCreateNew();
              onOpenChange(false);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-10 font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <FilePlus className="h-4 w-4" /> Yeni Veritabanı Aç
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              onOpenDialog();
              onOpenChange(false);
            }}
            className={`text-xs h-10 font-semibold flex items-center justify-center gap-2 ${
              isDark
                ? "border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-800"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            <FolderOpen className="h-4 w-4 text-sky-500" /> Dosya Seç (.vke / .sqlite)
          </Button>
        </div>

        {/* Recent Files List Section */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              <Clock className="h-3.5 w-3.5 text-indigo-400" /> Son Açılan Dosyalar ({recentFiles.length})
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

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {recentFiles.length === 0 ? (
              <div className={`p-6 rounded-xl border text-center text-xs ${
                isDark ? "border-slate-800/80 bg-slate-950/40 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-400"
              }`}>
                Henüz son açılan dosya geçmişi bulunmuyor.
              </div>
            ) : (
              recentFiles.map((item) => {
                const isActive = currentFilePath === item.path;
                return (
                  <div
                    key={item.path}
                    onClick={() => {
                      if (!isActive) {
                        onOpenRecent(item.path);
                        onOpenChange(false);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? "border-indigo-500/60 bg-indigo-950/30 ring-1 ring-indigo-500/40"
                        : isDark
                        ? "border-slate-800 bg-slate-950/80 hover:bg-slate-800/60 text-slate-300"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isActive ? "bg-indigo-600 text-white" : isDark ? "bg-slate-900 text-indigo-400" : "bg-white text-indigo-600 border"
                      }`}>
                        <HardDrive className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className={`font-bold truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {item.name}
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
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
