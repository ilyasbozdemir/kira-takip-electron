import React from "react";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { money } from "@/lib/rental-store";
import { VenueStatItem } from "./types";

interface VenueBreakdownTabProps {
  theme: "dark" | "light";
  venueStats: VenueStatItem[];
}

export const VenueBreakdownTab: React.FC<VenueBreakdownTabProps> = ({
  theme,
  venueStats,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight">Mekan Bazlı Gelir ve Tahsilat Dağılımı</h3>
        <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {venueStats.length} Tesis İncelendi
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venueStats.map((v) => (
          <Card
            key={v.id}
            className={`border rounded-2xl transition-all flex flex-col justify-between shadow-xs ${
              isDark
                ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-100"
                : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md text-slate-900"
            }`}
          >
            <CardHeader className={`pb-2 pt-4 px-4 border-b ${isDark ? "border-slate-800/80" : "border-slate-100"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {v.name}
                  </CardTitle>
                  <CardDescription className={`text-[11px] mt-0.5 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {v.category}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    isDark
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                      : "bg-indigo-50 border-indigo-200 text-indigo-700"
                  }`}
                >
                  {v.count} Etkinlik
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-4 py-3 space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className={`flex justify-between items-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <span>Toplam Ciro:</span>
                  <span className={`font-mono font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                    {money(v.totalRev)}
                  </span>
                </div>
                <div className={`flex justify-between items-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <span>Tahsil Edilen:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {money(v.totalPaid)}
                  </span>
                </div>
                <div className={`flex justify-between items-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <span>Kalan Alacak:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {money(v.remaining)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className={`flex justify-between text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <span>Tahsilat Oranı</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">%{v.collectionRate}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${Math.min(v.collectionRate, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
