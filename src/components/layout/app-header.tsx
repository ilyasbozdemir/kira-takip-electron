import React, { useState, useEffect } from "react";
import packageJson from "../../../package.json";
import {
  Minus,
  Moon,
  Plus,
  Search,
  Square,
  Sun,
  Trash2,
  X,
  FileCode,
  FolderOpen,
  Save,
  PlusCircle,
  HardDrive,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onOpenNewReservation: () => void;
  onOpenTrashModal?: () => void;
  onClose?: () => void;
  appName?: string;
  institutionName?: string;
  institutionSubHeader?: string;
  institutionLogo?: string;
  fileName?: string;
  currentFilePath?: string | null;
  onOpenFile?: () => void;
  onCreateFile?: () => void;
  onSaveAsFile?: () => void;
  onOpenBackupFolder?: () => void;
  onShowLauncher?: () => void;
}

export function AppHeader({
  theme,
  setTheme,
  searchTerm,
  setSearchTerm,
  onOpenNewReservation,
  onOpenTrashModal,
  onClose,
  appName,
  institutionName,
  institutionSubHeader,
  institutionLogo,
  fileName,
  currentFilePath,
  onOpenFile,
  onCreateFile,
  onSaveAsFile,
  onOpenBackupFolder,
  onShowLauncher,
}: AppHeaderProps): React.JSX.Element {
  const appVersion = packageJson.version;
  return (
    <header
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className={`sticky top-0 z-40 border-b flex items-center justify-between px-4 py-2.5 transition-colors select-none shrink-0 ${
        theme === "dark"
          ? "bg-slate-900/90 border-slate-800 backdrop-blur-md"
          : "bg-white/90 border-slate-200 backdrop-blur-md shadow-xs"
      }`}
    >
      {/* Left: Dynamic Institution Name, Logo & Active .vke File Dropdown */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2.5">
          {institutionLogo ? (
            <img
              src={institutionLogo}
              alt="Kurum Logosu"
              className="h-8 w-8 rounded-lg object-contain bg-slate-900/60 p-0.5 border border-indigo-500/30 shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md shrink-0">
              VK
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 max-w-85">
                <span className="truncate">{appName || institutionName || "İşletme & Tesis Takip Otomasyonu"}</span>
              </h1>

              {/* .vke File Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      theme === "dark"
                        ? "bg-indigo-950/50 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 hover:border-indigo-400"
                        : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs"
                    }`}
                    title={currentFilePath || "Aktif Veritabanı"}
                  >
                    <FileCode className="h-3 w-3 text-indigo-500" />
                    <span className="truncate max-w-35">{fileName || "Veritabanı (.vke)"}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className={`w-64 p-1 rounded-xl shadow-xl border ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <DropdownMenuLabel className="text-xs font-black text-slate-400 px-2 py-1.5">
                    📁 .VKE DOSYA İŞLEMLERİ
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className={theme === "dark" ? "bg-slate-800" : "bg-slate-200"} />

                  {onOpenFile && (
                    <DropdownMenuItem
                      onClick={onOpenFile}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Başka .vke Dosyası Aç...</span>
                    </DropdownMenuItem>
                  )}

                  {onCreateFile && (
                    <DropdownMenuItem
                      onClick={onCreateFile}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Yeni Veritabanı (.vke) Oluştur...</span>
                    </DropdownMenuItem>
                  )}

                  {onSaveAsFile && (
                    <DropdownMenuItem
                      onClick={onSaveAsFile}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <Save className="h-3.5 w-3.5 text-amber-500" />
                      <span>Farklı Kaydet (.vke Yedeği Al)...</span>
                    </DropdownMenuItem>
                  )}

                  {onOpenBackupFolder && (
                    <DropdownMenuItem
                      onClick={onOpenBackupFolder}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <HardDrive className="h-3.5 w-3.5 text-sky-500" />
                      <span>Yedek Klasörünü Aç (Son 7 Yedek)</span>
                    </DropdownMenuItem>
                  )}

                  {onShowLauncher && (
                    <>
                      <DropdownMenuSeparator className={theme === "dark" ? "bg-slate-800" : "bg-slate-200"} />
                      <DropdownMenuItem
                        onClick={onShowLauncher}
                        className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer flex items-center gap-2 text-rose-500 hover:text-rose-400"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Dosyayı Kapat / Başlangıç Ekranı</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p
              className={`text-[10px] truncate max-w-100 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {institutionName && appName ? `${institutionName} — ${institutionSubHeader || "Tesis & Salon Yönetimi"}` : (institutionSubHeader || "Kamu & Kurumsal Tesis, Mekan & Etkinlik Yönetim Sistemi")}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Quick Search */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="hidden md:flex items-center gap-2 max-w-xs w-full"
      >
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="search"
            placeholder="Müşteri, telefon veya etkinlik ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-8 text-xs h-8 rounded-lg ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                : "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
      </div>

      {/* Right: Actions, Theme Switcher & Electron Window Controls */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-2"
      >
        <Button
          onClick={onOpenNewReservation}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-sm flex items-center gap-1 px-3"
        >
          <Plus className="h-4 w-4" /> Etkinlik Ekle
        </Button>

        {onOpenTrashModal && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenTrashModal}
            className={`h-8 w-8 text-rose-500 hover:bg-rose-500/10 ${
              theme === "dark" ? "hover:text-rose-400" : "hover:text-rose-600"
            }`}
            title="Geri Dönüşüm Kutusu (Silinen Etkinlikler)"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`h-8 w-8 ${
            theme === "dark"
              ? "text-slate-300 hover:bg-slate-800"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title={theme === "dark" ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600" />
          )}
        </Button>

        {/* Desktop Window Controls */}
        <div className="flex items-center ml-1 border-l border-slate-700/30 pl-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (window.electronAPI as any)?.minimizeWindow?.()}
            className="h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
            title="Simge Durumuna Küçült"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => (window.electronAPI as any)?.maximizeWindow?.()}
            className="h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
            title="Ekranı Kapla / Tam Ekran"
          >
            <Square className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClose ? onClose() : (window.electronAPI as any)?.closeWindow?.()}
            className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            title="Uygulamayı Kapat"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
