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
  WalletCards,
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
  accountingModuleEnabled?: boolean;
  onOpenHolidaysModal?: () => void;
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
  accountingModuleEnabled = true,
  onOpenHolidaysModal,
}: AppSidebarProps): React.JSX.Element {
  // Navigation items list
  const navItems = [
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
    ...(accountingModuleEnabled
      ? [
          {
            id: "accounting",
            label: "Muhasebe & Kasa",
            icon: WalletCards,
          },
        ]
      : []),
    { id: "reports", label: "Finans & Raporlar", icon: BarChart3 },
    { id: "settings", label: "Ayarlar & İletişim", icon: Settings },
    { id: "help", label: "Yardım & Rehber", icon: HelpCircle },
  ];

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
      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeSection === item.id;
          return (
            <React.Fragment key={item.id}>
              <button
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

              {/* Tatil & Takvim Menüsü - Sol Menüde Takvim Altında */}
              {item.id === "calendar" && onOpenHolidaysModal && (
                <button
                  type="button"
                  onClick={() => onOpenHolidaysModal()}
                  title="Resmi Tatiller, Dini Bayramlar & Takvim Ayarları (Hicri/Miladi/ICS)"
                  className={`w-full flex items-center ${
                    sidebarCollapsed
                      ? "justify-center px-2 py-2.5"
                      : "gap-3 px-3 py-2"
                  } rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    theme === "dark"
                      ? "bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border-rose-800/30"
                      : "bg-rose-50/70 hover:bg-rose-100 text-rose-800 border-rose-200/80"
                  }`}
                >
                  <span className="text-base select-none shrink-0">🇹🇷</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="truncate font-bold flex items-center justify-between">
                        <span>Tatil & Takvim</span>
                        <span className="text-[9px] font-mono bg-rose-500/20 text-rose-400 dark:text-rose-300 px-1 py-0.2 rounded border border-rose-500/30">
                          Hicri/ICS
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        Resmi & Dini Günler
                      </div>
                    </div>
                  )}
                </button>
              )}
            </React.Fragment>
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
                  title={institutionName}
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
