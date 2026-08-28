import React from "react";
import { AlertTriangle, Scale } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money, toKey, type Venue } from "@/lib/rental-store";

interface NewReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  selectedDay: string;
  resVenueId: string;
  setResVenueId: (v: string) => void;
  resHallId: string;
  setResHallId: (v: string) => void;
  resEventType: string;
  setResEventType: (v: string) => void;
  resCustomer: string;
  setResCustomer: (v: string) => void;
  pricingMode: "hourly" | "daily";
  setPricingMode: (v: "hourly" | "daily") => void;
  resStart: string;
  setResStart: (v: string) => void;
  resEnd: string;
  setResEnd: (v: string) => void;
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
  store: { venues: Venue[] };
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
  resStart,
  setResStart,
  resEnd,
  setResEnd,
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={theme === "dark"
          ? "sm:max-w-[520px] bg-slate-900 border-slate-800 text-slate-100"
          : "sm:max-w-[520px] bg-white border-slate-200 text-slate-900 shadow-2xl"}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-lg font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Yeni Etkinlik & Salon Kiralama
          </DialogTitle>
          <DialogDescription
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Tarih: <strong className="text-indigo-500">{selectedDay}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Past Date Warning Banner */}
        {selectedDay < toKey(new Date()) && (
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
              theme === "dark"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-amber-50 border-amber-300 text-amber-800"
            }`}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              Uyarı: <strong>{selectedDay}</strong> geçmiş bir tarihtir! Etkinlik geçmiş tarihli olarak kaydedilecektir.
            </span>
          </div>
        )}

        <form onSubmit={handleCreateReservation} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Mekan / Tesis
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
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="Mekan seçin" />
                </SelectTrigger>
                <SelectContent
                  className={theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-200"
                    : "bg-white border-slate-200 text-slate-900"}
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
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Salon
              </Label>
              <Select value={resHallId} onValueChange={setResHallId}>
                <SelectTrigger
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="Salon seçin" />
                </SelectTrigger>
                <SelectContent
                  className={theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-200"
                    : "bg-white border-slate-200 text-slate-900"}
                >
                  {(store.venues.find((x) => x.id === resVenueId)?.halls ?? []).map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name} ({money(h.hourlyPrice)}/s)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Etkinlik Türü
              </Label>
              <Select value={resEventType} onValueChange={setResEventType}>
                <SelectTrigger
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-200"
                    : "bg-white border-slate-200 text-slate-900"}
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
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Müşteri / Kurum Adı *
              </Label>
              <Input
                required
                list="customer-suggestions"
                placeholder="örn: Yılmaz Ailesi / XYZ A.Ş."
                value={resCustomer}
                onChange={(e) => setResCustomer(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
              <datalist id="customer-suggestions">
                {customerSuggestions.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">
              Tarife Tipi & Ücret Hesaplama
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setPricingMode("hourly")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  pricingMode === "hourly"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ⏱️ Saatlik Tarife (Saat x Fiyat)
              </button>
              <button
                type="button"
                onClick={() => setPricingMode("daily")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  pricingMode === "daily"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ☀️ Günlük / Seanslık Sabit (İndi-Bindi)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Başlangıç Saati
              </Label>
              <Select value={resStart} onValueChange={setResStart}>
                <SelectTrigger
                  className={`mt-1 text-xs ${
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
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Bitiş Saati
              </Label>
              <Select value={resEnd} onValueChange={setResEnd}>
                <SelectTrigger
                  className={`mt-1 text-xs ${
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Telefon No *
              </Label>
              <Input
                required
                list="phone-suggestions"
                placeholder="05xx xxx xx xx"
                value={resPhone}
                onChange={(e) => setResPhone(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
              <datalist id="phone-suggestions">
                {phoneSuggestions.map((p) => <option key={p} value={p} />)}
              </datalist>
            </div>

            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Hesaplanan Toplam Ücret (TL)
              </Label>
              <Input
                type="number"
                value={resPrice}
                onChange={(e) => setResPrice(e.target.value ? Number(e.target.value) : "")}
                className={`mt-1 text-xs font-bold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Alınan Peşinat (TL)
              </Label>
              <Input
                type="number"
                value={resPaid}
                onChange={(e) => setResPaid(e.target.value ? Number(e.target.value) : "")}
                className={`mt-1 text-xs font-bold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-emerald-400"
                    : "bg-slate-50 border-slate-300 text-emerald-600"
                }`}
              />
            </div>

            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Rezervasyon Statüsü (Şerh)
              </Label>
              <Select value={resStatus} onValueChange={setResStatus}>
                <SelectTrigger
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-200"
                    : "bg-white border-slate-200 text-slate-900"}
                >
                  <SelectItem value="option">
                    ⚠️ Opsiyonlu / Şerhli (Ön Kayıt)
                  </SelectItem>
                  <SelectItem value="confirmed">
                    ✅ Kesinleşti (Kesin Kayıt)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Ödeme Makbuzu / Dekont No
              </Label>
              <Input
                placeholder="örn: MKB-2026-0042"
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
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Ödeme Yöntemi
              </Label>
              <Select
                value={resPaymentMethod}
                onValueChange={setResPaymentMethod}
              >
                <SelectTrigger
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
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
            <Label
              className={`text-xs font-medium flex items-center gap-1.5 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <Scale className="h-3.5 w-3.5 text-amber-500" /> Resmi Tarife & Encümen Kararı Dayanağı
            </Label>
            <Input
              list="decision-suggestions"
              placeholder="örn: Belediye Encümeni Kararı: 15/01/2026 - No: 42 (2464 Sayılı Kanun Md. 97)"
              value={resDecisionInfo}
              onChange={(e) => setResDecisionInfo(e.target.value)}
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
            <datalist id="decision-suggestions">
              {decisionSuggestions.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>

          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Açıklama / Notlar
            </Label>
            <Input
              placeholder="Etkinlik detayları veya hatırlatmalar..."
              value={resNote}
              onChange={(e) => setResNote(e.target.value)}
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              Etkinliği Kaydet (SQLite)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
