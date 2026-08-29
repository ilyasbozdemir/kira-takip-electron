import React, { useState, useEffect, useMemo } from "react";
import { Trash2, Mail, Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, Users, Send, FileSpreadsheet, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
    personnel?: Array<{
      id: string;
      name: string;
      title?: string;
      phone?: string;
      email?: string;
    }>;
  };
  hallById: (id: string) => { name: string } | undefined;
  onPromptDelete: (type: "reservation", id: string, title: string) => void;
  onQuickMail?: (res: Reservation) => void;
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
  onQuickMail,
}: EventsScreenProps): React.JSX.Element {
  // Date Filtering State
  const [dateFrame, setDateFrame] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sent Mail Tracker Log State
  const [sentLogs, setSentLogs] = useState<Record<string, { sentAt: string; recipient: string }>>({});

  // Staff Batch Mail Dispatch Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [customStaffEmail, setCustomStaffEmail] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("venue-keeper-sent-mails-log");
      if (saved) {
        setSentLogs(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Filter reservations by Date Frame
  const dateFilteredReservations = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    return filteredReservations.filter((r) => {
      if (dateFrame === "all") return true;

      if (dateFrame === "today") {
        return r.date === todayStr;
      }

      if (dateFrame === "week") {
        const resDate = new Date(r.date);
        const diffTime = resDate.getTime() - now.getTime();
        const diffDays = Math.abs(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        return diffDays <= 7;
      }

      if (dateFrame === "month") {
        const resDate = new Date(r.date);
        return resDate.getMonth() === now.getMonth() && resDate.getFullYear() === now.getFullYear();
      }

      if (dateFrame === "custom") {
        if (customStart && r.date < customStart) return false;
        if (customEnd && r.date > customEnd) return false;
        return true;
      }

      return true;
    });
  }, [filteredReservations, dateFrame, customStart, customEnd]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [eventTypeFilter, dateFrame, customStart, customEnd, itemsPerPage]);

  // Pagination Calculations
  const totalItems = dateFilteredReservations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = dateFilteredReservations.slice(startIndex, startIndex + itemsPerPage);

  const handleSendQuickMailWithCheck = (r: Reservation) => {
    const existingLog = sentLogs[r.id];
    if (existingLog) {
      toast.info(`⚠️ Bu bildirimi ${existingLog.sentAt} tarihinde (${existingLog.recipient}) adresine zaten gönderdiniz. Harici pencereden tekrar gönderebilirsiniz.`);
    }
    if (onQuickMail) {
      onQuickMail(r);
      // Record sent log
      const updatedLogs = {
        ...sentLogs,
        [r.id]: {
          sentAt: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          recipient: r.customer,
        },
      };
      setSentLogs(updatedLogs);
      localStorage.setItem("venue-keeper-sent-mails-log", JSON.stringify(updatedLogs));
    }
  };

  const handleSendStaffAssignmentBatchMail = async () => {
    const targetEmail = customStaffEmail || store.personnel?.find((p) => p.id === selectedStaffId)?.email;
    const targetName = store.personnel?.find((p) => p.id === selectedStaffId)?.name || "Görevli Personel";

    if (!targetEmail) {
      toast.error("Lütfen personel seçin veya geçerli bir e-posta adresi girin.");
      return;
    }

    const smtpRaw = localStorage.getItem("venue-keeper-smtp-settings");
    if (!smtpRaw) {
      toast.error("SMTP ayarları bulunamadı. Lütfen önce Ayarlar ekranından SMTP tanımlayın.");
      return;
    }

    try {
      const smtpConfig = JSON.parse(smtpRaw);
      const venueMap = new Map(store.venues.map((v) => [v.id, v.name]));
      const hallMap = new Map();
      store.venues.forEach((v) => v.halls?.forEach((h) => hallMap.set(h.id, h.name)));

      const rowsHtml = dateFilteredReservations
        .map(
          (r, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">${r.date}</td>
          <td style="padding: 10px 12px; font-family: monospace; color: #4338ca; font-weight: 700;">${r.start} - ${r.end}</td>
          <td style="padding: 10px 12px; color: #334155; font-weight: 600;">${venueMap.get(r.venueId) || "Tesis"} / ${hallMap.get(r.hallId) || "Salon"}</td>
          <td style="padding: 10px 12px; color: #0f172a; font-weight: 700;">${r.customer} (${r.phone || "-"})</td>
          <td style="padding: 10px 12px; color: #059669; font-weight: 700;">${r.eventType || "Etkinlik"}</td>
          <td style="padding: 10px 12px; color: #64748b; font-size: 11px;">${r.note || "-"}</td>
        </tr>`
        )
        .join("");

      const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background-color: #f1f5f9; padding: 20px; color: #1e293b;">
        <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 14px; padding: 24px; border: 1px solid #cbd5e1; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
          <h2 style="margin: 0 0 4px 0; color: #1e1b4b; font-size: 18px;">📋 Personel Etkinlik & Görev Listesi Dökümü</h2>
          <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12px;">Sayın <strong>${targetName}</strong>, sorumluluğunuz altındaki güncel ${dateFilteredReservations.length} adet etkinlik dökümü aşağıda sunulmuştur:</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background-color: #1e293b; color: #ffffff; text-align: left;">
                <th style="padding: 10px 12px;">Tarih</th>
                <th style="padding: 10px 12px;">Saat</th>
                <th style="padding: 10px 12px;">Mekan / Salon</th>
                <th style="padding: 10px 12px;">Müşteri / İletişim</th>
                <th style="padding: 10px 12px;">Etkinlik Türü</th>
                <th style="padding: 10px 12px;">Notlar</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          
          <p style="margin-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
            VenueKeeper İşletme Otomasyonu tarafından otomatik oluşturulmuştur.
          </p>
        </div>
      </body>
      </html>`;

      if (window.electronAPI?.sendEmail) {
        await window.electronAPI.sendEmail({
          smtpConfig: {
            host: smtpConfig.host,
            port: Number(smtpConfig.port) || 587,
            secure: smtpConfig.secure,
            user: smtpConfig.user,
            pass: smtpConfig.pass,
            senderName: smtpConfig.senderName,
          },
          mailData: {
            to: targetEmail,
            subject: `📋 Personel Etkinlik & Görev Çizelgesi (${targetName})`,
            html: htmlBody,
          },
        });
        toast.success(`📋 ${targetName} (${targetEmail}) adresine görev çizelgesi maillendi!`);
        setIsStaffModalOpen(false);
      }
    } catch (err: any) {
      toast.error(`Mail gönderme hatası: ${err.message || err}`);
    }
  };

  return (
    <Card className={theme === "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
      <CardHeader className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className={`text-base font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
              Etkinlik & Rezervasyon Listesi
            </CardTitle>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[10px] font-bold">
              {totalItems} Etkinlik
            </Badge>
          </div>
          <CardDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Aylık, haftalık, günlük zaman filtreleri ve sayfalama ile tüm tahsis dökümü.
          </CardDescription>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Frame Filter */}
          <Select value={dateFrame} onValueChange={(v: any) => setDateFrame(v)}>
            <SelectTrigger className={`w-[130px] text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"}`}>
              <SelectValue placeholder="Tarih Aralığı" />
            </SelectTrigger>
            <SelectContent className={theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900"}>
              <SelectItem value="all">📅 Tüm Zamanlar</SelectItem>
              <SelectItem value="today">☀️ Bugün</SelectItem>
              <SelectItem value="week">🗓️ Bu Hafta</SelectItem>
              <SelectItem value="month">📆 Bu Ay</SelectItem>
              <SelectItem value="custom">🔍 Özel Tarih</SelectItem>
            </SelectContent>
          </Select>

          {/* Event Type Filter */}
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className={`w-[160px] text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"}`}>
              <SelectValue placeholder="Etkinlik Türü" />
            </SelectTrigger>
            <SelectContent className={theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900"}>
              <SelectItem value="all">Tüm Türler</SelectItem>
              {allEventTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Staff Batch Mail Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsStaffModalOpen(true)}
            className="text-xs h-9 border-sky-500/40 text-sky-400 hover:bg-sky-500/10 font-bold"
            title="Sorumlu personele Excel/HTML formatında tüm etkinlik listesini e-postala"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Personel Görev Mailları
          </Button>
        </div>

        {/* Custom Date Range Picker inputs if "custom" is selected */}
        {dateFrame === "custom" && (
          <div className="w-full flex items-center gap-3 pt-2 border-t border-slate-800/60 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-xs">
              <Label className="text-slate-400">Başlangıç:</Label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 text-xs w-36 bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Label className="text-slate-400">Bitiş:</Label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 text-xs w-36 bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className={`w-full text-left text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
          <thead className={`uppercase font-mono text-[11px] border-b ${theme === "dark" ? "bg-slate-950 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
            <tr>
              <th className="p-3.5">Müşteri / Etkinlik</th>
              <th className="p-3.5">Tarih & Saat</th>
              <th className="p-3.5">Mekan / Salon</th>
              <th className="p-3.5">Tür</th>
              <th className="p-3.5 text-center">Bildirim Durumu</th>
              <th className="p-3.5 text-right">Toplam</th>
              <th className="p-3.5 text-right">Ödenen</th>
              <th className="p-3.5 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800/60" : "divide-slate-200"}`}>
            {paginatedReservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic text-xs">
                  Filtreye uygun etkinlik veya kiralama kaydı bulunamadı.
                </td>
              </tr>
            ) : (
              paginatedReservations.map((r) => {
                const h = hallById(r.hallId);
                const v = store.venues.find((x) => x.id === r.venueId);
                const sentLog = sentLogs[r.id];

                return (
                  <tr key={r.id} className={`transition-colors ${theme === "dark" ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}`}>
                    <td className="p-3.5">
                      <span className={`font-bold block ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
                        {r.customer}
                      </span>
                      <span className={`text-[11px] ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                        {r.phone}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">
                      <div>📅 {r.date}</div>
                      <div className={`text-[11px] ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                        ⏰ {r.start} - {r.end}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span>🏛️ {v?.name}</span>
                      <span className="text-indigo-400 block font-semibold text-[11px]">
                        📍 {h?.name}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[10px]">
                        {r.eventType || "Etkinlik"}
                      </Badge>
                    </td>

                    {/* Sent Checkmark Status Badge */}
                    <td className="p-3.5 text-center">
                      {sentLog ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 w-fit mx-auto" title={`Gönderim Zamanı: ${sentLog.sentAt}`}>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> ✓ Mail Gönderildi
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Bekliyor</span>
                      )}
                    </td>

                    <td className={`p-3.5 text-right font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
                      {money(r.price)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-500">
                      {money(r.paid)}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSendQuickMailWithCheck(r)}
                          className="h-7 w-7 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                          title="Hızlı e-posta & .ics davetiye gönder"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onPromptDelete("reservation", r.id, `${r.customer} (${r.date})`)}
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

        {/* Pagination Footer */}
        <div className={`p-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${theme === "dark" ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}>
          <div className="flex items-center gap-2">
            <span>Sayfa Başına:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={`p-1 rounded border text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-300"}`}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-[11px] opacity-80">
              (Gösterilen: {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} / Toplam {totalItems})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="h-7 px-2 text-xs border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-0.5" /> Önceki
            </Button>
            <span className="text-xs font-bold font-mono px-2 text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="h-7 px-2 text-xs border-slate-700 disabled:opacity-40"
            >
              Sonraki <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* STAFF BATCH MAIL DISPATCH MODAL */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className={theme === "dark" ? "sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-100" : "sm:max-w-[500px] bg-white border-slate-200 text-slate-900"}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-sky-400">
              <FileSpreadsheet className="h-5 w-5" /> Personel Görev Çizelgesi Gönder (Excel / HTML Tablolu)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Filtrelenen <b>{dateFilteredReservations.length} adet etkinlik</b> detaylı tablo formatında sorumlu personele e-postalanır.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold block mb-1">Kayıtlı Sorumlu Personel Seç</Label>
              <select
                value={selectedStaffId}
                onChange={(e) => {
                  setSelectedStaffId(e.target.value);
                  const p = store.personnel?.find((x) => x.id === e.target.value);
                  if (p?.email) setCustomStaffEmail(p.email);
                }}
                className={`w-full p-2 rounded-xl border ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300"}`}
              >
                <option value="">-- Kadrodan Personel Seçin --</option>
                {store.personnel?.map((p) => (
                  <option key={p.id} value={p.id}>
                    👤 {p.name} ({p.title || "Personel"}) {p.email ? `• ${p.email}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold block mb-1">Veya Manuel Personel Mail Adresi</Label>
              <Input
                type="email"
                placeholder="gorevli@belediye.bel.tr"
                value={customStaffEmail}
                onChange={(e) => setCustomStaffEmail(e.target.value)}
                className={`text-xs ${theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300"}`}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffModalOpen(false)} className="text-xs h-8 border-slate-700">
              İptal
            </Button>
            <Button onClick={handleSendStaffAssignmentBatchMail} className="text-xs h-8 bg-sky-600 hover:bg-sky-500 text-white font-bold">
              <Send className="h-3.5 w-3.5 mr-1" /> Görev Çizelgesini Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
