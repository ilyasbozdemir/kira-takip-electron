import React from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  money,
  type Reservation,
  toKey,
  trDays,
  type Venue,
} from "@/lib/rental-store";

interface CalendarGridViewProps {
  theme: "dark" | "light";
  grid: (Date | null)[];
  today: Date;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  byDate: Map<string, Reservation[]>;
  calendarVenueFilter: string;
  venues: Venue[];
  hallById: (id: string) => { name: string; color?: string } | undefined;
  getEventTypeColor: (type?: string) => string;
  onSelectReservation: (r: Reservation) => void;
  onOpenNewReservationModal: () => void;
}

export const CalendarGridView: React.FC<CalendarGridViewProps> = ({
  theme,
  grid,
  today,
  selectedDay,
  setSelectedDay,
  byDate,
  calendarVenueFilter,
  venues,
  hallById,
  getEventTypeColor,
  onSelectReservation,
  onOpenNewReservationModal,
}) => {
  return (
    <>
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 mb-2">
        {trDays.map((d) => (
          <div key={d} className="py-1.5 uppercase font-mono text-[11px]">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className={`h-22 md:h-26 rounded-xl ${
                  theme === "dark"
                    ? "bg-slate-950/30 border border-slate-900/50"
                    : "bg-slate-100/40 border border-slate-200/50"
                }`}
              />
            );
          }
          const k = toKey(cell);
          const isToday = k === toKey(today);
          const isSelected = k === selectedDay;
          const rawDayRes = byDate.get(k) ?? [];
          const dayResList = rawDayRes.filter(
            (r) =>
              calendarVenueFilter === "all" ||
              r.venueId === calendarVenueFilter,
          );

          const dayButton = (
            <button
              key={k}
              type="button"
              onClick={() => setSelectedDay(k)}
              className={`h-22 md:h-26 p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between overflow-hidden group cursor-pointer ${
                isSelected
                  ? "border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/50 shadow-md"
                  : isToday
                  ? theme === "dark"
                    ? "border-amber-500/60 bg-amber-950/20"
                    : "border-amber-500 bg-amber-50"
                  : theme === "dark"
                  ? "border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/50 hover:border-slate-700"
                  : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold ${
                    isToday
                      ? "bg-amber-500 text-slate-950 h-5 px-1.5 rounded-full flex items-center justify-center font-mono text-[11px]"
                      : theme === "dark"
                      ? "text-slate-300"
                      : "text-slate-800"
                  }`}
                >
                  {cell.getDate()}
                </span>
                {dayResList.length > 0 && (
                  <Badge className="bg-indigo-600 text-white text-[10px] px-1 py-0 h-4">
                    {dayResList.length} Kayıt
                  </Badge>
                )}
              </div>

              <div className="space-y-1 mt-1 overflow-y-auto no-scrollbar flex-1 w-full">
                {dayResList.slice(0, 2).map((r) => {
                  const h = hallById(r.hallId);
                  const v = venues.find((x) => x.id === r.venueId);
                  const customColor = h?.color || v?.color || "#6366f1";
                  const colorClass = getEventTypeColor(r.eventType);
                  const isOption = r.status === "option";
                  return (
                    <div
                      key={r.id}
                      className={`text-[10px] leading-tight p-1 rounded border truncate font-medium flex items-center gap-1 ${
                        isOption
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-300 font-bold"
                          : colorClass
                      }`}
                      title={`${r.customer} ${
                        isOption ? "[Şerhli / Opsiyonlu]" : "[Kesin]"
                      } (${r.start} - ${h?.name})`}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0 shadow-xs"
                        style={{
                          backgroundColor: isOption ? "#f59e0b" : customColor,
                        }}
                      />
                      <span className="font-mono font-bold shrink-0">
                        {r.start}
                      </span>
                      <span className="truncate">
                        {isOption ? `⚠️ ${r.customer}` : r.customer}
                      </span>
                    </div>
                  );
                })}
                {dayResList.length > 2 && (
                  <div
                    className={`text-[9px] font-semibold text-center py-0.5 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    +{dayResList.length - 2} daha
                  </div>
                )}
              </div>
            </button>
          );

          if (dayResList.length === 0) {
            return dayButton;
          }

          return (
            <HoverCard key={k} openDelay={150} closeDelay={100}>
              <HoverCardTrigger asChild>
                {dayButton}
              </HoverCardTrigger>
              <HoverCardContent
                side="top"
                align="center"
                className={`w-80 p-3.5 border shadow-2xl rounded-2xl z-50 space-y-3 ${
                  theme === "dark"
                    ? "bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md"
                    : "bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    <span>{k}</span>
                  </div>
                  <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 font-bold">
                    {dayResList.length} Etkinlik
                  </Badge>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {dayResList.map((r) => {
                    const h = hallById(r.hallId);
                    const v = venues.find((x) => x.id === r.venueId);
                    return (
                      <div
                        key={r.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReservation(r);
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all space-y-1 ${
                          theme === "dark"
                            ? "bg-slate-950 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/40"
                            : "bg-slate-50 border-slate-200 hover:border-indigo-500/60 hover:bg-slate-100 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span className="truncate">{r.customer}</span>
                          {r.status === "option" ? (
                            <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                              ⚠️ Opsiyon
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                              ✅ Kesin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-0.5">
                          <span>⏰ {r.start} - {r.end}</span>
                          <span className="font-bold text-emerald-400">
                            {money(r.price)}
                          </span>
                        </div>
                        <div className="text-[10px] text-indigo-400 font-medium truncate pt-0.5">
                          🏛️ {v?.name} • {h?.name}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t flex items-center justify-between gap-2 text-[11px]">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDay(k);
                      onOpenNewReservationModal();
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] h-7 font-semibold shadow-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Bu Güne Etkinlik Ekle
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    </>
  );
};
