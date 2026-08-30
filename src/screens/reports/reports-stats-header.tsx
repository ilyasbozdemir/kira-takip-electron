import React from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet,
  Printer,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { money } from "@/lib/rental-store";
import { toast } from "sonner";

interface ReportsStatsHeaderProps {
  theme: "dark" | "light";
  monthStats: {
    totalRev: number;
    totalPaid: number;
    remaining: number;
  };
  totalReservationsCount: number;
  onExportExcel: () => void;
  onPrintReport: () => void;
}

export const ReportsStatsHeader: React.FC<ReportsStatsHeaderProps> = ({
  theme,
  monthStats,
  totalReservationsCount,
  onExportExcel,
  onPrintReport,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="space-y-4">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Finansal Raporlama & Muhasebe
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Tesis bazlı gelirler, tahsilat oranları, makbuzlar ve bakiye dökümleri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrintReport}
            className="text-xs h-8 border-slate-700 hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5 mr-1" /> Yazdır / PDF
          </Button>
          <Button
            size="sm"
            onClick={onExportExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 font-semibold shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Excel (.csv) İndir
          </Button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-slate-400">Toplam Ciro / Tahakkuk</CardTitle>
            <Banknote className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-extrabold text-indigo-400 font-mono">
              {money(monthStats.totalRev)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Tüm kiralamaların toplam bedeli</p>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-slate-400">Tahsil Edilen Tutar</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {money(monthStats.totalPaid)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Kasaya / Bankaya giren nakit</p>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-slate-400">Kalan / Bekleyen Alacak</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-extrabold text-amber-400 font-mono">
              {money(monthStats.remaining)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Tahsil edilecek açık bakiye</p>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-slate-400">Toplam Etkinlik Adedi</CardTitle>
            <Receipt className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-extrabold text-sky-400">
              {totalReservationsCount} Kayıt
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Sistemdeki kiralama adedi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
