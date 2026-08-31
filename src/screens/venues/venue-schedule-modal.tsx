import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Layers,
  MapPin,
  Plus,
  Search,
  User,
  Users,
  Building2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { money, type Hall, type Reservation, type Venue } from "@/lib/rental-store";

interface VenueScheduleModalProps {
  theme: "dark" | "light";
  venue: Venue | null;
  reservations: Reservation[];
  onClose: () => void;
  onOpenNewReservation: (venueId: string, hallId?: string) => void;
  onNavigateToCalendar?: (venueId: string) => void;
  initialHallId?: string;
}

export const VenueScheduleModal: React.FC<VenueScheduleModalProps> = ({
  theme,
  venue,
  reservations,
  onClose,
  onOpenNewReservation,
  onNavigateToCalendar,
  initialHallId,
}) => {
  const isDark = theme === "dark";
  const [selectedHallId, setSelectedHallId] = useState<string>(initialHallId || "all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sync initialHallId if changed
  React.useEffect(() => {
    if (initialHallId) {
      setSelectedHallId(initialHallId);
    } else {
      setSelectedHallId("all");
    }
  }, [initialHallId, venue]);

  // Filter reservations for this venue (Always call hooks unconditionally)
  const venueReservations = useMemo(() => {
    if (!venue) return [];
    return reservations
      .filter((r) => r.venueId === venue.id)
      .filter((r) => (selectedHallId === "all" ? true : r.hallId === selectedHallId))
      .filter((r) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          (r.customer || "").toLowerCase().includes(q) ||
          (r.eventType || "").toLowerCase().includes(q) ||
          (r.phone && r.phone.includes(q)) ||
          (r.date || "").includes(q)
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }, [reservations, venue?.id, selectedHallId, searchTerm]);

  // Statistics for this venue
  const stats = useMemo(() => {
    if (!venue) return { total: 0, confirmed: 0, revenue: 0, collected: 0 };
    const allForVenue = reservations.filter((r) => r.venueId === venue.id);
    const confirmedCount = allForVenue.filter((r) => r.status === "confirmed").length;
    const totalRev = allForVenue.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
    const totalCollected = allForVenue.reduce((sum, r) => sum + (Number(r.paid) || 0), 0);
    return {
      total: allForVenue.length,
      confirmed: confirmedCount,
      revenue: totalRev,
      collected: totalCollected,
    };
  }, [reservations, venue?.id]);

  const getHall = (hId: string): Hall | undefined => {
    return venue?.halls?.find((h) => h.id === hId);
  };

  if (!venue) return null;

  return (
    <Dialog open={!!venue} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        {/* Header */}
        <DialogHeader className={`p-4 border-b shrink-0 ${isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-100 bg-slate-50/80"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                }`}
              >
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base font-extrabold tracking-tight truncate">
                    {venue.name}
                  </DialogTitle>
                  {venue.category && (
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {venue.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-rose-500" /> {venue.district}
                  </span>
                  <span>•</span>
                  <span>{venue.halls.length} Tanımlı Salon</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onNavigateToCalendar && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onNavigateToCalendar(venue.id);
                  }}
                  className="h-8 text-xs font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Takvim Sayfası
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenNewReservation(venue.id, selectedHallId !== "all" ? selectedHallId : undefined);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Yeni Rezervasyon
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 pt-3">
            <div className={`p-2 rounded-lg border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
              <span className="text-[10px] text-slate-400 block font-semibold">Toplam Etkinlik</span>
              <span className="text-sm font-black text-indigo-400">{stats.total} adet</span>
            </div>
            <div className={`p-2 rounded-lg border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
              <span className="text-[10px] text-slate-400 block font-semibold">Onaylı Seans</span>
              <span className="text-sm font-black text-emerald-400">{stats.confirmed} adet</span>
            </div>
            <div className={`p-2 rounded-lg border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
              <span className="text-[10px] text-slate-400 block font-semibold">Toplam Ciro</span>
              <span className="text-sm font-black text-amber-400">{money(stats.revenue)}</span>
            </div>
            <div className={`p-2 rounded-lg border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
              <span className="text-[10px] text-slate-400 block font-semibold">Tahsil Edilen</span>
              <span className="text-sm font-black text-sky-400">{money(stats.collected)}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Hall Filter Tabs & Search Filter */}
        <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${isDark ? "border-slate-800 bg-slate-950/30" : "border-slate-100 bg-slate-50/50"}`}>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 pr-2">
            <button
              type="button"
              onClick={() => setSelectedHallId("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedHallId === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark
                  ? "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                  : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Tüm Salonlar ({venue.halls.length})
            </button>
            {venue.halls.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedHallId(h.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedHallId === h.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isDark
                    ? "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                    : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: h.color || "#6366f1" }}
                />
                <span className="truncate max-w-30">{h.name}</span>
              </button>
            ))}
          </div>

          <div className="relative w-48 shrink-0">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Etkinlik veya müşteri ara..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Schedule List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {venueReservations.length === 0 ? (
            <div className={`p-10 text-center rounded-2xl border ${isDark ? "bg-slate-950/40 border-slate-800 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
              <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-40 text-indigo-400" />
              <p className="text-sm font-bold text-slate-300">
                {searchTerm || selectedHallId !== "all" ? "Aramaya uygun rezervasyon bulunamadı." : "Bu mekana ait kayıtlı etkinlik / rezervasyon bulunmuyor."}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenNewReservation(venue.id, selectedHallId !== "all" ? selectedHallId : undefined);
                }}
                className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> İlk Etkinliği Tanımla
              </Button>
            </div>
          ) : (
            venueReservations.map((r) => {
              const hall = getHall(r.hallId);
              const remaining = (Number(r.price) || 0) - (Number(r.paid) || 0);
              const isPaidFull = Number(r.price) > 0 && remaining <= 0;

              return (
                <div
                  key={r.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800/90 hover:border-slate-700"
                      : "bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs"
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                      >
                        📅 {r.date}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-800/60 text-slate-300 border-slate-700"
                      >
                        <Clock className="h-3 w-3 mr-1 text-slate-400" /> {r.start} - {r.end}
                      </Badge>
                      {hall && (
                        <span className="text-xs font-extrabold flex items-center gap-1 text-slate-200">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: hall.color || "#6366f1" }}
                          />
                          {hall.name}
                        </span>
                      )}
                      <Badge
                        className={`text-[9px] font-bold ${
                          r.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : r.status === "option"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {r.status === "confirmed" ? "Onaylı" : r.status === "option" ? "Opsiyon" : "İptal"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="font-extrabold text-sm text-slate-100">
                        {r.customer}
                      </span>
                      <span className="text-xs text-indigo-400 font-semibold">
                        • {r.eventType}
                      </span>
                    </div>

                    {r.note && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1">
                        📝 {r.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div>
                      <span className="text-xs font-mono font-black text-slate-100 block">
                        {money(r.price)}
                      </span>
                      <span className={`text-[10px] font-bold block ${isPaidFull ? "text-emerald-400" : remaining > 0 ? "text-amber-400" : "text-slate-400"}`}>
                        {isPaidFull ? "✓ Ödendi" : remaining > 0 ? `Kalan: ${money(remaining)}` : "Ücretsiz"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
