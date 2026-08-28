import React from "react";
import {
  BarChart3,
  Building2,
  Calendar as CalendarIcon,
  FolderOpen,
  Layers,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavSection, Store } from "@/lib/rental-store";
import { APP_ROUTES } from "@/constants/routeConstants";

interface AppSidebarProps {
  theme: "dark" | "light";
  sidebarCollapsed: boolean;
  fileName: string;
  onOpenLauncher: () => void;
  activeSection: NavSection;
  setActiveSection: (s: NavSection) => void;
  setSidebarOpen: (v: boolean) => void;
  store: Store;
  institutionName: string;
  institutionLogo: string;
}

export function AppSidebar({
  theme,
  sidebarCollapsed,
  fileName,
  onOpenLauncher,
  activeSection,
  setActiveSection,
  setSidebarOpen,
  store,
  institutionName,
  institutionLogo,
}: AppSidebarProps): React.JSX.Element {
  const activePersonnel =
    store.personnel && store.personnel.length > 0 ? store.personnel[0] : null;

  return (
    <aside
      className={`${
        sidebarCollapsed ? "w-16" : "w-64"
      } border-r flex flex-col shrink-0 transition-all duration-200 ${
        theme === "dark"
          ? "bg-slate-900/40 border-slate-800"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Recent Database Switcher Button */}
      <div className="p-3 border-b border-slate-800/40">
        <div
          className={`flex items-center justify-between ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          {!sidebarCollapsed && (
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Aktif Veritabanı:
              </span>
              <span className="text-xs font-bold truncate block">
                {fileName || "Varsayılan Veritabanı"}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenLauncher}
            className="h-7 w-7 text-indigo-400 hover:text-indigo-300"
            title="Veritabanı Değiştir / Dosya Aç"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {[
          { id: "dashboard", label: "Gösterge Paneli", icon: LayoutDashboard },
          { id: "calendar", label: "Takvim & Etkinlikler", icon: CalendarIcon },
          {
            id: "venues",
            label: `Mekanlar & Salonlar (${store.venues.length})`,
            icon: Building2,
          },
          {
            id: "events",
            label: `Etkinlik Listesi (${store.reservations.length})`,
            icon: Layers,
          },
          {
            id: "personnel",
            label: `Personel Kadrosu (${store.personnel?.length || 0})`,
            icon: Users,
          },
          { id: "reports", label: "Finans & Raporlar", icon: BarChart3 },
          { id: "settings", label: "Ayarlar & İletişim", icon: Settings },
        ].map((item) => {
          const IconComp = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id as NavSection);
                setSidebarOpen(false);
              }}
              title={item.label}
              className={`w-full flex items-center ${
                sidebarCollapsed
                  ? "justify-center px-2 py-3"
                  : "gap-3 px-3.5 py-2.5"
              } rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : theme === "dark"
                  ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <IconComp
                className={
                  sidebarCollapsed ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"
                }
              />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Institution Logo & Active Personnel Profile */}
      <div
        className={`p-3 border-t shrink-0 ${
          theme === "dark"
            ? "border-slate-800 bg-slate-950/40"
            : "border-slate-200 bg-slate-50/80"
        }`}
      >
        <div
          className={`flex items-center ${
            sidebarCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          {/* Institution Logo / Avatar */}
          <div className="relative shrink-0" title={institutionName}>
            {institutionLogo ? (
              <img
                src={institutionLogo}
                alt="Kurum Logosu"
                className="h-9 w-9 rounded-xl object-contain border border-slate-700/60 bg-slate-900 p-0.5 shadow-xs"
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                VK
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"
              title="Sistem Çevrimiçi"
            />
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold truncate tracking-tight text-indigo-500">
                {institutionName}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                <User className="h-3 w-3 text-slate-400 shrink-0" />
                <span
                  className={`text-[11px] font-semibold truncate ${
                    theme === "dark" ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  {activePersonnel
                    ? activePersonnel.name
                    : "Sistem Yetkilisi"}
                </span>
              </div>
              <span
                className={`text-[10px] block truncate ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {activePersonnel
                  ? activePersonnel.title || "Tesis & Salon Amiri"
                  : "Nöbetçi İşletme Personeli"}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
