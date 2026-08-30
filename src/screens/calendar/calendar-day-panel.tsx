import React from "react";
import {
  Building2,
  Calendar as CalendarIcon,
  Clock,
  Copy,
  ExternalLink,
  LayoutGrid,
  List,
  Mail,
  Maximize2,
  Plus,
  Printer,
  Table as TableIcon,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  hoursBetween,
  money,
  type Reservation,
  type Venue,
} from "@/lib/rental-store";
import { RightPanelViewMode } from "./types";

interface CalendarDayPanelProps {
  theme: "dark" | "light";
  selectedDay: string;
  dayReservations: Reservation[];
  rightPanelViewMode: RightPanelViewMode;
  setRightPanelViewMode: (mode: RightPanelViewMode) => void;
  venues: Venue[];
  hallById: (id: string) => { name: string; color?: string } | undefined;
  getEventTypeColor: (type?: string) => string;
  onOpenNewReservationModal: () => void;
  onOpenExpandedModal: () => void;
  onSelectReservation: (r: Reservation) => void;
  onPromptDeleteReservation: (id: string, title: string) => void;
  onPrintOfficialDoc: (r: Reservation) => void;
  onCopySMS: (r: Reservation) => void;
  onQuickMail: (r: Reservation) => void;
  onNavigateToCustomer?: (customerName: string) => void;
}

const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 24;
const TIMELINE_ROW_HEIGHT = 48; // px per hour

function parseTimeToHours(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h + m / 60;
}

export const CalendarDayPanel: React.FC<CalendarDayPanelProps> = ({
  theme,
  selectedDay,
  dayReservations,
  rightPanelViewMode,
  setRightPanelViewMode,
  venues,
  hallById,
  getEventTypeColor,
  onOpenNewReservationModal,
  onOpenExpandedModal,
  onSelectReservation,
  onPromptDeleteReservation,
  onPrintOfficialDoc,
  onCopySMS,
  onQuickMail,
  onNavigateToCustomer,
}) => {
  const isDark = theme === "dark";

  return (
    <Card
      className={`lg:col-span-4 flex flex-col rounded-2xl shadow-xs overflow-hidden ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}
    >
      <CardHeader
        className={`pb-3 border-b space-y-3 shrink-0 ${
          isDark ? "border-slate-800/80" : "border-slate-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              className={`text-sm font-extrabold flex items-center gap-1.5 ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              <CalendarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />{" "}
              {selectedDay}
            </CardTitle>
            <CardDescription
              className={`text-[11px] mt-0.5 font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {dayReservations.length} Kayıtlı Etkinlik
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenExpandedModal}
              className={`h-7 px-2 text-[10px] font-bold border-indigo-500/40 cursor-pointer ${
                isDark
                  ? "text-indigo-400 hover:bg-indigo-500/10"
                  : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              }`}
              title="Tüm Günü Geniş Ekranda / Ajanda Formatında Gör"
            >
              <Maximize2 className="h-3 w-3 mr-1" /> Tam Ekran
            </Button>
            <Button
              size="sm"
              onClick={onOpenNewReservationModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] h-7 px-2.5 font-bold shadow-xs"
            >
              <Plus className="h-3 w-3 mr-1" /> Yeni Kayıt
            </Button>
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center justify-between pt-1">
          <div
            className={`flex p-0.5 rounded-xl border w-full justify-between gap-0.5 ${
              isDark
                ? "bg-slate-950 border-slate-800"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            {[
              { id: "list", label: "Özet", icon: List },
              { id: "timeline", label: "Çizelge", icon: Clock },
              { id: "table", label: "Tablo", icon: TableIcon },
              { id: "cards", label: "Kartlar", icon: LayoutGrid },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = rightPanelViewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRightPanelViewMode(tab.id as any)}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3 w-3" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[600px]">
        {dayReservations.length === 0 ? (
          <div
            className={`text-center py-12 space-y-2 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            <CalendarIcon className="h-8 w-8 mx-auto opacity-30 text-indigo-500" />
            <p className="text-xs font-medium">
              Bu tarih için henüz bir etkinlik kaydı bulunmuyor.
            </p>
            <Button
              size="sm"
              onClick={onOpenNewReservationModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-3.5 font-bold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Etkinlik Oluştur
            </Button>
          </div>
        ) : rightPanelViewMode === "list" ? (
          /* VIEW MODE 1: MULTI-ROW LIST */
          <div className="space-y-3">
            {dayReservations.map((r) => {
              const h = hallById(r.hallId);
              const v = venues.find((x) => x.id === r.venueId);
              const colorClass = getEventTypeColor(r.eventType);

              return (
                <div
                  key={r.id}
                  onClick={() => onSelectReservation(r)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 group ${
                    isDark
                      ? "bg-slate-950/90 border-slate-800/90 hover:border-indigo-500/60 hover:bg-slate-900/70 text-slate-200 shadow-sm"
                      : "bg-slate-50/80 border-slate-200 hover:border-indigo-400 hover:bg-white text-slate-900 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                          r.status === "option"
                            ? "bg-amber-500 shadow-amber-500/50 shadow-xs"
                            : "bg-emerald-500 shadow-emerald-500/50 shadow-xs"
                        }`}
                      />
                      <h4
                        className={`font-black text-sm tracking-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                          isDark ? "text-slate-100" : "text-slate-900"
                        }`}
                        title={r.customer}
                      >
                        {r.customer}
                      </h4>
                    </div>
                    {r.status === "option" ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 font-bold shrink-0"
                      >
                        ⚠️ Opsiyon
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold shrink-0"
                      >
                        ✅ Kesin
                      </Badge>
                    )}
                  </div>

                  {/* Spacious Location & Details Box */}
                  <div
                    className={`p-2.5 rounded-xl border space-y-1.5 ${
                      isDark
                        ? "bg-slate-900/60 border-slate-800/80"
                        : "bg-white border-slate-200/90 shadow-2xs"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        <Building2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{v?.name || "Mekan"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pl-5 truncate">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: h?.color || "#6366f1" }}
                        />
                        <span className="truncate">{h?.name || "Salon"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ⏰ {r.start} - {r.end}
                      </span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {money(r.price)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center justify-between gap-1.5 pt-1 border-t ${
                      isDark ? "border-slate-800/60" : "border-slate-200/80"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      {onNavigateToCustomer && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onNavigateToCustomer(r.customer)}
                          className="h-7 px-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-bold"
                          title="Müşteri Profili & Geçmiş Kayıtlara Git"
                        >
                          <User className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                          {" "}Profil
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onPrintOfficialDoc(r)}
                        className="h-7 w-7 text-slate-500 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        title="Resmi Tahsis Belgesi Yazdır"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onQuickMail(r)}
                        className="h-7 w-7 text-slate-500 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10"
                        title="E-posta & .ics Takvim Daveti Gönder"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectReservation(r)}
                      className="h-7 px-2.5 text-[11px] border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold transition-all shadow-2xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" /> Detaylar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : rightPanelViewMode === "timeline" ? (
          /* VIEW MODE 2: PROPORTIONAL HOURLY DAY TIMELINE VIEW */
          <div className="relative pl-12 pr-1 py-2 select-none">
            {/* Background Hour Lines */}
            <div
              className="relative border-l border-slate-300 dark:border-slate-800"
              style={{ height: (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * TIMELINE_ROW_HEIGHT }}
            >
              {Array.from({ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 }).map((_, i) => {
                const hourInt = TIMELINE_START_HOUR + i;
                const hourStr = `${String(hourInt).padStart(2, "0")}:00`;
                const topPos = i * TIMELINE_ROW_HEIGHT;

                return (
                  <div
                    key={hourStr}
                    className="absolute left-0 right-0 border-t border-slate-200/80 dark:border-slate-800/60"
                    style={{ top: topPos }}
                  >
                    <span className="absolute -left-12 -top-2.5 text-[10px] text-slate-500 font-mono font-bold">
                      {hourStr}
                    </span>
                  </div>
                );
              })}

              {/* Event Blocks Spanning Real Duration Proportional to Start and End Times */}
              {dayReservations.map((r) => {
                const startHour = parseTimeToHours(r.start);
                const endHour = parseTimeToHours(r.end) || (startHour + 1);

                // Calculate Top & Height
                const clampedStart = Math.max(startHour, TIMELINE_START_HOUR);
                const clampedEnd = Math.min(endHour, TIMELINE_END_HOUR);
                const top = (clampedStart - TIMELINE_START_HOUR) * TIMELINE_ROW_HEIGHT;
                const durationHours = Math.max(clampedEnd - clampedStart, 0.5);
                const height = durationHours * TIMELINE_ROW_HEIGHT;

                const h = hallById(r.hallId);
                const v = venues.find((x) => x.id === r.venueId);

                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectReservation(r)}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      minHeight: "44px",
                    }}
                    className={`absolute left-2 right-1 rounded-xl p-2.5 border shadow-md cursor-pointer transition-all hover:scale-[1.01] hover:z-20 overflow-hidden flex flex-col justify-between ${
                      r.status === "option"
                        ? isDark
                          ? "bg-amber-950/80 border-amber-500/60 text-amber-100"
                          : "bg-amber-50 border-amber-300 text-amber-950 shadow-xs"
                        : isDark
                        ? "bg-indigo-950/85 border-indigo-500/60 text-indigo-100"
                        : "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <span className="font-black truncate flex items-center gap-1">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: h?.color || "#6366f1" }}
                          />
                          {r.customer}
                        </span>
                        <Badge
                          className={`text-[9px] px-1.5 py-0 font-bold shrink-0 ${
                            r.status === "option"
                              ? "bg-amber-600 text-white"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          ⏰ {r.start} - {r.end} ({durationHours.toFixed(1)} sa)
                        </Badge>
                      </div>

                      <div className="text-[11px] font-semibold opacity-90 truncate mt-0.5">
                        🏛️ {v?.name} • 📍 {h?.name}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1 border-t border-current/15">
                      <span>{r.eventType || "Etkinlik"}</span>
                      <span className="font-black text-xs">{money(r.price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : rightPanelViewMode === "table" ? (
          /* VIEW MODE 3: TABLE VIEW */
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr
                  className={`border-b text-[10px] uppercase tracking-wider font-bold ${
                    isDark
                      ? "bg-slate-950 border-slate-800 text-slate-300"
                      : "bg-slate-100 border-slate-200 text-slate-800"
                  }`}
                >
                  <th className="p-2.5">Durum</th>
                  <th className="p-2.5">Müşteri</th>
                  <th className="p-2.5">Mekan / Salon</th>
                  <th className="p-2.5">Saat</th>
                  <th className="p-2.5 text-right">Tutar</th>
                  <th className="p-2.5 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-slate-800/60" : "divide-slate-200"
                }`}
              >
                {dayReservations.map((r) => {
                  const h = hallById(r.hallId);
                  const v = venues.find((x) => x.id === r.venueId);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelectReservation(r)}
                      className={`cursor-pointer transition-colors ${
                        isDark
                          ? "hover:bg-slate-800/40"
                          : "hover:bg-indigo-50/50"
                      }`}
                    >
                      <td className="p-2.5 font-bold">
                        {r.status === "option" ? (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            ⚠️ Opsiyon
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            ✅ Kesin
                          </span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <div
                          className={`font-black ${
                            isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {r.customer}
                        </div>
                        {onNavigateToCustomer && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToCustomer(r.customer);
                            }}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-semibold mt-0.5"
                          >
                            <User className="h-2.5 w-2.5" /> Müşteri Profili
                          </button>
                        )}
                      </td>
                      <td className="p-2.5 font-medium">
                        <div
                          className={`font-semibold ${
                            isDark ? "text-slate-200" : "text-slate-800"
                          }`}
                        >
                          {v?.name}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          {h?.name}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-emerald-400">
                        {r.start}-{r.end}
                      </td>
                      <td className="p-2.5 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {money(r.price)}
                      </td>
                      <td
                        className="p-2.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectReservation(r)}
                          className="h-6 px-2 text-[10px] border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-bold"
                        >
                          Detay
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW MODE 4: DETAILED CARDS (Spacious vertical layout - No horizontal squeezing) */
          dayReservations.map((r) => {
            const h = hallById(r.hallId);
            const v = venues.find((x) => x.id === r.venueId);
            const rem = r.price - r.paid;
            const colorClass = getEventTypeColor(r.eventType);

            return (
              <div
                key={r.id}
                onClick={() => onSelectReservation(r)}
                className={`p-4 rounded-2xl border space-y-3 cursor-pointer transition-all ${
                  isDark
                    ? "bg-slate-950 border-slate-800 hover:bg-slate-900/60"
                    : "bg-slate-50/80 border-slate-200 hover:bg-white shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-black ${
                          isDark ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        {r.customer}
                      </h4>
                      {r.status === "option" ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold"
                        >
                          ⚠️ Şerhli (Opsiyon)
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                        >
                          ✅ Kesin
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${colorClass}`}
                      >
                        {r.eventType || "Etkinlik"}
                      </Badge>
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        📞 {r.phone}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPromptDeleteReservation(
                        r.id,
                        `${r.customer} (${r.date})`,
                      );
                    }}
                    className="h-7 w-7 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Spacious Vertical Venue & Hall Hierarchy (No squeezed text!) */}
                <div
                  className={`p-3 rounded-xl border text-xs space-y-2 ${
                    isDark
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-white border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{v?.name || "Mekan / Tesis"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pl-5.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: h?.color || "#6366f1" }}
                      />
                      <span className="truncate">{h?.name || "Salon"}</span>
                    </div>
                  </div>

                  <div
                    className={`text-[11px] flex justify-between items-center border-t pt-1.5 ${
                      isDark
                        ? "border-slate-800 text-slate-400"
                        : "border-slate-100 text-slate-600 font-medium"
                    }`}
                  >
                    <span>Saat Aralığı:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-emerald-400">
                      {r.start} - {r.end} ({hoursBetween(r.start, r.end)} Saat)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-0.5">
                    <span className={isDark ? "text-slate-400" : "text-slate-600 font-medium"}>
                      Finansal Durum:
                    </span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {money(r.price)}
                    </span>
                  </div>
                  {rem > 0 && (
                    <div className="flex justify-between items-center text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                      <span>Kalan Bakiye:</span>
                      <span>{money(rem)}</span>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-1.5 pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPrintOfficialDoc(r)}
                    className={`flex-1 text-xs h-7.5 px-2 font-bold ${
                      isDark
                        ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                        : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    <Printer className="h-3 w-3 mr-1 text-emerald-600" />{" "}
                    Resmi Belge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopySMS(r)}
                    className={`flex-1 text-xs h-7.5 px-2 font-bold ${
                      isDark
                        ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                        : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    <Copy className="h-3 w-3 mr-1 text-amber-600" /> WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onQuickMail(r)}
                    className={`flex-1 text-xs h-7.5 px-2 font-bold ${
                      isDark
                        ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                        : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    <Mail className="h-3 w-3 mr-1 text-sky-600" /> E-posta
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
