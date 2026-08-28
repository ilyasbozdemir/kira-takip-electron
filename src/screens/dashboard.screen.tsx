import React from "react";
import { Building2, Calendar as CalendarIcon, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money, type Reservation, type Venue } from "@/lib/rental-store";

interface DashboardScreenProps {
  theme: "dark" | "light";
  store: {
    venues: Venue[];
    reservations: Reservation[];
  };
  monthStats: {
    totalCount: number;
    totalRev: number;
    totalPaid: number;
    totalHours: number;
    remaining: number;
  };
  hallById: (id: string) => { name: string } | undefined;
  onNavigateToCalendar: () => void;
}

export function DashboardScreen({
  theme,
  store,
  monthStats,
  hallById,
  onNavigateToCalendar,
}: DashboardScreenProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-xl font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Etkinlik & Mekan Gösterge Paneli
          </h2>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Aylık genel doluluk, gelir dökümü ve yaklaşan rezervasyonlar.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={theme === "dark"
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Toplam Kayıtlı Mekan
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  theme === "dark" ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {store.venues.length}
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={theme === "dark"
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Bu Ayki Etkinlikler
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  theme === "dark" ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {monthStats.totalCount}
              </p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
              <CalendarIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={theme === "dark"
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Aylık Toplam Ciro
              </p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">
                {money(monthStats.totalRev)}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={theme === "dark"
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Tahsil Edilmeyi Bekleyen
              </p>
              <p className="text-2xl font-bold text-amber-500 mt-1">
                {money(monthStats.remaining)}
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Card */}
      <Card
        className={theme === "dark"
          ? "bg-slate-900/80 border-slate-800"
          : "bg-white border-slate-200 shadow-sm"}
      >
        <CardHeader
          className={`pb-3 border-b flex flex-row items-center justify-between ${
            theme === "dark" ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <div>
            <CardTitle
              className={`text-base font-bold ${
                theme === "dark" ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Yaklaşan Etkinlikler
            </CardTitle>
            <CardDescription
              className={`text-xs ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              SQLite veritabanından alınan aktif kayıtlar.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNavigateToCalendar}
            className="text-indigo-500 hover:text-indigo-600 text-xs font-semibold"
          >
            Takvimde Gör
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {store.reservations.length === 0
            ? (
              <p
                className={`text-xs py-6 text-center ${
                  theme === "dark" ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Henüz etkinlik kaydı bulunmuyor.
              </p>
            )
            : (
              store.reservations.slice(0, 5).map((r) => {
                const h = hallById(r.hallId);
                const v = store.venues.find((x) => x.id === r.venueId);

                return (
                  <div
                    key={r.id}
                    className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-200"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            theme === "dark" ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {r.customer}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-indigo-500/30 text-indigo-500 text-[10px]"
                        >
                          {r.eventType || "Etkinlik"}
                        </Badge>
                      </div>
                      <p
                        className={`text-[11px] ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {v?.name} •{" "}
                        <span
                          className={`font-semibold ${
                            theme === "dark" ? "text-slate-300" : "text-slate-800"
                          }`}
                        >
                          {h?.name}
                        </span>
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-4 ${
                        theme === "dark" ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      <div className="text-right font-mono">
                        <div>{r.date}</div>
                        <div
                          className={`text-[11px] ${
                            theme === "dark" ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {r.start} - {r.end}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-500">
                          {money(r.price)}
                        </div>
                        <div
                          className={`text-[11px] ${
                            theme === "dark" ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {r.price - r.paid > 0
                            ? `Kalan: ${money(r.price - r.paid)}`
                            : "Ödendi"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
        </CardContent>
      </Card>
    </div>
  );
}
