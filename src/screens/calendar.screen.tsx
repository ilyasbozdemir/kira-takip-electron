import React, { useState } from "react";
import {
  Banknote,
  Building,
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Grid as GridIcon,
  LayoutGrid,
  List,
  Mail,
  Maximize2,
  Phone,
  Plus,
  Printer,
  Table as TableIcon,
  Trash2,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
  onNavigateToCustomer?: (customerName: string) => void;
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
  onNavigateToCustomer,
}: CalendarScreenProps): React.JSX.Element {
  const [rightPanelViewMode, setRightPanelViewMode] = useState<
    "list" | "timeline" | "table" | "cards"
  >("list");
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
  const dayReservations = byDate.get(selectedDay) ?? [];
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

                      const dayButton = (
                        <button
                          key={k}
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
                                  title={`${r.customer} ${
                                    isOption
                                      ? "[Şerhli / Opsiyonlu]"
                                      : "[Kesin]"
                                  } (${r.start} - ${h?.name})`}
                                >
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0 shadow-xs"
                                    style={{
                                      backgroundColor: isOption
                                        ? "#f59e0b"
                                        : customColor,
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
                                const v = store.venues.find((x) =>
                                  x.id === r.venueId
                                );
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
                                      <span className="truncate">
                                        {r.customer}
                                      </span>
                                      {r.status === "option"
                                        ? (
                                          <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                                            ⚠️ Opsiyon
                                          </span>
                                        )
                                        : (
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
                                <Plus className="h-3 w-3 mr-1" />{" "}
                                Bu Güne Etkinlik Ekle
                              </Button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
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
                  onClick={() => setIsExpandedModalOpen(true)}
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

            {/* Right Panel View Selector Tabs */}
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
              : rightPanelViewMode === "list"
              ? (
                /* VIEW MODE 1: MODERN MULTI-ROW FERAH LİSTE */
                <div className="space-y-2.5">
                  {dayReservations.map((r) => {
                    const h = hallById(r.hallId);
                    const v = store.venues.find((x) => x.id === r.venueId);
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
                        {/* Top Row: Customer Name & Status Badge */}
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
                          {r.status === "option"
                            ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 font-bold shrink-0"
                              >
                                ⚠️ Opsiyon
                              </Badge>
                            )
                            : (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold shrink-0"
                              >
                                ✅ Kesin
                              </Badge>
                            )}
                        </div>

                        {/* Middle Meta Block: Time, Event Type Badge, Venue/Hall, Price */}
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

                        {/* Bottom Row: Actions */}
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
                                {" "}
                                Profil
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
              )
              : rightPanelViewMode === "timeline"
              ? (
                /* VIEW MODE 2: GOOGLE CALENDAR HOURLY DAY TIMELINE VIEW */
                <div className="space-y-1 relative pl-12 pr-1 py-2 font-mono">
                  {[
                    "08:00",
                    "09:00",
                    "10:00",
                    "11:00",
                    "12:00",
                    "13:00",
                    "14:00",
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                    "19:00",
                    "20:00",
                    "21:00",
                    "22:00",
                    "23:00",
                  ].map((hourStr) => {
                    const hourInt = parseInt(hourStr.split(":")[0], 10);

                    // Find reservations spanning this hour
                    const activeReservations = (byDate.get(selectedDay) ?? [])
                      .filter((r) => {
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
                              const isStartHour =
                                parseInt(r.start.split(":")[0], 10) === hourInt;
                              if (!isStartHour) return null; // Render event banner at its start hour slot

                              const h = hallById(r.hallId);
                              const v = store.venues.find((x) =>
                                x.id === r.venueId
                              );

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
                                      {" "}
                                      {r.customer}
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
              )
              : rightPanelViewMode === "table"
              ? (
                /* VIEW MODE 3: VERİ TABLOSU GÖRÜNÜMÜ */
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
                      {(byDate.get(selectedDay) ?? []).map((r) => {
                        const h = hallById(r.hallId);
                        const v = store.venues.find((x) => x.id === r.venueId);
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
                              {r.status === "option"
                                ? (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                    ⚠️ Opsiyon
                                  </span>
                                )
                                : (
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
                                  <User className="h-2.5 w-2.5" />{" "}
                                  Müşteri Profili
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
              )
              : (
                /* VIEW MODE 4: DETAILED CARDS */
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
                            {r.status === "option"
                              ? (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold"
                                >
                                  ⚠️ Şerhli (Opsiyon)
                                </Badge>
                              )
                              : (
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
                            {r.start} - {r.end} ({hoursBetween(r.start, r.end)}
                            {" "}
                            Saat)
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
                          <Printer className="h-3 w-3 mr-1 text-emerald-600" />
                          {" "}
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
                          <Copy className="h-3 w-3 mr-1 text-amber-600" />{" "}
                          WhatsApp
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
      </div>

      {/* Expanded Full-Screen Day Agenda Modal */}
      <Dialog open={isExpandedModalOpen} onOpenChange={setIsExpandedModalOpen}>
        <DialogContent
          className={`sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-6 rounded-2xl ${
            theme === "dark"
              ? "bg-slate-900 border-slate-800 text-slate-100 shadow-2xl"
              : "bg-white border-slate-200 text-slate-900 shadow-2xl"
          }`}
        >
          <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <DialogTitle
                  className={`text-lg font-black flex items-center gap-2 ${
                    theme === "dark" ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  <CalendarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    {selectedDay} Tarihli Günlük Etkinlik & Tahsis Ajandası
                  </span>
                  <Badge className="bg-indigo-600 text-white text-xs px-2 py-0.5 font-bold ml-1">
                    {dayReservations.length} Kayıt
                  </Badge>
                </DialogTitle>
                <DialogDescription
                  className={`text-xs ${
                    theme === "dark"
                      ? "text-slate-400"
                      : "text-slate-600 font-medium"
                  }`}
                >
                  Bu tarihe ait tüm salon kiralama, randevu, finansal döküm ve
                  müşteri tahsis detayları
                </DialogDescription>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setIsExpandedModalOpen(false);
                  onOpenNewReservationModal();
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-bold px-3.5 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Bu Güne Yeni Kayıt Ekle
              </Button>
            </div>

            {/* Quick KPI Stats Summary Bar */}
            {dayReservations.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    theme === "dark"
                      ? "bg-slate-950/70 border-slate-800/80"
                      : "bg-slate-50 border-slate-200 shadow-2xs"
                  }`}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider block ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Toplam Etkinlik
                  </span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {dayReservations.length} Adet
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    theme === "dark"
                      ? "bg-slate-950/70 border-slate-800/80"
                      : "bg-slate-50 border-slate-200 shadow-2xs"
                  }`}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider block ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Kesin / Opsiyon
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {dayReservations.filter((r) => r.status !== "option")
                      .length} Kesin{" "}
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">
                      • {dayReservations.filter((r) =>
                        r.status === "option"
                      ).length} Ops.
                    </span>
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    theme === "dark"
                      ? "bg-slate-950/70 border-slate-800/80"
                      : "bg-slate-50 border-slate-200 shadow-2xs"
                  }`}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider block ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Toplam Ciro / Tutar
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {money(dayReservations.reduce((acc, curr) =>
                      acc + (curr.price || 0), 0))}
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    theme === "dark"
                      ? "bg-slate-950/70 border-slate-800/80"
                      : "bg-slate-50 border-slate-200 shadow-2xs"
                  }`}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider block ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Tahsil Edilen
                  </span>
                  <span className="text-lg font-black text-sky-600 dark:text-sky-400 font-mono">
                    {money(dayReservations.reduce((acc, curr) =>
                      acc + (curr.paid || 0), 0))}
                  </span>
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Modal Main Content: Full-width Table View */}
          <div className="flex-1 overflow-y-auto py-2 pr-1">
            {dayReservations.length === 0
              ? (
                <div className="text-center py-16 space-y-3">
                  <CalendarIcon className="h-12 w-12 mx-auto text-slate-400 opacity-50" />
                  <h4
                    className={`font-bold text-sm ${
                      theme === "dark" ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    Bu gün için herhangi bir etkinlik kaydı bulunmuyor.
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsExpandedModalOpen(false);
                      onOpenNewReservationModal();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4 font-bold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Hemen Etkinlik Oluştur
                  </Button>
                </div>
              )
              : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr
                        className={`border-b text-[11px] uppercase font-black tracking-wider ${
                          theme === "dark"
                            ? "bg-slate-950 text-slate-300 border-slate-800"
                            : "bg-slate-100 text-slate-900 border-slate-300"
                        }`}
                      >
                        <th className="p-3">Durum</th>
                        <th className="p-3">Müşteri / Kurum</th>
                        <th className="p-3">Mekan & Salon</th>
                        <th className="p-3">Zaman Aralığı</th>
                        <th className="p-3">Etkinlik Türü</th>
                        <th className="p-3 text-right">Tutar / Tahsilat</th>
                        <th className="p-3 text-center">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${
                        theme === "dark"
                          ? "divide-slate-800/70"
                          : "divide-slate-200"
                      }`}
                    >
                      {dayReservations.map((r) => {
                        const h = hallById(r.hallId);
                        const v = store.venues.find((x) => x.id === r.venueId);
                        const colorClass = getEventTypeColor(r.eventType);
                        const rem = (r.price || 0) - (r.paid || 0);

                        return (
                          <tr
                            key={r.id}
                            onClick={() => {
                              setIsExpandedModalOpen(false);
                              onSelectReservation(r);
                            }}
                            className={`cursor-pointer transition-colors group ${
                              theme === "dark"
                                ? "hover:bg-slate-800/50 bg-slate-900/40"
                                : "hover:bg-indigo-50/60 bg-white"
                            }`}
                          >
                            <td className="p-3 whitespace-nowrap">
                              {r.status === "option"
                                ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 font-bold"
                                  >
                                    ⚠️ Opsiyon
                                  </Badge>
                                )
                                : (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold"
                                  >
                                    ✅ Kesinleşti
                                  </Badge>
                                )}
                            </td>

                            <td className="p-3">
                              <div
                                className={`font-black text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                                  theme === "dark"
                                    ? "text-slate-100"
                                    : "text-slate-900"
                                }`}
                              >
                                {r.customer}
                              </div>
                              {r.phone && (
                                <div
                                  className={`text-[11px] font-mono font-bold flex items-center gap-1 mt-0.5 ${
                                    theme === "dark"
                                      ? "text-slate-400"
                                      : "text-slate-600"
                                  }`}
                                >
                                  📞 {r.phone}
                                </div>
                              )}
                            </td>

                            <td className="p-3">
                              <div
                                className={`font-black text-xs ${
                                  theme === "dark"
                                    ? "text-slate-200"
                                    : "text-slate-900"
                                }`}
                              >
                                {v?.name || "Mekan"}
                              </div>
                              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                                📍 {h?.name || "Salon"}
                              </div>
                            </td>

                            <td className="p-3 whitespace-nowrap font-mono">
                              <div
                                className={`font-black text-xs ${
                                  theme === "dark"
                                    ? "text-slate-100"
                                    : "text-slate-900"
                                }`}
                              >
                                ⏰ {r.start} - {r.end}
                              </div>
                              <div
                                className={`text-[10px] font-semibold ${
                                  theme === "dark"
                                    ? "text-slate-400"
                                    : "text-slate-500"
                                }`}
                              >
                                ({hoursBetween(r.start, r.end)} Saat)
                              </div>
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-black ${colorClass}`}
                              >
                                {r.eventType || "Etkinlik"}
                              </Badge>
                            </td>

                            <td className="p-3 text-right whitespace-nowrap font-mono">
                              <div className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                {money(r.price)}
                              </div>
                              <div
                                className={`text-[10px] font-medium ${
                                  theme === "dark"
                                    ? "text-slate-400"
                                    : "text-slate-600"
                                }`}
                              >
                                Ödenen:{" "}
                                <span className="text-sky-600 dark:text-sky-400 font-bold">
                                  {money(r.paid)}
                                </span>
                              </div>
                              {rem > 0 && (
                                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                  Kalan: {money(rem)}
                                </div>
                              )}
                            </td>

                            <td
                              className="p-3 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {onNavigateToCustomer && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setIsExpandedModalOpen(false);
                                      onNavigateToCustomer(r.customer);
                                    }}
                                    className="h-7 w-7 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                                    title="Müşteri Profili & Geçmiş Kayıtlara Git"
                                  >
                                    <User className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => onPrintOfficialDoc(r)}
                                  className="h-7 w-7 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                  title="Resmi Belge Yazdır"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => onQuickMail(r)}
                                  className="h-7 w-7 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10"
                                  title="E-posta & .ics Gönder"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setIsExpandedModalOpen(false);
                                    onSelectReservation(r);
                                  }}
                                  className="h-7 px-2.5 text-[11px] font-bold border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />{" "}
                                  Detay
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
