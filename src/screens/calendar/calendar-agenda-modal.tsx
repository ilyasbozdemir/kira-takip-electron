import React from "react";
import {
  Calendar as CalendarIcon,
  ExternalLink,
  Mail,
  Plus,
  Printer,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  hoursBetween,
  money,
  type Reservation,
  type Venue,
} from "@/lib/rental-store";

interface CalendarAgendaModalProps {
  theme: "dark" | "light";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: string;
  dayReservations: Reservation[];
  venues: Venue[];
  hallById: (id: string) => { name: string; color?: string } | undefined;
  getEventTypeColor: (type?: string) => string;
  onOpenNewReservationModal: () => void;
  onSelectReservation: (r: Reservation) => void;
  onPrintOfficialDoc: (r: Reservation) => void;
  onQuickMail: (r: Reservation) => void;
  onNavigateToCustomer?: (customerName: string) => void;
}

export const CalendarAgendaModal: React.FC<CalendarAgendaModalProps> = ({
  theme,
  isOpen,
  onOpenChange,
  selectedDay,
  dayReservations,
  venues,
  hallById,
  getEventTypeColor,
  onOpenNewReservationModal,
  onSelectReservation,
  onPrintOfficialDoc,
  onQuickMail,
  onNavigateToCustomer,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                onOpenChange(false);
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
                  {dayReservations.filter((r) => r.status !== "option").length}{" "}
                  Kesin{" "}
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">
                    •{" "}
                    {dayReservations.filter((r) => r.status === "option").length}{" "}
                    Ops.
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
                  {money(
                    dayReservations.reduce(
                      (acc, curr) => acc + (curr.price || 0),
                      0,
                    ),
                  )}
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
                  {money(
                    dayReservations.reduce(
                      (acc, curr) => acc + (curr.paid || 0),
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Modal Main Content: Full-width Table View */}
        <div className="flex-1 overflow-y-auto py-2 pr-1">
          {dayReservations.length === 0 ? (
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
                  onOpenChange(false);
                  onOpenNewReservationModal();
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4 font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Hemen Etkinlik Oluştur
              </Button>
            </div>
          ) : (
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
                    const v = venues.find((x) => x.id === r.venueId);
                    const colorClass = getEventTypeColor(r.eventType);
                    const rem = (r.price || 0) - (r.paid || 0);

                    return (
                      <tr
                        key={r.id}
                        onClick={() => {
                          onOpenChange(false);
                          onSelectReservation(r);
                        }}
                        className={`cursor-pointer transition-colors group ${
                          theme === "dark"
                            ? "hover:bg-slate-800/50 bg-slate-900/40"
                            : "hover:bg-indigo-50/60 bg-white"
                        }`}
                      >
                        <td className="p-3 whitespace-nowrap">
                          {r.status === "option" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 font-bold"
                            >
                              ⚠️ Opsiyon
                            </Badge>
                          ) : (
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
                                  onOpenChange(false);
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
                                onOpenChange(false);
                                onSelectReservation(r);
                              }}
                              className="h-7 px-2.5 text-[11px] font-bold border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" /> Detay
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
  );
};
