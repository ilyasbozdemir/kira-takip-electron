import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Calendar, Check, Clock, User, Users } from "lucide-react";
import {
  hoursBetween,
  money,
  type PricingMode,
  type Store,
  toKey,
} from "@/lib/rental-store";
import { normalizeTRPhoneInput } from "@/lib/phone-utils";

interface NewReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  selectedDay: string;
  setSelectedDay?: (v: string) => void;
  resVenueId: string;
  setResVenueId: (v: string) => void;
  resHallId: string;
  setResHallId: (v: string) => void;
  resEventType: string;
  setResEventType: (v: string) => void;
  resCustomer: string;
  setResCustomer: (v: string) => void;
  pricingMode: PricingMode;
  setPricingMode: (v: PricingMode) => void;
  timeSlotSession?: "Gece" | "Gündüz" | "Tüm Gün";
  handleTimeSlotChange?: (session: "Gece" | "Gündüz" | "Tüm Gün") => void;
  resStart: string;
  setResStart: (v: string) => void;
  resEnd: string;
  setResEnd: (v: string) => void;
  guestCount?: number | "";
  setGuestCount?: (v: number | "") => void;
  resPhone: string;
  setResPhone: (v: string) => void;
  resPrice: number | "";
  setResPrice: (v: number | "") => void;
  resPaid: number | "";
  setResPaid: (v: number | "") => void;
  resStatus: string;
  setResStatus: (v: string) => void;
  resReceiptNo: string;
  setResReceiptNo: (v: string) => void;
  resPaymentMethod: string;
  setResPaymentMethod: (v: string) => void;
  resDecisionInfo: string;
  setResDecisionInfo: (v: string) => void;
  resNote: string;
  setResNote: (v: string) => void;
  store: Store;
  allEventTypes: string[];
  customerSuggestions: string[];
  phoneSuggestions: string[];
  decisionSuggestions: string[];
  timeSlots: string[];
  handleCreateReservation: (e: React.FormEvent) => void;
}

export function NewReservationModal({
  open,
  onOpenChange,
  theme,
  selectedDay,
  setSelectedDay,
  resVenueId,
  setResVenueId,
  resHallId,
  setResHallId,
  resEventType,
  setResEventType,
  resCustomer,
  setResCustomer,
  pricingMode,
  setPricingMode,
  timeSlotSession = "Gece",
  handleTimeSlotChange,
  resStart,
  setResStart,
  resEnd,
  setResEnd,
  guestCount = 0,
  setGuestCount,
  resPhone,
  setResPhone,
  resPrice,
  setResPrice,
  resPaid,
  setResPaid,
  resStatus,
  setResStatus,
  resReceiptNo,
  setResReceiptNo,
  resPaymentMethod,
  setResPaymentMethod,
  resDecisionInfo,
  setResDecisionInfo,
  resNote,
  setResNote,
  store,
  allEventTypes,
  customerSuggestions,
  phoneSuggestions,
  decisionSuggestions,
  timeSlots,
  handleCreateReservation,
}: NewReservationModalProps): React.JSX.Element {
  const currentVenue = store.venues.find((x) => x.id === resVenueId);
  const currentHall = currentVenue?.halls.find((x) => x.id === resHallId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          theme === "dark"
            ? "sm:max-w-140 bg-slate-900 border-slate-800 text-slate-100"
            : "sm:max-w-140 bg-white border-slate-200 text-slate-900 shadow-2xl"
        }
      >
        <DialogHeader>
          <DialogTitle
            className={`text-lg font-bold flex items-center gap-2 ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            <Calendar className="h-5 w-5 text-indigo-500" />
            Yeni Etkinlik & Salon Kiralama
          </DialogTitle>
          <DialogDescription
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Tesis, salon, tarih, seans ve müşteri bilgilerini girerek yeni tahsis kaydı oluşturun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateReservation} className="space-y-3 py-1">
          {/* Date, Venue & Hall Select (3-Column Grid) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              {(() => {
                const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
                const isPast = selectedDay && selectedDay < todayStr;
                return (
                  <>
                    <Label
                      className={`text-xs font-semibold flex items-center justify-between ${
                        theme === "dark" ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      <span>Etkinlik Tarihi *</span>
                      {isPast && <span className="text-[10px] text-rose-500 font-bold">Geçersiz</span>}
                    </Label>
                    <Input
                      type="date"
                      required
                      min={todayStr}
                      value={selectedDay}
                      onChange={(e) => setSelectedDay?.(e.target.value)}
                      className={`mt-1 text-xs font-medium ${
                        isPast
                          ? "border-rose-500 focus:ring-rose-500"
                          : theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                    {isPast && (
                      <span className="text-[10px] text-rose-500 font-medium block mt-1">
                        ⚠️ Geçmiş tarihli yeni etkinlik oluşturulamaz!
                      </span>
                    )}
                  </>
                );
              })()}
            </div>

            <div>
              <Label
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Mekan / Tesis *
              </Label>
              <Select
                value={resVenueId}
                onValueChange={(v) => {
                  setResVenueId(v);
                  const found = store.venues.find((x) => x.id === v);
                  if (found && found.halls.length > 0) {
                    setResHallId(found.halls[0].id);
                  }
                }}
              >
                <SelectTrigger
                  className={`mt-1 text-xs font-medium ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="Mekan seçin" />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  {store.venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Salon *
              </Label>
              <Select value={resHallId} onValueChange={setResHallId}>
                <SelectTrigger
                  className={`mt-1 text-xs font-medium ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="Salon seçin" />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  {(store.venues.find((x) => x.id === resVenueId)?.halls ?? []).map(
                    (h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} ({money(h.hourlyPrice)})
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event Type, Status (Şerh / Kesin), Customer Name */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Etkinlik Türü
              </Label>
              <Select value={resEventType} onValueChange={setResEventType}>
                <SelectTrigger
                  className={`mt-1 text-xs font-medium ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  {allEventTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Kayıt / Tahsis Durumu *
              </Label>
              <Select value={resStatus} onValueChange={setResStatus}>
                <SelectTrigger
                  className={`mt-1 text-xs font-bold ${
                    resStatus === "option"
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                      : theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-emerald-400"
                      : "bg-slate-50 border-slate-300 text-emerald-600"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  <SelectItem value="confirmed" className="text-emerald-500 font-bold">
                    ✅ Kesinleşmiş (Kesin Tahsis)
                  </SelectItem>
                  <SelectItem value="option" className="text-amber-500 font-bold">
                    ⚠️ Opsiyonlu / Şerhli (Ön Kayıt)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label
                  className={`text-xs font-semibold ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Müşteri / Kurum Adı *
                </Label>
                {store.customers && store.customers.length > 0 && (
                  <Select
                    onValueChange={(val) => {
                      const found = store.customers?.find((c) => c.id === val);
                      if (found) {
                        setResCustomer(found.name);
                        if (found.phone && setResPhone) setResPhone(found.phone);
                      }
                    }}
                  >
                    <SelectTrigger className="h-5 py-0 px-2 text-[10px] bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-semibold w-auto">
                      <SelectValue placeholder="👥 CRM Rehberinden Seç" />
                    </SelectTrigger>
                    <SelectContent
                      className={
                        theme === "dark"
                          ? "bg-slate-900 border-slate-800 text-slate-200"
                          : "bg-white border-slate-200 text-slate-900"
                      }
                    >
                      {store.customers.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.name} {c.company ? `(${c.company})` : ""} - {c.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Input
                required
                list="customer-suggestions"
                placeholder="örn: Yılmaz Ailesi / Ahmet Yılmaz"
                value={resCustomer}
                onChange={(e) => setResCustomer(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
              <datalist id="customer-suggestions">
                {customerSuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* EXACT 4-COLUMN ROW: ZAMAN, BAŞLANGIÇ SAATİ, BİTİŞ SAATİ, KİŞİ SAYISI */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div>
              <Label
                className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                ZAMAN
              </Label>
              <Select
                value={timeSlotSession}
                onValueChange={(v) => handleTimeSlotChange && handleTimeSlotChange(v as any)}
              >
                <SelectTrigger
                  className={`h-8 text-xs font-bold ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-indigo-400"
                      : "bg-slate-50 border-slate-300 text-indigo-600 font-semibold"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  <SelectItem value="Gece">Gece</SelectItem>
                  <SelectItem value="Gündüz">Gündüz</SelectItem>
                  <SelectItem value="Tüm Gün">Tüm Gün</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                BAŞLANGIÇ
              </Label>
              <Select value={resStart} onValueChange={setResStart}>
                <SelectTrigger
                  className={`h-8 text-xs font-medium ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`max-h-48 ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                BİTİŞ
              </Label>
              <Select value={resEnd} onValueChange={setResEnd}>
                <SelectTrigger
                  className={`h-8 text-xs font-medium ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`max-h-48 ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                KİŞİ SAYISI
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={guestCount}
                onChange={(e) =>
                  setGuestCount &&
                  setGuestCount(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={`h-8 text-xs font-semibold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          </div>



          {/* Contact Phone & Price Fields */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label
                className={`text-xs font-semibold flex items-center justify-between ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <span>Telefon *</span>
                <span className="text-[9px] text-slate-400 font-mono">🇹🇷 +90 TR</span>
              </Label>
              <Input
                required
                list="phone-suggestions"
                placeholder="05XX XXX XX XX"
                value={resPhone}
                onChange={(e) => setResPhone(normalizeTRPhoneInput(e.target.value))}
                className={`mt-1 text-xs font-mono ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
              <datalist id="phone-suggestions">
                {phoneSuggestions.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <div>
              <Label
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Toplam Ücret (TL) *
              </Label>
              <Input
                type="number"
                required
                value={resPrice}
                onChange={(e) =>
                  setResPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={`mt-1 text-xs font-bold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-emerald-400"
                    : "bg-slate-50 border-slate-300 text-emerald-700"
                }`}
              />
            </div>

            <div>
              <Label
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Ödenen Peşinat (TL)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={resPaid}
                onChange={(e) =>
                  setResPaid(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={`mt-1 text-xs font-bold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Decision Info & Receipt No */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Makbuz / İntizam No
              </Label>
              <Input
                placeholder="örn: MK-2026-0042"
                value={resReceiptNo}
                onChange={(e) => setResReceiptNo(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            <div>
              <Label
                className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Ödeme Yöntemi
              </Label>
              <Select value={resPaymentMethod} onValueChange={setResPaymentMethod}>
                <SelectTrigger
                  className={`mt-1 text-xs font-medium ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  <SelectItem value="Nakit">Nakit</SelectItem>
                  <SelectItem value="Banka Havalesi / EFT">Banka Havalesi / EFT</SelectItem>
                  <SelectItem value="Kredi Kartı / Pos">Kredi Kartı / Pos</SelectItem>
                  <SelectItem value="Vezne Tahsilat">Vezne Tahsilat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label
              className={`text-xs font-semibold ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Resmi Encümen Kararı / Tarife Dayanağı
            </Label>
            <Input
              list="decision-suggestions"
              placeholder="örn: Belediye Encümeni Kararı: 15/01/2026 - Karar No: 42"
              value={resDecisionInfo}
              onChange={(e) => setResDecisionInfo(e.target.value)}
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
            <datalist id="decision-suggestions">
              {decisionSuggestions.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          <div>
            <Label
              className={`text-xs font-semibold ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Özel Notlar & Ek Istekler
            </Label>
            <Textarea
              rows={2}
              placeholder="Orkestra, ses-ışık düzeni, ikram detayları vb."
              value={resNote}
              onChange={(e) => setResNote(e.target.value)}
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          <DialogFooter className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={`text-xs ${
                theme === "dark"
                  ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4"
            >
              <Check className="h-4 w-4 mr-1" /> Kaydı Oluştur & Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
