import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { money } from "@/lib/rental-store";

interface ReportsScreenProps {
  theme: "dark" | "light";
  monthStats: {
    totalRev: number;
    totalPaid: number;
    remaining: number;
  };
}

export function ReportsScreen({
  theme,
  monthStats,
}: ReportsScreenProps): React.JSX.Element {
  return (
    <Card
      className={theme === "dark"
        ? "bg-slate-900/80 border-slate-800"
        : "bg-white border-slate-200 shadow-sm"}
    >
      <CardHeader
        className={`flex flex-row items-center justify-between pb-4 border-b ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <CardTitle
            className={`text-base font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Mali Raporlar & Döküm
          </CardTitle>
          <CardDescription
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Tüm mekanların gelir, tahsilat ve alacak durumları.
          </CardDescription>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info("Excel raporu indirildi.")}
            className={`text-xs h-8 text-emerald-500 ${
              theme === "dark"
                ? "border-slate-800"
                : "border-slate-300"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />{" "}
            Excel Raporu
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div
            className={`p-4 rounded-xl border ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <p
              className={`text-xs ${
                theme === "dark"
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Toplam Tahakkuk
            </p>
            <p
              className={`text-xl font-bold mt-1 ${
                theme === "dark"
                  ? "text-slate-100"
                  : "text-slate-900"
              }`}
            >
              {money(monthStats.totalRev)}
            </p>
          </div>
          <div
            className={`p-4 rounded-xl border ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <p
              className={`text-xs ${
                theme === "dark"
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Toplam Tahsilat
            </p>
            <p className="text-xl font-bold text-emerald-500 mt-1">
              {money(monthStats.totalPaid)}
            </p>
          </div>
          <div
            className={`p-4 rounded-xl border ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <p
              className={`text-xs ${
                theme === "dark"
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Kalan Alacak
            </p>
            <p className="text-xl font-bold text-amber-500 mt-1">
              {money(monthStats.remaining)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
