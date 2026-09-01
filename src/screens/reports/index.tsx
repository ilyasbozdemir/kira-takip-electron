import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { ReportsStatsHeader } from "./reports-stats-header";
import { VenueBreakdownTab } from "./venue-breakdown-tab";
import { PaymentListTab } from "./payment-list-tab";
import { ReportsScreenProps, VenueStatItem } from "./types";
import { QuickPaymentModal } from "@/screens/accounting/quick-payment-modal";
import { type Reservation } from "@/lib/rental-store";
import { exportReservationsToExcel } from "@/lib/export-excel-template";

export function ReportsScreen({
  theme,
  monthStats,
  store,
}: ReportsScreenProps): React.JSX.Element {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"summary" | "payments">("summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | "paid" | "partial" | "unpaid">("all");
  const [quickPaymentReservation, setQuickPaymentReservation] = useState<Reservation | null>(null);

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

  const handleExportExcel = async () => {
    if (!store?.reservations || store.reservations.length === 0) {
      toast.warning("Dışa aktarılacak etkinlik veya rezervasyon kaydı bulunamadı.");
      return;
    }

    try {
      await exportReservationsToExcel({
        reportTitle: "GENEL ETKİNLİK, SALON TAHSİS VE GELİR RAPORU",
        reservations: store.reservations,
        venues: store.venues || [],
        filterSummary: "Tüm Tesisler ve Salonlar",
      });
      toast.success("📊 Kurumsal Excel tablosu (.xlsx) başarıyla indirildi!");
    } catch (err: any) {
      toast.error(`Excel dışa aktarma hatası: ${err.message || err}`);
    }
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
          onUpdatePayment={(r) => setQuickPaymentReservation(r)}
        />
      )}

      {/* Quick Payment & Status Modal */}
      <QuickPaymentModal
        reservation={quickPaymentReservation}
        onClose={() => setQuickPaymentReservation(null)}
        theme={theme}
        venues={store?.venues || []}
      />
    </div>
  );
}

export * from "./types";
