import React from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Mail,
  MessageSquare,
  Phone,
  Printer,
  QrCode,
  Receipt,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { hoursBetween, money, type Reservation, type Venue } from "@/lib/rental-store";
import { formatTRPhone, getWhatsAppUrl } from "@/lib/phone-utils";

interface ReservationDrawerProps {
  reservation: Reservation | null;
  onClose: () => void;
  theme: "dark" | "light";
  store: {
    venues: Venue[];
    personnel?: Array<{ id: string; name: string; title?: string; phone?: string }>;
  };
  hallById: (id: string) => { name: string } | undefined;
  editReceiptNo: string;
  setEditReceiptNo: (v: string) => void;
  editPaymentMethod: string;
  setEditPaymentMethod: (v: string) => void;
  editPaidAmount: number | "";
  setEditPaidAmount: (v: number | "") => void;
  updateReservationStatus: (id: string, status: "confirmed" | "option") => Promise<void>;
  updateReservationDetails: (id: string, details: Partial<Reservation>) => Promise<void>;
  setSelectedReservation: React.Dispatch<React.SetStateAction<Reservation | null>>;
  onPrintDoc: (r: Reservation) => void;
  onCopySMS: (r: Reservation) => void;
  onQuickMail: (r: Reservation) => void;
  onPromptDelete: (type: "reservation", id: string, title: string) => void;
  onNavigateToCustomer?: (customerName: string) => void;
}

export function ReservationDrawer({
  reservation,
  onClose,
  theme,
  store,
  hallById,
  editReceiptNo,
  setEditReceiptNo,
  editPaymentMethod,
  setEditPaymentMethod,
  editPaidAmount,
  setEditPaidAmount,
  updateReservationStatus,
  updateReservationDetails,
  setSelectedReservation,
  onPrintDoc,
  onCopySMS,
  onQuickMail,
  onPromptDelete,
  onNavigateToCustomer,
}: ReservationDrawerProps): React.JSX.Element | null {
  if (!reservation) return null;

  const isDark = theme === "dark";
  const targetVenue = store.venues.find((v) => v.id === reservation.venueId);
  const targetHall = hallById(reservation.hallId);
  const manager = targetVenue?.managerName
    ? {
        name: targetVenue.managerName,
        title: targetVenue.managerTitle || "Tesis Sorumlusu",
        phone: targetVenue.managerPhone,
      }
    : store.personnel?.[0];

  const price = Number(reservation.price) || 0;
  const currentPaid = editPaidAmount === "" ? Number(reservation.paid) || 0 : Number(editPaidAmount);
  const remaining = Math.max(0, price - currentPaid);

  const qrText = `TESIS: ${targetVenue?.name || "Mekan"}\nSALON: ${
    targetHall?.name || "Salon"
  }\nTARIH: ${reservation.date} (${reservation.start}-${reservation.end})\nMUSTERI: ${reservation.customer}\nSORUMLU: ${
    manager?.name || "Belirtilmedi"
  } (${manager?.phone || ""})`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${
    encodeURIComponent(qrText)
  }`;

  const handleSetFullPayment = () => {
    setEditPaidAmount(price);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col border transition-colors animate-in zoom-in-95 duration-200 ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                  {reservation.customer}
                </h3>
                <Badge className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold px-2">
                  {reservation.eventType || "Etkinlik"}
                </Badge>
                <Badge
                  className={`text-[10px] font-bold px-2 py-0.5 ${
                    reservation.status === "confirmed"
                      ? "bg-emerald-600 text-white"
                      : reservation.status === "option"
                      ? "bg-amber-500 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {reservation.status === "confirmed"
                    ? "✅ Kesinleşti"
                    : reservation.status === "option"
                    ? "⏳ Opsiyonlu"
                    : "❌ İptal"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>📅 {reservation.date}</span>
                <span>•</span>
                <span>⏱️ {reservation.start} - {reservation.end} ({hoursBetween(reservation.start, reservation.end)} Saat)</span>
                <span>•</span>
                <span>🏢 {targetVenue?.name} / {targetHall?.name}</span>
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg cursor-pointer"
            title="Kapat (ESC)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Body: Spacious 2-Column Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT COLUMN: Customer & Venue Details (7 Cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Customer & Contact Card */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark
                    ? "bg-slate-950/60 border-slate-800"
                    : "bg-slate-50/80 border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-500" />
                    Müşteri & İletişim Bilgileri
                  </h4>
                  {onNavigateToCustomer && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onClose();
                        onNavigateToCustomer(reservation.customer);
                      }}
                      className="h-6 px-2 text-[10px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold"
                    >
                      CRM Profili →
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                      Müşteri / Kurum Adı
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 text-sm">
                      {reservation.customer}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                      İletişim Telefonu
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {formatTRPhone(reservation.phone)}
                      </span>
                      <a
                        href={getWhatsAppUrl(reservation.phone)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (window.electronAPI?.openExternalLink) {
                            e.preventDefault();
                            window.electronAPI.openExternalLink(getWhatsAppUrl(reservation.phone));
                          }
                        }}
                        className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold hover:bg-emerald-500/20 border border-emerald-500/30"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  {reservation.email && (
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                        E-posta Adresi
                      </span>
                      <span className="font-mono font-medium text-sky-600 dark:text-sky-400">
                        {reservation.email}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                      Etkinlik Türü
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {reservation.eventType || "Etkinlik"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Venue & Hall Details Card */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark
                    ? "bg-slate-950/60 border-slate-800"
                    : "bg-slate-50/80 border-slate-200/90 shadow-2xs"
                }`}
              >
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-sky-500" />
                  Mekan, Salon & Tahsis Saatleri
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                      Mekan / Tesis
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {targetVenue?.name || "-"}
                    </strong>
                    {targetVenue?.district && (
                      <span className="text-[10px] text-slate-500 block">
                        ({targetVenue.district})
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                      Tahsis Edilen Salon
                    </span>
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {targetHall?.name || "-"}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                      Kullanım Süresi
                    </span>
                    <strong className="font-mono text-slate-900 dark:text-slate-100">
                      {reservation.start} - {reservation.end}
                    </strong>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      ({hoursBetween(reservation.start, reservation.end)} Saat Seans)
                    </span>
                  </div>
                </div>
              </div>

              {/* Facility Manager & Verification QR Code */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark
                    ? "bg-slate-950/60 border-slate-800"
                    : "bg-slate-50/80 border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5 text-indigo-500" />
                    Tesis Sorumlusu & Doğrulama Karekodu
                  </h4>
                  <span className="text-[10px] text-slate-400">E-Devlet / QR Denetim Uyumlu</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-18 w-18 p-1 bg-white rounded-xl border border-slate-300 shadow-xs shrink-0 flex items-center justify-center">
                    <img
                      src={qrUrl}
                      alt="Tahsis Doğrulama Karekodu"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="space-y-1 text-xs flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Yetkili Tesis Amiri / Görevli:
                      </span>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {manager?.name || "Tesis Amiri Atanmadı"}
                      </p>
                      <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                        {manager?.title || "Tesis Sorumlusu"}
                      </p>
                    </div>
                    {manager?.phone && (
                      <div className="flex items-center gap-2 pt-0.5 font-mono">
                        <a
                          href={getWhatsAppUrl(manager.phone)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (window.electronAPI?.openExternalLink) {
                              e.preventDefault();
                              window.electronAPI.openExternalLink(getWhatsAppUrl(manager.phone));
                            }
                          }}
                          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline text-[11px]"
                        >
                          📞 {formatTRPhone(manager.phone)}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Decision & Notes */}
              {(reservation.decisionInfo || reservation.note) && (
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800 text-slate-300"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {reservation.decisionInfo && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Encümen / Meclis Kararı Dayanağı:
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {reservation.decisionInfo}
                      </span>
                    </div>
                  )}
                  {reservation.note && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Özel Notlar:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                        {reservation.note}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Financials, Status & Payment Actions (5 Cols on desktop) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Status Toggle Card */}
              {reservation.status === "option" ? (
                <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-300 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        ⚠️ Opsiyonlu / Ön Rezervasyon
                      </h4>
                      <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-400 leading-relaxed">
                        Bu salon tahsisine şerh düşülmüştür. Kesin tahsise dönüştürmek için butona tıklayın.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      await updateReservationStatus(reservation.id, "confirmed");
                      setSelectedReservation((prev) =>
                        prev ? { ...prev, status: "confirmed" } : null
                      );
                      toast.success("Etkinlik yer ayırtması kesinleştirildi!");
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8.5 shadow-sm cursor-pointer"
                  >
                    <Check className="h-4 w-4 mr-1.5" /> Kesinleştir (Onayla)
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        ✅ Kesinleşmiş Rezervasyon
                      </h4>
                      <p className="text-[11px] mt-0.5 text-emerald-800 dark:text-emerald-400">
                        Bu etkinlik salon tahsis kaydı onaylanmış ve kesinleşmiştir.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await updateReservationStatus(reservation.id, "option");
                      setSelectedReservation((prev) =>
                        prev ? { ...prev, status: "option" } : null
                      );
                      toast.info("Etkinlik opsiyonlu (şerhli) duruma getirildi.");
                    }}
                    className="w-full text-xs h-7.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-semibold cursor-pointer"
                  >
                    ⚠️ Şerh Düş (Opsiyonel Duruma Al)
                  </Button>
                </div>
              )}

              {/* Financial Breakdown Tiles */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark
                    ? "bg-slate-950/60 border-slate-800"
                    : "bg-slate-50/80 border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                    Finansal Döküm & Kasa
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Ödeme Durumu
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark
                        ? "bg-indigo-950/30 border-indigo-900/50 text-indigo-300"
                        : "bg-indigo-50 border-indigo-200 text-indigo-900"
                    }`}
                  >
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider block opacity-75">
                      Toplam Ücret
                    </span>
                    <strong className="text-xs font-black mt-0.5 block">
                      {money(price)}
                    </strong>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      isDark
                        ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider block opacity-75">
                      Tahsil Edilen
                    </span>
                    <strong className="text-xs font-black mt-0.5 block">
                      {money(currentPaid)}
                    </strong>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      remaining > 0
                        ? isDark
                          ? "bg-rose-950/30 border-rose-900/50 text-rose-400"
                          : "bg-rose-50 border-rose-200 text-rose-900"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    }`}
                  >
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider block opacity-75">
                      Kalan Bakiye
                    </span>
                    <strong className="text-xs font-black mt-0.5 block">
                      {money(remaining)}
                    </strong>
                  </div>
                </div>

                {/* Receipt & Payment Form */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Makbuz / Fiş No
                      </Label>
                      <Input
                        value={editReceiptNo}
                        placeholder="Örn: MKB-2026/042"
                        onChange={(e) => setEditReceiptNo(e.target.value)}
                        className={`text-xs h-8 font-mono mt-1 ${
                          isDark
                            ? "bg-slate-900 border-slate-800 text-slate-100"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Ödeme Yöntemi
                      </Label>
                      <Select
                        value={editPaymentMethod}
                        onValueChange={setEditPaymentMethod}
                      >
                        <SelectTrigger
                          className={`text-xs h-8 mt-1 ${
                            isDark
                              ? "bg-slate-900 border-slate-800 text-slate-100"
                              : "bg-white border-slate-300 text-slate-900"
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            isDark
                              ? "bg-slate-900 border-slate-800 text-slate-200"
                              : "bg-white border-slate-200 text-slate-900"
                          }
                        >
                          <SelectItem value="Nakit">💵 Nakit Kasa</SelectItem>
                          <SelectItem value="Havale/EFT">🏦 Banka / Havale</SelectItem>
                          <SelectItem value="Kredi Kartı">💳 Kredi Kartı POS</SelectItem>
                          <SelectItem value="Dekont">📄 Resmi Dekont</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Tahsil Edilen Tutar (TL)
                      </Label>
                      {remaining > 0 && (
                        <button
                          type="button"
                          onClick={handleSetFullPayment}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                        >
                          Tamamını Tahsil Et ({money(price)})
                        </button>
                      )}
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={editPaidAmount}
                      onChange={(e) =>
                        setEditPaidAmount(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className={`text-xs h-8 font-mono font-bold text-emerald-500 ${
                        isDark
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-slate-300"
                      }`}
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={async () => {
                      await updateReservationDetails(reservation.id, {
                        receiptNo: editReceiptNo,
                        paymentMethod: editPaymentMethod,
                        paid: Number(editPaidAmount) || 0,
                      });
                      setSelectedReservation((prev) =>
                        prev
                          ? {
                              ...prev,
                              receiptNo: editReceiptNo,
                              paymentMethod: editPaymentMethod,
                              paid: Number(editPaidAmount) || 0,
                            }
                          : null
                      );
                      toast.success("Ödeme ve makbuz bilgileri güncellendi!");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-8.5 shadow-xs cursor-pointer"
                  >
                    <Receipt className="h-3.5 w-3.5 mr-1" /> Ödeme & Makbuzu Kaydet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions Toolbar */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrintDoc(reservation)}
              className="text-xs h-8 font-semibold cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 mr-1 text-slate-500" /> Resmi Evrak Yazdır
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopySMS(reservation)}
              className="text-xs h-8 font-semibold cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1 text-slate-500" /> SMS / WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickMail(reservation)}
              className="text-xs h-8 font-semibold cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 mr-1 text-slate-500" /> E-posta
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const id = reservation.id;
                const name = reservation.customer;
                onClose();
                onPromptDelete("reservation", id, name);
              }}
              className="text-xs h-8 font-semibold cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Etkinliği Sil
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 font-semibold cursor-pointer"
            >
              Kapat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
