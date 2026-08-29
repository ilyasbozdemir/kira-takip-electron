import React, { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Printer,
  Receipt,
  Search,
  Filter,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"summary" | "payments">("summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | "paid" | "partial" | "unpaid">("all");

  // Venue Financial Breakdown
  const venueStats = useMemo(() => {
    if (!store?.venues || !store?.reservations) return [];

    return store.venues.map((v) => {
      const vRes = store.reservations.filter((r) => r.venueId === v.id);
      const totalRev = vRes.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
      const totalPaid = vRes.reduce((sum, r) => sum + (Number(r.paid) || 0), 0);
      const remaining = totalRev - totalPaid;
      const count = vRes.length;
      const collectionRate = totalRev > 0
        ? Math.round((totalPaid / totalRev) * 100)
        : 0;

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

  // Filtered Detailed Payment List
  const paymentList = useMemo(() => {
    if (!store?.reservations) return [];

    return store.reservations.filter((r) => {
      const q = searchTerm.toLowerCase();
      const v = store.venues.find((x) => x.id === r.venueId);
      const h = v?.halls?.find((x) => x.id === r.hallId);
      const price = Number(r.price) || 0;
      const paid = Number(r.paid) || 0;
      const remaining = price - paid;

      const matchesSearch =
        (r.customer && r.customer.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.receiptNo && r.receiptNo.toLowerCase().includes(q)) ||
        (v?.name && v.name.toLowerCase().includes(q)) ||
        (h?.name && h.name.toLowerCase().includes(q)) ||
        (r.eventType && r.eventType.toLowerCase().includes(q));

      let matchesStatus = true;
      if (paymentStatusFilter === "paid") {
        matchesStatus = price > 0 && remaining <= 0;
      } else if (paymentStatusFilter === "partial") {
        matchesStatus = paid > 0 && remaining > 0;
      } else if (paymentStatusFilter === "unpaid") {
        matchesStatus = paid === 0 && price > 0;
      }

      return matchesSearch && matchesStatus;
    });
  }, [store, searchTerm, paymentStatusFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!store?.reservations || store.reservations.length === 0) {
      toast.error("Dışa aktarılacak kayıt bulunamadı.");
      return;
    }

    const headers = [
      "Tarih",
      "Saat",
      "Müşteri",
      "Telefon",
      "Mekan",
      "Salon",
      "Etkinlik Türü",
      "Makbuz No",
      "Ödeme Yöntemi",
      "Toplam Tutar",
      "Alınan / Tahsilat",
      "Kalan Tutar",
      "Durum",
    ];

    const rows = paymentList.map((r) => {
      const v = store.venues.find((x) => x.id === r.venueId);
      const h = v?.halls?.find((x) => x.id === r.hallId);
      const price = Number(r.price) || 0;
      const paid = Number(r.paid) || 0;
      const remaining = price - paid;
      const statusText =
        price === 0 ? "Ücretsiz" : remaining <= 0 ? "Tam Ödendi" : paid > 0 ? "Kısmi Ödendi" : "Ödenmedi";

      return [
        r.date,
        `${r.start} - ${r.end}`,
        `"${r.customer}"`,
        `"${r.phone || ""}"`,
        `"${v?.name || ""}"`,
        `"${h?.name || ""}"`,
        `"${r.eventType || "Genel"}"`,
        `"${r.receiptNo || ""}"`,
        `"${r.paymentMethod || "Nakit"}"`,
        price,
        paid,
        remaining,
        statusText,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mali_tahsilat_raporu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Mali tahsilat tablosu Excel/CSV formatında indirildi!");
  };

  return (
    <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
      <CardHeader className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <Receipt className="h-5 w-5 text-indigo-500" /> Mali Gelir & Tahsilat Raporları
          </CardTitle>
          <CardDescription className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Tesis bazlı gelir analizi ve etkinlik kiralama tahsilat / bakiye takibi.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex p-0.5 rounded-lg border ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === "summary"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📊 Tesis Gelir Analizi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payments")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === "payments"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🧾 Tahsilat & Ödeme Dökümü
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className={`text-xs h-8 font-bold ${
              isDark
                ? "border-slate-800 text-emerald-400 hover:bg-slate-800"
                : "border-slate-300 text-emerald-700 hover:bg-emerald-50 shadow-2xs"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Excel Dökümü
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className={`text-xs h-8 font-bold ${
              isDark
                ? "border-slate-800 text-indigo-400 hover:bg-slate-800"
                : "border-slate-300 text-indigo-700 hover:bg-indigo-50 shadow-2xs"
            }`}
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Yazdır
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200 shadow-2xs"
            }`}
          >
            <p className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Toplam Tahakkuk (Kiralama Geliri)
            </p>
            <p className={`text-2xl font-black font-mono mt-1 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {money(monthStats.totalRev)}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200 shadow-2xs"
            }`}
          >
            <p className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Toplam Alınan (Kasa / Banka)
            </p>
            <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {money(monthStats.totalPaid)}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200 shadow-2xs"
            }`}
          >
            <p className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Kalan Alacak (Bekleyen Ödeme)
            </p>
            <p className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
              {money(monthStats.remaining)}
            </p>
          </div>
        </div>

        {activeTab === "summary" ? (
          /* TAB 1: VENUE BREAKDOWN SUMMARY */
          <div className="space-y-3">
            <h3
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? "text-slate-400" : "text-slate-700"
              }`}
            >
              <Building2 className="h-4 w-4 text-indigo-500" /> Tesis ve Mekan Bazlı Mali Dağılım
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <table className={`w-full text-left text-xs ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                <thead
                  className={`uppercase font-sans font-black text-[11px] border-b ${
                    isDark
                      ? "bg-slate-950 text-slate-300 border-slate-800"
                      : "bg-slate-100 text-slate-900 border-slate-300"
                  }`}
                >
                  <tr>
                    <th className="p-3">Mekan / Tesis Adı</th>
                    <th className="p-3 text-center">Etkinlik Sayısı</th>
                    <th className="p-3 text-right">Toplam Tahakkuk</th>
                    <th className="p-3 text-right">Alınan (Tahsilat)</th>
                    <th className="p-3 text-right">Kalan Bakiye</th>
                    <th className="p-3 text-center">Tahsilat Oranı</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-200"}`}>
                  {venueStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                        Henüz kayıtlı mekan verisi bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    venueStats.map((v) => (
                      <tr
                        key={v.id}
                        className={isDark ? "hover:bg-slate-800/30" : "hover:bg-indigo-50/50"}
                      >
                        <td className={`p-3 font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          🏛️ {v.name}
                          <span
                            className={`block text-[10px] font-semibold ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {v.category}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          {v.count} Adet
                        </td>
                        <td className={`p-3 text-right font-black font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {money(v.totalRev)}
                        </td>
                        <td className="p-3 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
                          {money(v.totalPaid)}
                        </td>
                        <td className="p-3 text-right font-black font-mono text-amber-600 dark:text-amber-400">
                          {money(v.remaining)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            className={`text-[10px] font-bold ${
                              v.collectionRate >= 80
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                            }`}
                          >
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
          /* TAB 2: DETAILED PAYMENT & COLLECTION LOG (TAHSİLAT & ÖDEME DÖKÜMÜ) */
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3
                className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? "text-slate-400" : "text-slate-800"
                }`}
              >
                <FileText className="h-4 w-4 text-indigo-500" />
                Etkinlik Bazlı Tahsilat & Ödeme Dökümü ({paymentList.length} Kayıt)
              </h3>

              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <Input
                    placeholder="Müşteri, makbuz, salon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-8 text-xs h-8 rounded-lg w-48 ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <select
                  value={paymentStatusFilter}
                  onChange={(e: any) => setPaymentStatusFilter(e.target.value)}
                  className={`text-xs h-8 px-2 rounded-lg border font-bold ${
                    isDark
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-800"
                  }`}
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="paid">✓ Tam Ödenenler</option>
                  <option value="partial">⏳ Kısmi Ödenenler</option>
                  <option value="unpaid">❌ Ödenmeyenler</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <table className={`w-full text-left text-xs ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                <thead
                  className={`uppercase font-sans font-black text-[11px] border-b ${
                    isDark
                      ? "bg-slate-950 text-slate-300 border-slate-800"
                      : "bg-slate-100 text-slate-900 border-slate-300"
                  }`}
                >
                  <tr>
                    <th className="p-3">Tarih & Saat</th>
                    <th className="p-3">Müşteri / Kurum</th>
                    <th className="p-3">Mekan & Salon</th>
                    <th className="p-3">Makbuz / Yöntem</th>
                    <th className="p-3 text-right">Toplam Tutar</th>
                    <th className="p-3 text-right">Alınan (Tahsil)</th>
                    <th className="p-3 text-right">Kalan</th>
                    <th className="p-3 text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-200"}`}>
                  {paymentList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                        Filtreye uygun tahsilat kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    paymentList.map((r) => {
                      const v = store?.venues.find((x) => x.id === r.venueId);
                      const h = v?.halls?.find((x) => x.id === r.hallId);
                      const price = Number(r.price) || 0;
                      const paid = Number(r.paid) || 0;
                      const remaining = price - paid;
                      const isFullyPaid = price > 0 && remaining <= 0;
                      const isPartial = paid > 0 && remaining > 0;
                      const isFree = price === 0;

                      return (
                        <tr
                          key={r.id}
                          className={`transition-colors ${
                            isDark ? "hover:bg-slate-800/40" : "hover:bg-indigo-50/50 bg-white"
                          }`}
                        >
                          {/* Date & Time */}
                          <td className="p-3 whitespace-nowrap font-mono">
                            <div className={`font-black text-xs ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              📅 {r.date}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold">
                              ⏰ {r.start} - {r.end}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="p-3">
                            <div className={`font-black text-xs ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              {r.customer}
                            </div>
                            {r.phone && (
                              <div className="text-[11px] text-slate-500 font-mono">
                                📞 {r.phone}
                              </div>
                            )}
                          </td>

                          {/* Venue & Hall */}
                          <td className="p-3">
                            <div className={`font-bold text-xs ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                              {v?.name || "Tesis"}
                            </div>
                            <div className="text-[11px] text-indigo-500 font-semibold">
                              📍 {h?.name || "Salon"}
                            </div>
                          </td>

                          {/* Receipt & Payment Method */}
                          <td className="p-3">
                            <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {r.receiptNo ? `🧾 ${r.receiptNo}` : "—"}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              {r.paymentMethod === "Kredi Kartı / POS" ? (
                                <CreditCard className="h-3 w-3 text-sky-500" />
                              ) : (
                                <Banknote className="h-3 w-3 text-emerald-500" />
                              )}
                              <span>{r.paymentMethod || "Nakit"}</span>
                            </div>
                          </td>

                          {/* Total Price */}
                          <td className={`p-3 text-right font-black font-mono text-xs ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {money(price)}
                          </td>

                          {/* Paid Amount */}
                          <td className="p-3 text-right font-black font-mono text-xs text-emerald-600 dark:text-emerald-400">
                            {money(paid)}
                          </td>

                          {/* Remaining Balance */}
                          <td className="p-3 text-right font-black font-mono text-xs text-amber-600 dark:text-amber-400">
                            {money(remaining)}
                          </td>

                          {/* Status Badge */}
                          <td className="p-3 text-center whitespace-nowrap">
                            {isFree ? (
                              <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30 text-[10px] font-bold">
                                Ücretsiz
                              </Badge>
                            ) : isFullyPaid ? (
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                ✓ Ödendi
                              </Badge>
                            ) : isPartial ? (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                ⏳ Kısmi Ödeme
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                ✕ Ödenmedi
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot
                  className={`font-mono text-xs border-t font-black ${
                    isDark ? "bg-slate-950 text-slate-100 border-slate-800" : "bg-slate-100 text-slate-900 border-slate-300"
                  }`}
                >
                  <tr>
                    <td colSpan={4} className="p-3 text-right">
                      TOPLAM GENEL TUTARLAR:
                    </td>
                    <td className="p-3 text-right text-slate-900 dark:text-slate-100 font-black text-sm">
                      {money(
                        paymentList.reduce((sum, r) => sum + (Number(r.price) || 0), 0)
                      )}
                    </td>
                    <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-black text-sm">
                      {money(
                        paymentList.reduce((sum, r) => sum + (Number(r.paid) || 0), 0)
                      )}
                    </td>
                    <td className="p-3 text-right text-amber-600 dark:text-amber-400 font-black text-sm">
                      {money(
                        paymentList.reduce(
                          (sum, r) => sum + (Number(r.price) || 0) - (Number(r.paid) || 0),
                          0
                        )
                      )}
                    </td>
                    <td></td>
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
