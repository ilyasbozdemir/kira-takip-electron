import React from "react";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Grid as GridIcon,
  Mail,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  hoursBetween,
  money,
  type Reservation,
  toKey,
  trDays,
  trMonths,
  type Venue,
} from "@/lib/rental-store";

interface CalendarScreenProps {
  theme: "dark" | "light";
  cursor: Date;
  setCursor: (d: Date) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  calendarViewMode: "grid" | "timeline";
  setCalendarViewMode: (mode: "grid" | "timeline") => void;
  calendarVenueFilter: string;
  setCalendarVenueFilter: (v: string) => void;
  store: {
    venues: Venue[];
    reservations: Reservation[];
  };
  grid: (Date | null)[];
  byDate: Map<string, Reservation[]>;
  filteredReservations: Reservation[];
  hallById: (id: string) => { name: string; color?: string } | undefined;
  getEventTypeColor: (type?: string) => string;
  today: Date;
  onOpenNewReservationModal: () => void;
  onSelectReservation: (r: Reservation) => void;
  onPromptDeleteReservation: (id: string, title: string) => void;
  onPrintOfficialDoc: (r: Reservation) => void;
  onCopySMS: (r: Reservation) => void;
  onQuickMail: (r: Reservation) => void;
}

export function CalendarScreen({
  theme,
  cursor,
  setCursor,
  selectedDay,
  setSelectedDay,
  calendarViewMode,
  setCalendarViewMode,
  calendarVenueFilter,
  setCalendarVenueFilter,
  store,
  grid,
  byDate,
  filteredReservations,
  hallById,
  getEventTypeColor,
  today,
  onOpenNewReservationModal,
  onSelectReservation,
  onPromptDeleteReservation,
  onPrintOfficialDoc,
  onCopySMS,
  onQuickMail,
}: CalendarScreenProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Calendar Toolbar */}
      <div
        className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
          theme === "dark"
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        {/* Left: Detailed Month & Year Navigator with Quick Jump */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 ${
              theme === "dark"
                ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
            onClick={() =>
              setCursor(
                new Date(
                  cursor.getFullYear(),
                  cursor.getMonth() - 1,
                  1,
                ),
              )}
            title="Önceki Ay"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Month Dropdown */}
          <Select
            value={String(cursor.getMonth())}
            onValueChange={(val) =>
              setCursor(
                new Date(cursor.getFullYear(), Number(val), 1),
              )}
          >
            <SelectTrigger
              className={`w-[125px] text-xs h-8 font-semibold ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-900"}
            >
              {trMonths.map((m, idx) => (
                <SelectItem key={idx} value={String(idx)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Dropdown */}
          <Select
            value={String(cursor.getFullYear())}
            onValueChange={(val) =>
              setCursor(
                new Date(Number(val), cursor.getMonth(), 1),
              )}
          >
            <SelectTrigger
              className={`w-[90px] text-xs h-8 font-semibold ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-900"}
            >
              {Array.from({ length: 16 }, (_, i) => 2020 + i).map((
                y,
              ) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 ${
              theme === "dark"
                ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
            onClick={() =>
              setCursor(
                new Date(
                  cursor.getFullYear(),
                  cursor.getMonth() + 1,
                  1,
                ),
              )}
            title="Sonraki Ay"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCursor(
                new Date(today.getFullYear(), today.getMonth(), 1),
              );
              setSelectedDay(toKey(today));
            }}
            className="text-indigo-500 hover:text-indigo-600 text-xs font-semibold px-2 h-8"
            title="Bugünün tarihine git"
          >
            Bugüne Git
          </Button>

          {/* İlgili Tarihe Git Date Picker */}
          <div className="flex items-center gap-1.5 ml-1 border-l pl-2 dark:border-slate-800 border-slate-300">
            <span
              className={`text-[11px] font-medium hidden sm:inline ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              İlgili Tarihe Git:
            </span>
            <Input
              type="date"
              value={selectedDay}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const [y, m, d] = val.split("-").map(Number);
                  if (y && m && d) {
                    setCursor(new Date(y, m - 1, 1));
                    setSelectedDay(val);
                    toast.info(`Tarihe gidildi: ${val}`);
                  }
                }
              }}
              className={`text-xs h-8 w-[130px] font-mono ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>
        </div>

        {/* Center: View Mode Tabs */}
        <div
          className={`flex items-center p-1 rounded-lg border text-xs ${
            theme === "dark"
              ? "bg-slate-950 border-slate-800"
              : "bg-slate-100 border-slate-200"
          }`}
        >
          <button
            onClick={() => setCalendarViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              calendarViewMode === "grid"
                ? "bg-indigo-600 text-white shadow-xs"
                : theme === "dark"
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GridIcon className="h-3.5 w-3.5" /> Aylık Izgara
          </button>
          <button
            onClick={() => setCalendarViewMode("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              calendarViewMode === "timeline"
                ? "bg-indigo-600 text-white shadow-xs"
                : theme === "dark"
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" /> Zaman Çizelgesi
          </button>
        </div>

        {/* Right: Venue Filter & Add Button */}
        <div className="flex items-center gap-2">
          <Select
            value={calendarVenueFilter}
            onValueChange={setCalendarVenueFilter}
          >
            <SelectTrigger
              className={`w-[170px] text-xs h-8 ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <SelectValue placeholder="Mekan Filtrele" />
            </SelectTrigger>
            <SelectContent
              className={theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-900"}
            >
              <SelectItem value="all">Tüm Mekanlar</SelectItem>
              {store.venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={onOpenNewReservationModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold px-3"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Etkinlik Ekle
          </Button>
        </div>
      </div>

      {/* Main Calendar Grid & Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar Grid or Timeline */}
        <Card
          className={`lg:col-span-8 ${
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <CardContent className="p-4">
            {calendarViewMode === "grid"
              ? (
                <>
                  <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 mb-2">
                    {trDays.map((d) => (
                      <div
                        key={d}
                        className="py-1.5 uppercase font-mono text-[11px]"
                      >
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

                      return (
                        <button
                          key={k}
                          onClick={() => setSelectedDay(k)}
                          className={`h-22 md:h-26 p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between overflow-hidden group ${
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
                              const v = store.venues.find((x) =>
                                x.id === r.venueId
                              );
                              const customColor = h?.color ||
                                v?.color || "#6366f1";
                              const colorClass = getEventTypeColor(
                                r.eventType,
                              );
                              const isOption = r.status === "option";
                              return (
                                <div
                                  key={r.id}
                                  className={`text-[10px] leading-tight p-1 rounded border truncate font-medium flex items-center gap-1 ${
                                    isOption
                                      ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-300 font-bold"
                                      : colorClass
                                  }`}
                                  title={`${r.customer} ${isOption ? "[Şerhli / Opsiyonlu]" : "[Kesin]"} (${r.start} - ${h?.name})`}
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
                                  theme === "dark"
                                    ? "text-slate-400"
                                    : "text-slate-600"
                                }`}
                              >
                                +{dayResList.length - 2} daha
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )
              : (
                /* Timeline View */
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {trMonths[cursor.getMonth()]} {cursor.getFullYear()}{" "}
                    Tüm Etkinlik Çizelgesi
                  </h3>
                  {filteredReservations.length === 0
                    ? (
                      <p className="text-xs text-slate-500 py-12 text-center">
                        Bu ay için henüz etkinlik kaydı yok.
                      </p>
                    )
                    : (
                      filteredReservations.map((r) => {
                        const h = hallById(r.hallId);
                        const v = store.venues.find((x) => x.id === r.venueId);
                        const colorClass = getEventTypeColor(
                          r.eventType,
                        );

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
                                      theme === "dark"
                                        ? "text-slate-100"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {r.customer}
                                  </p>
                                  {r.status === "option"
                                    ? (
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] px-1.5 py-0 bg-amber-500/10 border-amber-500/40 text-amber-500 font-bold"
                                      >
                                        ⚠️ Şerhli
                                      </Badge>
                                    )
                                    : (
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
                                    theme === "dark"
                                      ? "text-slate-400"
                                      : "text-slate-600"
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
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${colorClass}`}
                              >
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
              )}
          </CardContent>
        </Card>

        {/* Right Column: Selected Day Details */}
        <Card
          className={`lg:col-span-4 flex flex-col ${
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <CardHeader
            className={`pb-3 border-b flex flex-row items-center justify-between ${
              theme === "dark" ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <div>
              <CardTitle
                className={`text-sm font-bold flex items-center gap-2 ${
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
                {(byDate.get(selectedDay) ?? []).length} Kayıtlı Etkinlik
              </CardDescription>
            </div>

            <Button
              size="sm"
              onClick={onOpenNewReservationModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] h-7 px-2.5 font-semibold"
            >
              <Plus className="h-3 w-3 mr-1" /> Yeni Kayıt
            </Button>
          </CardHeader>

          <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[550px]">
            {(byDate.get(selectedDay) ?? []).length === 0
              ? (
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
              )
              : (
                (byDate.get(selectedDay) ?? []).map((r) => {
                  const h = hallById(r.hallId);
                  const v = store.venues.find((x) => x.id === r.venueId);
                  const rem = r.price - r.paid;
                  const colorClass = getEventTypeColor(r.eventType);

                  return (
                    <div
                      key={r.id}
                      onClick={() => onSelectReservation(r)}
                      className={`p-4 rounded-xl border space-y-3 cursor-pointer transition-all ${
                        theme === "dark"
                          ? "bg-slate-950 border-slate-800 hover:bg-slate-800/40"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                theme === "dark"
                                  ? "text-slate-100"
                                  : "text-slate-900"
                              }`}
                            >
                              {r.customer}
                            </h4>
                            {r.status === "option"
                              ? (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 bg-amber-500/10 border-amber-500/40 text-amber-500 font-bold"
                                >
                                  ⚠️ Şerhli (Opsiyon)
                                </Badge>
                              )
                              : (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 bg-emerald-500/10 border-emerald-500/40 text-emerald-500 font-semibold"
                                >
                                  ✅ Kesin
                                </Badge>
                              )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${colorClass}`}
                            >
                              {r.eventType || "Etkinlik"}
                            </Badge>
                            <span
                              className={`text-[11px] font-mono ${
                                theme === "dark"
                                  ? "text-slate-400"
                                  : "text-slate-500"
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
                          className="h-7 w-7 text-slate-500 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div
                        className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                          theme === "dark"
                            ? "bg-slate-900/80 border-slate-800"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`font-medium ${
                              theme === "dark"
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {v?.name}
                          </span>
                          <span className="text-indigo-500 font-semibold">
                            {h?.name}
                          </span>
                        </div>
                        <div
                          className={`text-[11px] flex justify-between items-center border-t pt-1 ${
                            theme === "dark"
                              ? "border-slate-800 text-slate-400"
                              : "border-slate-100 text-slate-600"
                          }`}
                        >
                          <span>Saat Aralığı:</span>
                          <span className="font-mono font-semibold text-emerald-500">
                            {r.start} - {r.end} ({hoursBetween(r.start, r.end)}
                            {" "}
                            Saat)
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-0.5">
                          <span
                            className={theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-600"}
                          >
                            Finansal Durum:
                          </span>
                          <span className="font-bold text-emerald-500">
                            {money(r.price)}
                          </span>
                        </div>
                        {rem > 0 && (
                          <div className="flex justify-between items-center text-[10px] text-amber-500 font-semibold">
                            <span>Kalan Bakiye:</span>
                            <span>{money(rem)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPrintOfficialDoc(r)}
                          className={`flex-1 text-xs h-7.5 px-2 font-medium ${
                            theme === "dark"
                              ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                              : "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                          }`}
                          title="Resmi Tahsis Belgesi & Rapor Yazdır"
                        >
                          <Printer className="h-3 w-3 mr-1 text-emerald-500" />
                          Resmi Belge
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCopySMS(r)}
                          className={`flex-1 text-xs h-7.5 px-2 ${
                            theme === "dark"
                              ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                              : "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          <Copy className="h-3 w-3 mr-1 text-amber-500" />{" "}
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onQuickMail(r)}
                          className={`flex-1 text-xs h-7.5 px-2 ${
                            theme === "dark"
                              ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                              : "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          <Mail className="h-3 w-3 mr-1 text-sky-500" /> E-posta
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
