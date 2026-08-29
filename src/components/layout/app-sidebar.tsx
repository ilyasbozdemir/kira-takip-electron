import React from "react";
import {
  BarChart3,
  Building2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  HelpCircle,
  Layers,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
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
  setSidebarCollapsed: (v: boolean) => void;
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
  setSidebarCollapsed,
  fileName,
  onOpenLauncher,
  activeSection,
  setActiveSection,
  setSidebarOpen,
  store,
  institutionName,
  institutionLogo,
}: AppSidebarProps): React.JSX.Element {
  // Active operator / user personnel data
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
            id: "customers",
            label: `Müşteri Rehberi (${store.customers?.length || 0})`,
            icon: Users,
          },
          {
            id: "personnel",
            label: `Personel Kadrosu (${store.personnel?.length || 0})`,
            icon: User,
          },
          { id: "reports", label: "Finans & Raporlar", icon: BarChart3 },
          { id: "settings", label: "Ayarlar & İletişim", icon: Settings },
          { id: "help", label: "Yardım & Rehber", icon: HelpCircle },
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

      {/* Sidebar Bottom Footer: Sidebar Toggle & User Operator Personnel Card */}
      <div
        className={`p-3 border-t shrink-0 space-y-2 ${
          theme === "dark"
            ? "border-slate-800 bg-slate-950/40"
            : "border-slate-200 bg-slate-50/80"
        }`}
      >
        {/* Sidebar Collapse/Expand Toggle Button at Bottom */}
        <div
          className={`flex items-center ${
            sidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!sidebarCollapsed && (
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Menü Kontrolü
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`h-7 w-7 rounded-lg text-indigo-400 hover:text-indigo-300 ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200 shadow-xs"
            }`}
            title={sidebarCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Application Licensed User / Operator Profile Card */}
        <div
          onClick={() => setActiveSection("settings")}
          className={`flex items-center cursor-pointer p-1.5 rounded-xl border transition-all ${
            sidebarCollapsed ? "justify-center" : "gap-2.5"
          } ${
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800 hover:bg-slate-800/80"
              : "bg-white border-slate-200 hover:bg-slate-100/80 shadow-xs"
          }`}
          title="Uygulama Lisanslı Kullanıcı Hesabı & Ayarlarına Git"
        >
          {/* User Avatar with Green Online Badge */}
          <div className="relative shrink-0">
            <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xs shadow-xs">
              {institutionName ? institutionName.slice(0, 2).toUpperCase() : "UK"}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"
              title="Uygulama Kullanıcısı Oturumu Açık"
            />
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold truncate ${
                    theme === "dark" ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {institutionName ? institutionName : "Uygulama Kullanıcısı"}
                </span>
              </div>
              <span
                className={`text-[10px] block truncate ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Uygulama Operatörü • Ayarlar
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
