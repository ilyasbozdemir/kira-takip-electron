import React from "react";
import { Badge } from "@/components/ui/badge";
import { money, type Reservation, trMonths, type Venue } from "@/lib/rental-store";
import { getHolidayInfo, getWeekendDayName, isWeekend } from "@/lib/holidays";

interface CalendarTimelineViewProps {
  theme: "dark" | "light";
  cursor: Date;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  filteredReservations: Reservation[];
  venues: Venue[];
  hallById: (id: string) => { name: string; color?: string } | undefined;
  getEventTypeColor: (type?: string) => string;
  onSelectReservation: (r: Reservation) => void;
}

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  theme,
  cursor,
  selectedDay,
  setSelectedDay,
  filteredReservations,
  venues,
  hallById,
  getEventTypeColor,
  onSelectReservation,
}) => {
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
      <h3
        className={`text-xs font-bold uppercase tracking-wider ${
          theme === "dark" ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {trMonths[cursor.getMonth()]} {cursor.getFullYear()} Tüm Etkinlik Çizelgesi
      </h3>
      {filteredReservations.length === 0 ? (
        <p className="text-xs text-slate-500 py-12 text-center">
          Bu ay için henüz etkinlik kaydı yok.
        </p>
      ) : (
        filteredReservations.map((r) => {
          const h = hallById(r.hallId);
          const v = venues.find((x) => x.id === r.venueId);
          const colorClass = getEventTypeColor(r.eventType);
          const weekend = isWeekend(r.date);
          const weekendName = getWeekendDayName(r.date);
          const holiday = getHolidayInfo(r.date);

          return (
            <div
              key={r.id}
              onClick={() => {
                setSelectedDay(r.date);
                onSelectReservation(r);
              }}
              className={`p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                r.date === selectedDay
                  ? "border-indigo-500 bg-indigo-950/20 shadow-xs"
                  : holiday && holiday.isOffDay
                  ? theme === "dark"
                    ? "bg-rose-950/15 border-rose-800/40 hover:bg-rose-900/25"
                    : "bg-rose-50/40 border-rose-200 hover:bg-rose-50"
                  : weekend
                  ? theme === "dark"
                    ? "bg-slate-950 border-rose-950/50 hover:bg-slate-900/40"
                    : "bg-slate-50/80 border-rose-200/50 hover:bg-slate-100"
                  : theme === "dark"
                  ? "bg-slate-950 border-slate-800 hover:bg-slate-800/40"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`text-center font-mono shrink-0 px-2.5 py-1 rounded-lg border ${
                    holiday && holiday.isOffDay
                      ? "bg-rose-500/10 border-rose-500/30"
                      : weekend
                      ? "bg-rose-500/5 border-rose-500/20"
                      : "bg-indigo-600/10 border-indigo-500/20"
                  }`}
                >
                  <span
                    className={`text-xs font-bold block ${
                      holiday || weekend ? "text-rose-500" : "text-indigo-500"
                    }`}
                  >
                    {r.date}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {r.start} - {r.end}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-xs font-bold ${
                        theme === "dark" ? "text-slate-100" : "text-slate-900"
                      }`}
                    >
                      {r.customer}
                    </p>
                    {weekend && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        {weekendName}
                      </span>
                    )}
                    {holiday && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <span>{holiday.icon || "🇹🇷"}</span>
                        <span>{holiday.shortTitle || holiday.title}</span>
                      </span>
                    )}
                    {r.status === "option" ? (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 bg-amber-500/10 border-amber-500/40 text-amber-500 font-bold"
                      >
                        ⚠️ Şerhli
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 bg-emerald-500/10 border-emerald-500/40 text-emerald-500 font-semibold"
                      >
                        ✅ Kesin
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`text-[11px] ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {v?.name} •{" "}
                    <span className="font-semibold text-indigo-500">
                      {h?.name}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="outline" className={`text-[10px] ${colorClass}`}>
                  {r.eventType || "Etkinlik"}
                </Badge>
                <span className="font-bold text-emerald-500 text-xs">
                  {money(r.price)}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
