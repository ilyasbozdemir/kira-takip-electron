import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer, ShieldCheck } from "lucide-react";
import { Hall, Reservation, Venue } from "../lib/rental-store";

interface OfficialPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  venue?: Venue;
  hall?: Hall;
  institutionName: string;
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
  institutionLogo,
  defaultTariffBasis,
  theme,
}) => {
  if (!reservation) return null;

  const isDark = theme === "dark";
  const money = (val: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" })
      .format(val);

  const decisionInfo = reservation.decisionInfo || defaultTariffBasis;
  const remaining = reservation.price - reservation.paid;
  const docNo = `VK-${new Date().getFullYear()}-${
    reservation.id.slice(0, 6).toUpperCase()
  }`;
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
        <DialogHeader className="pb-3 border-b border-slate-800/40 print:hidden flex flex-row items-center justify-between">
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
                Resmi Mekan Tahsis Belgesi & Rapor Çıktısı
              </DialogTitle>
              <DialogDescription
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                İlgili kişiye verilmek üzere resmi tarife ve encümen kararı
                onaylı tahsis raporu.
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
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  MEKAN & SALON TAHSİS MÜDÜRLÜĞÜ (MEKANPRO)
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Resmi Evrak Kayıt No:{" "}
                  <strong className="text-slate-800">{docNo}</strong>
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] space-y-0.5 shrink-0 border-l border-slate-300 pl-4">
              <p className="font-semibold text-slate-700">Düzenlenme Tarihi</p>
              <p className="font-mono text-slate-900 font-bold">{todayStr}</p>
              <p className="text-emerald-700 font-bold flex items-center justify-end gap-1 mt-1">
                <ShieldCheck className="h-3 w-3" /> Onaylı Resmi Belge
              </p>
            </div>
          </div>

          {/* Document Title & Basis */}
          <div className="text-center space-y-1.5 py-1">
            <h2 className="text-base font-black uppercase text-indigo-950 tracking-wider">
              MEKAN & SALON TAHSİS PROTOKOLÜ VE ALINDI BELGESİ
            </h2>
            <div className="inline-block bg-slate-100 border border-slate-300 rounded-md px-3 py-1 text-[10px] font-semibold text-slate-700">
              📌 Karar & Tarife Dayanağı:{" "}
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
                  <td className="p-2.5 font-mono font-semibold text-slate-900">
                    {reservation.phone}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Tahsis Edilen Mekan
                  </th>
                  <td className="p-2.5 font-semibold text-indigo-900">
                    {venue?.name || "Bilinmiyor"}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Tahsis Edilen Salon / Kat
                  </th>
                  <td className="p-2.5 font-semibold text-indigo-900">
                    {hall?.name || "Bilinmiyor"} ({hall?.floor || "Zemin Kat"})
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Etkinlik Kategori & Türü
                  </th>
                  <td className="p-2.5 font-bold text-rose-700">
                    {reservation.eventType || "Genel Etkinlik"}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Tahsis Tarihi & Saat Aralığı
                  </th>
                  <td className="p-2.5 font-mono font-bold text-slate-900">
                    🗓️ {reservation.date} | ⏰ {reservation.start} -{" "}
                    {reservation.end}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Toplam Resmi Tarife Ücreti
                  </th>
                  <td className="p-2.5 font-mono font-bold text-slate-900">
                    {money(reservation.price)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Tahsil Edilen (Ödenen) Tutar
                  </th>
                  <td className="p-2.5 font-mono font-bold text-emerald-700">
                    {money(reservation.paid)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                    Kalan Ödenecek Bakiye
                  </th>
                  <td className="p-2.5 font-mono font-bold text-amber-700">
                    {remaining > 0
                      ? money(remaining)
                      : "Borç Bulunmamaktadır (Tamamı Ödendi)"}
                  </td>
                </tr>
                {reservation.note && (
                  <tr>
                    <th className="p-2.5 font-bold text-slate-700 border-r border-slate-200">
                      Özel Notlar & Açıklama
                    </th>
                    <td className="p-2.5 text-slate-700 italic">
                      {reservation.note}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Legal Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800 mb-1">
              📌 Tahsis Şartları ve Yasal Bilgilendirme:
            </p>
            1. İşbu tahsis belgesi ilgili kurum encümen/meclis kararı
            dayanağında belirtilen kurallar çerçevesinde tanzim
            edilmiştir.<br />
            2. Tahsis edilen süre haricinde mekanda izinsiz kullanım yapılamaz.
            Belirtilen saat aralığına riayet edilmesi zorunludur.<br />
            3. Teslim alan ilgili kişi, tahsis süresince demirbaşların
            muhafazasından ve mevzuata uygun hareket etmekten sorumludur.
          </div>

          {/* Signature Box */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-12">
              <p className="font-bold text-slate-800 border-b border-slate-300 pb-1">
                TESLİM EDEN (YETKİLİ İMZA / MÜHÜR)
              </p>
              <div className="text-[10px] text-slate-500 italic">
                İmza & Kaşe
              </div>
            </div>
            <div className="space-y-12">
              <p className="font-bold text-slate-800 border-b border-slate-300 pb-1">
                TESLİM ALAN (İLGİLİ KİŞİ İMZA)
              </p>
              <div className="text-[10px] text-slate-500 italic">
                {reservation.customer}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/40 print:hidden">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Kapat
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Belgeyi Yazdır / PDF Al
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
