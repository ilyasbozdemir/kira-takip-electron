import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  Filter,
  CheckCircle2,
  DollarSign,
  Download,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Reservation, type Venue, money } from "@/lib/rental-store";
import { exportReservationsToExcel } from "@/lib/export-excel-template";
import { toast } from "sonner";

interface AdvancedExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  reservations: Reservation[];
  venues: Venue[];
  workingYear?: string;
  institutionName?: string;
  institutionSubHeader?: string;
  institutionLogo?: string;
}

export const AdvancedExportModal: React.FC<AdvancedExportModalProps> = ({
  open,
  onOpenChange,
  theme,
  reservations,
  venues,
  workingYear = "2026",
  institutionName,
  institutionSubHeader,
  institutionLogo,
}) => {
  const isDark = theme === "dark";

  const [selectedVenueId, setSelectedVenueId] = useState<string>("all");
  const [selectedHallId, setSelectedHallId] = useState<string>("all");
  const [dateRangeMode, setDateRangeMode] = useState<"year" | "month" | "upcoming" | "custom">("year");
  const [customStartDate, setCustomStartDate] = useState<string>(`${workingYear}-01-01`);
  const [customEndDate, setCustomEndDate] = useState<string>(`${workingYear}-12-31`);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  // Available halls based on selected venue
  const availableHalls = useMemo(() => {
    if (selectedVenueId === "all") return [];
    const v = venues.find((x) => x.id === selectedVenueId);
    return v?.halls || [];
  }, [venues, selectedVenueId]);

  // Filtered reservations
  const filteredData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const currentMonthPrefix = todayStr.slice(0, 7);

    return reservations.filter((r) => {
      // 1. Venue Filter
      if (selectedVenueId !== "all" && r.venueId !== selectedVenueId) return false;

      // 2. Hall Filter
      if (selectedHallId !== "all" && r.hallId !== selectedHallId) return false;

      // 3. Status Filter
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      // 4. Date Range Filter
      if (dateRangeMode === "year") {
        if (!r.date.startsWith(workingYear)) return false;
      } else if (dateRangeMode === "month") {
        if (!r.date.startsWith(currentMonthPrefix)) return false;
      } else if (dateRangeMode === "upcoming") {
        if (r.date < todayStr) return false;
      } else if (dateRangeMode === "custom") {
        if (customStartDate && r.date < customStartDate) return false;
        if (customEndDate && r.date > customEndDate) return false;
      }

      return true;
    });
  }, [
    reservations,
    selectedVenueId,
    selectedHallId,
    statusFilter,
    dateRangeMode,
    workingYear,
    customStartDate,
    customEndDate,
  ]);

  // Total summary of filtered data
  const totalRevenue = useMemo(() => {
    return filteredData.reduce((acc, r) => acc + (Number(r.price) || 0), 0);
  }, [filteredData]);

  const totalPaid = useMemo(() => {
    return filteredData.reduce((acc, r) => acc + (Number(r.paid) || 0), 0);
  }, [filteredData]);

  const totalRemaining = Math.max(0, totalRevenue - totalPaid);

  // Handle Excel Export
  const handleExportExcel = async () => {
    if (filteredData.length === 0) {
      toast.warning("Seçilen filtrelere uygun dışa aktarılacak kayıt bulunamadı.");
      return;
    }

    try {
      setIsExporting(true);
      const vObj = venues.find((v) => v.id === selectedVenueId);
      const hObj = vObj?.halls.find((h) => h.id === selectedHallId);

      const filterSummary = [
        selectedVenueId === "all" ? "Tüm Tesisler" : `Tesis: ${vObj?.name}`,
        selectedHallId === "all" ? "Tüm Salonlar" : `Salon: ${hObj?.name}`,
        dateRangeMode === "year"
          ? `${workingYear} Çalışma Yılı`
          : dateRangeMode === "month"
          ? "Bu Ay"
          : dateRangeMode === "upcoming"
          ? "Gelecek Etkinlikler"
          : `${customStartDate} / ${customEndDate}`,
        statusFilter === "all" ? "Tüm Durumlar" : statusFilter === "confirmed" ? "Kesinleşenler" : "Opsiyonlular",
      ].join(" | ");

      await exportReservationsToExcel({
        institutionName,
        institutionSubHeader,
        reportTitle: "SALON TAHSİS, ETKİNLİK VE GELİR LİSTESİ",
        reservations: filteredData,
        venues,
        filterSummary,
      });

      toast.success("📊 Excel tablosu (.xlsx) başarıyla oluşturuldu ve indirildi!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Excel dışa aktarma hatası: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle PDF / Printable Official Doc
  const handlePrintReport = () => {
    if (filteredData.length === 0) {
      toast.warning("Seçilen filtrelere uygun yazdırılacak kayıt bulunamadı.");
      return;
    }

    const printWin = window.open("", "_blank", "width=1100,height=800");
    if (!printWin) {
      toast.error("Yazdırma penceresi açılamadı. Lütfen tarayıcı açılır pencere engelini kaldırın.");
      return;
    }

    const vObj = venues.find((v) => v.id === selectedVenueId);
    const hObj = vObj?.halls.find((h) => h.id === selectedHallId);

    const filterSummary = [
      selectedVenueId === "all" ? "Tüm Tesisler" : `Tesis: ${vObj?.name}`,
      selectedHallId === "all" ? "Tüm Salonlar" : `Salon: ${hObj?.name}`,
      dateRangeMode === "year"
        ? `${workingYear} Çalışma Yılı`
        : dateRangeMode === "month"
        ? "Bu Ay"
        : dateRangeMode === "upcoming"
        ? "Gelecek Etkinlikler"
        : `${customStartDate} / ${customEndDate}`,
    ].join(" • ");

    const sortedData = [...filteredData].sort((a, b) => a.date.localeCompare(b.date));

    const rowsHtml = sortedData
      .map((r, i) => {
        const v = venues.find((x) => x.id === r.venueId);
        const h = v?.halls.find((x) => x.id === r.hallId);
        const p = Number(r.price) || 0;
        const paid = Number(r.paid) || 0;
        const rem = Math.max(0, p - paid);

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 6px 8px; text-align: center;">${i + 1}</td>
            <td style="padding: 6px 8px; font-weight: bold;">${v?.name || "-"}</td>
            <td style="padding: 6px 8px;">${h?.name || "-"}</td>
            <td style="padding: 6px 8px; text-align: center; font-family: monospace;">${r.date}</td>
            <td style="padding: 6px 8px; text-align: center; font-family: monospace;">${r.start}-${r.end}</td>
            <td style="padding: 6px 8px;">${r.customer}</td>
            <td style="padding: 6px 8px; font-family: monospace;">${r.phone || "-"}</td>
            <td style="padding: 6px 8px;">${r.eventType || "Genel"}</td>
            <td style="padding: 6px 8px; text-align: right; font-family: monospace;">${money(p)}</td>
            <td style="padding: 6px 8px; text-align: right; font-family: monospace; color: #15803d;">${money(paid)}</td>
            <td style="padding: 6px 8px; text-align: right; font-family: monospace; color: ${rem > 0 ? "#b91c1c" : "#334155"}; font-weight: ${rem > 0 ? "bold" : "normal"};">${money(rem)}</td>
            <td style="padding: 6px 8px; text-align: center;">${r.status === "confirmed" ? "Onaylandı" : "Opsiyon"}</td>
          </tr>
        `;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etkinlik ve Tahsis Raporu - ${workingYear}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 15px; }
          .header-table { width: 100%; border-bottom: 2px solid #312e81; padding-bottom: 10px; margin-bottom: 12px; }
          .inst-name { font-size: 16px; font-weight: 800; color: #1e1b4b; text-transform: uppercase; margin: 0; }
          .inst-sub { font-size: 11px; color: #4338ca; margin-top: 3px; font-weight: 600; }
          .filter-bar { background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; font-size: 11px; color: #475569; margin-bottom: 12px; }
          table.data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          table.data-table th { background: #312e81; color: #ffffff; font-size: 10px; padding: 6px; text-align: left; text-transform: uppercase; }
          .total-box { margin-top: 15px; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 6px; display: flex; justify-content: flex-end; gap: 20px; font-family: monospace; font-size: 12px; font-weight: bold; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 8px;">
          <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">🖨️ Sayfayı Yazdır / PDF Kaydet</button>
        </div>

        <table class="header-table">
          <tr>
            <td style="width: 70px; vertical-align: middle;">
              ${institutionLogo ? `<img src="${institutionLogo}" style="max-height: 50px; max-width: 65px; object-contain: contain;" />` : ""}
            </td>
            <td style="vertical-align: middle;">
              <h1 class="inst-name">${institutionName || "T.C. KURUM / BELEDİYE BAŞKANLIĞI"}</h1>
              <div class="inst-sub">${institutionSubHeader || "Tesis ve Salon İşletme Müdürlüğü"} — RESMİ TAHSİS VE ETKİNLİK LİSTESİ</div>
            </td>
            <td style="text-align: right; vertical-align: middle; font-size: 10px; color: #64748b;">
              Tarih: ${new Date().toLocaleDateString("tr-TR")}<br/>
              Kayıt Sayısı: ${filteredData.length} Adet
            </td>
          </tr>
        </table>

        <div class="filter-bar">
          <strong>Rapor Kriterleri:</strong> ${filterSummary}
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="text-align: center; width: 30px;">#</th>
              <th>Mekan / Tesis</th>
              <th>Salon</th>
              <th style="text-align: center;">Tarih</th>
              <th style="text-align: center;">Saat</th>
              <th>Müşteri / Vatandaş</th>
              <th>Telefon</th>
              <th>Tür</th>
              <th style="text-align: right;">Tarife</th>
              <th style="text-align: right;">Tahsilat</th>
              <th style="text-align: right;">Kalan</th>
              <th style="text-align: center;">Durum</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <span>Toplam Tarife: ${money(totalRevenue)}</span>
          <span style="color: #15803d;">Tahsil Edilen: ${money(totalPaid)}</span>
          <span style="color: ${totalRemaining > 0 ? "#b91c1c" : "#0f172a"};">Kalan Borç: ${money(totalRemaining)}</span>
        </div>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-lg p-0 overflow-hidden border ${
          isDark
            ? "bg-slate-900 border-indigo-500/40 text-slate-100 shadow-2xl shadow-indigo-950/50"
            : "bg-white border-indigo-200 text-slate-900 shadow-2xl"
        }`}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-700 via-indigo-800 to-slate-900 p-5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
                Mekan & Salon Raporu Dışa Aktar
              </DialogTitle>
              <DialogDescription className="text-xs text-indigo-100">
                Tesis ve salon bazında filtrelenmiş kurumsal Excel (.xlsx) veya resmi PDF çıktısı alın.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Filters Form */}
          <div className="grid grid-cols-2 gap-3">
            {/* Venue Selector */}
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" /> Tesis / Mekan
              </Label>
              <Select
                value={selectedVenueId}
                onValueChange={(val) => {
                  setSelectedVenueId(val);
                  setSelectedHallId("all");
                }}
              >
                <SelectTrigger
                  className={`mt-1 text-xs h-8 ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="Tüm Mekanlar" />
                </SelectTrigger>
                <SelectContent
                  className={isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900"}
                >
                  <SelectItem value="all">🏢 Tüm Tesisler ({venues.length})</SelectItem>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hall Selector */}
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-500" /> Salon Seçimi
              </Label>
              <Select
                value={selectedHallId}
                onValueChange={setSelectedHallId}
                disabled={selectedVenueId === "all"}
              >
                <SelectTrigger
                  className={`mt-1 text-xs h-8 ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="Tüm Salonlar" />
                </SelectTrigger>
                <SelectContent
                  className={isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900"}
                >
                  <SelectItem value="all">Tüm Salonlar</SelectItem>
                  {availableHalls.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Tarih Aralığı
              </Label>
              <Select
                value={dateRangeMode}
                onValueChange={(val: any) => setDateRangeMode(val)}
              >
                <SelectTrigger
                  className={`mt-1 text-xs h-8 ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900"}
                >
                  <SelectItem value="year">📅 {workingYear} Çalışma Yılı (Tümü)</SelectItem>
                  <SelectItem value="month">🗓️ Bu Ayın Kayıtları</SelectItem>
                  <SelectItem value="upcoming">⏳ Gelecek Etkinlikler</SelectItem>
                  <SelectItem value="custom">✏️ Özel Tarih Aralığı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-indigo-500" /> Onay Durumu
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className={`mt-1 text-xs h-8 ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-900"}
                >
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="confirmed">✅ Kesinleşen / Onaylı</SelectItem>
                  <SelectItem value="option">⏳ Opsiyonlu / Ön Rezervasyon</SelectItem>
                  <SelectItem value="cancelled">❌ İptal Edilenler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range Picker */}
          {dateRangeMode === "custom" && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border bg-slate-950/40 border-slate-800 animate-in fade-in duration-150">
              <div>
                <Label className="text-[10px]">Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="mt-0.5 text-xs font-mono h-7.5"
                />
              </div>
              <div>
                <Label className="text-[10px]">Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="mt-0.5 text-xs font-mono h-7.5"
                />
              </div>
            </div>
          )}

          {/* Live Summary Counter Card */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
              isDark ? "bg-indigo-950/30 border-indigo-500/30" : "bg-indigo-50/80 border-indigo-200"
            }`}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
                Filtre Eşleşme Özeti
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {filteredData.length} Adet Etkinlik
              </span>
            </div>

            <div className="text-right font-mono">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                {money(totalRevenue)}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                Tahsilat: {money(totalPaid)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter
          className={`p-4 border-t gap-2 flex flex-row items-center justify-between ${
            isDark ? "bg-slate-950/50 border-slate-800" : "bg-slate-50/80 border-slate-200"
          }`}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9"
          >
            Kapat
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintReport}
              className="text-xs h-9 font-semibold gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" /> Resmi PDF / Yazdır
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleExportExcel}
              disabled={isExporting || filteredData.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4 font-bold shadow-xs gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx) İndir
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
