import React, { useMemo, useState } from "react";
import {
  Building2,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  BarChart3,
  AlertTriangle,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";
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
  onOpenHolidaysModal?: () => void;
}

export function DashboardScreen({
  theme,
  store,
  monthStats,
  hallById,
  onNavigateToCalendar,
  onOpenHolidaysModal,
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

  const [isHolidayNoticeDismissed, setIsHolidayNoticeDismissed] = useState(() => {
    const dismissedAt = localStorage.getItem("venue_keeper_holiday_notice_dismissed");
    if (!dismissedAt) return false;
    // Auto-show again after 24 hours
    const diffHours = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
    return diffHours < 24;
  });

  const handleDismissNotice = () => {
    localStorage.setItem("venue_keeper_holiday_notice_dismissed", String(Date.now()));
    setIsHolidayNoticeDismissed(true);
  };

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

        {isHolidayNoticeDismissed && (
          <button
            type="button"
            onClick={() => setIsHolidayNoticeDismissed(false)}
            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Resmi Tatil Uyarısını Göster</span>
          </button>
        )}
      </div>

      {/* Official Holidays & Verification Announcement Banner */}
      {!isHolidayNoticeDismissed && (
        <div className="relative p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/20 shadow-xs animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <span>📢 Önemli Duyuru: Resmi Tatiller ve İdari İzinler</span>
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    ÖNEMLİ HATIRLATMA
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                  Sistem takvimindeki resmi tatil, bayram ve idari izin günleri genel ön bilgilendirme amaçlıdır. Salon tahsis, etkinlik planlama veya kiralama sözleşmesi yaparken resmi tatil ve idari izin durumlarını mutlaka <strong>Google</strong>, <strong>T.C. Resmi Gazete</strong> veya yetkili <strong>resmi mülki idare kurumlarından</strong> teyit ediniz.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const year = new Date().getFullYear();
                  (window.electronAPI as any)?.openExternalLink?.(
                    `https://www.google.com/search?q=resmi+tatiller+ve+idari+izinler+${year}`
                  );
                }}
                className="text-xs h-8 font-bold border-amber-500/40 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Google'da Teyit Et
              </Button>

              {onOpenHolidaysModal && (
                <Button
                  size="sm"
                  onClick={onOpenHolidaysModal}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 font-bold gap-1.5 cursor-pointer shadow-xs"
                >
                  <CalendarIcon className="h-3.5 w-3.5" /> Tatil Takvimini Aç
                </Button>
              )}

              <button
                type="button"
                onClick={handleDismissNotice}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Duyuruyu Gizle (24 Saat)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
