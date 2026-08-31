import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar as CalendarIcon,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money, type Reservation, type Venue } from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { toast } from "sonner";

interface QuickPaymentModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  theme: "dark" | "light";
  venues: Venue[];
  onSuccess?: () => void;
}

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  reservation,
  onClose,
  theme,
  venues,
  onSuccess,
}) => {
  const isDark = theme === "dark";

  const [paid, setPaid] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Nakit");
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [status, setStatus] = useState<string>("confirmed");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (reservation) {
      setPaid(reservation.paid ?? 0);
      setPaymentMethod(reservation.paymentMethod || "Nakit");
      setReceiptNo(reservation.receiptNo || "");
      setStatus(reservation.status || "confirmed");
      setNote(reservation.note || "");
    }
  }, [reservation]);

  if (!reservation) return null;

  const price = Number(reservation.price) || 0;
  const currentPaid = Number(paid) || 0;
  const remaining = Math.max(0, price - currentPaid);

  const venue = venues.find((v) => v.id === reservation.venueId);
  const hall = venue?.halls.find((h) => h.id === reservation.hallId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sqliteStore.updateReservationDetails(reservation.id, {
        paid: Number(paid) || 0,
        paymentMethod: paymentMethod || "Nakit",
        receiptNo: receiptNo.trim() || undefined,
        status: status || "confirmed",
        note: note.trim() || undefined,
      });

      toast.success("Tahsilat ve ödeme durumu güncellendi!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Tahsilat kaydı hatası: ${err.message || err}`);
    }
  };

  const setFullPayment = () => {
    setPaid(price);
    if (status === "option") setStatus("confirmed");
  };

  const addAmount = (addVal: number) => {
    const next = Math.min(price, currentPaid + addVal);
    setPaid(next);
  };

  return (
    <Dialog open={!!reservation} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`max-w-md ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-500" />
            Tahsilat & Ödeme Durumunu Güncelle
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Etkinlik kiralama bedelini, tahsilat makbuzunu ve rezervasyon onayını güncelleyin.
          </DialogDescription>
        </DialogHeader>

        {/* Reservation Quick Info Banner */}
        <div
          className={`p-3 rounded-xl border space-y-1.5 ${
            isDark
              ? "bg-slate-950/70 border-slate-800"
              : "bg-slate-50 border-slate-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              {reservation.customer}
            </span>
            <Badge
              className={`text-[10px] font-bold px-2 py-0 ${
                status === "confirmed"
                  ? "bg-emerald-600 text-white"
                  : status === "option"
                  ? "bg-amber-500 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {status === "confirmed"
                ? "Onaylandı"
                : status === "option"
                ? "Opsiyonlu"
                : "İptal Edildi"}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>📅 {reservation.date} ({reservation.start}-{reservation.end})</span>
            <span>🏢 {venue?.name} • {hall?.name}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-center font-mono">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 block">Toplam Tarife</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{money(price)}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="text-[10px] block opacity-80">Tahsil Edilen</span>
              <span className="text-xs font-bold">{money(currentPaid)}</span>
            </div>
            <div className={`p-1.5 rounded-lg ${remaining > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-emerald-500/10 text-emerald-500"}`}>
              <span className="text-[10px] block opacity-80">Kalan Borç</span>
              <span className="text-xs font-bold">{money(remaining)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3 py-1 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold">Tahsil Edilen Tutar (TL) *</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={setFullPayment}
                  className="h-5 px-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  Tamamını Tahsil Et ({money(price)})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => addAmount(1000)}
                  className="h-5 px-1.5 text-[10px]"
                >
                  +1.000 TL
                </Button>
              </div>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              value={paid}
              onChange={(e) =>
                setPaid(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="font-mono font-bold text-xs text-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Ödeme Yöntemi</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1 text-xs h-8">
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
                  <SelectItem value="Banka / Havale">🏦 Banka / Havale / EFT</SelectItem>
                  <SelectItem value="Kredi Kartı">💳 Kredi Kartı / POS</SelectItem>
                  <SelectItem value="Çek / Senet">📄 Çek / Senet</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Rezervasyon Onay Durumu</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  <SelectItem value="confirmed">✅ Onaylandı & Kesinleşti</SelectItem>
                  <SelectItem value="option">⏳ Ön Rezervasyon / Opsiyon</SelectItem>
                  <SelectItem value="cancelled">❌ İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Fatura / Makbuz No</Label>
            <Input
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              placeholder="Örn: MAK-2026/014"
              className="mt-1 text-xs font-mono"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Ödeme Notu / Açıklama</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tahsilat açıklaması..."
              className="mt-1 text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8"
            >
              İptal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 font-semibold shadow-xs"
            >
              Tahsilatı & Durumu Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
