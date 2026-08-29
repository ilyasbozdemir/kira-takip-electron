import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Mail,
  Printer,
  Trash2,
  User,
  UserCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { money, type Reservation, type Venue } from "@/lib/rental-store";

interface EventsScreenProps {
  theme: "dark" | "light";
  eventTypeFilter: string;
  setEventTypeFilter: (v: string) => void;
  allEventTypes: string[];
  filteredReservations: Reservation[];
  store: {
    venues: Venue[];
    personnel?: Array<{ id: string; name: string; title?: string; phone?: string; email?: string }>;
  };
  hallById: (id: string) => { name: string } | undefined;
  onPromptDelete: (type: "reservation", id: string, title: string) => void;
  onPrintOfficialDoc?: (r: Reservation) => void;
  onQuickMail?: (r: Reservation) => void;
  onQuickStaffMail?: (r: Reservation, staffEmail?: string, staffName?: string) => void;
  onNavigateToCustomer?: (customerName: string) => void;
}

export function EventsScreen({
  theme,
  eventTypeFilter,
  setEventTypeFilter,
  allEventTypes,
  filteredReservations,
  store,
  hallById,
  onPromptDelete,
  onPrintOfficialDoc,
  onQuickMail,
  onQuickStaffMail,
  onNavigateToCustomer,
}: EventsScreenProps): React.JSX.Element {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Mail Status Filter State
  const [mailStatusFilter, setMailStatusFilter] = useState<
    "all" | "customer_sent" | "customer_unsent" | "staff_sent" | "staff_unsent"
  >("all");

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [eventTypeFilter, mailStatusFilter, filteredReservations.length]);

  const filteredByMailStatus = useMemo(() => {
    return filteredReservations.filter((r) => {
      if (mailStatusFilter === "customer_sent") return Boolean(r.customerMailSentAt || r.mailSentAt);
      if (mailStatusFilter === "customer_unsent") return !(r.customerMailSentAt || r.mailSentAt);
      if (mailStatusFilter === "staff_sent") return Boolean(r.staffMailSentAt);
      if (mailStatusFilter === "staff_unsent") return !r.staffMailSentAt;
      return true;
    });
  }, [filteredReservations, mailStatusFilter]);

  const totalItems = filteredByMailStatus.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedReservations = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredByMailStatus.slice(start, start + pageSize);
  }, [filteredByMailStatus, safePage, pageSize]);

  return (
    <Card
      className={theme === "dark"
        ? "bg-slate-900/80 border-slate-800"
        : "bg-white border-slate-200 shadow-sm"}
    >
      <CardHeader
        className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <CardTitle
            className={`text-base font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Etkinlik & Rezervasyon Listesi
          </CardTitle>
          <CardDescription
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Filtreleme, arama, e-posta durumu ve sayfalama ile tüm etkinlik kayıtları.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Sayfa Başına:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger
                className={`w-[75px] text-xs h-8 ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-200"
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
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mail Status Filter */}
          <Select
            value={mailStatusFilter}
            onValueChange={(val) => setMailStatusFilter(val as any)}
          >
            <SelectTrigger
              className={`w-[185px] text-xs h-8 ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <SelectValue placeholder="Mail Gönderim Durumu" />
            </SelectTrigger>
            <SelectContent
              className={theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-900"}
            >
              <SelectItem value="all">✉️ Tüm Mail Durumları</SelectItem>
              <SelectItem value="customer_sent">👤 Müşteriye Mail Gönderilenler</SelectItem>
              <SelectItem value="customer_unsent">👤 Müşteriye Mail Bekleyenler</SelectItem>
              <SelectItem value="staff_sent">👷 Görevliye Mail Gönderilenler</SelectItem>
              <SelectItem value="staff_unsent">👷 Görevliye Mail Bekleyenler</SelectItem>
            </SelectContent>
          </Select>

          {/* Event Type Filter */}
          <Select
            value={eventTypeFilter}
            onValueChange={setEventTypeFilter}
          >
            <SelectTrigger
              className={`w-[180px] text-xs h-8 ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <SelectValue placeholder="Etkinlik Türü" />
            </SelectTrigger>
            <SelectContent
              className={theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-900"}
            >
              <SelectItem value="all">
                Tüm Etkinlik Türleri
              </SelectItem>
              {allEventTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table
          className={`w-full text-left text-xs ${
            theme === "dark" ? "text-slate-300" : "text-slate-800"
          }`}
        >
          <thead
            className={`uppercase font-mono text-[11px] border-b ${
              theme === "dark"
                ? "bg-slate-950 text-slate-400 border-slate-800"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <tr>
              <th className="p-3.5">Durum</th>
              <th className="p-3.5">Müşteri / İletişim</th>
              <th className="p-3.5">Tarih & Saat</th>
              <th className="p-3.5">Mekan / Salon</th>
              <th className="p-3.5">Tür</th>
              <th className="p-3.5 text-right">Toplam</th>
              <th className="p-3.5 text-right">Ödenen</th>
              <th className="p-3.5 text-center">İşlemler & Bildirim</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              theme === "dark" ? "divide-slate-800/60" : "divide-slate-200"
            }`}
          >
            {paginatedReservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  Bu kritere uygun kayıtlı etkinlik bulunamadı.
                </td>
              </tr>
            ) : (
              paginatedReservations.map((r) => {
                const h = hallById(r.hallId);
                const v = store.venues.find((x) => x.id === r.venueId);

                return (
                  <tr
                    key={r.id}
                    className={`transition-colors ${
                      theme === "dark"
                        ? "hover:bg-slate-800/30"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3.5 font-bold space-y-1">
                      <div>
                        {r.status === "option" ? (
                          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/40 text-amber-500 text-[9px] font-bold">
                            ⚠️ Opsiyon
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/40 text-emerald-500 text-[9px] font-bold">
                            ✅ Kesin
                          </Badge>
                        )}
                      </div>
                      {r.mailSentAt ? (
                        <Badge
                          variant="outline"
                          className="bg-sky-500/10 border-sky-500/40 text-sky-400 text-[9px] font-semibold flex items-center gap-1 w-fit"
                          title={`Alıcı: ${r.mailSentTo || "Alıcı"} | Zaman: ${r.mailSentAt}`}
                        >
                          ✉️ Mail Gönderildi
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[9px] flex items-center gap-1 w-fit"
                          title="Bu kiralama kaydı için henüz e-posta bildirimi gönderilmedi."
                        >
                          ⚠️ Mail Bekliyor
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold block ${
                          theme === "dark" ? "text-slate-200" : "text-slate-900"
                        }`}
                      >
                        {r.customer}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-mono ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                          📞 {r.phone}
                        </span>
                        {onNavigateToCustomer && (
                          <button
                            type="button"
                            onClick={() => onNavigateToCustomer(r.customer)}
                            className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5 font-medium"
                            title="Müşteri CRM Profiline Git"
                          >
                            <User className="h-2.5 w-2.5" /> Profil
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="font-bold">📅 {r.date}</div>
                      <div
                        className={`text-[11px] ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        ⏰ {r.start} - {r.end}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium">{v?.name || "Mekan"}</span>
                      <span className="text-indigo-500 block font-semibold text-[11px]">
                        🏛️ {h?.name || "Salon"}
                      </span>
                      {v?.managerName && (
                        <span className="text-[10px] text-slate-400 block mt-0.5" title={`İletişim: ${v.managerPhone || "-"}`}>
                          👷 Görevli: {v.managerName}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-500 text-[10px]"
                      >
                        {r.eventType || "Etkinlik"}
                      </Badge>
                    </td>
                    <td
                      className={`p-3.5 text-right font-bold ${
                        theme === "dark" ? "text-slate-200" : "text-slate-900"
                      }`}
                    >
                      {money(r.price)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-500">
                      {money(r.paid)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {/* Müşteri Mail Button */}
                        {onQuickMail && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onQuickMail(r)}
                            className="h-7 w-7 text-sky-400 hover:bg-sky-500/10"
                            title="Müşteriye E-posta & .ics Takvim Daveti Gönder"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Mekan Görevlisine Mail Button */}
                        {onQuickStaffMail && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const staffEmail = v?.managerPhone || "gorevli@tesis.bel.tr";
                              onQuickStaffMail(r, staffEmail, v?.managerName || "Mekan Görevlisi");
                            }}
                            className="h-7 w-7 text-indigo-400 hover:bg-indigo-500/10"
                            title="Mekan Görevlisine / Sorumlusuna Görev Maili Gönder"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Resmi Evrak Basım Button */}
                        {onPrintOfficialDoc && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onPrintOfficialDoc(r)}
                            className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10"
                            title="Resmi Tahsis Belgesi & Makbuz Bas"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Sil Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            onPromptDelete(
                              "reservation",
                              r.id,
                              `${r.customer} (${r.date})`,
                            )}
                          className="h-7 w-7 text-slate-500 hover:text-rose-500"
                          title="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div
            className={`p-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
              theme === "dark"
                ? "bg-slate-950/60 border-slate-800 text-slate-400"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <div>
              Toplam <strong className="text-indigo-400">{totalItems}</strong> kayıttan{" "}
              <strong>{(safePage - 1) * pageSize + 1}</strong> -{" "}
              <strong>{Math.min(safePage * pageSize, totalItems)}</strong> arası gösteriliyor.
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">
                Sayfa {safePage} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Önceki
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5"
              >
                Sonraki <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
