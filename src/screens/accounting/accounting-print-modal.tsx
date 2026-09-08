import React, { useRef } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  Printer,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money, type Store } from "@/lib/rental-store";

export interface AccountingEntryItem {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  title: string;
  description?: string;
  amount: number;
  paymentMethod?: string;
  venueId?: string;
  receiptNo?: string;
  isReservation?: boolean;
  source?: "rental" | "custom" | string;
}

interface AccountingPrintModalProps {
  theme: "dark" | "light";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  store: Store;
  entries: AccountingEntryItem[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    cashTotal: number;
    bankTotal: number;
    posTotal: number;
  };
  filterVenueId: string;
  filterType: string;
  filterCategory: string;
  filterSearch: string;
  filterStartDate?: string;
  filterEndDate?: string;
  institutionName?: string;
  institutionSubHeader?: string;
  institutionLogo?: string;
  authorizedPersonnelName?: string;
  authorizedPersonnelTitle?: string;
}

export const AccountingPrintModal: React.FC<AccountingPrintModalProps> = ({
  theme,
  isOpen,
  onOpenChange,
  store,
  entries,
  summary,
  filterVenueId,
  filterType,
  filterCategory,
  filterSearch,
  filterStartDate,
  filterEndDate,
  institutionName = "T.C. BELEDİYE BAŞKANLIĞI",
  institutionSubHeader = "Mali Hizmetler & Tesis İşletme Müdürlüğü",
  institutionLogo,
  authorizedPersonnelName,
  authorizedPersonnelTitle,
}) => {
  const isDark = theme === "dark";
  const todayStr = new Date().toLocaleDateString("tr-TR");
  const timeStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const reportNo = `KASA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const getVenueName = (vId?: string) => {
    if (!vId || vId === "all") return "Tüm Mekan ve Tesisler";
    return store.venues.find((v) => v.id === vId)?.name || "Genel İşletme";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-6 rounded-2xl ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-2xl"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden flex flex-row items-center justify-between gap-3">
          <div className="space-y-1">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Printer className="h-5 w-5 text-indigo-500" />
              <span>Resmi Kasa & Mali Durum Raporu (A4)</span>
              <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 font-bold">
                {entries.length} İşlem Kaydı
              </Badge>
            </DialogTitle>
            <DialogDescription
              className={`text-xs ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Kurumsal antetli, resmi onay ve imza bloklu A4 standartlarında mali rapor çıktısı.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-bold px-4 shadow-sm gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Yazdır / PDF Kaydet
            </Button>
          </div>
        </DialogHeader>

        {/* Printable A4 Container with dedicated styling */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div
            id="printable-accounting-report"
            className="p-8 bg-white text-slate-900 rounded-xl border border-slate-300 shadow-sm space-y-5 text-xs font-sans print:p-0 print:border-none print:shadow-none print:m-0 print:w-full print:text-black"
          >
            {/* 1. Official Header Section */}
            <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {institutionLogo ? (
                  <img
                    src={institutionLogo}
                    alt="Kurum Logosu"
                    className="h-16 w-16 object-contain shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0">
                    T.C.
                  </div>
                )}
                <div>
                  <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    {institutionName}
                  </h1>
                  <p className="text-[11px] font-bold text-slate-700 uppercase mt-0.5">
                    {institutionSubHeader}
                  </p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">
                    Rapor Kodu: <strong>{reportNo}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right text-[10px] space-y-0.5 shrink-0 border-l border-slate-300 pl-4">
                <p className="font-semibold text-slate-700">Düzenlenme Zamanı</p>
                <p className="font-mono text-slate-900 font-bold">
                  {todayStr} - {timeStr}
                </p>
                <p className="text-emerald-700 font-bold flex items-center justify-end gap-1 mt-1">
                  <ShieldCheck className="h-3 w-3" /> Resmi Kasa Dökümü
                </p>
              </div>
            </div>

            {/* 2. Document Title */}
            <div className="text-center space-y-1">
              <h2 className="text-base font-black tracking-wide text-slate-900 uppercase">
                RESMİ KASA, GELİR-GİDER & MALİ HESAP CETVELİ
              </h2>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-medium">
                <span>Kapsam: <strong>{getVenueName(filterVenueId)}</strong></span>
                <span>•</span>
                <span>
                  Filtre:{" "}
                  <strong>
                    {filterType === "all"
                      ? "Tüm Gelir & Giderler"
                      : filterType === "income"
                      ? "Yalnızca Gelirler"
                      : "Yalnızca Giderler"}
                  </strong>
                </span>
                {filterStartDate && (
                  <>
                    <span>•</span>
                    <span>Tarih: {filterStartDate} {filterEndDate ? `- ${filterEndDate}` : ""}</span>
                  </>
                )}
              </div>
            </div>

            {/* 3. Financial Summary KPI Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/60">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                  Toplam Gelir (Kasa Girişi)
                </span>
                <span className="text-sm font-black font-mono text-emerald-900 block mt-0.5">
                  {money(summary.totalIncome)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-rose-300 bg-rose-50/60">
                <span className="text-[10px] font-bold uppercase text-rose-800 block">
                  Toplam Gider (Harcama)
                </span>
                <span className="text-sm font-black font-mono text-rose-900 block mt-0.5">
                  {money(summary.totalExpense)}
                </span>
              </div>

              <div
                className={`p-2.5 rounded-lg border ${
                  summary.netProfit >= 0
                    ? "border-indigo-300 bg-indigo-50/60 text-indigo-900"
                    : "border-amber-300 bg-amber-50/60 text-amber-900"
                }`}
              >
                <span className="text-[10px] font-bold uppercase block opacity-85">
                  Net Kasa Bakiyesi (Kâr / Kalan)
                </span>
                <span className="text-sm font-black font-mono block mt-0.5">
                  {money(summary.netProfit)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Nakit:</span>
                  <span className="font-mono font-bold text-slate-900">{money(summary.cashTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Banka:</span>
                  <span className="font-mono font-bold text-slate-900">{money(summary.bankTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">POS:</span>
                  <span className="font-mono font-bold text-slate-900">{money(summary.posTotal)}</span>
                </div>
              </div>
            </div>

            {/* 4. Detailed Table of Accounting Transactions */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold text-[10px] uppercase">
                    <th className="p-2 border-r border-slate-300 w-24">Tarih</th>
                    <th className="p-2 border-r border-slate-300 w-20">Tür</th>
                    <th className="p-2 border-r border-slate-300 w-32">Kategori</th>
                    <th className="p-2 border-r border-slate-300">Açıklama / Detay / Müşteri</th>
                    <th className="p-2 border-r border-slate-300 w-24">Ödeme Türü</th>
                    <th className="p-2 text-right w-28">Tutar (₺)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        Kayıtlı mali hareket bulunmamaktadır.
                      </td>
                    </tr>
                  ) : (
                    entries.map((item, idx) => {
                      const isIncome = item.type === "income";
                      return (
                        <tr key={item.id} className={idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}>
                          <td className="p-2 font-mono text-slate-700 border-r border-slate-200">
                            {item.date}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                isIncome
                                  ? "text-emerald-800 bg-emerald-100/80"
                                  : "text-rose-800 bg-rose-100/80"
                              }`}
                            >
                              {isIncome ? "Gelir" : "Gider"}
                            </span>
                          </td>
                          <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                            {item.category}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            <div className="font-bold">{item.title}</div>
                            {item.description && (
                              <div className="text-[10px] text-slate-500 truncate max-w-sm">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-medium text-slate-600 text-[10px]">
                            {item.paymentMethod === "cash"
                              ? "Nakit Kasa"
                              : item.paymentMethod === "bank"
                              ? "Banka / Havale"
                              : item.paymentMethod === "pos"
                              ? "Kredi Kartı / POS"
                              : "Diğer"}
                          </td>
                          <td
                            className={`p-2 text-right font-mono font-bold text-xs ${
                              isIncome ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {isIncome ? "+" : "-"}{money(item.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                    <td colSpan={5} className="p-2 text-right uppercase text-[10px]">
                      Genel Kasa Dengesi (Net Bakiye):
                    </td>
                    <td
                      className={`p-2 text-right font-mono font-black text-xs ${
                        summary.netProfit >= 0 ? "text-emerald-800" : "text-rose-800"
                      }`}
                    >
                      {money(summary.netProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 5. Official Signatures and Seals Section */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-10">
                <div>
                  <p className="font-bold text-slate-900">DÜZENLEYEN</p>
                  <p className="text-[10px] text-slate-600">Vezne / Muhasebe Sorumlusu</p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500">
                  {authorizedPersonnelName || "Adı Soyadı / İmza"}
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <p className="font-bold text-slate-900">KONTROL EDEN</p>
                  <p className="text-[10px] text-slate-600">İdari & Mali İşler Şefi</p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500">
                  İmza / Tarih
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <p className="font-bold text-slate-900">ONAYLAYAN</p>
                  <p className="text-[10px] text-slate-600">
                    {authorizedPersonnelTitle || "Harcama Yetkilisi / Müdür"}
                  </p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500">
                  Resmi Mühür / İmza
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center pt-2 text-[9px] text-slate-400 print:block">
              Bu belge 5018 sayılı Kamu Malî Yönetimi ve Kontrol Kanunu standartlarına uygun olarak sistemden elektronik ortamda üretilmiştir.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
