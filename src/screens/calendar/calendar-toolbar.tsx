import React from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Grid as GridIcon,
  Plus,
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
import { toast } from "sonner";
import { toKey, trMonths, type Venue } from "@/lib/rental-store";

interface CalendarToolbarProps {
  theme: "dark" | "light";
  cursor: Date;
  setCursor: (d: Date) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  calendarViewMode: "grid" | "timeline";
  setCalendarViewMode: (mode: "grid" | "timeline") => void;
  calendarVenueFilter: string;
  setCalendarVenueFilter: (v: string) => void;
  venues: Venue[];
  today: Date;
  workingYear?: string;
  setWorkingYear?: (y: string) => void;
  onOpenExportModal?: () => void;
  onOpenNewReservationModal: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  theme,
  cursor,
  setCursor,
  selectedDay,
  setSelectedDay,
  calendarViewMode,
  setCalendarViewMode,
  calendarVenueFilter,
  setCalendarVenueFilter,
  venues,
  today,
  workingYear = "2026",
  setWorkingYear,
  onOpenExportModal,
  onOpenNewReservationModal,
}) => {
  return (
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
              new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
            )}
          title="Önceki Ay"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Month Dropdown */}
        <Select
          value={String(cursor.getMonth())}
          onValueChange={(val) =>
            setCursor(new Date(cursor.getFullYear(), Number(val), 1))}
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
            setCursor(new Date(Number(val), cursor.getMonth(), 1))}
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
            {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
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
              new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
            )}
          title="Sonraki Ay"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
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
          type="button"
          onClick={() => setCalendarViewMode("grid")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
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
          type="button"
          onClick={() => setCalendarViewMode("timeline")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
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
            {venues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onOpenExportModal && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenExportModal}
            className={`text-xs h-8 font-semibold px-2.5 gap-1.5 cursor-pointer ${
              theme === "dark"
                ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30"
                : "border-emerald-600/30 text-emerald-700 hover:bg-emerald-50"
            }`}
            title="Mekan ve salon bazlı kurumsal Excel (.xlsx) veya resmi PDF raporu oluştur"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Rapor / Excel</span>
          </Button>
        )}

        <Button
          size="sm"
          onClick={onOpenNewReservationModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold px-3 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Etkinlik Ekle
        </Button>
      </div>
    </div>
  );
};
