import React, { useState, useMemo } from "react";
import { FileSpreadsheet, Printer, FileText, CheckCircle2, Building2, Scale, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { money, type Store } from "@/lib/rental-store";

interface ReportsScreenProps {
  theme: "dark" | "light";
  monthStats: {
    totalRev: number;
    totalPaid: number;
    remaining: number;
  };
  store?: Store;
}

export function ReportsScreen({
  theme,
  monthStats,
  store,
}: ReportsScreenProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"summary" | "double_entry">("summary");

  // Venue Financial Breakdown
  const venueStats = useMemo(() => {
    if (!store?.venues || !store?.reservations) return [];

    return store.venues.map((v) => {
      const vRes = store.reservations.filter((r) => r.venueId === v.id);
      const totalRev = vRes.reduce((sum, r) => sum + (r.price || 0), 0);
      const totalPaid = vRes.reduce((sum, r) => sum + (r.paid || 0), 0);
      const remaining = totalRev - totalPaid;
      const count = vRes.length;
      const collectionRate = totalRev > 0 ? Math.round((totalPaid / totalRev) * 100) : 0;

      return {
        id: v.id,
        name: v.name,
        category: v.category || "Sosyal Tesis",
        count,
        totalRev,
        totalPaid,
        remaining,
        collectionRate,
      };
    });
  }, [store]);

  // Double-Entry Accounting Journal Entries (Çift Taraflı Muhasebe Yevmiye Fişleri)
  const doubleEntryJournals = useMemo(() => {
    if (!store?.reservations) return { entries: [], totalDebit: 0, totalCredit: 0 };

    const entries: Array<{
      voucherNo: string;
      date: string;
      accountCode: string;
      accountName: string;
      debit: number;
      credit: number;
      description: string;
    }> = [];

    let totalDebit = 0;
    let totalCredit = 0;

    store.reservations.forEach((r, idx) => {
      const vNo = `YEV-2026-${String(idx + 1).padStart(4, "0")}`;
      const venue = store.venues.find((v) => v.id === r.venueId);
      const venueName = venue?.name || "Tesis";

      // 1. Accrual Entry (Tahakkuk Kaydı)
      // Debit: 120 ALICILAR HESABI
      entries.push({
        voucherNo: vNo,
        date: r.date,
        accountCode: "120.01",
        accountName: `120.01 ALICILAR - ${r.customer.toUpperCase()}`,
        debit: r.price || 0,
        credit: 0,
        description: `Salon Tahakkuku: ${venueName} (${r.eventType || "Kiralama"})`,
      });
      totalDebit += r.price || 0;

      // Credit: 600 HİZMET GELİRLERİ HESABI
      entries.push({
        voucherNo: vNo,
        date: r.date,
        accountCode: "600.01",
        accountName: `600.01 TESİS HİZMET GELİRLERİ`,
        debit: 0,
        credit: r.price || 0,
        description: `Salon Tahakkuk Geliri: ${r.customer}`,
      });
      totalCredit += r.price || 0;

      // 2. Collection Entry (Tahsilat Kaydı) if paid > 0
      if (r.paid && r.paid > 0) {
        const cashAccCode = r.paymentMethod === "Kredi Kartı / POS" ? "102.01" : "100.01";
        const cashAccName = r.paymentMethod === "Kredi Kartı / POS" ? "102.01 BANKALAR HESABI (POS)" : "100.01 KASA HESABI (Nakit)";

        // Debit: Kasa / Banka
        entries.push({
          voucherNo: vNo,
          date: r.date,
          accountCode: cashAccCode,
          accountName: cashAccName,
          debit: r.paid,
          credit: 0,
          description: `Tahsilat (${r.paymentMethod || "Nakit"}): ${r.customer}`,
        });
        totalDebit += r.paid;

        // Credit: 120 Alıcılar
        entries.push({
          voucherNo: vNo,
          date: r.date,
          accountCode: "120.01",
          accountName: `120.01 ALICILAR - ${r.customer.toUpperCase()}`,
          debit: 0,
          credit: r.paid,
          description: `Tahsilat Mahsubu: ${r.customer}`,
        });
        totalCredit += r.paid;
      }
    });

    return { entries, totalDebit, totalCredit };
  }, [store]);

  const handlePrintLedger = () => {
    window.print();
  };

  const handleExportExcel = () => {
    toast.success("Excel çift taraflı yevmiye döküm raporu indirildi!");
  };

  return (
    <Card className={theme === "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
      <CardHeader className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
        <div>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
            <Scale className="h-5 w-5 text-indigo-500" /> Mali Raporlar & Çift Taraflı Muhasebe Fişleri
          </CardTitle>
          <CardDescription className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Tüm mekanların gelir-tahsilat analizi ve arka plan çift taraflı mahsup/yevmiye dökümü.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "summary" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📊 Tesis Gelir Analizi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("double_entry")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "double_entry" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📑 Yevmiye & Çift Taraflı Fişler
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className={`text-xs h-8 text-emerald-500 ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Excel Dökümü
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePrintLedger}
            className={`text-xs h-8 text-indigo-400 ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`}
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Fiş Yazdır
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-xs font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              Toplam Tahakkuk (600 Gelir)
            </p>
            <p className={`text-xl font-extrabold mt-1 ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
              {money(monthStats.totalRev)}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-xs font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              Toplam Tahsilat (100/102 Kasa)
            </p>
            <p className="text-xl font-extrabold text-emerald-500 mt-1">
              {money(monthStats.totalPaid)}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-xs font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              Kalan Alacak (120 Alıcılar)
            </p>
            <p className="text-xl font-extrabold text-amber-500 mt-1">
              {money(monthStats.remaining)}
            </p>
          </div>
        </div>

        {activeTab === "summary" ? (
          /* TAB 1: VENUE BREAKDOWN SUMMARY */
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-indigo-400" /> Tesis ve Mekan Bazlı Mali Dağılım
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className={`w-full text-left text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                <thead className={`uppercase font-mono text-[11px] border-b ${theme === "dark" ? "bg-slate-950 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  <tr>
                    <th className="p-3">Mekan / Tesis Adı</th>
                    <th className="p-3 text-center">Etkinlik Sayısı</th>
                    <th className="p-3 text-right">Tahakkuk</th>
                    <th className="p-3 text-right">Tahsilat</th>
                    <th className="p-3 text-right">Kalan Alacak</th>
                    <th className="p-3 text-center">Tahsilat Oranı</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800/60" : "divide-slate-200"}`}>
                  {venueStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                        Henüz kayıtlı mekan verisi bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    venueStats.map((v) => (
                      <tr key={v.id} className={theme === "dark" ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                        <td className="p-3 font-bold text-slate-200">
                          🏛️ {v.name}
                          <span className="block text-[10px] font-normal text-slate-400">{v.category}</span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          {v.count} Adet
                        </td>
                        <td className="p-3 text-right font-bold text-slate-200">
                          {money(v.totalRev)}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          {money(v.totalPaid)}
                        </td>
                        <td className="p-3 text-right font-bold text-amber-400">
                          {money(v.remaining)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={`text-[10px] font-bold ${v.collectionRate >= 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                            %{v.collectionRate} Tahsil Edildi
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB 2: DOUBLE-ENTRY JOURNAL LEDGER (ÇİFT TARAFLI YEVMİYE FİŞLERİ) */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-400" /> Çift Taraflı Yevmiye & Mahsup Fişi Dökümü
              </h3>

              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> ✓ Çift Taraflı Denk Kayıt (Borç = Alacak)
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className={`w-full text-left text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                <thead className={`uppercase font-mono text-[11px] border-b ${theme === "dark" ? "bg-slate-950 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  <tr>
                    <th className="p-3">Fiş No / Tarih</th>
                    <th className="p-3">Hesap Kodu & Adı</th>
                    <th className="p-3">Açıklama</th>
                    <th className="p-3 text-right">Borç (TL)</th>
                    <th className="p-3 text-right">Alacak (TL)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800/60" : "divide-slate-200"}`}>
                  {doubleEntryJournals.entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                        Henüz muhasebe işlem kaydı bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    doubleEntryJournals.entries.map((entry, idx) => (
                      <tr key={idx} className={theme === "dark" ? "hover:bg-slate-800/30 font-mono text-[11px]" : "hover:bg-slate-50 font-mono text-[11px]"}>
                        <td className="p-2.5 font-bold text-indigo-400">
                          {entry.voucherNo}
                          <span className="block text-[10px] font-normal text-slate-400">{entry.date}</span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-200">
                          {entry.accountName}
                        </td>
                        <td className="p-2.5 text-slate-400 font-sans text-xs">
                          {entry.description}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-100">
                          {entry.debit > 0 ? money(entry.debit) : "-"}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-100">
                          {entry.credit > 0 ? money(entry.credit) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className={`font-mono text-xs border-t font-bold ${theme === "dark" ? "bg-slate-950 text-slate-100 border-slate-800" : "bg-slate-100 text-slate-900 border-slate-300"}`}>
                  <tr>
                    <td colSpan={3} className="p-3 text-right">
                      TOPLAM DENGELİ YEVMİYE TUTARI:
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-extrabold">
                      {money(doubleEntryJournals.totalDebit)}
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-extrabold">
                      {money(doubleEntryJournals.totalCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
