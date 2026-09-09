import React, { useMemo } from "react";
import { Building2, Calendar as CalendarIcon, Clock, DollarSign, BarChart3 } from "lucide-react";
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
  const isDark = theme === "dark";

  // Calculate venue & hall reservation distributions
  const venueStats = useMemo(() => {
    const list: {
      venueId: string;
      venueName: string;
      halls: {
        id: string;
        name: string;
        color?: string;
        eventCount: number;
        totalRev: number;
      }[];
    }[] = [];

    for (const v of store.venues) {
      const halls = (v.halls || []).map((h) => {
        const matchingRes = store.reservations.filter((r) => r.hallId === h.id);
        const eventCount = matchingRes.length;
        const totalRev = matchingRes.reduce((sum, r) => sum + (r.price || 0), 0);
        return {
          id: h.id,
          name: h.name,
          color: h.color,
          eventCount,
          totalRev,
        };
      });
      list.push({
        venueId: v.id,
        venueName: v.name,
        halls,
      });
    }
    return list;
  }, [store.venues, store.reservations]);

  const totalAllEvents = store.reservations.length || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Etkinlik & Mekan Gösterge Paneli
          </h2>
          <p
            className={`text-xs ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Aylık genel doluluk, gelir dökümü ve yaklaşan rezervasyonlar.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Toplam Kayıtlı Mekan
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  isDark ? "text-slate-100" : "text-slate-900"
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
          className={isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Bu Ayki Etkinlikler
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  isDark ? "text-slate-100" : "text-slate-900"
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
          className={isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
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
          className={isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Events Card */}
        <Card
          className={`lg:col-span-2 ${
            isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <CardHeader
            className={`pb-3 border-b flex flex-row items-center justify-between ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <div>
              <CardTitle
                className={`text-base font-bold ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Yaklaşan Etkinlikler
              </CardTitle>
              <CardDescription
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-600"
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
            {store.reservations.length === 0 ? (
              <p
                className={`text-xs py-8 text-center ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Henüz etkinlik kaydı bulunmuyor.
              </p>
            ) : (
              store.reservations.slice(0, 6).map((r) => {
                const h = hallById(r.hallId);
                const v = store.venues.find((x) => x.id === r.venueId);

                return (
                  <div
                    key={r.id}
                    className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-slate-200"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            isDark ? "text-slate-100" : "text-slate-900"
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
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {v?.name} •{" "}
                        <span
                          className={`font-semibold ${
                            isDark ? "text-slate-300" : "text-slate-800"
                          }`}
                        >
                          {h?.name}
                        </span>
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-4 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      <div className="text-right font-mono">
                        <div>{r.date}</div>
                        <div
                          className={`text-[11px] ${
                            isDark ? "text-slate-400" : "text-slate-500"
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
                            isDark ? "text-slate-400" : "text-slate-500"
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

        {/* Right 1 Col: Venue & Hall Distribution Card */}
        <Card
          className={
            isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }
        >
          <CardHeader
            className={`pb-3 border-b flex flex-row items-center justify-between ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <div>
              <CardTitle
                className={`text-base font-bold flex items-center gap-2 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                Salon Doluluk Dağılımı
              </CardTitle>
              <CardDescription
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Etkinliklerin salonlara göre dağılımı.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4 max-h-115 overflow-y-auto">
            {venueStats.length === 0 ||
            venueStats.every((v) => v.halls.length === 0) ? (
              <p
                className={`text-xs py-8 text-center ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Tanımlı salon bulunmuyor.
              </p>
            ) : (
              venueStats.map((v) => (
                <div key={v.venueId} className="space-y-2">
                  <h4
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {v.venueName}
                  </h4>
                  <div className="space-y-2">
                    {v.halls.map((h) => {
                      const percentage = Math.round(
                        (h.eventCount / totalAllEvents) * 100,
                      );
                      return (
                        <div
                          key={h.id}
                          className={`p-2.5 rounded-lg border ${
                            isDark
                              ? "bg-slate-950/60 border-slate-800/80"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span
                              className={`font-semibold ${
                                isDark ? "text-slate-200" : "text-slate-800"
                              }`}
                            >
                              {h.name}
                            </span>
                            <span
                              className={`font-mono text-[11px] ${
                                isDark ? "text-indigo-400" : "text-indigo-600"
                              }`}
                            >
                              {h.eventCount} Etkinlik ({percentage}%)
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div
                            className={`w-full h-1.5 rounded-full overflow-hidden ${
                              isDark ? "bg-slate-800" : "bg-slate-200"
                            }`}
                          >
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(percentage, 3)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-mono">
                            <span>Toplam Hacim:</span>
                            <span className="text-emerald-500 font-semibold">
                              {money(h.totalRev)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
