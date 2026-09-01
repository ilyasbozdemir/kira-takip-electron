import React from "react";
import {
  Calendar,
  Clock,
  Building2,
  User,
  Phone,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money, trDaysFull, trMonthsFull } from "@/lib/rental-store";

interface ReservationDateConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  date: string; // YYYY-MM-DD
  start: string;
  end: string;
  timeSlotSession?: string;
  venueName: string;
  hallName: string;
  customer: string;
  phone: string;
  eventType: string;
  price: number;
  paid: number;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const ReservationDateConfirmModal: React.FC<ReservationDateConfirmModalProps> = ({
  open,
  onOpenChange,
  theme,
  date,
  start,
  end,
  timeSlotSession,
  venueName,
  hallName,
  customer,
  phone,
  eventType,
  price,
  paid,
  onConfirm,
  isSubmitting = false,
}) => {
  const isDark = theme === "dark";

  // Format Turkish Date beautifully: "24 EYLÜL 2026, PERŞEMBE"
  const formattedDate = (() => {
    if (!date) return "Tarih Belirtilmedi";
    try {
      const [y, m, d] = date.split("-").map(Number);
      const dObj = new Date(y, m - 1, d);
      const monthName = trMonthsFull[m - 1] || "";
      const dayName = trDaysFull[dObj.getDay()] || "";
      return `${d} ${monthName.toUpperCase()} ${y}, ${dayName.toUpperCase()}`;
    } catch {
      return date;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-lg p-0 overflow-hidden border ${
          isDark
            ? "bg-slate-900 border-indigo-500/40 text-slate-100 shadow-2xl shadow-indigo-950/50"
            : "bg-white border-indigo-200 text-slate-900 shadow-2xl shadow-indigo-100"
        }`}
      >
        {/* Top Header Banner */}
        <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-purple-700 p-5 text-white">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
                Rezervasyon Tarih & Saat Onayı
              </DialogTitle>
              <DialogDescription className="text-xs text-indigo-100 font-medium">
                Kayıt öncesi takvim tarihini ve seans saatini lütfen dikkatle kontrol edin.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* BIG PROMINENT DATE CARD */}
          <div
            className={`p-4 rounded-2xl border text-center transition-all ${
              isDark
                ? "bg-indigo-950/40 border-indigo-500/40 shadow-inner"
                : "bg-indigo-50/90 border-indigo-200 shadow-xs"
            }`}
          >
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
              🗓️ ETKİNLİK TAKVİM TARİHİ
            </span>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-indigo-950 dark:text-indigo-100">
              {formattedDate}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
              <Badge className="bg-indigo-600 text-white font-mono text-xs px-3 py-0.5">
                <Clock className="h-3 w-3 mr-1" /> {start} — {end}
              </Badge>
              {timeSlotSession && (
                <Badge
                  variant="outline"
                  className={
                    isDark
                      ? "border-indigo-400/40 text-indigo-300 bg-indigo-950/60"
                      : "border-indigo-300 text-indigo-800 bg-white"
                  }
                >
                  Seans: {timeSlotSession}
                </Badge>
              )}
            </div>
          </div>

          {/* VENUE, CUSTOMER & PRICING SUMMARY GRID */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Venue & Hall */}
            <div
              className={`p-3 rounded-xl border space-y-1 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Building2 className="h-3 w-3 text-indigo-500" /> Tesis & Salon
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">
                {venueName || "Tesis"}
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium block truncate">
                {hallName || "Salon"}
              </span>
            </div>

            {/* Event Type & Customer */}
            <div
              className={`p-3 rounded-xl border space-y-1 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <User className="h-3 w-3 text-emerald-500" /> Müşteri & Etkinlik
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">
                {customer || "Müşteri Adı"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono block truncate">
                📞 {phone || "Telefon Yok"} • {eventType}
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Tarife Bedeli:
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {money(price)}
              </span>
              <Badge className="bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px]">
                Tahsilat: {money(paid)}
              </Badge>
            </div>
          </div>

          {/* WARNING NOTICE BOX */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
              isDark
                ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Bu rezervasyon yukarıda belirtilen <strong>{formattedDate}</strong> tarihine ve <strong>{start}-{end}</strong> saat aralığına kaydedilecektir. Takvim gününü onaylıyor musunuz?
            </p>
          </div>
        </div>

        <DialogFooter
          className={`p-4 border-t gap-2 flex flex-row items-center justify-end ${
            isDark ? "bg-slate-950/50 border-slate-800" : "bg-slate-50/80 border-slate-200"
          }`}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={`text-xs h-9 px-3 ${
              isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Vazgeç / Tarihi Düzenle
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4 font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Bilgileri Kontrol Ettim, Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
