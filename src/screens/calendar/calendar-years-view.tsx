import React, { useMemo, useState } from "react";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FolderArchive,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money, trMonthsShort, type Reservation, type Venue } from "@/lib/rental-store";
import { toast } from "sonner";

interface CalendarYearsViewProps {
  theme: "dark" | "light";
  reservations: Reservation[];
  venues: Venue[];
  workingYear: string;
  setWorkingYear?: (y: string) => void;
  onSelectYearAndMonth: (year: number, month?: number) => void;
  onOpenNewReservationModal: (preselectedYear?: number) => void;
  onOpenExportModal?: () => void;
}

export const CalendarYearsView: React.FC<CalendarYearsViewProps> = ({
  theme,
  reservations,
  venues,
  workingYear,
  setWorkingYear,
  onSelectYearAndMonth,
  onOpenNewReservationModal,
  onOpenExportModal,
}) => {
  const isDark = theme === "dark";
  const currentRealYear = new Date().getFullYear();
  const [customNewYear, setCustomNewYear] = useState<string>("");
  const [showAddYearInput, setShowAddYearInput] = useState(false);

  // Group all reservations by Year and compute comprehensive statistics
  const yearStats = useMemo(() => {
    const map = new Map<
      number,
      {
        year: number;
        totalCount: number;
        confirmedCount: number;
        optionCount: number;
        totalRev: number;
        totalPaid: number;
        monthlyCounts: number[];
        monthlyRevs: number[];
      }
    >();

    // Always include workingYear, currentRealYear and adjacent years (e.g. +1, +2, -1)
    const baseYears = new Set<number>([
      Number(workingYear) || currentRealYear,
      currentRealYear,
      currentRealYear - 1,
      currentRealYear + 1,
      currentRealYear + 2,
    ]);

    // Add all years found in reservations
    for (const r of reservations) {
      if (r.date) {
        const y = Number(r.date.split("-")[0]);
        if (!isNaN(y)) baseYears.add(y);
      }
    }

    // Initialize all base years
    for (const y of baseYears) {
      map.set(y, {
        year: y,
        totalCount: 0,
        confirmedCount: 0,
        optionCount: 0,
        totalRev: 0,
        totalPaid: 0,
        monthlyCounts: Array(12).fill(0),
        monthlyRevs: Array(12).fill(0),
      });
    }

    // Populate data
    for (const r of reservations) {
      if (!r.date) continue;
      const [yStr, mStr] = r.date.split("-");
      const y = Number(yStr);
      const m = Number(mStr) - 1; // 0-indexed

      let stat = map.get(y);
      if (!stat) {
        stat = {
          year: y,
          totalCount: 0,
          confirmedCount: 0,
          optionCount: 0,
          totalRev: 0,
          totalPaid: 0,
          monthlyCounts: Array(12).fill(0),
          monthlyRevs: Array(12).fill(0),
        };
        map.set(y, stat);
      }

      stat.totalCount += 1;
      if (r.status === "confirmed") stat.confirmedCount += 1;
      else stat.optionCount += 1;

      const price = Number(r.price) || 0;
      const paid = Number(r.paid) || 0;
      stat.totalRev += price;
      stat.totalPaid += paid;

      if (m >= 0 && m < 12) {
        stat.monthlyCounts[m] += 1;
        stat.monthlyRevs[m] += price;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.year - a.year);
  }, [reservations, workingYear, currentRealYear]);

  // Overall totals across all years
  const grandTotal = useMemo(() => {
    return yearStats.reduce(
      (acc, curr) => ({
        count: acc.count + curr.totalCount,
        revenue: acc.revenue + curr.totalRev,
        paid: acc.paid + curr.totalPaid,
      }),
      { count: 0, revenue: 0, paid: 0 },
    );
  }, [yearStats]);

  const handleAddNewYear = (e: React.FormEvent) => {
    e.preventDefault();
    const yNum = Number(customNewYear.trim());
    if (isNaN(yNum) || yNum < 2000 || yNum > 2100) {
      toast.error("Lütfen geçerli bir yıl (Örn: 2027) girin.");
      return;
    }
    setCustomNewYear("");
    setShowAddYearInput(false);
    onSelectYearAndMonth(yNum, 0);
    toast.success(`${yNum} yılı takvim dönemi açıldı.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Multi-Year Dashboard Summary */}
      <Card
        className={`border relative overflow-hidden ${
          isDark
            ? "bg-linear-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/30"
            : "bg-linear-to-r from-indigo-50 via-white to-sky-50 border-indigo-200 shadow-sm"
        }`}
      >
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-600 text-white font-bold text-[11px] px-2.5 py-0.5">
                📅 Yıllık Dönem & Takvim Yönetimi
              </Badge>
              <Badge
                variant="outline"
                className="border-indigo-500/40 text-indigo-400 font-mono text-[11px]"
              >
                Aktif Sistem Yılı: {workingYear}
              </Badge>
            </div>
            <h2
              className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Çalışma Yılları & Dönem Kartları
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              İstediğiniz mali/çalışma yılı kartına tıklayarak o dönemin takvimini açabilir, aylık etkinlik dağılımını inceleyebilir ve geleceğe yönelik planlama yapabilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenExportModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenExportModal}
                className={`text-xs h-9 font-semibold gap-1.5 cursor-pointer ${
                  isDark
                    ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40"
                    : "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>Tüm Yıllar Raporu</span>
              </Button>
            )}

            {!showAddYearInput ? (
              <Button
                size="sm"
                onClick={() => setShowAddYearInput(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-semibold gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" /> İleri Yıl / Dönem Ekle
              </Button>
            ) : (
              <form onSubmit={handleAddNewYear} className="flex items-center gap-1.5">
                <input
                  type="number"
                  autoFocus
                  placeholder="Yıl (2027)"
                  value={customNewYear}
                  onChange={(e) => setCustomNewYear(e.target.value)}
                  className={`w-24 h-9 px-2 text-xs font-mono font-bold rounded-lg border focus:outline-hidden ${
                    isDark
                      ? "bg-slate-950 border-indigo-500 text-white"
                      : "bg-white border-indigo-400 text-slate-900"
                  }`}
                />
                <Button type="submit" size="sm" className="h-9 text-xs font-bold px-3">
                  Aç
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddYearInput(false)}
                  className="h-9 text-xs text-slate-400"
                >
                  İptal
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid of Year Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {yearStats.map((stat) => {
          const isSelectedWorkingYear = String(stat.year) === String(workingYear);
          const isCurrentYear = stat.year === currentRealYear;
          const isPastYear = stat.year < currentRealYear;
          const isFutureYear = stat.year > currentRealYear;
          const remaining = stat.totalRev - stat.totalPaid;
          const collectionRate =
            stat.totalRev > 0 ? Math.round((stat.totalPaid / stat.totalRev) * 100) : 100;

          // Max monthly count for sparkline scaling
          const maxMonthlyCount = Math.max(...stat.monthlyCounts, 1);

          return (
            <Card
              key={stat.year}
              className={`transition-all duration-200 border rounded-2xl flex flex-col justify-between overflow-hidden relative ${
                isSelectedWorkingYear
                  ? isDark
                    ? "bg-slate-900/95 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-2 ring-indigo-500/30"
                    : "bg-white border-indigo-400 shadow-lg ring-2 ring-indigo-300/50"
                  : isDark
                  ? "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Top Card Header */}
              <div className="p-4.5 border-b border-slate-800/40 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
                      {stat.year}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Dönemi</span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isSelectedWorkingYear && (
                      <Badge className="bg-indigo-600 text-white font-bold text-[10px] gap-1 shadow-2xs">
                        <Star className="h-3 w-3 fill-current" /> Aktif Çalışma Yılı
                      </Badge>
                    )}
                    {isCurrentYear && !isSelectedWorkingYear && (
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                        📌 Mevcut Yıl
                      </Badge>
                    )}
                    {isFutureYear && (
                      <Badge variant="outline" className="border-sky-500/40 text-sky-400 text-[10px]">
                        ⏳ Gelecek Dönem
                      </Badge>
                    )}
                    {isPastYear && (
                      <Badge variant="outline" className="border-slate-500/40 text-slate-400 text-[10px]">
                        📁 Geçmiş Arşiv
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark ? "bg-slate-950/60 border-slate-800/70" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-400 block">Etkinlik</span>
                    <span className="text-sm font-extrabold font-mono text-indigo-400 block mt-0.5">
                      {stat.totalCount}
                    </span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {stat.confirmedCount} Kesin • {stat.optionCount} Ops
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark ? "bg-slate-950/60 border-slate-800/70" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-400 block">Toplam Ciro</span>
                    <span className="text-sm font-extrabold font-mono text-slate-100 dark:text-slate-100 block mt-0.5 truncate">
                      {money(stat.totalRev)}
                    </span>
                    <span className="text-[9px] text-emerald-400 block truncate">
                      Tahsil: {money(stat.totalPaid)}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark ? "bg-slate-950/60 border-slate-800/70" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-400 block">Kalan Alacak</span>
                    <span
                      className={`text-sm font-extrabold font-mono block mt-0.5 truncate ${
                        remaining > 0 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {money(remaining)}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      %{collectionRate} Tahsilat
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle: 12-Month Mini Sparkline Distribution */}
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-indigo-400" /> 12 Aylık Etkinlik Dağılımı
                  </span>
                  <span className="text-[10px] text-slate-500">Aya tıklayarak git</span>
                </div>

                <div className="grid grid-cols-12 gap-1 pt-1">
                  {stat.monthlyCounts.map((count, idx) => {
                    const heightPercent = count > 0 ? Math.max(20, Math.round((count / maxMonthlyCount) * 100)) : 8;
                    const hasEvents = count > 0;
                    const isMonthCurrent = isCurrentYear && new Date().getMonth() === idx;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectYearAndMonth(stat.year, idx)}
                        title={`${trMonthsShort[idx]} ${stat.year}: ${count} etkinlik`}
                        className={`group flex flex-col items-center gap-1 p-1 rounded-md transition-all cursor-pointer ${
                          isMonthCurrent
                            ? "bg-indigo-500/20 ring-1 ring-indigo-500/50"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="w-full h-10 bg-slate-950/40 rounded-sm flex items-end justify-center p-0.5 overflow-hidden">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-xs transition-all ${
                              hasEvents
                                ? isSelectedWorkingYear
                                  ? "bg-indigo-500 group-hover:bg-indigo-400"
                                  : "bg-sky-500 group-hover:bg-sky-400"
                                : "bg-slate-700/30"
                            }`}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-200">
                          {trMonthsShort[idx]}
                        </span>
                        <span className="text-[8px] font-mono font-bold text-slate-300">
                          {count > 0 ? count : "-"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div
                className={`p-3.5 border-t flex flex-wrap items-center justify-between gap-2 ${
                  isDark ? "bg-slate-950/40 border-slate-800/80" : "bg-slate-50 border-slate-200"
                }`}
              >
                {!isSelectedWorkingYear && setWorkingYear && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setWorkingYear(String(stat.year));
                      toast.success(`${stat.year} yılı aktif çalışma dönemi olarak belirlendi.`);
                    }}
                    className="text-[11px] h-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 gap-1 px-2 cursor-pointer"
                    title="Bu yılı sistem varsayılan çalışma yılı yap"
                  >
                    <Star className="h-3.5 w-3.5" /> Aktif Yıl Yap
                  </Button>
                )}

                {isSelectedWorkingYear && (
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Seçili Çalışma Dönemi
                  </span>
                )}

                <div className="flex items-center gap-1.5 ml-auto">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onSelectYearAndMonth(stat.year, 0)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-bold px-3 shadow-xs gap-1 cursor-pointer"
                  >
                    <span>{stat.year} Takvimini Aç</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
