import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Printer,
  QrCode,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const targetVenue = store.venues.find((v) => v.id === reservation.venueId);
  const manager = targetVenue?.managerName
    ? {
      name: targetVenue.managerName,
      title: targetVenue.managerTitle || "Tesis Sorumlusu",
      phone: targetVenue.managerPhone,
    }
    : store.personnel?.[0];

  const qrText = `TESIS: ${targetVenue?.name || "Mekan"}\nSALON: ${
    hallById(reservation.hallId)?.name || "Salon"
  }\nTARIH: ${reservation.date} (${reservation.start}-${reservation.end})\nMUSTERI: ${reservation.customer}\nSORUMLU: ${
    manager?.name || "Belirtilmedi"
  } (${manager?.phone || ""})`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${
    encodeURIComponent(qrText)
  }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col border transition-colors animate-in zoom-in-95 duration-200 ${
          theme === "dark"
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-bold">
                  Etkinlik & Tahsis Detayları
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tarih:{" "}
                  <strong className="text-indigo-400">
                    {reservation.date}
                  </strong>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Alert Banner */}
          {reservation.status === "option"
            ? (
              <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-300 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      ⚠️ Opsiyonlu / Şerhli (Ön Kayıt)
                    </h4>
                    <p className="text-xs mt-1 text-amber-800 dark:text-amber-400 leading-relaxed">
                      Bu salon kiralamasına <strong>şerh düşülmüştür</strong>. Kesinleşmiş yer ayırtması değildir.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    await updateReservationStatus(
                      reservation.id,
                      "confirmed",
                    );
                    setSelectedReservation((prev) => prev ? { ...prev, status: "confirmed" } : null);
                    toast.success("Etkinlik yer ayırtması kesinleştirildi!");
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 shadow-md"
                >
                  <Check className="h-4 w-4 mr-1.5" /> Kesinleştir (Kesin Yer Ayırt)
                </Button>
              </div>
            )
            : (
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      ✅ Kesinleşmiş Rezervasyon
                    </h4>
                    <p className="text-xs mt-1 text-emerald-800 dark:text-emerald-400">
                      Bu etkinlik salon tahsis kaydı kesinleşmiştir.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await updateReservationStatus(
                      reservation.id,
                      "option",
                    );
                    setSelectedReservation((prev) => prev ? { ...prev, status: "option" } : null);
                    toast.info("Etkinlik opsiyonlu (şerhli) duruma getirildi.");
                  }}
                  className="w-full text-xs h-8 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-semibold"
                >
                  ⚠️ Şerh Düş (Opsiyonel Duruma Al)
                </Button>
              </div>
            )}

          {/* Customer Details */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === "dark"
                ? "bg-slate-950/60 border-slate-800"
                : "bg-white border-slate-200/90 shadow-xs text-slate-900"
            }`}
          >
            <h4
              className={`text-xs font-bold uppercase tracking-wider ${
                theme === "dark" ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Müşteri & İletişim Bilgileri
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                  Müşteri / Kurum:
                </span>
                <span className="font-bold">{reservation.customer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                  Telefon No:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
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
                    className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400 px-2 py-0.5 rounded font-bold hover:bg-emerald-200 dark:hover:bg-emerald-600/30 border border-emerald-300 dark:border-emerald-700/50"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex justify-between">
                <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                  Etkinlik Türü:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {reservation.eventType}
                </span>
              </div>
              {onNavigateToCustomer && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onNavigateToCustomer(reservation.customer);
                  }}
                  className="w-full mt-2 text-xs h-8 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-indigo-500" /> Müşteri Profiline & Geçmiş Kayıtlara Git
                </Button>
              )}
            </div>
          </div>

          {/* Venue & Hall Details */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === "dark"
                ? "bg-slate-950/60 border-slate-800"
                : "bg-white border-slate-200/90 shadow-xs text-slate-900"
            }`}
          >
            <h4
              className={`text-xs font-bold uppercase tracking-wider ${
                theme === "dark" ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Tesis & Salon Bilgileri
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                  Mekan / Tesis:
                </span>
                <span className="font-extrabold">{targetVenue?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                  Salon:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {hallById(reservation.hallId)?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                  Saat Aralığı:
                </span>
                <span className="font-mono font-bold">
                  {reservation.start} - {reservation.end}{" "}
                  ({hoursBetween(reservation.start, reservation.end)} Saat)
                </span>
              </div>
            </div>
          </div>

          {/* Venue Manager & QR Code Section */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === "dark"
                ? "bg-slate-950/60 border-slate-800"
                : "bg-white border-slate-200/90 shadow-xs text-slate-900"
            }`}
          >
            <h4
              className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                theme === "dark" ? "text-slate-400" : "text-slate-700"
              }`}
            >
              <span>👤 Tesis Sorumlusu & Doğrulama Karekodu</span>
              <QrCode className="h-3.5 w-3.5 text-indigo-500" />
            </h4>

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 p-1 bg-white rounded-lg border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                <img
                  src={qrUrl}
                  alt="Tahsis Doğrulama Karekodu"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-1.5 text-xs flex-1">
                <div>
                  <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
                    Yetkili Sorumlu:
                  </span>
                  <p className={`font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                    {manager?.name || "Yetkili Atanmadı"}
                  </p>
                  <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                    {manager?.title || "Tesis Amiri"}
                  </p>
                </div>
                {manager?.phone && (
                  <div className="flex items-center gap-2 pt-1 font-mono">
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
                      📞 {formatTRPhone(manager.phone)} (WhatsApp)
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial & Receipt Section */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === "dark"
                ? "bg-slate-950/60 border-slate-800"
                : "bg-white border-slate-200/90 shadow-xs text-slate-900"
            }`}
          >
            <h4
              className={`text-xs font-bold uppercase tracking-wider ${
                theme === "dark" ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Finansal Döküm & Ödeme Makbuzu
            </h4>

            <div
              className={`grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl border font-mono ${
                theme === "dark"
                  ? "bg-slate-950/80 border-slate-800"
                  : "bg-slate-50 border-slate-200/90 shadow-xs"
              }`}
            >
              <div
                className={`p-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-indigo-950/40 border-indigo-900/60"
                    : "bg-indigo-50/80 border-indigo-200/80"
                }`}
              >
                <div
                  className={`text-[10px] font-sans font-bold uppercase tracking-wider ${
                    theme === "dark" ? "text-indigo-300" : "text-indigo-900"
                  }`}
                >
                  Toplam Ücret
                </div>
                <div
                  className={`text-xs font-extrabold mt-0.5 ${
                    theme === "dark" ? "text-indigo-200" : "text-indigo-700"
                  }`}
                >
                  {money(reservation.price)}
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-emerald-950/40 border-emerald-900/60"
                    : "bg-emerald-50/80 border-emerald-200/80"
                }`}
              >
                <div
                  className={`text-[10px] font-sans font-bold uppercase tracking-wider ${
                    theme === "dark" ? "text-emerald-300" : "text-emerald-900"
                  }`}
                >
                  Ödenen
                </div>
                <div
                  className={`text-xs font-extrabold mt-0.5 ${
                    theme === "dark" ? "text-emerald-300" : "text-emerald-700"
                  }`}
                >
                  {money(reservation.paid)}
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-rose-950/40 border-rose-900/60"
                    : "bg-rose-50/80 border-rose-200/80"
                }`}
              >
                <div
                  className={`text-[10px] font-sans font-bold uppercase tracking-wider ${
                    theme === "dark" ? "text-rose-300" : "text-rose-900"
                  }`}
                >
                  Kalan Bakiye
                </div>
                <div
                  className={`text-xs font-extrabold mt-0.5 ${
                    theme === "dark" ? "text-rose-300" : "text-rose-700"
                  }`}
                >
                  {money(reservation.price - reservation.paid)}
                </div>
              </div>
            </div>

            {/* Past Event Financial Update Note */}
            {(() => {
              const todayStr = new Date().toLocaleDateString("en-CA");
              const isPast = reservation.date < todayStr;
              if (!isPast) return null;
              return (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] flex items-start gap-2">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Geçmiş Tarihli Etkinlik</span>
                    Muhasebe ve denetim kayıtları için tahsilat, makbuz ve ödeme yöntemi güncellemeleri serbesttir.
                  </div>
                </div>
              );
            })()}

            {/* Receipt & Payment Method Form Fields */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-slate-400">
                    Makbuz / Dekont No
                  </Label>
                  <Input
                    value={editReceiptNo}
                    placeholder="MKB-2026-0000"
                    onChange={(e) => setEditReceiptNo(e.target.value)}
                    className={`text-xs h-8 ${
                      theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-100"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">
                    Ödeme Yöntemi
                  </Label>
                  <Select
                    value={editPaymentMethod}
                    onValueChange={setEditPaymentMethod}
                  >
                    <SelectTrigger
                      className={`text-xs h-8 ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-800 text-slate-100"
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-white border-slate-200 text-slate-900"}
                    >
                      <SelectItem value="Nakit">Nakit</SelectItem>
                      <SelectItem value="Havale/EFT">Havale / EFT</SelectItem>
                      <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                      <SelectItem value="Dekont">Resmi Dekont</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-slate-400">
                  Tahsil Edilen Peşinat (TL)
                </Label>
                <Input
                  type="number"
                  value={editPaidAmount}
                  onChange={(e) =>
                    setEditPaidAmount(
                      e.target.value ? Number(e.target.value) : "",
                    )}
                  className={`text-xs h-8 font-bold text-emerald-400 ${
                    theme === "dark"
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
                  toast.success("Makbuz ve ödeme bilgileri güncellendi!");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-8 shadow-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Ödeme & Makbuz Bilgilerini Güncelle
              </Button>
            </div>
          </div>

          {/* Decision Info & Note */}
          <div
            className={`p-4 rounded-xl border space-y-2 text-xs ${
              theme === "dark"
                ? "bg-slate-950/60 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div>
              <span className="text-slate-500 font-semibold block">
                Encümen / Meclis Kararı Dayanağı:
              </span>
              <span className="text-slate-300 italic">
                {reservation.decisionInfo || "Girilmedi"}
              </span>
            </div>
            {reservation.note && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 font-semibold block">
                  Özel Notlar:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {reservation.note}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrintDoc(reservation)}
              className={`text-xs h-8 font-semibold ${
                theme === "dark"
                  ? "border-slate-800 text-slate-200 hover:bg-slate-800"
                  : "border-slate-300 text-slate-800"
              }`}
            >
              <Printer className="h-3.5 w-3.5 mr-1" /> Evrak Yazdır
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopySMS(reservation)}
              className={`text-xs h-8 font-semibold ${
                theme === "dark"
                  ? "border-slate-800 text-slate-200 hover:bg-slate-800"
                  : "border-slate-300 text-slate-800"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> SMS / WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickMail(reservation)}
              className={`text-xs h-8 font-semibold ${
                theme === "dark"
                  ? "border-slate-800 text-slate-200 hover:bg-slate-800"
                  : "border-slate-300 text-slate-800"
              }`}
            >
              <Mail className="h-3.5 w-3.5 mr-1" /> E-posta
            </Button>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              const id = reservation.id;
              const name = reservation.customer;
              onClose();
              onPromptDelete("reservation", id, name);
            }}
            className="w-full text-xs h-8 font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Bu Etkinlik Kaydını Sil
          </Button>
        </div>
      </div>
    </div>
  );
}
