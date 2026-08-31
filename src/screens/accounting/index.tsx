import React, { useState, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar as CalendarIcon,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Layers,
  Pencil,
  Plus,
  Printer,
  Receipt,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money, type FinancialTransaction, type Reservation, toKey } from "@/lib/rental-store";
import { NewTransactionModal } from "./new-transaction-modal";
import { EditTransactionModal } from "./edit-transaction-modal";
import { QuickPaymentModal } from "./quick-payment-modal";
import { AccountingScreenProps } from "./types";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { toast } from "sonner";

export function AccountingScreen({
  theme,
  store,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onSelectReservation,
  institutionName,
}: AccountingScreenProps): React.JSX.Element {
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"all" | "incomes" | "expenses" | "reports">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenueFilter, setSelectedVenueFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "this_month" | "this_year">("all");

  // Modal States
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newModalType, setNewModalType] = useState<"income" | "expense">("expense");
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [quickPaymentReservation, setQuickPaymentReservation] = useState<Reservation | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedVenueFilter, dateFilter, activeTab]);

  // Combine Reservation Incomes + Manual Transactions
  const allEntries = useMemo(() => {
    const list: Array<{
      id: string;
      isReservation: boolean;
      type: "income" | "expense";
      category: string;
      title: string;
      amount: number;
      date: string;
      paymentMethod: string;
      receiptNo?: string;
      venueId?: string;
      description?: string;
      rawReservation?: Reservation;
      rawTransaction?: FinancialTransaction;
    }> = [];

    // 1. Paid amounts from Reservations (Gelirler)
    (store.reservations || []).forEach((r) => {
      const paid = Number(r.paid) || 0;
      if (paid > 0) {
        list.push({
          id: `res-${r.id}`,
          isReservation: true,
          type: "income",
          category: "Salon / Mekan Tahsisi",
          title: `${r.customer} (${r.eventType || "Etkinlik"})`,
          amount: paid,
          date: r.date,
          paymentMethod: r.paymentMethod || "Nakit",
          receiptNo: r.receiptNo,
          venueId: r.venueId,
          description: r.note || `${r.start}-${r.end} saatleri arası seans tahsilatı`,
          rawReservation: r,
        });
      }
    });

    // 2. Manual Financial Transactions (Gelir & Gider)
    (store.transactions || []).forEach((t) => {
      list.push({
        id: t.id,
        isReservation: false,
        type: t.type,
        category: t.category,
        title: t.customerName || t.category,
        amount: Number(t.amount) || 0,
        date: t.date,
        paymentMethod: t.paymentMethod,
        receiptNo: t.receiptNo,
        venueId: t.venueId,
        description: t.description,
        rawTransaction: t,
      });
    });

    // Sort by Date descending
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [store.reservations, store.transactions]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const currentYearKey = `${today.getFullYear()}`;

    return allEntries.filter((item) => {
      // Tab filter
      if (activeTab === "incomes" && item.type !== "income") return false;
      if (activeTab === "expenses" && item.type !== "expense") return false;

      // Venue filter
      if (selectedVenueFilter !== "all" && item.venueId !== selectedVenueFilter) {
        return false;
      }

      // Date filter
      if (dateFilter === "this_month" && !item.date.startsWith(currentMonthKey)) {
        return false;
      }
      if (dateFilter === "this_year" && !item.date.startsWith(currentYearKey)) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchReceipt = (item.receiptNo || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        return matchTitle || matchCategory || matchReceipt || matchDesc;
      }

      return true;
    });
  }, [allEntries, activeTab, selectedVenueFilter, dateFilter, searchTerm]);

  // Summary Metrics
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let cashTotal = 0;
    let bankTotal = 0;
    let posTotal = 0;

    allEntries.forEach((e) => {
      if (e.type === "income") {
        totalIncome += e.amount;
        if (e.paymentMethod.toLowerCase().includes("nakit")) cashTotal += e.amount;
        else if (e.paymentMethod.toLowerCase().includes("kredi") || e.paymentMethod.toLowerCase().includes("pos")) posTotal += e.amount;
        else bankTotal += e.amount;
      } else {
        totalExpense += e.amount;
        if (e.paymentMethod.toLowerCase().includes("nakit")) cashTotal -= e.amount;
        else if (e.paymentMethod.toLowerCase().includes("kredi") || e.paymentMethod.toLowerCase().includes("pos")) posTotal -= e.amount;
        else bankTotal -= e.amount;
      }
    });

    // Outstanding / unpaid reservation balance
    let totalPendingReceivable = 0;
    (store.reservations || []).forEach((r) => {
      const price = Number(r.price) || 0;
      const paid = Number(r.paid) || 0;
      if (price > paid && r.status !== "cancelled") {
        totalPendingReceivable += price - paid;
      }
    });

    const netProfit = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netProfit,
      totalPendingReceivable,
      cashTotal,
      bankTotal,
      posTotal,
    };
  }, [allEntries, store.reservations]);

  // Category breakdown for expenses
  const expenseCategoriesBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    allEntries
      .filter((e) => e.type === "expense")
      .forEach((e) => {
        const cur = map.get(e.category) || 0;
        map.set(e.category, cur + e.amount);
      });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allEntries]);

  const getVenueName = (vId?: string) => {
    if (!vId) return "Genel İşletme";
    return store.venues.find((v) => v.id === vId)?.name || "Mekan";
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
              <WalletCards className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Muhasebe, Kasa & Gelir-Gider Yönetimi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kira tahsilatları, faturalar, personel giderleri, kasa nakit akışı ve finansal raporlama.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrintSummary}
            className="text-xs h-8.5 font-semibold"
          >
            <Printer className="h-3.5 w-3.5 mr-1" /> Kasa Raporu Yazdır
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setNewModalType("income");
              setNewModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8.5 font-bold shadow-xs"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> + Ek Gelir Ekle
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setNewModalType("expense");
              setNewModalOpen(true);
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8.5 font-bold shadow-xs"
          >
            <TrendingDown className="h-3.5 w-3.5 mr-1" /> + Yeni Gider Ekle
          </Button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card className={`border rounded-2xl ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-2xs"}`}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Toplam Gelir / Kasa Girişi
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black font-mono text-emerald-500">
              {money(summary.totalIncome)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Kira tahsilatları ve ek işletme gelirleri
            </p>
          </CardContent>
        </Card>

        {/* Total Expense */}
        <Card className={`border rounded-2xl ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-2xs"}`}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Toplam Gider / Harcama
            </span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black font-mono text-rose-500">
              {money(summary.totalExpense)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Faturalar, personel, bakım ve sarf harcamaları
            </p>
          </CardContent>
        </Card>

        {/* Net Profit / Balance */}
        <Card className={`border rounded-2xl ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-2xs"}`}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Kasa Bakiyesi (Kâr / Bakiye)
            </span>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${summary.netProfit >= 0 ? "bg-indigo-500/10 text-indigo-400" : "bg-rose-500/10 text-rose-400"}`}>
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-black font-mono ${summary.netProfit >= 0 ? "text-indigo-400" : "text-rose-500"}`}>
              {money(summary.netProfit)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Gelir - Gider net nakit fazlası
            </p>
          </CardContent>
        </Card>

        {/* Pending Receivables */}
        <Card className={`border rounded-2xl ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-2xs"}`}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tahsil Edilecek Kalan Borç
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black font-mono text-amber-400">
              {money(summary.totalPendingReceivable)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Rezervasyonlardan bekleyen toplam alacak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Tabs
            value={activeTab}
            onValueChange={(val: any) => setActiveTab(val)}
            className="w-full md:w-auto"
          >
            <TabsList className={`grid grid-cols-4 h-9 p-1 border ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
              <TabsTrigger value="all" className="text-xs font-semibold">
                Tüm Kasa ({allEntries.length})
              </TabsTrigger>
              <TabsTrigger value="incomes" className="text-xs font-semibold text-emerald-500">
                Gelirler
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs font-semibold text-rose-500">
                Giderler
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs font-semibold text-indigo-400">
                Kategori Raporu
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Venue Filter */}
            <Select value={selectedVenueFilter} onValueChange={setSelectedVenueFilter}>
              <SelectTrigger className="text-xs h-8.5 w-40">
                <SelectValue placeholder="Tüm Mekanlar" />
              </SelectTrigger>
              <SelectContent className={`max-h-60 ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200"}`}>
                <SelectItem value="all">Tüm Mekanlar</SelectItem>
                {store.venues.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    🏢 {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
              <SelectTrigger className="text-xs h-8.5 w-32">
                <SelectValue placeholder="Tüm Zamanlar" />
              </SelectTrigger>
              <SelectContent className={`max-h-60 ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200"}`}>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="this_month">Bu Ay</SelectItem>
                <SelectItem value="this_year">Bu Yıl</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative w-48">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <Input
                placeholder="İşlem ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8.5"
              />
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab !== "reports" ? (
          <div className="space-y-3">
            {filteredEntries.length === 0 ? (
              <div
                className={`py-12 text-center rounded-2xl border ${
                  isDark
                    ? "bg-slate-900/50 border-slate-800 text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                <Receipt className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-300">
                  {searchTerm || selectedVenueFilter !== "all" || dateFilter !== "all"
                    ? "Filtreye uygun muhasebe kaydı bulunamadı."
                    : "Henüz kayıtlı gelir veya gider hareketi yok."}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Üstteki butonları kullanarak tesisinizin ilk gelir veya harcama kaydını ekleyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item) => {
                    const isIncome = item.type === "income";
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isDark
                            ? "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                            : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isIncome
                                ? isDark
                                  ? "bg-slate-900 border-slate-800 text-emerald-400"
                                  : "bg-white border-slate-200 text-emerald-600 shadow-2xs"
                                : isDark
                                ? "bg-slate-900 border-slate-800 text-rose-400"
                                : "bg-white border-slate-200 text-rose-600 shadow-2xs"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono font-bold px-1.5 py-0"
                              >
                                📅 {item.date}
                              </Badge>
                              <Badge
                                className={`text-[9px] px-1.5 py-0 font-bold ${
                                  isIncome
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {item.category}
                              </Badge>
                              {item.receiptNo && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  Fiş/Makbuz: #{item.receiptNo}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500">
                                • {getVenueName(item.venueId)}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {item.title}
                            </h4>

                            {item.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                                📝 {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/40">
                          <div className="text-right">
                            <span
                              className={`text-sm font-black font-mono block ${
                                isIncome ? "text-emerald-500" : "text-rose-500"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {money(item.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              💳 {item.paymentMethod}
                            </span>
                          </div>

                          {!item.isReservation && item.rawTransaction && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingTransaction(item.rawTransaction!)}
                                className="h-7 w-7 text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                                title="Kaydı Düzenle"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm("Bu işlemi silmek istediğinize emin misiniz?")) {
                                    onDeleteTransaction(item.id);
                                  }
                                }}
                                className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                                title="Kaydı Sil"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}

                          {item.isReservation && item.rawReservation && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setQuickPaymentReservation(item.rawReservation!)}
                                className="h-7 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1 cursor-pointer"
                                title="Tahsilat / Ödeme Durumunu Değiştir"
                              >
                                <Receipt className="h-3 w-3" />
                                Tahsilat İşle
                              </Button>

                              {onSelectReservation && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onSelectReservation(item.rawReservation!)}
                                  className="h-7 text-[10px] text-slate-400 hover:text-slate-200"
                                >
                                  Detay
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {filteredEntries.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                totalItems={filteredEntries.length}
                pageSize={pageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                theme={theme}
                itemLabel="işlem"
              />
            )}
          </div>
        ) : (
          /* Reports & Category Breakdown Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Gider Kalemleri Dağılımı */}
            <Card className={`rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-rose-500">
                  <TrendingDown className="h-4 w-4" />
                  Gider Kalemleri & Harcama Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                {expenseCategoriesBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    Henüz kayıtlı harcama bulunmuyor.
                  </p>
                ) : (
                  expenseCategoriesBreakdown.map(([cat, total]) => {
                    const pct = summary.totalExpense > 0 ? (total / summary.totalExpense) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-200">{cat}</span>
                          <span className="font-mono text-rose-500">{money(total)} (%{pct.toFixed(1)})</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Ödeme Kanalları Dağılımı */}
            <Card className={`rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-indigo-400">
                  <CreditCard className="h-4 w-4" />
                  Ödeme Kanalları & Kasa Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💵</span>
                    <div>
                      <h5 className="font-bold text-xs">Nakit Kasa</h5>
                      <span className="text-[10px] text-slate-400">Eldeden yapılan tahsilat ve ödemeler</span>
                    </div>
                  </div>
                  <span className="font-black font-mono text-xs text-slate-200">{money(summary.cashTotal)}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏦</span>
                    <div>
                      <h5 className="font-bold text-xs">Banka / Havale / EFT</h5>
                      <span className="text-[10px] text-slate-400">Banka hesap hareketleri</span>
                    </div>
                  </div>
                  <span className="font-black font-mono text-xs text-slate-200">{money(summary.bankTotal)}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💳</span>
                    <div>
                      <h5 className="font-bold text-xs">Kredi Kartı / POS</h5>
                      <span className="text-[10px] text-slate-400">POS cihazı çekimleri</span>
                    </div>
                  </div>
                  <span className="font-black font-mono text-xs text-slate-200">{money(summary.posTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* New Transaction Modal */}
      <NewTransactionModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        theme={theme}
        initialType={newModalType}
        venues={store.venues}
        onSave={onAddTransaction}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        theme={theme}
        venues={store.venues}
        onUpdate={onUpdateTransaction}
        onDelete={onDeleteTransaction}
      />

      {/* Quick Payment & Reservation Status Updater Modal */}
      <QuickPaymentModal
        reservation={quickPaymentReservation}
        onClose={() => setQuickPaymentReservation(null)}
        theme={theme}
        venues={store.venues}
      />
    </div>
  );
}
