import React from "react";
import { Badge } from "@/components/ui/badge";
import { money, type Reservation, trMonths, type Venue } from "@/lib/rental-store";

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
                  : theme === "dark"
                  ? "bg-slate-950 border-slate-800 hover:bg-slate-800/40"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-center font-mono shrink-0 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                  <span className="text-xs font-bold text-indigo-500 block">
                    {r.date}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {r.start} - {r.end}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-bold ${
                        theme === "dark" ? "text-slate-100" : "text-slate-900"
                      }`}
                    >
                      {r.customer}
                    </p>
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
