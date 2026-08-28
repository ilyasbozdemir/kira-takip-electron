import React from "react";
import {
  Minus,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Square,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onOpenNewReservation: () => void;
}

export function AppHeader({
  theme,
  setTheme,
  sidebarCollapsed,
  setSidebarCollapsed,
  searchTerm,
  setSearchTerm,
  onOpenNewReservation,
}: AppHeaderProps): React.JSX.Element {
  return (
    <header
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className={`sticky top-0 z-40 border-b flex items-center justify-between px-4 py-2.5 transition-colors select-none ${
        theme === "dark"
          ? "bg-slate-900/90 border-slate-800 backdrop-blur-md"
          : "bg-white/90 border-slate-200 backdrop-blur-md shadow-xs"
      }`}
    >
      {/* Left: Brand & Sidebar Toggle */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-3"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`h-8 w-8 ${
            theme === "dark"
              ? "text-slate-400 hover:text-slate-100"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title={sidebarCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
            VK
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
              <span>VenueKeeper App Pro</span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-indigo-500/40 text-indigo-400 font-mono"
              >
                v1.0.0-beta.19
              </Badge>
            </h1>
            <p
              className={`text-[10px] ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Kamu & Kurumsal Tesis, Mekan & Etkinlik Yönetim Sistemi
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
            className={`pl-8 h-8 text-xs ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                : "bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
      </div>

      {/* Right: Quick Action Buttons & Native Window Controls */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-2"
      >
        <Button
          size="sm"
          onClick={onOpenNewReservation}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8 px-3 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Etkinlik Ekle
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`h-8 w-8 ${
            theme === "dark"
              ? "text-slate-400 hover:text-slate-100"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title={theme === "dark" ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </Button>

        {/* Native Window Controls */}
        <div
          className={`flex items-center ml-1.5 border-l pl-1.5 ${
            theme === "dark" ? "border-slate-800" : "border-slate-300"
          }`}
        >
          <button
            onClick={() => window.electronAPI?.windowControls?.minimize()}
            className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
              theme === "dark"
                ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
            title="Simge Durumuna Küçült"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => window.electronAPI?.windowControls?.maximize()}
            className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
              theme === "dark"
                ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
            title="Tam Ekran / Pencere"
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            onClick={() => window.electronAPI?.windowControls?.close()}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-rose-600 hover:text-white transition-colors"
            title="Kapat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
