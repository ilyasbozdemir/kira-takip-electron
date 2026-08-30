import React from "react";
import {
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
  return (
    <Card
      className={`lg:col-span-4 flex flex-col ${
        theme === "dark"
          ? "bg-slate-900/80 border-slate-800"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <CardHeader
        className={`pb-3 border-b space-y-3 ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              className={`text-sm font-bold flex items-center gap-1.5 ${
                theme === "dark" ? "text-slate-100" : "text-slate-900"
              }`}
            >
              <CalendarIcon className="h-4 w-4 text-indigo-500" />{" "}
              {selectedDay}
            </CardTitle>
            <CardDescription
              className={`text-[11px] mt-0.5 ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
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
              className="h-7 px-2 text-[10px] font-bold border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 shadow-2xs cursor-pointer"
              title="Tüm Günü Geniş Ekranda / Ajanda Formatında Gör"
            >
              <Maximize2 className="h-3 w-3 mr-1" /> Tam Ekran
            </Button>
            <Button
              size="sm"
              onClick={onOpenNewReservationModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] h-7 px-2.5 font-semibold shadow-xs"
            >
              <Plus className="h-3 w-3 mr-1" /> Yeni Kayıt
            </Button>
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center justify-between pt-1">
          <div
            className={`flex p-0.5 rounded-lg border w-full justify-between gap-0.5 ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={() => setRightPanelViewMode("list")}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                rightPanelViewMode === "list"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Özet Liste Görünümü"
            >
              <List className="h-3 w-3" /> Özet
            </button>
            <button
              type="button"
              onClick={() => setRightPanelViewMode("timeline")}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                rightPanelViewMode === "timeline"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Zaman Çizelgesi"
            >
              <Clock className="h-3 w-3" /> Çizelge
            </button>
            <button
              type="button"
              onClick={() => setRightPanelViewMode("table")}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                rightPanelViewMode === "table"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Veri Tablosu Görünümü"
            >
              <TableIcon className="h-3 w-3" /> Tablo
            </button>
            <button
              type="button"
              onClick={() => setRightPanelViewMode("cards")}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                rightPanelViewMode === "cards"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Detaylı Kart Görünümü"
            >
              <LayoutGrid className="h-3 w-3" /> Kartlar
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[550px]">
        {dayReservations.length === 0 ? (
          <div
            className={`text-center py-12 space-y-2 ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`}
          >
            <CalendarIcon className="h-8 w-8 mx-auto opacity-30 text-indigo-500" />
            <p className="text-xs">
              Bu tarih için henüz bir etkinlik tanımı bulunmuyor.
            </p>
            <Button
              size="sm"
              onClick={onOpenNewReservationModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-3.5 font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Etkinlik Oluştur
            </Button>
          </div>
        ) : rightPanelViewMode === "list" ? (
          /* VIEW MODE 1: MULTI-ROW LIST */
          <div className="space-y-2.5">
            {dayReservations.map((r) => {
              const h = hallById(r.hallId);
              const v = venues.find((x) => x.id === r.venueId);
              const colorClass = getEventTypeColor(r.eventType);

              return (
                <div
                  key={r.id}
                  onClick={() => onSelectReservation(r)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 group ${
                    theme === "dark"
                      ? "bg-slate-950/90 border-slate-800/90 hover:border-indigo-500/60 hover:bg-slate-900/70 text-slate-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-indigo-500/60 hover:bg-indigo-50/40 text-slate-900 shadow-xs"
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
                          theme === "dark"
                            ? "text-slate-100"
                            : "text-slate-900"
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

                  <div
                    className={`grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl border ${
                      theme === "dark"
                        ? "bg-slate-900/60 border-slate-800/80"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div
                        className={`font-mono font-bold text-xs flex items-center gap-1 ${
                          theme === "dark"
                            ? "text-slate-200"
                            : "text-slate-900"
                        }`}
                      >
                        ⏰ {r.start} - {r.end}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9.5px] px-1.5 py-0 font-bold ${colorClass}`}
                      >
                        {r.eventType || "Etkinlik"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-right">
                      <div
                        className={`font-bold truncate text-[11px] ${
                          theme === "dark"
                            ? "text-indigo-400"
                            : "text-indigo-600"
                        }`}
                        title={`${v?.name} (${h?.name})`}
                      >
                        🏛️ {v?.name || "Mekan"}
                      </div>
                      <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                        {money(r.price)}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      {onNavigateToCustomer && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onNavigateToCustomer(r.customer)}
                          className="h-7 px-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 font-bold"
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
                        className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10"
                        title="Resmi Tahsis Belgesi Yazdır"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onQuickMail(r)}
                        className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/10"
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
          /* VIEW MODE 2: HOURLY DAY TIMELINE VIEW */
          <div className="space-y-1 relative pl-12 pr-1 py-2 font-mono">
            {[
              "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
              "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
              "20:00", "21:00", "22:00", "23:00",
            ].map((hourStr) => {
              const hourInt = parseInt(hourStr.split(":")[0], 10);
              const activeReservations = dayReservations.filter((r) => {
                const startH = parseInt(r.start.split(":")[0], 10);
                const endH = parseInt(r.end.split(":")[0], 10) || 24;
                return hourInt >= startH && hourInt < endH;
              });

              return (
                <div
                  key={hourStr}
                  className="relative min-h-[42px] border-t border-slate-200 dark:border-slate-800/50 flex items-start"
                >
                  <span className="absolute -left-12 -top-2.5 text-[10px] text-slate-500 font-bold">
                    {hourStr}
                  </span>

                  {activeReservations.length > 0 && (
                    <div className="w-full space-y-1 py-0.5">
                      {activeReservations.map((r) => {
                        const isStartHour = parseInt(r.start.split(":")[0], 10) === hourInt;
                        if (!isStartHour) return null;

                        const h = hallById(r.hallId);
                        const v = venues.find((x) => x.id === r.venueId);

                        return (
                          <div
                            key={r.id}
                            onClick={() => onSelectReservation(r)}
                            className={`p-2.5 rounded-xl border cursor-pointer shadow-sm transition-all space-y-1 animate-in fade-in ${
                              theme === "dark"
                                ? "bg-gradient-to-r from-indigo-950/80 to-slate-900 border-indigo-500/50 hover:border-indigo-400"
                                : "bg-indigo-50/80 border-indigo-300 hover:border-indigo-500 shadow-2xs"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`font-black flex items-center gap-1.5 ${
                                  theme === "dark"
                                    ? "text-slate-100"
                                    : "text-slate-900"
                                }`}
                              >
                                <Clock className="h-3 w-3 text-indigo-500" />
                                {" "}{r.customer}
                              </span>
                              <Badge className="bg-indigo-600 text-white text-[9px] font-bold">
                                ⏰ {r.start} - {r.end}
                              </Badge>
                            </div>
                            <div
                              className={`text-[10px] font-sans flex items-center justify-between ${
                                theme === "dark"
                                  ? "text-slate-300"
                                  : "text-slate-700 font-medium"
                              }`}
                            >
                              <span>🏛️ {v?.name} • 📍 {h?.name}</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                {money(r.price)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : rightPanelViewMode === "table" ? (
          /* VIEW MODE 3: TABLE VIEW */
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr
                  className={`border-b text-[10px] uppercase tracking-wider font-bold ${
                    theme === "dark"
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
                  theme === "dark"
                    ? "divide-slate-800/60"
                    : "divide-slate-200"
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
                        theme === "dark"
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
                            theme === "dark"
                              ? "text-slate-100"
                              : "text-slate-900"
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
                            theme === "dark"
                              ? "text-slate-200"
                              : "text-slate-800"
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
          /* VIEW MODE 4: DETAILED CARDS */
          dayReservations.map((r) => {
            const h = hallById(r.hallId);
            const v = venues.find((x) => x.id === r.venueId);
            const rem = r.price - r.paid;
            const colorClass = getEventTypeColor(r.eventType);

            return (
              <div
                key={r.id}
                onClick={() => onSelectReservation(r)}
                className={`p-4 rounded-xl border space-y-3 cursor-pointer transition-all ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 hover:bg-slate-800/40"
                    : "bg-white border-slate-200 hover:bg-indigo-50/40 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-black ${
                          theme === "dark"
                            ? "text-slate-100"
                            : "text-slate-900"
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
                          theme === "dark"
                            ? "text-slate-400"
                            : "text-slate-600"
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

                <div
                  className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                    theme === "dark"
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-bold ${
                        theme === "dark"
                          ? "text-slate-200"
                          : "text-slate-800"
                      }`}
                    >
                      {v?.name}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {h?.name}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] flex justify-between items-center border-t pt-1 ${
                      theme === "dark"
                        ? "border-slate-800 text-slate-400"
                        : "border-slate-200 text-slate-600 font-medium"
                    }`}
                  >
                    <span>Saat Aralığı:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-emerald-400">
                      {r.start} - {r.end} ({hoursBetween(r.start, r.end)} Saat)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-0.5">
                    <span
                      className={theme === "dark"
                        ? "text-slate-400"
                        : "text-slate-600 font-medium"}
                    >
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
                      theme === "dark"
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
                      theme === "dark"
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
                      theme === "dark"
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
