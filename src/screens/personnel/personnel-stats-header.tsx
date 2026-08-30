import React from "react";
import {
  Building2,
  LayoutGrid,
  List,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Venue } from "@/lib/rental-store";

interface PersonnelStatsHeaderProps {
  theme: "dark" | "light";
  totalPersonnel: number;
  assignedCount: number;
  totalVenues: number;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedVenueFilter: string;
  setSelectedVenueFilter: (v: string) => void;
  venues: Venue[];
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
  onOpenAddModal: () => void;
}

export const PersonnelStatsHeader: React.FC<PersonnelStatsHeaderProps> = ({
  theme,
  totalPersonnel,
  assignedCount,
  totalVenues,
  searchTerm,
  setSearchTerm,
  selectedVenueFilter,
  setSelectedVenueFilter,
  venues,
  viewMode,
  setViewMode,
  onOpenAddModal,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="space-y-4">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Görevli Personel Rehberi
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Tesis sorumluları, teknik ekip, güvenlik ve salon görevlilerini tek panelden yönetin.
          </p>
        </div>
        <Button
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 shadow-md flex items-center gap-1.5 px-4 shrink-0"
        >
          <Plus className="h-4 w-4" /> Yeni Personel Ekle
        </Button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-slate-400">Toplam Kayıtlı Personel</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-extrabold text-indigo-400">{totalPersonnel}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Sistemde tanımlı tüm görevliler</p>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-slate-400">Tesis Sorumlusu Olarak Atanan</CardTitle>
            <UserCheck className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-extrabold text-sky-400">{assignedCount}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">En az bir mekanda aktif yönetici</p>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-slate-400">Tesis & Salon Sayısı</CardTitle>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-extrabold text-emerald-400">{totalVenues}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Personel görevlendirilen mekanlar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Personel adı, unvan, telefon veya e-posta ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 text-xs h-9 rounded-xl ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-xs"
              }`}
            />
          </div>

          <Select value={selectedVenueFilter} onValueChange={setSelectedVenueFilter}>
            <SelectTrigger className={`w-full sm:w-[200px] text-xs h-9 rounded-xl ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200"
            }`}>
              <SelectValue placeholder="Tesis Filtrele" />
            </SelectTrigger>
            <SelectContent className={isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200"}>
              <SelectItem value="all">Tüm Tesisler & Personel</SelectItem>
              {venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className={`flex items-center p-1 rounded-xl border ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
        }`}>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white shadow-xs"
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Kart Görünümü"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-indigo-600 text-white shadow-xs"
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Tablo Görünümü"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
