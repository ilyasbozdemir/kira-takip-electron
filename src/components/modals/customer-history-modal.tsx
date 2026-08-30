import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Copy,
  Clock,
} from "lucide-react";
import { money, type Customer, type Reservation, type Store } from "@/lib/rental-store";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { formatTRPhone } from "@/lib/phone-utils";

interface CustomerHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string;
  customerPhone?: string;
  theme: "dark" | "light";
  store: Store;
  hallById: (id: string) => { name: string } | undefined;
  onQuickMail?: (r: Reservation) => void;
  onCopySMS?: (r: Reservation) => void;
  onPrintDoc?: (r: Reservation) => void;
}

export function CustomerHistoryModal({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  theme,
  store,
  hallById,
  onQuickMail,
  onCopySMS,
  onPrintDoc,
}: CustomerHistoryModalProps): React.JSX.Element | null {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [customerName]);

  if (!open || !customerName) return null;

  const normalize = (str?: string) => (str || "").toLowerCase().trim();

  // Find CRM record if exists
  const registeredCustomer = store.customers?.find(
    (c) => normalize(c.name) === normalize(customerName)
  );

  // Find all reservations belonging to this customer
  const customerReservations = store.reservations.filter(
    (r) =>
      normalize(r.customer) === normalize(customerName) ||
      (customerPhone && r.phone && r.phone.replace(/\s+/g, "") === customerPhone.replace(/\s+/g, ""))
  );

  // Financial Stats
  const totalBookings = customerReservations.length;
  const totalSpend = customerReservations.reduce((sum, r) => sum + r.price, 0);
  const totalPaid = customerReservations.reduce((sum, r) => sum + r.paid, 0);
  const totalRemaining = totalSpend - totalPaid;

  const phoneDisplay = registeredCustomer?.phone || customerPhone || customerReservations[0]?.phone || "Belirtilmedi";
  const emailDisplay = registeredCustomer?.email || "Belirtilmedi";
  const addressDisplay = registeredCustomer?.address || "Belirtilmedi";
  const companyDisplay = registeredCustomer?.company || "Bireysel Müşteri";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          theme === "dark"
            ? "sm:max-w-175 bg-slate-900 border-slate-800 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto"
            : "sm:max-w-175 bg-white border-slate-200 text-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto"
        }
      >
        <DialogHeader className="border-b pb-3 border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                  theme === "dark"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                    : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                }`}
              >
                👤
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
                  {customerName}
                  {registeredCustomer ? (
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/40 text-emerald-400 text-[10px]">
                      ✅ CRM Kayıtlı Müşteri
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-400 text-[10px]">
                      📋 Etkinlik Derlemesi
                    </Badge>
                  )}
                </DialogTitle>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-indigo-400" /> {formatTRPhone(phoneDisplay) || phoneDisplay}
                  </span>
                  {emailDisplay !== "Belirtilmedi" && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-sky-400" /> {emailDisplay}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-amber-400" /> {companyDisplay}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Financial Overview Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
          <div
            className={`p-3 rounded-xl border ${
              theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Toplam Etkinlik</span>
            <span className="text-base font-extrabold text-indigo-400">{totalBookings} Adet</span>
          </div>
          <div
            className={`p-3 rounded-xl border ${
              theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Toplam Tahakkuk</span>
            <span className="text-base font-extrabold text-slate-200">{money(totalSpend)}</span>
          </div>
          <div
            className={`p-3 rounded-xl border ${
              theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Ödenen Tahsilat</span>
            <span className="text-base font-extrabold text-emerald-400">{money(totalPaid)}</span>
          </div>
          <div
            className={`p-3 rounded-xl border ${
              theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Kalan Borç</span>
            <span className={`text-base font-extrabold ${totalRemaining > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {money(totalRemaining)}
            </span>
          </div>
        </div>

        {/* Additional Contact Info */}
        {addressDisplay !== "Belirtilmedi" && (
          <div className="text-xs text-slate-400 flex items-center gap-1.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 mb-3">
            <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Adres: {addressDisplay}</span>
          </div>
        )}

        {/* Customer Reservation History List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>📅 Müşterinin Tüm Etkinlik ve Kiralama Geçmişi</span>
            <span className="text-[10px] font-normal text-slate-500">{customerReservations.length} Kayıt Bulundu</span>
          </h4>

          {customerReservations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-800">
              Bu müşteriye ait kayıtlı kiralama veya etkinlik geçmişi bulunamadı.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-2 max-h-75 overflow-y-auto pr-1">
                {customerReservations
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((r) => {
                  const v = store.venues.find((x) => x.id === r.venueId);
                  const h = hallById(r.hallId);
                  const isMailSent = Boolean(r.customerMailSentAt || r.mailSentAt);

                  return (
                    <div
                      key={r.id}
                      className={`p-3 rounded-xl border transition-all ${
                        theme === "dark"
                          ? "bg-slate-950/70 border-slate-800 hover:border-indigo-500/40"
                          : "bg-slate-50 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-indigo-400">
                              🏛️ {v?.name || "Mekan"} - {h?.name || "Salon"}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] border-indigo-500/30 text-indigo-300"
                            >
                              {r.eventType || "Genel"}
                            </Badge>
                            {r.status === "option" ? (
                              <Badge variant="outline" className="bg-amber-500/10 border-amber-500/40 text-amber-400 text-[9px]">
                                ⚠️ Opsiyon
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/40 text-emerald-400 text-[9px]">
                                ✅ Kesin
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                            <span>📅 {r.date}</span>
                            <span>⏰ {r.start} - {r.end}</span>
                            <span className="font-bold text-slate-200">
                              Ücret: {money(r.price)} (Ödenen: {money(r.paid)})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {onQuickMail && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onQuickMail(r)}
                              className="h-7 w-7 text-sky-400 hover:bg-sky-500/10"
                              title="Müşteriye E-posta & .ics Takvim Daveti Gönder"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onCopySMS && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onCopySMS(r)}
                              className="h-7 w-7 text-indigo-400 hover:bg-indigo-500/10"
                              title="SMS İletisi Kopyala"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onPrintDoc && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onPrintDoc(r)}
                              className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10"
                              title="Resmi Evrak & Makbuz Bas"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Mail Status Banner */}
                      <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        {isMailSent ? (
                          <span className="text-sky-400 font-medium flex items-center gap-1">
                            ✉️ E-posta İletildi ({r.customerMailSentAt || r.mailSentAt})
                          </span>
                        ) : (
                          <span className="text-amber-400/80 font-medium flex items-center gap-1">
                            ⚠️ E-posta Henüz Gönderilmedi
                          </span>
                        )}
                        {r.receiptNo && (
                          <span className="text-slate-400 font-mono">
                            Makbuz No: #{r.receiptNo}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {customerReservations.length > pageSize && (
                <div className="pt-2">
                  <PaginationControls
                    currentPage={currentPage}
                    totalItems={customerReservations.length}
                    pageSize={pageSize}
                    pageSizeOptions={[5, 10, 20]}
                    onPageChange={(p) => setCurrentPage(p)}
                    onPageSizeChange={(s) => setPageSize(s)}
                    theme={theme}
                    itemLabel="etkinlik"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
