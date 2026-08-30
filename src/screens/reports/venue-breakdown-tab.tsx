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
        <span className="text-xs text-slate-400 font-medium">{venueStats.length} Tesis İncelendi</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venueStats.map((v) => (
          <Card
            key={v.id}
            className={`border transition-all flex flex-col justify-between ${
              isDark ? "bg-slate-900/90 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
            }`}
          >
            <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-800/40">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">{v.name}</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">{v.category}</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold">
                  {v.count} Etkinlik
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-4 py-3 space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Toplam Ciro:</span>
                  <span className="font-mono font-bold text-slate-200">{money(v.totalRev)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tahsil Edilen:</span>
                  <span className="font-mono font-bold text-emerald-400">{money(v.totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Kalan Alacak:</span>
                  <span className="font-mono font-bold text-amber-400">{money(v.remaining)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Tahsilat Oranı</span>
                  <span className="text-indigo-400">%{v.collectionRate}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
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
