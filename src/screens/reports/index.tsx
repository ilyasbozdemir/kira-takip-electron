import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { ReportsStatsHeader } from "./reports-stats-header";
import { VenueBreakdownTab } from "./venue-breakdown-tab";
import { PaymentListTab } from "./payment-list-tab";
import { ReportsScreenProps, VenueStatItem } from "./types";

export function ReportsScreen({
  theme,
  monthStats,
  store,
}: ReportsScreenProps): React.JSX.Element {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"summary" | "payments">("summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | "paid" | "partial" | "unpaid">("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentStatusFilter]);

  // Venue Financial Breakdown
  const venueStats: VenueStatItem[] = useMemo(() => {
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
        (r.date && r.date.includes(q));

      if (!matchesSearch) return false;

      if (paymentStatusFilter === "paid") return paid >= price && price > 0;
      if (paymentStatusFilter === "partial") return paid > 0 && remaining > 0;
      if (paymentStatusFilter === "unpaid") return paid === 0 && price > 0;

      return true;
    });
  }, [store, searchTerm, paymentStatusFilter]);

  const handleExportExcel = () => {
    if (!store?.reservations || store.reservations.length === 0) {
      toast.error("Dışa aktarılacak rezervasyon verisi bulunmuyor.");
      return;
    }

    const headers = [
      "ID",
      "Tarih",
      "Baslangic",
      "Bitis",
      "Musteri",
      "Telefon",
      "Mekan",
      "Salon",
      "Etkinlik Turu",
      "Toplam Fiyat (TL)",
      "Odenen (TL)",
      "Kalan (TL)",
      "Makbuz No",
      "Durum",
    ];

    const rows = store.reservations.map((r) => {
      const v = store.venues.find((x) => x.id === r.venueId);
      const h = v?.halls?.find((x) => x.id === r.hallId);
      const rem = (Number(r.price) || 0) - (Number(r.paid) || 0);

      return [
        `"${r.id}"`,
        `"${r.date}"`,
        `"${r.start}"`,
        `"${r.end}"`,
        `"${(r.customer || "").replace(/"/g, '""')}"`,
        `"${r.phone || ""}"`,
        `"${(v?.name || "").replace(/"/g, '""')}"`,
        `"${(h?.name || "").replace(/"/g, '""')}"`,
        `"${r.eventType || "Etkinlik"}"`,
        r.price || 0,
        r.paid || 0,
        rem,
        `"${r.receiptNo || ""}"`,
        `"${r.status === "option" ? "Opsiyon" : "Kesin"}"`,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Finansal_Rapor_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Muhasebe ve finans raporu Excel formatında (.csv) indirildi!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <ReportsStatsHeader
        theme={theme}
        monthStats={monthStats}
        totalReservationsCount={store?.reservations?.length || 0}
        onExportExcel={handleExportExcel}
        onPrintReport={handlePrint}
      />

      {/* View Switch Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "summary"
              ? "bg-indigo-600 text-white shadow-xs"
              : isDark
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Mekan Bazlı Finansal Dağılım
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "payments"
              ? "bg-indigo-600 text-white shadow-xs"
              : isDark
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Tahsilat & Ödeme Hareketleri ({paymentList.length})
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "summary" ? (
        <VenueBreakdownTab theme={theme} venueStats={venueStats} />
      ) : (
        <PaymentListTab
          theme={theme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          paymentStatusFilter={paymentStatusFilter}
          setPaymentStatusFilter={setPaymentStatusFilter}
          filteredPayments={paymentList}
          venues={store?.venues || []}
          currentPage={currentPage}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
        />
      )}
    </div>
  );
}

export * from "./types";
