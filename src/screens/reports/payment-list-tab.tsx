import React from "react";
import { Search, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { money, type Reservation, type Venue } from "@/lib/rental-store";

interface PaymentListTabProps {
  theme: "dark" | "light";
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  paymentStatusFilter: "all" | "paid" | "partial" | "unpaid";
  setPaymentStatusFilter: (status: "all" | "paid" | "partial" | "unpaid") => void;
  filteredPayments: Reservation[];
  venues: Venue[];
  currentPage: number;
  pageSize: number;
  setCurrentPage: (p: number) => void;
  setPageSize: (s: number) => void;
  onUpdatePayment?: (r: Reservation) => void;
}

export const PaymentListTab: React.FC<PaymentListTabProps> = ({
  theme,
  searchTerm,
  setSearchTerm,
  paymentStatusFilter,
  setPaymentStatusFilter,
  filteredPayments,
  venues,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
  onUpdatePayment,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="space-y-4">
      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Müşteri, makbuz no, telefon veya mekan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-9 text-xs h-9 rounded-xl ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-xs"
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "Tümü" },
            { id: "paid", label: "Tamamı Ödendi" },
            { id: "partial", label: "Kısmi Ödeme" },
            { id: "unpaid", label: "Ödeme Alınmadı" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPaymentStatusFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                paymentStatusFilter === item.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark
                  ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr
              className={`border-b text-[10px] uppercase font-black tracking-wider ${
                isDark
                  ? "bg-slate-950 text-slate-300 border-slate-800"
                  : "bg-slate-100 text-slate-900 border-slate-300"
              }`}
            >
              <th className="p-3">Tarih / Saat</th>
              <th className="p-3">Müşteri / Kurum</th>
              <th className="p-3">Mekan & Salon</th>
              <th className="p-3">Makbuz / Dekont</th>
              <th className="p-3 text-right">Toplam Tutar</th>
              <th className="p-3 text-right">Tahsil Edilen</th>
              <th className="p-3 text-right">Kalan Bakiye</th>
              <th className="p-3 text-center">Durum</th>
              <th className="p-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark ? "divide-slate-800/70" : "divide-slate-200"
            }`}
          >
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  Arama kriterlerine uygun ödeme kaydı bulunamadı.
                </td>
              </tr>
            ) : (
              filteredPayments
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((r) => {
                  const v = venues.find((x) => x.id === r.venueId);
                  const h = v?.halls?.find((x) => x.id === r.hallId);
                  const price = Number(r.price) || 0;
                  const paid = Number(r.paid) || 0;
                  const rem = price - paid;

                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors ${
                        isDark
                          ? "hover:bg-slate-800/40"
                          : "hover:bg-indigo-50/50"
                      }`}
                    >
                      <td className="p-3 font-mono">
                        <div
                          className={`font-black ${
                            isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {r.date}
                        </div>
                        <div
                          className={`text-[10px] ${
                            isDark ? "text-slate-400" : "text-slate-500 font-medium"
                          }`}
                        >
                          {r.start}-{r.end}
                        </div>
                      </td>
                      <td className="p-3">
                        <div
                          className={`font-extrabold ${
                            isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {r.customer}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${
                            isDark ? "text-slate-400" : "text-slate-500 font-medium"
                          }`}
                        >
                          {r.phone}
                        </div>
                      </td>
                      <td className="p-3">
                        <div
                          className={`font-bold ${
                            isDark ? "text-slate-200" : "text-slate-800"
                          }`}
                        >
                          {v?.name}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                          {h?.name}
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        {r.receiptNo ? (
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold ${
                              isDark
                                ? "border-slate-700 text-slate-300 bg-slate-950/40"
                                : "border-slate-200 text-slate-700 bg-slate-50"
                            }`}
                          >
                            🧾 {r.receiptNo}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td
                        className={`p-3 text-right font-mono font-bold ${
                          isDark ? "text-slate-200" : "text-slate-900"
                        }`}
                      >
                        {money(price)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {money(paid)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        {rem > 0 ? money(rem) : "0 ₺"}
                      </td>
                      <td className="p-3 text-center">
                        {paid >= price ? (
                          <Badge className="bg-emerald-600 text-white text-[9px] font-bold">
                            Tamamlandı
                          </Badge>
                        ) : paid > 0 ? (
                          <Badge className="bg-amber-600 text-white text-[9px] font-bold">
                            Kısmi
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-600 text-white text-[9px] font-bold">
                            Ödenmedi
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {onUpdatePayment && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdatePayment(r)}
                            className="h-6.5 px-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Tahsilat / Ödeme Durumunu Değiştir"
                          >
                            <Receipt className="h-3 w-3 mr-1" />
                            Tahsilat İşle
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredPayments.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalItems={filteredPayments.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 15, 25, 50, 100]}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(s) => setPageSize(s)}
          theme={theme}
          itemLabel="ödeme kaydı"
        />
      )}
    </div>
  );
};
