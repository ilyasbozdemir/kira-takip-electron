import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileCheck,
  FileText,
  Printer,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { Hall, Reservation, Venue } from "../lib/rental-store";

interface OfficialPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  venue?: Venue;
  hall?: Hall;
  institutionName: string;
  institutionSubHeader?: string;
  institutionLogo: string;
  defaultTariffBasis: string;
  theme: "dark" | "light";
}

export const OfficialPrintModal: React.FC<OfficialPrintModalProps> = ({
  open,
  onOpenChange,
  reservation,
  venue,
  hall,
  institutionName,
  institutionSubHeader = "TESİS & SALON İŞLETME BİRİMİ",
  institutionLogo,
  defaultTariffBasis,
  theme,
}) => {
  const [docType, setDocType] = useState<"accrual" | "receipt" | "combined">(
    "combined",
  );

  if (!reservation) return null;

  const isDark = theme === "dark";
  const money = (val: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" })
      .format(val);

  const decisionInfo = reservation.decisionInfo || defaultTariffBasis;
  const remaining = reservation.price - reservation.paid;
  const docNo = docType === "receipt"
    ? (reservation.receiptNo
      ? `MAK-${reservation.receiptNo}`
      : `MAK-2026-${reservation.id.slice(0, 6).toUpperCase()}`)
    : `VK-2026-${reservation.id.slice(0, 6).toUpperCase()}`;
  const todayStr = new Date().toLocaleDateString("tr-TR");

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[780px] border shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <DialogHeader className="pb-3 border-b border-slate-800/40 print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle
                className={`text-base font-bold flex items-center gap-2 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Resmi Evrak & Makbuz Basımı
              </DialogTitle>
              <DialogDescription
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Tahakkuk protokolü veya ödeme sonrası alındı makbuzu seçip resmi
                belge basın.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" /> Yazdır / PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Document Mode Selector Bar */}
        <div className="print:hidden flex items-center justify-between bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setDocType("combined")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              docType === "combined"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck className="h-3.5 w-3.5" /> Birleşik Protokol & Alındı
          </button>
          <button
            type="button"
            onClick={() => setDocType("accrual")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              docType === "accrual"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Tahakkuk & Tahsis Protokolü
          </button>
          <button
            type="button"
            onClick={() => setDocType("receipt")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              docType === "receipt"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" /> Ödeme & Alındı Makbuzu
          </button>
        </div>

        {/* Printable Official Document Layout */}
        <div
          id="printable-official-document"
          className="p-6 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs font-sans print:p-0 print:border-none print:shadow-none print:bg-white print:text-black"
        >
          {/* Header Section */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {institutionLogo
                ? (
                  <img
                    src={institutionLogo}
                    alt="Kurum Logosu"
                    className="h-16 w-16 object-contain shrink-0"
                  />
                )
                : (
                  <div className="h-14 w-14 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    T.C.
                  </div>
                )}
              <div>
                <h1 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                  {institutionName || "T.C. KURUM / MÜDÜRLÜK YÖNETİMİ"}
                </h1>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5 uppercase">
                  {institutionSubHeader}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Evrak / Makbuz No:{" "}
                  <strong className="text-slate-800">{docNo}</strong>
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] space-y-0.5 shrink-0 border-l border-slate-300 pl-4">
              <p className="font-semibold text-slate-700">Düzenlenme Tarihi</p>
              <p className="font-mono text-slate-900 font-bold">{todayStr}</p>
              <p className="text-emerald-700 font-bold flex items-center justify-end gap-1 mt-1">
                <ShieldCheck className="h-3 w-3" /> Onaylı Resmi Evrak
              </p>
            </div>
          </div>

          {/* Document Title & Basis */}
          <div className="text-center space-y-1.5 py-1">
            <h2
              className={`text-base font-black uppercase tracking-wider ${
                docType === "receipt" ? "text-emerald-800" : "text-indigo-950"
              }`}
            >
              {docType === "accrual"
                ? "MEKAN & SALON TAHSİS VE TAHAKKUK PROTOKOLÜ"
                : docType === "receipt"
                ? "RESMİ TAHSİLAT MAKBUZU VE ALINDI BELGESİ"
                : "MEKAN & SALON TAHSİS PROTOKOLÜ VE ALINDI BELGESİ"}
            </h2>
            <div className="inline-block bg-slate-100 border border-slate-300 rounded-md px-3 py-1 text-[10px] font-semibold text-slate-700">
              <span className="font-mono text-slate-900">{decisionInfo}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2.5 font-bold text-slate-700 w-1/3 border-r border-slate-200">
                    İlgili Kişi / Müşteri Adı
                  </th>
                  <td className="p-2.5 font-bold text-slate-900 text-sm">
                    {reservation.customer}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    İletişim Telefonu
                  </th>
                  <td className="p-2.5 font-mono text-slate-900 font-semibold">
                    {reservation.phone}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Tahsis Edilen Mekan / Tesis
                  </th>
                  <td className="p-2.5 font-semibold text-slate-900">
                    {venue?.name || "Belirtilmedi"} ({venue?.district || "-"})
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Tahsis Edilen Salon
                  </th>
                  <td className="p-2.5 font-semibold text-slate-900">
                    {hall?.name || "Belirtilmedi"}{" "}
                    {hall?.capacity ? `(${hall.capacity} Kişilik)` : ""}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Etkinlik Türü
                  </th>
                  <td className="p-2.5 font-semibold text-slate-900">
                    {reservation.eventType || "Genel Kiralama"}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Tahsis Tarihi ve Saat Dilimi
                  </th>
                  <td className="p-2.5 font-mono font-bold text-indigo-950">
                    📅 {reservation.date} | ⏰ {reservation.start} -{" "}
                    {reservation.end}
                  </td>
                </tr>

                {docType !== "accrual" && (
                  <>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                        Makbuz / İntizam No
                      </th>
                      <td className="p-2.5 font-mono font-bold text-emerald-800">
                        {reservation.receiptNo || docNo}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                        Ödeme Yöntemi
                      </th>
                      <td className="p-2.5 font-semibold text-slate-800">
                        {reservation.paymentMethod || "Nakit Tahsilat"}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Tahsis Notları
                  </th>
                  <td className="p-2.5 text-slate-700">
                    {reservation.note || "Ek not bulunmamaktadır."}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Box */}
          <div
            className={`p-4 rounded-lg border grid grid-cols-3 gap-4 text-center ${
              docType === "receipt"
                ? "bg-emerald-50/60 border-emerald-300"
                : "bg-slate-50 border-slate-300"
            }`}
          >
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">
                Toplam Tahakkuk Ücreti
              </p>
              <p className="text-sm font-extrabold text-slate-900 mt-1">
                {money(reservation.price)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">
                Tahsil Edilen Tutar
              </p>
              <p className="text-sm font-extrabold text-emerald-700 mt-1">
                {money(reservation.paid)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">
                Kalan Tahsil Edilecek
              </p>
              <p
                className={`text-sm font-extrabold mt-1 ${
                  remaining > 0 ? "text-rose-600" : "text-slate-700"
                }`}
              >
                {money(remaining)}
              </p>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
            <div>
              <p className="font-bold text-slate-800">
                {docType === "receipt"
                  ? "TAHSİLAT YAPAN GÖREVLİ / VEZNEDAR"
                  : "TAHSİS EDEN KURUM / YETKİLİ"}
              </p>
              <p className="text-slate-500 text-[10px] mt-0.5">
                İmza / Mühür
              </p>
              <div className="h-16 mt-2 border-b border-dashed border-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-800">
                KİRALAYAN / İLGİLİ KİŞİ
              </p>
              <p className="text-slate-500 text-[10px] mt-0.5">
                {reservation.customer}
              </p>
              <div className="h-16 mt-2 border-b border-dashed border-slate-400" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
