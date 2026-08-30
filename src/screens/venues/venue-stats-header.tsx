import React from "react";
import { Building2, Compass, Layers, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VenueStatsHeaderProps {
  theme: "dark" | "light";
  totalVenues: number;
  totalHalls: number;
  totalDistricts: number;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onOpenVenueModal: () => void;
}

export const VenueStatsHeader: React.FC<VenueStatsHeaderProps> = ({
  theme,
  totalVenues,
  totalHalls,
  totalDistricts,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  onOpenVenueModal,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="space-y-4">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Mekan ve Tesis Yönetimi
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Bünyenizdeki bina, tesis, spor kompleksi ve iç salonları tek merkezden yönetin.
          </p>
        </div>
        <Button
          onClick={onOpenVenueModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 shadow-md flex items-center gap-1.5 px-4 shrink-0"
        >
          <Plus className="h-4 w-4" /> Yeni Mekan / Tesis Ekle
        </Button>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Toplam Mekan / Tesis</CardTitle>
            <Building2 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{totalVenues}</div>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Sistemde tanımlı tesis sayısı</p>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Toplam Kiralanabilir Salon</CardTitle>
            <Layers className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{totalHalls}</div>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Aktif kullanımda olan salon & saha</p>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Farklı İlçe & Konum</CardTitle>
            <Compass className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalDistricts}</div>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Tesislerin yer aldığı bölgeler</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Mekan, salon veya ilçe ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-9 text-xs h-9 rounded-xl ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-xs"
            }`}
          />
        </div>

        {/* Categories / Tags Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : isDark
                ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                : "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark
                  ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
